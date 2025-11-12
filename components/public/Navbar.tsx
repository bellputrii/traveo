"use client";

import { useState, useEffect } from "react";
import { Menu, X, Home, BookOpen, Users, GraduationCap, ClipboardList, LogIn, UserPlus, User, LogOut, LayoutDashboard, Settings, Shield } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function NavBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userData, setUserData] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Cek role dari pathname
  const isTeacherPage = pathname.includes('/beranda') || pathname.includes('/classes');
  const isAdminPage = pathname.includes('/admin');

  // Effect untuk mendeteksi scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Effect untuk mengecek status login dan role
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Fungsi untuk mengecek status autentikasi dan role
  const checkAuthStatus = () => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("userRole");
    
    if (token) {
      setIsLoggedIn(true);
      setUserRole(role);
    } else {
      setIsLoggedIn(false);
      setUserRole(null);
    }
  };

  // Fungsi logout
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("rememberMe");
      localStorage.removeItem("userRole");
      setIsLoggedIn(false);
      setUserRole(null);
      setUserData(null);
      setShowLogoutConfirm(false);
      
      // Redirect berdasarkan role
      if (userRole === 'teacher') {
        router.push("/beranda");
      } else if (userRole === 'admin') {
        router.push("/home");
      } else {
        router.push("/home");
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Fungsi untuk menampilkan modal konfirmasi logout
  const showLogoutConfirmation = () => {
    setShowLogoutConfirm(true);
  };

  // Fungsi untuk menutup modal konfirmasi
  const closeLogoutConfirmation = () => {
    setShowLogoutConfirm(false);
  };

  // Menu items berdasarkan status login dan role
  const getMenuItems = () => {
    // Jika belum login
    if (!isLoggedIn) {
      return [
        { name: "Dashboard", icon: <Home size={18} />, href: "/home" },
        { name: "E-Learning", icon: <BookOpen size={18} />, href: "/elearning" },
        { name: "E-Mentoring", icon: <GraduationCap size={18} />, href: "/ementoring" },
      ];
    }

    // Jika sudah login berdasarkan role
    switch (userRole) {
      case 'student':
        return [
          { name: "Dashboard", icon: <Home size={18} />, href: "/home" },
          { name: "E-Learning", icon: <BookOpen size={18} />, href: "/elearning" },
          { name: "E-Mentoring", icon: <GraduationCap size={18} />, href: "/ementoring" },
          { name: "Course Saya", icon: <ClipboardList size={18} />, href: "/mycourse" },
        ];
      
      case 'teacher':
        return [
          { name: "Dashboard", icon: <Home size={18} />, href: "/beranda" },
          { name: "Kelola Kelas", icon: <LayoutDashboard size={18} />, href: "/classes" },
        ];
      
      case 'admin':
        return [
          { name: "Dashboard", icon: <Home size={18} />, href: "/admin" },
          { name: "Kelola Teacher", icon: <Users size={18} />, href: "/admin/teachers" },
          { name: "Kelola Kategori", icon: <Settings size={18} />, href: "/admin/categories" },
        ];
      
      default:
        return [
          { name: "Dashboard", icon: <Home size={18} />, href: "/home" },
          { name: "E-Learning", icon: <BookOpen size={18} />, href: "/elearning" },
          { name: "E-Mentoring", icon: <GraduationCap size={18} />, href: "/ementoring" },
        ];
    }
  };

  const menuItems = getMenuItems();

  // Fungsi untuk mengecek apakah link aktif
  const isActiveLink = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname === href || pathname.startsWith(href);
  };

  // Tentukan URL logo berdasarkan role
  const getLogoHref = () => {
    if (userRole === 'teacher') {
      return "/beranda";
    } else if (userRole === 'admin') {
      return "/admin";
    }
    return "/home";
  };

  // Tentukan warna navbar berdasarkan role
  const getNavbarStyle = () => {
    if (userRole === 'teacher') {
      return 'bg-blue-50 border-blue-200';
    } else if (userRole === 'admin') {
      return 'bg-purple-50 border-purple-200';
    }
    return '';
  };

  // Tentukan warna teks dan background berdasarkan role
  const getRoleColors = () => {
    if (userRole === 'teacher') {
      return {
        primary: 'blue',
        text: 'text-blue-800',
        bg: 'bg-blue-100',
        hoverBg: 'bg-blue-200',
        button: 'bg-blue-600 hover:bg-blue-700'
      };
    } else if (userRole === 'admin') {
      return {
        primary: 'purple',
        text: 'text-purple-800',
        bg: 'bg-purple-100',
        hoverBg: 'bg-purple-200',
        button: 'bg-purple-600 hover:bg-purple-700'
      };
    }
    return {
      primary: 'blue',
      text: 'text-blue-800',
      bg: 'bg-gray-100',
      hoverBg: 'bg-gray-200',
      button: 'bg-blue-600 hover:bg-blue-700'
    };
  };

  const roleColors = getRoleColors();

  return (
    <>
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? "bg-white shadow-lg border-b border-gray-200 py-2" 
            : "bg-white shadow-sm border-b border-gray-200 py-3"
        } ${getNavbarStyle()}`}
      >
        <div className="mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 max-w-7xl">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Link 
              href={getLogoHref()}
              className="flex items-center gap-3 no-underline"
            >
              <div className={`relative flex items-center justify-center ${
                isScrolled ? "w-8 h-8" : "w-10 h-10"
              }`}>
                <Image
                  src="/logo-ambil-prestasi.png"
                  alt="Ambil Prestasi"
                  width={isScrolled ? 32 : 40}
                  height={isScrolled ? 32 : 40}
                  className="object-contain"
                />
              </div>
              <span className={`font-bold transition-all duration-300 ${
                isScrolled ? "text-xl" : "text-xl"
              } ${roleColors.text}`}>
                Ambil Prestasi
                {userRole && (
                  <span className="text-sm font-normal ml-2">
                    {userRole === 'teacher' && '(Teacher)'}
                    {userRole === 'admin' && '(Admin)'}
                    {userRole === 'student' && '(Student)'}
                  </span>
                )}
              </span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-1">
            {menuItems.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg transition-all duration-200 ${
                  isActiveLink(item.href)
                    ? `${roleColors.button} text-white shadow-md`
                    : `${roleColors.text} hover:${roleColors.bg}`
                } ${isScrolled ? "py-2" : "py-2.5"}`}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            ))}
          </div>

          {/* Auth Buttons & Profile Section */}
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              // Tampilan ketika user sudah login
              <div className="flex items-center gap-3">
                {/* Profile Picture & Dropdown */}
                <div className="relative group">
                  <button className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${roleColors.bg} hover:${roleColors.hoverBg} ${roleColors.text}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-medium ${
                      userRole === 'teacher' ? "bg-blue-700" : 
                      userRole === 'admin' ? "bg-purple-700" : 
                      "bg-blue-600"
                    }`}>
                      <User size={16} />
                    </div>
                    <span className="text-sm font-medium hidden sm:inline">
                      {userRole === 'teacher' && 'Teacher'}
                      {userRole === 'admin' && 'Admin'}
                      {userRole === 'student' && 'Student'}
                    </span>
                  </button>
                  
                  {/* Dropdown Menu */}
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        {userRole === 'teacher' ? 'Teacher Profile' : 
                         userRole === 'admin' ? 'Admin Profile' : 
                         'Student Profile'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {userRole === 'teacher' ? 'teacher@example.com' : 
                         userRole === 'admin' ? 'admin@example.com' : 
                         'student@example.com'}
                      </p>
                    </div>
                    
                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <button
                        onClick={showLogoutConfirmation}
                        className="flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors w-full"
                      >
                        <LogOut size={16} />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Tampilan ketika user belum login
              <div className="hidden md:flex items-center gap-2">
                <Link
                  href="/auth/login"
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200"
                >
                  <LogIn size={16} />
                  <span>Login</span>
                </Link>
                <Link
                  href="/auth/login?tab=register"
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 text-white ${roleColors.button} shadow-md`}
                >
                  <UserPlus size={16} />
                  <span>Daftar</span>
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              className={`md:hidden p-2 rounded-lg transition-colors ${roleColors.bg} hover:${roleColors.hoverBg} ${roleColors.text}`}
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
            <div className="px-4 py-3 space-y-1">
              {menuItems.map((item, index) => (
                <Link
                  key={index}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 py-3 px-4 rounded-lg transition-all ${
                    isActiveLink(item.href)
                      ? `${roleColors.button} text-white`
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {item.icon}
                  <span className="font-medium">{item.name}</span>
                </Link>
              ))}
              
              {/* Auth Buttons di Mobile */}
              <div className="border-t border-gray-200 pt-3 mt-3 space-y-2">
                {isLoggedIn ? (
                  // Mobile menu ketika login
                  <>
                    <div className="flex items-center gap-3 py-3 px-4 rounded-lg bg-gray-100 border border-gray-200">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${
                        userRole === 'teacher' ? "bg-blue-700" : 
                        userRole === 'admin' ? "bg-purple-700" : 
                        "bg-blue-600"
                      }`}>
                        <User size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {userRole === 'teacher' ? 'Teacher Profile' : 
                           userRole === 'admin' ? 'Admin Profile' : 
                           'Student Profile'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {userRole === 'teacher' ? 'teacher@example.com' : 
                           userRole === 'admin' ? 'admin@example.com' : 
                           'student@example.com'}
                        </p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        showLogoutConfirmation();
                      }}
                      className="flex items-center gap-3 py-3 px-4 rounded-lg text-red-600 hover:bg-red-50 transition-all w-full text-left"
                    >
                      <LogOut size={18} />
                      <span className="font-medium">Logout</span>
                    </button>
                  </>
                ) : (
                  // Mobile menu ketika belum login
                  <>
                    <Link
                      href="/auth/login"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 py-3 px-4 rounded-lg text-gray-700 hover:bg-gray-100 transition-all"
                    >
                      <LogIn size={18} />
                      <span className="font-medium">Login</span>
                    </Link>
                    <Link
                      href="/auth/login?tab=register"
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 py-3 px-4 rounded-lg text-white transition-all ${roleColors.button}`}
                    >
                      <UserPlus size={18} />
                      <span className="font-medium">Daftar</span>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl p-6 mx-4 max-w-sm w-full">
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
                  onClick={closeLogoutConfirmation}
                  className="flex-1 py-2.5 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  disabled={isLoggingOut}
                >
                  Batal
                </button>
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="flex-1 py-2.5 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 font-medium flex items-center justify-center gap-2"
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