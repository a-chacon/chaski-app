import React from "react";
import { RiGridFill, RiListUnordered } from "@remixicon/react";
import { useAppContext } from "../AppContext";
import { Button } from "@heroui/react";

const ArticleLayoutSwitch: React.FC = () => {
  const { articlesLayout, setArticlesLayout } = useAppContext();

  return (
    <div className="flex items-center gap-2 justify-end pt-4">
      <Button
        onClick={() => setArticlesLayout("side")}
        color={articlesLayout === "side" ? "primary" : "default"}
        aria-label="List View"
        isIconOnly
        size="sm"
        variant={articlesLayout === "side" ? "flat" : "light"}
      >
        <RiListUnordered size={24} />
      </Button>
      <Button
        onClick={() => setArticlesLayout("card")}
        color={articlesLayout === "card" ? "primary" : "default"}
        variant={articlesLayout === "card" ? "flat" : "light"}
        aria-label="Card View"
        isIconOnly
        size="sm"
      >
        <RiGridFill size={24} />
      </Button>
    </div>
  );
};

export default ArticleLayoutSwitch;
