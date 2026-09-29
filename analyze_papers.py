#!/usr/bin/env python3
"""Validate and index manually prepared Markdown analyses."""
from pathlib import Path
ROOT = Path(__file__).resolve().parent
OUT = ROOT / "analysis"
def main():
    OUT.mkdir(exist_ok=True)
    files = sorted(p for p in OUT.glob("*.md") if p.name != "README.md")
    lines = ["# 论文技术解析索引", "", "分析文件由人工导入：请将论文内容交给对话助手翻译与解析，保存为 Markdown 后放入本目录。", ""]
    lines += [f"- [{p.stem}]({p.name})" for p in files]
    (OUT / "README.md").write_text("\\n".join(lines) + "\\n", encoding="utf-8")
    print(f"Indexed {len(files)} manual Markdown analyses; LLM disabled")
if __name__ == "__main__": main()
