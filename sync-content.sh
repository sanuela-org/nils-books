#!/usr/bin/env bash
# Vault -> quartz/content sync (one-way). The vault is canonical.
# Excludes everything that must never be published.
set -euo pipefail

VAULT=/opt/data/vaults/Nils-Books
CONTENT=/opt/data/quartz/content

rm -rf "$CONTENT"
mkdir -p "$CONTENT"

# no rsync on this image -> tar pipe
tar -C "$VAULT" \
  --exclude='./_sources' \
  --exclude='./_converted' \
  --exclude='./_templates' \
  --exclude='./.obsidian' \
  --exclude='./schema.md' \
  --exclude='./log.md' \
  --exclude='./proposal-*' \
  --exclude='./better-re-editing.md' \
  --exclude='./_attachments' \
  -cf - . | tar -C "$CONTENT" -xf -

# _attachments rule (Nils, 2026-10-07): graphics only. Covers and figures
# travel; text files in _attachments never publish. Text meant for the site
# gets its own directory (e.g. articles/) — added to the tar excludes then.
(cd "$VAULT" && find _attachments -type f \
  \( -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.png' -o -iname '*.gif' \
     -o -iname '*.webp' -o -iname '*.svg' -o -iname '*.avif' \) -print0 \
  | tar --null -T - -cf -) | tar -C "$CONTENT" -xf -

echo "synced $(find "$CONTENT" -name '*.md' | wc -l) md files, $(find "$CONTENT/_attachments" -type f | wc -l) attachment files"
