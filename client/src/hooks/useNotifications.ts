import { useState } from "react";
import type { NotificationItem } from "../types";

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const pushNotification = (title: string, description: string) => {
    setNotifications((prev) => [
      { id: Date.now(), title, description, time: "Just now", read: false },
      ...prev,
    ]);
  };

  const openDrawer = () => {
    setIsDrawerOpen(true);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const closeDrawer = () => setIsDrawerOpen(false);

  return {
    notifications,
    unreadCount: notifications.filter((n) => !n.read).length,
    isDrawerOpen,
    openDrawer,
    closeDrawer,
    pushNotification,
  };
}
