import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { fetchFollowers, fetchFollowing } from "@/store/slices/usersSlice";

export default function FollowList({ id, slug, dispatch }: { id: any, slug: any, dispatch: any }) {
    const { followers, following, isLoading } = useSelector((state: any) => state.users);
    const router = useRouter();

    useEffect(() => {
        if (id && !isNaN(Number(id))) {
            if (slug === 'followers') {
                dispatch(fetchFollowers(Number(id)));
            } else if (slug === 'following') {
                dispatch(fetchFollowing(Number(id)));
            }
        }
    }, [dispatch, id, slug]);

    const users = slug === 'followers' ? followers : following;

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto py-8 px-4">
                <div className="mb-8">
                    <button
                        onClick={() => router.back()}
                        className="mb-4 px-4 py-2 text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                    >
                        ← Back
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        {slug === 'followers' ? 'Followers' : 'Following'}
                    </h1>
                    <p className="text-gray-600">
                        {users.length} {slug === 'followers' ? 'followers' : 'following'}
                    </p>
                </div>

                {users.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500 text-lg">
                            {slug === 'followers' ? 'No followers yet' : 'Not following anyone yet'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {users.map((user: any) => (
                            <div key={user.id} className="bg-white rounded-lg shadow-sm border p-6">
                                <div className="flex items-center space-x-4 mb-4 cursor-pointer"
                                onClick={() => router.push(`/users/${user.id}`)}
                                >
                                    {user.avatar_url ? (
                                        <img
                                            src={user.avatar_url}
                                            alt={user.username}
                                            className="h-12 w-12 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                                            {user.first_name?.[0] || user.username[0]}
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900">
                                            {user.first_name} {user.last_name}
                                        </h3>
                                        <p className="text-sm text-gray-500">@{user.username}</p>
                                    </div>
                                </div>

                                {user.bio && (
                                    <p className="text-sm text-gray-600 mb-4">{user.bio}</p>
                                )}

                                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                                    <div className="flex space-x-4">
                                        <span>{user.posts_count} posts</span>
                                        <span>{user.followers_count} followers</span>
                                        <span>{user.following_count} following</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => router.push(`/users/${user.id}`)}
                                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    View Profile
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}