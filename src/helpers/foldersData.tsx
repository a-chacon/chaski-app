import { invoke } from "@tauri-apps/api/core";
import { ApiResponse } from "../interfaces";

export const renameFolder = async (account_id: number, current_name: string, new_name: string) => {
  try {
    const message = await invoke<string>("rename_folder", {
      accountId: account_id,
      currentName: current_name,
      newName: new_name,
    });

    const response: ApiResponse<String> = JSON.parse(message);

    return response;
  } catch (error) {
    console.error("Error renaming folder:", error);
    throw new Error("Error renaming folder:");
  }
};

export const deleteFolder = async (account_id: number, folder: string) => {
  try {
    const message = await invoke<string>("delete_folder", {
      accountId: account_id,
      folder: folder,
    });

    const response: ApiResponse<String> = JSON.parse(message);

    return response;
  } catch (error) {
    console.error("Error deleting folder:", error);
    throw new Error("Error deleting folder:");
  }
};
