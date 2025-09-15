'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { loginUser, registerUser } from '@/store/slices/authSlice';
import LoginForm from '@/components/LoginForm';
import RegisterForm from '@/components/RegisterForm';

export default function Home() {
  const { user, isLoading, isAuthenticated } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      router.push('/feed');
    }
  }, [user, isLoading, isAuthenticated, router]);

  const handleLogin = async (username_or_email: string, password: string) => {
    await dispatch(loginUser({ username_or_email, password }));
  };

  const handleRegister = async (data: {
    email: string;
    username: string;
    password: string;
    first_name: string;
    last_name: string;
    role: string;
  }) => {
    await dispatch(registerUser(data));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    return null; // Will redirect to feed
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">SocialConnect</h1>
          <p className="text-gray-600">Connect, Share, and Discover</p>
        </div>

        {showRegister ? (
          <RegisterForm 
            onSwitchToLogin={() => setShowRegister(false)}
            onRegister={handleRegister}
            isLoading={isLoading}
          />
        ) : (
          <LoginForm 
            onSwitchToRegister={() => setShowRegister(true)}
            onLogin={handleLogin}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
}