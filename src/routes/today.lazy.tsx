import { createLazyFileRoute } from "@tanstack/react-router";
import MainSectionLayout from "../components/layout/MainSectionLayout";
import { Button, Tooltip } from "@heroui/react";
import { RiRefreshLine, RiCheckDoubleLine } from "@remixicon/react";
import { useEffect } from "react";
import { ArticleInterface } from "../interfaces";
import { invoke } from "@tauri-apps/api/core";
import EntriesList from "../components/EntriesList";
import moment from "moment";
import { useArticles } from "../IndexArticlesContext";
import { updateAllArticlesAsRead } from "../helpers/feedsData";
import { useNotification } from "../NotificationContext";

export const Route = createLazyFileRoute("/today")({
  component: Today,
});

export default function Today() {
  const { addNotification } = useNotification();
  const { articles, setArticles, page, setPage, hasMore, setHasMore } = useArticles("/today");

  useEffect(() => {
    if (page === 1 && articles.length == 0) {
      fetchArticles();
    }
  }, [page]);

  const fetchArticles = async () => {
    try {
      const message = await invoke<string>("list_articles", {
        page: page,
        items: 20,
        filters: {
          pub_date_eq: moment().local().format("YYYY-MM-DD"),
          read_eq: 0
        },
      });

      const new_articles: ArticleInterface[] = JSON.parse(message);

      setArticles((prevArticles) => [...prevArticles, ...new_articles]);

      if (new_articles.length === 0) {
        setHasMore(false);
      }

      setPage((prevPage) => prevPage + 1);
    } catch (error) {
      console.error("Error fetching articles:", error);
    }
  };

  const handleReloadButton = () => {
    setPage(1);
    setArticles([]);
  }

  const handleUpdateArticlesAsRead = async () => {
    await updateAllArticlesAsRead();
    resetArticleList();

    addNotification("Updated", 'All entries were updated as read!', 'primary');
  };

  const resetArticleList = () => {
    setArticles([]);
    setPage(1);
  };

  return (
    <MainSectionLayout>
      <div className="flex flex-col p-4 max-w-screen-md mx-auto">
        <div className="flex border-b border-default-500 py-4 justify-between items-start">
          <div>
            <h1 className="text-3xl pt-2 font-bold">Today</h1>
            <h2 className="pt-1 pb-4">The insights you need to keep ahead</h2>
          </div>
          <div className="flex flex-row items-center gap-2">
            <Tooltip content="Update All Articles As Read">
              <Button
                isIconOnly
                variant="light"
                size="sm"
                onPress={handleUpdateArticlesAsRead}
              >
                <RiCheckDoubleLine></RiCheckDoubleLine>
              </Button>
            </Tooltip>
            <Tooltip content="Reload The Page's Articles">
              <Button color="primary" isIconOnly variant="light" size="sm" onPress={handleReloadButton}>
                <RiRefreshLine></RiRefreshLine>
              </Button>
            </Tooltip>
          </div>
        </div>
        <EntriesList
          key="index"
          articles={articles}
          fetchArticles={fetchArticles}
          hasMore={hasMore}
          header={true}
        />
      </div>
    </MainSectionLayout>
  );
}
