import { ArticleInterface } from "../../../interfaces";
import { useState } from "react";
import moment from "moment";
import ArticleActions from "../../ArticleActions";
import { Link } from "@tanstack/react-router";
import { Tooltip } from "@heroui/react";
import { RiExternalLinkLine } from "@remixicon/react";
import { useAppContext } from "../../../AppContext";
import { updateArticleAsRead } from "../../../helpers/articlesData";

interface CommentCardProps {
  article: ArticleInterface;
  header: boolean;
}

interface LayoutStyles {
  [key: string]: {
    container: string;
  };
}

const layoutStyles: LayoutStyles = {
  side: {
    container: "flex flex-row gap-2 justify-between items-center",
  },
  card: {
    container: "flex flex-col gap-2",
  },
};

const CommentCard: React.FC<CommentCardProps> = ({
  article: inputArticle,
}) => {
  const [article, setArticle] = useState(inputArticle);
  const [isHovering, setIsHovering] = useState(false);
  const { currentMarkAsReadOnHover } = useAppContext();
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

  return (
    <div
      key={article.id}
      className={`p-2 py-4 mb-6 rounded-xl border-default-500 ${article.read ? "opacity-75" : ""} ${article.hide ? "hidden" : ""}`}
      onMouseOver={handleMouseOver}
      onMouseOut={handleMouseOut}
    >
      <div className="flex flex-col gap-2">
        <div className={layoutStyles[display].container}>
          <div className="flex gap-2 items-center">
            <Link
              to="/feeds/$feedId"
              params={{ feedId: article.feed!.id!.toString() }}
              className="flex gap-2 items-center pb-2"
            >
              <img
                alt={article.feed?.title}
                className="h-8 w-8 rounded-full object-cover"
                src={article.feed?.icon}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'chaski.png';
                  target.onerror = null;
                }}
              />
              <div className="flex flex-col">
                <span className="text-sm font-medium">{(article.feed?.title?.replace(/\(.*?\)/g, '')?.trim()?.startsWith('@') ? article.feed.title.replace(/\(.*?\)/g, '').trim() : `@${article.feed?.title?.replace(/\(.*?\)/g, '').trim()}`)}</span>
                <span className="text-xs text-gray-500">
                  {new URL(article.feed?.link!).hostname}
                </span>
              </div>
            </Link>
          </div>
          <p className="text-xs text-gray-500">
            {moment.utc(article.pub_date).fromNow()}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-base  text-ellipsis overflow-hidden">
            {article.description}
          </p>

          {article.image && (
            <div className="w-full">
              <img
                className="rounded-xl object-cover w-full h-auto aspect-video"
                src={article.image}
                alt={article.title}
              />
            </div>
          )}
        </div>

        <div className={`flex justify-end ${isHovering ? 'visible' : 'invisible'}`}>
          <ArticleActions
            article={article}
            setArticle={setArticle}
          >
            <Tooltip content="Open in browser">
              <a href={article.link} target="_blank" rel="noopener noreferrer">
                <RiExternalLinkLine className="w-6" />
              </a>
            </Tooltip>
          </ArticleActions>
        </div>
      </div>
    </div >
  );
};

export default CommentCard;

