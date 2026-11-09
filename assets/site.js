const frame = document.querySelector('#demo-frame');
const stage = document.querySelector('#demo-stage');
const readerWindow = stage.querySelector('.demo-window');
const paper = stage.querySelector('.demo-paper');
const cover = paper.querySelector('img');
const status = document.querySelector('#demo-status');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const compact = matchMedia('(max-width: 700px), (max-width: 920px) and (pointer: coarse)');
const desktopPaperLabel = paper.getAttribute('aria-label');
let inView = false;
let started = false;
let scheduled = 0;
let sequence = 0;
let automaticFlight = null;
let drag = null;
let suppressPaperClick = false;

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

function loadReaderFrame() {
  if (!frame.hasAttribute('src')) frame.src = frame.dataset.src;
}

function readerReady(restart) {
  const preview = frame.contentWindow?.glossPreview;
  if (preview && (!restart || preview.reset())) return Promise.resolve(preview);
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
    if (restart && preview) frame.contentWindow.location.reload();
    else loadReaderFrame();
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
  ], { duration: compact.matches ? 540 : 820, easing: 'cubic-bezier(.26,.64,.21,1)', fill: 'forwards' });
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
      await Promise.all([flyPaper(), preview.run('import')]);
    } else {
      await preview.run('import');
    }
    if (!current()) return;
    if (compact.matches) stage.dataset.state = 'opened';
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
    status.textContent = compact.matches ? '演示已完成。点按或拖入 PDF 可以重演。' : '演示已完成。把 PDF 拖进阅读器可以重演。';
  } catch {
    if (!current()) return;
    stage.dataset.state = 'error';
    status.textContent = compact.matches ? '示例 PDF 未打开。点按上方 PDF 重试。' : '演示未完成。把 PDF 拖进阅读器可以重试。';
  }
}

function startOnView() {
  if (!inView || started || drag || scheduled || reducedMotion.matches || !frame.contentWindow?.glossPreview) return;
  scheduled = setTimeout(() => {
    scheduled = 0;
    if (inView && !drag && !reducedMotion.matches) void playStory();
  }, 320);
}

if ('IntersectionObserver' in window) {
  const prepareReader = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      loadReaderFrame();
      prepareReader.disconnect();
    }
  }, { rootMargin: '620px 0px' });
  prepareReader.observe(readerWindow);
  new IntersectionObserver(entries => {
    const threshold = compact.matches ? .28 : .44;
    inView = entries[0].isIntersecting && entries[0].intersectionRatio >= threshold;
    if (inView) startOnView();
    else {
      clearTimeout(scheduled);
      scheduled = 0;
    }
  }, { threshold: [.28, .44], rootMargin: '0px 0px -5% 0px' }).observe(readerWindow);
} else loadReaderFrame();
frame.addEventListener('load', startOnView);
window.addEventListener('message', event => {
  if (event.source !== frame.contentWindow || event.origin !== location.origin) return;
  if (event.data?.type === 'gloss-preview-ready') startOnView();
  if (compact.matches && event.data?.type === 'gloss-preview-open' && ['waiting', 'home', 'import'].includes(stage.dataset.state)) {
    stage.dataset.state = 'opened';
  }
  if (compact.matches && event.data?.type === 'gloss-preview-home' && stage.dataset.state !== 'resetting') {
    stage.dataset.state = 'home';
  }
  if (event.data?.type === 'gloss-preview-interaction' && ['import', 'opened', 'translate', 'locate'].includes(stage.dataset.state)) {
    sequence++;
    automaticFlight?.cancel();
    stage.dataset.state = 'complete';
    status.textContent = '';
  }
  if (compact.matches && event.data?.type === 'gloss-preview-source' && Number.isFinite(event.data.text)) {
    const top = frame.getBoundingClientRect().top + event.data.text;
    if (top < 12 || top > innerHeight - 135) {
      window.scrollBy({ top: top - 16, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
    }
  }
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

function resetReader() {
  clearTimeout(scheduled);
  scheduled = 0;
  const state = stage.dataset.state;
  const home = frame.contentDocument?.querySelector('.lr-welcome[data-library-open="false"]');
  const restart = Boolean(frame.contentWindow?.glossPreview && (!home || !['waiting', 'home'].includes(state)));
  const run = ++sequence;
  started = true;
  automaticFlight?.cancel();
  if (restart) stage.dataset.state = 'resetting';
  status.textContent = '回到 Gloss 主页';
  const ready = Promise.all([
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
  return { run, home: ready };
}

function beginPaperDrag() {
  suppressPaperClick = true;
  drag.carrier = makeCarrier();
  stage.classList.add('is-dragging');
  Object.assign(drag, resetReader());
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
  suppressPaperClick = false;
  if (compact.matches && event.target !== cover) return;
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
paper.addEventListener('click', () => {
  if (compact.matches && !suppressPaperClick && !['resetting', 'import'].includes(stage.dataset.state)) void playStory(resetReader());
});
paper.addEventListener('keydown', event => {
  if (compact.matches && !drag && (event.key === 'Enter' || event.key === ' ')) {
    event.preventDefault();
    suppressPaperClick = false;
    paper.click();
    return;
  }
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

function adaptPaperControl() {
  paper.setAttribute('role', compact.matches ? 'button' : 'group');
  paper.setAttribute('aria-label', compact.matches ? '打开示例 PDF，也可以拖进阅读器' : desktopPaperLabel);
}
adaptPaperControl();
compact.addEventListener('change', adaptPaperControl);

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
  if (reducedMotion.matches || compact.matches) {
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

const walkthrough = document.querySelector('#walkthrough');
const recordingSources = [...walkthrough.querySelectorAll('[data-compact-src]')];
const desktopRecordingSources = recordingSources.map(source => source.getAttribute('src'));

function prepareRecording() {
  const mobile = compact.matches;
  walkthrough.poster = mobile ? walkthrough.dataset.compactPoster : walkthrough.dataset.poster;
  walkthrough.preload = mobile ? 'none' : 'metadata';
  let changed = false;
  recordingSources.forEach((source, index) => {
    const src = mobile ? source.dataset.compactSrc : desktopRecordingSources[index];
    if (source.getAttribute('src') === src) return;
    source.setAttribute('src', src);
    changed = true;
  });
  if (changed) walkthrough.load();
}

if ('IntersectionObserver' in window) {
  const prepareVideo = new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting) return;
    prepareVideo.disconnect();
    prepareRecording();
    compact.addEventListener('change', prepareRecording);
  }, { rootMargin: '300px 0px' });
  prepareVideo.observe(walkthrough);
} else prepareRecording();

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

if ('IntersectionObserver' in window && !reducedMotion.matches && !compact.matches) {
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
function fitPrompt() {
  promptField.style.removeProperty('height');
  if (!compact.matches) return;
  promptField.style.height = '0px';
  promptField.style.height = promptField.scrollHeight + 'px';
}
promptField.addEventListener('input', fitPrompt);
window.addEventListener('resize', fitPrompt, { passive: true });
compact.addEventListener('change', () => {
  finishPrompt();
  fitPrompt();
});
fitPrompt();
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
