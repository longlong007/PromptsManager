#!/usr/bin/env python3
"""Validate an architecture SVG against the `draw-architecture` skill rules.

Checks (stdlib only, no external dependencies):
    1. File exists and is non-empty.
    2. XML parses cleanly.
    3. No U+FFFD replacement characters (UTF-8 corruption).
    4. No '/' character in any <text> node's visible text.

Usage:
    python3 validate_svg.py <path/to/diagram.svg>

Exit codes:
    0  all checks pass
    1  one or more checks fail
    2  CLI usage error / file not found
"""
from __future__ import annotations

import re
import sys
import xml.etree.ElementTree as ET
from pathlib import Path


def validate(svg_path: str | Path) -> int:
    path = Path(svg_path)
    if not path.exists():
        print(f"[FAIL] file not found: {path}")
        return 2
    if path.stat().st_size == 0:
        print(f"[FAIL] file is empty: {path}")
        return 1

    raw = path.read_text(encoding="utf-8")
    issues: list[tuple[str, list[str]]] = []

    # 1. XML well-formed
    try:
        ET.fromstring(raw)
    except ET.ParseError as e:
        issues.append(("XML parse error", [str(e)]))

    # 2. UTF-8 sanity — no replacement characters
    if "\ufffd" in raw:
        first = raw.index("\ufffd")
        ctx = raw[max(0, first - 30) : first + 30].replace("\n", " ")
        issues.append(
            (
                "contains U+FFFD replacement character (UTF-8 corruption)",
                [f"first occurrence near offset {first}: ...{ctx}..."],
            )
        )

    # 3. No '/' in any visible <text> content
    visible = re.findall(r"<text[^>]*>([^<]*)</text>", raw)
    bad = [t for t in visible if "/" in t]
    if bad:
        details = [repr(b) for b in bad[:5]]
        if len(bad) > 5:
            details.append(f"... and {len(bad) - 5} more")
        issues.append((f"{len(bad)} visible text node(s) contain '/'", details))

    if issues:
        print(f"[FAIL] {path} — {len(issues)} issue(s):")
        for summary, details in issues:
            print(f"  - {summary}")
            for d in details:
                print(f"      {d}")
        return 1

    print(
        f"[OK] {path}  ·  {path.stat().st_size:,} bytes  ·  {len(visible)} text nodes"
    )
    return 0


def main() -> int:
    if len(sys.argv) < 2:
        print("Usage: python3 validate_svg.py <path/to/diagram.svg>")
        return 2
    return validate(sys.argv[1])


if __name__ == "__main__":
    sys.exit(main())
