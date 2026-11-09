/* Demo host adapter for the published Gloss front end. */
const transport = window.fetch.bind(window);
const reduce = matchMedia('(prefers-reduced-motion: reduce)');
const sampleName = 'Reading with Source Links.pdf';
const sampleFile = new URL('./sample/reading-with-source-links.pdf', location.href);
const indexFile = new URL('./sample/structure.json', location.href);
const exampleSentence = 'Every claim should lead back to its source.';
const exampleTranslation = '每一项论断，都应当能追溯到它的原始出处。';
const fixtureFiles = new Set([sampleFile.href, indexFile.href]);
const dragFixtures = new WeakSet();
const storage = new Map();
let activeImport = null;
let builtInInput = false;
let documentFile;
let structureFixture;

window.GlossPreviewStorage = {
  getItem: key => storage.get(key) ?? null,
  setItem: (key, value) => storage.set(key, String(value)),
  removeItem: key => storage.delete(key),
};

function send(type, text) {
  if (parent !== window) parent.postMessage({ type, text }, location.origin);
}

function pace(ms) {
  return new Promise(resolve => setTimeout(resolve, reduce.matches ? 0 : ms));
}

function json(value, status = 200) {
  return new Response(JSON.stringify(value), { status, headers: { 'Content-Type': 'application/json; charset=utf-8' } });
}

function normalize(text) {
  return String(text || '').trim().replace(/\s+/g, ' ').replace(/[.!?]$/, '').toLowerCase();
}

function stream(fragments, signal) {
  let index = 0;
  let cancelled = false;
  const encoder = new TextEncoder();
  const streamBody = new ReadableStream({
    async pull(controller) {
      await pace(index ? 135 : 185);
      if (cancelled) return;
      if (signal?.aborted) {
        controller.close();
        return;
      }
      if (index === fragments.length) {
        controller.enqueue(encoder.encode('event: done\ndata: ' + JSON.stringify({ text: fragments.join('') }) + '\n\n'));
        controller.close();
        return;
      }
      controller.enqueue(encoder.encode('event: delta\ndata: ' + JSON.stringify({ text: fragments[index++] }) + '\n\n'));
    },
    cancel() { cancelled = true; },
  });
  return new Response(streamBody, { headers: { 'Content-Type': 'text/event-stream; charset=utf-8' } });
}

async function loadSample() {
  if (!documentFile) {
    const response = await transport(sampleFile);
    if (!response.ok) throw new Error('示例 PDF 加载失败');
    documentFile = new File([await response.blob()], sampleName, { type: 'application/pdf' });
  }
  return documentFile;
}

async function loadIndex() {
  if (!structureFixture) {
    const response = await transport(indexFile);
    if (!response.ok) throw new Error('示例索引加载失败');
    structureFixture = await response.json();
  }
  return structureFixture;
}

async function serveStructure(bytes) {
  if (!(bytes instanceof ArrayBuffer || ArrayBuffer.isView(bytes))) return json({ error: '缺少示例 PDF' }, 400);
  const digest = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)), value => value.toString(16).padStart(2, '0')).join('');
  const fixture = await loadIndex();
  return fixture.documentId === 'pdf-' + digest ? json(fixture) : json({ error: '此网页只演示内置论文。' }, 400);
}

const highlights = [
  { type: 'insight', quote: exampleSentence, comment: '先读一句原文，再核对它在全文中的位置。' },
  { type: 'method', quote: 'An anchor records the page and the position of the original passage.', comment: '把章节或段落的页码和位置连接起来。' },
  { type: 'conclusion', quote: 'A source link is an invitation to check.', comment: '理解一段解释后，可以回到全文核对。' },
];

window.fetch = async function fetchForPreview(input, init) {
  const url = new URL(input instanceof Request ? input.url : input, location.href);
  if (fixtureFiles.has(url.href)) return transport(input, init);
  if (url.origin !== location.origin || !url.pathname.startsWith('/api/literature/')) {
    return json({ error: '此网页仅提供 Gloss 示例数据。' }, 403);
  }
  const route = url.pathname.slice('/api/literature/'.length);
  switch (route) {
    case 'structure':
      return serveStructure(init?.body);
    case 'prepare': {
      const sample = await loadIndex();
      const paragraphs = sample.sections.flatMap(section => section.paragraphs.map(paragraph => ({ ...paragraph, heading: section.heading })));
      return json({ ok: true, paragraphs, outline: sample.sections.map(section => section.heading).join('\n') });
    }
    case 'highlights':
      return json({ ok: true, items: highlights });
    case 'translate': {
      const text = JSON.parse(init?.body || '{}').text;
      const phrase = normalize(text);
      const fragments = phrase === normalize(exampleSentence)
        ? ['每一项论断，', '都应当能追溯到', '它的原始出处。']
        : phrase === normalize(highlights[1].quote)
          ? ['锚点记录了', '原始段落的页码与位置。']
          : ['请选中摘要首句 ', '“Every claim should lead back to its source.” ', '查看预置译文。'];
      return stream(fragments, init?.signal);
    }
    case 'selection': {
      const request = JSON.parse(init?.body || '{}');
      if (request.purpose !== 'chapter') return json({ error: '网页演示提供预置章节讲解。' }, 400);
      const section = (await loadIndex()).sections.find(item => item.id === request.chapter?.id);
      const fragments = String(section?.heading || request.text).startsWith('2.')
        ? ['本章解释如何从讲解回到原文。\n\n', '锚点记录页码和段落位置，让读者能跳回原句。', '高亮提示核对的位置，前后文依然可见。']
        : ['这篇示例论文演示如何把阅读笔记与出处连起来。\n\n', '先选中一句原文，再沿着章节位置回到原文核对。'];
      return stream(fragments, init?.signal);
    }
    case 'models':
    case 'zotero':
    case 'library/lookup':
      return json({ ok: true, items: [], models: [], complete: true });
    default:
      return json({ error: '公开演示提供示例论文、划词译文和章节定位。' }, 400);
  }
};

