import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Post, postAPI, commentAPI } from '@/lib/api';
import toast from 'react-hot-toast';

interface PostsState {
  posts: Post[];
  feed: Post[];
  currentPost: Post | null;
  comments: any[];
  isLoading: boolean;
  isCreating: boolean;
  error: string | null;
}

const initialState: PostsState = {
  posts: [],
  feed: [],
  currentPost: null,
  comments: [],
  isLoading: false,
  isCreating: false,
  error: null,
};

// Async thunks
export const fetchPosts = createAsyncThunk(
  'posts/fetchPosts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await postAPI.getPosts();
      return response.data.results || response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to fetch posts';
      return rejectWithValue(message);
    }
  }
);

export const fetchFeed = createAsyncThunk(
  'posts/fetchFeed',
  async (_, { rejectWithValue }) => {
    try {
      const response = await postAPI.getFeed();
      return response.data.results || response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to fetch feed';
      return rejectWithValue(message);
    }
  }
);

export const createPost = createAsyncThunk(
  'posts/createPost',
  async (postData: { content: string; image_file?: File; category?: string }, { rejectWithValue }) => {
    try {
      const response = await postAPI.createPost(postData);
      toast.success('Post created successfully!');
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to create post';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const updatePost = createAsyncThunk(
  'posts/updatePost',
  async ({ id, data }: { id: number; data: Partial<Post> }, { rejectWithValue }) => {
    try {
      const response = await postAPI.updatePost(id, data);
      toast.success('Post updated successfully!');
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to update post';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const deletePost = createAsyncThunk(
  'posts/deletePost',
  async (id: number, { rejectWithValue }) => {
    try {
      await postAPI.deletePost(id);
      toast.success('Post deleted successfully!');
      return id;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to delete post';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const likePost = createAsyncThunk(
  'posts/likePost',
  async (id: number, { rejectWithValue }) => {
    try {
      await postAPI.likePost(id);
      return id;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to like post';
      return rejectWithValue(message);
    }
  }
);

export const unlikePost = createAsyncThunk(
  'posts/unlikePost',
  async (id: number, { rejectWithValue }) => {
    try {
      await postAPI.unlikePost(id);
      return id;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to unlike post';
      return rejectWithValue(message);
    }
  }
);

export const fetchComments = createAsyncThunk(
  'posts/fetchComments',
  async (postId: number, { rejectWithValue }) => {
    try {
      const response = await commentAPI.getComments(postId);
      return { postId, comments: response.data.results || response.data };
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to fetch comments';
      return rejectWithValue(message);
    }
  }
);

export const createComment = createAsyncThunk(
  'posts/createComment',
  async ({ postId, content }: { postId: number; content: string }, { rejectWithValue }) => {
    try {
      const response = await commentAPI.createComment(postId, { content });
      toast.success('Comment added successfully!');
      return { postId, comment: response.data };
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to add comment';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const deleteComment = createAsyncThunk(
  'posts/deleteComment',
  async (id: number, { rejectWithValue }) => {
    try {
      await commentAPI.deleteComment(id);
      toast.success('Comment deleted successfully!');
      return id;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to delete comment';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearComments: (state) => {
      state.comments = [];
    },
    setCurrentPost: (state, action: PayloadAction<Post | null>) => {
      state.currentPost = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Posts
      .addCase(fetchPosts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.posts = action.payload;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch Feed
      .addCase(fetchFeed.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFeed.fulfilled, (state, action) => {
        state.isLoading = false;
        state.feed = action.payload;
      })
      .addCase(fetchFeed.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Create Post
      .addCase(createPost.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.isCreating = false;
        state.posts.unshift(action.payload);
        state.feed.unshift(action.payload);
      })
      .addCase(createPost.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload as string;
      })
      
      // Update Post
      .addCase(updatePost.fulfilled, (state, action) => {
        const index = state.posts.findIndex(post => post.id === action.payload.id);
        if (index !== -1) {
          state.posts[index] = action.payload;
        }
        const feedIndex = state.feed.findIndex(post => post.id === action.payload.id);
        if (feedIndex !== -1) {
          state.feed[feedIndex] = action.payload;
        }
      })
      
      // Delete Post
      .addCase(deletePost.fulfilled, (state, action) => {
        state.posts = state.posts.filter(post => post.id !== action.payload);
        state.feed = state.feed.filter(post => post.id !== action.payload);
      })
      
      // Like Post
      .addCase(likePost.fulfilled, (state, action) => {
        const postId = action.payload;
        const updatePost = (post: Post) => {
          if (post.id === postId) {
            return { ...post, is_liked: true, like_count: post.like_count + 1 };
          }
          return post;
        };
        state.posts = state.posts.map(updatePost);
        state.feed = state.feed.map(updatePost);
      })
      
      // Unlike Post
      .addCase(unlikePost.fulfilled, (state, action) => {
        const postId = action.payload;
        const updatePost = (post: Post) => {
          if (post.id === postId) {
            return { ...post, is_liked: false, like_count: post.like_count - 1 };
          }
          return post;
        };
        state.posts = state.posts.map(updatePost);
        state.feed = state.feed.map(updatePost);
      })
      
      // Fetch Comments
      .addCase(fetchComments.fulfilled, (state, action) => {
        state.comments = action.payload.comments;
      })
      
      // Create Comment
      .addCase(createComment.fulfilled, (state, action) => {
        state.comments.unshift(action.payload.comment);
        const postId = action.payload.postId;
        const updatePost = (post: Post) => {
          if (post.id === postId) {
            return { ...post, comment_count: post.comment_count + 1 };
          }
          return post;
        };
        state.posts = state.posts.map(updatePost);
        state.feed = state.feed.map(updatePost);
      })
      
      // Delete Comment
      .addCase(deleteComment.fulfilled, (state, action) => {
        state.comments = state.comments.filter(comment => comment.id !== action.payload);
      });
  },
});

export const { clearError, clearComments, setCurrentPost } = postsSlice.actions;
export default postsSlice.reducer;
