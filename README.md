<img src="https://raw.githubusercontent.com/a-chacon/chaski-app/main/src-tauri/icons/icon.png" alt="Chaski App Logo" width="200">

## Chaski App

**A calmer way to read the web.**

#### Key Features

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
- **Full-Text Search**: Search through your articles with ease.
- **Read Full Articles**: View the complete text of articles directly in the app.
- **Offline Mode**: Access your content even when you're offline. Just save it for read later and content will be downloaded (if possible).
- **User Feedback**: I read and value your feedback to improve the app further!

## Screenshots

![Screenshot of the main view of the app](https://raw.githubusercontent.com/a-chacon/chaski-app/main/screenshots/index.png)

![Screenshot of the main view of the app with list view](https://raw.githubusercontent.com/a-chacon/chaski-app/main/screenshots/index-list.png)

## Support

<a href="https://www.buymeacoffee.com/achacon" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/default-orange.png" alt="Buy Me A Coffee" height="41" width="174"></a>

## Install

You can [download](https://github.com/a-chacon/chaski-app/releases) the latest installable version of Chaski for Windows, macOS and Linux.

## Contributing

Contributions are welcome! If you find any issues or have ideas for new features, feel free to open an issue or submit a pull request. For feature requests, it's a good idea to discuss them beforehand to ensure they're aligned with the app's goals.

### Disclaimer

Please note that the codebase is still in an early stage. It was initially created as a learning project to explore Rust and solve my own needs. As such, the code is "dirty" and lacks proper tests (which will be added in the near future).

The project is open to large refactors and improvements. If you're interested in contributing, feel free to dive into the code, suggest improvements, or help clean it up.

### Prerequisites for development only

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
