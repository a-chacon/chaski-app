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

interface CommandResponse {
  success: boolean;
  message: string;
  data?: AccountInterface;
}

export const fullSync = async (accountId: number): Promise<void> => {
  try {
    const message = await invoke<string>("full_sync", {
      accountId: accountId
    });

    const response: CommandResponse = JSON.parse(message);

    if (!response.success) {
      throw new Error(response.message);
    }
  } catch (error) {
    console.error("Error syncing account:", error);
    throw error instanceof Error ? error : new Error("Failed to sync account");
  }
};

export const createAccount = async (account: AccountInterface): Promise<AccountInterface> => {
  try {
    const message = await invoke<string>("create_account", {
      newAccount: account,
    });

    const response: CommandResponse = JSON.parse(message);

    if (!response.success) {
      throw new Error(response.message);
    }

    return response.data!;
  } catch (error) {
    console.error("Error creating account:", error);
    throw error instanceof Error ? error : new Error("Failed to create account");
  }
};
