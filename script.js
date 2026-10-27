/* Rocket League Mechanics — presentation controller.
   Reveal.js handles navigation (arrows, space, PageUp/PageDown, Home/End, F for fullscreen, Esc for overview).
   This file only drives the custom replay-style timeline and the top-bar labels.
   There are no external requests: Reveal.js and fonts are bundled in /vendor. */
(function () {
  'use strict';

  var deck = new Reveal({
    width: 1920,
    height: 1080,
    margin: 0,
    minScale: 0.1,
    maxScale: 2,
    hash: true,
    controls: true,
    controlsTutorial: false,
    progress: false,
    center: false,
    transition: 'fade',
    transitionSpeed: 'default',
    backgroundTransition: 'none',
    keyboard: true,
    touch: true,
    help: true
  });

  var slides = Array.prototype.slice.call(document.querySelectorAll('.reveal .slides > section'));
  var total = slides.length;
  var scrub = document.getElementById('scrub');
  var fill = document.getElementById('scrubFill');
  var head = document.getElementById('playhead');
  var noEl = document.getElementById('slideNo');
  var totalEl = document.getElementById('slideTotal');
  var nameEl = document.getElementById('slideName');
  var ticks = [];

  function pad(n) { return String(n).padStart(2, '0'); }
  function pct(i) { return total > 1 ? (i / (total - 1)) * 100 : 0; }

  // Build the timeline ticks from the real slide list, so the count can never drift.
  slides.forEach(function (sec, i) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'tick';
    b.style.left = pct(i) + '%';
    b.setAttribute('aria-label', 'Go to slide ' + (i + 1) + ': ' + (sec.dataset.name || ''));
    b.innerHTML = '<span>' + pad(i + 1) + '</span>';
    b.addEventListener('click', function () { deck.slide(i, 0, 0); b.blur(); });
    scrub.appendChild(b);
    ticks.push(b);
  });
  totalEl.textContent = pad(total);

  function sync() {
    var h = deck.getIndices().h || 0;
    var sec = slides[h];
    noEl.textContent = pad(h + 1);
    nameEl.innerHTML = sec && sec.dataset.name ? sec.dataset.name : '';
    fill.style.width = pct(h) + '%';
    head.style.left = pct(h) + '%';
    ticks.forEach(function (t, i) { t.classList.toggle('on', i <= h); });
    document.title = 'Rocket League Mechanics — ' + pad(h + 1) + '/' + pad(total);
  }

  deck.on('ready', sync);
  deck.on('slidechanged', sync);

  // Defensive: if a <video> is ever added to a slide, pause it when the slide is left.
  deck.on('slidechanged', function (e) {
    slides.forEach(function (s) {
      if (s === e.currentSlide) return;
      s.querySelectorAll('video').forEach(function (v) { try { v.pause(); } catch (_) {} });
    });
  });

  deck.initialize();
  window.deck = deck;
})();
