from django.urls import path
from .views import (
    TestAPI,
    RegisterView,
    LoginView,
    LogoutView,
    EditUserView,
    ListUsersView,
    ListPaginatedUsersView,
    DetailUserView,
    SearchUsersView,
    AdminUserDetailView,
    UserDetails,
    UserFollowers,
    UserFollowing,
    UserPosts,
    FollowUserView,
    UnfollowUserView,
    FollowStatusView
)
from .admin_views import (
    AdminUserListView,
    deactivate_user,
    AdminPostListView,
    admin_delete_post,
    admin_stats,
)
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    # Test endpoint
    path('test/', TestAPI.as_view()),
    
    # Authentication
    path('auth/register/', RegisterView.as_view()),
    path('auth/login/', LoginView.as_view()),
    path('auth/logout/', LogoutView.as_view()),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # User management
    path('users/me/', EditUserView.as_view()),
    path('users/', ListPaginatedUsersView.as_view(), name='list-users'),
    path('userdetails/<int:pk>/', UserDetails.as_view()),
    path('userdetails/<int:pk>/post/', UserPosts.as_view()),
    path('userdetails/<int:pk>/followers/', UserFollowers.as_view()),
    path('userdetails/<int:pk>/following/', UserFollowing.as_view()),
    path('users/<int:pk>/follow/', FollowUserView.as_view()),
    path('users/<int:pk>/unfollow/', UnfollowUserView.as_view()),
    path('users/<int:pk>/follow-status/', FollowStatusView.as_view()),
    path('users/<int:pk>/', EditUserView.as_view()),
    path('users/details/', DetailUserView.as_view()),
    path('users/search/', SearchUsersView.as_view()),
    path('users/<int:pk>/admin/', AdminUserDetailView.as_view()),
    
    # Admin endpoints
    path('admin/users/', AdminUserListView.as_view()),
    path('admin/users/<int:user_id>/deactivate/', deactivate_user),
    path('admin/posts/', AdminPostListView.as_view()),
    path('admin/posts/<int:post_id>/delete/', admin_delete_post),
    path('admin/stats/', admin_stats),
]
