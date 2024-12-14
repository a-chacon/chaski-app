import React from 'react';
import { Alert } from "@nextui-org/react";
import { Notification } from "../NotificationContext";

interface NotificationListProps {
  notifications: Notification[];
  onClose: (id: number) => void;
}

const NotificationList: React.FC<NotificationListProps> = ({ notifications, onClose }) => {
  return (
    <div className="fixed bottom-10 right-0 z-50 p-6">
      {notifications.map(({ id, title, message, type }) => (
        <div className="flex items-center justify-center w-full">
          <Alert id={id} description={message} title={title} color={type} variant="flat" onClose={() => onClose(id)} />
        </div>
      ))}
    </div>
  );
};

export default NotificationList;
