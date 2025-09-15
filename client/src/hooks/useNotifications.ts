import { useEffect, useCallback } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { fetchNotifications, markAllNotificationsAsRead } from '@/store/slices/notificationsSlice';

export const useNotifications = () => {
  const { notifications, unreadCount, isLoading } = useAppSelector((state) => state.notifications);
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  // Fetch notifications only when user becomes authenticated
  useEffect(() => {
    if (isAuthenticated && user && notifications.length === 0 && !isLoading) {
      dispatch(fetchNotifications());
    }
  }, [isAuthenticated, user, notifications.length, isLoading, dispatch]);

  // Function to refresh notifications manually
  const refreshNotifications = useCallback(() => {
    if (isAuthenticated && user) {
      dispatch(fetchNotifications());
    }
  }, [isAuthenticated, user, dispatch]);

  // Function to mark all as read
  const markAllAsRead = useCallback(() => {
    if (isAuthenticated && user && unreadCount > 0) {
      dispatch(markAllNotificationsAsRead());
    }
  }, [isAuthenticated, user, unreadCount, dispatch]);

  return {
    notifications,
    unreadCount,
    isLoading,
    refreshNotifications,
    markAllAsRead,
  };
};