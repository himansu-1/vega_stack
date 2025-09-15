from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model

from .models import Follow
from .serializers import FollowSerializer, FollowCreateSerializer
from notifications.models import Notification

User = get_user_model()


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def follow_user(request, user_id):
    user_to_follow = get_object_or_404(User, id=user_id, is_active=True)
    
    if user_to_follow == request.user:
        return Response({"error": "You cannot follow yourself"}, status=status.HTTP_400_BAD_REQUEST)
    
    # Check if already following
    follow, created = Follow.objects.get_or_create(follower=request.user, following=user_to_follow)
    
    if created:
        # Update follower counts
        request.user.following_count += 1
        request.user.save()
        user_to_follow.followers_count += 1
        user_to_follow.save()
        
        # Create notification
        Notification.objects.create(
            recipient=user_to_follow,
            sender=request.user,
            notification_type='follow',
            message=f"{request.user.username} started following you"
        )
        
        return Response({"message": f"Now following {user_to_follow.username}"}, status=status.HTTP_201_CREATED)
    else:
        return Response({"message": "Already following this user"}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([permissions.IsAuthenticated])
def unfollow_user(request, user_id):
    user_to_unfollow = get_object_or_404(User, id=user_id, is_active=True)
    
    try:
        follow = Follow.objects.get(follower=request.user, following=user_to_unfollow)
        follow.delete()
        
        # Update follower counts
        request.user.following_count -= 1
        request.user.save()
        user_to_unfollow.followers_count -= 1
        user_to_unfollow.save()
        
        return Response({"message": f"Unfollowed {user_to_unfollow.username}"}, status=status.HTTP_200_OK)
    except Follow.DoesNotExist:
        return Response({"message": "Not following this user"}, status=status.HTTP_400_BAD_REQUEST)


class UserFollowersView(generics.ListAPIView):
    serializer_class = FollowSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user_id = self.kwargs['user_id']
        return Follow.objects.filter(following_id=user_id).select_related('follower')


class UserFollowingView(generics.ListAPIView):
    serializer_class = FollowSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user_id = self.kwargs['user_id']
        return Follow.objects.filter(follower_id=user_id).select_related('following')


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def follow_status(request, user_id):
    user = get_object_or_404(User, id=user_id, is_active=True)
    is_following = Follow.objects.filter(follower=request.user, following=user).exists()
    
    return Response({"is_following": is_following}, status=status.HTTP_200_OK)
