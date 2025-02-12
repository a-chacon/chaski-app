import { ArticleInterface } from "../interfaces";
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import moment from "moment";
import ArticleActions from "./ArticleActions";
import { useAppContext } from "../AppContext";
import {
  updateArticleAsRead,
} from "../helpers/articlesData";

interface ArticleCardProps {
  article: ArticleInterface;
  header: boolean;
}

interface LayoutStyles {
  [key: string]: {
    container: string;
    imageWrapper: string;
    textWrapper: string;
  };
}

const layoutStyles: LayoutStyles = {
  side: {
    container: "flex flex-row gap-2",
    imageWrapper: "w-1/3",
    textWrapper: "w-2/3",
  },
  card: {
    container: "flex flex-col-reverse gap-2",
    imageWrapper: "w-full",
    textWrapper: "w-full",
  },
};

const ArticleCard: React.FC<ArticleCardProps> = ({
  article: inputArticle,
  header,
}) => {
  const [article, setArticle] = useState(inputArticle);
  const [isHovering, setIsHovering] = useState(false);
  const {
    currentMarkAsReadOnHover
  } = useAppContext();

  const { articlesLayout: display } = useAppContext();

  const handleMouseOver = () => {
    setIsHovering(true);
  };


  const handleMouseOut = () => {
    setIsHovering(false);

    if (currentMarkAsReadOnHover && article.read == 0 && article.read_later !== 1) {
      updateArticleAsRead(article);
    }
  };

  const { container, imageWrapper, textWrapper } =
    layoutStyles[display] || layoutStyles.card;

  return (
    <div
      key={article.id}
      className={`p-2 py-4 mb-6 rounded-xl border-default-500 ${article.read ? "opacity-75" : ""} ${article.hide ? "hidden" : ""} `}
    >
      {header && (
        <Link
          to="/feeds/$feedId"
          params={{ feedId: article.feed!.id!.toString() }}
          className="flex gap-2 items-center pb-2"
        >
          <img
            alt={article.feed?.title}
            className="h-5 w-5 object-cover"
            src={article.feed?.icon}
          />
          <span className="text-sm line-clamp-1">{article.feed?.title}</span>
        </Link>
      )}
      <div
        onMouseOver={handleMouseOver}
        onMouseOut={handleMouseOut}
        className={`${container} py-2 h-full`}
      >
        <div className={`${textWrapper} flex flex-col flex-grow`}>
          <Link
            to="/articles/$articleId"
            params={{ articleId: article.id?.toString() || "" }}
          >
            <h3 className="text-lg md:text-xl font-semibold mb-2">
              {article.title}
            </h3>
            <div className="hidden md:block opacity-75">
              <p className="mb-2 line-clamp-2 text-sm">
                {article.description || ""}
              </p>
            </div>
          </Link>
          <div className="flex justify-between pt-2 mt-auto">
            <p className="leading-6 text-sm">
              {moment.utc(article.pub_date).fromNow()}
            </p>
            {isHovering && (
              <ArticleActions
                className=""
                article={article}
                setArticle={setArticle}
              >
              </ArticleActions>
            )}
          </div>
        </div>

        {article.image && (
          <Link
            to="/articles/$articleId"
            params={{ articleId: article.id?.toString() || "" }}
            className={imageWrapper}
          >
            <img
              className="rounded-xl object-cover w-full h-auto aspect-video"
              src={article.image}
              alt={article.title}
            />
          </Link>
        )}
      </div>
    </div>
  );
};

export default ArticleCard;
