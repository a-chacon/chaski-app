<h1 align="center">
  <br>
  <a href="https://chaski.a-chacon.com"><img src="http://chaski.a-chacon.com/chaski.png" alt="Chaski App Logo" width="200"></a>
  <br>
  Chaski
  <br>
</h1>

<h4 align="center">
  A beautifully designed, privacy-focused feed reader that keeps you updated.<br/> Build on the top of
  <a href="https://tauri.app/" target="_blank">Tauri</a>.
</h4>

<p align="center">
  <a href="https://chaski.a-chacon.com"><img src="http://chaski.a-chacon.com/chaski.gif" alt="Chaski App Demo"></a>
</p>

<p align="center">
  <a href="#key-features">Key Features</a> •
  <a href="#download">Download</a> •
  <a href="#contributing">Contribute</a> •
  <a href="#license">License</a>
</p>

## Support

<a href="https://www.buymeacoffee.com/achacon" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/default-orange.png" alt="Buy Me A Coffee" height="41" width="174"></a>

# Key Features

- **Privacy First**: No ads, telemetry, or any data leaving your device.
- **Auto-discovery of RSS/Atom**: The app will automatically find the URL when possible.
- **Modern UI**: A clean, soft, and modern interface that helps you focus on reading without distractions.
- **Dark/Light Mode**: Switch between dark and light modes over multiple themes for optimal viewing.
- **Import/Export OPML**: Import and export your feeds in OPML format.
- **Organize Feeds by Accounts and Folders**: Categorize your feeds for better organization.
- **Customizable Filters**: Configure custom filters for each feed.
- **New Entry Notifications**: Get notified when new content is available.
- **Configurable Fonts**: Choose and customize your preferred fonts for reading.
- **Multiple Account Support**: Manage both local accounts and Google Reader API-compliant accounts like FreshRSS, Miniflux, and TinyTiny RSS.
- **API Sync with Google Reader API**: Sync your feeds with popular services like **FreshRSS**, **Miniflux**, and **TinyTiny RSS** for a seamless experience. Notice this is work in progress.
- **Full-Text Search**: Search through your articles with ease.
- **Read Full Articles**: View the complete text of articles directly in the app.
- **Offline Mode**: Access your content even when you're offline.
- **Built with Tauri**: A cross-platform app that works on Linux, Windows, and macOS. Android support coming soon.
- **User Feedback**: I read and value your feedback to improve the app further!

### On the Roadmap

- [ ] **Multiple Content Views**

  - [ ] Video Content
  - [ ] Podcast Content
  - [ ] Image Content
  - [x] Article Content
  - [x] Microblog Content

- [ ] **Multiple Accounts Support** (In Progress)

  - [x] Local account management
    - [x] Create/Delete local RSS/ATOM accounts.
    - [x] Export/Import OPML
  - [ ] **Google Reader API**. (FreshRSS, Miniflux, TinyTiny Rss, etc.)
    - [x] Login
    - [x] Sync Subscriptions/Feeds
    - [x] Create/Update/Delete Subscription/feed
    - [x] Sync Folder/Category
    - [x] Create/Update/Delete Folder/Category
    - [ ] Sync Entries/Articles Read/Unread
  - [ ] **Bluesky**.
    - [ ] Login
    - [ ] Sync Feed
    - [ ] Create Post
      - [ ] Create Post from RSS/ATOM entry. (Easy share)
  - [ ] **Mastodon**.
    - [ ] Login
    - [ ] Sync Feed
    - [ ] Create Post
      - [ ] Create Post from RSS/ATOM entry. (Easy share)

- [ ] **Offline Mode Enhancements**

  - [ ] Improve offline article caching (Images).
  - [x] Pull complete article. (If the page use JavaScript then it will fail)

- [ ] **Multilingual Support**

  - [ ] Add Spanish language support
  - [ ] Add support for additional languages

- [ ] **Mobile Version**

  - [ ] Compile for Android
  - [ ] Release Android version
  - [ ] Compile for IOS
  - [ ] Release IOS version

## Download

You can [download](https://github.com/a-chacon/chaski-app/releases) the latest installable version of Chaski for Windows, macOS and Linux.

## Contributing

Contributions are welcome! If you find any issues or have ideas for new features, feel free to open an issue or submit a pull request. For feature requests, it's a good idea to discuss them beforehand to ensure they're aligned with the app's goals.

### Disclaimer

Please note that the codebase is still in an early stage. It was initially created as a learning project to explore Rust and solve my own needs. As such, the code is "dirty" and lacks proper tests (which will be added in the near future).

The project is open to large refactors and improvements. If you're interested in contributing, feel free to dive into the code, suggest improvements, or help clean it up.

### Prerequisites

- Install Node.js. I recommend you to use [NVM](https://github.com/nvm-sh/nvm).
- Install yarn. [Here](https://classic.yarnpkg.com/lang/en/docs/install/#debian-stable) is the manual.
- Install Rust. You can find way in [here](https://www.rust-lang.org/tools/install)
- Follow the [Tauri setup guide](https://v2.tauri.app/start/prerequisites/)
- Run yarn install

### Develop

It is easy to start developing

```bash
yarn tauri dev
```

## License

This project is licensed under the GNU General Public License v3.0 - see the LICENSE file for details.
