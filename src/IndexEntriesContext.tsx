import React, { createContext, useState, useContext, ReactNode, useEffect, useMemo } from "react";
import { EntryInterface } from "./interfaces";

interface PathState {
  entries: EntryInterface[];
  page: number;
  hasMore: boolean;
  scrollTop: number;
}

const DEFAULT_STATE: PathState = { entries: [], page: 1, hasMore: true, scrollTop: 0 };

interface EntriesContextType {
  path: string;
  entries: EntryInterface[];
  page: number;
  hasMore: boolean;
  scrollTop: number;
  setEntries: React.Dispatch<React.SetStateAction<EntryInterface[]>>;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  setHasMore: React.Dispatch<React.SetStateAction<boolean>>;
  setScrollTop: (value: number) => void;
  setPath: (newPath: string) => void;
}

const EntriesContext = createContext<EntriesContextType | undefined>(undefined);

export const useEntries = (path?: string): EntriesContextType => {
  const context = useContext(EntriesContext);
  if (!context) {
    throw new Error("useEntries must be used within an EntriesProvider");
  }

  useEffect(() => {
    if (path && context.path !== path) {
      context.setPath(path);
    }
  }, [path]);

  return context;
};

interface EntriesProviderProps {
  children: ReactNode;
}

export const EntriesProvider: React.FC<EntriesProviderProps> = ({ children }) => {
  const [path, setPathState] = useState<string>("");
  const [cached, setCached] = useState<{ path: string; state: PathState } | null>(null);
  const [current, setCurrent] = useState<PathState>(DEFAULT_STATE);

  // Called when a list route activates with a new path.
  // If it matches the cache, restore it. Otherwise start fresh and drop the cache.
  const setPath = (newPath: string) => {
    setPathState(newPath);
    if (cached && cached.path === newPath) {
      setCurrent(cached.state);
    } else {
      setCached(null);
      setCurrent(DEFAULT_STATE);
    }
  };

  const updateCurrent = (updater: (prev: PathState) => PathState) => {
    setCurrent((prev) => updater(prev));
  };

  const setEntries: React.Dispatch<React.SetStateAction<EntryInterface[]>> = (value) => {
    updateCurrent((prev) => ({
      ...prev,
      entries: typeof value === "function" ? value(prev.entries) : value,
    }));
  };

  const setPage: React.Dispatch<React.SetStateAction<number>> = (value) => {
    updateCurrent((prev) => ({
      ...prev,
      page: typeof value === "function" ? value(prev.page) : value,
    }));
  };

  const setHasMore: React.Dispatch<React.SetStateAction<boolean>> = (value) => {
    updateCurrent((prev) => ({
      ...prev,
      hasMore: typeof value === "function" ? value(prev.hasMore) : value,
    }));
  };

  const setScrollTop = (value: number) => {
    // Persist into cache immediately so it survives unmount
    setCached({ path, state: { ...current, scrollTop: value } });
    updateCurrent((prev) => ({ ...prev, scrollTop: value }));
  };

  const contextValue = useMemo(() => ({
    path,
    entries: current.entries,
    page: current.page,
    hasMore: current.hasMore,
    scrollTop: current.scrollTop,
    setEntries,
    setPage,
    setHasMore,
    setScrollTop,
    setPath,
  }), [path, current]);

  return (
    <EntriesContext.Provider value={contextValue}>
      {children}
    </EntriesContext.Provider>
  );
};
