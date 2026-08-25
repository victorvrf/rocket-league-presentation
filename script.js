    const chartData = [
  { rank: 'Bronze', percentage: 3.43, display: '3.43%' },
  { rank: 'Silver', percentage: 19.34, display: '19.34%' },
  { rank: 'Gold', percentage: 38.08, display: '38.08%' },
  { rank: 'Platinum', percentage: 23.63, display: '23.63%' },
  { rank: 'Diamond', percentage: 12.07, display: '12.07%' },
  { rank: 'Champion', percentage: 3.21, display: '3.21%' },
  { rank: 'Grand Champion', percentage: 0.23, display: '0.23%' },
  { rank: 'Supersonic Legend', percentage: 0.001, display: '<0.01%' }
];

const deck = new Reveal({ width: 1920, height: 1080, margin: 0.02, minScale: 0.2, maxScale: 1, hash: true, controls: false, progress: false, center: false, transition: 'slide', backgroundTransition: 'fade', keyboard: true, scrollActivationWidth: 0 });
deck.initialize();
if (window.lucide) lucide.createIcons({ attrs: { 'stroke-width': 1.7 } });

let rankStep = 0;
const rankLevels = [...document.querySelectorAll('.rank-level')];
const rankNumber = document.querySelector('#rankNumber');
const sectionIndicator = document.querySelector('#sectionIndicator');
const progress = document.querySelector('.progress-track span');

function isRankSlideActive() {
  return Boolean(document.querySelector('.slide-ranked.present'));
}

function isGrindSlideActive() {
  return Boolean(document.querySelector('.slide-grind.present'));
}

function updateRank(nextStep) {
  rankStep = Math.max(0, Math.min(rankLevels.length - 1, nextStep));
  document.querySelector('#rankTower').dataset.stage = String(rankStep + 1);
  rankLevels.forEach((level, index) => {
    level.classList.toggle('active', index === rankStep);
    level.classList.toggle('passed', index < rankStep);
    level.setAttribute('aria-current', index === rankStep ? 'step' : 'false');
  });
  rankNumber.textContent = String(rankStep + 1).padStart(2, '0');
  document.querySelector('.rank-prompt').lastChild.textContent = ` RANK ${String(rankStep + 1).padStart(2, '0')} / 08`;
}

function updateBroadcastUI() {
  const indices = deck.getIndices();
  const index = Number.isInteger(indices.h) ? indices.h : 0;
  const currentSlide = deck.getCurrentSlide();
  sectionIndicator.textContent = currentSlide?.dataset.section || `${String(index + 1).padStart(2, '0')} / 09`;
  progress.style.width = `${((index + 1) / 9) * 100}%`;
  if (index === 4) updateRank(0);
  if (index === 6) {
    setSkillStage(0);
  } else if (videoFrame) {
    clearTimeout(switchTimer);
    if (skillVideo) skillVideo.pause();
  }
}

function handleRightArrow() {
  if (isRankSlideActive()) {
    if (rankStep < rankLevels.length - 1) updateRank(rankStep + 1);
    else deck.next();
    return;
  }
  if (isGrindSlideActive()) {
    if (grindStep < SKILL_CLIPS.length - 1) setSkillStage(grindStep + 1);
    else deck.next();
    return;
  }
  deck.next();
}

function handleLeftArrow() {
  if (isRankSlideActive()) {
    if (rankStep > 0) updateRank(rankStep - 1);
    else deck.prev();
    return;
  }
  if (isGrindSlideActive()) {
    if (grindStep > 0) setSkillStage(grindStep - 1);
    else deck.prev();
    return;
  }
  deck.prev();
}

deck.configure({ keyboard: { 39: handleRightArrow, 37: handleLeftArrow } });
deck.on('slidechanged', updateBroadcastUI);
deck.on('ready', updateBroadcastUI);

chartData.forEach((item, index) => {
  const row = document.querySelectorAll('.data-row')[index];
  if (!row) return;
  row.dataset.value = item.percentage;
  row.querySelector('b').textContent = item.display;
});

