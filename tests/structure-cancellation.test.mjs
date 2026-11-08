import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import vm from 'node:vm'
import { EventEmitter } from 'node:events'
import { createHash } from 'node:crypto'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { root, read } from './helpers.mjs'

const source = process.env.GLOSS_STRUCTURE_HANDLER_SOURCE ? fs.readFileSync(process.env.GLOSS_STRUCTURE_HANDLER_SOURCE, 'utf8') : read('index.js')
const bodyOf = label => Buffer.from('%PDF-controlled-offline-fixture-' + label)
const ownerOf = bytes => 'pdf-' + createHash('sha256').update(bytes).digest('hex')
const tick = () => new Promise(resolve => setImmediate(resolve))
async function until(check, label) { for (let i = 0; i < 100; i++) { if (check()) return; await tick() } throw Error('Offline handler did not settle: ' + label) }
function response() {
  const res = new EventEmitter()
  Object.assign(res, { headersSent: false, writableEnded: false, destroyed: false, parts: [], writes: 0 })
  res.writeHead = (status, headers) => { res.writes++; res.status = status; res.headers = headers; res.headersSent = true }
  res.end = chunk => { if (chunk != null) res.parts.push(String(chunk)); res.writableEnded = true; res.emit('close') }
  res.disconnect = () => { res.destroyed = true; res.emit('close') }
  return res
}
function request(bytes, options = {}) {
  const req = new EventEmitter()
  Object.assign(req, { headers: { host: 'localhost:9999', ...(options.headers || {}) }, aborted: Boolean(options.aborted) })
  req[Symbol.asyncIterator] = async function* () {
    if (options.beforeRead) await options.beforeRead(req)
    if (bytes.length) yield bytes
    if (options.afterRead) await options.afterRead(req)
    if (options.readError) throw options.readError
  }
  return req
}
function setup(options = {}) {
  const routes = new Map(), files = new Map(), calls = [], writes = [], unlinks = []
  let uuid = 0, modelCalls = 0
  const windows = options.platform === 'win32'
  const fsp = {
    async writeFile(file, bytes) { files.set(file, Buffer.from(bytes)); writes.push(file); if (options.onWrite) await options.onWrite(file, bytes) },
    async unlink(file) { unlinks.push(file); files.delete(file); if (options.onUnlink) await options.onUnlink(file); if (options.unlinkError) throw options.unlinkError },
    async readFile() { throw Error('Unexpected asset access') },
  }
  const execFile = (bin, args, execOptions, callback) => {
    const bytes = files.get(args.at(-1))
    assert.ok(bytes, 'child receives the temporary PDF created for this request')
    const result = { schemaVersion: 2, parserVersion: 6, documentId: ownerOf(bytes), coordinateSystem: { id: 'mupdf-unrotated-crop-pt-v1' }, sections: [], references: [], pageGeometry: [] }
    const call = { bin, args, options: execOptions, result, aborted: false, finished: false }
    let onAbort
    call.finish = (error = null, stdout = JSON.stringify(result)) => {
      if (call.finished) return
      call.finished = true
      if (onAbort) execOptions.signal.removeEventListener('abort', onAbort)
      callback(error, stdout)
    }
    if (execOptions.signal) {
      onAbort = () => {
        call.aborted = true
        if (options.ignoreAbort) return
        call.finish(Object.assign(Error('The operation was aborted'), { name: 'AbortError', code: 'ABORT_ERR' }), '')
      }
      execOptions.signal.addEventListener('abort', onAbort, { once: true })
      if (execOptions.signal.aborted) onAbort()
    }
    calls.push(call)
    if (options.child) options.child(call, calls.length)
    else queueMicrotask(() => call.finish())
    return new EventEmitter()
  }
  // Existing VM test seam: replace import bindings, keeping the full backend
  // body and public apply registration. No internal handler export is added.
  const headerEnd = source.indexOf('export const name =')
  assert.ok(headerEnd > 0, 'backend header boundary must remain explicit')
  const header = source.slice(0, headerEnd)
  const imports = header.match(/^import [^\n]+\n/gm) || []
  assert.equal(imports.length, 9, 'backend import seam must remain explicit')
  const code = (header.replace(/^import [^\n]+\n/gm, '') + source.slice(headerEnd)).replace(/^export /gm, '').replaceAll('import.meta.url', JSON.stringify(pathToFileURL(path.join(root, 'index.js')).href))
  const context = {
    execFile, fsp,
    os: {
      tmpdir: () => windows ? 'C:/fixture-temp' : '/offline-structure-tests',
      homedir: () => windows ? 'C:/fixture-home' : '/fixture-home',
    },
    path: windows ? path.win32 : path.posix, createHash,
    randomUUID: () => 'fixture-' + (++uuid), fileURLToPath,
    buildPaperContext() { throw Error('Unexpected paper context call') }, buildChapterReadingContext() { throw Error('Unexpected chapter context call') },
    createLibraryResolver() { return null },
    process: { platform: options.platform || 'darwin', env: options.env ?? { LITERATURE_PYTHON: '/fixture/python-primary' } },
    Buffer, URL, AbortController, setTimeout, clearTimeout, console,
  }
  vm.runInNewContext(code, context, { filename: 'index.js', timeout: 3000 })
  context.apply({ effect(fn) { fn() }, webServer: { register(entry) { routes.set(entry.path, entry.handler); return () => routes.delete(entry.path) } }, llm: { stream() { modelCalls++; throw Error('Unexpected model call') } } })
  return {
    calls, files, writes, unlinks, get modelCalls() { return modelCalls },
    invoke(bytes, reqOptions = {}, res = response(), route = 'structure') {
      const req = request(bytes, reqOptions)
      routes.get('/api/literature/' + route)(req, res)
      return { req, res }
    },
    async settle(label) { await until(() => files.size === 0 && calls.every(call => call.finished), label); await tick() },
    async drain() { for (let i = 0; i < 30; i++) { calls.filter(call => !call.finished).forEach(call => call.finish()); await tick(); if (files.size === 0 && calls.every(call => call.finished)) return } },
  }
}

