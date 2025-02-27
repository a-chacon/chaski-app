import { createFileRoute, useRouter, Link } from "@tanstack/react-router";
import MainSectionLayout from "../components/layout/MainSectionLayout";
import { useState, useEffect } from "react";
import { ArticleInterface } from "../interfaces";
import parse from "html-react-parser";
import ArticleActions from "../components/ArticleActions";
import ThumbnailOrMedia from "../components/ThumbnailOrMedia";
import ArticleShare from "../components/ArticleShare";
import { RiArrowLeftLine, RiImportLine } from "@remixicon/react";
import { Tooltip, Button } from "@heroui/react";
import { getArticle, updateArticleAsRead, scrapeAndUpdateArticle } from "../helpers/articlesData";
import { useAppContext } from "../AppContext";

export const Route = createFileRoute("/articles/$articleId")({
  component: Article,
});

function Article() {
  const { articleId } = Route.useParams();
  const [article, setArticle] = useState<ArticleInterface>();
  const { setSideBarOpen } = useAppContext();
  const [isFetchingContent, setIsFetchingContent] = useState(false);

  const {
    currentTheme,
  } = useAppContext();

  useEffect(() => {
    setSideBarOpen(false);
    getArticle(parseInt(articleId)).then((article) => {
      if (article) {
        setArticle(article);
        updateArticleAsRead(article);
      }
    });
  }, [articleId]);

  const { history } = useRouter();

  const isDarkTheme = (theme: string) => theme.endsWith('-dark');

  return (
    article && (
      <MainSectionLayout>
        <div className="flex flex-col p-4 mx-auto max-w-prose">
          <div className="mx-2 flex justify-between bg-primary-100 border border-primary-500 sticky top-3 p-1.5 rounded-xl shadow-xl">
            <div className="flex flex-row">
              <ArticleActions
                compact={false}
                article={article}
                setArticle={setArticle}
                backAfterAction={true}
              >
                <Button
                  color="primary"
                  variant="flat"
                  isIconOnly
                  size="sm"
                  onPress={() => history.back()}
                >
                  <RiArrowLeftLine className="text-primary-500" />
                </Button>

                <Tooltip content="Fetch original article content">
                  <Button
                    color="primary"
                    variant="light"
                    isLoading={isFetchingContent}
                    isIconOnly
                    size="sm"
                    onPress={() => {
                      setIsFetchingContent(true);
                      scrapeAndUpdateArticle(article.id!)
                        .then(updatedArticle => {
                          setArticle({
                            ...article,
                            ...updatedArticle
                          });
                        })
                        .catch(error => {
                          console.error("Failed to refresh article:", error);
                        })
                        .finally(() => setIsFetchingContent(false));
                    }}
                  >
                    <RiImportLine className="w-6" />
                  </Button>
                </Tooltip>
              </ArticleActions>
            </div>
            <ArticleShare article={article} />
          </div>
          <div className="flex flex-col justify-between w-full">
            <Link
              to="/feeds/$feedId"
              params={{ feedId: article.feed!.id!.toString() }}
              className="flex gap-2 items-center pt-6"
            >
              <img
                alt={article.feed?.title}
                className="h-5 w-5 object-cover"
                src={article.feed?.icon}
              />
              <span className="text-sm line-clamp-1">
                {article.feed?.title}
              </span>
            </Link>
            <div className="flex flex-col py-6">
              <h1 className="text-xl md:text-3xl font-semibold">
                {article.title}
              </h1>
            </div>

            <ThumbnailOrMedia
              article={article}
            />

          </div>
          <div className={`prose md:prose-lg text-foreground prose-a:text-foreground mx-auto ${isDarkTheme(currentTheme) ? 'prose-invert' : ''}`}>
            <p className="py-6 line-clamp-3">
              {parse(article.description || "")}
            </p>
            <hr />
            {parse(article.content || "")}
          </div>
        </div>
      </MainSectionLayout>
    )
  );
}

export default Article;
