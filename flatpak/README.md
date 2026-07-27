# Flatpak / Flathub packaging (Chaski)

This directory now contains only the Flathub-style source-build flow.

## Files

- `com.chaski.app.flathub.yml`: Flathub-style source-build manifest.
- `com.chaski.app.desktop`: desktop entry installed in Flatpak.
- `com.chaski.app.metainfo.xml`: AppStream metadata.
- `yarn-sources.json`: generated Node/Yarn dependency sources.
- `cargo-sources.json`: generated Cargo dependency sources.
- `update-generated-sources.sh`: refreshes `yarn-sources.json` and `cargo-sources.json`.
- `NEXT_STEPS.md`: command checklist to resume builds.

## Prerequisites

```bash
flatpak install --user -y flathub \
  org.flatpak.Builder \
  org.gnome.Platform//50 \
  org.gnome.Sdk//50 \
  org.freedesktop.Sdk.Extension.node24//25.08 \
  org.freedesktop.Sdk.Extension.rust-stable//25.08
```

## Refresh generated dependency sources

Run this when `yarn.lock` or `src-tauri/Cargo.lock` changes:

```bash
./flatpak/update-generated-sources.sh
```

## Prepare local source archive

```bash
./flatpak/prepare-source-archive.sh
```

## Build/install locally with Flathub builder

```bash
flatpak run --user --command=flathub-build org.flatpak.Builder --install flatpak/com.chaski.app.flathub.yml
```

## Run

```bash
flatpak run com.chaski.app
```

## Note for release submissions

`com.chaski.app.flathub.yml` is currently configured to use a local source archive (`flatpak/chaski-source.tar.gz`) so local tests include your latest unpushed changes.

Before Flathub submission, switch that source entry to a release/tag archive URL and set its `sha256`.
