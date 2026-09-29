#!/usr/bin/env python3
import json
import os
import re
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone

ROOT = os.path.dirname(os.path.abspath(__file__))
DATA_FILE = os.path.join(ROOT, "papers.json")
QUERY = os.environ.get(
    "PAPER_QUERY",
    '"aesthetic evaluation" OR "visual aesthetics" OR "human preference"'
)
LIMIT = int(os.environ.get("PAPER_LIMIT", "30"))
OPENALEX_MAILTO = os.environ.get("OPENALEX_MAILTO", "")
MAX_RETRIES = 3


def fetch_json(url):
    for attempt in range(MAX_RETRIES + 1):
        request = urllib.request.Request(
            url,
            headers={"User-Agent": "aesthetic-eval-library/1.0 research bot"},
        )
        try:
            with urllib.request.urlopen(request, timeout=30) as response:
                return json.load(response)
        except urllib.error.HTTPError as error:
            retryable = error.code == 429 or 500 <= error.code <= 599
            if not retryable or attempt == MAX_RETRIES:
                raise
        except (urllib.error.URLError, TimeoutError):
            if attempt == MAX_RETRIES:
                raise
        time.sleep(2 ** attempt)


def clean_text(value):
    return re.sub(r"\s+", " ", value or "").strip()


def reconstruct_abstract(inverted_index):
    if not inverted_index:
        return ""
    words = []
    for word, positions in inverted_index.items():
        for position in positions:
            words.append((position, word))
    return clean_text(" ".join(word for _, word in sorted(words)))


def classify(venue):
    venue = clean_text(venue)
    if venue:
        return venue, "正式发表信息待核验", "C"
    return "未标注 venue", "开放元数据记录", "C"


def openalex_url():
    params = {"search": QUERY, "per-page": LIMIT}
    if OPENALEX_MAILTO:
        params["mailto"] = OPENALEX_MAILTO
    return f"https://api.openalex.org/works?{urllib.parse.urlencode(params)}"


def crossref_url():
    params = {"query": QUERY, "rows": LIMIT, "select": "DOI,title,author,published,container-title,URL,abstract,type"}
    return f"https://api.crossref.org/works?{urllib.parse.urlencode(params)}"


def openalex_records(payload):
    records = []
    for item in payload.get("results", []):
        title = clean_text(item.get("title"))
        if not title:
            continue
        venue, original_source, level = classify(
            item.get("primary_location", {}).get("source", {}).get("display_name")
        )
        authors = [clean_text(author.get("author", {}).get("display_name"))
                   for author in item.get("authorships", [])[:6]]
        records.append({
            "id": item.get("id", title), "title": title,
            "authors": [author for author in authors if author],
            "year": item.get("publication_year"),
            "abstract": reconstruct_abstract(item.get("abstract_inverted_index")),
            "abstractStatus": "已有摘要" if item.get("abstract_inverted_index") else "OpenAlex 无摘要，待 Crossref/Semantic Scholar 回填",
            "openAccess": item.get("open_access") or {},
            "openAccessLocation": item.get("best_oa_location") or {},
            "venue": venue, "publicationType": "journal" if item.get("type") == "article" else "other",
            "discoverySource": "OpenAlex", "originalSource": original_source, "sourceLevel": level,
            "doi": item.get("doi") or "", "url": item.get("primary_location", {}).get("landing_page_url") or item.get("id", ""),
            "tags": ["视觉美学"], "score": 0, "saved": False,
            "collectedAt": datetime.now(timezone.utc).isoformat(),
        })
    return records


def crossref_records(payload):
    records = []
    for item in payload.get("message", {}).get("items", []):
        title = clean_text((item.get("title") or [""])[0])
        if not title:
            continue
        venue, original_source, level = classify((item.get("container-title") or [""])[0])
        authors = [clean_text(f"{author.get('given', '')} {author.get('family', '')}")
                   for author in item.get("author", [])[:6]]
        date_parts = (item.get("published", {}).get("date-parts") or [[]])[0]
        abstract = clean_text(re.sub(r"<[^>]+>", " ", item.get("abstract", "")))
        doi = item.get("DOI", "")
        records.append({
            "id": f"https://doi.org/{doi}" if doi else item.get("URL", title), "title": title,
            "authors": [author for author in authors if author], "year": date_parts[0] if date_parts else None,
            "abstract": abstract, "abstractStatus": "已有摘要" if abstract else "Crossref 无摘要，待 Semantic Scholar 回填", "venue": venue,
            "publicationType": "journal" if item.get("type") == "journal-article" else "other",
            "discoverySource": "Crossref", "originalSource": original_source, "sourceLevel": level,
            "doi": f"https://doi.org/{doi}" if doi else "", "url": item.get("URL") or (f"https://doi.org/{doi}" if doi else ""),
            "tags": ["视觉美学"], "score": 0, "saved": False,
            "collectedAt": datetime.now(timezone.utc).isoformat(),
        })
    return records


def semantic_abstract(title):
    url = "https://api.semanticscholar.org/graph/v1/paper/search?" + urllib.parse.urlencode({"query": title, "limit": 1, "fields": "title,abstract"})
    try:
        payload = fetch_json(url)
        item = (payload.get("data") or [{}])[0]
        return clean_text(item.get("abstract"))
    except Exception:
        return ""


def record_key(item):
    doi = clean_text(item.get("doi")).lower()
    doi = re.sub(r"^https?://doi.org/", "", doi).rstrip("/")
    if doi:
        return ("doi", doi)
    return ("title", clean_text(item.get("title")).lower())


def merge_record(old, fresh):
    merged = dict(old)
    for key, value in fresh.items():
        if value not in (None, "", [], {}):
            merged[key] = value
    merged["saved"] = bool(old.get("saved", False) or fresh.get("saved", False))
    return merged


def main():
    try:
        records = openalex_records(fetch_json(openalex_url()))
        source = "OpenAlex"
    except Exception as error:
        print(f"OpenAlex failed ({error}); trying Crossref")
        records = crossref_records(fetch_json(crossref_url()))
        source = "Crossref"

    with open(DATA_FILE, encoding="utf-8") as handle:
        existing = json.load(handle)
    by_key = {}
    merged = []
    for item in existing:
        key = record_key(item)
        if key in by_key:
            index = by_key[key]
            merged[index] = merge_record(merged[index], item)
        else:
            by_key[key] = len(merged)
            merged.append(item)
    added = 0
    for record in records:
        if not record.get("abstract"):
            fallback = semantic_abstract(record.get("title", ""))
            if fallback:
                record["abstract"] = fallback
                record["abstractStatus"] = "Semantic Scholar 回填"
        key = record_key(record)
        if key in by_key:
            index = by_key[key]
            merged[index] = merge_record(merged[index], record)
        else:
            by_key[key] = len(merged)
            merged.append(record)
            added += 1
    existing = merged
    with open(DATA_FILE, "w", encoding="utf-8") as handle:
        json.dump(existing, handle, ensure_ascii=False, indent=2)
        handle.write("\n")
    print(f"Collected {added} new papers from {source}; total {len(existing)}")


if __name__ == "__main__":
    main()
