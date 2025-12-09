/* eslint-disable @typescript-eslint/no-explicit-any */
// app/(auth)/register/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserPlus, Eye, EyeOff, Mail, Lock, User, CheckCircle, Phone, ArrowLeft, Smartphone } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile on mount
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // API Base URL
  const API_URL = 'https://padicheckai-backend-production.up.railway.app';
  const AUTH_TOKEN = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxZWFkNTUzMS00NzNiLTRkYWUtYjFjZi0xNTA1MTE5MTBjOWQiLCJlbWFpbCI6ImFkbWluQGFkbWluLmNvbSIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTc2NTA5Nzk3MSwiZXhwIjoxNzY1MTg0MzcxfQ.TH85_sOM1XitEUEZxFT9j8LDMlKqstDQlPriYXYgDU0';

  const checkPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    setPasswordStrength(strength);
  };

  const validateForm = () => {
    setError('');

    if (!formData.fullName.trim()) {
      setError('Nama lengkap harus diisi');
      return false;
    }

    if (!formData.email.trim()) {
      setError('Email harus diisi');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Masukkan alamat email yang valid');
      return false;
    }

    if (!formData.phone.trim()) {
      setError('Nomor telepon harus diisi');
      return false;
    }

    const phoneRegex = /^[0-9]{10,15}$/;
    if (!phoneRegex.test(formData.phone.replace(/\D/g, ''))) {
      setError('Masukkan nomor telepon yang valid (10-15 digit)');
      return false;
    }

    if (!formData.password) {
      setError('Password harus diisi');
      return false;
    }

    if (formData.password.length < 8) {
      setError('Password minimal 8 karakter');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Password tidak cocok');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
      myHeaders.append("Authorization", AUTH_TOKEN);

      const raw = JSON.stringify({
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        phone: formData.phone
      });

      const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow" as const
      };

      const response = await fetch(`${API_URL}/auth/register`, requestOptions);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Registrasi gagal. Silakan coba lagi.');
      }

      setSuccess('Registrasi berhasil! Mengarahkan ke login...');
      
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
      });

      setTimeout(() => {
        router.push('/login?registered=true');
      }, 2000);

    } catch (err: any) {
      setError(err.message || 'Registrasi gagal. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    let formattedValue = value;
    if (name === 'phone') {
      formattedValue = value.replace(/\D/g, '');
    }
    
    setFormData({
      ...formData,
      [name]: formattedValue,
    });

    if (name === 'password') {
      checkPasswordStrength(formattedValue);
    }
  };

  const getStrengthColor = () => {
    if (passwordStrength >= 75) return 'bg-emerald-500';
    if (passwordStrength >= 50) return 'bg-yellow-500';
    if (passwordStrength >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getStrengthText = () => {
    if (passwordStrength >= 75) return 'Kuat';
    if (passwordStrength >= 50) return 'Sedang';
    if (passwordStrength >= 25) return 'Lemah';
    return 'Sangat Lemah';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex flex-col">
      {/* Header untuk mobile */}
      <div className="md:hidden px-4 py-4 bg-white border-b border-gray-100">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Kembali"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Buat Akun</h1>
            <p className="text-xs text-gray-500">Mulai dengan PadiCheck AI</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 md:p-6">
        <div className="w-full max-w-md">
          {/* Desktop Header */}
          <div className="hidden md:block text-center mb-8">
            <div className="mb-4">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                <Smartphone className="h-8 w-8 text-emerald-600" />
              </div>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Buat Akun Baru
            </h1>
            <p className="text-gray-600 text-sm md:text-base">
              Bergabung dengan PadiCheck AI untuk deteksi penyakit padi
            </p>
          </div>

          {/* Mobile App Info */}
          <div className="md:hidden mb-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Smartphone className="h-6 w-6 text-emerald-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">
                Aplikasi PadiCheck AI
              </h2>
              <p className="text-xs text-gray-500">
                Deteksi penyakit padi dengan mudah di smartphone Anda
              </p>
            </div>
          </div>

          {/* Card Container */}
          <div className="bg-white rounded-xl md:rounded-2xl shadow-sm p-4 md:p-8 border border-gray-200">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 md:px-4 py-3 rounded-lg mb-4 md:mb-6 text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 md:px-4 py-3 rounded-lg mb-4 md:mb-6 text-sm">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
              <div className="space-y-3 md:space-y-4">
                {/* Full Name Input */}
                <div>
                  <label htmlFor="fullName" className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
                    Nama Lengkap
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-2.5 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm md:text-base placeholder:text-gray-400"
                      placeholder="Masukkan nama lengkap"
                    />
                  </div>
                </div>

                {/* Email Input */}
                <div>
                  <label htmlFor="email" className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
                    Alamat Email
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
                      className="w-full pl-10 pr-4 py-2.5 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm md:text-base placeholder:text-gray-400"
                      placeholder="contoh@email.com"
                    />
                  </div>
                </div>

                {/* Phone Input */}
                <div>
                  <label htmlFor="phone" className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
                    Nomor Telepon
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-2.5 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm md:text-base placeholder:text-gray-400"
                      placeholder="08xxxxxxxxxx"
                      maxLength={15}
                      inputMode="numeric"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Contoh: 081234567890
                  </p>
                </div>

                {/* Password Input */}
                <div>
                  <label htmlFor="password" className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
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
                      className="w-full pl-10 pr-12 py-2.5 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm md:text-base placeholder:text-gray-400"
                      placeholder="Buat password yang kuat"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1"
                      aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>

                  {/* Password Strength Indicator */}
                  {formData.password && (
                    <div className="mt-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-600">Kekuatan password</span>
                        <span className={`font-medium ${
                          passwordStrength >= 75 ? 'text-emerald-600' :
                          passwordStrength >= 50 ? 'text-yellow-600' :
                          passwordStrength >= 25 ? 'text-orange-600' : 'text-red-600'
                        }`}>
                          {getStrengthText()}
                        </span>
                      </div>
                      <div className="w-full h-1.5 md:h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${getStrengthColor()}`}
                          style={{ width: `${passwordStrength}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Password Requirements - Mobile Collapsible */}
                  <div className="mt-3">
                    <details className="md:hidden">
                      <summary className="text-xs text-gray-600 font-medium cursor-pointer">
                        Kriteria password
                      </summary>
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center text-xs text-gray-500">
                          <CheckCircle className={`h-3 w-3 mr-2 ${formData.password.length >= 8 ? 'text-emerald-500' : 'text-gray-300'}`} />
                          Minimal 8 karakter
                        </div>
                        <div className="flex items-center text-xs text-gray-500">
                          <CheckCircle className={`h-3 w-3 mr-2 ${/[A-Z]/.test(formData.password) ? 'text-emerald-500' : 'text-gray-300'}`} />
                          Satu huruf besar
                        </div>
                        <div className="flex items-center text-xs text-gray-500">
                          <CheckCircle className={`h-3 w-3 mr-2 ${/[0-9]/.test(formData.password) ? 'text-emerald-500' : 'text-gray-300'}`} />
                          Satu angka
                        </div>
                        <div className="flex items-center text-xs text-gray-500">
                          <CheckCircle className={`h-3 w-3 mr-2 ${/[^A-Za-z0-9]/.test(formData.password) ? 'text-emerald-500' : 'text-gray-300'}`} />
                          Satu karakter khusus
                        </div>
                      </div>
                    </details>

                    {/* Desktop Password Requirements */}
                    <div className="hidden md:block mt-3 space-y-1">
                      <p className="text-xs text-gray-600">Password harus mengandung:</p>
                      <div className="flex items-center text-xs text-gray-500">
                        <CheckCircle className={`h-3 w-3 mr-2 ${formData.password.length >= 8 ? 'text-emerald-500' : 'text-gray-300'}`} />
                        Minimal 8 karakter
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        <CheckCircle className={`h-3 w-3 mr-2 ${/[A-Z]/.test(formData.password) ? 'text-emerald-500' : 'text-gray-300'}`} />
                        Satu huruf besar
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        <CheckCircle className={`h-3 w-3 mr-2 ${/[0-9]/.test(formData.password) ? 'text-emerald-500' : 'text-gray-300'}`} />
                        Satu angka
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        <CheckCircle className={`h-3 w-3 mr-2 ${/[^A-Za-z0-9]/.test(formData.password) ? 'text-emerald-500' : 'text-gray-300'}`} />
                        Satu karakter khusus
                      </div>
                    </div>
                  </div>
                </div>

                {/* Confirm Password Input */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
                    Konfirmasi Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-12 py-2.5 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm md:text-base placeholder:text-gray-400"
                      placeholder="Konfirmasi password Anda"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1"
                      aria-label={showConfirmPassword ? "Sembunyikan password" : "Tampilkan password"}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Terms and Conditions */}
                <div className="flex items-start pt-2">
                  <input
                    type="checkbox"
                    id="terms"
                    required
                    className="h-4 w-4 mt-0.5 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                  />
                  <label htmlFor="terms" className="ml-2 block text-xs md:text-sm text-gray-700 leading-tight">
                    Saya setuju dengan{' '}
                    <Link href="/terms" className="text-emerald-600 hover:text-emerald-500">
                      Syarat Layanan
                    </Link>{' '}
                    dan{' '}
                    <Link href="/privacy" className="text-emerald-600 hover:text-emerald-500">
                      Kebijakan Privasi
                    </Link>
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm md:text-base shadow-sm hover:shadow-md"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    {isMobile ? 'Membuat...' : 'Membuat Akun...'}
                  </>
                ) : (
                  <>
                    <UserPlus className="h-5 w-5" />
                    {isMobile ? 'Daftar Sekarang' : 'Buat Akun'}
                  </>
                )}
              </button>

              {/* Login Link */}
              <div className="text-center pt-3 md:pt-4">
                <p className="text-gray-600 text-xs md:text-sm">
                  Sudah punya akun?{' '}
                  <Link href="/login" className="text-emerald-600 font-medium hover:text-emerald-500">
                    Masuk di sini
                  </Link>
                </p>
              </div>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-white text-gray-500">
                    atau daftar dengan
                  </span>
                </div>
              </div>

              {/* Social Login Options - Mobile Optimized */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 py-2.5 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span className="hidden md:inline">Google</span>
                  <span className="md:hidden">Google</span>
                </button>
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 py-2.5 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span className="hidden md:inline">Facebook</span>
                  <span className="md:hidden">Facebook</span>
                </button>
              </div>
            </form>

            {/* Mobile Additional Info */}
            <div className="mt-6 md:hidden">
              <div className="bg-emerald-50 rounded-lg p-4 text-center">
                <p className="text-xs text-emerald-800 font-medium mb-1">
                  💡 Tips untuk petani:
                </p>
                <p className="text-xs text-emerald-700">
                  Gunakan aplikasi ini untuk mendeteksi penyakit padi langsung di sawah dengan smartphone Anda!
                </p>
              </div>
            </div>
          </div>

          {/* Footer Text */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Dengan mendaftar, Anda setuju dengan semua syarat yang berlaku.
              <br />
              © {new Date().getFullYear()} PadiCheck AI. Hak cipta dilindungi.
            </p>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Info */}
      {isMobile && (
        <div className="border-t border-gray-200 bg-white p-4">
          <div className="flex items-center justify-center gap-2 text-xs text-gray-600">
            <Smartphone className="h-3 w-3" />
            <span>Aplikasi yang ramah untuk petani</span>
          </div>
        </div>
      )}
    </div>
  );
}