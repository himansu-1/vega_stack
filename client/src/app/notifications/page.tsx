'use client';

import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { markNotificationAsRead, markAllNotificationsAsRead, clearNotifications } from '@/store/slices/notificationsSlice';
import Navigation from '@/components/Navigation';
import { formatDate } from '@/lib/utils';
import { Bell, Check, CheckCheck, RefreshCw } from 'lucide-react';

export default function NotificationsPage() {
  const { user, isLoading, isAuthenticated } = useAppSelector((state) => state.auth);
  const { notifications, unreadCount, isLoading: notificationsLoading } = useAppSelector((state) => state.notifications);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [hasMarkedAsRead, setHasMarkedAsRead] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/');
    }
  }, [isLoading, isAuthenticated, router]);

  // Mark all notifications as read when user visits the page
  useEffect(() => {
    if (isAuthenticated && user && !hasMarkedAsRead && unreadCount > 0) {
      setHasMarkedAsRead(true);
      dispatch(markAllNotificationsAsRead());
    }
  }, [isAuthenticated, user, hasMarkedAsRead, unreadCount, dispatch]);

  // Clear notifications when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      dispatch(clearNotifications());
      setHasMarkedAsRead(false);
    }
  }, [isAuthenticated, dispatch]);

  const handleMarkAsRead = async (notificationId: number) => {
    await dispatch(markNotificationAsRead(notificationId));
  };

  const handleMarkAllAsRead = async () => {
    await dispatch(markAllNotificationsAsRead());
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'follow':
        return '👥';
      case 'like':
        return '❤️';
      case 'comment':
        return '💬';
      default:
        return '🔔';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'follow':
        return 'bg-blue-100 text-blue-600';
      case 'like':
        return 'bg-red-100 text-red-600';
      case 'comment':
        return 'bg-green-100 text-green-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  if (isLoading || notificationsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-2xl mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Notifications</h1>
            <p className="text-gray-600">
              {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
            </p>
          </div>
          
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <CheckCheck className="h-4 w-4" />
              <span>Mark all read</span>
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No notifications yet</p>
            <p className="text-gray-400 text-sm">You'll see notifications here when people interact with your posts</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`rounded-lg shadow-sm border p-4 ${
                  !notification.is_read 
                    ? 'border-blue-200 bg-blue-50' 
                    : 'bg-white'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg ${getNotificationColor(notification.notification_type)}`}>
                    {getNotificationIcon(notification.notification_type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-gray-900">
                        {notification.sender.first_name} {notification.sender.last_name}
                      </span>
                      <span className="text-sm text-gray-500">
                        @{notification.sender.username}
                      </span>
                      {!notification.is_read && (
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      )}
                    </div>
                    
                    <p className="mb-2 text-gray-700">{notification.message}</p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">
                        {formatDate(notification.created_at)}
                      </span>
                      
                      {!notification.is_read && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-500"
                        >
                          <Check className="h-3 w-3" />
                          <span>Mark as read</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}