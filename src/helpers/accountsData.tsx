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

const parseCredentials = (credentials: string | object) => {
  if (typeof credentials === 'string') {
    try {
      return JSON.parse(credentials)
    } catch (error) {
      console.error('Error parsing credentials:', error)
      return {}
    }
  }
  return credentials
}

export const showAccount = async (accountId: number): Promise<AccountInterface> => {
  try {
    const message = await invoke<string>("show_account", {
      accountId: accountId
    });

    const response: CommandResponse = JSON.parse(message);

    if (!response.success) {
      throw new Error(response.message);
    }

    if (!response.data) {
      throw new Error("Account data not found in response");
    }

    if (response.data.credentials) {
      response.data.credentials = parseCredentials(response.data.credentials)
    }

    console.log(response.data)
    return response.data;
  } catch (error) {
    console.error("Error fetching account:", error);
    throw error instanceof Error ? error : new Error("Failed to fetch account");
  }
};

export const deleteAccount = async (accountId: number): Promise<void> => {
  try {
    const message = await invoke<string>("destroy_account", {
      accountId: accountId
    });

    const response: CommandResponse = JSON.parse(message);

    if (!response.success) {
      throw new Error(response.message);
    }
  } catch (error) {
    console.error("Error deleting account:", error);
    throw error instanceof Error ? error : new Error("Failed to delete account");
  }
};

export const createAccount = async (account: AccountInterface): Promise<AccountInterface> => {
  try {
    const accountToCreate = {
      ...account,
      credentials: typeof account.credentials === 'object' ?
        JSON.stringify(account.credentials) :
        account.credentials
    };

    const message = await invoke<string>("create_account", {
      newAccount: accountToCreate,
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