test('structure response disconnect aborts its Python child without fallback, success, or route 500', async () => {
  const env = setup({ child() {} }), { res } = env.invoke(bodyOf('cancel'))
  try {
    await until(() => env.calls.length === 1, 'first child')
    const first = env.calls[0]
    res.disconnect()
    await tick()
    assert.equal(first.aborted, true, 'response close must cancel the current Python child')
    assert.ok(first.options.signal instanceof AbortSignal)
    await env.settle('cancelled child cleanup')
    assert.equal(first.options.signal.aborted, true)
    assert.equal(first.aborted, true)
    assert.equal(env.calls.length, 1, 'cancel never starts a fallback interpreter')
    assert.equal(res.writes, 0, 'apply wrapper must not send even a 500 after cancellation')
    assert.equal(res.parts.length, 0)
    assert.equal(res.writableEnded, false)
    assert.deepEqual(env.unlinks, env.writes)
    assert.equal(res.listenerCount('close'), 0)
    assert.equal(env.modelCalls, 0)
  } finally { await env.drain() }
})

test('structure child error after disconnect cannot start fallback or send route 500', async () => {
  const env = setup({ child() {} }), { res } = env.invoke(bodyOf('cancel-before-error'))
  try {
    await until(() => env.calls.length === 1, 'pending failing child')
    res.disconnect()
    env.calls[0].finish(Object.assign(Error('controlled late binary error'), { code: 'ENOENT' }), '')
    await tick(); await tick()
    assert.equal(env.calls.length, 1, 'a disconnected request cannot launch the next interpreter')
    assert.equal(res.writes, 0)
    await env.settle('late failure cleanup')
    assert.equal(res.listenerCount('close'), 0)
  } finally { await env.drain() }
})

test('structure successful response close does not abort a completed child', async () => {
  const env = setup(), { res } = env.invoke(bodyOf('normal'))
  await until(() => res.writableEnded, 'successful response')
  await env.settle('success cleanup')
  assert.equal(res.status, 200)
  assert.equal(JSON.parse(res.parts.join('')).documentId, ownerOf(bodyOf('normal')))
  assert.equal(env.calls.length, 1)
  assert.equal(env.calls[0].options.signal.aborted, false)
  assert.equal(res.listenerCount('close'), 0)
  assert.deepEqual(env.unlinks, env.writes)
})

test('structure ignores normal IncomingMessage close after the request body', async () => {
  const env = setup(), { res } = env.invoke(bodyOf('request-close'), { afterRead(req) { req.emit('close') } })
  await until(() => res.writableEnded, 'normal request close')
  await env.settle('normal request close cleanup')
  assert.equal(res.status, 200)
  assert.equal(env.calls[0].options.signal.aborted, false)
})

