from django.urls import path
from .views import (
    follow_user,
    unfollow_user,
    UserFollowersView,
    UserFollowingView,
    follow_status,
)

urlpatterns = [
    path('users/<int:user_id>/follow/', follow_user, name='follow-user'),
    path('users/<int:user_id>/unfollow/', unfollow_user, name='unfollow-user'),
    path('users/<int:user_id>/followers/', UserFollowersView.as_view(), name='user-followers'),
    path('users/<int:user_id>/following/', UserFollowingView.as_view(), name='user-following'),
    path('users/<int:user_id>/follow-status/', follow_status, name='follow-status'),
]
