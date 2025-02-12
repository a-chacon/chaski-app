import {
  RiBookmarkLine,
  RiCheckLine,
  RiCheckDoubleLine,
  RiExternalLinkLine,
  RiBookmarkFill,
  RiCloseLine
} from "@remixicon/react";
import { ArticleInterface } from "../interfaces";
import { Tooltip } from "@heroui/react";
import {
  updateArticleAsRead,
  updateArticleAsUnRead,
  updateArticleReadLater,
  updateArticleNotReadLater,
  updateArticleAsReadAndHide
} from "../helpers/articlesData";
import { useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";

interface ArticleActionsProps {
  compact?: Boolean;
  article: ArticleInterface;
  setArticle: (article: ArticleInterface) => void;
  className?: String;
  children?: React.ReactNode;
  backAfterAction?: boolean;
}

const ArticleActions: React.FC<ArticleActionsProps> = ({
  compact = true,
  article,
  setArticle,
  className,
  children,
  backAfterAction = false,
}) => {
  const { history } = useRouter();

  const [readLater, setReadLater] = useState(article.read_later);
  const [read, setRead] = useState(article.read);

  useEffect(() => {
    setReadLater(article.read_later);
    setRead(article.read);
  }, [article]);

  const handleHideArticle = async (article: ArticleInterface) => {
    try {
      const updatedArticle = await updateArticleAsReadAndHide(article);

      if (updatedArticle) {
        setArticle({
          ...article,
          ...updatedArticle,
        });
      }
    } catch (error) {
      console.error("Failed to update article:", error);
    }
  };

  const handleMarkAsRead = async (article: ArticleInterface) => {
    try {
      const updatedArticle = await updateArticleAsRead(article);
      if (updatedArticle) {
        setArticle({
          ...article,
          ...updatedArticle,
        });
      }
    } catch (error) {
      console.error("Failed to update article:", error);
    }
  };

  const handleMarkAsUnread = async (article: ArticleInterface) => {
    try {
      const updatedArticle = await updateArticleAsUnRead(article);
      if (updatedArticle) {
        setArticle({
          ...article,
          ...updatedArticle,
        });
      }

      if (backAfterAction) {
        history.go(-1);
      }
    } catch (error) {
      console.error("Failed to update article:", error);
    }
  };

  const handleMarkReadLater = async (article: ArticleInterface) => {
    try {
      const updatedArticle = await updateArticleReadLater(article);
      if (updatedArticle) {
        setArticle({
          ...article,
          ...updatedArticle,
        });
      }

      if (backAfterAction) {
        history.go(-1);
      }
    } catch (error) {
      console.error("Failed to update article:", error);
    }
  };

  const handleUnMarkReadLater = async (article: ArticleInterface) => {
    try {
      const updatedArticle = await updateArticleNotReadLater(article);
      if (updatedArticle) {
        setArticle({
          ...article,
          ...updatedArticle,
        });
      }
    } catch (error) {
      console.error("Failed to update article:", error);
    }
  };

  const showOptionalOptions = () => {
    if (compact) {
      return (
        <Tooltip content="Hide">
          <button onClick={() => handleHideArticle(article)}>
            <RiCloseLine className="w-6" />
          </button>
        </Tooltip>
      )
    } else {
      return (
        <Tooltip content={"Visit Website: " + article.link} className="w-80">
          <a href={article.link} target="_blank">
            <RiExternalLinkLine className="w-6"></RiExternalLinkLine>
          </a>
        </Tooltip>
      )
    }
  }

  return (
    <div className={"flex gap-2 " + className}>
      {children}

      {!readLater ? (
        <Tooltip content="Mark for Read Later">
          <button onClick={() => handleMarkReadLater(article)}>
            <RiBookmarkLine className="w-6"></RiBookmarkLine>
          </button>
        </Tooltip>
      ) : (
        <Tooltip content="Unmark Read Later">
          <button onClick={() => handleUnMarkReadLater(article)}>
            <RiBookmarkFill className="w-6"></RiBookmarkFill>
          </button>
        </Tooltip>
      )}

      {read ? (
        <Tooltip content="Mark as unRead">
          <button onClick={() => handleMarkAsUnread(article)}>
            <RiCheckDoubleLine className="w-6"></RiCheckDoubleLine>
          </button>
        </Tooltip>
      ) : (
        <Tooltip content="Mark as Read">
          <button onClick={() => handleMarkAsRead(article)}>
            <RiCheckLine className="w-6"></RiCheckLine>
          </button>
        </Tooltip>
      )}

      {showOptionalOptions()}

    </div>
  );
};

export default ArticleActions;
