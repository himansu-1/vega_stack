import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/token/refresh/`, {
            refresh: refreshToken,
          });
          
          const { access } = response.data;
          localStorage.setItem('access_token', access);
          
          // Retry original request
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Types
export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  bio: string;
  avatar_url?: string;
  website?: string;
  location?: string;
  followers_count: number;
  following_count: number;
  posts_count: number;
  role: 'user' | 'admin';
  is_active: boolean;
  date_joined?: string;
  last_login?: string;
  is_following?: boolean;
}

export interface Post {
  id: number;
  content: string;
  author: User;
  created_at: string;
  updated_at: string;
  image_url?: string;
  category: 'general' | 'announcement' | 'question';
  is_active: boolean;
  like_count: number;
  comment_count: number;
  is_liked: boolean;
}

export interface Comment {
  id: number;
  content: string;
  author: User;
  created_at: string;
  is_active: boolean;
}

export interface Notification {
  id: number;
  recipient: number;
  sender: User;
  notification_type: 'follow' | 'like' | 'comment';
  post?: Post;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface Follow {
  id: number;
  follower: User;
  following: User;
  created_at: string;
}

// Auth API
export const authAPI = {
  register: (data: {
    email: string;
    username: string;
    password: string;
    first_name: string;
    last_name: string;
  }) => api.post('/auth/register/', data),
  
  login: (data: { username_or_email: string; password: string }) =>
    api.post('/auth/login/', data),
  
  logout: (refreshToken: string) => api.post('/auth/logout/', { refresh: refreshToken }),
  getCurrentUser: async () => {
    const token = localStorage.getItem('access_token');
    return await axios.get(`${API_BASE_URL}/users/me/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
};

// User API
export const userAPI = {
  getMe: () => api.get('/users/me/'),
  getCurrentUser: () => api.get('/users/me/'),
  updateMe: (data: Partial<User>) => api.put('/users/me/', data),
  patchMe: (data: Partial<User>) => api.patch('/users/me/', data),
  getUsers: (page: number = 1, perPage: number = 20) => api.get(`/users/?page=${page}&per_page=${perPage}`),
  getUser: (id: number) => api.get(`/userdetails/${id}/`),
  getDetailUsers: () => api.get('/users/details/'),
  searchUsers: (searchTerm: string) => api.get(`/users/search/?q=${encodeURIComponent(searchTerm)}`),
  updateUser: (id: number, data: Partial<User>) => api.put(`/users/${id}/admin/`, data),
  deleteUser: (id: number) => api.delete(`/users/${id}/admin/`),
  getUserPosts: (id: number) => api.get(`/userdetails/${id}/post/`),
  updateUserWithFormData: (id: number, data: FormData) => api.patch(`/users/${id}/admin/`, data, {
    headers: {
      'Content-Type': undefined, // Let Axios set the correct boundary
      // 'Content-Type': 'multipart/form-data',
    },
  }),
};

// Post API
export const postAPI = {
  getPosts: () => api.get('/posts/'),
  createPost: (data: { content: string; image_file?: File; category?: string }) => {
    if (data.image_file) {
      // If there's an image file, use FormData
      const formData = new FormData();
      formData.append('content', data.content);
      formData.append('category', data.category || 'general');
      formData.append('image', data.image_file);
      return api.post('/posts/', formData, {
        headers: {
          'Content-Type': undefined, // Let Axios set the correct boundary
          // 'Content-Type': 'multipart/form-data',
        },
      });
    } else {
      // If no image file, use regular JSON
      return api.post('/posts/', {
        content: data.content,
        category: data.category || 'general',
      });
    }
  },
  getPost: (id: number) => api.get(`/posts/${id}/`),
  updatePost: (id: number, data: Partial<Post> & { image_file?: File; remove_image?: boolean }) => {
    if (data.image_file) {
      // If there's an image file, use FormData
      const formData = new FormData();
      formData.append('content', data.content || '');
      formData.append('category', data.category || 'general');
      formData.append('is_active', data.is_active !== false ? 'true' : 'false');
      formData.append('image', data.image_file);
      return api.put(`/posts/${id}/`, formData, {
        headers: {
          'Content-Type': undefined, // Let Axios set the correct boundary
        },
      });
    } else {
      // If no image file, use regular JSON (including image removal)
      const jsonData: any = {
        content: data.content,
        category: data.category || 'general',
        is_active: data.is_active !== false,
      };
      
      // Add remove_image flag if needed
      if (data.remove_image) {
        jsonData.remove_image = true;
      }
      
      return api.put(`/posts/${id}/`, jsonData);
    }
  },
  deletePost: (id: number) => api.delete(`/posts/${id}/`),
  getFeed: () => api.get('/feed/'),
  likePost: (id: number) => api.post(`/posts/${id}/like/`),
  unlikePost: (id: number) => api.delete(`/posts/${id}/unlike/`),
  getLikeStatus: (id: number) => api.get(`/posts/${id}/like-status/`),
};

// Comment API
export const commentAPI = {
  getComments: (postId: number) => api.get(`/posts/${postId}/comments/`),
  createComment: (postId: number, data: { content: string }) =>
    api.post(`/posts/${postId}/comments/`, data),
  deleteComment: (id: number) => api.delete(`/comments/${id}/`),
};

// Social API
export const socialAPI = {
  followUser: (userId: number) => api.post(`/users/${userId}/follow/`),
  unfollowUser: (userId: number) => api.delete(`/users/${userId}/unfollow/`),
  getFollowers: (userId: number) => api.get(`/userdetails/${userId}/followers/`),
  getFollowing: (userId: number) => api.get(`/userdetails/${userId}/following/`),
  getFollowStatus: (userId: number) => api.get(`/users/${userId}/follow-status/`),
};

// Notification API
export const notificationAPI = {
  getNotifications: () => api.get('/notifications/'),
  markAsRead: (id: number) => api.post(`/notifications/${id}/read/`),
  markAllAsRead: () => api.post('/notifications/mark-all-read/'),
};

// Admin API
export const adminAPI = {
  getUsers: () => api.get('/admin/users/'),
  getUser: (id: number) => api.get(`/admin/users/${id}/`),
  deactivateUser: (id: number) => api.post(`/admin/users/${id}/deactivate/`),
  getPosts: () => api.get('/admin/posts/'),
  deletePost: (id: number) => api.delete(`/admin/posts/${id}/delete/`),
  getStats: () => api.get('/admin/stats/'),
};

export default api;
