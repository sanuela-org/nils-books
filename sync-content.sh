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
  --exclude='./_attachments/all-sanuela-retreats.md' \
  --exclude='./_attachments/all-sanuela-retreats.odt' \
  -cf - . | tar -C "$CONTENT" -xf -

echo "synced $(find "$CONTENT" -name '*.md' | wc -l) md files"
