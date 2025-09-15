'use client';

import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchPosts } from '@/store/slices/postsSlice';
import { updateUserProfile } from '@/store/slices/authSlice';
import Navigation from '@/components/Navigation';
import FollowersFollowingModal from '@/components/FollowersFollowingModal';
import { formatNumber } from '@/lib/utils';
import { Edit, Settings, User, Mail, Globe, MapPin } from 'lucide-react';
import ProfileDetails from '@/components/ProfileDetails';

export default function ProfilePage() {
  const { user, isLoading, isAuthenticated } = useAppSelector((state) => state.auth);
  const { posts, isLoading: postsLoading } = useAppSelector((state) => state.posts);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    bio: user?.bio || '',
    website: user?.website || '',
    location: user?.location || '',
  });
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: 'followers' | 'following';
  }>({ isOpen: false, type: 'followers' });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/');
    }
  }, [user, isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated && user) {
      dispatch(fetchPosts());
    }
  }, [dispatch, isAuthenticated, user]);

  useEffect(() => {
    if (user) {
      setEditForm({
        bio: user.bio || '',
        website: user.website || '',
        location: user.location || '',
      });
    }
  }, [user]);

  const handleSaveProfile = async () => {
    await dispatch(updateUserProfile(editForm));
    setEditing(false);
  };

  const userPosts = posts.filter(post => post.author.id === user?.id);

  if (isLoading) {
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

      <ProfileDetails id={user.id} dispatch={dispatch} />
      
      {/* <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow-sm border p-8 mb-8">
          <div className="flex items-start space-x-6">
            <div className="flex-shrink-0">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.username}
                  className="h-24 w-24 rounded-full object-cover"
                />
              ) : (
                <div className="h-24 w-24 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-medium">
                  {user.first_name?.[0] || user.username[0]}
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {user.first_name} {user.last_name}
                  </h1>
                  <p className="text-gray-500">@{user.username}</p>
                  {user.role === 'admin' && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 mt-1">
                      Administrator
                    </span>
                  )}
                </div>
                
                <button
                  onClick={() => setEditing(!editing)}
                  className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Edit className="h-4 w-4" />
                  <span>{editing ? 'Cancel' : 'Edit Profile'}</span>
                </button>
              </div>

              {editing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bio
                    </label>
                    <textarea
                      value={editForm.bio}
                      onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                      maxLength={160}
                      placeholder="Tell us about yourself..."
                    />
                    <p className="text-xs text-gray-500 mt-1">{editForm.bio.length}/160</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Website
                      </label>
                      <input
                        type="url"
                        value={editForm.website}
                        onChange={(e) => setEditForm(prev => ({ ...prev, website: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="https://example.com"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Location
                      </label>
                      <input
                        type="text"
                        value={editForm.location}
                        onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="City, Country"
                      />
                    </div>
                  </div>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={handleSaveProfile}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={() => setEditing(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {user.bio && (
                    <p className="text-gray-700">{user.bio}</p>
                  )}
                  
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    {user.website && (
                      <div className="flex items-center space-x-2">
                        <Globe className="h-4 w-4" />
                        <a href={user.website} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">
                          {user.website}
                        </a>
                      </div>
                    )}
                    {user.location && (
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4" />
                        <span>{user.location}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4" />
                      <span>{user.email}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-8 mt-8 pt-8 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{formatNumber(user.posts_count)}</div>
              <div className="text-sm text-gray-500">Posts</div>
            </div>
            <button
              onClick={() => setModalState({ isOpen: true, type: 'followers' })}
              className="text-center hover:bg-gray-50 rounded-lg p-2 transition-colors"
            >
              <div className="text-2xl font-bold text-gray-900">{formatNumber(user.followers_count)}</div>
              <div className="text-sm text-gray-500">Followers</div>
            </button>
            <button
              onClick={() => setModalState({ isOpen: true, type: 'following' })}
              className="text-center hover:bg-gray-50 rounded-lg p-2 transition-colors"
            >
              <div className="text-2xl font-bold text-gray-900">{formatNumber(user.following_count)}</div>
              <div className="text-sm text-gray-500">Following</div>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Your Posts</h2>
          
          {postsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : userPosts.length === 0 ? (
            <div className="text-center py-12">
              <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No posts yet</p>
              <p className="text-gray-400 text-sm">Share your first post to get started!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {userPosts.map((post) => (
                <div key={post.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-gray-900">{post.content}</p>
                      {post.image_url && (
                        <img
                          src={post.image_url}
                          alt="Post image"
                          className="mt-3 rounded-lg max-w-full h-auto max-h-64 object-cover"
                        />
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-4">
                      <span>{formatNumber(post.like_count)} likes</span>
                      <span>{formatNumber(post.comment_count)} comments</span>
                      <span className="capitalize">{post.category}</span>
                    </div>
                    <span>{new Date(post.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div> */}

      {/* Followers/Following Modal */}
      {/* <FollowersFollowingModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ isOpen: false, type: 'followers' })}
        userId={user.id}
        type={modalState.type}
        userName={user.username}
      /> */}
    </div>
  );
}