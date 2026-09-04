#!/usr/bin/env python3
"""Bulk migrate frontend TSX files to design system v2 tokens."""

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "src"

SKIP_DIRS = {
    "features/landing",
    "features/blog/PublicBlogPage.tsx",
    "features/blog/BlogPostDetailPage.tsx",
}

AMBER_MAP = {f"amber-{n}": f"primary-{n}" for n in [50, 100, 200, 300, 400, 500, 600, 700, 800, 900]}

REPLACEMENTS = [
    *[(k, v) for k, v in AMBER_MAP.items()],
    ("rounded-2xl", "rounded"),
    ("rounded-xl", "rounded"),
    ("rounded-lg", "rounded"),
    ("rounded-md", "rounded"),
    ("h-[38px]", "h-9"),
    ("h-[34px]", "h-8"),
    ("text-[11px]", "text-xs"),
    ("text-[10px]", "text-xs"),
    ("text-[9px]", "text-xs"),
    (' maxWidth="default"', ""),
    (' maxWidth="wide"', ""),
    (' maxWidth="full"', ""),
    (' className="max-w-5xl"', ""),
    (' className="max-w-5xl ', ' className="'),
    ("text-gray-900", "text-ink-900"),
    ("bg-gray-50", "bg-muted"),
    ("border-gray-200", "border-border"),
    ("border-gray-100", "border-border"),
    ("text-gray-500", "text-muted-foreground"),
    ("text-gray-400", "text-muted-foreground"),
    ("text-gray-600", "text-muted-foreground"),
    ("text-gray-700", "text-foreground"),
    ("text-gray-800", "text-foreground"),
    ("bg-gray-100", "bg-muted"),
    ("bg-white", "bg-background"),
    ("hover:bg-gray-100", "hover:bg-muted"),
    ("hover:bg-gray-50", "hover:bg-muted/50"),
    ("hover:bg-gray-200", "hover:bg-muted/80"),
]

def should_skip(path: Path) -> bool:
    rel = str(path.relative_to(ROOT))
    if rel == "features/blog/PublicBlogPage.tsx":
        return True
    if rel == "features/blog/BlogPostDetailPage.tsx":
        return True
    if rel.startswith("features/landing/"):
        return True
    return False

def migrate_file(path: Path) -> bool:
    content = path.read_text(encoding="utf-8")
    original = content

    for old, new in REPLACEMENTS:
        content = content.replace(old, new)

    # PageLayout with combined className cleanup
    content = re.sub(
        r'<PageLayout>\s*',
        "<PageLayout>\n",
        content,
    )

    if content != original:
        path.write_text(content, encoding="utf-8")
        return True
    return False

def main():
    changed = 0
    for path in ROOT.rglob("*.tsx"):
        if should_skip(path):
            continue
        if migrate_file(path):
            changed += 1
            print(f"updated: {path.relative_to(ROOT)}")
    print(f"\nTotal files updated: {changed}")

if __name__ == "__main__":
    main()
