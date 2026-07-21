import { invoke } from "@tauri-apps/api/core";
import { EntryInterface } from "../interfaces";

export const getEntry = async (entry_id: number) => {
  try {
    const message = await invoke<string>("show_entry", {
      entryId: entry_id,
    });

    const response_entry: EntryInterface = JSON.parse(message);

    return response_entry;
  } catch (error) {
    console.error("Error fetching entries:", error);
  }
};

export const updateEntry = async (entry: EntryInterface) => {
  try {
    let id = entry.id || 0;
    const message = await invoke<string>("update_entry", {
      entryId: id,
      entry: entry,
    });

    const response_entry: EntryInterface = JSON.parse(message);

    return response_entry;
  } catch (error) {
    console.error("Error updating entry:", error);
    throw new Error("Failed to update entry");
  }
};

export const updateEntryAsRead = async (entry: EntryInterface) => {
  if (entry && entry.read !== 1) {
    entry.read = 1;

    try {
      const response = await updateEntry(entry);
      return response; // Return the updated entry from the API
    } catch (error) {
      console.error("Error updating entry:", error);
      throw new Error("Failed to update entry");
    }
  } else {
    return entry; // Return the entry as is if already marked as read
  }
};

export const updateEntryAsUnRead = async (entry: EntryInterface) => {
  if (entry && entry.read !== 0) {
    // Check if already marked as read
    entry.read = 0;

    try {
      const response = await updateEntry(entry);
      return response; // Return the updated entry from the API
    } catch (error) {
      console.error("Error updating entry:", error);
      throw new Error("Failed to update entry");
    }
  } else {
    return entry;
  }
};

export const updateEntryReadLater = async (entry: EntryInterface) => {
  if (entry && entry.read_later !== 1) {
    // Check if already marked as read
    entry.read_later = 1;
    entry.read = 0;

    try {
      const response = await updateEntry(entry);
      return response; // Return the updated entry from the API
    } catch (error) {
      console.error("Error updating entry:", error);
      throw new Error("Failed to update entry");
    }
  } else {
    return entry; // Return the entry as is if already marked as read
  }
};

export const updateEntryNotReadLater = async (entry: EntryInterface) => {
  if (entry && entry.read_later !== 0) {
    // Check if already marked as read
    entry.read_later = 0;

    try {
      const response = await updateEntry(entry);
      return response; // Return the updated entry from the API
    } catch (error) {
      console.error("Error updating entry:", error);
      throw new Error("Failed to update entry");
    }
  } else {
    return entry;
  }
};

export const updateEntryAsReadAndHide = async (entry: EntryInterface) => {
  if (entry) {
    entry.read = 1;
    entry.hide = 1;

    try {
      const response = await updateEntry(entry);
      return response;
    } catch (error) {
      console.error("Error updating entry:", error);
      throw new Error("Failed to update entry");
    }
  } else {
    return entry;
  }
};


