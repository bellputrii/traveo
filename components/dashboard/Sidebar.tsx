/* eslint-disable @typescript-eslint/no-explicit-any */
// components/dashboard/Sidebar.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { 
  Home, Camera, BookOpen, History, Settings, 
  Leaf, LogOut, LogIn, User, X, Menu, HelpCircle 
} from 'lucide-react';

interface SidebarProps {
  activeMenu: string;
  setActiveMenu: (menu: string) => void;
}

export default function Sidebar({ activeMenu, setActiveMenu }: SidebarProps) {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    checkLoginStatus();
    handleResize();
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleResize = useCallback(() => {
    const mobile = window.innerWidth < 768;
    setIsMobile(mobile);
    if (!mobile) setIsOpen(false);
  }, []);

  const checkLoginStatus = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const userData = localStorage.getItem('user') || sessionStorage.getItem('user');
    
    if (token && userData) {
      setIsLoggedIn(true);
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error('Error parsing user data:', e);
        setUser(null);
      }
    } else {
      setIsLoggedIn(false);
      setUser(null);
    }
  }, []);

  const handleStorageChange = useCallback(() => {
    checkLoginStatus();
  }, [checkLoginStatus]);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/home' },
    { id: 'deteksi', label: 'Deteksi Penyakit', icon: Camera, path: '/deteksi' },
    { id: 'artikel', label: 'Daftar Artikel', icon: BookOpen, path: '/artikel' },
    { id: 'riwayat', label: 'Riwayat Deteksi', icon: History, path: '/riwayat' },
    { id: 'pengaturan', label: 'Pengaturan', icon: Settings, path: '/profile' },
  ];

  const handleMenuClick = useCallback((id: string, path: string) => {
    setActiveMenu(id);
    router.push(path);
    if (isMobile) setIsOpen(false);
  }, [isMobile, router, setActiveMenu]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('userRole');
    
    setIsLoggedIn(false);
    setUser(null);
    router.push('/auth/login');
  }, [router]);

  const handleLogin = useCallback(() => {
    router.push('/auth/login');
    if (isMobile) setIsOpen(false);
  }, [isMobile, router]);

  const toggleSidebar = useCallback(() => {
    setIsOpen(!isOpen);
  }, [isOpen]);

  if (!mounted) {
    return (
      <aside className="w-64 h-screen bg-white shadow-sm border-r border-gray-100 flex flex-col fixed left-0 top-0 z-40">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-200 rounded-2xl animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <>
      {/* Mobile Toggle Button */}
      {isMobile && (
        <button
          onClick={toggleSidebar}
          className={`fixed top-4 left-4 z-50 p-2.5 bg-white rounded-xl shadow-lg border border-gray-200 
            hover:bg-gray-50 active:bg-gray-100 transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2
            ${isOpen ? 'opacity-0 scale-0 pointer-events-none' : 'opacity-100 scale-100'}`}
          aria-label="Toggle sidebar"
          // Menghapus style default browser
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          <Menu className="w-5 h-5 text-gray-700" />
        </button>
      )}

      {/* Backdrop Overlay */}
      {isMobile && isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-gray-900/20 backdrop-blur-[1px] z-30 transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-screen bg-white shadow-xl border-r border-gray-100 
        flex flex-col z-40 transition-transform duration-300 ease-out
        ${isMobile 
          ? `w-72 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`
          : 'w-64 translate-x-0'
        }
      `}>
        {/* Header */}
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">PadiCheck AI</h1>
                <p className="text-xs text-gray-500">Disease Detection</p>
              </div>
            </div>
            {isMobile && (
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors
                  focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-1"
                aria-label="Close sidebar"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            )}
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeMenu === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleMenuClick(item.id, item.path)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                    focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-1
                    ${isActive 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 border border-transparent'
                    }
                  `}
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-600' : 'text-gray-500'}`} />
                  <span className="text-sm font-medium">{item.label}</span>
                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* User Info Section */}
        {isLoggedIn && user && (
          <div className="p-4 border-t border-gray-100">
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-emerald-50 rounded-xl">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">
                  {user.fullName?.split(' ').map((n: any[]) => n[0]).join('').toUpperCase().slice(0, 2)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user.fullName}</p>
                <p className="text-xs text-gray-600 capitalize truncate">{user.role?.toLowerCase()}</p>
              </div>
            </div>
          </div>
        )}

        {/* Auth Button */}
        <div className="p-4 border-t border-gray-100">
          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 
                bg-gradient-to-r from-red-50 to-red-100 text-red-600 rounded-xl 
                border border-red-200 hover:from-red-100 hover:to-red-200 
                active:from-red-200 active:to-red-300 transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-offset-1"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <LogOut className="w-5 h-5" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          ) : (
            <button
              onClick={handleLogin}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 
                bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-600 rounded-xl
                border border-emerald-200 hover:from-emerald-100 hover:to-emerald-200
                active:from-emerald-200 active:to-emerald-300 transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-1"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <LogIn className="w-5 h-5" />
              <span className="text-sm font-medium">Sign In / Sign Up</span>
            </button>
          )}
        </div>

        {/* Help Section */}
        <div className="p-4 border-t border-gray-100">
          <div className="bg-gradient-to-br from-emerald-50 to-cyan-50 rounded-xl p-4 border border-emerald-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <HelpCircle className="w-4 h-4 text-white" />
              </div>
              <p className="text-sm font-medium text-gray-900">Butuh Bantuan?</p>
            </div>
            <p className="text-xs text-gray-600 mb-3">Lihat dokumentasi kami untuk panduan lengkap</p>
            <button 
              onClick={() => {
                router.push('/help');
                if (isMobile) setIsOpen(false);
              }}
              className="w-full bg-white text-emerald-600 text-xs py-2 rounded-lg border border-emerald-200 
                hover:bg-emerald-50 active:bg-emerald-100 transition-colors
                focus:outline-none focus:ring-2 focus:ring-emerald-300"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              Buka Dokumentasi
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}