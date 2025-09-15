'use client';

import { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { fetchFollowers, fetchFollowing } from '@/store/slices/usersSlice';
import { X, UserPlus, UserMinus } from 'lucide-react';
import { User } from '@/lib/api';
import Image from 'next/image';

interface FollowersFollowingModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
  type: 'followers' | 'following';
  userName: string;
}

export default function FollowersFollowingModal({ 
  isOpen, 
  onClose, 
  userId, 
  type, 
  userName 
}: FollowersFollowingModalProps) {
  const { user } = useAppSelector((state) => state.auth);
  const { followers, following, isLoading } = useAppSelector((state) => state.users);
  const dispatch = useAppDispatch();
  const [followingUsers, setFollowingUsers] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (isOpen) {
      if (type === 'followers') {
        dispatch(fetchFollowers(userId));
      } else {
        dispatch(fetchFollowing(userId));
      }
    }
  }, [dispatch, isOpen, type, userId]);

  const handleFollow = async (targetUserId: number) => {
    if (!user) return;

    try {
      if (followingUsers.has(targetUserId)) {
        // Unfollow logic would go here
        setFollowingUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(targetUserId);
          return newSet;
        });
      } else {
        // Follow logic would go here
        setFollowingUsers(prev => new Set(prev).add(targetUserId));
      }
    } catch (error) {
      console.error('Error following/unfollowing user:', error);
    }
  };

  const users = type === 'followers' ? followers : following;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4 max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            {type === 'followers' ? 'Followers' : 'Following'} of {userName}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[60vh]">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">
                {type === 'followers' ? 'No followers yet' : 'Not following anyone yet'}
              </p>
            </div>
          ) : (
            <div className="space-y-2 p-4">
              {users.map((userItem: User) => (
                <div key={userItem.id} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                  {userItem.avatar_url ? (
                    <Image
                      src={userItem.avatar_url}
                      alt={userItem.username}
                      className="h-10 w-10 rounded-full object-cover"
                      width={40}
                      height={40}
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                      {userItem.first_name?.[0] || userItem.username[0]}
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">
                      {userItem.first_name} {userItem.last_name}
                    </h3>
                    <p className="text-sm text-gray-500">@{userItem.username}</p>
                    {userItem.bio && (
                      <p className="text-xs text-gray-600 mt-1">{userItem.bio}</p>
                    )}
                  </div>

                  {user && user.id !== userItem.id && (
                    <button
                      onClick={() => handleFollow(userItem.id)}
                      className={`flex items-center space-x-1 px-3 py-1 rounded-lg text-sm transition-colors ${
                        followingUsers.has(userItem.id)
                          ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {followingUsers.has(userItem.id) ? (
                        <>
                          <UserMinus className="h-3 w-3" />
                          <span>Unfollow</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-3 w-3" />
                          <span>Follow</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
