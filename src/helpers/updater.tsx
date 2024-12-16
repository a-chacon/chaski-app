import { check } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';

const updater = async (addNotification: (title: string, message: string, type: "default" | "primary" | "secondary" | "success" | "warning" | "danger", duration?: number) => void) => {
  addNotification("Looking for updates", 'Looking for a new versions of Chaski, amazing things can come.', 'secondary');

  const update = await check();

  if (update) {
    addNotification("Found Update", 'A new version of Chaski was found! It will be downloaded and installed.', 'success');
    console.log(
      `found update ${update.version} from ${update.date} with notes ${update.body}`
    );
    let downloaded = 0;
    let contentLength = 0;

    await update.downloadAndInstall((event) => {
      switch (event.event) {
        case 'Started':
          contentLength = event.data.contentLength || 0;
          console.log(`started downloading ${event.data.contentLength} bytes`);
          break;
        case 'Progress':
          downloaded += event.data.chunkLength;
          console.log(`downloaded ${downloaded} from ${contentLength}`);
          break;
        case 'Finished':
          console.log('download finished');
          break;
      }
    });

    addNotification("Successfully updated", "Your app has been successfully updated to the latest version. We're now reloading the app to apply the changes.", 'warning');
    await relaunch();
  } else {
    addNotification("No updates", "No updates for the moment.", 'secondary');
  }
};

export default updater;

