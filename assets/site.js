const frame = document.querySelector('#demo-frame');
const stage = document.querySelector('#demo-stage');
const readerWindow = stage.querySelector('.demo-window');
const paper = stage.querySelector('.demo-paper');
const cover = paper.querySelector('img');
const status = document.querySelector('#demo-status');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let inView = false;
let started = false;
let scheduled = 0;
let sequence = 0;
let automaticFlight = null;
let drag = null;

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

function readerReady(restart) {
  if (!restart && frame.contentWindow?.glossPreview) return Promise.resolve(frame.contentWindow.glossPreview);
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      frame.removeEventListener('load', loaded);
      reject(new Error('Gloss 演示没有加载'));
    }, 30000);
    function loaded() {
      clearTimeout(timeout);
      const preview = frame.contentWindow?.glossPreview;
      if (preview) resolve(preview);
      else reject(new Error('Gloss 演示没有加载'));
    }
    frame.addEventListener('load', loaded, { once: true });
    if (restart) frame.contentWindow.location.reload();
  });
}

function makeCarrier() {
  const origin = cover.getBoundingClientRect();
  const bounds = stage.getBoundingClientRect();
  const image = cover.cloneNode();
  image.alt = '';
  image.loading = 'eager';
  image.className = 'paper-flight';
  image.style.left = origin.left - bounds.left + 'px';
  image.style.top = origin.top - bounds.top + 'px';
  image.style.width = origin.width + 'px';
  stage.append(image);
  return { image, x: origin.left + origin.width / 2, y: origin.top + origin.height / 2 };
}

function readerCenter() {
  const bounds = readerWindow.getBoundingClientRect();
  return { x: bounds.left + bounds.width / 2, y: bounds.top + bounds.height * .51 };
}

function pose(x, y, rotation, scale = 1) {
  return 'translate(' + x + 'px,' + y + 'px) rotate(' + rotation + 'deg) scale(' + scale + ')';
}

async function flyPaper() {
  const carrier = makeCarrier();
  const destination = readerCenter();
  const x = destination.x - carrier.x;
  const y = destination.y - carrier.y;
  stage.classList.add('is-flying');
  const motion = carrier.image.animate([
    { transform: pose(0, 0, -5), opacity: 1 },
    { transform: pose(x*.55, y*.44-34, 5, 1.04), opacity: 1, offset: .57 },
    { transform: pose(x, y, 0, .64), opacity: .07 },
  ], { duration: 1100, easing: 'cubic-bezier(.26,.64,.21,1)', fill: 'forwards' });
  automaticFlight = motion;
  try {
    await motion.finished;
  } finally {
    carrier.image.remove();
    if (automaticFlight === motion) {
      automaticFlight = null;
      stage.classList.remove('is-flying');
    }
  }
}

async function playStory(dropped) {
  if (!dropped && started) return;
  const run = dropped?.run ?? ++sequence;
  if (run !== sequence) return;
  clearTimeout(scheduled);
  scheduled = 0;
  const current = () => run === sequence;
  started = true;
  try {
    const preview = await (dropped ? dropped.home : readerReady(false));
    if (!current() || !preview) return;
    stage.dataset.state = 'import';
    status.textContent = '导入示例论文';
    if (!dropped && !reducedMotion.matches) {
      await Promise.all([
        flyPaper(),
        delay(400).then(() => current() ? preview.run('import') : undefined),
      ]);
    } else {
      await preview.run('import');
    }
    await delay(1250);
    if (!current()) return;
    stage.dataset.state = 'translate';
    status.textContent = '选中原文并显示译文';
    await preview.run('translate');
    await delay(2350);
    if (!current()) return;
    stage.dataset.state = 'locate';
    status.textContent = '在 PDF 第 2 页定位第二章';
    await preview.run('locate');
    if (!current()) return;
    stage.dataset.state = 'complete';
    status.textContent = '演示已完成。把 PDF 拖进阅读器可以重演。';
  } catch {
    if (!current()) return;
    stage.dataset.state = 'error';
    status.textContent = '演示未完成。把 PDF 拖进阅读器可以重试。';
  }
}

