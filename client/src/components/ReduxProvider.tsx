'use client';

import { Provider, useDispatch } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '@/store';
import { useEffect } from 'react';
import { rehydrateUser } from '@/store/slices/authSlice';

interface ReduxProviderProps {
  children: React.ReactNode;
}

export default function ReduxProvider({ children }: ReduxProviderProps) {
  return (
    <Provider store={store}>
      <PersistGate loading={<div>Loading...</div>} persistor={persistor}>
        <AuthRehydrator />
        {children}
      </PersistGate>
    </Provider>
  );
}


function AuthRehydrator() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Only rehydrate if we're in the browser and have tokens
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token) {
        dispatch(rehydrateUser() as any);
      }
    }
  }, [dispatch]);

  return null;
}