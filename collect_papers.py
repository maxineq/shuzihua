#!/usr/bin/env python3
import json
import os
import re
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


def fetch_json(url):
    request = urllib.request.Request(
        url,
        headers={"User-Agent": "aesthetic-eval-library/1.0 research bot"},
    )
    with urllib.request.urlopen(request, timeout=30) as response:
        return json.load(response)


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


def classify(item):
    venue = clean_text(item.get("primary_location", {}).get("source", {}).get("display_name"))
    if venue:
        return venue, "正式发表信息待核验", "C"
    return "OpenAlex 未标注 venue", "开放元数据记录", "C"


def main():
    params = urllib.parse.urlencode({"search": QUERY, "per-page": LIMIT})
    payload = fetch_json(f"https://api.openalex.org/works?{params}")
    existing = json.load(open(DATA_FILE, encoding="utf-8")) if os.path.exists(DATA_FILE) else []
    by_doi = {item.get("doi"): item for item in existing if item.get("doi")}
    by_title = {clean_text(item.get("title")).lower(): item for item in existing}

    added = 0
    for item in payload.get("results", []):
        title = clean_text(item.get("title"))
        if not title:
            continue
        doi = item.get("doi") or ""
        if doi in by_doi or title.lower() in by_title:
            continue
        venue, original_source, level = classify(item)
        authors = [
            clean_text(author.get("author", {}).get("display_name"))
            for author in item.get("authorships", [])[:6]
        ]
        record = {
            "id": item.get("id", title),
            "title": title,
            "authors": [author for author in authors if author],
            "year": item.get("publication_year"),
            "abstract": reconstruct_abstract(item.get("abstract_inverted_index")),
            "venue": venue,
            "publicationType": "journal" if item.get("type") == "article" else "other",
            "discoverySource": "OpenAlex",
            "originalSource": original_source,
            "sourceLevel": level,
            "doi": doi,
            "url": item.get("primary_location", {}).get("landing_page_url") or item.get("id", ""),
            "tags": ["视觉美学"],
            "score": 0,
            "saved": False,
            "collectedAt": datetime.now(timezone.utc).isoformat(),
        }
        existing.insert(0, record)
        if doi:
            by_doi[doi] = record
        by_title[title.lower()] = record
        added += 1

    with open(DATA_FILE, "w", encoding="utf-8") as handle:
        json.dump(existing, handle, ensure_ascii=False, indent=2)
        handle.write("\n")
    print(f"Collected {added} new papers; total {len(existing)}")


if __name__ == "__main__":
    main()
