// components/dashboard/Sidebar.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Home, Camera, BookOpen, History, Settings, Leaf, LogOut, LogIn, User } from 'lucide-react';

interface SidebarProps {
  activeMenu: string;
  setActiveMenu: (menu: string) => void;
}

export default function Sidebar({ activeMenu, setActiveMenu }: SidebarProps) {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  // Cek status login saat komponen mount
  useEffect(() => {
    setMounted(true);
    checkLoginStatus();
    
    // Tambahkan event listener untuk mendeteksi perubahan storage
    const handleStorageChange = () => {
      checkLoginStatus();
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Fungsi untuk mengecek status login
  const checkLoginStatus = () => {
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
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/home' },
    { id: 'deteksi', label: 'Deteksi Penyakit', icon: Camera, path: '/deteksi' },
    { id: 'artikel', label: 'Daftar Artikel', icon: BookOpen, path: '/artikel' },
    { id: 'riwayat', label: 'Riwayat Deteksi', icon: History, path: '/riwayat' },
    { id: 'pengaturan', label: 'Pengaturan', icon: Settings, path: '/profile' },
  ];

  const handleMenuClick = (id: string, path: string) => {
    setActiveMenu(id);
    router.push(path);
  };

  const handleLogout = () => {
    // Hapus semua data auth dari storage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    localStorage.removeItem('auth_timestamp');
    localStorage.removeItem('rememberMe');
    
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('userRole');
    
    // Update state
    setIsLoggedIn(false);
    setUser(null);
    
    // Redirect ke halaman login
    router.push('/auth/login');
  };

  const handleLogin = () => {
    router.push('/auth/login');
  };

  // Tampilkan skeleton loading saat belum mounted
  if (!mounted) {
    return (
      <aside className="w-64 h-screen bg-white shadow-sm flex flex-col fixed left-0 top-0">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-200 rounded-2xl animate-pulse"></div>
            <div className="space-y-2">
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-3 w-20 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
        <div className="flex-1 p-4 space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-10 bg-gray-100 rounded-xl animate-pulse"></div>
          ))}
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-64 h-screen bg-white shadow-sm flex flex-col fixed left-0 top-0">
      {/* Logo */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center">
            <Leaf className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900 leading-tight">PadiCheck AI</h1>
            <p className="text-xs text-gray-500 -mt-0.5">Disease Detection</p>
          </div>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-4">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeMenu === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleMenuClick(item.id, item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left
                  ${isActive ? 'bg-emerald-50 text-emerald-600' : 'text-gray-600 hover:bg-gray-50'}
                `}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-600' : 'text-gray-400'}`} />
                <span className="text-sm">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* User Info Section */}
      {isLoggedIn && user && (
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user.fullName || user.email}</p>
              <p className="text-xs text-gray-500 truncate">{user.role || 'User'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Auth Button Section */}
      <div className="p-4 border-t border-gray-100">
        {isLoggedIn ? (
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors group"
          >
            <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        ) : (
          <button
            onClick={handleLogin}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-colors group"
          >
            <LogIn className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium">Sign In / Sign Up</span>
          </button>
        )}
      </div>

      {/* Need Help Section */}
      <div className="p-4 border-t border-gray-100">
        <div className="bg-emerald-50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <Leaf className="w-4 h-4 text-white" />
            </div>
            <p className="text-xs text-gray-900 font-medium">Need Help?</p>
          </div>
          <p className="text-xs text-gray-600 mb-3">Check our documentation</p>
          <button 
            onClick={() => router.push('/help')}
            className="w-full bg-white text-emerald-600 text-xs py-2 rounded-lg border border-emerald-100 hover:bg-emerald-500 hover:text-white transition-colors"
          >
            Documentation
          </button>
        </div>
      </div>
    </aside>
  );
}