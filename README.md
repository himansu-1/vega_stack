# SocialConnect - Social Media Platform

A comprehensive social media platform built with Django REST Framework backend and Next.js frontend, featuring real-time notifications, user management, and social interactions.

## 🚀 Features

### Core Functionality
- **User Authentication**: JWT-based authentication with registration/login
- **User Profiles**: Comprehensive profiles with bio, avatar, follower/following counts
- **Content Creation**: Text posts with image upload capability (280 character limit)
- **Social Interactions**: Follow/unfollow users, like posts, comment system
- **Personalized Feed**: Chronological feed showing posts from followed users
- **Real-time Notifications**: Live notifications using Supabase Real-Time
- **Admin Features**: User management and content oversight

### User Roles & Permissions
- **User (Default)**: Create posts, follow users, like/comment, view feeds
- **Admin**: All user permissions + user management, content moderation, platform statistics

## 🏗️ Architecture

```
vega_stack/
├── server/                 # Django REST API Backend
│   ├── users/             # User management & authentication
│   ├── posts/             # Posts, comments, likes
│   ├── social/            # Follow relationships
│   ├── notifications/     # Real-time notifications
│   └── server/            # Django settings & configuration
├── client/                # Next.js Frontend
│   ├── src/
│   │   ├── app/           # Next.js App Router pages
│   │   ├── components/    # React components
│   │   ├── contexts/      # React contexts (Auth)
│   │   └── lib/           # Utilities & API client
└── README.md
```

## 🛠️ Technology Stack

### Backend
- **Framework**: Django 5.2.6, Django REST Framework
- **Authentication**: JWT with django-rest-framework-simplejwt
- **Database**: SQLite (development), PostgreSQL (production)
- **File Storage**: Cloudinary for image uploads
- **Real-time**: Supabase Real-Time for notifications
- **CORS**: django-cors-headers

### Frontend
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context
- **HTTP Client**: Axios
- **Real-time**: Supabase Real-time subscriptions
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

## 📋 API Endpoints

### Authentication
- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - User login
- `POST /api/auth/logout/` - User logout
- `POST /api/token/refresh/` - Refresh JWT token

### Users
- `GET /api/users/me/` - Get current user profile
- `PUT/PATCH /api/users/me/` - Update current user profile
- `GET /api/users/` - List all users
- `GET /api/users/{id}/` - Get user by ID

### Posts
- `GET /api/posts/` - List all posts
- `POST /api/posts/` - Create new post
- `GET /api/posts/{id}/` - Get post by ID
- `PUT/PATCH /api/posts/{id}/` - Update post
- `DELETE /api/posts/{id}/` - Delete post
- `GET /api/feed/` - Get personalized feed

### Social Features
- `POST /api/users/{user_id}/follow/` - Follow user
- `DELETE /api/users/{user_id}/unfollow/` - Unfollow user
- `GET /api/users/{user_id}/followers/` - Get user followers
- `GET /api/users/{user_id}/following/` - Get user following
- `POST /api/posts/{post_id}/like/` - Like post
- `DELETE /api/posts/{post_id}/unlike/` - Unlike post

### Notifications
- `GET /api/notifications/` - Get user notifications
- `POST /api/notifications/{id}/read/` - Mark notification as read
- `POST /api/notifications/mark-all-read/` - Mark all notifications as read

### Admin (Admin users only)
- `GET /api/admin/users/` - List all users
- `GET /api/admin/users/{id}/` - Get user details
- `POST /api/admin/users/{id}/deactivate/` - Deactivate user
- `GET /api/admin/posts/` - List all posts
- `DELETE /api/admin/posts/{id}/delete/` - Delete any post
- `GET /api/admin/stats/` - Get platform statistics

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 18+
- PostgreSQL (for production)
- Supabase account
- Cloudinary account

### Backend Setup

1. **Navigate to server directory**
   ```bash
   cd server
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Environment variables**
   Create a `.env` file in the server directory:
   ```
   SECRET_KEY=your-secret-key-here
   DEBUG=True
   SUPABASE_URL=your-supabase-url
   SUPABASE_KEY=your-supabase-anon-key
   SUPABASE_SERVICE_KEY=your-supabase-service-key
   CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
   CLOUDINARY_API_KEY=your-cloudinary-api-key
   CLOUDINARY_API_SECRET=your-cloudinary-api-secret
   ```

5. **Database setup**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

6. **Create superuser**
   ```bash
   python manage.py createsuperuser
   ```

7. **Run server**
   ```bash
   python manage.py runserver
   ```

### Frontend Setup

1. **Navigate to client directory**
   ```bash
   cd client
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment variables**
   Create a `.env.local` file in the client directory:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8000/api
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

## 📱 Frontend Pages

- **`/`** - Landing page with login/register forms
- **`/feed`** - Main feed showing posts from followed users
- **`/users`** - Browse and follow other users
- **`/notifications`** - View and manage notifications
- **`/profile`** - User profile and personal posts
- **`/admin`** - Admin dashboard (admin users only)

## 🔧 Configuration

### Supabase Setup
1. Create a new Supabase project
2. Enable Real-time for the notifications table
3. Set up Row Level Security (RLS) policies
4. Configure storage buckets for image uploads

### Cloudinary Setup
1. Create a Cloudinary account
2. Get your cloud name, API key, and API secret
3. Configure image upload settings (2MB limit, JPEG/PNG only)

## 🧪 Testing

### Backend Testing
```bash
cd server
python manage.py test
```

### Frontend Testing
```bash
cd client
npm test
```

## 📦 Deployment

### Backend Deployment
- Deploy to platforms like Heroku, Railway, or DigitalOcean
- Use PostgreSQL for production database
- Set up environment variables
- Configure static file serving

### Frontend Deployment
- Deploy to Vercel, Netlify, or similar platforms
- Set up environment variables
- Configure API URL for production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, please open an issue in the GitHub repository or contact the development team.

---

**SocialConnect** - Connect, Share, and Discover! 🌟
