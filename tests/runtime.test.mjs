import test from 'node:test'
import assert from 'node:assert/strict'
import {Readable} from 'node:stream'
import {EventEmitter} from 'node:events'
import {pathToFileURL} from 'node:url'
import path from 'node:path'
import {root} from './helpers.mjs'
const backend=await import(pathToFileURL(path.join(root,'index.js')).href)
function setup(stream=async function*(){throw Error('Unexpected model call')}){const routes=new Map(),cleanup=[];let calls=0;const ctx={effect(fn){cleanup.push(fn())},webServer:{register(entry){assert.equal(entry.kind,'exact');assert.ok(!routes.has(entry.path));routes.set(entry.path,entry.handler);return()=>routes.delete(entry.path)}},get(name){if(name==='agentDefaultModel')return{currentSelection:()=>({provider:'test-provider',model:'test-model'})};return null},llm:{async *stream(options){calls++;yield*stream(options)}}};backend.apply(ctx);return{routes,cleanup,get calls(){return calls}}}
function request(value,headers={}){return Object.assign(Readable.from([Buffer.from(JSON.stringify(value))]),{headers:{host:'localhost:9999',...headers}})}
function response(){const res=new EventEmitter();res.headersSent=false;res.writableEnded=false;res.parts=[];res.writeHead=(status,headers)=>{res.status=status;res.headers=headers;res.headersSent=true};res.write=chunk=>{res.parts.push(String(chunk));return true};res.flushHeaders=()=>{};res.end=chunk=>{if(chunk!=null)res.parts.push(String(chunk));res.writableEnded=true;res.emit('ended')};res.done=new Promise(resolve=>res.once('ended',resolve));return res}
async function invoke(env,path,value={},headers={}){const handler=env.routes.get(path);assert.ok(handler,'registered route '+path);const res=response();handler(request(value,headers),res);await res.done;return res}
test('plugin registers only exact routes without executing models; disposal unregisters all',()=>{const env=setup();assert.ok(env.routes.has('/api/literature/translate'));assert.ok(env.routes.has('/api/literature/structure'));assert.ok(env.routes.has('/api/literature/context'));assert.equal(env.calls,0);assert.ok(![...env.routes.keys()].some(value=>value.includes('..')||value.includes('*')));for(const cleanup of env.cleanup)cleanup();assert.equal(env.routes.size,0)})
test('health and local formula assets are available without model calls',async()=>{const env=setup(),health=await invoke(env,'/api/literature/health');assert.equal(health.status,200);const body=JSON.parse(health.parts.join(''));assert.equal(body.ok,true);assert.match(body.model,/test-provider/);assert.ok(Number.isInteger(body.structureParserVersion));const asset=[...env.routes.keys()].find(value=>/gloss-math\/katex-.*\.min\.js$/.test(value));assert.ok(asset);const rendered=await invoke(env,asset);assert.equal(rendered.status,200);assert.match(rendered.headers['content-type'],/javascript/);assert.ok(Number(rendered.headers['content-length'])>10000);assert.equal(env.calls,0)})
test('foreign-origin translation is rejected before reading or invoking a model',async()=>{const env=setup(),res=await invoke(env,'/api/literature/translate',{text:'Synthetic fixture only'},{origin:'https://foreign.invalid'});assert.equal(res.status,403);assert.equal(env.calls,0)})
test('disconnect aborts translation stream and the request stays bounded to the selected passage',{timeout:2000},async()=>{let options,observedAbort=false,ready,abortReady;const first=new Promise(resolve=>ready=resolve),aborted=new Promise(resolve=>abortReady=resolve);const env=setup(async function*(value){options=value;yield{type:'text-delta',text:'译文'};ready();await new Promise(resolve=>{if(value.signal.aborted)resolve();else value.signal.addEventListener('abort',resolve,{once:true})});observedAbort=value.signal.aborted;abortReady();yield{type:'finish',reason:{kind:'aborted'}}});const res=response();env.routes.get('/api/literature/translate')(request({text:'Synthetic selected passage'}),res);await first;res.emit('close');await aborted;assert.equal(env.calls,1);assert.equal(observedAbort,true);assert.equal(options.signal.aborted,true);assert.ok(options.maxTokens>0);assert.ok(options.messages[0].content[0].text.endsWith('Synthetic selected passage'));assert.ok(!options.messages[0].content[0].text.includes('structure'));assert.match(res.parts.join(''),/event: delta/)})

