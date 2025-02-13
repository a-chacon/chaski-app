import { check } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';
import { invoke } from "@tauri-apps/api/core";
import { platform } from '@tauri-apps/plugin-os';


const updater = async (addNotification: (title: string, message: string, type: "default" | "primary" | "secondary" | "success" | "warning" | "danger", duration?: number) => void) => {

  async function get_env(name: string) {
    return await invoke("get_env", { name });
  }

  const currentPlatform = platform();
  const appimage = await get_env("APPIMAGE");

  const update = await check();

  if (update) {
    if (currentPlatform === 'linux' && appimage === '') {
      addNotification(
        "Update Available",
        `Version ${update.version} is available! Please download and install the new version manually from: https://github.com/a-chacon/chaski-app/releases/latest`,
        'warning',
        10000
      );
      return;
    }

    addNotification("Found Update", 'A new version of Chaski was found! It will be downloaded and installed.', 'success');
    console.log(
      `found update ${update.version} from ${update.date} with notes ${update.body}`
    );

    await update.downloadAndInstall();
    addNotification("Successfully updated", "Your app has been successfully updated to the latest version. We're now reloading the app to apply the changes.", 'success');
    await relaunch();
  } else {
    addNotification("No updates", "No updates for the moment.", 'secondary');
  }
};

export default updater;

