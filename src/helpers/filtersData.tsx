import { invoke } from "@tauri-apps/api/core";
import { FilterInterface } from "../interfaces";

export const updateFilter = async (filter: FilterInterface) => {
  try {
    let id = filter.id || 0;
    const message = await invoke<string>("update_filter", {
      filterId: id,
      filter: filter,
    });

    const response: FilterInterface = JSON.parse(message);

    return response;
  } catch (error) {
    console.error("Error updating filter:", error);
    throw new Error("Failed to update filter");
  }
};

export const createFilter = async (filter: FilterInterface) => {
  try {
    const message = await invoke<string>("create_filter", {
      newFilter: filter,
    });

    const response: FilterInterface = JSON.parse(message);

    return response;
  } catch (error) {
    console.error("Error creating filter:", error);
    throw new Error("Failed to creating filter");
  }
};

export const destroyFilter = async (filter_id: number) => {
  try {
    await invoke<string>("destroy_filter", {
      filterId: filter_id,
    });
  } catch (error) {
    console.error("Error destroying filter:", error);
    throw new Error("Failed to destroying filter");
  }
};

export const indexFilters = async (feed_id: number) => {
  try {
    const message = await invoke<string>("index_filters", {
      filterFilters: {
        feed_id_eq: feed_id,
      },
    });

    const response: FilterInterface[] = JSON.parse(message);

    return response;
  } catch (error) {
    console.error("Error indexing filter:", error);
    throw new Error("Failed to indexing filter");
  }
};
