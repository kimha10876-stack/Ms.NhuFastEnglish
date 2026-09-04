# Phase 0 Audit Baseline → After Migration

| Pattern | Before | After (excl. landing/blog public) |
|---------|--------|-----------------------------------|
| `amber-*` / hex colors | 386 | ~15 (Settings color presets, API category hex, SVG brand icons) |
| `rounded-md/lg/xl/2xl` | 614 | 0 |
| `text-xs` / small font | 693 | 0 under 13px (text-xs now maps to 13px) |
| `h-[38px]` | many | 0 |

## Deferred (not migrated)
- Landing, PublicBlog, BlogPostDetail

## Contrast note
Primary `#F5C518` + primary-foreground `hsl(26 30% 10%)` ≈ 10.5:1 — passes WCAG AA.
