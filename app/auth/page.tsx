/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { login, register } from '../../store/auth/authThunk';
import { clearError, clearValidationErrors } from '../../store/auth/authSlice';
import Image from 'next/image';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<{ 
    email?: string; 
    username?: string; 
    password?: string;
  }>({});
  
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { loading, error, isAuthenticated, validationErrors } = useAppSelector((state) => state.auth);

  // Redirect ke dashboard setelah autentikasi berhasil
  useEffect(() => {
    if (isAuthenticated) {
      // Tambahkan timeout kecil untuk memastikan state sudah terupdate
      const timer = setTimeout(() => {
        console.log('Redirecting to dashboard...');
        router.push('/dashboard');
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, router]);

  // Update form errors ketika validationErrors dari Redux berubah
  useEffect(() => {
    if (validationErrors) {
      setFormErrors(prev => ({
        ...prev,
        ...validationErrors
      }));
    }
  }, [validationErrors]);

  const validateForm = () => {
    const errors: typeof formErrors = {};
    
    if (!email.trim()) {
      errors.email = isLogin ? 'Please enter email or username' : 'Please enter email';
    } else if (!isLogin && !/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Please enter a valid email';
    }
    
    if (!isLogin && !username.trim()) {
      errors.username = 'Please enter username';
    }
    
    if (!password) {
      errors.password = 'Please enter password';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearError());
    dispatch(clearValidationErrors());
    setFormErrors({});
    
    if (!validateForm()) {
      return;
    }

    try {
      if (isLogin) {
        await dispatch(login({
          identifier: email,
          password,
          email: undefined
        })).unwrap();
        
        console.log('Login successful, redirecting to dashboard...');
        // Tidak perlu router.push di sini karena useEffect sudah menangani
        
      } else {
        const result = await dispatch(register({
          email,
          username,
          password,
        })).unwrap();
        
        console.log('Registration successful, user:', result.user);
        
        // Reset form setelah register sukses
        setIsLogin(true);
        setEmail('');
        setPassword('');
        setUsername('');
        
        // Redirect akan ditangani oleh useEffect karena isAuthenticated akan menjadi true
      }
    } catch (err: any) {
      console.error('Auth error in component:', err);
      // Error sudah ditangani oleh authSlice
    }
  };

  const handleDemoLogin = () => {
    setEmail('admin@traveo.com');
    setPassword('admintraveo123');
    dispatch(clearError());
    dispatch(clearValidationErrors());
    setFormErrors({});
  };

  const handleToggleMode = () => {
    setIsLogin(!isLogin);
    setFormErrors({});
    dispatch(clearError());
    dispatch(clearValidationErrors());
    if (!isLogin) {
      setUsername('');
    }
  };

  // Jika sudah terautentikasi, tampilkan loading atau null
  if (isAuthenticated) {
    return (
      <div className="min-h-[calc(100vh-140px)] flex items-center justify-center bg-white p-8">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#213448] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center bg-white p-8">
      <div className="w-full max-w-md mx-auto px-2 sm:px-6 lg:px-8">
        {/* Card Container */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          {/* Header dengan Logo */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col items-center">
              <div className="relative w-16 h-16">
                <Image
                  src="/logo.png"
                  alt="Traveo Logo"
                  width={50}
                  height={50}
                  className="rounded-xl"
                />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Traveo</h1>
              <p className="text-gray-500 text-sm mt-1">Explore • Write • Share</p>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-6">
            {/* Toggle Tabs */}
            <div className="flex w-full bg-gray-100 rounded-lg p-1 mb-6">
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-all duration-200 ${
                  isLogin 
                    ? 'bg-white shadow-sm text-[#213448]' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
                disabled={loading}
              >
                Sign In
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-all duration-200 ${
                  !isLogin 
                    ? 'bg-white shadow-sm text-[#213448]' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
                disabled={loading}
              >
                Sign Up
              </button>
            </div>

            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-1">
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className="text-gray-600 text-sm">
                {isLogin ? 'Sign in to continue your journey' : 'Join our community of travelers'}
              </p>
            </div>

            {/* Demo Login Button */}
            {isLogin && (
              <button
                onClick={handleDemoLogin}
                className="w-full mb-6 bg-gray-50 hover:bg-gray-100 text-gray-700 py-2.5 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm border border-gray-200"
                disabled={loading}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Try Demo Account
              </button>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-red-700 text-sm">
                    {validationErrors.email || validationErrors.username || validationErrors.password || error}
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {isLogin ? 'Email or Username' : 'Email Address'}
                </label>
                <input
                  type={isLogin ? "text" : "email"}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (formErrors.email) {
                      setFormErrors(prev => ({ ...prev, email: undefined }));
                    }
                    if (validationErrors.email) {
                      dispatch(clearValidationErrors());
                    }
                  }}
                  placeholder={isLogin ? "you@example.com or username" : "Enter your email"}
                  className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#213448] focus:border-[#213448] transition-colors text-sm ${
                    (formErrors.email || validationErrors.email) ? 'border-red-300' : 'border-gray-300'
                  }`}
                  disabled={loading}
                />
                {(formErrors.email || validationErrors.email) && (
                  <p className="mt-1.5 text-xs text-red-600">{formErrors.email || validationErrors.email}</p>
                )}
              </div>

              {/* Username Field - Only for register */}
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      if (formErrors.username) {
                        setFormErrors(prev => ({ ...prev, username: undefined }));
                      }
                      if (validationErrors.username) {
                        dispatch(clearValidationErrors());
                      }
                    }}
                    placeholder="Choose a username"
                    className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#213448] focus:border-[#213448] transition-colors text-sm ${
                      (formErrors.username || validationErrors.username) ? 'border-red-300' : 'border-gray-300'
                    }`}
                    disabled={loading}
                  />
                  {(formErrors.username || validationErrors.username) && (
                    <p className="mt-1.5 text-xs text-red-600">{formErrors.username || validationErrors.username}</p>
                  )}
                </div>
              )}

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (formErrors.password) {
                        setFormErrors(prev => ({ ...prev, password: undefined }));
                      }
                      if (validationErrors.password) {
                        dispatch(clearValidationErrors());
                      }
                    }}
                    placeholder="Enter your password"
                    className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#213448] focus:border-[#213448] transition-colors text-sm pr-10 ${
                      (formErrors.password || validationErrors.password) ? 'border-red-300' : 'border-gray-300'
                    }`}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    disabled={loading}
                  >
                    {showPassword ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {(formErrors.password || validationErrors.password) && (
                  <p className="mt-1.5 text-xs text-red-600">{formErrors.password || validationErrors.password}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-2.5 rounded-lg font-medium text-white text-sm transition-colors mt-2 ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-[#213448] hover:bg-[#1a2a3a]'
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {isLogin ? 'Signing in...' : 'Creating account...'}
                  </span>
                ) : (
                  isLogin ? 'Sign In' : 'Sign Up'
                )}
              </button>
            </form>

            {/* Toggle Link */}
            <div className="text-center mt-6 pt-6 border-t border-gray-200">
              <p className="text-gray-600 text-sm">
                {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                <button
                  onClick={handleToggleMode}
                  className="text-[#213448] hover:text-[#1a2a3a] font-medium hover:underline"
                  disabled={loading}
                >
                  {isLogin ? "Sign up" : "Sign in"}
                </button>
              </p>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-xs text-gray-400 text-center mt-6">
          By continuing, you agree to our Terms and Privacy Policy
        </p>
      </div>
    </div>
  );
}