// ===== Slide 7 — training replay stage (one clip per skill) =====
const SKILL_CLIPS = [
  { file: 'assets/videos/drive.mp4', title: 'DRIVE', desc: 'Master the basic movement and learn how to control your car around the field.' },
  { file: 'assets/videos/hit-the-ball.mp4', title: 'HIT THE BALL', desc: 'Learn how speed, timing, and positioning determine the direction and power of the ball.' },
  { file: 'assets/videos/ball-control.mp4', title: 'BALL CONTROL', desc: 'Keep possession by controlling the ball instead of simply hitting it away.' },
  { file: 'assets/videos/aerial-control.mp4', title: 'AERIAL CONTROL', desc: 'Take control of the car in the air and make accurate touches before landing.' },
  { file: 'assets/videos/advanced-mechanics.mp4', title: 'ADVANCED MECHANICS', desc: 'Combine movement, timing, and precision to perform increasingly complex techniques.' },
  { file: 'assets/videos/consistency.mp4', title: 'CONSISTENCY', desc: 'The goal is not performing a mechanic once, but reproducing it reliably under pressure.' },
  { file: 'assets/videos/supersonic-legend.mp4', title: 'SUPERSONIC LEGEND', desc: 'The highest competitive level demands exceptional mechanics, decision-making, consistency, and experience.' }
];
const grindSlide = document.querySelector('.slide-grind');
const videoFrame = document.querySelector('#videoFrame');
const skillVideo = document.querySelector('#skillVideo');
const railStops = [...document.querySelectorAll('#skillRail .rail-stop')];
const railFill = document.querySelector('#railFill');
let grindStep = 0;
let switchTimer = null;
const clipState = new Map();

function applySkillStage(index) {
  grindStep = index;
  railStops.forEach((stop, i) => {
    stop.classList.toggle('active', i === index);
    stop.classList.toggle('passed', i < index);
  });
  if (railFill) railFill.style.width = `${(index / (railStops.length - 1)) * 100}%`;
  const clip = SKILL_CLIPS[index];
  const titleEl = document.querySelector('#skillTitle');
  const descEl = document.querySelector('#skillDesc');
  const tagEl = document.querySelector('#skillTag');
  const indexEl = document.querySelector('#skillIndex');
  if (titleEl) titleEl.textContent = clip.title;
  if (descEl) descEl.textContent = clip.desc;
  if (tagEl) tagEl.textContent = index === SKILL_CLIPS.length - 1 ? 'ELITE LEVEL' : `SKILL ${String(index + 1).padStart(2, '0')}`;
  if (indexEl) indexEl.textContent = String(index + 1).padStart(2, '0');
  if (grindSlide) grindSlide.classList.toggle('culmination', index === SKILL_CLIPS.length - 1);
}

function loadSkillClip(index) {
  if (!skillVideo) return;
  const file = SKILL_CLIPS[index].file;
  videoFrame.classList.remove('playing');
  if (clipState.get(file) === 'missing') {
    skillVideo.removeAttribute('src');
    skillVideo.load();
    return;
  }
  if (skillVideo.dataset.clip !== file) {
    skillVideo.dataset.clip = file;
    skillVideo.src = file;
    skillVideo.load();
  }
  const playback = skillVideo.play();
  if (playback && playback.catch) playback.catch(() => {});
}

function setSkillStage(next) {
  const target = Math.max(0, Math.min(SKILL_CLIPS.length - 1, next));
  applySkillStage(target);
  clearTimeout(switchTimer);
  if (videoFrame) videoFrame.classList.add('switching');
  switchTimer = setTimeout(() => {
    loadSkillClip(target);
    if (videoFrame) videoFrame.classList.remove('switching');
  }, 230);
}

function syncGrindFromFragmentsFallback() {
  setSkillStage(grindStep);
}

if (skillVideo) {
  skillVideo.addEventListener('loadeddata', () => {
    skillVideo.classList.add('ready');
    if (videoFrame) videoFrame.classList.add('playing');
  });
  skillVideo.addEventListener('error', () => {
    if (skillVideo.dataset.clip) clipState.set(skillVideo.dataset.clip, 'missing');
    skillVideo.classList.remove('ready');
    if (videoFrame) videoFrame.classList.remove('playing');
  });
}

updateBroadcastUI();
