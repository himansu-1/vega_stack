'use client';

import { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { fetchFollowing, fetchUsers, followUser, searchUsers, unfollowUser } from '@/store/slices/usersSlice';
import { formatNumber } from '@/lib/utils';
import { UserPlus, UserMinus, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function UserSearch() {
  const { user } = useAppSelector((state) => state.auth);
  const { users, isLoading, following } = useAppSelector((state) => state.users);
  const dispatch = useAppDispatch();
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingUsers, setLoadingUsers] = useState<Set<number>>(new Set());
  const router = useRouter();

  const handleFollow = async (userId: number, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (!user || loadingUsers.has(userId)) return;

    // Add user to loading set
    setLoadingUsers(prev => new Set(prev).add(userId));

    try {
      // Find the user in the current users list to get is_following status
      const userItem = users.find(u => u.id === userId);
      const isFollowing = userItem?.is_following || following.some((follow: any) => follow.following === userId);
      
      if (isFollowing) {
        await dispatch(unfollowUser(userId));
      } else {
        await dispatch(followUser(userId));
      }
    } catch (error) {
      console.error('Error following/unfollowing user:', error);
    } finally {
      // Remove user from loading set
      setLoadingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  useEffect(() => {
    if (user) {
      // Load following data to check follow status
      dispatch(fetchFollowing(user.id));
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (searchTerm.length >= 2) {
      dispatch(searchUsers(searchTerm));
    } else if (searchTerm.length === 0) {
      dispatch(fetchUsers({ page: 1, perPage: 20 }));
    }
  }, [dispatch, searchTerm]);

  const filteredUsers = users.filter(u =>
    u.id !== user?.id &&
    (u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.last_name?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Search Users</h1>
          <p className="text-gray-600">Find and connect with other users</p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search by username, first name, or last name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Search Results */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : searchTerm ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map((userItem) => (
              <div key={userItem.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow duration-200 overflow-hidden"
                onClick={() => router.push(`/users/${userItem.id}`)}
              >
                <div className="p-6 cursor-pointer">
                <div className="flex items-center space-x-4 mb-4">
                  {userItem.avatar_url ? (
                    <img
                      src={userItem.avatar_url}
                      alt={userItem.username}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                      {userItem.first_name?.[0] || userItem.username[0]}
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {userItem.first_name} {userItem.last_name}
                    </h3>
                    <p className="text-sm text-gray-500">@{userItem.username}</p>
                  </div>
                </div>

                {userItem.bio && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{userItem.bio}</p>
                )}

                {/* Additional User Details */}
                <div className="space-y-2 mb-4">
                  {userItem.location && (
                    <div className="flex items-center text-sm text-gray-500">
                      <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>{userItem.location}</span>
                    </div>
                  )}
                  
                  {userItem.website && (
                    <div className="flex items-center text-sm text-gray-500">
                      <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      <a 
                        href={userItem.website.startsWith('http') ? userItem.website : `https://${userItem.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline truncate"
                      >
                        {userItem.website}
                      </a>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    {userItem.role === 'admin' && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" clipRule="evenodd" />
                        </svg>
                        Admin
                      </span>
                    )}
                    
                    {(userItem as any).date_joined && (
                      <span className="text-xs text-gray-400">
                        Joined {new Date((userItem as any).date_joined).toLocaleDateString('en-US', { 
                          month: 'short', 
                          year: 'numeric' 
                        })}
                      </span>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex space-x-4">
                    <span>{formatNumber(userItem.followers_count)} followers</span>
                    <span>{formatNumber(userItem.following_count)} following</span>
                    <span>{formatNumber(userItem.posts_count)} posts</span>
                  </div>
                </div>

                </div>
                
                {/* Follow Button - Outside clickable area */}
                <div className="px-6 pb-6">
                  <button
                    onClick={(e) => handleFollow(userItem.id, e)}
                    disabled={loadingUsers.has(userItem.id)}
                    className={`w-full flex items-center justify-center space-x-2 py-2 px-4 rounded-lg transition-colors ${
                      userItem.is_following || following.some((follow: any) => follow.following === userItem.id)
                        ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    } ${loadingUsers.has(userItem.id) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {loadingUsers.has(userItem.id) ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                        <span>Loading...</span>
                      </>
                    ) : userItem.is_following || following.some((follow: any) => follow.following === userItem.id) ? (
                      <>
                        <UserMinus className="h-4 w-4" />
                        <span>Unfollow</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4" />
                        <span>Follow</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Start typing to search for users</p>
            <p className="text-gray-400 text-sm">Search by username, first name, or last name</p>
          </div>
        )}

        {searchTerm && filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No users found matching "{searchTerm}"</p>
          </div>
        )}
      </div>
    </div>
  );
}
