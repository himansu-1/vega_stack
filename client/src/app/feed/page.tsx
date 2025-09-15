'use client';

import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchFeed, createPost } from '@/store/slices/postsSlice';
import PostCard from '@/components/PostCard';
import CreatePost from '@/components/CreatePost';
import Navigation from '@/components/Navigation';

export default function FeedPage() {
  const { user, isLoading, isAuthenticated } = useAppSelector((state) => state.auth);
  const { feed, isLoading: postsLoading } = useAppSelector((state) => state.posts);
  const dispatch = useAppDispatch();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/');
    }
  }, [user, isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated && user) {
      dispatch(fetchFeed());
    }
  }, [dispatch, isAuthenticated, user]);

  const handlePostCreated = async (postData: { content: string; image_file?: File; category?: string }) => {
    await dispatch(createPost(postData));
  };

  if (isLoading || postsLoading) {
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
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome back, {user.first_name}!</h1>
          <p className="text-gray-600">Here's what's happening in your network</p>
        </div>

        <div className="space-y-6">
          <CreatePost onPostCreated={handlePostCreated} />
          
          {feed.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No posts yet. Start by following some users or create your first post!</p>
            </div>
          ) : (
            feed.map((post, index) => (
              <PostCard
                key={post.id || `post-${index}`}
                post={post}
                onPostUpdated={() => {}} // Will be implemented with Redux
                onPostDeleted={() => {}} // Will be implemented with Redux
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}