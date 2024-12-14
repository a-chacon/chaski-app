import { createFileRoute, useRouter, Link } from "@tanstack/react-router";
import MainSectionLayout from "../components/layout/MainSectionLayout";
import { useState, useEffect } from "react";
import { ArticleInterface } from "../interfaces";
import parse from "html-react-parser";
import ArticleActions from "../components/ArticleActions";
import ArticleShare from "../components/ArticleShare";
import { RiArrowLeftLine } from "@remixicon/react";
import { getArticle, updateArticleAsRead } from "../helpers/articlesData";
import { useAppContext } from "../AppContext";

export const Route = createFileRoute("/articles/$articleId")({
  component: Article,
});

function Article() {
  const { articleId } = Route.useParams();
  const [article, setArticle] = useState<ArticleInterface>();
  const { setSideBarOpen } = useAppContext();

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

  return (
    article && (
      <MainSectionLayout>
        <div className="flex flex-col p-4 mx-auto max-w-prose">
          <div className="mx-2 flex justify-between bg-primary-100 border border-primary-500 sticky top-3 p-2 rounded-xl shadow-xl">
            <div className="flex flex-row">
              <ArticleActions
                compact={false}
                article={article}
                setArticle={setArticle}
                backAfterAction={true}
              >
                <a href="#" onClick={() => history.back()}>
                  <RiArrowLeftLine className="text-primary-500" />
                </a>
              </ArticleActions>
            </div>
            <ArticleShare article={article} />
          </div>
          <div className="flex flex-col justify-between w-full">
            <Link
              to="/feeds/$feedId"
              params={{ feedId: article.feed?.id ?? "" }}
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
              <span>{article.author}</span>
            </div>
            {article.image && (
              <img
                src={article.image}
                alt={article.title}
                className="my-auto rounded-xl"
              />
            )}
          </div>
          <div className="prose md:prose-lg dark:prose-invert mx-auto">
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