function startOnView() {
  if (!inView || started || drag || scheduled || reducedMotion.matches || !frame.contentWindow?.glossPreview) return;
  scheduled = setTimeout(() => {
    scheduled = 0;
    if (inView && !drag && !reducedMotion.matches) void playStory();
  }, 580);
}

if ('IntersectionObserver' in window) {
  new IntersectionObserver(entries => {
    inView = entries[0].isIntersecting && entries[0].intersectionRatio >= .44;
    if (inView) startOnView();
    else {
      clearTimeout(scheduled);
      scheduled = 0;
    }
  }, { threshold: .44, rootMargin: '0px 0px -5% 0px' }).observe(readerWindow);
}
frame.addEventListener('load', startOnView);
window.addEventListener('message', event => {
  if (event.source === frame.contentWindow && event.origin === location.origin && event.data?.type === 'gloss-preview-ready') startOnView();
});
reducedMotion.addEventListener('change', startOnView);

function takePaper(id, x, y) {
  clearTimeout(scheduled);
  scheduled = 0;
  drag = { id, x, y, dx: 0, dy: 0, carrier: null };
}

function overReader(x, y) {
  const box = readerWindow.getBoundingClientRect();
  return x >= box.left && x <= box.right && y >= box.top && y <= box.bottom;
}

function beginPaperDrag() {
  const state = stage.dataset.state;
  const home = frame.contentDocument?.querySelector('.lr-welcome[data-library-open="false"]');
  const restart = Boolean(frame.contentWindow?.glossPreview && (!home || !['waiting', 'home'].includes(state)));
  const run = ++sequence;
  started = true;
  drag.run = run;
  drag.carrier = makeCarrier();
  stage.classList.add('is-dragging');
  automaticFlight?.cancel();
  if (restart) stage.dataset.state = 'resetting';
  status.textContent = '回到 Gloss 主页';
  drag.home = Promise.all([
    readerReady(restart).then(async preview => {
      await preview.waitForHome();
      return preview;
    }),
    delay(restart && !reducedMotion.matches ? 150 : 0),
  ]).then(([preview]) => {
    if (run === sequence) {
      stage.dataset.state = 'home';
      status.textContent = 'Gloss 主页。把 PDF 放进阅读器即可导入。';
    }
    return preview;
  }).catch(() => {
    if (run === sequence) {
      stage.dataset.state = 'error';
      status.textContent = '主页加载失败。请再拖一次 PDF。';
    }
    return null;
  });
}

function movePaper(x, y) {
  const dx = x - drag.x;
  const dy = y - drag.y;
  if (!drag.carrier && Math.hypot(dx, dy) < 6) return;
  if (!drag.carrier) beginPaperDrag();
  drag.dx = dx;
  drag.dy = dy;
  drag.carrier.image.style.transform = pose(dx, dy, -2, 1.04);
  stage.classList.toggle('is-over-reader', overReader(x, y));
}

function putPaper(inside) {
  const released = drag;
  drag = null;
  stage.classList.remove('is-dragging', 'is-over-reader');
  if (!released?.carrier) {
    startOnView();
    return;
  }
  const carrier = released.carrier;
  if (reducedMotion.matches) {
    carrier.image.remove();
    if (inside) void playStory(released);
    return;
  }
  const target = inside ? readerCenter() : carrier;
  const motion = carrier.image.animate([
    { transform: pose(released.dx, released.dy, -2, 1.04), opacity: 1 },
    { transform: pose(target.x-carrier.x, target.y-carrier.y, inside ? 0 : -5, inside ? .68 : 1), opacity: inside ? 0 : 1 },
  ], { duration: inside ? 290 : 250, easing: 'cubic-bezier(.24,.72,.21,1)', fill: 'forwards' });
  void motion.finished.catch(() => {}).then(() => {
    carrier.image.remove();
    if (inside) void playStory(released);
  });
}

