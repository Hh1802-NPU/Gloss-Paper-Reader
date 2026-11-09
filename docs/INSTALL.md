# 安装与配置

安装并启动 DeepSeek Harness Desktop，按平台下载并解压对应的 ZIP。 [下载 Gloss 1.1.0](https://github.com/Hh1802-NPU/Gloss-Paper-Reader/releases/tag/v1.1.0)

| 系统 | 安装包 | 配置入口 |
| --- | --- | --- |
| macOS · Apple Silicon | [Gloss-1.1.0-macos-arm64.zip](https://github.com/Hh1802-NPU/Gloss-Paper-Reader/releases/download/v1.1.0/Gloss-1.1.0-macos-arm64.zip) | `Configure-Gloss.command` |
| Windows · x64 | [Gloss-1.1.0-windows-x64.zip](https://github.com/Hh1802-NPU/Gloss-Paper-Reader/releases/download/v1.1.0/Gloss-1.1.0-windows-x64.zip) | `Configure-Gloss.cmd` |

两个入口都可直接执行，或附加 `--check` 只检查环境。首次配置需要在本机下载约 63–67 MB 的 PyMuPDF 二进制包。ZIP 自身不含 Python 运行时或 PyMuPDF。当前固定版本的二进制包覆盖上述两种平台。 [PyMuPDF 2.0 下载列表](https://pypi.org/project/PyMuPDF/2.0/#files)

Agent 或用户从解压后的 `Gloss` 目录执行同一套步骤。

1. 运行本平台入口并传入 `--check`，也可运行 `node setup.mjs --check`。输出 `ok: true` 表示已找到插件可发现的 Python 和 PyMuPDF，可以直接进入第 3 步。
2. 缺少依赖时运行平台入口或 `node setup.mjs --install`，再执行一次 `--check` 核对结果。仅受托检查时执行 `--check`。配置只安装解析器使用的 PyMuPDF，写入 `$DSH_HOME/gloss/python`（默认 `~/.dsh/gloss/python`）。已有可用依赖会复用，通常无需修改 PATH 或 `.env`。
3. 在 DeepSeek Harness Desktop 的插件页选择安装本地组合包，指向包含 `package.json` 和 `cordis.patch.yml` 的 `Gloss` 目录。Agent 有宿主插件管理工具时可使用对应的本地组合包安装操作。确认 `literature-reader` 已启用，刷新阅读界面，再用一篇含中文和数学符号的 PDF 核对章节标题与锚点。

`package.json` 的 `gloss.setup` 记录配置入口，供 Agent 查阅。宿主通过 `dsh.bundle` 加载插件。ZIP 已包含构建后的 `client.js`，可直接安装。

平台入口会先查找宿主提供的 Node，再使用 PATH 中的 Node。也可用 Node 的绝对路径运行 `setup.mjs`。`--python` 为首次创建专用环境指定 Python，需使用可执行文件的绝对路径。

- macOS 版 Harness 的签名 Python 可能拦截 PyMuPDF 的动态库。检查找不到合适的解释器时，可由 Agent 安装独立的原生 arm64 Python 3.12，再传入 `--python`。配置脚本会避开启用了库验证的解释器。
- Windows 先检查 Harness 的 Python 和已安装的 Python。宿主 Python 若缺少 `venv` 或 `ensurepip`，或 `python` 只是 Microsoft Store 占位，可由 Agent 安装独立的 x64 Python 3.12，再传入 `--python`。

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