for (const kind of ['destroyed-response', 'aborted-request', 'already-ended-response']) {
  test('structure skips spawning for pre-existing ' + kind, async () => {
    const env = setup(), res = response()
    if (kind === 'destroyed-response') res.destroyed = true
    if (kind === 'already-ended-response') res.writableEnded = true
    env.invoke(bodyOf(kind), { aborted: kind === 'aborted-request' }, res)
    await tick(); await tick()
    assert.equal(env.calls.length, 0)
    assert.equal(env.writes.length, 0)
    assert.equal(res.writes, 0)
    assert.equal(res.listenerCount('close'), 0)
  })
}

test('structure catches a silent disconnect after readBody before any temp write or spawn', async () => {
  const env = setup(), res = response()
  env.invoke(bodyOf('after-body'), { afterRead() { res.destroyed = true } }, res)
  await tick(); await tick()
  assert.equal(env.calls.length, 0)
  assert.equal(env.writes.length, 0)
  assert.equal(res.writes, 0)
  assert.equal(res.listenerCount('close'), 0)
})

test('structure catches a silent disconnect during temp write, cleans file, and never spawns', async () => {
  const res = response(), env = setup({ onWrite() { res.destroyed = true } })
  env.invoke(bodyOf('during-write'), {}, res)
  await until(() => env.unlinks.length === 1, 'write disconnect cleanup')
  assert.equal(env.calls.length, 0)
  assert.equal(env.files.size, 0)
  assert.equal(res.writes, 0)
  assert.equal(res.listenerCount('close'), 0)
})

test('structure checks cancellation again when an already-completing child returns success', async () => {
  const env = setup({ child() {}, ignoreAbort: true }), { res } = env.invoke(bodyOf('late-success'))
  try {
    await until(() => env.calls.length === 1, 'late success child')
    env.calls[0].finish()
    res.disconnect()
    await env.settle('late success cancelled cleanup')
    assert.equal(res.writes, 0)
    assert.equal(env.calls.length, 1)
    assert.equal(res.listenerCount('close'), 0)
  } finally { await env.drain() }
})

test('structure keeps bad-binary fallback and passes the same un-aborted signal to its replacement', async () => {
  const env = setup({ child(call, n) { queueMicrotask(() => n === 1 ? call.finish(Object.assign(Error('missing controlled binary'), { code: 'ENOENT' }), '') : call.finish()) } }), { res } = env.invoke(bodyOf('fallback'))
  await until(() => res.writableEnded, 'binary fallback success')
  await env.settle('binary fallback cleanup')
  assert.equal(res.status, 200)
  assert.equal(env.calls.length, 2)
  assert.equal(env.calls[0].options.signal, env.calls[1].options.signal)
  assert.equal(env.calls[1].options.signal.aborted, false)
  assert.equal(env.unlinks.length, 1)
  assert.equal(res.listenerCount('close'), 0)
})

function missingBinary() {
  return Object.assign(new Error('Missing test interpreter'), { code: 'ENOENT' })
}

function missingPythonModule(name) {
  return Object.assign(new Error("Command failed: fixture interpreter\nModuleNotFoundError: No module named '" + name + "'"), { code: 1 })
}

test('Windows structure falls back from configured paths through the Python 3 launcher and preserves UTF-8', async () => {
  const explicit = path.win32.normalize('C:/Python 配置/python.exe')
  const dshHome = 'D:/DSH Home'
  const conda = 'C:/Conda 环境'
  const managed = path.win32.join(dshHome, 'dsh-runtimes', 'dsh-primary-runtime', 'dependencies', 'python', 'python.exe')
  const env = setup({
    platform: 'win32',
    env: { LITERATURE_PYTHON: explicit, DSH_HOME: dshHome, CONDA_PREFIX: conda, PYTHONIOENCODING: 'cp936' },
    child(call) {
      queueMicrotask(() => {
        if (call.bin === 'py.exe') call.finish(null, JSON.stringify({ ...call.result, title: '论文结构回归' }))
        else if (call.bin === managed) call.finish(missingPythonModule('fitz'), '')
        else call.finish(missingBinary(), '')
      })
    },
  })
  const { res } = env.invoke(bodyOf('windows-structure'))
  await until(() => res.writableEnded, 'Windows structure response')
  await env.settle('Windows structure cleanup')
  assert.equal(res.status, 200)
  assert.equal(JSON.parse(res.parts.join('')).title, '论文结构回归')
  assert.deepEqual(env.calls.map(call => call.bin), [
    explicit, path.win32.join(dshHome, 'gloss', 'python', 'Scripts', 'python.exe'),
    managed, path.win32.join(conda, 'python.exe'), 'python.exe', 'py.exe',
  ])
  assert.deepEqual(Array.from(env.calls.at(-1).args.slice(0, -2)), ['-3'])
  assert.match(env.calls.at(-1).args.at(-2), /[\\/]structure\.py$/)
  for (const call of env.calls) {
    assert.equal(call.options.env.PYTHONIOENCODING, 'utf-8')
    assert.equal(call.options.env.PYTHON_MANAGER_AUTOMATIC_INSTALL, 'false')
    assert.equal(call.options.windowsHide, true)
    assert.equal(call.options.signal, env.calls[0].options.signal)
  }
  assert.deepEqual(env.unlinks, env.writes)
})