paper.addEventListener('pointerdown', event => {
  if (drag || event.button !== 0) return;
  takePaper(event.pointerId, event.clientX, event.clientY);
  paper.setPointerCapture(event.pointerId);
});
paper.addEventListener('pointermove', event => {
  if (drag?.id === event.pointerId) movePaper(event.clientX, event.clientY);
});
paper.addEventListener('pointerup', event => {
  if (drag?.id === event.pointerId) putPaper(Boolean(drag.carrier) && overReader(event.clientX, event.clientY));
});
paper.addEventListener('lostpointercapture', event => {
  if (drag?.id === event.pointerId) putPaper(false);
});
paper.addEventListener('keydown', event => {
  if (event.key === ' ' && !drag) {
    event.preventDefault();
    const bounds = paper.getBoundingClientRect();
    takePaper('keyboard', bounds.left + bounds.width / 2, bounds.top + bounds.height / 2);
    beginPaperDrag();
    drag.carrier.image.style.transform = pose(0, 0, -2, 1.04);
    return;
  }
  if (drag?.id !== 'keyboard') return;
  if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
    event.preventDefault();
    const point = readerCenter();
    movePaper(point.x, point.y);
  } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
    event.preventDefault();
    movePaper(drag.x, drag.y);
  } else if (event.key === ' ' || event.key === 'Escape') {
    event.preventDefault();
    putPaper(event.key === ' ' && stage.classList.contains('is-over-reader'));
  }
});
paper.addEventListener('blur', () => {
  if (drag?.id === 'keyboard') putPaper(false);
});

const shot = document.querySelector('[data-hero-image]');
const scenes = [...document.querySelectorAll('[data-scroll-scene]')];
const navRail = document.querySelector('.nav-links');
const navLinks = [...navRail.querySelectorAll('a')];
let scrollFrame = 0;
let navIndex = -1;
let navDrag = null;
let suppressNavClick = false;
let navIntent = null;
let navIntentTimer = 0;
const limit = value => Math.max(0, Math.min(1, value));

function navPosition(gesture, x) {
  return Math.max(0, Math.min(navLinks.length - 1, gesture.index + (x - gesture.x) / gesture.step));
}

