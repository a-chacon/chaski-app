#!/usr/bin/env sh
set -eu

repo_root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
out_file="$repo_root/flatpak/chaski-source.tar.gz"

tmp_file=$(mktemp /tmp/chaski-source.XXXXXX.tar.gz)
trap 'rm -f "$tmp_file"' EXIT

tar \
  --exclude='./.git' \
  --exclude='./.flatpak-builder' \
  --exclude='./builddir' \
  --exclude='./flatpak-build' \
  --exclude='./repo' \
  --exclude='./node_modules' \
  --exclude='./dist' \
  --exclude='./src-tauri/target' \
  --exclude='./flatpak/chaski-source.tar.gz' \
  --exclude='./flatpak/.chaski-source.tar.gz.tmp' \
  -czf "$tmp_file" \
  -C "$repo_root" .

mv "$tmp_file" "$out_file"
trap - EXIT

if [ ! -f "$out_file" ]; then
  echo "Failed to create $out_file" >&2
  exit 1
fi

echo "Prepared source archive: $out_file"
