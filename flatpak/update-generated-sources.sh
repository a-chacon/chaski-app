#!/usr/bin/env sh
set -eu

flatpak run --command=flatpak-node-generator org.flatpak.Builder yarn -o flatpak/yarn-sources.json yarn.lock
flatpak run --command=flatpak-cargo-generator org.flatpak.Builder -o flatpak/cargo-sources.json src-tauri/Cargo.lock

echo "Updated flatpak/yarn-sources.json and flatpak/cargo-sources.json"