test('legal long translation has enough bounded output space while short selections keep the prior ceiling',async()=>{const budgets=[];for(const text of ['A short synthetic selection','a'.repeat(4000)]){const env=setup(async function*(options){budgets.push(options.maxTokens);yield{type:'text-delta',text:'Complete controlled translation'};yield{type:'finish',reason:{kind:'stop'}}});const res=await invoke(env,'/api/literature/translate',{text});assert.equal(res.status,200);assert.match(res.parts.join(''),/event: done/)}assert.equal(budgets[0],700);assert.ok(budgets[1]>700&&budgets[1]<=6144)})
test('token exhaustion keeps partial output but never emits successful done',async()=>{const env=setup(async function*(){yield{type:'text-delta',text:'Partial controlled translation'};yield{type:'finish',reason:{kind:'length'}}}),res=await invoke(env,'/api/literature/translate',{text:'Synthetic source'});const body=res.parts.join('');assert.match(body,/Partial controlled translation/);assert.match(body,/event: error/);assert.match(body,/OUTPUT_TRUNCATED/);assert.doesNotMatch(body,/event: done/)})

test('local selection answers scale their bounded output budget with the chosen passage and question', async () => {
  for (const [kind, previousCeiling] of [['ask', 900], ['explain', 1100]]) {
    const budgets = []
    for (const text of ['A short passage with one term.', 'Longer technical passage. '.repeat(153).trim()]) {
      const env = setup(async function* (options) {
        budgets.push(options.maxTokens)
        assert.equal(options.reasoningEffort, 'off')
        assert.match(options.system, /完整核心答案/)
        assert.match(options.system, /不能当作原文证据/)
        yield { type: 'text-delta', text: '完整解释。' }
        yield { type: 'finish', reason: { kind: 'stop' } }
      })
      const res = await invoke(env, '/api/literature/selection', { kind, text, question: '它是什么？' })
      assert.equal(env.calls, 1)
      assert.match(res.parts.join(''), /event: done/)
    }
    assert.ok(budgets[0] > previousCeiling && budgets[0] < budgets[1] && budgets[1] <= 2800)
  }
  const budgets = []
  for (const question of ['它是什么？', '请解释当前选区的符号和成立条件。'.repeat(200)]) {
    const env = setup(async function* (options) {
      budgets.push(options.maxTokens)
      yield { type: 'text-delta', text: '完整回答。' }
      yield { type: 'finish', reason: { kind: 'stop' } }
    })
    await invoke(env, '/api/literature/selection', { kind: 'ask', text: 'Longer technical passage. '.repeat(153).trim(), question })
  }
  assert.ok(budgets[0] < budgets[1] && budgets[1] <= 2800)
})

test('local selection keeps one copy of partial output on token exhaustion and does not silently retry', async () => {
  const partial = '这是已经生成的部分正文。'
  for (const kind of ['ask', 'explain']) {
    for (const firstDelta of [partial, null, '\n  ']) {
      const env = setup(async function* () {
        if (firstDelta !== null) yield { type: 'text-delta', text: firstDelta }
        yield { type: 'block-end', block: { type: 'text', text: partial } }
        yield { type: 'finish', reason: { kind: 'length' } }
      })
      const res = await invoke(env, '/api/literature/selection', { kind, text: 'A source passage for the selected term.' })
      const sse = res.parts.join('')
      assert.equal(env.calls, 1)
      assert.equal(sse.split(partial).length - 1, 1)
      assert.ok(sse.indexOf('event: delta') > sse.indexOf('event: context'))
      assert.ok(sse.indexOf('event: error') > sse.indexOf('event: delta'))
      assert.match(sse, /"code":"OUTPUT_TRUNCATED"/)
      assert.doesNotMatch(sse, /event: done/)
    }
  }
})

