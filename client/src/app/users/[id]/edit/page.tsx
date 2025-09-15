'use client';

import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { fetchUser } from '@/store/slices/usersSlice';
import { User, userAPI } from '@/lib/api';
import Navigation from '@/components/Navigation';
import { ArrowLeft, Save, Shield, Globe, UserIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import Image from 'next/image';

export default function EditUserPage() {
  const { user: currentUser, isAuthenticated } = useAppSelector((state) => state.auth);
  const { selectedUser, isLoading } = useAppSelector((state) => state.users);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;
  const [editForm, setEditForm] = useState({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    bio: '',
    website: '',
    location: '',
    role: 'user',
    is_active: true,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');

  useEffect(() => {
    if (!isAuthenticated || !currentUser) {
      router.push('/');
      return;
    }

    if (currentUser.role !== 'admin') {
      if (currentUser.id !== Number(userId)) {
        router.back();
        return;
      }
    }

    if (userId && !isNaN(Number(userId))) {
      dispatch(fetchUser(Number(userId)));
    }
  }, [dispatch, userId, isAuthenticated, currentUser, router]);

  useEffect(() => {
    if (selectedUser) {
      setEditForm({
        first_name: selectedUser.first_name || '',
        last_name: selectedUser.last_name || '',
        username: selectedUser.username || '',
        email: selectedUser.email || '',
        bio: selectedUser.bio || '',
        website: selectedUser.website || '',
        location: selectedUser.location || '',
        role: selectedUser.role || 'user',
        is_active: selectedUser.is_active ?? true,
      });
      setAvatarPreview(selectedUser.avatar_url || '');
    }
  }, [selectedUser]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!selectedUser || !currentUser) return;

    setIsSaving(true);
    try {
      if (avatarFile) {
        // If there's an avatar file, use FormData for file upload
        const formData = new FormData();
        Object.entries(editForm).forEach(([key, value]) => {
          formData.append(key, value as string);
        });
        formData.append('avatar', avatarFile);
        
        // Use appropriate API based on user role and target user
        if (currentUser.role === 'admin' && currentUser.id !== selectedUser.id) {
          await userAPI.updateUserWithFormData(selectedUser.id, formData);
        } else {
          // User editing their own profile - remove restricted fields from FormData
          const restrictedFields = ['role', 'is_active', 'followers_count', 'following_count', 'posts_count'];
          restrictedFields.forEach(field => {
            formData.delete(field);
          });
          await userAPI.updateMeWithFormData(formData);
        }
        } else {
          // If no avatar file, use regular JSON update
          if (currentUser.role === 'admin' && currentUser.id !== selectedUser.id) {
            await userAPI.updateUser(selectedUser.id, editForm as Partial<User>);
          } else {
            // User editing their own profile - remove restricted fields
            const userUpdateData = { ...editForm };
            delete userUpdateData.role;
            delete userUpdateData.is_active;
            await userAPI.updateMe(userUpdateData as Partial<User>);
          }
        }
      toast.success('User updated successfully!');
      router.push(`/users/${selectedUser.id}`);
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!selectedUser) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-2xl mx-auto py-8 px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">User Not Found</h1>
            <button
              onClick={() => router.push('/admin')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Back to Admin Panel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-2xl mx-auto py-8 px-4">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </button>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Edit User</h1>
          <p className="text-gray-600">Edit user account information:</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="space-y-6">
            {/* Basic Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <UserIcon className="h-5 w-5 mr-2" />
                Basic Information
              </h2>
              
              {/* Avatar Upload */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Profile Picture</label>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    {avatarPreview ? (
                      <Image
                      src={avatarPreview}
                      alt="Avatar preview"
                      width={80}
                      height={80}
                      className="rounded-full object-cover border-2 border-gray-300"
                      unoptimized
                    />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-300">
                        <UserIcon className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    <p className="text-xs text-gray-500 mt-1">JPG, PNG or GIF. Max size 2MB.</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    name="first_name"
                    value={editForm.first_name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    name="last_name"
                    value={editForm.last_name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                  <input
                    type="text"
                    name="username"
                    value={editForm.username}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={editForm.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Avatar */}
            <div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <UserIcon className="h-5 w-5 mr-2" />
                  Avatar
                </h2>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Avatar</label>
                <input
                  type="file"
                  name="avatar"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      setAvatarFile(e.target.files[0]);
                    }
                  }}
                />
              </div>
            </div>

            {/* Profile Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Globe className="h-5 w-5 mr-2" />
                Profile Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                  <textarea
                    name="bio"
                    value={editForm.bio}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Tell us about yourself..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                  <input
                    type="url"
                    name="website"
                    value={editForm.website}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={editForm.location}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="City, Country"
                  />
                </div>
              </div>
            </div>

            {/* Account Settings */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Account Settings
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    name="role"
                    value={editForm.role}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_active"
                    name="is_active"
                    checked={editForm.is_active}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
                    Active Account
                  </label>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-3 pt-6 border-t">
              <button
                onClick={() => router.back()}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="h-4 w-4" />
                <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
