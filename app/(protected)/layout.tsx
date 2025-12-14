'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { getMe } from '../../store/auth/authThunk';
import Loading from '../../components/common/Loading';
import Sidebar from '../../components/dashboard/Sidebar';

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

export default function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { isAuthenticated, loading } = useAppSelector((state) => state.auth);
  const [activeMenu, setActiveMenu] = useState('dashboard');

  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    
    if (!token) {
      router.push('/auth');
      return;
    }

    // Check if user is not authenticated and not loading
    if (!isAuthenticated && !loading) {
      dispatch(getMe());
    }
  }, [dispatch, router, isAuthenticated, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Router akan redirect di useEffect
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
      
      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}