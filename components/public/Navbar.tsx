// components/public/Navbar.tsx
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Bell, ChevronDown, User, LogOut, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface NavbarProps {
  activeMenu?: string;
  onMenuToggle?: () => void;
  sidebarOpen?: boolean;
}

interface UserData {
  id: string;
  fullName: string;
  email: string;
  role: string;
}

const menuMapping: Record<string, { title: string; description?: string }> = {
  dashboard: { title: 'Dashboard', description: 'Ringkasan analisis dan statistik' },
  home: { title: 'Dashboard', description: 'Ringkasan analisis dan statistik' },
  deteksi: { title: 'Deteksi Penyakit', description: 'Upload foto daun padi untuk deteksi penyakit' },
  artikel: { title: 'Daftar Artikel', description: 'Kumpulan artikel tentang penyakit padi' },
  riwayat: { title: 'Riwayat Deteksi', description: 'Lihat semua hasil deteksi sebelumnya' },
  profile: { title: 'Pengaturan Profil', description: 'Kelola akun dan preferensi Anda' },
};

export function Navbar({ activeMenu = 'dashboard', onMenuToggle, sidebarOpen }: NavbarProps) {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const currentMenu = menuMapping[activeMenu] || menuMapping.dashboard;

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const loadUserData = () => {
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!token) {
          setUserData(null);
          return;
        }

        const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          setUserData(user);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        setUserData(null);
      }
    };

    loadUserData();
    window.addEventListener('storage', loadUserData);
    return () => window.removeEventListener('storage', loadUserData);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearch(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = useCallback(() => {
    setIsLoggingOut(true);
    setTimeout(() => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      router.push('/auth/login');
    }, 500);
  }, [router]);

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setShowSearch(false);
    }
  }, [searchQuery, router]);

  const getUserInitials = useCallback((name: string): string => {
    return name.split(' ').map(part => part[0]).join('').toUpperCase().slice(0, 2);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-30 bg-white border-b border-gray-100 shadow-sm">
        <div className="px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Left Section */}
            <div className="flex items-center gap-3">
              {isMobile && onMenuToggle && (
                <button
                  onClick={onMenuToggle}
                  className="p-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors
                    focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-1"
                  aria-label="Toggle menu"
                  // Menghapus highlight warna hitam saat diklik
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  {sidebarOpen ? (
                    <X className="w-5 h-5 text-gray-700" />
                  ) : (
                    <div className="w-5 h-5 flex flex-col justify-center gap-1.5">
                      <div className="w-5 h-0.5 bg-gray-700 rounded transition-all" />
                      <div className="w-5 h-0.5 bg-gray-700 rounded transition-all" />
                      <div className="w-5 h-0.5 bg-gray-700 rounded transition-all" />
                    </div>
                  )}
                </button>
              )}
              
              <div className="ml-2">
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">
                  {currentMenu.title}
                </h1>
                {currentMenu.description && (
                  <p className="text-xs text-gray-500 hidden sm:block">
                    {currentMenu.description}
                  </p>
                )}
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Search - Desktop */}
              <div className="hidden sm:block relative" ref={searchRef}>
                <form onSubmit={handleSearch}>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Cari sesuatu..."
                      className="pl-10 pr-4 py-2 w-48 lg:w-64 border border-gray-200 rounded-xl 
                        focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent
                        transition-all duration-200"
                    />
                  </div>
                </form>
              </div>

              {/* Search - Mobile */}
              <button
                onClick={() => setShowSearch(true)}
                className="sm:hidden p-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors
                  focus:outline-none focus:ring-2 focus:ring-emerald-300"
                aria-label="Search"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                <Search className="w-5 h-5 text-gray-600" />
              </button>

              {/* Notifications */}
              <button 
                className="relative p-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors group
                  focus:outline-none focus:ring-2 focus:ring-emerald-300"
                aria-label="Notifications"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                <Bell className="w-5 h-5 text-gray-600 group-hover:text-emerald-600" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
              </button>

              {/* User Profile */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-100 active:bg-gray-200 
                    transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-300"
                  aria-label="User menu"
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 
                    rounded-full flex items-center justify-center shadow-sm">
                    {userData ? (
                      <span className="text-white text-sm font-semibold">
                        {getUserInitials(userData.fullName)}
                      </span>
                    ) : (
                      <User className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div className="hidden lg:block text-left">
                    <p className="text-sm font-medium text-gray-900">
                      {userData?.fullName || 'Guest'}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {userData?.role?.toLowerCase() || 'visitor'}
                    </p>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 
                    ${showDropdown ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 
                    overflow-hidden z-40">
                    <div className="p-4 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {userData?.fullName || 'Guest User'}
                      </p>
                      <p className="text-xs text-gray-500 truncate mt-1">
                        {userData?.email || 'guest@example.com'}
                      </p>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setShowDropdown(false);
                          router.push('/profile');
                        }}
                        className="w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 
                          active:bg-gray-100 flex items-center gap-3 transition-colors
                          focus:outline-none focus:bg-gray-50"
                        style={{ WebkitTapHighlightColor: 'transparent' }}
                      >
                        <User className="w-4 h-4" />
                        Profil Saya
                      </button>
                      <button
                        onClick={() => {
                          setShowDropdown(false);
                          setShowLogoutConfirm(true);
                        }}
                        className="w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 
                          active:bg-red-100 flex items-center gap-3 transition-colors
                          focus:outline-none focus:bg-red-50"
                        style={{ WebkitTapHighlightColor: 'transparent' }}
                      >
                        <LogOut className="w-4 h-4" />
                        Keluar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Search Bar */}
          {showSearch && isMobile && (
            <div className="mt-3" ref={searchRef}>
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari artikel, penyakit, dll..."
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl 
                    focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowSearch(false)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1
                    hover:bg-gray-100 active:bg-gray-200 rounded"
                  aria-label="Close search"
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </form>
            </div>
          )}
        </div>
      </header>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-gray-900/20 backdrop-blur-[1px]" 
            onClick={() => setShowLogoutConfirm(false)}
            aria-hidden="true"
          />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogOut className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Konfirmasi Logout
              </h3>
              <p className="text-gray-600 text-sm mb-6">
                Apakah Anda yakin ingin keluar dari akun Anda?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 py-2.5 px-4 border border-gray-300 text-gray-700 rounded-lg 
                    hover:bg-gray-50 active:bg-gray-100 transition-colors font-medium text-sm
                    focus:outline-none focus:ring-2 focus:ring-gray-300"
                  disabled={isLoggingOut}
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  Batal
                </button>
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="flex-1 py-2.5 px-4 bg-red-600 text-white rounded-lg 
                    hover:bg-red-700 active:bg-red-800 transition-colors disabled:opacity-50 
                    font-medium text-sm flex items-center justify-center gap-2
                    focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  {isLoggingOut ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      <span>Loading...</span>
                    </>
                  ) : (
                    'Logout'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}