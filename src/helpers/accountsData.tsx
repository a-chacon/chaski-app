import { AccountInterface } from "../interfaces";
import { invoke } from "@tauri-apps/api/core";

export const indexAccounts = async () => {
  try {
    const message = await invoke<string>("index_accounts");

    const response: AccountInterface[] = JSON.parse(message);

    return response;
  } catch (error) {
    console.error("Error indexing configurations:", error);
    throw new Error("Failed to indexing configurations");
  }
};