for (const [route, missingModule] of [['structure', 'pymupdf'], ['extract', 'pypdf']]) {
  test('Windows ' + route + ' reports missing PDF modules after later interpreters are unavailable', async () => {
    const env = setup({
      platform: 'win32',
      env: {},
      child(call, attempt) {
        queueMicrotask(() => call.finish(attempt === 1 ? missingPythonModule(missingModule) : missingBinary(), ''))
      },
    })
    const { res } = env.invoke(bodyOf('windows-' + route + '-dependency'), {}, response(), route)
    await until(() => res.writableEnded, 'Windows missing dependency response')
    await env.settle('Windows missing dependency cleanup')
    assert.equal(res.status, 500)
    const body = JSON.parse(res.parts.join(''))
    assert.equal(body.code, 'PDF_PYTHON_DEPENDENCY')
    assert.match(body.error, /PyMuPDF/)
    assert.match(body.error, /LITERATURE_PYTHON/)
    assert.doesNotMatch(body.error, /ModuleNotFoundError|Missing test interpreter|fixture-home/)
    assert.deepEqual(env.calls.map(call => call.bin), [
      path.win32.join('C:/fixture-home', '.dsh', 'gloss', 'python', 'Scripts', 'python.exe'),
      path.win32.join('C:/fixture-home', '.dsh', 'dsh-runtimes', 'dsh-primary-runtime', 'dependencies', 'python', 'python.exe'),
      'python.exe', 'py.exe', 'python3.exe',
    ])
    assert.deepEqual(env.unlinks, env.writes)
  })
}

test('Windows extract sends Python 3 launcher arguments and returns UTF-8 PDF text', async () => {
  const text = '这里是一段包含中文符号与非 ASCII 字符的 PDF 文本。'.repeat(4)
  const env = setup({
    platform: 'win32',
    env: { PYTHONIOENCODING: 'cp936' },
    child(call) {
      queueMicrotask(() => call.bin === 'py.exe' ? call.finish(null, text) : call.finish(missingBinary(), ''))
    },
  })
  const { res } = env.invoke(bodyOf('windows-extract'), {}, response(), 'extract')
  await until(() => res.writableEnded, 'Windows extract response')
  await env.settle('Windows extract cleanup')
  assert.equal(res.status, 200)
  assert.equal(JSON.parse(res.parts.join('')).text, text)
  const call = env.calls.at(-1)
  assert.equal(call.bin, 'py.exe')
  assert.deepEqual(Array.from(call.args.slice(0, 2)), ['-3', '-c'])
  assert.equal(call.options.env.PYTHONIOENCODING, 'utf-8')
  assert.equal(call.options.windowsHide, true)
  assert.deepEqual(env.unlinks, env.writes)
})

test('structure preserves fallback for invalid parser output or wrong PDF binding', async () => {
  const env = setup({ child(call, n) { queueMicrotask(() => call.finish(null, n === 1 ? '{bad-json' : n === 2 ? JSON.stringify({ ...call.result, documentId: 'wrong-owner' }) : JSON.stringify(call.result))) } }), { res } = env.invoke(bodyOf('validate'))
  await until(() => res.writableEnded, 'validated fallback')
  await env.settle('validated fallback cleanup')
  assert.equal(res.status, 200)
  assert.equal(env.calls.length, 3)
  assert.equal(JSON.parse(res.parts.join('')).documentId, ownerOf(bodyOf('validate')))
})

test('structure terminal interpreter failure still sends the ordinary 500 and removes temp/listener', async () => {
  const env = setup({ child(call) { queueMicrotask(() => call.finish(Object.assign(Error('missing controlled binary'), { code: 'ENOENT' }), '')) } }), { res } = env.invoke(bodyOf('all-bad'))
  await until(() => res.writableEnded, 'all interpreter failure')
  await env.settle('failure cleanup')
  assert.equal(res.status, 500)
  assert.equal(env.calls.length, 8)
  assert.match(JSON.parse(res.parts.join('')).error, /结构解析失败/)
  assert.equal(env.unlinks.length, 1)
  assert.equal(res.listenerCount('close'), 0)
})

