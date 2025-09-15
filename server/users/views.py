from django.db.models import Q
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.generics import ListAPIView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from utils.cloudinary_utils import delete_cloudinary_image

from posts.models import Post
from posts.serializers import PostListSerializer

from .pagination import CustomUserPagination

from .models import User
from .serializers import (
    UserListPaginatedSerializer,
    UserListSerializer,
    UserMeSerializer,
    UserRegistrationSerializer,
    UserLoginSerializer,
    UserEditSerializer,
    UserWithFollowStatusSerializer
)
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils import timezone

import cloudinary.uploader
from django.core.files.uploadedfile import InMemoryUploadedFile

class TestAPI(APIView):
    permission_classes = [permissions.AllowAny]
    
    def get(self, request):
        return Response({'message': 'API is working'}, status=200)

class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user_data = serializer.validated_data
            # If user is registering as admin, set is_active to False
            if user_data.get('role') == 'admin':
                user_data['is_active'] = False
            else:
                user_data['is_active'] = True
            
            user = serializer.save()
            return Response({
                'message': 'User registered successfully',
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'role': user.role,
                    'is_active': user.is_active,
                }
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid():
            return Response(serializer.validated_data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"message": "Logged out successfully"}, status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response({"error": "Invalid or missing refresh token"}, status=status.HTTP_400_BAD_REQUEST)

class EditUserView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def handle_image_upload(self, image_file: InMemoryUploadedFile):
        # Validate file size (under 500MB)
        if image_file.size > 2 * 1024 * 1024:
            raise ValueError("File size too large. Maximum size is 2MB.")
        
        # Validate file type
        valid_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
        if image_file.content_type not in valid_types:
            raise ValueError("Only JPG, JPEG, PNG, or GIF files are allowed")

        # Upload to Cloudinary
        try:
            result = cloudinary.uploader.upload(
                image_file,
                folder="avatars",  # Organize uploads in a folder
                transformation=[
                    {'width': 200, 'height': 200, 'crop': 'fill', 'gravity': 'face'}
                ]
            )
            print("Cloudinary upload result:", result)
            return result['secure_url']
        except Exception as e:
            print("Cloudinary upload error:", str(e))
            raise ValueError(f"Failed to upload image: {str(e)}")
        
    def patch_current_user(self, request):
        data = request.data.copy()

        # Handle image upload
        try:
            if 'avatar' in request.FILES:
                avatar_url = self.handle_image_upload(request.FILES['avatar'])
                data['avatar_url'] = avatar_url
        except ValueError as e:
            return Response({"error": str(e)}, status=400)

        serializer = UserEditSerializer(request.user, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Profile partially updated"}, status=200)
        return Response(serializer.errors, status=400)

    def get(self, request):
        serializer = UserMeSerializer(request.user)
        return Response(serializer.data, status=200)

    def put(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
            
            # Store old avatar URL before updating
            old_avatar_url = user.avatar_url
            
            serializer = UserEditSerializer(user, data=request.data, partial=True)
            if serializer.is_valid():
                # Check if avatar is being updated
                if 'avatar_url' in serializer.validated_data and serializer.validated_data['avatar_url'] != old_avatar_url:
                    # Delete old avatar from Cloudinary
                    if old_avatar_url:
                        delete_cloudinary_image(old_avatar_url)
                
                serializer.save()
                return Response({"message": "User updated successfully"}, status=200)
            return Response(serializer.errors, status=400)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=404)

    def patch(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
            
            # Store old avatar URL before updating
            old_avatar_url = user.avatar_url
            
            data = {key: value for key, value in request.data.items()}
            print(data)
            print(pk)

            # Handle image upload
            try:
                if 'avatar' in request.FILES:
                    avatar_url = self.handle_image_upload(request.FILES['avatar'])
                    data['avatar_url'] = avatar_url
                    
                    # Delete old avatar from Cloudinary
                    if old_avatar_url:
                        delete_cloudinary_image(old_avatar_url)
            except ValueError as e:
                return Response({"error": str(e)}, status=400)

            serializer = UserEditSerializer(user, data=data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response({"message": "User updated successfully"}, status=200)
            return Response(serializer.errors, status=400)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=404)

class ListUsersView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        users = User.objects.all()
        serializer = UserListSerializer(users, many=True)
        return Response(serializer.data, status=200)

# class ListPaginatedUsersView(APIView):
#     permission_classes = [permissions.IsAuthenticated]
#     pagination_class = CustomUserPagination
#     serializer_class = UserListPaginatedSerializer
#     queryset = User.objects.all().order_by('-id')

#     def get(self, request):
#         return self.list(request)
class ListPaginatedUsersView(ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    queryset = User.objects.all().order_by('-id')
    serializer_class = UserListSerializer
    pagination_class = CustomUserPagination

class DetailUserView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    # Return total users count, total active users, admin users, regular users
    def get(self, request):
        users = User.objects.all()
        total_users = users.count()
        total_active_users = users.filter(is_active=True).count()
        admin_users = users.filter(role='admin').count()
        regular_users = users.filter(role='user').count()
        return Response({'total_users': total_users, 'total_active_users': total_active_users, 'admin_users': admin_users, 'regular_users': regular_users}, status=200)

class UserDetails(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        user = User.objects.get(pk=pk)
        serializer = UserWithFollowStatusSerializer(user, context={'request': request})
        return Response(serializer.data, status=200)

class SearchUsersView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        search_term = request.query_params.get('q', '')
        if len(search_term) < 2:
            return Response({'results': []}, status=200)
        
        users = User.objects.filter(
            Q(username__icontains=search_term) |
            Q(first_name__icontains=search_term) |
            Q(last_name__icontains=search_term) |
            Q(email__icontains=search_term)
        ).order_by('-id')
        
        serializer = UserWithFollowStatusSerializer(users, many=True, context={'request': request})
        return Response({'results': serializer.data, 'count': users.count()}, status=200)

class AdminUserDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_object(self, pk):
        try:
            return User.objects.get(pk=pk)
        except User.DoesNotExist:
            return None

    def handle_image_upload(self, image_file):
        import cloudinary.uploader
        
        # Validate file size (max 2MB)
        if image_file.size > 2 * 1024 * 1024:
            raise ValueError("File size too large. Maximum size is 2MB.")
        
        # Validate file type
        valid_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
        if image_file.content_type not in valid_types:
            raise ValueError("Only JPG, JPEG, PNG, or GIF files are allowed")

        # Upload to Cloudinary
        try:
            result = cloudinary.uploader.upload(
                image_file,
                folder="avatars",  # Organize uploads in a folder
                transformation=[
                    {'width': 200, 'height': 200, 'crop': 'fill', 'gravity': 'face'}
                ]
            )
            print("Cloudinary upload result:", result)
            return result['secure_url']
        except Exception as e:
            print("Cloudinary upload error:", str(e))
            raise ValueError(f"Failed to upload image: {str(e)}")

    def get(self, request, pk):
        user_obj = self.get_object(pk)
        if not user_obj:
            return Response({'error': 'User not found'}, status=404)
        
        serializer = UserListSerializer(user_obj)
        return Response(serializer.data, status=200)

    def put(self, request, pk):
        user_obj = self.get_object(pk)
        if not user_obj:
            return Response({'error': 'User not found'}, status=404)
        
        # Only admins can edit users
        if request.user.role != 'admin':
            return Response({'error': 'Permission denied'}, status=403)
        
        serializer = UserListSerializer(user_obj, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=200)
        return Response(serializer.errors, status=400)

    def patch(self, request, pk):
        user_obj = self.get_object(pk)
        if not user_obj:
            return Response({'error': 'User not found'}, status=404)
        
        # Only admins can edit users
        if request.user.role != 'admin':
            return Response({'error': 'Permission denied'}, status=403)
        
        # Store old avatar URL before updating
        old_avatar_url = user_obj.avatar_url
        
        # Handle FormData properly - don't copy it as it contains unpickleable file objects
        data = {}
        for key, value in request.data.items():
            data[key] = value
        print("Request FILES:", request.FILES)
        print("Request DATA:", data)
        
        # Handle image upload
        try:
            if 'avatar' in request.FILES:
                print("Avatar file found:", request.FILES['avatar'])
                avatar_url = self.handle_image_upload(request.FILES['avatar'])
                data['avatar_url'] = avatar_url
                print("Avatar URL generated:", avatar_url)
                
                # Delete old avatar from Cloudinary
                if old_avatar_url:
                    delete_cloudinary_image(old_avatar_url)
            else:
                print("No avatar file in request.FILES")
        except ValueError as e:
            print("Avatar upload error:", str(e))
            return Response({"error": str(e)}, status=400)
        
        serializer = UserEditSerializer(user_obj, data=data, partial=True)
        print("Data being sent:", data)
        print("Serializer is_valid:", serializer.is_valid())
        if serializer.is_valid():
            serializer.save()
            print("Serializer data after save:", serializer.data)
            return Response(serializer.data, status=200)
        else:
            print("Serializer errors:", serializer.errors)
            return Response(serializer.errors, status=400)

    def delete(self, request, pk):
        user_obj = self.get_object(pk)
        if not user_obj:
            return Response({'error': 'User not found'}, status=404)
        
        # Only admins can delete users
        if request.user.role != 'admin':
            return Response({'error': 'Permission denied'}, status=403)
        
        # Don't allow deleting admin users
        if user_obj.role == 'admin':
            return Response({'error': 'Cannot delete admin users'}, status=400)
        
        user_obj.delete()
        return Response({'message': 'User deleted successfully'}, status=200)

class UserPosts(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        user = User.objects.get(pk=pk)
        posts = Post.objects.filter(author=user)
        serializer = PostListSerializer(posts, many=True)
        return Response(serializer.data, status=200)

class UserFollowers(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
            # Get followers using the reverse foreign key relationship
            followers = [follow.follower for follow in user.followers_set.all()]
            serializer = UserListSerializer(followers, many=True)
            return Response(serializer.data, status=200)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)

class UserFollowing(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
            # Get following using the reverse foreign key relationship
            following = [follow.following for follow in user.following_set.all()]
            serializer = UserListSerializer(following, many=True)
            return Response(serializer.data, status=200)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)

class FollowUserView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            target_user = User.objects.get(pk=pk)
            current_user = request.user
            
            if current_user == target_user:
                return Response({'error': 'Cannot follow yourself'}, status=400)
            
            # Check if already following
            from social.models import Follow
            follow, created = Follow.objects.get_or_create(
                follower=current_user,
                following=target_user
            )
            
            if created:
                # Update counts
                current_user.following_count += 1
                target_user.followers_count += 1
                current_user.save()
                target_user.save()
                
                return Response({'message': 'User followed successfully', 'is_following': True}, status=200)
            else:
                return Response({'error': 'Already following this user'}, status=400)
                
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)

class UnfollowUserView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, pk):
        try:
            target_user = User.objects.get(pk=pk)
            current_user = request.user
            
            # Check if following
            from social.models import Follow
            follow = Follow.objects.filter(
                follower=current_user,
                following=target_user
            ).first()
            
            if follow:
                follow.delete()
                
                # Update counts
                current_user.following_count -= 1
                target_user.followers_count -= 1
                current_user.save()
                target_user.save()
                
                return Response({'message': 'User unfollowed successfully', 'is_following': False}, status=200)
            else:
                return Response({'error': 'Not following this user'}, status=400)
                
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)

class FollowStatusView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        try:
            target_user = User.objects.get(pk=pk)
            current_user = request.user
            
            from social.models import Follow
            is_following = Follow.objects.filter(
                follower=current_user,
                following=target_user
            ).exists()
            
            return Response({'is_following': is_following}, status=200)
                
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)