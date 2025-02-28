import {
  RiBookmarkLine,
  RiCheckLine,
  RiCheckDoubleLine,
  RiExternalLinkLine,
  RiBookmarkFill,
  RiCloseLine
} from "@remixicon/react";
import { ArticleInterface } from "../interfaces";
import { Tooltip, Button } from "@heroui/react";
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
          <Button
            color="primary"
            variant="light"
            isIconOnly
            size="sm"
            onPress={() => handleHideArticle(article)}
          >
            <RiCloseLine className="w-6" />
          </Button>
        </Tooltip>
      )
    } else {
      return (
        <Tooltip content={"Visit Website: " + article.link} className="w-80">
          <a
            href={article.link}
            target="_blank"
          >
            <RiExternalLinkLine className="w-6" />
          </a>
        </Tooltip>
      )
    }
  }

  return (
    <div className={"flex items-center gap-1 " + className}>
      {children}

      {!readLater ? (
        <Tooltip content="Mark for Read Later">
          <Button
            color="primary"
            variant="light"
            isIconOnly
            size="sm"
            onPress={() => handleMarkReadLater(article)}
          >
            <RiBookmarkLine className="w-6" />
          </Button>
        </Tooltip>
      ) : (
        <Tooltip content="Unmark Read Later">
          <Button
            color="primary"
            variant="light"
            isIconOnly
            size="sm"
            onPress={() => handleUnMarkReadLater(article)}
          >
            <RiBookmarkFill className="w-6" />
          </Button>
        </Tooltip>
      )}

      {read ? (
        <Tooltip content="Mark as unRead">
          <Button
            color="primary"
            variant="light"
            isIconOnly
            size="sm"
            onPress={() => handleMarkAsUnread(article)}
          >
            <RiCheckDoubleLine className="w-6" />
          </Button>
        </Tooltip>
      ) : (
        <Tooltip content="Mark as Read">
          <Button
            color="primary"
            variant="light"
            isIconOnly
            size="sm"
            onPress={() => handleMarkAsRead(article)}
          >
            <RiCheckLine className="w-6" />
          </Button>
        </Tooltip>
      )}

      {showOptionalOptions()}

    </div>
  );
};

export default ArticleActions;
