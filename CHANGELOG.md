# Changelog

All notable changes to this project will be documented in this file.

## 0.8.3 - 2026-10-24

### Added

- Export feeds to OPML from the new feed menu in the sidebar.

### Changed

- UI refactor: feed actions moved into a dedicated feed menu, and page actions for entry lists (index, feeds, folders, read later) are now normalized in a shared toolbar.

### Fixed

- Update feeds loop was not working; it now filters by account kind.
- Added database indexes to improve performance.

## 0.8.2 - 2026-10-18

### Added

- Entries are now inserted at the moment of importing an OPML, so imported feeds are populated immediately and folder refresh shows content.

### Fixed

- Hide the window on close so a second launch (single instance) can show it again.
- Catch errors in entries content to avoid failures when rendering malformed entries.

## 0.8.1 - 2026-10-16

### Added

- Pull down on the entry page to download the full content of the article.

### Changed

- Upgraded Tailwind CSS.

### Fixed

- Set external_id after adding a new feed in the app and syncing with Google Reader.
- Prevent duplicated entries being pulled on first page load.
- Fixes following the Tailwind CSS upgrade.

## 0.8.0 - 2026-10-12

### Added

- Android support. The app now runs on Android devices. This required a substantial UI refactor, so the app's appearance may change in this release.
- Internationalization (i18n) support. Spanish and English are supported.
- Home link in the window bar for quickly returning to the home view.
- Logs page to inspect application logs. This page helps diagnose problems in production.
- Improved Google Reader–compatible sync support; entries are now synced as well.

### Changed

- Mark entries as read on scroll instead of on hover (behavior change; may be a breaking UX change). Hover behavior does not work well on mobile, and marking on scroll is a more common pattern.

### Fixed

- Removed the account sync button from the accounts menu; Google Reader–style accounts now sync when entries are loaded.
- Scraping is now optional and must be triggered manually to be more respectful of publishers' pages.
- Removed duplicated titles from entry content.
- New accounts are set as the current account when created.
- "Read later" entries are always shown even if they were already marked as read.
- Links inside article views open in the external browser by default.
- Cache entries to preserve index/scroll position when returning to a list.
- Ensure the current account is correctly checked when loading local config and database data.
- Implement edit and sync for Google Reader–style accounts.

### CI

- Added Android build to CI pipelines.
