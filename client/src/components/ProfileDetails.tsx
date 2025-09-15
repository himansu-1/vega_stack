import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchUser, fetchUserPosts, followUser, unfollowUser, fetchFollowing } from "@/store/slices/usersSlice";
import { deletePost, updatePost } from "@/store/slices/postsSlice";
import { socialAPI, userAPI } from "@/lib/api";
import PostCard from "./PostCard";
import { UserPlus, UserMinus, Trash2, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";

export default function ProfileDetails({ id, dispatch }: { id: any, dispatch: any }) {
    const { selectedUser, selectedPosts, following } = useSelector((state: any) => state.users);
    const { user: currentUser } = useSelector((state: any) => state.auth);
    const router = useRouter();
    const reduxDispatch = useDispatch();
    const [isFollowing, setIsFollowing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Ensure id is defined and a valid number before dispatching
        if (id && !isNaN(Number(id))) {
            // @ts-ignore: Suppress type error for dispatching thunk
            dispatch(fetchUser(Number(id)));
            // @ts-ignore: Suppress type error for dispatching thunk
            dispatch(fetchUserPosts(Number(id)));
            
            // Load following data to check follow status
            if (currentUser) {
                // @ts-ignore: Suppress type error for dispatching thunk
                reduxDispatch(fetchFollowing(currentUser.id));
            }
        }
    }, [dispatch, id, currentUser, reduxDispatch]);

    // Check if current user is following the selected user
    useEffect(() => {
        if (selectedUser && currentUser) {
            // Use is_following field from API first, fallback to following array
            const followingStatus = selectedUser.is_following || following.some((follow: any) => follow.following === selectedUser.id);
            setIsFollowing(followingStatus);
        }
    }, [selectedUser, currentUser, following]);

    const handleFollowToggle = async () => {
        if (!currentUser || !selectedUser || isLoading) return;
        
        setIsLoading(true);
        try {
            if (isFollowing) {
                // @ts-ignore: Suppress type error for dispatching thunk
                await reduxDispatch(unfollowUser(selectedUser.id));
                setIsFollowing(false);
            } else {
                // @ts-ignore: Suppress type error for dispatching thunk
                await reduxDispatch(followUser(selectedUser.id));
                setIsFollowing(true);
            }
        } catch (error) {
            console.error('Error following/unfollowing user:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        // if (!currentUser || !selectedUser || currentUser.id !== selectedUser.id) return;
        if (currentUser?.role !== 'admin') return;
        
        const confirmMessage = `Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your posts, comments, and data.`;
        
        if (window.confirm(confirmMessage)) {
            const doubleConfirm = window.confirm('This is your final warning. Type "DELETE" to confirm account deletion.');
            
            if (doubleConfirm) {
                try {
                    await userAPI.deleteUser(selectedUser.id);
                    toast.success('Account deleted successfully');
                    // Redirect to home page after account deletion
                    router.push('/');
                } catch (error: any) {
                    const message = error.response?.data?.error || 'Failed to delete account';
                    toast.error(message);
                }
            }
        }
    };

    const handlePostUpdate = async (post: any) => {
        try {
            // @ts-ignore: Suppress type error for dispatching thunk
            await reduxDispatch(updatePost({ id: post.id, data: post }));
            // Refresh user posts
            // @ts-ignore: Suppress type error for dispatching thunk
            dispatch(fetchUserPosts(Number(id)));
        } catch (error) {
            console.error('Error updating post:', error);
        }
    };

    const handlePostDelete = async (postId: number) => {
        try {
            // @ts-ignore: Suppress type error for dispatching thunk
            await reduxDispatch(deletePost(postId));
            // Refresh user posts
            // @ts-ignore: Suppress type error for dispatching thunk
            dispatch(fetchUserPosts(Number(id)));
        } catch (error) {
            console.error('Error deleting post:', error);
        }
    };

    console.log(selectedUser);

    return (
        <div className="max-w-4xl mx-auto py-10 px-4 space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-6">
                        {selectedUser?.avatar_url ? (
                            <img
                                src={selectedUser?.avatar_url}
                                alt={selectedUser?.username}
                                className="w-24 h-24 rounded-full object-cover"
                            />
                        ) : (
                            <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold">
                                {selectedUser?.first_name?.[0] || selectedUser?.username?.[0]}
                            </div>
                        )}
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">
                                {selectedUser?.first_name} {selectedUser?.last_name}
                            </h2>
                            <p className="text-sm text-gray-500">@{selectedUser?.username}</p>
                            <p className="text-sm text-gray-500">{selectedUser?.email}</p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                        {/* Follow/Unfollow Button */}
                        {currentUser && selectedUser && currentUser.id !== selectedUser.id && (
                            <button
                                onClick={handleFollowToggle}
                                disabled={isLoading}
                                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                                    isFollowing
                                        ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                        : 'bg-blue-600 text-white hover:bg-blue-700'
                                } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                            >
                                {isLoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                                        <span>{isFollowing ? 'Unfollowing...' : 'Following...'}</span>
                                    </>
                                ) : isFollowing ? (
                                    <>
                                        <UserMinus className="h-4 w-4" />
                                        <span>Unfollow</span>
                                    </>
                                ) : (
                                    <>
                                        <UserPlus className="h-4 w-4" />
                                        <span>Follow</span>
                                    </>
                                )}
                            </button>
                        )}

                        {/* Edit Button - Admin can edit any profile, users can edit own profile */}
                        {((currentUser?.role === 'admin') || (currentUser && selectedUser && currentUser.id === selectedUser.id)) && (
                            <button
                                onClick={() => router.push(`/users/${selectedUser?.id}/edit`)}
                                className="flex items-center space-x-2 px-2 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                            >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                <span>Edit</span>
                            </button>
                        )}

                        {/* Delete Account Button - Only admin can delete profiles */}
                        {currentUser?.role === 'admin' && (
                            <button
                                onClick={handleDeleteAccount}
                                className="flex items-center space-x-2 px-2 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
                            >
                                <AlertTriangle className="h-4 w-4" />
                                <span>Delete</span>
                            </button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-700">
                    <div>
                        <p className="font-medium text-gray-500">Role</p>
                        <p className="text-gray-900">{selectedUser?.role}</p>
                    </div>
                    <div>
                        <p className="font-medium text-gray-500">Status</p>
                        <p className={`text-sm font-semibold ${selectedUser?.is_active ? 'text-green-600' : 'text-red-600'}`}>
                            {selectedUser?.is_active ? 'Active' : 'Inactive'}
                        </p>
                    </div>
                    <div>
                        <p className="font-medium text-gray-500">Joined</p>
                        <p className="text-gray-900">{new Date(selectedUser?.date_joined).toLocaleDateString()}</p>
                    </div>
                    <div>
                        <p className="font-medium text-gray-500">Last Login</p>
                        <p className="text-gray-900">
                            {selectedUser?.last_login ? new Date(selectedUser?.last_login).toLocaleString() : 'Never'}
                        </p>
                    </div>
                    <div>
                        <p className="font-medium text-gray-500">Website</p>
                        <a
                            href={selectedUser?.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                        >
                            {selectedUser?.website || '—'}
                        </a>
                    </div>
                    <div>
                        <p className="font-medium text-gray-500">Location</p>
                        <p className="text-gray-900">{selectedUser?.location || '—'}</p>
                    </div>
                </div>

                {selectedUser?.bio && (
                    <div className="mt-6">
                        <p className="font-medium text-gray-500 mb-1">Bio</p>
                        <p className="text-gray-800 whitespace-pre-line">{selectedUser?.bio}</p>
                    </div>
                )}

                <div className="mt-6 grid grid-cols-3 gap-4 text-center">
                    <div className="cursor-pointer">
                        <p className="text-lg font-semibold text-gray-900">{selectedUser?.posts_count}</p>
                        <p className="text-sm text-gray-500">Posts</p>
                    </div>
                    <div className="cursor-pointer" onClick={() => { router.push(`/users/${selectedUser?.id}/followers`) }}>
                        <p className="text-lg font-semibold text-gray-900">{selectedUser?.followers_count}</p>
                        <p className="text-sm text-gray-500">Followers</p>
                    </div>
                    <div className="cursor-pointer" onClick={() => { router.push(`/users/${selectedUser?.id}/following`) }}>
                        <p className="text-lg font-semibold text-gray-900">{selectedUser?.following_count}</p>
                        <p className="text-sm text-gray-500">Following</p>
                    </div>
                </div>
            </div>

            {/* Posts */}
            {selectedPosts.map((post: any) => (
                <PostCard
                    key={post.id}
                    post={post}
                    onPostUpdated={handlePostUpdate}
                    onPostDeleted={handlePostDelete}
                />
            ))}
        </div>
    )
}