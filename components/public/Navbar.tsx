// components/public/Navbar.tsx
'use client';

import { useState, useEffect } from 'react';
import { Search, Bell, ChevronDown, User, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface NavbarProps {
  activeMenu?: string;
  onLogout?: () => void;
}

interface UserData {
  id: string;
  fullName: string;
  email: string;
  role: string;
}

// Mapping untuk breadcrumb dan title berdasarkan activeMenu
const menuMapping: Record<string, { breadcrumb: string; title: string }> = {
  dashboard: { breadcrumb: 'Pages / Dashboard', title: 'Dashboard' },
  deteksi: { breadcrumb: 'Pages / Deteksi Penyakit', title: 'Deteksi Penyakit' },
  artikel: { breadcrumb: 'Pages / Daftar Artikel', title: 'Daftar Artikel' },
  riwayat: { breadcrumb: 'Pages / Riwayat Deteksi', title: 'Riwayat Deteksi' },
  pengaturan: { breadcrumb: 'Pages / Pengaturan', title: 'Pengaturan' },
};

export function Navbar({ activeMenu = 'dashboard', onLogout }: NavbarProps) {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Get current menu info based on activeMenu
  const currentMenu = menuMapping[activeMenu] || menuMapping.dashboard;

  // Load user data from localStorage on component mount
  useEffect(() => {
    const loadUserData = () => {
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!token) {
          // If no token, user is not logged in
          setUserData(null);
          return;
        }

        const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          setUserData(user);
        } else {
          // If token exists but no user data, try to get from API
          fetchUserData(token);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        setUserData(null);
      }
    };

    loadUserData();

    // Listen for storage changes (login/logout from other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user' || e.key === 'token') {
        loadUserData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Fetch user data from API
  const fetchUserData = async (token: string) => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://padicheckai-backend-production.up.railway.app';
      
      const response = await fetch(`${API_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          setUserData(data.user);
          localStorage.setItem('user', JSON.stringify(data.user));
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  // Handle logout
  const handleLogout = () => {
    setIsLoggingOut(true);
    try {
      // Clear auth data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      
      // Call onLogout callback if provided
      if (onLogout) {
        onLogout();
      }
      
      // Redirect to login page
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
      setShowLogoutConfirm(false);
      setShowDropdown(false);
    }
  };

  // Get user initials
  const getUserInitials = (name: string): string => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Format role display
  const formatRole = (role: string): string => {
    const roleMap: Record<string, string> = {
      'ADMIN': 'Administrator',
      'admin': 'Administrator',
      'USER': 'User',
      'user': 'User',
    };
    return roleMap[role] || role;
  };

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-10">
        <div className="flex justify-between items-center px-6 py-4">
          {/* Breadcrumb and Title */}
          <div>
            <div className="text-sm text-gray-500 mb-1">{currentMenu.breadcrumb}</div>
            <h1 className="text-2xl font-bold text-gray-900">{currentMenu.title}</h1>
          </div>

          {/* Right Side: Search, Notifications, Profile */}
          <div className="flex items-center space-x-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Type here..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent w-64"
              />
            </div>

            {/* Notifications */}
            <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <Bell className="h-5 w-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center space-x-2 p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="h-8 w-8 bg-emerald-100 rounded-full flex items-center justify-center">
                  {userData ? (
                    <span className="text-emerald-600 font-medium text-sm">
                      {getUserInitials(userData.fullName)}
                    </span>
                  ) : (
                    <User className="h-4 w-4 text-emerald-600" />
                  )}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-900">
                    {userData?.fullName || 'Guest'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {userData ? formatRole(userData.role) : 'Not logged in'}
                  </p>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </button>

              {/* Dropdown Menu */}
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {userData?.fullName || 'Guest User'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1 truncate">
                      {userData?.email || 'guest@example.com'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1 capitalize">
                      {userData ? formatRole(userData.role) : 'Guest'}
                    </p>
                  </div>

                  {/* Dropdown Items */}
                  <div className="border-t border-gray-100 mt-1 pt-1">
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        router.push('/profile');
                      }}
                      className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors w-full text-left"
                    >
                      <User className="h-4 w-4" />
                      <span>Profile Saya</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        setShowLogoutConfirm(true);
                      }}
                      className="flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors w-full text-left"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogOut className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Konfirmasi Logout
              </h3>
              <p className="text-gray-600 text-sm mb-6">
                Apakah Anda yakin ingin logout dari akun Anda?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 py-2.5 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
                  disabled={isLoggingOut}
                >
                  Batal
                </button>
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="flex-1 py-2.5 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 font-medium text-sm flex items-center justify-center gap-2"
                >
                  {isLoggingOut ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
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