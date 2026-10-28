/* ==========================================================================
   CONFIGURACAO DOS VIDEOS DE GAMEPLAY  (o UNICO arquivo que voce pode editar)
   --------------------------------------------------------------------------
   Como funciona:
   - Coloque o video na pasta  assets/videos/  com o nome exato da coluna "file".
   - Abra a apresentacao. Se o arquivo existir, o clipe aparece sozinho.
   - Se o arquivo NAO existir, nada muda: o slide continua igual (sem erro, sem caixa vazia).
   - Durante a apresentacao: aperte a tecla R no slide para abrir o replay (o anel verde
     na bola avisa quando ha video). As SETAS continuam so passando de slide.
     Com o replay aberto: setas -> / <- trocam de clipe; R ou ESC fecha.

   Campos de cada clipe:
     slide : numero do slide (1 a 8) onde o replay pode aparecer
     file  : nome do arquivo dentro de assets/videos/   (MUDE AQUI se usar outro nome)
     title : titulo mostrado no replay
     note  : frase curta em ingles mostrada embaixo do video (pode ser "")
     start : (opcional) segundo em que o clipe comeca. Ex.: start: 3.5
     speed : (opcional) velocidade. 1 = normal, 0.5 = camera lenta. Ex.: speed: 0.5
     from  : [x, y] ponto do slide de onde o replay "abre" (a bola do diagrama). Ja ajustado
             para cada slide; so mude se alterar o diagrama.
     cues  : (opcional) rotulos que aparecem DENTRO do video, nos segundos que voce escolher.
             Ex.: cues: [ {t: 0.8, text: '1 BOOST + JUMP'}, {t: 2.1, text: '2 FLIP CANCEL'} ]
             t = segundo do arquivo de video. Cada rotulo some sozinho depois de ~3 s
             (ou use hold: 1.5 para mudar quantos segundos fica na tela).
     slow  : (opcional) camera lenta no momento-chave. Ex.: slow: {at: 3.2, to: 0.25, hold: 1.2}
             at = segundo em que desacelera, to = velocidade (0.25 = quatro vezes mais lento),
             hold = por quantos segundos (reais) fica lento antes de voltar ao normal.

   A ordem da lista = a ordem em que os replays aparecem dentro do mesmo slide.
   Para tirar um clipe da apresentacao, basta nao colocar o arquivo (ou apagar a linha).
   ========================================================================== */
window.RL_VIDEOS = {
  folder: 'assets/videos/',

  /* Tecla que abre/fecha o replay. Pode trocar por outra letra, ex.: 'v'. */
  replayKey: 'r',

  /* false (padrao): setas so passam de slide; o replay abre so com a tecla acima.
     true: a seta direita tambem abre o replay (util se voce usa controle remoto/clicker). */
  arrowOpens: false,

  /* 'try': verifica cada arquivo configurado individualmente. Necessario no GitHub Pages,
     que hospeda arquivos estaticos mas nao oferece listagem da pasta assets/videos/. */
  detect: 'try',

  clips: [
    // Exemplo completo (copie o formato se quiser anotacoes e camera lenta):
    // { slide: 3, file: 'speed-flip.mp4', title: 'Speed flip', note: '...', from: [1560, 901],
    //   cues: [ {t: 0.8, text: '1 DIAGONAL FLIP'}, {t: 1.6, text: '2 FLIP CANCEL'} ],
    //   slow: {at: 1.6, to: 0.25, hold: 1.2} },

    // ---- Slide 3: Movement mechanics
    { slide: 3, file: 'half-flip.mp4',    title: 'Half-flip',    note: 'Turn around fast, keep your speed.', from: [1500, 372],
      cues: [{ t: 0.5, text: '1. HALF FLIP', hold: 2 }] },
    { slide: 3, file: 'wave-dash.mp4',    title: 'Wave dash',    note: 'Flip as you land to slide forward.', from: [1500, 661],
      cues: [{ t: 0.5, text: '1. WAVE DASH', hold: 2 }] },
    { slide: 3, file: 'speed-flip.mp4',   title: 'Speed flip',   note: 'Diagonal flip, quick cancel, straight to the ball.', from: [1560, 901],
      cues: [
        { t: 0.5, text: '1. DIAGONAL FLIP', hold: 2 },
        { t: 1.2, text: '2. FLIP CANCEL', hold: 2 },
        { t: 1.8, text: '3. STRAIGHT TO BALL', hold: 2 }
      ] },

    // ---- Slide 4: Ball control
    { slide: 4, file: 'air-dribble.mp4',  title: 'Air dribble',  note: 'Small touches keep the ball with the car in the air.', from: [596, 314],
      cues: [
        { t: 1.0, text: '1. LIGHT TOUCHES', hold: 2 },
        { t: 3.0, text: '2. KEEP IT IN AIR', hold: 2 }
      ] },
    { slide: 4, file: 'ceiling-shot.mp4', title: 'Ceiling shot', note: 'The ceiling is part of the setup.', from: [730, 688],
      cues: [{ t: 1.0, text: '1. CEILING SHOT', hold: 2 }] },

    // ---- Slide 5: Power & contact
    { slide: 5, file: 'wall-pinch.mp4',   title: 'Wall pinch',   note: 'The ball is squeezed between the car and the wall.', from: [755, 672],
      cues: [{ t: 0.5, text: '1. WALL PINCH', hold: 2 }] },
    { slide: 5, file: 'ground-pinch.mp4', title: 'Ground pinch', note: 'The ball is squeezed between the car and the floor.', from: [1460, 751],
      cues: [{ t: 0.5, text: '1. GROUND PINCH', hold: 2 }] },

    // ---- Slide 6: Advanced mechanics
    { slide: 6, file: 'flip-reset.mp4',   title: 'Flip reset',   note: 'Three or more wheels on the ball give the flip back.', from: [300, 682],
      cues: [{ t: 1.0, text: '1. FLIP RESET', hold: 2 }] },
    { slide: 6, file: 'musty-flick.mp4',  title: 'Musty flick',  note: 'Nose past 90 degrees, then flip.', from: [1768, 650],
      cues: [{ t: 0.5, text: '1. MUSTY FLICK', hold: 2 }],
      slow: { at: 2.05, to: 0.35, hold: 1.0 } }
  ]
};
