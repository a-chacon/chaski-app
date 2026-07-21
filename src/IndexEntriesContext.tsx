import React, { createContext, useState, useContext, ReactNode, useEffect, useMemo, useRef } from "react";
import { EntryInterface } from "./interfaces";

interface EntriesContextType {
  path: string;
  entries: EntryInterface[];
  page: number;
  hasMore: boolean;
  setEntries: React.Dispatch<React.SetStateAction<EntryInterface[]>>;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  setHasMore: React.Dispatch<React.SetStateAction<boolean>>;
  setPath: React.Dispatch<React.SetStateAction<string>>;
}

const EntriesContext = createContext<EntriesContextType | undefined>(undefined);

export const useEntries = (path?: string): EntriesContextType => {
  const context = useContext(EntriesContext);
  if (!context) {
    throw new Error("useEntries must be used within an EntriesProvider");
  }

  const prevPathRef = useRef<string | undefined>();

  useEffect(() => {
    if (path && context.path !== path) {
      context.setEntries([]);
      context.setPage(1);
      context.setHasMore(true);
      context.setPath(path);
      prevPathRef.current = path;
    }
  }, [path]);

  return context;
};

interface EntriesProviderProps {
  children: ReactNode;
}

export const EntriesProvider: React.FC<EntriesProviderProps> = ({ children }) => {
  const [entries, setEntries] = useState<EntryInterface[]>([]);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [path, setPath] = useState<string>("");

  const contextValue = useMemo(() => ({
    path,
    entries,
    page,
    hasMore,
    setEntries,
    setPage,
    setHasMore,
    setPath,
  }), [path, entries, page, hasMore]);

  return (
    <EntriesContext.Provider value={contextValue}>
      {children}
    </EntriesContext.Provider>
  );
};

