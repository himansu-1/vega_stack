'use client';

import { useState } from 'react';
import { useAppSelector } from '@/store/hooks';
import { Image, X } from 'lucide-react';

interface CreatePostProps {
  onPostCreated: (postData: { content: string; image_file?: File; category?: string }) => Promise<void>;
}

export default function CreatePost({ onPostCreated }: CreatePostProps) {
  const { user } = useAppSelector((state) => state.auth);
  const { isCreating } = useAppSelector((state) => state.posts);
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [category, setCategory] = useState('general');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) return;
    
    if (content.length > 280) {
      alert('Post content cannot exceed 280 characters');
      return;
    }

    await onPostCreated({
      content: content.trim(),
      image_file: imageFile || undefined,
      category,
    });
    
    // Reset form
    setContent('');
    setImageFile(null);
    setImagePreview('');
    setCategory('general');
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (2MB limit)
    if (file.size > 2 * 1024 * 1024) {
      alert('Image size must be less than 2MB');
      return;
    }

    // Set the file and create preview
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
  };

  if (!user) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-start space-x-3 mb-4">
        {user.avatar_url ? (
          <img
            src={user.avatar_url}
            alt={user.username}
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
            {user.first_name?.[0] || user.username[0]}
          </div>
        )}
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">
            {user.first_name} {user.last_name}
          </h3>
          <p className="text-sm text-gray-500">@{user.username}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind?"
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 resize-none"
          rows={4}
          maxLength={280}
        />

        <div className="flex items-center justify-between mt-2 mb-4">
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 cursor-pointer">
              <Image className="h-5 w-5" />
              <span className="text-sm">Add Image</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className={`text-sm ${content.length > 250 ? 'text-red-500' : 'text-gray-500'}`}>
              {content.length}/280
            </span>
          </div>
        </div>

        {imagePreview && (
          <div className="relative mb-4">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-full h-48 object-cover rounded-lg"
            />
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-2 right-2 p-1 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="flex items-center justify-between">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="general">General</option>
            <option value="announcement">Announcement</option>
            <option value="question">Question</option>
          </select>

          <button
            type="submit"
            disabled={isCreating || !content.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? 'Posting...' : 'Post'}
          </button>
        </div>
      </form>
    </div>
  );
}