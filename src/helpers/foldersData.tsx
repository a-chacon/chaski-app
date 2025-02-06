import { invoke } from "@tauri-apps/api/core";

export const renameFolder = async (account_id: number, current_name: string, new_name: string) => {
  try {
    const message = await invoke<string>("rename_folder", {
      accountId: account_id,
      currentName: current_name,
      newName: new_name,
    });
    var bool_value = message == 'true';

    return bool_value;
  } catch (error) {
    console.error("Error fetching articles:", error);
  }
};

export const deleteFolder = async (account_id: number, folder: string) => {
  try {
    const message = await invoke<string>("delete_folder", {
      accountId: account_id,
      folder: folder,
    });
    var bool_value = message == 'true';

    return bool_value;
  } catch (error) {
    console.error("Error fetching articles:", error);
  }
};
