import { spawnSync } from 'node:child_process'
import { mkdirSync, rmdirSync } from 'node:fs'
import path from 'node:path'
import { parseArgs } from 'node:util'
import { fileURLToPath } from 'node:url'
import { pythonCandidates, pythonEnvironmentPath } from './index.js'

const requirements = fileURLToPath(new URL('./requirements.txt', import.meta.url))
const platform = process.platform + '-' + process.arch
const pythonFlags = ['-I', '-X', 'utf8']
const pythonEnv = { ...process.env, PYTHON_MANAGER_AUTOMATIC_INSTALL: 'false' }
const probeCode = `
import importlib.util, json, platform, sys
try:
    import pymupdf
    version = pymupdf.VersionBind
except (ImportError, AttributeError, OSError):
    version = None
print(json.dumps({
    "python": sys.executable,
    "basePython": sys._base_executable,
    "version": platform.python_version(),
    "machine": platform.machine().lower(),
    "pymupdf": version,
    "canCreateVenv": sys.version_info >= (3, 11) and all(
        importlib.util.find_spec(module) for module in ("venv", "ensurepip")
    )
}))
`

function runPython([command, ...prefix], args, options) {
  return spawnSync(command, [...prefix, ...pythonFlags, ...args], {
    env: pythonEnv, windowsHide: true, ...options,
  })
}

function probe(candidate) {
  const result = runPython(candidate, ['-c', probeCode], { encoding: 'utf8', timeout: 7000 })
  if (result.status !== 0) return null
  try { return JSON.parse(result.stdout) } catch { return null }
}

function configure(candidate, args, label) {
  const result = runPython(candidate, args, { stdio: 'inherit' })
  if (result.status !== 0) throw Error(`${label}失败${result.error ? '：' + result.error.message : '。'}`)
}

function supportsThirdPartyModules(environment) {
  if (process.platform !== 'darwin') return true
  const signature = spawnSync('/usr/bin/codesign', [
    '-d', '--verbose=2', '--entitlements', '-', environment.basePython,
  ], { encoding: 'utf8', timeout: 5000 })
  // A venv inherits the base executable's library-validation policy.
  return !/flags=.*\(.*\bruntime\b/.test(signature.stderr || '') ||
    /<key>com\.apple\.security\.cs\.disable-library-validation<\/key>\s*<true\s*\/>/.test(signature.stdout || '')
}

function main() {
  const { values } = parseArgs({
    options: { check: { type: 'boolean' }, install: { type: 'boolean' }, python: { type: 'string' } },
  })
  if (Boolean(values.check) === Boolean(values.install) || (values.python && !path.isAbsolute(values.python))) {
    throw Error('用法：node setup.mjs --check|--install [--python <Python绝对路径>]')
  }

  const candidates = pythonCandidates()
  const explicit = values.python ? probe([values.python]) : null
  if (values.python && !explicit) throw Error('指定的 Python 无法启动。请核对可执行文件路径。')
  const available = []
  for (const candidate of candidates) {
    const environment = probe(candidate)
    if (!environment) continue
    if (environment.pymupdf) {
      console.log(JSON.stringify({ ok: true, platform, ...environment, installed: false }))
      return
    }
    available.push(environment)
  }

  const venvPython = pythonEnvironmentPath()
  const venv = path.dirname(path.dirname(venvPython))
  const canProvision = environment => environment.canCreateVenv && supportsThirdPartyModules(environment)
  const privateEnvironment = available.find(environment => environment.python === venvPython)
  const existing = privateEnvironment && canProvision(privateEnvironment) ? privateEnvironment : null
  const base = (explicit ? [explicit] : available).find(canProvision)
  const architecture = base?.machine || existing?.machine
  const supported = (process.platform === 'darwin' && architecture === 'arm64') ||
    (process.platform === 'win32' && ['amd64', 'x86_64'].includes(architecture))
  if (values.check) {
    console.log(JSON.stringify({
      ok: false, platform, available, explicit, canInstall: supported && Boolean(base || existing),
    }))
    process.exitCode = 1
    return
  }
  if (!base && !existing) {
    throw Error('找不到可加载第三方二进制模块、且带 venv 与 ensurepip 的 Python 3.11 或更新版本。请用 --python 指定独立的 Python，例如 python.org 的 Python 3.12。')
  }
  if (!supported) throw Error('此版本的二进制依赖适用于 macOS Apple Silicon 或 Windows x64。')

  mkdirSync(path.dirname(venv), { recursive: true })
  const lock = venv + '.setup-lock'
  try { mkdirSync(lock) } catch (error) {
    if (error.code !== 'EEXIST') throw error
    throw Error(`环境配置已在运行。若上次强制中止且确认没有配置进程，请删除空锁目录再重试：${lock}`)
  }
  try {
    const current = probe([venvPython])
    if (current?.pymupdf) {
      console.log(JSON.stringify({ ok: true, platform, ...current, installed: false }))
      return
    }
    if (current && !canProvision(current)) throw Error(`已有 Gloss 环境的 Python 无法加载第三方模块。请将专用目录 ${venv} 改名后重试。`)
    if (!current) configure([base.python], ['-m', 'venv', venv], '创建 Gloss 专用 Python 环境')
    configure([venvPython], ['-m', 'pip', 'install', '--only-binary=:all:', '--no-deps', '--disable-pip-version-check', '-r', requirements], '安装 PyMuPDF')
    const result = probe([venvPython])
    if (!result?.pymupdf) throw Error('安装后无法导入 PyMuPDF。')
    console.log(JSON.stringify({ ok: true, platform, ...result, installed: true }))
  } finally {
    rmdirSync(lock)
  }
}

try { main() } catch (error) {
  console.error(error.message)
  process.exitCode = 1
}
