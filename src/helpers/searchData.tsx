import { invoke } from "@tauri-apps/api/core";
import { SearchResultsInterface } from "../interfaces";

export const fullTextSearch = async (text: string, accountId?: number) => {
  try {
    let response = await invoke<string>("full_text_search", {
      text: text,
      accountId: accountId,
    });

    const result: SearchResultsInterface = JSON.parse(response);
    return result;
  } catch (error) {
    console.error("Error fetching entries:", error);
  }
};
