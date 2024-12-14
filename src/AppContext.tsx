import { createContext, useContext } from 'react';
import { AppContextInterface } from './interfaces';

export const AppContext = createContext<AppContextInterface | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useFeedContext must be used within a FeedProvider");
  }
  return context;
};

