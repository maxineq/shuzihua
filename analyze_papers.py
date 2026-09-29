#!/usr/bin/env python3
"""Fetch permitted open-access text and optionally translate/analyse papers.
Full source text is held in memory only; it is never written to the repository.
"""
import html, json, os, re, shutil, subprocess, sys, urllib.error, urllib.parse, urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent
PAPERS = ROOT / "papers.json"
OUT = ROOT / "analysis"
API_URL, API_KEY, MODEL = (os.environ.get(k, "").strip() for k in ("LLM_API_URL", "LLM_API_KEY", "LLM_MODEL"))
MAX_SOURCE = int(os.environ.get("LLM_MAX_SOURCE_CHARS", "80000"))
CHUNK_CHARS = int(os.environ.get("LLM_CHUNK_CHARS", "10000"))
PUBLISH_FULL_TRANSLATION = os.environ.get("PUBLISH_FULL_TRANSLATION", "false").lower() == "true"


def clean(value): return re.sub(r"\s+", " ", str(value or "")).strip()
def slug(value): return re.sub(r"[\s\-]+", "-", re.sub(r"[^\w\- ]+", "", clean(value).lower(), flags=re.UNICODE)).strip("-")[:90] or "paper"


def fetch(url):
    if not isinstance(url, str) or not re.match(r"^https?://", url): return b"", ""
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "shuzihua-paper-analyzer/2.0"})
        with urllib.request.urlopen(req, timeout=35) as r: return r.read(MAX_SOURCE * 2), r.headers.get("Content-Type", "")
    except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError, OSError): return b"", ""


def html_text(data):
    text = data.decode("utf-8", errors="ignore")
    text = re.sub(r"<script[\s\S]*?</script>|<style[\s\S]*?</style>|<nav[\s\S]*?</nav>|<[^>]+>", " ", text, flags=re.I)
    return clean(html.unescape(text))


def pdf_text(data):
    if not shutil.which("pdftotext"): return ""
    import tempfile
    with tempfile.NamedTemporaryFile(suffix=".pdf") as f:
        f.write(data); f.flush()
        try: return clean(subprocess.check_output(["pdftotext", "-layout", f.name, "-"], stderr=subprocess.DEVNULL, timeout=45).decode("utf-8", errors="ignore"))
        except (subprocess.SubprocessError, OSError): return ""


def candidates(paper):
    values = []
    oa = paper.get("openAccess") or {}
    loc = paper.get("openAccessLocation") or {}
    for key in ("arxiv_html", "arxivHtml", "fullTextUrl", "openAccessUrl", "pdf_url", "landing_page_url"):
        values.append(paper.get(key))
    values += [oa.get("oa_url"), loc.get("landing_page_url"), loc.get("pdf_url"), paper.get("url")]
    doi = paper.get("doi", "")
    if str(doi).startswith("http"): values.append(doi)
    result = []
    for value in values:
        if isinstance(value, str) and value.startswith("http") and value not in result: result.append(value)
    return result


def source_for(paper):
    for url in candidates(paper):
        data, ctype = fetch(url)
        if not data: continue
        is_pdf = "pdf" in ctype.lower() or url.lower().split("?")[0].endswith(".pdf")
        text = pdf_text(data) if is_pdf else html_text(data)
        if text: return url, text[:MAX_SOURCE], "pdf" if is_pdf else "html"
    return "", "", "none"


def llm(prompt):
    if not (API_URL and API_KEY and MODEL): return ""
    payload = {"model": MODEL, "messages": [{"role": "user", "content": prompt}], "temperature": 0.2}
    try:
        req = urllib.request.Request(API_URL, data=json.dumps(payload).encode(), headers={"Content-Type": "application/json", "Authorization": "Bearer " + API_KEY})
        with urllib.request.urlopen(req, timeout=180) as r: data = json.load(r)
        return clean(data["choices"][0]["message"]["content"])
    except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError, ValueError, KeyError, IndexError, OSError): return ""