function waitFor(find, description, timeoutMs = 9000) {
  return new Promise((resolve, reject) => {
    const initial = find();
    if (initial) {
      resolve(initial);
      return;
    }
    const observer = new MutationObserver(check);
    const timer = setTimeout(() => {
      observer.disconnect();
      reject(new Error(description));
    }, timeoutMs);
    function check() {
      const item = find();
      if (!item) return;
      clearTimeout(timer);
      observer.disconnect();
      resolve(item);
    }
    observer.observe(document.getElementById('root'), {
      subtree: true, childList: true, characterData: true, attributes: true,
    });
  });
}

function pointAt(x, y) {
  const cursor = document.querySelector('#preview-cursor');
  cursor.style.transform = 'translate(' + x + 'px,' + y + 'px)';
  cursor.classList.add('is-shown');
}

function hidePoint() {
  document.querySelector('#preview-cursor').classList.remove('is-shown');
}

function originalPage(number) {
  return document.querySelector('.lr-page[data-page="' + number + '"]');
}

function renderedPage(number) {
  const page = originalPage(number);
  return page?.querySelector('canvas') && page.querySelector('.lr-textlayer span') ? page : null;
}

function dispatchDrop(target, transfer, type, x, y) {
  target.dispatchEvent(new DragEvent(type, {
    bubbles: true, cancelable: true, dataTransfer: transfer, clientX: x, clientY: y,
  }));
}

async function loadIntoReader() {
  if (renderedPage(1)) return;
  const file = await loadSample();
  const input = await waitFor(() => document.querySelector('.lr-root input[type=file]'), '无法找到文件导入入口');
  const welcome = document.querySelector('.lr-welcome');
  const transfer = new DataTransfer();
  transfer.items.add(file);
  dragFixtures.add(transfer);

  if (welcome) {
    const box = welcome.getBoundingClientRect();
    const x = box.left + box.width * .5;
    const y = box.top + box.height * .52;
    pointAt(box.left + box.width * .73, box.top + box.height * .35);
    await pace(170);
    dispatchDrop(welcome, transfer, 'dragenter', x, y);
    dispatchDrop(welcome, transfer, 'dragover', x, y);
    pointAt(x, y);
    await pace(640);
    dispatchDrop(welcome, transfer, 'drop', x, y);
  } else {
    input.files = transfer.files;
    builtInInput = true;
    try {
      input.dispatchEvent(new Event('change', { bubbles: true }));
    } finally {
      builtInInput = false;
    }
  }

  try {
    // A cold load needs to fetch the PDF renderer and its worker.
    await waitFor(() => renderedPage(1), '示例 PDF 未完成渲染', 30000);
  } finally {
    hidePoint();
  }
}

function importPaper() {
  if (renderedPage(1)) return Promise.resolve();
  if (!activeImport) activeImport = loadIntoReader().finally(() => { activeImport = null; });
  return activeImport;
}

function mouse(target, type, x, y, buttons) {
  target.dispatchEvent(new MouseEvent(type, {
    bubbles: true, cancelable: true, view: window, button: 0, buttons, clientX: x, clientY: y,
  }));
}

