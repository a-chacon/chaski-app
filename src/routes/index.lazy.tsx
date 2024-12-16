import { createLazyFileRoute } from "@tanstack/react-router";
import MainSectionLayout from "../components/layout/MainSectionLayout";
import { Button } from "@nextui-org/react";
import { RiRefreshLine } from "@remixicon/react";
import { useEffect } from "react";
import { ArticleInterface } from "../interfaces";
import { invoke } from "@tauri-apps/api/core";
import IndexArticles from "../components/IndexArticles";
import { useArticles } from "../IndexArticlesContext";
import { useNotification } from "../NotificationContext";

export const Route = createLazyFileRoute("/")({
  component: App,
});

export default function App() {
  const { addNotification } = useNotification();
  const { articles, setArticles, page, setPage, hasMore, setHasMore } = useArticles("/");

  useEffect(() => {
    if (page === 1 && articles.length == 0) {
      fetchArticles();
    }
  }, [page]);

  const fetchArticles = async () => {
    try {
      const message = await invoke<string>("list_articles", {
        page: page,
        items: 10,
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

    addNotification("Reloading", 'Entries are reloaded!', 'secondary');
  }

  return (
    <MainSectionLayout>
      <div className="flex flex-col p-4 max-w-screen-md mx-auto">
        <div className="flex border-b border-default-500 py-4 justify-between items-start">
          <div>
            <h1 className="text-3xl pt-2 font-bold">All</h1>
            <h2 className="pt-1 pb-4">Explore the latest articles and updates from your favorite sources, all in one place.</h2>
          </div>
          <div>
            <Button color="primary" isIconOnly variant="light" size="sm" onClick={handleReloadButton}>
              <RiRefreshLine></RiRefreshLine>
            </Button>
          </div>
        </div>
        <IndexArticles
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