test('explicit compact selection keeps the prompt evidence and budget; chapter and research ignore the flag', async () => {
  const id = 'pdf-' + 'a'.repeat(64)
  const text = 'This synthetic passage explains the observations, the comparison baseline, and the conditions on its conclusion.'
  const paper = { id, title: 'Synthetic fixture', text: '1 Method\n\n' + text }
  const anchor = quote => ({ documentId: id, status: 'located', quoteVerified: true, quote, page: 0, bbox: [10, 20, 200, 34], pdfBBox: [10, 20, 200, 34] })
  const structure = { schemaVersion: 2, parserVersion: 6, documentId: id, coordinateSystem: { id: 'mupdf-unrotated-crop-pt-v1' }, pageGeometry: [], references: [], sections: [{ id: 'method', anchorId: 'heading-method', heading: '1 Method', level: 1, page: 0, anchor: anchor('1 Method'), paragraphs: [{ id: 'method-p', text, page: 0, anchor: anchor(text) }] }] }
  const requests = []
  const answers = []
  const env = setup(async function* (options) {
    requests.push(options)
    yield { type: 'text-delta', text: '已按证据回答。' }
    yield { type: 'finish', reason: { kind: 'stop' } }
  })
  for (const body of [
    { kind: 'ask', text, question: '原文的成立条件是什么？', paper, structure },
    { kind: 'ask', text, question: '原文的成立条件是什么？', paper, structure, compactAnswer: true },
    { kind: 'ask', purpose: 'research', text, question: '怎样验证？', paper, structure, compactAnswer: true },
    { kind: 'ask', purpose: 'chapter', chapter: { id: 'method' }, paper, structure, compactAnswer: true },
  ]) {
    const res = await invoke(env, '/api/literature/selection', body)
    assert.equal(res.status, 200)
    assert.match(res.parts.join(''), /event: done/)
    answers.push(res.parts.join('').match(/event: context\ndata: (.*)\n/)[1])
  }
  const [normal, compact, research, chapter] = requests
  assert.equal(env.calls, 4)
  assert.equal(compact.maxTokens, normal.maxTokens)
  assert.deepEqual(compact.messages, normal.messages)
  assert.equal(answers[0], answers[1])
  assert.doesNotMatch(normal.system, /读者主动选择精简重答/)
  assert.match(compact.system, /读者主动选择精简重答/)
  for (const request of [normal, compact]) {
    assert.match(request.system, /就注明“选区原文”，不要借用附近的编号/)
    assert.match(request.system, /选区含多个编号时不逐条复述文献表/)
  }
  assert.equal(research.maxTokens, 1800)
  assert.equal(chapter.maxTokens, 4000)
  assert.doesNotMatch(research.system + chapter.system, /读者主动选择精简重答|不要借用附近的编号/)
})

test('research experiment requests get bounded planning space while fact checks keep their usual budget', async () => {
  const calls = []
  const env = setup(async function* (options) {
    calls.push(options)
    yield { type: 'text-delta', text: '按已有证据答复。' }
    yield { type: 'finish', reason: { kind: 'stop' } }
  })
  for (const question of ['请说明正文的模块关系。', '请设计对照实验，说明如何验证这项改进。']) {
    const result = await invoke(env, '/api/literature/selection', {
      kind: 'ask', purpose: 'research', text: 'Synthetic paper', question,
    })
    assert.match(result.parts.join(''), /event: done/)
  }
  assert.deepEqual(calls.map(call => call.maxTokens), [1800, 2600])
  assert.ok(calls.every(call => call.reasoningEffort === 'off'))
})

