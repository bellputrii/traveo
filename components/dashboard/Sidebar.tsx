/* eslint-disable @typescript-eslint/no-explicit-any */
// components/dashboard/Sidebar.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  FileText, 
  FolderTree, 
  MessageSquare, 
  UserCircle,
  Settings,
  LogOut, 
  LogIn, 
  X, 
  Menu,
  Home,
  Bell,
  Search,
  HelpCircle,
  Info,
  Shield,
  BookOpen,
  Users
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

  // Menu items utama
  const mainMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { id: 'articles', label: 'Articles', icon: FileText, path: '/articles' },
    { id: 'categories', label: 'Categories', icon: FolderTree, path: '/categories' },
    { id: 'comments', label: 'Comments', icon: MessageSquare, path: '/comments' },
  ];

  // Menu items secondary (settings & profile)
  const secondaryMenuItems = [
    { id: 'profile', label: 'Profile', icon: UserCircle, path: '/profile' },
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
    router.push('/');
  }, [router]);

  const handleLogin = useCallback(() => {
    router.push('/auth');
    if (isMobile) setIsOpen(false);
  }, [isMobile, router]);

  const toggleSidebar = useCallback(() => {
    setIsOpen(!isOpen);
  }, [isOpen]);

  const handleHomeClick = useCallback(() => {
    router.push('/');
    if (isMobile) setIsOpen(false);
  }, [isMobile, router]);

  const handleHelpClick = useCallback(() => {
    router.push('/help');
    if (isMobile) setIsOpen(false);
  }, [isMobile, router]);

  if (!mounted) {
    return (
      <aside className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col fixed left-0 top-0 z-40">
        <div className="p-5 border-b border-gray-200 bg-gradient-to-r from-[#213448] to-[#1a2a3a]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-lg animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 w-20 bg-white/50 rounded animate-pulse" />
              <div className="h-3 w-16 bg-white/50 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <>
      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-screen bg-white  
        flex flex-col z-40 transition-transform duration-300 ease-out w-64
        ${isMobile 
          ? `${isOpen ? 'translate-x-0' : '-translate-x-full'}`
          : 'translate-x-0'
        }
      `}>
        {/* Header dengan Logo */}
        <div className="p-5 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 cursor-pointer group" onClick={handleHomeClick}>
              <div className="relative w-16 h-16">
                  <Image
                    src="/logo.png" // atau "/logo.png"
                    alt="Traveo Logo"
                    width={50}
                    height={50}
                    className="rounded-xl"
                  />
              </div>
            <div>
                <h1 className="text-lg font-bold text-[#213448]">Traveo</h1>
                <p className="text-xs text-gray-600">Explore • Write • Share</p>
            </div>
            </div>
            {isMobile && (
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Close sidebar"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            )}
          </div>
        </div>
        

        {/* Main Navigation */}
        <div className="flex-1 overflow-y-auto py-4">
          <div className="px-4 mb-6">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">
              Navigation
            </h3>
            <div className="space-y-1">
              {mainMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeMenu === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => handleMenuClick(item.id, item.path)}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
                      ${isActive 
                        ? 'bg-gradient-to-r from-[#213448]/10 to-[#1a2a3a]/10 text-[#213448] border border-[#213448]/20 shadow-sm' 
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 border border-transparent'
                      }
                    `}
                  >
                    <div className={`
                      w-8 h-8 rounded-lg flex items-center justify-center
                      ${isActive 
                        ? 'bg-[#213448] text-white' 
                        : 'bg-gray-100 text-gray-600'
                      }
                    `}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium">{item.label}</span>
                    {isActive && (
                      <div className="ml-auto w-1.5 h-1.5 bg-[#213448] rounded-full animate-pulse" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Secondary Navigation */}
          <div className="px-4 mb-6">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">
              Account
            </h3>
            <div className="space-y-1">
              {secondaryMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeMenu === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => handleMenuClick(item.id, item.path)}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
                      ${isActive 
                        ? 'bg-gradient-to-r from-[#213448]/10 to-[#1a2a3a]/10 text-[#213448] border border-[#213448]/20 shadow-sm' 
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 border border-transparent'
                      }
                    `}
                  >
                    <div className={`
                      w-8 h-8 rounded-lg flex items-center justify-center
                      ${isActive 
                        ? 'bg-[#213448] text-white' 
                        : 'bg-gray-100 text-gray-600'
                      }
                    `}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Auth Button */}
        <div className="p-4 border-t border-gray-200">
          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 
                bg-gradient-to-r from-red-50 to-red-100 text-red-600 rounded-lg 
                border border-red-200 hover:from-red-100 hover:to-red-200 
                hover:border-red-300 font-medium transition-all duration-200"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm">Logout</span>
            </button>
          ) : (
            <button
              onClick={handleLogin}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 
                bg-gradient-to-r from-[#213448] to-[#1a2a3a] text-white rounded-lg
                border border-[#213448] hover:from-[#1a2a3a] hover:to-[#213448]
                hover:shadow-md font-medium transition-all duration-200"
            >
              <LogIn className="w-4 h-4" />
              <span className="text-sm">Sign In / Sign Up</span>
            </button>
          )}
        </div>

        {/* Footer dengan App Version */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="space-y-3">
            {/* App Version */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gradient-to-br from-[#213448] to-[#1a2a3a] rounded flex items-center justify-center">
                  <Shield className="w-3 h-3 text-white" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-900">Traveo v1.2.0</p>
                  <p className="text-xs text-gray-500">Stable Release</p>
                </div>
              </div>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>

            {/* Copyright & Links */}
            <div className="pt-2 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center mb-2">
                © 2024 Traveo. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Toggle Button */}
      {isMobile && !isOpen && (
        <button
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-50 p-2.5 bg-white rounded-xl shadow-lg border border-gray-200 
            hover:bg-gray-50 transition-all duration-200 group"
        >
          <Menu className="w-5 h-5 text-gray-700 group-hover:text-[#213448] transition-colors" />
        </button>
      )}

      {/* Backdrop Overlay */}
      {isMobile && isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 transition-opacity duration-300"
        />
      )}
    </>
  );
}