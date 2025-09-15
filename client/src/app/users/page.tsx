'use client';
import Navigation from '@/components/Navigation';
import UserSearch from '@/components/UserSearch';

export default function UsersPage() {
  // const { user, isLoading, isAuthenticated } = useAppSelector((state) => state.auth);
  // const router = useRouter();

  // useEffect(() => {
  //   if (!isLoading && !isAuthenticated) {
  //     router.push('/');
  //   }
  // }, [user, isLoading, isAuthenticated, router]);

  // if (isLoading) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center">
  //       <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
  //     </div>
  //   );
  // }

  // if (!isAuthenticated || !user) {
  //   return null;
  // }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <UserSearch />
    </div>
  );
}