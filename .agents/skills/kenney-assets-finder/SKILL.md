---
name: kenney-assets-finder
description: "Find and compare game asset packs in Kenney's preview directory when choosing 2D or 3D art, UI, icons, or audio. Use for asset discovery, not implementation."
---

# Kenney Asset Finder

Use this skill when the user wants to find, compare, or describe game assets available through Kenney's preview catalogue.

## Catalogue

- Start with the live [Kenney Game Assets preview directory](https://kenney.nl/data/itch/preview/). Its visible categories are 2D, 3D, UI, Icons, Audio, and Other.
- Re-read the page for each discovery request because the catalogue can change. Do not rely on a previously captured list as current.
- The page links to preview images, not necessarily to the asset's product page or download. Find the matching official Kenney or itch.io product page when the user needs details or a download link.
- The page says some packages may not be displayed. Describe a result as the visible catalogue, not as a guaranteed exhaustive inventory.

## Finding suitable packs

1. Use the project and request context to identify the needed asset type, visual style, and intended use. In this repository, the existing game has a dark purple and gold card-table style; treat that as a useful reference when relevant, not a requirement that overrides the user's request.
2. Browse the live catalogue and use its categories and package names to find candidates. Preserve each English package name exactly as shown.
3. Inspect preview images when available. For details that matter to the recommendation, consult the corresponding official pack page for its contents, formats, and license. Do not infer those facts from the title alone.
4. Present a concise Traditional Chinese table with the English pack name, Traditional Chinese name, category, and a short content/use description. Explain why a pack fits the request when recommending candidates. Link to the relevant official page when available.
5. If only the catalogue name or category could be inspected, label the description as a name-based summary. Do not imply that unseen files or exact contents were verified.

## Downloading when requested

- Use the Download action on the official pack page. Kenney may generate a short-lived download URL tied to the page session; if using HTTP tools, load the page first and keep its session and referrer. Do not reuse or hardcode a signed URL.
- When the page offers an optional donation, do not make a payment unless the user specifically asks for it; use the no-donation download option when appropriate.
- In this repository, keep the original archive at `assets/packs/kenney/<pack-slug>.zip` and extract it beside the archive into `assets/packs/kenney/<pack-slug>/`, preserving included license and source files. Respect any user-specified destination instead.
- Confirm the archive opens, summarize the extracted file types, and inspect an included preview when available. Keep the source pack intact; copy selected assets into runtime folders only when the user asks to integrate them.

## Boundaries

- Do not download, import, or modify project files as part of asset discovery. Do so only when the user asks for that work.
- Do not claim a pack is free, CC0, or suitable for commercial use without checking that pack's current official license information.
- Do not present a preview-image URL as a download link.
