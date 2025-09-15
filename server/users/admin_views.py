from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta

from .models import User
from .serializers import UserListSerializer
from posts.models import Post
from posts.serializers import PostSerializer
from social.models import Follow
from posts.models import Like, Comment

User = get_user_model()


class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'


class AdminUserListView(generics.ListAPIView):
    serializer_class = UserListSerializer
    permission_classes = [IsAdminUser]
    
    def get_queryset(self):
        return User.objects.all().order_by('-date_joined')


class AdminUserDetailView(generics.RetrieveAPIView):
    serializer_class = UserListSerializer
    permission_classes = [IsAdminUser]
    
    def get_queryset(self):
        return User.objects.all()


@api_view(['POST'])
@permission_classes([IsAdminUser])
def deactivate_user(request, user_id):
    user = get_object_or_404(User, id=user_id)
    
    if user.role == 'admin':
        return Response({"error": "Cannot deactivate admin users"}, status=status.HTTP_400_BAD_REQUEST)
    
    user.is_active = False
    user.save()
    
    return Response({"message": f"User {user.username} has been deactivated"}, status=status.HTTP_200_OK)


class AdminPostListView(generics.ListAPIView):
    permission_classes = [IsAdminUser]
    
    def get_queryset(self):
        return Post.objects.all().select_related('author').order_by('-created_at')
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        
        # Add basic statistics
        stats = {
            'total_posts': Post.objects.count(),
            'active_posts': Post.objects.filter(is_active=True).count(),
            'total_users': User.objects.count(),
            'active_users_today': User.objects.filter(last_login__date=timezone.now().date()).count()
        }
        
        return Response({
            'posts': serializer.data,
            'stats': stats
        })


@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def admin_delete_post(request, post_id):
    post = get_object_or_404(Post, id=post_id)
    post.is_active = False
    post.save()
    
    # Update user's post count
    post.author.posts_count -= 1
    post.author.save()
    
    return Response({"message": f"Post {post_id} has been deleted"}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_stats(request):
    from django.utils import timezone
    from datetime import timedelta
    
    today = timezone.now().date()
    week_ago = today - timedelta(days=7)
    
    stats = {
        'total_users': User.objects.count(),
        'active_users_today': User.objects.filter(last_login__date=today).count(),
        'total_posts': Post.objects.count(),
        'active_posts': Post.objects.filter(is_active=True).count(),
        'posts_this_week': Post.objects.filter(created_at__date__gte=week_ago).count(),
        'total_follows': Follow.objects.count(),
        'total_likes': Like.objects.count(),
        'total_comments': Comment.objects.count(),
    }
    
    return Response(stats, status=status.HTTP_200_OK)
