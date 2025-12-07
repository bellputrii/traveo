// app/(public)/pengaturan-pengguna/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import { Navbar } from '@/components/public/Navbar';
import { User, Save, Key, Eye, EyeOff, Loader2 } from "lucide-react";

// Helper function to get token from localStorage
const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

export default function PengaturanPenggunaPage() {
  const [activeMenu, setActiveMenu] = useState('pengaturan');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: ''
  });

  const [originalProfileData, setOriginalProfileData] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState({
    profile: false,
    update: false,
    password: false
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // API Base URL
//   const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://padicheckai-backend-production.up.railway.app';

  // Fetch user profile data
  const fetchProfileData = async () => {
    const token = getToken();
    if (!token) {
      setError('Anda belum login. Silakan login terlebih dahulu.');
      return;
    }

    setLoading(prev => ({ ...prev, profile: true }));
    setError(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/profiles/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        const userData = result.data;
        setProfileData({
          fullName: userData.fullName || '',
          email: userData.email || '',
          phone: userData.phone || '',
          role: userData.role || 'USER'
        });
        setOriginalProfileData({
          fullName: userData.fullName || '',
          email: userData.email || '',
          phone: userData.phone || '',
          role: userData.role || 'USER'
        });
      }
    } catch (err: any) {
      console.error('Error fetching profile:', err);
      setError('Gagal mengambil data profil. Silakan coba lagi.');
      // Fallback data jika API error
      setProfileData({
        fullName: 'Admin User',
        email: 'admin@padicheck.com',
        phone: '+62 812 3456 7890',
        role: 'Admin'
      });
    } finally {
      setLoading(prev => ({ ...prev, profile: false }));
    }
  };

  // Update user profile
  const updateProfileData = async () => {
    const token = getToken();
    if (!token) {
      setError('Anda belum login. Silakan login terlebih dahulu.');
      return;
    }

    setLoading(prev => ({ ...prev, update: true }));
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/profiles/me`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phone: profileData.phone
          // Tambahkan field lain yang bisa diupdate jika API mendukung
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal memperbarui profil');
      }

      const result = await response.json();
      
      if (result.success) {
        setSuccess('Profil berhasil diperbarui!');
        setOriginalProfileData({ ...profileData });
        setIsEditingProfile(false);
        
        // Auto-hide success message after 3 seconds
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Gagal memperbarui profil. Silakan coba lagi.');
      
      // Revert to original data on error
      setProfileData({ ...originalProfileData });
    } finally {
      setLoading(prev => ({ ...prev, update: false }));
    }
  };

  // Change password
  const changePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Konfirmasi password tidak cocok!');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setError('Password baru harus minimal 8 karakter');
      return;
    }

    const token = getToken();
    if (!token) {
      setError('Anda belum login. Silakan login terlebih dahulu.');
      return;
    }

    setLoading(prev => ({ ...prev, password: true }));
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal mengubah password');
      }

      const result = await response.json();
      
      if (result.success) {
        setSuccess('Password berhasil diubah!');
        
        // Reset password form
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setIsChangingPassword(false);
        
        // Auto-hide success message after 3 seconds
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err: any) {
      console.error('Error changing password:', err);
      setError(err.message || 'Gagal mengubah password. Silakan coba lagi.');
    } finally {
      setLoading(prev => ({ ...prev, password: false }));
    }
  };

  // Format role for display
  const formatRole = (role: string) => {
    const roleMap: Record<string, string> = {
      'ADMIN': 'Admin',
      'USER': 'Pengguna',
      'SUPER_ADMIN': 'Super Admin'
    };
    return roleMap[role] || role;
  };

  // Format phone number for display
  const formatPhoneDisplay = (phone: string) => {
    if (!phone) return '';
    
    // Remove any non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Format as Indonesian phone number
    if (cleaned.length <= 11) {
      return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, '$1 $2 $3');
    }
    
    return cleaned;
  };

  // Handle phone input
  const handlePhoneChange = (value: string) => {
    // Remove any non-digit characters
    const cleaned = value.replace(/\D/g, '');
    setProfileData({ ...profileData, phone: cleaned });
  };

  const handleSaveProfile = () => {
    updateProfileData();
  };

  const handlePasswordChange = () => {
    changePassword();
  };

  // Fetch profile data on component mount
  useEffect(() => {
    fetchProfileData();
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
      
      <div className="ml-64 flex-1">
        <Navbar activeMenu={activeMenu} />
        
        <main className="p-6 space-y-6">
          {/* Header Card */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Pengaturan Pengguna</h1>
                <p className="text-gray-600 mt-1">
                  Kelola informasi akun dan keamanan Anda
                </p>
              </div>
              {isEditingProfile && (
                <button
                  onClick={handleSaveProfile}
                  disabled={loading.update}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading.update ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Simpan Perubahan
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Success and Error Messages */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
                {success}
              </div>
            )}
          </div>

          {/* Profil Pengguna Card */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <User className="text-green-600 w-6 h-6" />
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Profil Pengguna</h2>
                  <p className="text-gray-500 text-sm">Kelola informasi profil Anda</p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              {loading.profile ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-green-600" />
                  <span className="ml-2 text-gray-600">Memuat data profil...</span>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nama Lengkap</label>
                      <input 
                        type="text"
                        value={profileData.fullName}
                        onChange={(e) => setProfileData({...profileData, fullName: e.target.value})}
                        disabled={!isEditingProfile}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition ${
                          !isEditingProfile ? 'bg-gray-50 cursor-not-allowed' : ''
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input 
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                        disabled={true}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                      />
                      <p className="text-xs text-gray-500 mt-1">Email tidak dapat diubah</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nomor Telepon</label>
                      <input 
                        type="text"
                        value={formatPhoneDisplay(profileData.phone)}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                        disabled={!isEditingProfile}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition ${
                          !isEditingProfile ? 'bg-gray-50 cursor-not-allowed' : ''
                        }`}
                        placeholder="0812 3456 7890"
                        maxLength={15}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                      <input 
                        type="text"
                        value={formatRole(profileData.role)}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end mt-6">
                    {!isEditingProfile ? (
                      <button 
                        onClick={() => setIsEditingProfile(true)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                      >
                        Edit Profil
                      </button>
                    ) : (
                      <div className="flex gap-3">
                        <button 
                          onClick={() => {
                            setIsEditingProfile(false);
                            // Reset ke data asli
                            setProfileData({ ...originalProfileData });
                          }}
                          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                        >
                          Batal
                        </button>
                        <button 
                          onClick={handleSaveProfile}
                          disabled={loading.update}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loading.update ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Menyimpan...
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4" />
                              Simpan Perubahan
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Keamanan Card */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <Key className="text-purple-600 w-6 h-6" />
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Keamanan Akun</h2>
                  <p className="text-gray-500 text-sm">Ubah password untuk menjaga keamanan akun</p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              {!isChangingPassword ? (
                <div className="space-y-4">
                  <p className="text-gray-600 text-sm">
                    Untuk menjaga keamanan akun Anda, disarankan untuk mengubah password secara berkala.
                    Pastikan password baru Anda kuat dan berbeda dari password sebelumnya.
                  </p>
                  <button 
                    onClick={() => setIsChangingPassword(true)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center gap-2"
                  >
                    <Key className="w-4 h-4" />
                    Ubah Password
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Password Saat Ini</label>
                    <div className="relative">
                      <input 
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                        placeholder="Masukkan password saat ini"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Password Baru</label>
                    <div className="relative">
                      <input 
                        type={showNewPassword ? 'text' : 'password'}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                        placeholder="Masukkan password baru (minimal 8 karakter)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Password harus minimal 8 karakter</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Konfirmasi Password Baru</label>
                    <div className="relative">
                      <input 
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                        placeholder="Konfirmasi password baru"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button 
                      onClick={() => {
                        setIsChangingPassword(false);
                        setPasswordData({
                          currentPassword: '',
                          newPassword: '',
                          confirmPassword: ''
                        });
                      }}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                    >
                      Batal
                    </button>
                    <button 
                      onClick={handlePasswordChange}
                      disabled={loading.password}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading.password ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Mengubah Password...
                        </>
                      ) : (
                        <>
                          <Key className="w-4 h-4" />
                          Simpan Password Baru
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Info Keamanan */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
            <h3 className="font-semibold text-blue-900 mb-3">Tips Keamanan Akun</h3>
            <ul className="text-sm text-blue-800 space-y-2 list-disc ml-5">
              <li>Gunakan password yang kuat dengan kombinasi huruf, angka, dan simbol</li>
              <li>Jangan gunakan password yang sama dengan akun lain</li>
              <li>Ganti password secara berkala setiap 3-6 bulan</li>
              <li>Jangan bagikan informasi login Anda kepada siapapun</li>
              <li>Selalu logout setelah menggunakan aplikasi di perangkat publik</li>
            </ul>
          </div>
        </main>
      </div>
    </div>
  );
}