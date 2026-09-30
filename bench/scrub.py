#!/usr/bin/env python3
"""
Removes personal data from eval results before they are committed to a public repo.

Usage:
    python3 bench/scrub.py <results-dir>

- The home folder becomes `~`, and the username left in other paths becomes `user`.
- The session header lists the account's connected services (`mcp_servers`); it is emptied.
- A paragraph where the assistant talks about those connectors is removed. The runner now passes
  `--strict-mcp-config`, so new runs should not load them; this covers the runs made before.

run_evals.py calls scrub() on every run it writes.
"""
import json
import re
import sys
from pathlib import Path

HOME = str(Path.home())
USER = Path.home().name
CONNECTORS = re.compile(r"Gmail|Google Calendar|Google Drive|conectores?\b|connectors?\b", re.I)


def clean_text(text: str) -> str:
    text = text.replace(HOME, "~").replace(USER, "user")
    if not CONNECTORS.search(text):
        return text
    paragraphs = re.split(r"(\n\s*\n)", text)
    # Dropping the last paragraph can leave a dangling `---` separator behind it.
    kept = "".join(p for p in paragraphs if not CONNECTORS.search(p)).rstrip("\n-\t ")
    return kept + ("\n" if text.endswith("\n") else "")


def clean_event(event):
    """Cleans every string inside a stream-json event; empties the connected-services list."""
    if event.get("type") == "system" and event.get("subtype") == "init":
        event["mcp_servers"] = []
    def walk(x):
        if isinstance(x, str):
            return clean_text(x)
        if isinstance(x, list):
            return [walk(v) for v in x]
        if isinstance(x, dict):
            return {k: walk(v) for k, v in x.items()}
        return x
    return walk(event)


def scrub(root: Path):
    for f in root.rglob("*"):
        if not f.is_file():
            continue
        if f.suffix == ".jsonl":
            lines = [json.dumps(clean_event(json.loads(l)), ensure_ascii=False)
                     for l in f.read_text().splitlines() if l.strip()]
            f.write_text("\n".join(lines))
        elif f.suffix in (".md", ".txt", ".json", ".html"):
            text = f.read_text()
            cleaned = clean_text(text) if f.suffix in (".md", ".txt") else \
                text.replace(HOME, "~").replace(USER, "user")
            if cleaned != text:
                f.write_text(cleaned)


if __name__ == "__main__":
    scrub(Path(sys.argv[1]))
