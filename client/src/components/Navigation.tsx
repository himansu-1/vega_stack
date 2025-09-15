'use client';

import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { logoutUser } from '@/store/slices/authSlice';
import { useNotifications } from '@/hooks/useNotifications';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { 
  Home, 
  User, 
  Bell, 
  Settings, 
  LogOut, 
  Users,
  BarChart3,
  Search
} from 'lucide-react';

export default function Navigation() {
  const { user, isLoading } = useAppSelector((state) => state.auth);
  const { unreadCount } = useNotifications();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    router.push('/');
  };

  const navItems = [
    { icon: Home, label: 'Feed', href: '/feed' },
    { icon: Search, label: 'Search Users', href: '/users' },
    { icon: Bell, label: 'Notifications', href: '/notifications' },
    // { icon: User, label: 'Profile', href: '/profile' },
  ];

  // Add admin link if user is admin
  if (user?.role === 'admin') {
    navItems.push({ icon: BarChart3, label: 'Admin', href: '/admin' });
  }

  if (isLoading) {
    return (
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="animate-pulse bg-gray-200 h-8 w-32 rounded"></div>
            <div className="animate-pulse bg-gray-200 h-8 w-8 rounded-full"></div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <button
              onClick={() => router.push('/feed')}
              className="text-xl font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
            >
              SocialConnect
            </button>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isNotification = item.href === '/notifications';
              return (
                <button
                  key={item.href}
                  onClick={() => router.push(item.href)}
                  className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors relative cursor-pointer"
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                  {isNotification && unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-xs text-white font-bold">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors"
            >
              {user?.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.username}
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
                  {user?.first_name?.[0] || user?.username?.[0] || 'U'}
                </div>
              )}
              <span className="hidden md:block">{user?.username}</span>
              {user?.role === 'admin' && (
                <span className="hidden md:block text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                  Admin
                </span>
              )}
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                <div className="px-4 py-2 border-b">
                  <p className="text-sm font-medium text-gray-900">{user?.first_name} {user?.last_name}</p>
                  <p className="text-sm text-gray-500">@{user?.username}</p>
                  {user?.role === 'admin' && (
                    <p className="text-xs text-purple-600 font-medium">Administrator</p>
                  )}
                </div>
                
                <button
                  onClick={() => {
                    router.push('/profile');
                    setShowDropdown(false);
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <User className="h-4 w-4 mr-3" />
                  Profile
                </button>
                
                <button
                  onClick={() => {
                    router.push('/settings');
                    setShowDropdown(false);
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Settings className="h-4 w-4 mr-3" />
                  Settings
                </button>
                
                <button
                  onClick={() => {
                    handleLogout();
                    setShowDropdown(false);
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <LogOut className="h-4 w-4 mr-3" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t">
        <div className="px-2 pt-2 pb-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className="flex items-center space-x-3 w-full px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-md"
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}