# 安装与配置

安装并启动 DeepSeek Harness Desktop，从 [Gloss 1.1.0 官方发布页](https://github.com/Hh1802-NPU/Gloss-Paper-Reader/releases/tag/v1.1.0) 下载与你的系统和架构匹配的 ZIP，以及同页的 `Gloss-1.1.0-SHA256SUMS.txt`。核对校验值一致后再解压。

| 系统 | 安装包 | 配置入口 |
| --- | --- | --- |
| macOS · Apple Silicon | [Gloss-1.1.0-macos-arm64.zip](https://github.com/Hh1802-NPU/Gloss-Paper-Reader/releases/download/v1.1.0/Gloss-1.1.0-macos-arm64.zip) | `Configure-Gloss.command` |
| Windows · x64 | [Gloss-1.1.0-windows-x64.zip](https://github.com/Hh1802-NPU/Gloss-Paper-Reader/releases/download/v1.1.0/Gloss-1.1.0-windows-x64.zip) | `Configure-Gloss.cmd` |

## 环境要求

- 已启动过的 DeepSeek Harness Desktop。配置器优先使用宿主提供的 Node.js，其次使用系统已有的 Node.js。
- Python 可导入 PyMuPDF 时，配置器会复用现有环境。需要新建专用环境时，Python 须为 3.11 或更新版本，架构与安装包匹配，并包含 `venv` 和 `ensurepip`。
- 新建环境会安装 `requirements.txt` 固定的 PyMuPDF 2.0。首次安装需能访问依赖下载源。

## 校验与配置

在 ZIP 所在目录运行对应命令，将结果和发布清单中同名文件的 SHA-256 对照。校验不一致就停止，不要运行包内文件。

```sh
shasum -a 256 ./Gloss-1.1.0-macos-arm64.zip
```

```powershell
Get-FileHash -Algorithm SHA256 -LiteralPath '.\Gloss-1.1.0-windows-x64.zip'
```

先给配置入口传入 `--check`，它只检查环境。若缺少 PyMuPDF，首次安装需下载约 63–67 MB 的二进制包。ZIP 自身不含 Python 运行时或 PyMuPDF。当前固定版本的二进制包覆盖上述两种平台。 [PyMuPDF 2.0 下载列表](https://pypi.org/project/PyMuPDF/2.0/#files)

Agent 或用户从解压后的 `Gloss` 目录执行同一套步骤。

1. 运行本平台入口并显式传入 `--check`，也可运行 `node setup.mjs --check`。两个平台入口不带参数都会尝试安装。输出 `ok: true` 表示已找到插件可发现的 Python 和 PyMuPDF，可以直接进入第 3 步。
2. 检查返回 `ok: false`、`canInstall: true` 且用户已委托配置时，才运行平台入口的 `--install` 或 `node setup.mjs --install`，再执行 `--check` 核对结果。配置只安装解析器使用的 PyMuPDF，写入 `$DSH_HOME/gloss/python`（默认 `~/.dsh/gloss/python`）。已有可用依赖会复用，无需修改 PATH 或 `.env`。
3. 在 DeepSeek Harness Desktop 的插件页选择安装本地组合包，指向包含 `package.json` 和 `cordis.patch.yml` 的 `Gloss` 目录。Agent 有宿主插件管理工具时可使用对应的本地组合包安装操作。确认 `literature-reader` 已启用，刷新阅读界面，再用一篇含中文和数学符号的 PDF 核对章节标题与锚点。

`package.json` 的 `gloss.setup` 记录配置入口，供 Agent 查阅。宿主通过 `dsh.bundle` 加载插件。ZIP 已包含构建后的 `client.js`，可直接安装。

平台入口会先查找宿主提供的 Node，再使用 PATH 中的 Node。也可用 Node 的绝对路径运行 `setup.mjs`。`--python` 为首次创建专用环境指定 Python，需使用可执行文件的绝对路径。

- macOS 版 Harness 的签名 Python 可能拦截 PyMuPDF 的动态库。若已有独立的原生 arm64 Python 3.12，可通过 `--python` 指定。配置脚本会避开启用了库验证的解释器。
- Windows 先检查 Harness 的 Python 和已安装的 Python。宿主 Python 若缺少 `venv` 或 `ensurepip`，或 `python` 只是 Microsoft Store 占位，可通过 `--python` 指定已有的独立 x64 Python 3.12。
- 本机没有合适的 Python 时，请先说明需要安装哪个版本，以及安装位置，由用户决定是否继续。

以下命令里的 Node 和 Python 路径要换成本机实际路径。独立 Python 可从官方渠道获取。 [Python 下载](https://www.python.org/downloads/)

```sh
"/path/to/node" setup.mjs --check
"/path/to/node" setup.mjs --install --python "/path/to/python3"
```

```powershell
& 'C:/path/to/node.exe' .\setup.mjs --check
& 'C:/path/to/node.exe' .\setup.mjs --install --python 'C:/path/to/python.exe'
```

如果安装后看不到章节，重新运行 `--check`，查看所选解释器和依赖状态。确认插件启用后刷新界面，仍失败时完整退出并重新启动宿主。Gloss 的原生开发环境是 macOS。Windows x64 可配置，适配仍在优化。

<a name="agent-setup"></a>

## Agent 配置须知

收到 README 中的短提示词后，先通读本页，再按上面的环境要求、校验与配置步骤执行。

1. 从官方发布页选取对应平台的安装包。校验通过后解压到新目录，保留已有安装。系统不匹配或校验失败时停止。
2. 用户只要求检查时，只对已校验并解压的副本运行 `--check`。完整配置也从 `--check` 开始，并按返回结果决定是否安装依赖。使用普通用户权限。需要另装 Python、覆盖已有插件或修改全局设置时，先说明原因和影响，等用户决定。
3. 通过宿主的「安装本地组合包」功能启用插件。宿主操作不可用时，提供手动步骤。用公开 PDF 验证章节解析与出处跳转，分别报告下载校验、依赖检查、宿主启用和 PDF 验证的结果。报告中省略私人文件和日志中的本机路径、密钥及账号资料。

<a name="verification"></a>

## 1.1.0 验证范围

| 项目 | 实测结果 |
| --- | --- |
| 官网两个下载入口 | 已实际下载 macOS Apple Silicon、Windows x64 安装包；ZIP 可解压，SHA-256 与发布清单一致。 |
| macOS 依赖配置 | 在隔离目录实测：`--check` 未写入文件；`--install` 将 PyMuPDF 装入 Gloss 专用环境，复查通过，样例 PDF 成功解析。未改动现用的 DeepSeek 配置。 |
| 全新安装验收 | 本轮未重做 macOS 新宿主的界面安装，也未在 Windows 真机上验证安装、启用和 PDF 跳转。 |

```text
Gloss/
  README.md
  package.json        插件清单与 Agent 配置入口
  cordis.patch.yml    宿主组合包配置
  setup.mjs           检查与配置 PDF 解析环境
  requirements.txt    固定的 Python 依赖版本
  index.js            宿主入口
  client.js           已构建的前端入口
  vendor/             PDF 解析和显示资源
```
