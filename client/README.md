# SocialConnect Frontend

A modern social media frontend built with Next.js, TypeScript, and Tailwind CSS.

## Features

- **Authentication**: Login/Register with JWT tokens
- **Feed**: Personalized feed showing posts from followed users
- **Posts**: Create, view, like, and comment on posts
- **Social**: Follow/unfollow users, view user profiles
- **Notifications**: Real-time notifications using Supabase
- **Admin Panel**: Admin-only features for user management
- **Responsive Design**: Mobile-first responsive design

## Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Create a `.env.local` file with:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8000/api
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```

4. **Build for Production**
   ```bash
   npm run build
   npm start
   ```

## Pages

- `/` - Landing page with login/register
- `/feed` - Main feed showing posts from followed users
- `/users` - Browse and follow other users
- `/notifications` - View and manage notifications
- `/profile` - User profile and posts
- `/admin` - Admin dashboard (admin users only)

## Components

- `LoginForm` - User login form
- `RegisterForm` - User registration form
- `Navigation` - Main navigation bar
- `PostCard` - Individual post display with interactions
- `CreatePost` - Form to create new posts

## Technology Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context
- **HTTP Client**: Axios
- **Real-time**: Supabase Real-time subscriptions
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

## API Integration

The frontend communicates with the Django REST API backend through:
- JWT authentication with automatic token refresh
- RESTful API calls for all CRUD operations
- Real-time notifications via Supabase subscriptions
- Image upload handling for posts and avatars