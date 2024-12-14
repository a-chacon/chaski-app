import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import NotificationList from './components/NotificationList';

export interface Notification {
  id: number;
  message: string;
  title: string;
  type: "default" | "primary" | "secondary" | "success" | "warning" | "danger";
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (title: string, message: string, type: "default" | "primary" | "secondary" | "success" | "warning" | "danger", duration?: number) => void;
  removeNotification: (id: number) => void;
}

interface NotificationProviderProps {
  children: ReactNode;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((title: string, message: string, type: "default" | "primary" | "secondary" | "success" | "warning" | "danger", duration = 5000) => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, title, message, type }]);

    setTimeout(() => {
      setNotifications((prev) => prev.filter((notification) => notification.id !== id));
    }, duration);
  }, []);

  const removeNotification = useCallback((id: number) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, removeNotification }}>
      {children}
      <NotificationList notifications={notifications} onClose={removeNotification} />
    </NotificationContext.Provider>
  );
};

