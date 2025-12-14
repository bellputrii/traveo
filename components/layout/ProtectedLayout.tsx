'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { getMe } from '../../store/auth/authThunk';
import Loading from '../../components/common/Loading';
import Sidebar from '../../components/dashboard/Sidebar';
import { Header } from '../../components/dashboard/Header';

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

export default function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { isAuthenticated, loading, user } = useAppSelector((state) => state.auth);
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
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

  const handleSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleMenuClick = (menu: string) => {
    setActiveMenu(menu);
    setIsSidebarOpen(false);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#213448] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#213448] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading application...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Router akan redirect di useEffect
  }

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <div className={`
        fixed md:relative z-40 h-full transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <Sidebar 
          activeMenu={activeMenu} 
          setActiveMenu={handleMenuClick} 
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Header */}
        <Header
          activeMenu={activeMenu}
          userName={user?.username || 'User'}
          userEmail={user?.email || 'user@example.com'}
          onSidebarToggle={handleSidebarToggle}
          isSidebarOpen={isSidebarOpen}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 md:py-6">
            {children}
          </div>
        </main>
      </div>

      {/* Backdrop Overlay for Mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}