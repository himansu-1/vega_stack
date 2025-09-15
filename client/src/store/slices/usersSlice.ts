import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User, userAPI, socialAPI, Post } from '@/lib/api';
import toast from 'react-hot-toast';

interface UsersState {
  users: User[];
  currentUser: User | null;
  selectedUser: User | null;
  selectedPosts: Post[];
  followers: any[];
  following: any[];
  isLoading: boolean;
  error: string | null;
  is_active: boolean;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  userStats: {
    total_users: number;
    total_active_users: number;
    admin_users: number;
    regular_users: number;
  } | null;
}

const initialState: UsersState = {
  users: [],
  currentUser: null,
  selectedUser: null,
  selectedPosts: [],
  followers: [],
  following: [],
  isLoading: false,
  error: null,
  is_active: true,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNext: false,
    hasPrevious: false,
  },
  userStats: null,
};

// Async thunks
export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (
    params: { page?: number; perPage?: number } = { page: 1, perPage: 20 },
    { rejectWithValue }
  ) => {
    const { page = 1, perPage = 20 } = params;
    try {
      const response = await userAPI.getUsers(page, perPage);
      return {
        users: response.data.results || response.data,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil((response.data.count || response.data.length) / perPage),
          totalCount: response.data.count || response.data.length,
          hasNext: !!response.data.next,
          hasPrevious: !!response.data.previous,
        }
      };
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to fetch users';
      return rejectWithValue(message);
    }
  }
);

export const detailUsers = createAsyncThunk(
  'users/detailUsers',
  async ({ rejectWithValue }: { rejectWithValue: any }) => {
    try {
      const response = await userAPI.getDetailUsers();
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to fetch detail users';
      return rejectWithValue(message);
    }
  }
);

export const searchUsers = createAsyncThunk(
  'users/searchUsers',
  async (searchTerm: string, { rejectWithValue }) => {
    try {
      const response = await userAPI.searchUsers(searchTerm);
      return {
        users: response.data.results || response.data,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalCount: response.data.count || response.data.length,
          hasNext: false,
          hasPrevious: false,
        }
      };
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to search users';
      return rejectWithValue(message);
    }
  }
);

export const fetchUser = createAsyncThunk(
  'users/fetchUser',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await userAPI.getUser(id);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to fetch user';
      return rejectWithValue(message);
    }
  }
);

export const followUser = createAsyncThunk(
  'users/followUser',
  async (userId: number, { rejectWithValue, getState }) => {
    try {
      const state = getState() as any;
      const currentUser = state.auth.user;
      
      // Check if already following
      const existingFollow = state.users.following.find((follow: any) => 
        follow.follower === currentUser.id && follow.following === userId
      );
      
      if (existingFollow) {
        return rejectWithValue('Already following this user');
      }
      
      await socialAPI.followUser(userId);
      toast.success('User followed successfully!');
      return userId;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to follow user';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const unfollowUser = createAsyncThunk(
  'users/unfollowUser',
  async (userId: number, { rejectWithValue }) => {
    try {
      await socialAPI.unfollowUser(userId);
      toast.success('User unfollowed successfully!');
      return userId;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to unfollow user';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const fetchFollowers = createAsyncThunk(
  'users/fetchFollowers',
  async (userId: number, { rejectWithValue }) => {
    try {
      const response = await socialAPI.getFollowers(userId);
      
      return { userId, followers: response.data.results || response.data };
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to fetch followers';
      return rejectWithValue(message);
    }
  }
);

export const fetchFollowing = createAsyncThunk(
  'users/fetchFollowing',
  async (userId: number, { rejectWithValue }) => {
    try {
      const response = await socialAPI.getFollowing(userId);
      
      return { userId, following: response.data.results || response.data };
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to fetch following';
      return rejectWithValue(message);
    }
  }
);

export const fetchUserPosts = createAsyncThunk(
  'users/fetchUserPosts',
  async (userId: number, { rejectWithValue }) => {
    try {
      const response = await userAPI.getUserPosts(userId);
      
      return { userId, posts: response.data.results || response.data };
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to fetch user posts';
      return rejectWithValue(message);
    }
  }
);

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentUser: (state, action: PayloadAction<User | null>) => {
      state.currentUser = action.payload;
    },
    clearFollowers: (state) => {
      state.followers = [];
    },
    clearFollowing: (state) => {
      state.following = [];
    },
    setSelectedUser: (state, action: PayloadAction<User | null>) => {
      state.selectedUser = action.payload;
    },
    clearSelectedUser: (state) => {
      state.selectedUser = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Users
      .addCase(fetchUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload.users;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Detail Users
      .addCase(detailUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(detailUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userStats = action.payload;
      })
      .addCase(detailUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Search Users
      .addCase(searchUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload.users;
        state.pagination = action.payload.pagination;
      })
      .addCase(searchUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch User
      .addCase(fetchUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedUser = action.payload;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Follow User
      .addCase(followUser.fulfilled, (state, action) => {
        const userId = action.payload;
        const user = state.users.find(u => u.id === userId);
        if (user) {
          user.followers_count += 1;
          user.is_following = true;
        }
        
        // Update selectedUser if it's the same user
        if (state.selectedUser && state.selectedUser.id === userId) {
          state.selectedUser.followers_count += 1;
          state.selectedUser.is_following = true;
        }
        
        // Add to following array
        const currentUser = state.currentUser;
        if (currentUser) {
          currentUser.following_count += 1;
          state.following.push({ following: userId });
        }
      })
      
      // Unfollow User
      .addCase(unfollowUser.fulfilled, (state, action) => {
        const userId = action.payload;
        const user = state.users.find(u => u.id === userId);
        if (user) {
          user.followers_count -= 1;
          user.is_following = false;
        }
        
        // Update selectedUser if it's the same user
        if (state.selectedUser && state.selectedUser.id === userId) {
          state.selectedUser.followers_count -= 1;
          state.selectedUser.is_following = false;
        }
        
        // Remove from following array
        const currentUser = state.currentUser;
        if (currentUser) {
          currentUser.following_count -= 1;
          state.following = state.following.filter((follow: any) => follow.following !== userId);
        }
      })
      
      // Fetch Followers
      .addCase(fetchFollowers.fulfilled, (state, action) => {
        state.followers = action.payload.followers;
      })
      
      // Fetch Following
      .addCase(fetchFollowing.fulfilled, (state, action) => {
        state.following = action.payload.following;
      })
      
      // Fetch User Posts
      .addCase(fetchUserPosts.fulfilled, (state, action) => {
        state.selectedPosts = action.payload.posts;
      });
  },
});

export const { clearError, setCurrentUser, clearFollowers, clearFollowing } = usersSlice.actions;
export default usersSlice.reducer;
