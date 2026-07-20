import { ArticleInterface } from "../../../interfaces";
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import moment from "moment";
import ArticleActions from "../../ArticleActions";
import { useAppContext } from "../../../AppContext";
import { updateArticleAsRead } from "../../../helpers/articlesData";

interface ArticleCardProps {
  article: ArticleInterface;
  header: boolean;
}

const ArticleCard: React.FC<ArticleCardProps> = ({
  article: inputArticle,
}) => {
  const [article, setArticle] = useState(inputArticle);
  const [isHovering, setIsHovering] = useState(false);
  const { currentMarkAsReadOnHover, articlesLayout: display } = useAppContext();

  const isCompact = display === "compact";
  const isGrid = display === "grid";

  const handleMouseOver = () => {
    setIsHovering(true);
  };

  const handleMouseOut = () => {
    setIsHovering(false);

    if (currentMarkAsReadOnHover && article.read === 0 && article.read_later !== 1) {
      updateArticleAsRead(article);
    }
  };

  if (isCompact) {
    return (
      <div
        key={article.id}
        className={`px-2 py-2 border-b border-default-200 ${article.read ? "opacity-75" : ""} ${article.hide ? "hidden" : ""}`}
        onMouseOver={handleMouseOver}
        onMouseOut={handleMouseOut}
      >
        <div className="flex items-center gap-2">
          {article.feed && (
            <Link
              to="/feeds/$feedId"
              params={{ feedId: article.feed.id!.toString() }}
              className="shrink-0 flex items-center gap-2 min-w-0 max-w-[30%]"
            >
              <img
                alt={article.feed.title}
                className="h-4 w-4 object-cover rounded-sm"
                src={article.feed.icon}
              />
              <span className="text-xs opacity-80 truncate">{article.feed.title}</span>
            </Link>
          )}

          <Link
            to="/articles/$articleId"
            params={{ articleId: article.id?.toString() || "" }}
            className="min-w-0 flex-1"
          >
            <h3 className="text-sm font-medium truncate">
              {article.title?.trim() || article.description?.trim() || "Untitled article"}
            </h3>
          </Link>

          <ArticleActions
            className={`${isHovering ? "visible" : "invisible"} shrink-0`}
            article={article}
            setArticle={setArticle}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      key={article.id}
      className={`p-2 rounded-xl  ${article.read ? "opacity-75" : ""} ${article.hide ? "hidden" : ""}`}
      onMouseOver={handleMouseOver}
      onMouseOut={handleMouseOut}
    >
      {article.feed && (
        <Link
          to="/feeds/$feedId"
          params={{ feedId: article.feed.id!.toString() }}
          className="flex gap-2 items-center pb-1"
        >
          <img
            alt={article.feed.title}
            className="h-5 w-5 object-cover rounded-sm"
            src={article.feed.icon}
          />
          <span className="text-sm line-clamp-1">{article.feed.title}</span>
        </Link>
      )}

      <Link
        to="/articles/$articleId"
        params={{ articleId: article.id?.toString() || "" }}
      >
        <h3 className="text-base md:text-lg line-clamp-2 font-semibold mb-1">
          {article.title}
        </h3>

        <p className={`opacity-75 text-sm ${isGrid ? "line-clamp-3" : "line-clamp-2"}`}>
          {article.description || ""}
        </p>
      </Link>

      <div className="flex justify-between items-center pt-1 mt-1">
        <p className="leading-6 text-sm opacity-80">
          {moment.utc(article.pub_date).fromNow()}
        </p>
        <ArticleActions
          className={`${isHovering ? "visible" : "invisible"}`}
          article={article}
          setArticle={setArticle}
        />
      </div>
    </div>
  );
};

export default ArticleCard;
