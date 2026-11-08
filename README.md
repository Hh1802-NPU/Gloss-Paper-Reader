# Gloss

Gloss 是一个面向 DeepSeek Harness 的 PDF 文献阅读插件。保留原始 PDF，围绕原文提供速览、逐章精读、研究讨论和参考文献导航。

## 功能

- 划词翻译与局部追问；局部对话和整篇研究讨论分别保存。
- 速览重点与原文关联；章节讲解跟随阅读位置，支持来源定位和返回。
- 背景高亮、下划线、原始／深色阅读、缩放和专注阅读。
- 参考文献原条目、正文关联与可靠来源链接。
- 本地公式排版，支持行内、独立公式和流式回答。
- 按论文隔离阅读位置、记录、缓存和讨论。
- 文献库支持文件夹分类，集中管理本地上传、Zotero 附件和通过 DOI、链接或题名查到的公开 PDF。

打开顶栏的文献库图标即可导入、查看文献信息或打开原始 PDF。Zotero 需要保持运行并开启本地 API。找不到可下载的公开全文时，可以先保存条目信息，再补上传手头的 PDF。

在文献库的齿轮里可以设置新导入 PDF 的本机保存目录、默认分类和打开行为。更换目录后，已有文件仍从原来的位置恢复。删除文献只移除 Gloss 的条目和阅读记录，原始文件仍留在 Zotero 或本机目录。

本项目是插件，不是独立运行的聊天网站。模型由宿主当前配置提供；需要宿主的插件、Web 服务和模型接口。论文处理以本地 PDF 为基础，生成请求会发送给宿主选定的模型服务。

## 安装与配置

安装并启动 DeepSeek Harness Desktop，按平台下载并解压对应的 ZIP。 [下载 Gloss 1.0.0](https://github.com/Hh1802-NPU/Gloss-Paper-Reader/releases/tag/v1.0.0)

| 系统 | 安装包 | 配置入口 |
| --- | --- | --- |
| macOS · Apple Silicon | `Gloss-1.0.0-macos-arm64.zip` | `Configure-Gloss.command` |
| Windows · x64 | `Gloss-1.0.0-windows-x64.zip` | `Configure-Gloss.cmd` |

两个入口都可直接执行，或附加 `--check` 只检查环境。首次配置需要在本机下载约 63–67 MB 的 PyMuPDF 二进制包。ZIP 自身不含 Python 运行时或 PyMuPDF。当前固定版本的二进制包覆盖上述两种平台。 [PyMuPDF 2.0 下载列表](https://pypi.org/project/PyMuPDF/2.0/#files)

也可以把 `Gloss` 目录交给能在这台电脑上运行命令的 Agent，并发送下面这句话。

> 请按 Gloss 的 README 检查本机环境，安装缺少的 PDF 解析依赖，再通过 DeepSeek Harness 安装并验证 Gloss。

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

如果安装后看不到章节，重新运行 `--check`，查看所选解释器和依赖状态。确认插件启用后刷新界面，仍失败时完整退出并重新启动宿主。macOS Apple Silicon 已在 DeepSeek Harness Desktop `0.2.2-rc.1` 的 Web 模式验证配置、中文 PDF 导入、章节定位高亮和重启恢复。Windows x64 安装包已通过归档校验和离线检查，真机验收待完成。

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

## 开发

构建和检查使用 Node.js 24 或兼容环境。只在修改前端源码后重新构建。

```sh
npm run build
npm run check
```

如果 Windows 上宿主自带的 Node 没有加入 `PATH`，可从 PowerShell 用实际的 `node.exe` 路径检查现有构建和运行离线测试。

```powershell
$node = 'C:/path/to/node.exe'
& $node .\scripts\build.mjs --check
& $node .\scripts\check.mjs --no-pack
```

少数离线用例会创建符号链接。Windows 若在这些用例中报 `symlink EPERM`，可在具有创建符号链接权限的环境重跑。

运行检查不需要模型密钥，不会调用付费模型。`npm run check` 检查构建同步、语法、离线行为边界与打包文件；浏览器、真实 PDF 和真实模型的质量评测需要另外执行，不能用离线通过替代。

## 源码

| 路径 | 用途 |
| --- | --- |
| `src/client.template.js` | 前端逻辑源文件 |
| `src/styles/` | 分层样式，保持注入顺序 |
| `client.js` | 构建后的插件前端入口，请勿直接修改 |
| `index.js` | 宿主接口、模型流、资源与文件处理 |
| `vendor/structure.py` | 本地 PDF 结构解析 |
| `vendor/chapter-context.js`、`vendor/paper-context.js` | 可核对的论文上下文 |
| `vendor/chapter-reader.js`、`vendor/research-ideas.js`、`vendor/citation-nav.js` | 四栏中的阅读与讨论模块 |
| `scripts/`、`tests/` | 零 npm 依赖的构建与离线检查 |

修改前端后运行 `npm run build`；`npm run check:build` 验证源文件与分发入口完全同步。样式拆分不增加运行时网络请求。

## 测试与发布边界

当前包含离线契约检查及本地多论文测试记录。部分版式、公式提取、图表识别与生成质量仍有已知限制；见 [开发与验收](docs/DEVELOPMENT.md)。没有宣称所有论文、所有来源和所有平台均已通过。

`npm run export:source` 生成只包含源码、必要资源、文档和自造测试数据的 GitHub 准备目录。默认排除工作输出、论文、截图、数据库、缓存和环境配置；该命令不会创建远程仓库、提交或发布。

Gloss 自有代码以公开源码形式发布，暂未授予开源许可。随附的第三方组件沿用各自的许可证。 [第三方组件与许可](docs/THIRD_PARTY.md)
