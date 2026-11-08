# 第三方组件

运行时使用以下本地资源，保留上游许可文本：

| 组件 | 位置 | 许可 |
| --- | --- | --- |
| PDF.js 3.11.174 | `vendor/pdf.min.js`、`vendor/pdf.worker.min.js` | Apache-2.0，见 `vendor/LICENSE` |
| KaTeX 0.19.1 | `vendor/gloss-math/` | MIT，见 `LICENSE-KATEX.txt` |
| PyMuPDF | Python 运行环境提供，不在 npm 包内分发 | 请遵守所选安装版本的上游许可 |

Gloss 打开 PDF 时禁用 PDF.js 动态求值，以缓解 CVE-2024-4367。 [Mozilla 安全公告](https://github.com/mozilla/pdf.js/security/advisories/GHSA-wgrm-67xf-hhpq)

KaTeX 做了宿主全局名、CSS 作用域和字体族隔离；只保留现代浏览器使用的 WOFF2 字体。不从 CDN 拉取公式或字体，也不向外部渲染服务发送公式文本。

旧 WebGL 玻璃库已退出当前运行依赖。现有玻璃界面使用 CSS 和浏览器原生动画，不依赖该旧资源。
