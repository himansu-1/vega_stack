'use client';

import { useState, useEffect, useRef } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { likePost, unlikePost, fetchComments, createComment, deletePost, updatePost } from '@/store/slices/postsSlice';
import { formatDate, formatNumber } from '@/lib/utils';
import { 
  Heart, 
  MessageCircle, 
  Share, 
  MoreHorizontal,
  Trash2,
  Edit,
  Image as ImageLucide,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { Post } from '@/lib/api';
import Image from 'next/image';

interface PostCardProps {
  post: Post; // Post type from Redux
  onPostUpdated: (post: Post) => void;
  onPostDeleted: (postId: number) => void;
}

export default function PostCard({ post, onPostUpdated, onPostDeleted }: PostCardProps) {
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);
  const { comments } = useAppSelector((state) => state.posts);
  const dispatch = useAppDispatch();
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [liking, setLiking] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [editCategory, setEditCategory] = useState(post.category || 'general');
  const [editIsActive, setEditIsActive] = useState(post.is_active === true);
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string>('');
  const [imageRemoved, setImageRemoved] = useState<boolean>(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  const handleLike = async () => {
    if (liking) return;
    
    try {
      setLiking(true);
      if (post.is_liked) {
        await dispatch(unlikePost(post.id));
      } else {
        await dispatch(likePost(post.id));
      }
    } catch (error) {
      console.error('Error liking post:', error);
    } finally {
      setLiking(false);
    }
  };

  const handleDeletePost = async () => {
    if (window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      try {
        await dispatch(deletePost(post.id));
        onPostDeleted(post.id);
      } catch (error) {
        console.error('Error deleting post:', error);
        // Error message is already handled by Redux action
      }
    }
  };

  const handleEditPost = () => {
    setIsEditing(true);
    setEditContent(post.content);
    setEditCategory(post.category || 'general');
    setEditIsActive(post.is_active !== false);
    setEditImageFile(null);
    setEditImagePreview(post.image_url || '');
    setImageRemoved(false);
  };

  const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (2MB limit)
      if (file.size > 2 * 1024 * 1024) {
        toast.error('File size too large. Maximum size is 2MB.');
        return;
      }
      
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        toast.error('Only JPG, JPEG, PNG, or GIF files are allowed.');
        return;
      }
      
      setEditImageFile(file);
      setImageRemoved(false); // Reset removed flag when new image is selected
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setEditImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeEditImage = () => {
    setEditImageFile(null);
    setEditImagePreview('');
    setImageRemoved(true);
  };

  const handleSaveEdit = async () => {
    if (!editContent.trim()) {
      toast.error('Post content cannot be empty');
      return;
    }

    if (editContent.length > 280) {
      toast.error('Post content cannot exceed 280 characters');
      return;
    }

    try {
      const updateData: Partial<Post> = { 
        content: editContent.trim(),
        category: editCategory,
        is_active: editIsActive
      };
      
      // Handle image changes
      if (editImageFile) {
        // New image uploaded
        updateData.image_file = editImageFile;
      } else if (imageRemoved && post.image_url) {
        // Original image was explicitly removed
        updateData.remove_image = true;
      }
      
      await dispatch(updatePost({ id: post.id, data: updateData }));
      
      const updatedPost = { 
        ...post, 
        content: editContent.trim(),
        category: editCategory,
        is_active: editIsActive,
        image_url: editImagePreview || (updateData.remove_image ? null : post.image_url)
      };
      onPostUpdated(updatedPost as Post);
      setIsEditing(false);
      toast.success('Post updated successfully');
    } catch (error) {
      console.error('Error updating post:', error);
      toast.error('Failed to update post');
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(post.content);
    setEditCategory(post.category || 'general');
    setEditIsActive(post.is_active !== false);
    setEditImageFile(null);
    setEditImagePreview('');
    setImageRemoved(false);
  };

  const loadComments = async () => {
    if (showComments) {
      setShowComments(false);
      return;
    }

    try {
      await dispatch(fetchComments(post.id));
      setShowComments(true);
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      await dispatch(createComment({ postId: post.id, content: newComment }));
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const isOwnPost = user?.id === post.author?.id;
  const isAdmin = user?.role === 'admin';
  const canEditDelete = isOwnPost || isAdmin;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Post Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3 cursor-pointer"
        onClick={() => router.push(`/users/${post.author?.id}`)}
        >
          {post.author?.avatar_url ? (
            <Image
              src={post.author.avatar_url}
              alt={post.author?.username || 'User'}
              className="h-10 w-10 rounded-full object-cover"
              width={40}
              height={40}
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
              {post.author?.first_name?.[0] || post.author?.username?.[0] || 'U'}
            </div>
          )}
          <div>
            <h3 className="font-semibold text-gray-900">
              {post.author?.first_name} {post.author?.last_name}
            </h3>
            <p className="text-sm text-gray-500">@{post.author?.username || 'unknown'}</p>
            <p className="text-xs text-gray-400">{formatDate(post.created_at)}</p>
          </div>
        </div>

        {canEditDelete && (
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setShowDropdown(!showDropdown)}
              className="p-1 hover:bg-gray-100 rounded-full"
            >
              <MoreHorizontal className="h-4 w-4 text-gray-500" />
            </button>
            
            {showDropdown && (
              <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]">
                <button
                  onClick={() => {
                    handleEditPost();
                    setShowDropdown(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                >
                  <Edit className="h-4 w-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => {
                    handleDeletePost();
                    setShowDropdown(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Post Content */}
      <div className="mb-4">
        {isEditing ? (
          <div className="space-y-3">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 resize-none"
              rows={3}
              maxLength={280}
              placeholder="What's on your mind?"
            />
            
            {/* Image Upload Section */}
            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 cursor-pointer">
                <ImageLucide className="h-5 w-5" />
                <span className="text-sm">Change Image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleEditImageChange}
                  className="hidden"
                />
              </label>
              
              {/* Image Preview */}
              {(editImagePreview || (post.image_url && !imageRemoved)) && (
                <div className="relative">
                  <Image
                    src={editImagePreview || post.image_url || ''}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg"
                    width={500}
                    height={500}
                  />
                  <button
                    onClick={removeEditImage}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
              
              {/* Show message when image is removed */}
              {imageRemoved && (
                <div className="text-sm text-gray-500 italic">
                  Image will be removed when you save the post.
                </div>
              )}
            </div>
            
            {/* Category and Status Controls */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Category:</label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value as "general" | "announcement" | "question")}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="general">General</option>
                  <option value="announcement">Announcement</option>
                  <option value="question">Question</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Status:</label>
                <select
                  value={editIsActive ? 'true' : 'false'}
                  onChange={(e) => setEditIsActive(e.target.value === 'true')}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className={`text-sm ${editContent.length > 250 ? 'text-red-500' : 'text-gray-500'}`}>
                {editContent.length}/280
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={handleCancelEdit}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <p className="text-gray-900 whitespace-pre-wrap">{post.content}</p>
            {post.image_url && (
              <Image
                src={post.image_url}
                alt="Post image"
                className="mt-3 rounded-lg max-w-full h-auto"
                width={500}
                height={500}
              />
            )}
          </>
        )}
      </div>

      {/* Post Actions */}
      <div className="flex items-center justify-between border-t border-gray-400 pt-4">
        <div className="flex items-center space-x-6">
          <button
            onClick={handleLike}
            disabled={liking}
            className={`flex items-center space-x-2 ${
              post.is_liked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
            } transition-colors`}
          >
            <Heart className={`h-5 w-5 ${post.is_liked ? 'fill-current' : ''}`} />
            <span>{formatNumber(post.like_count)}</span>
          </button>

          <button
            onClick={loadComments}
            className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 transition-colors"
          >
            <MessageCircle className="h-5 w-5" />
            <span>{formatNumber(post.comment_count)}</span>
          </button>

          <button className="flex items-center space-x-2 text-gray-500 hover:text-green-500 transition-colors">
            <Share className="h-5 w-5" />
            <span>Share</span>
          </button>
        </div>

        <div className="text-xs text-gray-400">
          {post.category.charAt(0).toUpperCase() + post.category.slice(1)}
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-4 border-t pt-4">
          <form onSubmit={handleAddComment} className="mb-4">
            <div className="flex space-x-3">
              <div className="flex-shrink-0">
                {user?.avatar_url ? (
                  <Image
                    src={user.avatar_url}
                    alt={user.username}
                    className="h-8 w-8 rounded-full object-cover"
                    width={32}
                    height={32}
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-medium">
                    {user?.first_name?.[0] || user?.username?.[0] || 'U'}
                  </div>
                )}
              </div>
              <div className="flex-1 flex space-x-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  type="submit"
                  disabled={!newComment.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send
                </button>
              </div>
            </div>
          </form>

          <div className="space-y-3">
            {comments.map((comment: { id: number; content: string; author: { id: number; username: string; avatar_url?: string; first_name?: string; last_name?: string; created_at?: string; }; created_at?: string; }) => (
              <div key={comment.id} className="flex space-x-3">
                <div className="flex-shrink-0">
                  {comment.author?.avatar_url ? (
                    <Image
                      src={comment.author.avatar_url}
                      alt={comment.author.username || 'User'}
                      className="h-8 w-8 rounded-full object-cover"
                      width={32}
                      height={32}
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-gray-400 flex items-center justify-center text-white text-xs font-medium">
                      {comment.author?.first_name?.[0] || comment.author?.username?.[0] || 'U'}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-sm text-gray-900">
                        {comment.author?.first_name} {comment.author?.last_name}
                      </span>
                      <span className="text-xs text-gray-500">
                        @{comment.author?.username}
                      </span>
                      <span className="text-xs text-gray-400">
                        {formatDate(comment.created_at || '')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{comment.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}