async function translateSample() {
  await importPaper();
  const findLine = () => Array.from(originalPage(1)?.querySelectorAll(".lr-textlayer span") || []).find(span => normalize(span.textContent) === normalize(exampleSentence));
  const firstLine = await waitFor(findLine, '无法定位示例句子');
  const reader = firstLine.closest('.lr-source-body');
  // The release viewer measures fit-to-width after the first render.
  await new Promise(resolve => setTimeout(resolve, 320));
  const visible = await waitFor(findLine, '无法读取已缩放的示例句子');
  const bounds = reader.getBoundingClientRect();
  const current = visible.getBoundingClientRect();
  if (current.top < bounds.top + 120 || current.bottom > bounds.bottom - 105) {
    reader.scrollTo({ top: reader.scrollTop + current.top - bounds.top - Math.min(180, bounds.height * .5), behavior: 'instant' });
    await new Promise(resolve => setTimeout(resolve, 260));
  }
  const line = await waitFor(findLine, '无法读取可见的示例句子');
  const range = document.createRange();
  range.selectNodeContents(line);
  const box = range.getBoundingClientRect();
  const x1 = box.left + 1;
  const x2 = box.right - 1;
  const y = (box.top + box.bottom) * .5;
  const selection = window.getSelection();
  selection.removeAllRanges();
  pointAt(x1, y);
  mouse(line, 'mousedown', x1, y, 1);
  const textNode = line.firstChild;
  const cursor = document.getElementById('preview-cursor');
  if (!reduce.matches && textNode?.nodeType === Node.TEXT_NODE && line.childNodes.length === 1) {
    cursor.classList.add('is-tracking');
    const start = performance.now();
    await new Promise(resolve => {
      const step = now => {
        if (!line.isConnected) { resolve(); return; }
        const progress = Math.min(1, Math.max(0, (now - start) / 560));
        selection.setBaseAndExtent(textNode, 0, textNode, Math.round(textNode.length * progress));
        pointAt(x1 + (x2 - x1) * progress, y);
        if (progress === 1) resolve();
        else requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
    cursor.classList.remove('is-tracking');
  }
  selection.removeAllRanges();
  if (line.isConnected) selection.addRange(range);
  pointAt(x2, y);
  mouse(line, 'mousemove', x2, y, 1);
  mouse(line, 'mouseup', x2, y, 0);
  try {
    await waitFor(() => [...document.querySelectorAll('.lr-pop-anchor, .lr-pop, .lr-popup')].find(el => el.textContent.includes(exampleTranslation)), '划词译文未显示');
  } finally {
    hidePoint();
  }
}

async function locateChapter() {
  await importPaper();
  window.getSelection()?.removeAllRanges();
  const tab = await waitFor(() => document.getElementById('lr-tab-chapters'), '逐章精读入口未就绪');
  tab.click();
  const heading = await waitFor(
    () => [...document.querySelectorAll('.lrcp-tick')].find(button => (button.getAttribute('aria-label') || '').includes('Return to the Source')),
    '章节目录未加载',
    30000,
  );
  const rect = heading.getBoundingClientRect();
  pointAt((rect.left + rect.right) * .5, (rect.top + rect.bottom) * .5);
  await pace(260);
  heading.click();
  try {
    await waitFor(() => originalPage(2)?.querySelector('.lr-coordinate-focus'), '第二章的原文锚点未显示');
    await new Promise(resolve => setTimeout(resolve, 290));
    const mark = originalPage(2)?.querySelector('.lr-coordinate-focus');
    const viewport = document.querySelector('.lr-source-body')?.getBoundingClientRect();
    const box = mark?.getBoundingClientRect();
    if (!box || !viewport || box.top < viewport.top - 1 || box.bottom > viewport.bottom + 1) {
      throw new Error('第二章的锚点未进入原文视口');
    }
  } finally {
    hidePoint();
  }
}

document.addEventListener('click', event => {
  if (event.target.matches?.('input[type="file"]')) {
    event.preventDefault();
    importPaper().catch(() => send('gloss-preview-notice', '示例 PDF 未打开，可以重新开始。'));
  }
}, true);

document.addEventListener('change', event => {
  if (event.target.matches?.('input[type="file"]') && !builtInInput) {
    event.stopImmediatePropagation();
    event.target.value = '';
  }
}, true);

document.addEventListener('drop', event => {
  if (dragFixtures.has(event.dataTransfer)) return;
  if (event.dataTransfer?.files.length) {
    event.preventDefault();
    event.stopImmediatePropagation();
    send('gloss-preview-notice', '请使用上方的「导入 PDF」体验内置示例。');
  }
}, true);

window.__ModuleLoader__ = {
  load(module) {
    const plugin = module.factory(name => {
      if (name === 'react') return React;
      throw new Error('Unknown preview dependency');
    });
    plugin.apply({
      slots: {
        inject(_slot, register) { register(); },
        register(options, Component) {
          if (options.name === 'main') {
            ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(Component));
          }
          return () => {};
        },
      },
    });
    const actions = { import: importPaper, translate: translateSample, locate: locateChapter };
    window.glossPreview = Object.freeze({
      waitForHome() {
        return waitFor(() => document.querySelector('.lr-welcome[data-library-open="false"]'), 'Gloss 主页没有打开');
      },
      run(action) {
        const perform = Object.hasOwn(actions, action) ? actions[action] : null;
        return perform ? perform() : Promise.reject(new Error('Unknown preview action'));
      },
    });
    send('gloss-preview-ready');
  },
};
