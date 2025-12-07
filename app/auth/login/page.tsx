// app/(auth)/login/page.tsx
'use client';

import { useState, FormEvent, ChangeEvent, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogIn, Eye, EyeOff, Mail, Lock } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Cek jika sudah login, redirect ke home - DENGAN VALIDASI TOKEN
  useEffect(() => {
    const checkAndValidateAuth = async () => {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      if (!token) {
        setIsCheckingAuth(false);
        return;
      }

      try {
        // Validasi token dengan endpoint protected
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://padicheckai-backend-production.up.railway.app'}/auth/me`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const userData = await response.json();
          // Redirect berdasarkan role
          const userRole = userData.role?.toLowerCase();
          switch (userRole) {
            case 'admin':
              router.push('/home');
              break;
            default:
              router.push('/home');
          }
        } else {
          // Token tidak valid, hapus
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('userRole');
          sessionStorage.removeItem('token');
          sessionStorage.removeItem('user');
          sessionStorage.removeItem('userRole');
          setIsCheckingAuth(false);
        }
      } catch (error) {
        console.error('Token validation error:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userRole');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('userRole');
        setIsCheckingAuth(false);
      }
    };

    checkAndValidateAuth();
  }, [router]);

  // Fungsi untuk menyimpan auth data
  const saveAuthData = (token: string, userData: any, remember: boolean) => {
    if (remember) {
      // Simpan di localStorage (tahan lama)
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('userRole', userData.role?.toLowerCase() || '');
      localStorage.setItem('auth_timestamp', Date.now().toString());
      localStorage.setItem('rememberMe', 'true');
      
      // Hapus dari sessionStorage
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('userRole');
    } else {
      // Simpan di sessionStorage (hanya untuk session)
      sessionStorage.setItem('token', token);
      sessionStorage.setItem('user', JSON.stringify(userData));
      sessionStorage.setItem('userRole', userData.role?.toLowerCase() || '');
      
      // Hapus dari localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('userRole');
      localStorage.removeItem('auth_timestamp');
      localStorage.removeItem('rememberMe');
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setMessage(null);

    // Validasi input
    if (!formData.email || !formData.password) {
      setStatus("error");
      setMessage('Email dan password harus diisi');
      setTimeout(() => setStatus("idle"), 4000);
      return;
    }

    // Validasi format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setStatus("error");
      setMessage('Format email tidak valid');
      setTimeout(() => setStatus("idle"), 4000);
      return;
    }

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://padicheckai-backend-production.up.railway.app';
      
      // Menggunakan format x-www-form-urlencoded sesuai contoh
      const formDataEncoded = new URLSearchParams();
      formDataEncoded.append('email', formData.email.trim());
      formDataEncoded.append('password', formData.password);

      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formDataEncoded,
      });

      const result = await response.json();
      console.log('Login response:', result);

      if (!response.ok) {
        throw new Error(result.message || 'Login gagal');
      }

      if (!result.accessToken) {
        throw new Error('Token tidak ditemukan dalam response');
      }

      // Simpan data auth
      saveAuthData(result.accessToken, result.user, rememberMe);

      setStatus("success");
      setMessage(result.message || 'Login berhasil!');

      // Reset form
      setFormData({
        email: '',
        password: '',
      });

      // Redirect berdasarkan role
      const userRole = result.user.role?.toLowerCase();
      console.log('User role:', userRole);
      
      // Gunakan router.replace untuk menghindari history stack
      switch (userRole) {
        case 'admin':
          setTimeout(() => router.replace('/home'), 500);
          break;
        default:
          setStatus("error");
          setMessage('Role tidak dikenali: ' + userRole);
          setTimeout(() => setStatus("idle"), 4000);
          return;
      }

    } catch (error: unknown) {
      console.error('Login error:', error);
      setStatus("error");
      const errMsg = error instanceof Error 
        ? error.message 
        : 'Terjadi kesalahan saat login. Silakan coba lagi.';
      setMessage(errMsg);
      setTimeout(() => setStatus("idle"), 4000);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Tampilkan loading saat mengecek auth
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Memeriksa autentikasi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-xl shadow-sm p-8 max-w-md w-full">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center">
            <span className="text-white font-bold">P</span>
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold text-gray-900 leading-tight">PadiCheck AI</h1>
            <p className="text-xs text-gray-500 -mt-0.5">Disease Detection</p>
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to your account to continue</p>
        </div>

        {/* Status Messages */}
        {status === "success" && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg mb-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              <span className="text-sm font-medium">{message}</span>
            </div>
          </div>
        )}
        {status === "error" && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-sm font-medium">{message}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={status === "loading"}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={status === "loading"}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={status === "loading"}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={status === "loading"}
                  className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded disabled:opacity-50"
                />
                <span className="text-sm text-gray-700">Remember me</span>
              </label>
              
              <Link 
                href="/auth/forgot-password" 
                className="text-sm text-emerald-600 hover:text-emerald-500 font-medium"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={status === "loading"}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
              status === "loading"
                ? 'bg-emerald-400 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white'
            }`}
          >
            {status === "loading" ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <LogIn className="h-5 w-5" />
                <span>Sign In</span>
              </>
            )}
          </button>

          {/* Register Link */}
          <div className="text-center pt-4 border-t border-gray-100">
            <p className="text-gray-600 text-sm">
              Don't have an account?{' '}
              <Link 
                href="/auth/register" 
                className="text-emerald-600 font-medium hover:text-emerald-500"
              >
                Create an account
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}