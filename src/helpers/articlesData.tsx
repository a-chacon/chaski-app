import { invoke } from "@tauri-apps/api/core";
import { ArticleInterface } from "../interfaces";

export const getArticle = async (article_id: number) => {
  try {
    const message = await invoke<string>("show_article", {
      articleId: article_id,
    });

    const response_article: ArticleInterface = JSON.parse(message);

    return response_article;
  } catch (error) {
    console.error("Error fetching articles:", error);
  }
};

export const updateArticle = async (article: ArticleInterface) => {
  try {
    let id = article.id || 0;
    const message = await invoke<string>("update_article", {
      articleId: id,
      article: article,
    });

    const response_article: ArticleInterface = JSON.parse(message);

    return response_article;
  } catch (error) {
    console.error("Error updating article:", error);
    throw new Error("Failed to update article");
  }
};

export const updateArticleAsRead = async (article: ArticleInterface) => {
  if (article && article.read !== 1) {
    article.read = 1;

    try {
      const response = await updateArticle(article);
      return response; // Return the updated article from the API
    } catch (error) {
      console.error("Error updating article:", error);
      throw new Error("Failed to update article");
    }
  } else {
    return article; // Return the article as is if already marked as read
  }
};

export const updateArticleAsUnRead = async (article: ArticleInterface) => {
  if (article && article.read !== 0) {
    // Check if already marked as read
    article.read = 0;

    try {
      const response = await updateArticle(article);
      return response; // Return the updated article from the API
    } catch (error) {
      console.error("Error updating article:", error);
      throw new Error("Failed to update article");
    }
  } else {
    return article;
  }
};

export const updateArticleReadLater = async (article: ArticleInterface) => {
  if (article && article.read_later !== 1) {
    // Check if already marked as read
    article.read_later = 1;
    article.read = 0;

    try {
      const response = await updateArticle(article);
      return response; // Return the updated article from the API
    } catch (error) {
      console.error("Error updating article:", error);
      throw new Error("Failed to update article");
    }
  } else {
    return article; // Return the article as is if already marked as read
  }
};

export const updateArticleNotReadLater = async (article: ArticleInterface) => {
  if (article && article.read_later !== 0) {
    // Check if already marked as read
    article.read_later = 0;

    try {
      const response = await updateArticle(article);
      return response; // Return the updated article from the API
    } catch (error) {
      console.error("Error updating article:", error);
      throw new Error("Failed to update article");
    }
  } else {
    return article;
  }
};

export const updateArticleAsReadAndHide = async (article: ArticleInterface) => {
  if (article) {
    article.read = 1;
    article.hide = 1;

    try {
      const response = await updateArticle(article);
      return response;
    } catch (error) {
      console.error("Error updating article:", error);
      throw new Error("Failed to update article");
    }
  } else {
    return article;
  }
};

export const scrapeAndUpdateArticle = async (articleId: number): Promise<ArticleInterface> => {
  try {
    const message = await invoke<string>("scrape_and_update_article", {
      articleId: articleId
    });

    const response: { success: boolean; message: string; data?: ArticleInterface } = JSON.parse(message);

    if (!response.success) {
      throw new Error(response.message);
    }

    if (!response.data) {
      throw new Error("Article data not found in response");
    }

    return response.data;
  } catch (error) {
    console.error("Error scraping and updating article:", error);
    throw error instanceof Error ? error : new Error("Failed to scrape and update article");
  }
};