def analyse(paper, text):
    abstract = clean(paper.get("abstract")) or "原文未提供摘要。"
    base = f"标题：{paper.get('title')}\n摘要：{abstract}\n正文："
    chunks = [text[i:i + CHUNK_CHARS] for i in range(0, len(text), CHUNK_CHARS)] or [""]
    translations = []
    if text and API_URL and API_KEY and MODEL:
        for i, chunk in enumerate(chunks, 1):
            result = llm(f"你是论文翻译助手。将下面第 {i}/{len(chunks)} 段完整、忠实翻译成简体中文，保留术语、公式含义和小节结构，不要总结，不要臆造。\n{base}{chunk}")
            if not result: break
            translations.append(result)
    if not (text and API_URL and API_KEY and MODEL): return "", "未配置完整 LLM_API_URL/LLM_API_KEY/LLM_MODEL，未生成全文翻译或技术解析。"
    if len(translations) != len(chunks): return "", "全文已获取，但翻译接口未完成全部分块，未发布不完整译文。"
    summary = llm(f"你是严谨的论文研究助理。仅依据以下论文元数据、摘要和正文，输出中文 Markdown，必须包含二级标题：\n## 中文摘要翻译\n## 研究问题\n## 方法/模型\n## 数据集\n## 评测指标\n## 关键技术\n## 实验结论\n## 局限性\n## 可迁移启示\n未知处写‘原文未说明’，不得臆造，不要输出整篇译文。\n{base}{text}")
    return "\n\n".join(translations), summary or "接口未返回技术解析。"


def render(paper, source_url, source_kind, text, translation, analysis, reason):
    authors = "、".join(paper.get("authors", [])) if isinstance(paper.get("authors"), list) else clean(paper.get("authors"))
    status = "已生成全文中文译文" if translation and PUBLISH_FULL_TRANSLATION else ("已完成翻译（未公开全文译文）" if translation else reason)
    body = analysis or "## 中文摘要翻译\n未生成。\n\n## 分析状态\n" + reason
    if translation and PUBLISH_FULL_TRANSLATION: body += "\n\n## 全文中文译文\n\n" + translation
    return f"# {clean(paper.get('title')) or '未命名论文'}\n\n- **作者**：{authors or '待核验'}\n- **年份/来源**：{paper.get('year') or '待核验'} / {clean(paper.get('venue')) or '待核验'}\n- **全文状态**：{status}\n- **正文抽取**：{source_kind if text else '失败'}\n- **全文来源**：{source_url or '未找到可公开访问的全文链接'}\n- **摘要状态**：{'已有摘要' if clean(paper.get('abstract')) else '无摘要，待回填'}\n\n> 仅处理开放获取或用户有权访问的来源；默认不公开整篇译文。\n\n{body}\n"


def main():
    papers = json.loads(PAPERS.read_text(encoding="utf-8")); OUT.mkdir(exist_ok=True); count = 0
    for paper in papers:
        if not clean(paper.get("title")): continue
        url, text, kind = source_for(paper)
        translation, analysis_or_reason = analyse(paper, text)
        reason = analysis_or_reason if not translation else ("已完成" if PUBLISH_FULL_TRANSLATION else "已完成但默认不公开全文译文")
        path = OUT / (slug(paper["title"]) + ".md")
        path.write_text(render(paper, url, kind, text, translation, analysis_or_reason if translation else "", reason), encoding="utf-8")
        count += 1
    files = sorted(p.name for p in OUT.glob("*.md") if p.name != "README.md")
    (OUT / "README.md").write_text("# 论文技术解析索引\n\n" + "\n".join(f"- [{p[:-3]}]({p})" for p in files) + "\n", encoding="utf-8")
    print(f"Generated {count} analyses; open_text checked; LLM={'enabled' if API_URL and API_KEY and MODEL else 'disabled'}; full_translation={'published' if PUBLISH_FULL_TRANSLATION else 'private-by-default'}")

if __name__ == "__main__": main()
