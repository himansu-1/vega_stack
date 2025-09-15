# SocialConnect Backend API

A comprehensive social media backend built with Django REST Framework.

## Features

- **Authentication**: JWT-based authentication with registration/login
- **User Management**: User profiles with bio, avatar, follower/following counts
- **Content Creation**: Text posts with image upload capability
- **Social Interactions**: Follow/unfollow users, like posts, comment system
- **Personalized Feed**: Chronological feed showing posts from followed users
- **Real-time Notifications**: Live notifications using Supabase Real-Time
- **Admin Features**: User management and content oversight

## Setup

1. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

2. **Environment Variables**
   Create a `.env` file in the server directory with:
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

3. **Database Migration**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

4. **Create Superuser**
   ```bash
   python manage.py createsuperuser
   ```

5. **Run Server**
   ```bash
   python manage.py runserver
   ```

## API Endpoints

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

### Comments
- `GET /api/posts/{post_id}/comments/` - Get post comments
- `POST /api/posts/{post_id}/comments/` - Add comment
- `DELETE /api/comments/{id}/` - Delete comment

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

## Models

### User
- Custom user model with role-based permissions
- Profile fields: bio, avatar_url, website, location
- Statistics: followers_count, following_count, posts_count

### Post
- Content with 280 character limit
- Image upload support
- Categories: general, announcement, question
- Like and comment counts

### Follow
- Many-to-many relationship between users
- Tracks follower/following relationships

### Comment
- Comments on posts with 200 character limit
- Flat structure (no nested replies)

### Like
- Many-to-many relationship between users and posts
- Prevents duplicate likes

### Notification
- Real-time notifications for follows, likes, comments
- Integrated with Supabase for real-time updates

## Technology Stack

- **Backend**: Django 5.2.6, Django REST Framework
- **Authentication**: JWT with django-rest-framework-simplejwt
- **Database**: SQLite (development), PostgreSQL (production)
- **File Storage**: Cloudinary for image uploads
- **Real-time**: Supabase Real-Time for notifications
- **CORS**: django-cors-headers for frontend integration
