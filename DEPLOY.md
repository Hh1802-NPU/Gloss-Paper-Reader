# Gloss 展示页

这个目录可以直接作为 GitHub Pages 的发布根目录。保留 index.html、assets、demo 和 .nojekyll。站点在仓库子路径下使用相对资源地址。

## 本地预览

在本目录启动静态服务器，例如运行 python3 -m http.server 8000 --bind 127.0.0.1，然后打开 http://127.0.0.1:8000/。

## 发布

把目录内容提交到 gh-pages 分支，在仓库的 Settings → Pages 中选择 Deploy from a branch，再选择 gh-pages 和 / (root)。

## 演示素材

操作录屏来自 Gloss v1.0.0 的实际浏览器界面。demo/reader.js 基于发布版提交 2bf9d8a 的前端入口，适配了相对资源路径、独立演示存储和内嵌窗口事件。demo/bridge.js 只提供内置 PDF、样例译文和讲解。PDF 结构索引由 Gloss 的解析器从示例文件生成。

Gloss 自有代码采用 MIT，许可文本见 LICENSE。React、PDF.js 和 KaTeX 的许可证在 demo/vendor 中。示例 PDF、录屏和界面截图为本次展示制作。
