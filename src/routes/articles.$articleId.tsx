import { createFileRoute, useRouter, Link } from "@tanstack/react-router";
import MainSectionLayout from "../components/layout/MainSectionLayout";
import { useEffect, useState } from "react";
import { ArticleInterface } from "../interfaces";
import parse from "html-react-parser";
import ArticleActions from "../components/ArticleActions";
import ThumbnailOrMedia from "../components/ThumbnailOrMedia";
import ArticleShare from "../components/ArticleShare";
import { RiArrowLeftLine } from "@remixicon/react";
import { Button, Spinner } from "@heroui/react";
import { getArticle, updateArticleAsRead } from "../helpers/articlesData";
import { useAppContext } from "../AppContext";

export const Route = createFileRoute("/articles/$articleId")({
  component: Article,
});

function Article() {
  const { articleId } = Route.useParams();
  const [article, setArticle] = useState<ArticleInterface>();
  const [isLoadingArticle, setIsLoadingArticle] = useState(true);
  const { setSideBarOpen, currentTheme } = useAppContext();

  useEffect(() => {
    const loadArticle = async () => {
      setSideBarOpen(false);
      setIsLoadingArticle(true);

      try {
        const article = await getArticle(parseInt(articleId));
        if (!article) {
          return;
        }

        setArticle(article);
        updateArticleAsRead(article);
      } finally {
        setIsLoadingArticle(false);
      }
    };

    loadArticle();
  }, [articleId]);

  const { history } = useRouter();

  const isDarkTheme = (theme: string) => theme.endsWith('-dark');

  if (isLoadingArticle) {
    return (
      <MainSectionLayout>
        <div className="h-full w-full flex items-center justify-center gap-2 text-sm opacity-80">
          <Spinner size="sm" color="default" />
          Loading article...
        </div>
      </MainSectionLayout>
    );
  }

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