navRail.addEventListener('pointerdown', event => {
  if (navDrag || event.button !== 0 || !event.isPrimary) return;
  suppressNavClick = false;
  const link = event.target.closest('a');
  if (!link) return;
  navDrag = { id: event.pointerId, index: navLinks.indexOf(link), step: link.offsetWidth, x: event.clientX, y: event.clientY, moving: false };
});
navRail.addEventListener('pointermove', event => {
  const gesture = navDrag;
  if (gesture?.id !== event.pointerId) return;
  if (!gesture.moving) {
    const dx = Math.abs(event.clientX - gesture.x);
    const dy = Math.abs(event.clientY - gesture.y);
    if (dy > 6 && dy > dx) { navDrag = null; return; }
    if (dx < 6) return;
    gesture.moving = true;
    navRail.setPointerCapture(event.pointerId);
    navRail.classList.add('is-scrubbing');
  }
  const position = navPosition(gesture, event.clientX);
  navRail.style.setProperty('--scrub-position', position);
  navLinks.forEach((link, index) => link.classList.toggle('is-preview', index === Math.round(position)));
});
function finishNavDrag(event, cancelled) {
  const gesture = navDrag;
  if (gesture?.id !== event.pointerId) return;
  navDrag = null;
  if (!gesture.moving) return;
  navRail.classList.remove('is-scrubbing');
  navRail.style.removeProperty('--scrub-position');
  navLinks.forEach(link => link.classList.remove('is-preview'));
  suppressNavClick = true;
  if (cancelled) return;
  const index = Math.round(navPosition(gesture, event.clientX));
  navLinks[index].click();
}
navRail.addEventListener('pointerup', event => finishNavDrag(event, false));
navRail.addEventListener('pointercancel', event => finishNavDrag(event, true));
navRail.addEventListener('pointerleave', event => {
  if (navDrag?.id === event.pointerId && !navDrag.moving) navDrag = null;
});
navRail.addEventListener('lostpointercapture', event => {
  if (event.target === navRail) finishNavDrag(event, true);
});
navRail.addEventListener('dragstart', event => event.preventDefault());
navRail.addEventListener('click', event => {
  if (suppressNavClick && event.isTrusted && event.detail) { event.preventDefault(); return; }
  const index = navLinks.indexOf(event.target.closest('a'));
  if (index < 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  navIntent = index;
  paintNav(index);
  clearTimeout(navIntentTimer);
  navIntentTimer = setTimeout(endNavIntent, 950);
}, true);

function paintNav(active) {
  if (active === navIndex) return;
  navIndex = active;
  navRail.toggleAttribute('data-at-top', active === -1);
  navRail.toggleAttribute('data-unlisted', active >= navLinks.length);
  navRail.style.setProperty('--section-index', Math.max(0, Math.min(active, navLinks.length - 1)));
  navLinks.forEach((link, index) => {
    if (index === active) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
}

function endNavIntent() {
  if (navIntent === null) return;
  navIntent = null;
  clearTimeout(navIntentTimer);
  queueScroll();
}

function paintScroll() {
  scrollFrame = 0;
  const tops = scenes.map(scene => scene.getBoundingClientRect().top);
  const navLine = Math.min(innerHeight * .38, 240);
  let active = tops.reduce((index, top, i) => top <= navLine ? i : index, -1);
  if (scrollY > 0 && scrollY + innerHeight >= document.documentElement.scrollHeight - 2) active = tops.length - 1;
  paintNav(navIntent ?? active);
  if (reducedMotion.matches) {
    shot.style.removeProperty('transform');
    for (const scene of scenes) scene.style.removeProperty('--unfold');
    return;
  }
  const heroProgress = limit(scrollY / Math.max(580, innerHeight * .9));
  shot.style.transform = 'translate3d(0,' + (heroProgress * 21) + 'px,0) scale(' + (1 - heroProgress * .042) + ')';
  scenes.forEach((scene, index) => {
    const progress = limit((innerHeight * .96 - tops[index]) / (innerHeight * .55));
    scene.style.setProperty('--unfold', progress.toFixed(3));
  });
}

function queueScroll() {
  if (!scrollFrame) scrollFrame = requestAnimationFrame(paintScroll);
}

window.addEventListener('scroll', queueScroll, { passive: true });
window.addEventListener('scrollend', endNavIntent);
window.addEventListener('wheel', endNavIntent, { passive: true });
window.addEventListener('resize', queueScroll, { passive: true });
reducedMotion.addEventListener('change', queueScroll);
queueScroll();

if (/\b(?:Chrome|Chromium)\//.test(navigator.userAgent) && CSS.supports('backdrop-filter', 'url(#gloss-rim)')) {
  document.documentElement.dataset.glassRefraction = 'enabled';
}

const promptField = document.querySelector('#setup-prompt');
const promptCopy = document.querySelector('#copy-setup');
const copyStatus = document.querySelector('#copy-status');
const prompt = promptField.defaultValue;
let typing = null;
let typingObserver = null;

function finishPrompt() {
  if (typing !== null) {
    clearInterval(typing);
    typing = null;
    promptField.value = prompt;
  }
  typingObserver?.disconnect();
}

if ('IntersectionObserver' in window && !reducedMotion.matches) {
  typingObserver = new IntersectionObserver(entries => {
    if (!entries.some(entry => entry.isIntersecting)) return;
    typingObserver.disconnect();
    if (document.activeElement === promptField || promptField.value !== prompt) return;
    const chars = Array.from(prompt);
    const step = Math.ceil(chars.length / 72);
    let length = 0;
    promptField.value = '';
    typing = setInterval(() => {
      length += step;
      promptField.value = chars.slice(0, length).join('');
      if (length >= chars.length) finishPrompt();
    }, 43);
  }, { threshold: .62 });
  typingObserver.observe(promptField.closest('.setup-prompt'));
}

promptField.addEventListener('focus', finishPrompt);
reducedMotion.addEventListener('change', finishPrompt);
promptCopy.disabled = false;
promptCopy.addEventListener('click', async () => {
  finishPrompt();
  if (!promptField.value.trim()) {
    copyStatus.textContent = '输入一句配置提示词后再复制。';
    return;
  }
  try {
    await navigator.clipboard.writeText(promptField.value);
    copyStatus.textContent = '已复制提示词。';
  } catch {
    promptField.focus();
    promptField.select();
    copyStatus.textContent = '已选中文字，可以手动复制。';
  }
});
