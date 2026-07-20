import React from "react";
import { useAppContext } from "../AppContext";
import { Button } from "@heroui/react";

import { RiLayoutGridLine, RiListUnordered, RiLayoutHorizontalLine } from '@remixicon/react'


const ArticleLayoutSwitch: React.FC = () => {
  const { articlesLayout, setArticlesLayout } = useAppContext();

  return (
    <div className="flex items-center gap-2 justify-end pt-4">
      <Button
        onPress={() => setArticlesLayout("list")}
        color={articlesLayout === "list" ? "primary" : "default"}
        aria-label="List View"
        size="sm"
        isIconOnly
        variant={articlesLayout === "list" ? "flat" : "light"}
      >
        <RiListUnordered></RiListUnordered>
      </Button>
      <Button
        onPress={() => setArticlesLayout("compact")}
        color={articlesLayout === "compact" ? "primary" : "default"}
        variant={articlesLayout === "compact" ? "flat" : "light"}
        aria-label="Compact View"
        isIconOnly
        size="sm"
      >
        <RiLayoutHorizontalLine></RiLayoutHorizontalLine>
      </Button>
      <Button
        onPress={() => setArticlesLayout("grid")}
        color={articlesLayout === "grid" ? "primary" : "default"}
        variant={articlesLayout === "grid" ? "flat" : "light"}
        aria-label="Grid View"
        isIconOnly
        size="sm"
      >
        <RiLayoutGridLine></RiLayoutGridLine>
      </Button>
    </div>
  );
};

export default ArticleLayoutSwitch;
