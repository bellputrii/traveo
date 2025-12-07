// app/(auth)/register/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserPlus, Eye, EyeOff, Mail, Lock, User, CheckCircle, Phone } from 'lucide-react';

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

  // API Base URL (sebaiknya simpan di environment variable)
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
    // Reset error
    setError('');

    // Validasi required fields
    if (!formData.fullName.trim()) {
      setError('Full name is required');
      return false;
    }

    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }

    // Validasi email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    if (!formData.phone.trim()) {
      setError('Phone number is required');
      return false;
    }

    // Validasi phone number (minimal 10 digit)
    const phoneRegex = /^[0-9]{10,15}$/;
    if (!phoneRegex.test(formData.phone.replace(/\D/g, ''))) {
      setError('Please enter a valid phone number (10-15 digits)');
      return false;
    }

    if (!formData.password) {
      setError('Password is required');
      return false;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
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
        // Handle error responses
        throw new Error(result.message || 'Registration failed. Please try again.');
      }

      // Registration successful
      setSuccess('Registration successful! Redirecting to login...');
      
      // Clear form
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
      });

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/login?registered=true');
      }, 2000);

    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Format phone number input
    let formattedValue = value;
    if (name === 'phone') {
      // Remove all non-digit characters
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
    if (passwordStrength >= 75) return 'Strong';
    if (passwordStrength >= 50) return 'Medium';
    if (passwordStrength >= 25) return 'Weak';
    return 'Very Weak';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-8 max-w-md mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Create Account</h1>
        <p className="text-gray-600">Get started with PadiCheck AI</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg mb-6">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          {/* Full Name Input */}
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
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
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="Enter your full name"
              />
            </div>
          </div>

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
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="Enter your email"
              />
            </div>
          </div>

          {/* Phone Input */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
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
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="Enter your phone number"
                maxLength={15}
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
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="Create a strong password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
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
                  <span className="text-gray-600">Password strength</span>
                  <span className={`font-medium ${
                    passwordStrength >= 75 ? 'text-emerald-600' :
                    passwordStrength >= 50 ? 'text-yellow-600' :
                    passwordStrength >= 25 ? 'text-orange-600' : 'text-red-600'
                  }`}>
                    {getStrengthText()}
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${getStrengthColor()}`}
                    style={{ width: `${passwordStrength}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Password Requirements */}
            <div className="mt-3 space-y-1">
              <p className="text-xs text-gray-600">Password must contain:</p>
              <div className="flex items-center text-xs text-gray-500">
                <CheckCircle className={`h-3 w-3 mr-2 ${formData.password.length >= 8 ? 'text-emerald-500' : 'text-gray-300'}`} />
                At least 8 characters
              </div>
              <div className="flex items-center text-xs text-gray-500">
                <CheckCircle className={`h-3 w-3 mr-2 ${/[A-Z]/.test(formData.password) ? 'text-emerald-500' : 'text-gray-300'}`} />
                One uppercase letter
              </div>
              <div className="flex items-center text-xs text-gray-500">
                <CheckCircle className={`h-3 w-3 mr-2 ${/[0-9]/.test(formData.password) ? 'text-emerald-500' : 'text-gray-300'}`} />
                One number
              </div>
            </div>
          </div>

          {/* Confirm Password Input */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
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
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="Confirm your password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
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
          <div className="flex items-start">
            <input
              type="checkbox"
              id="terms"
              required
              className="h-4 w-4 mt-1 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
            />
            <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
              I agree to the{' '}
              <Link href="/terms" className="text-emerald-600 hover:text-emerald-500">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-emerald-600 hover:text-emerald-500">
                Privacy Policy
              </Link>
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Creating Account...
            </>
          ) : (
            <>
              <UserPlus className="h-5 w-5" />
              Create Account
            </>
          )}
        </button>

        {/* Login Link */}
        <div className="text-center pt-4">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="text-emerald-600 font-medium hover:text-emerald-500">
              Sign in
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}