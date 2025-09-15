from django.urls import path
from .views import (
    PostListCreateView,
    PostDetailView,
    FeedView,
    CommentListCreateView,
    CommentDetailView,
    like_post,
    unlike_post,
    like_status,
)

urlpatterns = [
    # Posts
    path('posts/', PostListCreateView.as_view(), name='post-list-create'),
    path('posts/<int:pk>/', PostDetailView.as_view(), name='post-detail'),
    path('feed/', FeedView.as_view(), name='feed'),
    
    # Comments
    path('posts/<int:post_id>/comments/', CommentListCreateView.as_view(), name='comment-list-create'),
    path('comments/<int:pk>/', CommentDetailView.as_view(), name='comment-detail'),
    
    # Likes
    path('posts/<int:post_id>/like/', like_post, name='like-post'),
    path('posts/<int:post_id>/unlike/', unlike_post, name='unlike-post'),
    path('posts/<int:post_id>/like-status/', like_status, name='like-status'),
]
