import React, { createContext, useState, useContext, ReactNode, useEffect, useMemo, useRef } from "react";
import { ArticleInterface } from "./interfaces";

interface ArticlesContextType {
  path: string;
  articles: ArticleInterface[];
  page: number;
  hasMore: boolean;
  setArticles: React.Dispatch<React.SetStateAction<ArticleInterface[]>>;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  setHasMore: React.Dispatch<React.SetStateAction<boolean>>;
  setPath: React.Dispatch<React.SetStateAction<string>>;
}

const ArticlesContext = createContext<ArticlesContextType | undefined>(undefined);

export const useArticles = (path?: string): ArticlesContextType => {
  const context = useContext(ArticlesContext);
  if (!context) {
    throw new Error("useArticles must be used within an ArticlesProvider");
  }

  const prevPathRef = useRef<string | undefined>();

  useEffect(() => {
    if (path && context.path !== path) {
      context.setArticles([]);
      context.setPage(1);
      context.setHasMore(true);
      context.setPath(path);
      prevPathRef.current = path;
    }
  }, [path]);

  return context;
};

interface ArticlesProviderProps {
  children: ReactNode;
}

export const ArticlesProvider: React.FC<ArticlesProviderProps> = ({ children }) => {
  const [articles, setArticles] = useState<ArticleInterface[]>([]);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [path, setPath] = useState<string>("");

  const contextValue = useMemo(() => ({
    path,
    articles,
    page,
    hasMore,
    setArticles,
    setPage,
    setHasMore,
    setPath,
  }), [path, articles, page, hasMore]);

  return (
    <ArticlesContext.Provider value={contextValue}>
      {children}
    </ArticlesContext.Provider>
  );
};

