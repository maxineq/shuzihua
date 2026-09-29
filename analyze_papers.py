#!/usr/bin/env python3
"""Generate paper analysis Markdown from papers.json using an optional LLM."""
import json, os, re, sys, urllib.error, urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent
PAPERS = ROOT / "papers.json"
OUT = ROOT / "analysis"
API_URL = os.environ.get("LLM_API_URL", "").strip()
API_KEY = os.environ.get("LLM_API_KEY", "").strip()
MODEL = os.environ.get("LLM_MODEL", "").strip()
MAX_SOURCE = int(os.environ.get("LLM_MAX_SOURCE_CHARS", "12000"))


def slug(value):
    value = re.sub(r"[^\w\- ]+", "", value.lower(), flags=re.UNICODE)
    return re.sub(r"[\s\-]+", "-", value).strip("-")[:90] or "paper"


def clean(value):
    return re.sub(r"\s+", " ", str(value or "")).strip()


def fetch_text(url):
    if not url or not re.match(r"^https?://", url):
        return ""
    req = urllib.request.Request(url, headers={"User-Agent": "shuzihua-paper-analyzer/1.0"})
    try:
        with urllib.request.urlopen(req, timeout=25) as response:
            content_type = response.headers.get("Content-Type", "")
            data = response.read(MAX_SOURCE * 2)
            if "text" in content_type or "html" in content_type:
                text = data.decode("utf-8", errors="ignore")
                return re.sub(r"<script[\s\S]*?</script>|<style[\s\S]*?</style>|<[^>]+>", " ", text)[:MAX_SOURCE]
    except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError, UnicodeError):
        pass
    return ""


def source_for(paper):
    candidates = []
    for key in ("arxiv_html", "arxivHtml", "fullTextUrl", "openAccessUrl", "url", "doi"):
        value = paper.get(key)
        if isinstance(value, str) and value.startswith("http") and value not in candidates:
            candidates.append(value)
    for url in candidates:
        text = fetch_text(url)
        if text:
            return url, text
    return "", ""


def llm(prompt):
    if not (API_URL and API_KEY and MODEL):
        return ""
    payload = {"model": MODEL, "messages": [{"role": "user", "content": prompt}], "temperature": 0.2}
    req = urllib.request.Request(API_URL, data=json.dumps(payload).encode(), headers={"Content-Type": "application/json", "Authorization": "Bearer " + API_KEY})
    try:
        with urllib.request.urlopen(req, timeout=120) as response:
            data = json.load(response)
        return clean(data.get("choices", [{}])[0].get("message", {}).get("content", ""))
    except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError, ValueError, KeyError, IndexError):
        return ""


def render(paper, source_url, source_text, generated):
    title = clean(paper.get("title")) or "未命名论文"
    authors = "、".join(paper.get("authors", [])) if isinstance(paper.get("authors"), list) else clean(paper.get("authors"))
    status = "已获取开放全文" if source_text else "全文不可用"
    body = generated or "待处理模板：配置 `LLM_API_URL`、`LLM_API_KEY`、`LLM_MODEL` 后重新运行分析脚本。"
    return f'''# {title}\n\n- **作者**：{authors or "待核验"}\n- **年份/来源**：{paper.get("year") or "待核验"} / {clean(paper.get("venue")) or "待核验"}\n- **DOI/链接**：{clean(paper.get("doi")) or clean(paper.get("url")) or "无"}\n- **全文状态**：{status}\n- **全文来源**：{source_url or "未找到可公开访问的全文链接"}\n\n> 本文件仅发布摘要翻译与研究分析，不发布受版权保护的整篇译文。\n\n{body}\n'''


def main():
    if not PAPERS.exists():
        print("papers.json not found", file=sys.stderr); return 1
    papers = json.loads(PAPERS.read_text(encoding="utf-8"))
    OUT.mkdir(exist_ok=True)
    count = 0
    for paper in papers:
        if not (clean(paper.get("url")) or clean(paper.get("doi"))):
            continue
        source_url, source_text = source_for(paper)
        abstract = clean(paper.get("abstract"))
        prompt = f'''你是严谨的论文研究助理。仅根据以下元数据、摘要和开放获取全文片段，输出中文 Markdown，必须包含且使用以下二级标题：\n## 中文摘要翻译\n## 研究问题\n## 方法/模型\n## 数据集\n## 评测指标\n## 关键技术\n## 实验结论\n## 局限性\n## 可迁移启示\n不得臆造未提供的事实；未知处写“原文未说明”。不要输出整篇论文翻译，仅做摘要翻译和分析。\n标题：{paper.get("title")}\n摘要：{abstract}\n全文片段：{source_text[:MAX_SOURCE]}'''
        generated = llm(prompt)
        if not generated:
            generated = "\n".join(["## 中文摘要翻译", "待处理：尚未配置 LLM API 或 API 未返回结果。", "", "## 研究问题", "待处理。", "", "## 方法/模型", "待处理。", "", "## 数据集", "待处理。", "", "## 评测指标", "待处理。", "", "## 关键技术", "待处理。", "", "## 实验结论", "待处理。", "", "## 局限性", "全文不可用或尚未完成分析。", "", "## 可迁移启示", "待处理。"])
        path = OUT / (slug(title := clean(paper.get("title"))) + ".md")
        path.write_text(render(paper, source_url, source_text, generated), encoding="utf-8")
        count += 1
    index = OUT / "README.md"
    files = sorted(p.name for p in OUT.glob("*.md") if p.name != "README.md")
    index.write_text("# 论文技术解析索引\n\n" + ("\n".join(f"- [{p[:-3]}]({p})" for p in files) if files else "暂无分析。") + "\n", encoding="utf-8")
    print(f"Generated {count} analysis files; LLM={'enabled' if API_URL and API_KEY and MODEL else 'template'}")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
