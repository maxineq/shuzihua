# 美学评测研究库

这是一个可部署到 GitHub Pages 的静态论文研究工具，包含页面、论文数据和 GitHub Actions 自动采集流程。

## 部署

1. 将本目录中的全部文件复制到 GitHub 仓库根目录。
2. 在仓库 `Settings > Pages` 中选择 `GitHub Actions`，或选择 `main` 分支的根目录。
3. 打开仓库 `Actions`，手动运行一次 `Collect aesthetic evaluation papers`，确认 `papers.json` 成功更新。
4. GitHub Actions 默认每天 UTC 01:00 运行，对应北京时间 09:00。

## 自动收集机制

- 数据源：OpenAlex 公共 API。
- 检索词：`aesthetic evaluation`、`visual aesthetics`、`human preference`。
- 每次最多拉取 30 条结果。
- 使用 DOI 或标题去重。
- 将 venue、DOI、链接、作者、摘要和发现来源写入 `papers.json`。
- 页面打开时读取同目录的 `papers.json`。

## 修改检索主题

编辑 `.github/workflows/collect-papers.yml` 中的 `PAPER_QUERY`，然后提交。建议扩展为：

```text
"aesthetic assessment" OR "image quality assessment" OR "visual preference" OR "aesthetic quality"
```

## 来源等级

当前脚本把 OpenAlex 作为发现来源，并保留 `venue`、`doi`、`originalSource`、`sourceLevel` 字段。OpenAlex 的元数据不等于正式出版核验，正式发表信息仍应回到 DOI、出版社、ACM、IEEE 或会议官网确认。

## 限制

GitHub Pages 只负责展示页面。自动收集由 GitHub Actions 执行，页面本身不会在浏览器关闭后运行。当前流程不需要 API Key，但公开仓库中的 Actions 需要拥有写入 `papers.json` 的权限。

## 全文翻译与技术解析

运行 `python3 analyze_papers.py` 会从 `papers.json` 读取有 `url` 或 `doi` 的论文，并优先尝试 arXiv HTML/PDF、开放获取链接或记录中的链接。无法取得全文时会明确标记“全文不可用”，绝不伪造全文。脚本在 `analysis/` 生成逐篇 Markdown 和索引；未配置 API 时生成包含完整栏目结构的待处理模板。

配置以下 GitHub Actions Secrets 后，论文收集完成会自动调用外部 LLM：

- `LLM_API_URL`：兼容 Chat Completions 的 API 地址
- `LLM_API_KEY`：API 密钥
- `LLM_MODEL`：模型名称

仅处理开放获取全文或用户有权访问的全文；不绕过付费墙，也不将整篇受版权保护的译文公开发布。公开内容限于摘要翻译、分析和必要的短摘录，并应遵守来源平台、出版社及论文许可条款。