test('research shorthand is scoped at the selection route without changing passage questions', async () => {
  const id = 'pdf-' + 'c'.repeat(64)
  const intro = 'This introduction is only general background and does not provide the processing rule for this particular method.'
  const method = 'Each object uses a bounded kernel to describe its spatial contribution, which is projected before computing a weighted sum.'
  const sections = [
    { id: 'intro', heading: '1. Introduction', page: 0, paragraphs: [{ id: 'intro-p', page: 0, text: intro }] },
    { id: 'method', heading: '3.1. Processing Method', page: 2, paragraphs: [{ id: 'method-p', page: 2, text: method }] },
  ]
  const paper = { id, title: 'Synthetic paper', text: sections.map(section => section.heading + '\n' + section.paragraphs[0].text).join('\n\n') }
  const structure = { documentId: id, sections }
  const prompts = []
  const env = setup(async function* (options) {
    prompts.push(options.messages[0].content[0].text)
    yield { type: 'text-delta', text: '按已有证据答复。' }
    yield { type: 'finish', reason: { kind: 'stop' } }
  })
  const question = '3.1讲解的是啥'
  const response = await invoke(env, '/api/literature/selection', { kind: 'ask', purpose: 'research', text: paper.title, question, paper, structure })
  assert.match(response.parts.join(''), /event: done/)
  await invoke(env, '/api/literature/selection', { kind: 'ask', text: intro, selection: intro, question, paper, structure })
  assert.ok(prompts[0].includes(method))
  assert.ok(prompts[0].includes(intro))
  assert.match(prompts[0], /完整提取原文/)
  assert.match(prompts[0], /本次问题范围/)
  assert.ok(prompts[1].includes(intro))
  assert.doesNotMatch(prompts[1], /本次问题范围/)
})

test('research does not call the model for metadata-only or oversized papers without a complete section', async () => {
  const env = setup()
  const text = 'Synthetic paper'
  for (const [paper, mode] of [[{ title: text, text: '' }, 'no-text'], [{ title: text, pages: ['unindexed text '.repeat(4000)], hasPdf: true, expectedPages: 1 }, 'unavailable']]) {
    const response = await invoke(env, '/api/literature/selection', { kind: 'ask', purpose: 'research', text, paper, question: '第二部分讲的啥' })
    const events = response.parts.join('')
    assert.match(events, /event: done/)
    assert.match(events, new RegExp('"mode":"' + mode + '"'))
    assert.doesNotMatch(events, /unindexed text/)
  }
  assert.equal(env.calls, 0)
})

test('a skim card retains its verified quote and drops a comment with an unsupported measurement', async () => {
  const a = 'The measured error was 6. 1% at an installation angle of 66°. '
  const b = 'The trial achieved a signed displacement of -20 μm.'
  const cards = [
    { type: 'result', quote: a, comment: '该条件下相对误差为6.1%，安装相位为66°。' },
    { type: 'result', quote: b, comment: '本次测得20 µm。' },
  ]
  const env = setup(async function* () {
    yield { type: 'text-delta', text: JSON.stringify(cards) }
    yield { type: 'finish', reason: { kind: 'stop' } }
  })
  const response = await invoke(env, '/api/literature/highlights', { paper: { text: a + b } })
  const items = JSON.parse(response.parts.join('')).items
  assert.deepEqual(items.map(item => item.quote), [a.trim(), b])
  assert.deepEqual(items.map(item => item.comment), [cards[0].comment, ''])
})

test('a requested index derivation requires verified evidence of one-position decoder shift', async () => {
  const id = 'pdf-' + 'b'.repeat(64)
  const text = 'In the decoder, the output embeddings are offset by one position so predictions depend only on known outputs at positions less than the current position.'
  const paper = { id, title: 'Synthetic sequence model', text }
  const prompts = []
  const env = setup(async function* (options) {
    prompts.push(options.messages[0].content[0].text)
    yield { type: 'text-delta', text: '已答。' }
    yield { type: 'finish', reason: { kind: 'stop' } }
  })
  for (const quoteVerified of [true, false]) {
    const anchor = { documentId: id, status: 'located', quoteVerified, page: 0, quote: text }
    await invoke(env, '/api/literature/selection', {
      purpose: 'research', kind: 'ask', text: paper.title, paper,
      question: '右移后的当前位置输入是什么？',
      structure: { documentId: id, sections: [{ id: 'method', heading: 'Method', paragraphs: [{ id: 'p', page: 0, text, anchor }] }] },
    })
  }
  assert.match(prompts[0], /【索引推导】\[S1\].*y_\(i-1\)/)
  assert.doesNotMatch(prompts[1], /【索引推导】/)
})
