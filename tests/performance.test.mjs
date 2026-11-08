import test from 'node:test'
import assert from 'node:assert/strict'
import vm from 'node:vm'
import {fakeReact,loadClient,read,sourceBlock} from './helpers.mjs'
test('first translated text is notified before any batching timer, while later bursts remain batched',async()=>{let control,sequence=0;const jobs=new Map(),encoder=new TextEncoder();const client=loadClient({setTimeout(fn,delay){const id=++sequence;jobs.set(id,{fn,delay});return id},clearTimeout:id=>jobs.delete(id),fetch:async()=>new Response(new ReadableStream({start(controller){control=controller}}),{status:200})});const record=client.api.ensureTranslation('A synthetic passage for first-text latency','A').record,events=[];record.listeners.add(value=>events.push(value.text));const send=(event,data)=>control.enqueue(encoder.encode('event: '+event+'\ndata: '+JSON.stringify(data)+'\n\n'));send('delta',{text:'首'});for(let i=0;i<30&&!record.text;i++)await Promise.resolve();assert.equal(record.text,'首');assert.deepEqual(events,['首']);for(let i=0;i<10;i++)send('delta',{text:'续'});for(let i=0;i<60;i++)await Promise.resolve();assert.equal(events.length,1);assert.equal(jobs.size,1);for(const[id,job]of jobs){jobs.delete(id);job.fn()}assert.equal(events.length,2);assert.equal(events[1],'首'+'续'.repeat(10));send('done',{text:'完整译文'});for(let i=0;i<30&&!record.done;i++)await Promise.resolve();control.close();assert.equal(record.done,true);assert.equal(jobs.size,0)})
test('ordinary pointer-anchored card placement does not measure obsolete orb collisions',()=>{const source=read('client.js'),body=sourceBlock(source,'      function popupPlacement(','\n      function updatePopupPlacement(');let queries=0;const host={offsetWidth:620,offsetHeight:700,clientHeight:700,scrollTop:300,scrollLeft:0,getBoundingClientRect:()=>({left:0,right:620,top:0,bottom:700,width:620,height:700}),querySelector(){queries++;throw Error('Unexpected obsolete orb scan')},querySelectorAll(){queries++;throw Error('Unexpected obsolete orb scan')}};const env={Math,Number,Boolean,Array,sourceRef:{current:host},popupOriginRef:{current:{page:1,orbSide:'left'}}};const place=vm.runInNewContext(body+';popupPlacement',env);for(let i=0;i<20;i++){const result=place({left:40,right:320,top:100+i*12,bottom:115+i*12,pointer:{x:140,y:130+i*12}},70+i*12,false);assert.ok(result.viewportLeft>=0&&result.viewportLeft+result.width<=620);assert.ok(result.viewportTop>=0&&result.viewportTop+70+i*12<=700)}assert.equal(queries,0)})

test('changing PDF fit scale keeps the existing canvas component mounted', () => {
  const source = sourceBlock(read('client.js'), '    function PdfViewer(', '    const MemoPdfViewer')
  const { createElement: h, useRef, useEffect } = fakeReact()
  const PdfPage = () => null
  const sizes = [{ num: 1, width: 600, height: 800 }, { num: 2, width: 600, height: 800 }]
  const useState = () => [sizes]
  const pdfAppearance = { mode: value => value }
  const view = vm.runInNewContext(source + ';PdfViewer', { h, useState, useRef, useEffect, PdfPage, pdfAppearance })
  const pages = (documentId, scale) => view({ doc: {}, documentId, scale }).props.children.filter(item => item.type === PdfPage)
  const before = pages('first', 1)
  const after = pages('first', 1.5)
  assert.equal(before.length, 2)
  assert.equal(before[0].key, after[0].key)
  assert.equal(before[1].key, after[1].key)
  assert.equal(after[0].props.width, 900)
  assert.notEqual(after[0].key, after[1].key)
  assert.notEqual(after[0].key, pages('second', 1.5)[0].key)
})

test('PDF loading disables dynamic code generation and retains the original bytes', () => {
  const client = read('client.js')
  const source = sourceBlock(client, '    function loadPdfDocument(', '\n    async function paintLibraryPdfPage(')
  const load = vm.runInNewContext(source + ';loadPdfDocument')
  const bytes = new Uint8Array([37, 80, 68, 70, 45])
  const options = load({ getDocument: value => value }, bytes)
  assert.equal(options.isEvalSupported, false)
  assert.deepEqual(options.data, bytes)
  assert.notEqual(options.data.buffer, bytes.buffer)
  assert.equal((client.match(/\bpdfjs\.getDocument\(/g) || []).length, 1)
})

test('divider resizes the source live and commits only when the captured pointer is released', () => {
  const source = sourceBlock(read('client.js'), '      function stopPaneResize(', '\n      useEffect(() => () => stopPaneResize(false)')
  const listeners = new Map(), handleListeners = new Map(), frames = new Map()
  const commits = [], resizing = []
  const viewport = {
    addEventListener: (name, handler) => listeners.set(name, handler),
    removeEventListener: name => listeners.delete(name),
    requestAnimationFrame: callback => { const id = Symbol(); frames.set(id, callback); return id },
    cancelAnimationFrame: id => frames.delete(id),
  }
  const paper = { offsetWidth: 460, style: { width: '460px' } }
  const handle = {
    parentElement: { clientWidth: 900 }, previousElementSibling: paper,
    addEventListener: (name, handler) => handleListeners.set(name, handler),
    removeEventListener: name => handleListeners.delete(name),
    setPointerCapture(id) { this.captured = id },
    hasPointerCapture(id) { return this.captured === id },
    releasePointerCapture() { this.captured = null },
  }
  const body = { style: { cursor: '', userSelect: '' } }
  const startResize = vm.runInNewContext(source + ';startResize', {
    window: viewport, document: { body }, paneResizeRef: { current: null },
    paperRef: { current: { id: 'p' } }, epochRef: { current: 1 }, sessionMountedRef: { current: true },
    readerChromeFoldRef: { current: {} }, sessionCollectAnimations: { current: new Set() },
    cancelSessionDrag() {}, cancelPopupMotion() {}, cancelReaderChromeFold() {},
    setPaneWidth: width => commits.push(width), setPaneResizing: value => resizing.push(value),
  })
  const down = () => startResize({ button: 0, pointerId: 1, clientX: 460, isTrusted: true, currentTarget: handle, preventDefault() {} })
  const move = (pointerId, clientX) => listeners.get('pointermove')({ pointerId, clientX })
  const paint = () => { for (const [id, callback] of frames) { frames.delete(id); callback() } }

  down()
  assert.equal(handle.captured, 1)
  move(2, 500)
  assert.equal(frames.size, 0)
  move(1, 500)
  move(1, 515)
  assert.equal(frames.size, 1)
  paint()
  assert.equal(paper.style.width, '515px')
  assert.deepEqual(commits, [])
  listeners.get('pointerup')({ pointerId: 1, clientX: 530 })
  assert.equal(paper.style.width, '530px')
  assert.deepEqual(commits, [530])

  paper.offsetWidth = 530
  down()
  move(1, 700)
  paint()
  assert.equal(paper.style.width, '608px')
  handleListeners.get('lostpointercapture')({ pointerId: 1 })
  assert.equal(paper.style.width, '530px')
  assert.deepEqual(commits, [530])
  assert.deepEqual(resizing, [true, false, true, false])
  assert.equal(listeners.size + handleListeners.size, 0)
  assert.deepEqual(body.style, { cursor: '', userSelect: '' })
})
