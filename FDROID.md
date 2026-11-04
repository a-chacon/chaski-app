# Publishing Chaski on F-Droid: remaining work

Guide followed: https://f-droid.org/docs/Submitting_to_F-Droid_Quick_Start_Guide/

Application ID: `com.chaski.app`

## Already done in this repo

- `src-tauri/gen/android/app/build.gradle.kts`: release signing is optional. If `keystore.properties` is missing, the release build is unsigned instead of crashing. F-Droid signs the app itself.
- `src-tauri/tauri.conf.json`: `bundle.android.versionCode` is set to `8003`.
- `fastlane/metadata/android/en-US/`: `title.txt`, `short_description.txt`, `full_description.txt`, `changelogs/8003.txt`, `images/icon.png`, `images/phoneScreenshots/1.png` and `2.png`.

## Still to do in this repo

1. **Replace the screenshots.** `phoneScreenshots/1.png` and `2.png` are desktop screenshots. Replace them with real phone screenshots (PNG or JPG, 2-8 images).
2. **Verify that a clean Android build works without secrets.** Run `yarn install --frozen-lockfile && yarn tauri android build --apk --target aarch64` with no `keystore.properties`. Confirm that an unsigned APK is produced and note its output path. It goes into `output:` in the F-Droid metadata.
3. **Check the repo for non-free or binary content.** F-Droid's scanner rejects precompiled libraries and blobs.
   - Confirm that `src-tauri/gen/android/app/src/main/jniLibs/**` and `tauri.properties` are not committed. The app-level `.gitignore` already ignores them.
   - Confirm that no `.jar` or `.aar` files are committed.
   - Confirm that there are no proprietary fonts, assets or SDKs.
4. **Check the capabilities for Android.** `src-tauri/capabilities/default.json` is fine, and `desktop.json` should hold the desktop-only plugins. `tauri-plugin-updater` is already excluded on Android in `Cargo.toml`. Check that the frontend never calls the updater, autostart or single-instance plugins on Android.
5. **Release flow.** For every release:
   - Bump `version` in `src-tauri/tauri.conf.json`, `Cargo.toml` and `package.json`.
   - Bump `bundle.android.versionCode`. It must always increase. Tauri's own formula is `major*1000000 + minor*1000 + patch`, so 0.8.3 gives 8003. Keep using the same formula.
   - Add `fastlane/metadata/android/en-US/changelogs/<versionCode>.txt` (500 characters max).
   - Tag the release as `v<version>`, for example `v0.8.3`, and push the tag.
6. **Tag the F-Droid release commit.** Tag the commit containing the changes above. If `v0.8.3` already exists without them, either move the tag or release 0.8.4 with `versionCode` 8004 and a `changelogs/8004.txt`.
7. **Optional: update the README.** Add an F-Droid badge and an Android section to "Install", since the text currently lists only Windows, macOS and Linux.
8. **Reproducible builds (optional, decide before the first release).** F-Droid signs with its own key by default. Switching to your key later forces users to reinstall. Reproducible builds with Rust and Tauri are hard.

## Submit to fdroiddata

1. Fork https://gitlab.com/fdroid/fdroiddata and create a branch named `com.chaski.app`.
2. Create `metadata/com.chaski.app.yml`. This draft needs iteration, and it is worth comparing it with existing Tauri apps in fdroiddata:

```yaml
Categories:
  - Reading
  - Internet
License: GPL-3.0-or-later
AuthorName: a-chacon
WebSite: https://github.com/a-chacon/chaski-app
SourceCode: https://github.com/a-chacon/chaski-app
IssueTracker: https://github.com/a-chacon/chaski-app/issues
Changelog: https://github.com/a-chacon/chaski-app/blob/main/CHANGELOG.md

AutoName: Chaski

RepoType: git
Repo: https://github.com/a-chacon/chaski-app.git

Builds:
  - versionName: 0.8.3
    versionCode: 8003
    commit: v0.8.3
    output: src-tauri/gen/android/app/build/outputs/apk/universal/release/app-universal-release-unsigned.apk
    sudo:
      - apt-get update
      - apt-get install -y build-essential pkg-config libssl-dev nodejs npm
      - npm install -g yarn
    init: curl https://sh.rustup.rs -sSf | sh -s -- -y
    ndk: r27c
    build:
      - source $HOME/.cargo/env
      - rustup target add aarch64-linux-android
      - yarn install --frozen-lockfile
      - yarn tauri android build --apk --target aarch64

AutoUpdateMode: Version
UpdateCheckMode: Tags
UpdateCheckData: src-tauri/tauri.conf.json|"versionCode":\s*(\d+)|src-tauri/tauri.conf.json|"version":\s*"([\d.]+)"
CurrentVersion: 0.8.3
CurrentVersionCode: 8003
```

   Likely adjustments:
   - The output APK path. With `--target aarch64` the folder may be `arm64` instead of `universal`.
   - The NDK version, and the Node and Rust versions available on F-Droid's buildserver.
   - Whether F-Droid's network rules allow `rustup` and `yarn install` in the build step.
   - ABI splits. If you want several ABIs, each needs its own build block with its own `versionCode`, and the ABI digit must be the lowest digit, for example `VercodeOperation: 10 * %c + N`.
3. Test with the Docker buildserver from the guide:
   ```
   fdroid readmeta
   fdroid rewritemeta com.chaski.app
   fdroid checkupdates --allow-dirty com.chaski.app
   fdroid lint com.chaski.app
   fdroid build com.chaski.app
   ```
   You can also push the fork and let GitLab CI run the build.
4. Commit as `New App: com.chaski.app`, push the branch, and open a merge request against fdroiddata. Answer reviewer questions quickly.
5. After merge, expect 24-48 hours before the app appears in the F-Droid repository.

## Review checklist from F-Droid

- Public source repository with a FOSS license (GPL-3.0). Done.
- Only FOSS dependencies and build tools. No Google Play Services or Firebase.
- No ads, tracking or non-free network services. The Google Reader API sync only talks to servers the user configures, and it may need an `AntiFeatures: NonFreeNet` discussion.
- The author (you) agrees to the inclusion.
- Fastlane metadata is in the repo. Done.
- Each release is tagged.
