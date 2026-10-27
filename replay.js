/* Replay de gameplay (opcional). Le a lista em videos-config.js.
   - Sem arquivos de video: este script nao muda nada na apresentacao.
   - Com arquivos: um anel verde aparece na bola do diagrama; a tecla R (configuravel)
     abre o replay a partir da bola (portal circular). Video mudo, em loop.
   - As setas continuam servindo so para passar de slide (a menos que arrowOpens: true).
   - Com o replay aberto: setas trocam de clipe; R ou Esc fecha.
   - Rotulos (cues) e camera lenta (slow) sao opcionais, definidos em videos-config.js.
   - O video e pausado e descarregado quando o replay fecha ou o slide muda.
   - Nenhuma navegacao automatica: nada avanca quando o video termina. */
(function () {
  'use strict';
  var CFG = window.RL_VIDEOS;
  var deck = window.deck;
  if (!CFG || !Array.isArray(CFG.clips) || !deck) return;
  var KEY = String(CFG.replayKey || 'r').toLowerCase().charAt(0);
  var ARROW_OPENS = CFG.arrowOpens === true;

  var slides = Array.prototype.slice.call(document.querySelectorAll('.reveal .slides > section'));
  var bySlide = {};          // indice do slide -> lista de clipes disponiveis
  var step = -1;             // -1 = replay fechado; 0.. = clipe aberto
  var el = null, video = null, titleEl, countEl, noteEl, cueEl, slowEl, frameEl;
  var hint = null, ring = null, ringTimer = 0, unloadTimer = 0, raf = 0;
  var cur = null, baseRate = 1, lastT = 0, slowed = false, cueIdx = -2, slowTimer = 0;

  function folder() { return /\/$/.test(CFG.folder) ? CFG.folder : CFG.folder + '/'; }
  function list() { return bySlide[deck.getIndices().h || 0] || []; }
  function origin(c) { return (c && c.from && c.from.length === 2) ? c.from : [960, 540]; }

  /* ---------- descobrir quais arquivos existem ---------- */
  function viaFolderListing() {
    if (location.protocol === 'file:') return Promise.resolve([]);   // precisa do servidor local
    return fetch(folder(), { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.text() : ''; })
      .then(function (html) {
        var names = {}, re = /href="([^"?#]+)"/g, m;
        while ((m = re.exec(html))) {
          try { names[decodeURIComponent(m[1]).split('/').pop()] = true; } catch (_) {}
        }
        return CFG.clips.filter(function (c) { return names[c.file]; });
      })
      .catch(function () { return []; });
  }
  function viaTrying() {
    return Promise.all(CFG.clips.map(function (c) {
      return new Promise(function (resolve) {
        var v = document.createElement('video'), done = false;
        function end(ok) { if (done) return; done = true; v.removeAttribute('src'); v.load(); resolve(ok ? c : null); }
        v.preload = 'metadata'; v.muted = true;
        v.onloadedmetadata = function () { end(true); };
        v.onerror = function () { end(false); };
        setTimeout(function () { end(false); }, 4000);
        v.src = folder() + c.file;
      });
    })).then(function (r) { return r.filter(Boolean); });
  }

  /* ---------- interface do replay (criada so quando precisa) ---------- */
  function build() {
    if (el) return;
    el = document.createElement('div');
    el.className = 'replay';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-label', 'Gameplay replay');
    el.innerHTML =
      '<div class="replay-bar"><span class="replay-dot"></span><span class="replay-tag">REPLAY</span>' +
      '<span class="replay-title"></span><span class="replay-count"></span></div>' +
      '<div class="replay-frame"><video muted loop playsinline preload="none"></video>' +
      '<div class="replay-cue" aria-live="polite"></div><div class="replay-slow">SLOW-MO</div></div>' +
      '<p class="replay-note"></p>';
    frameEl = el.querySelector('.replay-frame');
    video = el.querySelector('video');
    video.muted = true;
    titleEl = el.querySelector('.replay-title');
    countEl = el.querySelector('.replay-count');
    noteEl = el.querySelector('.replay-note');
    cueEl = el.querySelector('.replay-cue');
    slowEl = el.querySelector('.replay-slow');
    video.addEventListener('error', function () {
      if (!video.getAttribute('src')) return;
      dropCurrent();                       // arquivo ilegivel: some em silencio
    });
    video.addEventListener('click', function () { if (video.paused) video.play().catch(function () {}); else video.pause(); });
    video.addEventListener('play', startTick);
  }

  /* ---------- rotulos e camera lenta (rodam enquanto o video toca) ---------- */
  function setRate(r) { try { video.playbackRate = r; } catch (_) {} }
  function resetEffects() {
    clearTimeout(slowTimer); slowed = false; cueIdx = -2; lastT = 0;
    if (cueEl) cueEl.classList.remove('on');
    if (slowEl) slowEl.classList.remove('on');
  }
  function startTick() { if (!raf) raf = requestAnimationFrame(tick); }
  function tick() {
    raf = 0;
    if (step < 0 || !cur || !video || video.paused) return;
    var t = video.currentTime;
    if (t < lastT - 0.5) { resetEffects(); setRate(baseRate); }     // o video reiniciou (loop)
    lastT = t;
    if (cur.cues && cur.cues.length) {
      var idx = -1, i;
      for (i = 0; i < cur.cues.length; i++) if (cur.cues[i].t <= t) idx = i;
      var live = idx > -1 && (t - cur.cues[idx].t) < (cur.cues[idx].hold || 3);
      var want = live ? idx : -1;
      if (want !== cueIdx) {
        cueIdx = want;
        cueEl.classList.remove('on');
        if (want > -1) { cueEl.textContent = cur.cues[want].text; void cueEl.offsetWidth; cueEl.classList.add('on'); }
      }
    }
    if (cur.slow && !slowed && t >= cur.slow.at && t < cur.slow.at + 0.6) {
      slowed = true;
      var clip = cur;
      setRate(cur.slow.to || 0.25);
      slowEl.classList.add('on');
      slowTimer = setTimeout(function () {
        if (cur === clip) { setRate(baseRate); slowEl.classList.remove('on'); }
      }, (cur.slow.hold || 1.2) * 1000);
    }
    raf = requestAnimationFrame(tick);
  }

  /* ---------- abrir / fechar ---------- */
  function show() {
    var clips = list(), c = clips[step];
    if (!c) return hide();
    build();
    clearTimeout(unloadTimer);
    el.classList.remove('instant');
    var wasOpen = el.classList.contains('on');
    var sec = deck.getCurrentSlide();
    if (el.parentNode !== sec) sec.appendChild(el);
    var o = origin(c);
    el.style.setProperty('--px', o[0] + 'px');
    el.style.setProperty('--py', o[1] + 'px');
    cur = c; baseRate = c.speed || 1;
    resetEffects();
    titleEl.textContent = c.title || '';
    countEl.textContent = (step + 1) + ' / ' + clips.length;
    noteEl.textContent = c.note || '';
    var url = folder() + c.file;
    if (video.getAttribute('src') !== url) video.setAttribute('src', url);
    video.onloadedmetadata = function () {
      if (c.start) { try { video.currentTime = c.start; } catch (_) {} }
      setRate(baseRate);
    };
    setRate(baseRate);
    var p = video.play(); if (p && p.catch) p.catch(function () {});
    if (wasOpen) {                         // troca de clipe: so um fade rapido no quadro
      frameEl.classList.remove('swap'); void frameEl.offsetWidth; frameEl.classList.add('swap');
    } else {
      void el.offsetWidth;                 // garante que o portal anime do ponto de origem
      el.classList.add('on');
    }
    hideRing();
    updateHint();
  }

  function hide() {
    step = -1; cur = null;
    clearTimeout(slowTimer);
    if (!el) { updateHint(); return; }
    el.classList.remove('on');             // o portal "fecha" de volta para a bola
    video.pause();
    resetEffects();
    clearTimeout(unloadTimer);
    unloadTimer = setTimeout(function () {
      if (step >= 0) return;
      video.removeAttribute('src'); video.load();
    }, 800);
    updateHint();
    scheduleRing(0);
  }

  function dropCurrent() {
    var clips = list();
    if (clips[step]) clips.splice(step, 1);
    hide();
  }

  /* ---------- anel de convite na bola do diagrama ---------- */
  function hideRing() {
    clearTimeout(ringTimer);
    if (ring) ring.classList.remove('on');
  }
  function animEnd(sec) {
    var m = 0;
    sec.querySelectorAll('[style*="--d"]').forEach(function (n) {
      var v = parseFloat(n.style.getPropertyValue('--d'));
      if (v > m) m = v;
    });
    return Math.min(m + 1.6, 10);
  }
  function scheduleRing(delay) {
    hideRing();
    var clips = list();
    if (!clips.length || step >= 0) return;
    var sec = deck.getCurrentSlide();
    if (!sec) return;
    ringTimer = setTimeout(function () {
      if (step >= 0) return;
      if (!ring) {
        ring = document.createElement('div');
        ring.className = 'portal-cue';
        ring.setAttribute('aria-hidden', 'true');
        ring.innerHTML = '<span>' + KEY.toUpperCase() + ' · REPLAY</span>';
      }
      var o = origin(clips[0]);
      ring.style.setProperty('--px', o[0] + 'px');
      ring.style.setProperty('--py', o[1] + 'px');
      if (ring.parentNode !== sec) sec.appendChild(ring);
      ring.classList.remove('on'); void ring.offsetWidth; ring.classList.add('on');
    }, delay * 1000);
  }

  /* ---------- navegacao ---------- */
  function advance() {                     // setas "proximo" (so age com o replay aberto)
    var n = list().length;
    if (!n) return false;
    if (step < 0) {
      if (!ARROW_OPENS) return false;      // modo padrao: a seta so passa de slide
      step = 0; show(); return true;
    }
    if (step < n - 1) { step++; show(); return true; }
    var before = deck.getIndices().h;      // ultimo clipe: vai direto para o proximo slide
    deck.next();                           // o replay escuro cobre o slide antigo enquanto ele some
    if (deck.getIndices().h === before) hide();   // (nao havia proximo slide)
    return true;
  }
  function retreat() {
    if (step < 0) return false;
    step--; if (step < 0) hide(); else show();
    return true;
  }
  function toggle() {                      // tecla R: abre / fecha
    if (!list().length) return false;
    if (step < 0) { step = 0; show(); } else hide();
    return true;
  }
  function block(e) { e.preventDefault(); e.stopPropagation(); if (e.stopImmediatePropagation) e.stopImmediatePropagation(); }

  function onKey(e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (deck.isOverview && deck.isOverview()) return;
    var k = e.key;
    if (k && k.length === 1 && k.toLowerCase() === KEY && !e.shiftKey) { if (toggle()) block(e); return; }
    if (['ArrowRight', 'ArrowDown', 'PageDown', ' ', 'n', 'N'].indexOf(k) > -1) { if (advance()) block(e); }
    else if (['ArrowLeft', 'ArrowUp', 'PageUp', 'p', 'P'].indexOf(k) > -1) { if (retreat()) block(e); }
    else if (k === 'Escape' && step >= 0) { hide(); block(e); }
  }

  function updateHint() {
    if (!hint) {
      var where = document.querySelector('.chrome-top .where');
      if (!where) return;
      hint = document.createElement('span');
      hint.className = 'clip-hint';
      where.appendChild(hint);
    }
    var n = list().length;
    hint.textContent = n && step < 0 ? ' · ' + KEY.toUpperCase() + ' ▶ ' + n + (n > 1 ? ' REPLAYS' : ' REPLAY') : '';
  }

  /* ---------- iniciar ---------- */
  var detect = CFG.detect === 'try' ? viaTrying : viaFolderListing;
  detect().then(function (found) {
    if (!found.length) return;                 // nenhum video: nao muda nada
    found.forEach(function (c) {
      var i = (c.slide | 0) - 1;
      if (i < 0 || i >= slides.length) return;
      (bySlide[i] = bySlide[i] || []).push(c);
    });
    document.addEventListener('keydown', onKey, true);
    var controls = document.querySelector('.reveal .controls');
    if (controls) controls.addEventListener('click', function (e) {
      var t = e.target.closest && e.target.closest('button');
      if (!t) return;
      if (t.classList.contains('navigate-right') && advance()) block(e);
      else if (t.classList.contains('navigate-left') && retreat()) block(e);
    }, true);
    function onSlide(e) {
      var old = e && e.previousSlide;
      if (el && step >= 0 && old && el.parentNode === old) {
        step = -1; cur = null;             // estado "fechado"
        clearTimeout(slowTimer);
        if (video) video.pause();

        // Fecha o portal imediatamente e solta o overlay do slide antigo,
        // para nao deixar o fundo escuro do replay piscar sobre o proximo
        // slide durante a transicao.
        el.classList.add('instant');
        el.classList.remove('on');
        resetEffects();
        video.removeAttribute('src'); video.load();
        setTimeout(function () { el.classList.remove('instant'); }, 60);

        if (el.parentNode === old) old.removeChild(el);
        updateHint();
      } else {
        hide();
      }
      var sec = deck.getCurrentSlide();
      scheduleRing(sec ? animEnd(sec) : 6);
    }
    deck.on('slidechanged', onSlide);
    deck.on('overviewshown', function () { hide(); hideRing(); });
    document.addEventListener('visibilitychange', function () {
      if (!video || step < 0) return;
      if (document.hidden) video.pause(); else video.play().catch(function () {});
    });
    updateHint();
    var sec0 = deck.getCurrentSlide();
    scheduleRing(sec0 ? animEnd(sec0) : 6);
  });
})();