test('structure temp write failure cleans even a partially created file before the ordinary 500', async () => {
  const env = setup({ onWrite() { throw Error('controlled write failure') } }), { res } = env.invoke(bodyOf('write-error'))
  await until(() => res.writableEnded, 'temp write failure')
  assert.equal(res.status, 500)
  assert.equal(env.calls.length, 0)
  assert.equal(env.files.size, 0)
  assert.equal(env.unlinks.length, 1)
  assert.equal(res.listenerCount('close'), 0)
})

test('structure abort while reading request suppresses late route error and never writes a temp', async () => {
  const env = setup(), res = response()
  env.invoke(bodyOf('read-abort'), { afterRead(req) { req.aborted = true; res.disconnect() }, readError: Error('controlled request abort') }, res)
  await tick(); await tick()
  assert.equal(env.calls.length, 0)
  assert.equal(env.writes.length, 0)
  assert.equal(res.writes, 0)
  assert.equal(res.listenerCount('close'), 0)
})

test('structure empty and foreign-origin requests remain errors without any child', async () => {
  const env = setup(), a = env.invoke(Buffer.alloc(0)), b = env.invoke(bodyOf('foreign'), { headers: { origin: 'https://foreign.invalid' } })
  await until(() => a.res.writableEnded && b.res.writableEnded, 'empty and foreign')
  assert.equal(a.res.status, 500)
  assert.equal(b.res.status, 403)
  assert.equal(env.calls.length, 0)
  assert.equal(env.writes.length, 0)
  assert.equal(a.res.listenerCount('close'), 0)
  assert.equal(b.res.listenerCount('close'), 0)
})

test('structure cancellation is request-local: cancelling A does not stop B or change its PDF owner', async () => {
  const env = setup({ child() {} }), a = env.invoke(bodyOf('paper-A')), b = env.invoke(bodyOf('paper-B'))
  try {
    await until(() => env.calls.length === 2, 'concurrent children')
    const callA = env.calls.find(call => call.result.documentId === ownerOf(bodyOf('paper-A')))
    const callB = env.calls.find(call => call.result.documentId === ownerOf(bodyOf('paper-B')))
    assert.notEqual(callA.options.signal, callB.options.signal)
    a.res.disconnect()
    assert.equal(callA.options.signal.aborted, true)
    assert.equal(callB.options.signal.aborted, false)
    callB.finish()
    await until(() => b.res.writableEnded, 'B success')
    await env.settle('concurrent cleanup')
    assert.equal(a.res.writes, 0)
    assert.equal(JSON.parse(b.res.parts.join('')).documentId, ownerOf(bodyOf('paper-B')))
    assert.equal(env.calls.length, 2)
    assert.equal(new Set(env.writes).size, 2)
    assert.deepEqual(new Set(env.unlinks), new Set(env.writes))
    assert.equal(a.res.listenerCount('close'), 0)
    assert.equal(b.res.listenerCount('close'), 0)
  } finally { await env.drain() }
})

test('structure failure skips a late route 500 if the response disconnects while unlink is pending', async () => {
  let releaseUnlink
  const unlinkGate = new Promise(resolve => { releaseUnlink = resolve })
  const env = setup({
    child(call) { queueMicrotask(() => call.finish(Object.assign(Error('controlled terminal failure'), { code: 'ENOENT' }), '')) },
    onUnlink() { return unlinkGate },
  })
  const { res } = env.invoke(bodyOf('disconnect-during-unlink'))
  try {
    await until(() => env.unlinks.length === 1, 'terminal parser failure reached asynchronous unlink')
    assert.equal(env.calls.length, 8, 'every permitted interpreter has already failed')
    assert.equal(res.listenerCount('close'), 0, 'structure has entered finally and detached its abort listener')
    assert.equal(res.writes, 0, 'the route is still waiting for unlink')
    res.disconnect()
  } finally { releaseUnlink() }
  await env.settle('late disconnect cleanup')
  assert.equal(res.destroyed, true)
  assert.equal(res.writes, 0, 'the wrapper must not attempt a 500 on the closed response')
  assert.equal(res.writableEnded, false)
  assert.deepEqual(env.unlinks, env.writes)
})
