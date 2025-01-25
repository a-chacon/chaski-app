import { invoke } from "@tauri-apps/api/core";
import { FeedInterface } from "../interfaces";

export const updateAllArticlesAsRead = async () => {
  try {
    await invoke<string>("update_articles_as_read");
  } catch (error) {
    console.error("Error fetching articles:", error);
  }
};

export const updateArticlesAsReadByFolder = async (folder: string) => {
  try {
    await invoke<string>("update_articles_as_read_by_folder", {
      folder: folder,
    });
  } catch (error) {
    console.error("Error fetching articles:", error);
  }
};

export const updateArticlesAsReadByFeedId = async (feed_id: number) => {
  try {
    await invoke<string>("update_articles_as_read_by_feed_id", {
      feedId: feed_id,
    });
  } catch (error) {
    console.error("Error fetching articles:", error);
  }
};

export const refreshArticles = async (feed_id: number) => {
  try {
    await invoke<string>("collect_feed_content", {
      feedId: feed_id,
    });
  } catch (error) {
    console.error("Error refreshing articles by feed:", error);
  }
};

export const getFolders = async (): Promise<string[]> => {
  const response = await invoke<string>("list_folders", {});
  const folders: string[] = JSON.parse(response);
  return folders;
};

export const updateFeed = async (feed: FeedInterface) => {
  try {
    let id = feed.id || 0;
    const message = await invoke<string>("update_feed", {
      feedId: id,
      feed: feed,
    });

    const response_feed: FeedInterface = JSON.parse(message);

    return response_feed;
  } catch (error) {
    console.error("Error updating feed:", error);
    throw new Error("Failed to update feed");
  }
};

export const getFeed = async (feed_id: number) => {
  try {
    const message = await invoke<string>("show_feed", {
      feedId: feed_id,
    });

    const response_feed: FeedInterface = JSON.parse(message);

    return response_feed;
  } catch (error) {
    console.error("Error updating feed:", error);
    throw new Error("Failed to update feed");
  }
};

export const importOPML = async (file_path: string) => {
  try {
    await invoke<string>("import_opml", {
      filePath: file_path,
    });
  } catch (error) {
    console.error("Error importing OPML :", error);
    throw new Error("Failed to Import");
  }
};

export const exportOPML = async (file_path: string, feed_ids: string[]) => {
  try {
    await invoke<string>("export_opml", {
      filePath: file_path,
      feedIds: feed_ids,
    });
  } catch (error) {
    console.error("Error exporting OPML :", error);
    throw new Error("Failed to Export");
  }
};

export const indexFeeds = async (account_id: number) => {
  try {
    console.log("HERE")
    const message = await invoke<string>("index_feeds", {
      filterFilters: {
        account_id_eq: account_id,
      },
    });

    const response: FeedInterface[] = JSON.parse(message);

    return response;
  } catch (error) {
    console.error("Error indexing feeds:", error);
    throw new Error("Failed to indexing feed");
  }
};
