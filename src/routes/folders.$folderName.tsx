import { ArticleInterface } from "../interfaces";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import MainSectionLayout from "../components/layout/MainSectionLayout";
import IndexArticles from "../components/IndexArticles";
import { useArticles } from "../IndexArticlesContext";
import { Button } from "@nextui-org/react";
import { RiRefreshLine } from "@remixicon/react";
import { useNotification } from "../NotificationContext";

export const Route = createFileRoute("/folders/$folderName")({
  component: Folder,
});

export default function Folder() {
  const { addNotification } = useNotification();
  const { folderName } = Route.useParams();
  const { articles, setArticles, page, setPage, hasMore, setHasMore } =
    useArticles(folderName);

  useEffect(() => {
    if (page === 1 && articles.length == 0) {
      fetchArticles();
    }
  }, [page]);

  const fetchArticles = async () => {
    try {
      const message = await invoke<string>("list_articles", {
        page,
        items: 10,
        filters: { folder_eq: folderName, read_eq: 0 },
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

    addNotification("Reloaded", 'Entries are reloaded!', 'primary');
  };

  return (
    <MainSectionLayout>
      <div className="flex flex-col p-4 max-w-screen-md mx-auto">
        <div className="flex flex-col border-b py-4 justify-between items-start">
          <div className="flex flex-row justify-between w-full">
            <div className="flex flex-row">
              <h1 className="text-xl md:text-3xl font-bold">{folderName}</h1>
            </div>

            <div>
              <Button
                color="primary"
                isIconOnly
                variant="light"
                size="sm"
                onClick={handleReloadButton}
              >
                <RiRefreshLine></RiRefreshLine>
              </Button>
            </div>
          </div>
        </div>
        <IndexArticles
          key={folderName}
          articles={articles}
          fetchArticles={fetchArticles}
          hasMore={hasMore}
          header={true}
        />
      </div>
    </MainSectionLayout>
  );
}
