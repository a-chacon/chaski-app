import { invoke } from "@tauri-apps/api/core";

export const renameFolder = async (current_name: string, new_name: string) => {
  try {
    const message = await invoke<string>("rename_folder", {
      currentName: current_name,
      newName: new_name,
    });
    var bool_value = message == 'true';

    return bool_value;
  } catch (error) {
    console.error("Error fetching articles:", error);
  }
};

export const deleteFolder = async (folder: string) => {
  try {
    const message = await invoke<string>("delete_folder", {
      folder: folder,
    });
    var bool_value = message == 'true';

    return bool_value;
  } catch (error) {
    console.error("Error fetching articles:", error);
  }
};
