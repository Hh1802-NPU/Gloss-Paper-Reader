# 上传 Gloss 到 GitHub

GitHub 仓库保存可维护的源码。GitHub Releases 提供可解压安装的 Gloss ZIP，两者都应来自同一份源码。

## 准备仓库内容

从开发目录运行以下命令，将已检查的源码导出到一个新目录。

```sh
npm run export:source -- --out outputs/github-ready/Gloss-next
```

使用导出的目录内容作为仓库根目录。仓库首页应直接看到 README 和插件清单。目录大致如下。

```text
仓库根目录/
  README.md
  .gitignore
  CONTRIBUTING.md
  package.json
  cordis.patch.yml
  setup.mjs
  requirements.txt
  index.js
  client.js
  icon.svg
  locale/
  src/
  scripts/
  tests/
  docs/
  vendor/
```

导出器排除工作记录、历史 ZIP、论文、截图、数据库、依赖目录和本机环境文件。将导出目录外的校验清单保留在本机。提交前用 `git status --short` 和 `git diff --cached --stat` 核对要上传的内容。

## 新建空仓库

先在 GitHub 新建空仓库，直接使用 Gloss 导出的 README。进入导出目录，替换示例中的仓库地址，再执行以下命令。 [GitHub 本地源码上传说明](https://docs.github.com/en/migrations/importing-source-code/using-the-command-line-to-import-source-code/adding-locally-hosted-code-to-github)

```sh
git init -b main
git add --all
git diff --cached --stat
git commit -m "Add Gloss PDF reader"
git remote add origin https://github.com/OWNER/REPO.git
git push -u origin main
```

## 更新已有仓库

克隆现有仓库并从默认分支创建更新分支。把导出目录中的文件复制到检出目录根部，保留现有的 `.git` 目录。用 `git status --short` 和 `git diff` 核对覆盖内容，有意移除的旧文件也在这一步确认。提交更新分支后发起 Pull Request。

```sh
git clone https://github.com/OWNER/REPO.git Gloss-repo
cd Gloss-repo
git switch -c gloss-setup-update
```

复制完成并检查差异后执行以下命令。

```sh
git add --all
git diff --cached --stat
git commit -m "Update Gloss setup and PDF reader"
git push -u origin gloss-setup-update
```

## 添加安装包

仓库目标提交确定后，打开 GitHub 的 Releases，创建草稿并把 `v1.1.0` 标签关联到该提交。添加 `Gloss-1.1.0-macos-arm64.zip`、`Gloss-1.1.0-windows-x64.zip` 与 `Gloss-1.1.0-SHA256SUMS.txt`，写清各自的配置入口和验收范围。两个安装 ZIP 解压后以 `Gloss/` 为顶层目录。GitHub 根据标签生成的 `Source code` 压缩包供源码浏览和下载。 [GitHub Releases 操作说明](https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository)

发布前可重新计算 ZIP 的 SHA-256，与随包提供的值对照。

```sh
shasum -a 256 "Gloss-1.1.0-macos-arm64.zip"
```

```powershell
Get-FileHash -Algorithm SHA256 -Path '.\Gloss-1.1.0-windows-x64.zip'
```

Gloss 自有代码采用 MIT 许可证。分发时一并保留第三方组件的许可证与说明。 [Gloss 第三方说明](THIRD_PARTY.md) · [GitHub 许可证说明](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository)
