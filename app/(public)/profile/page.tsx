/* eslint-disable @typescript-eslint/no-explicit-any */
// app/(public)/pengaturan-pengguna/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import { Navbar } from '@/components/public/Navbar';
import { User, Save, Key, Eye, EyeOff, Loader2, X, AlertTriangle, Menu, LogOut } from "lucide-react";
import { useRouter } from 'next/navigation';

export default function PengaturanPenggunaPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [activeMenu, setActiveMenu] = useState('pengaturan');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // State untuk modal edit profil
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // State untuk profil
  const [profileData, setProfileData] = useState({
    id: '',
    fullName: '',
    email: '',
    phone: '',
    role: ''
  });

  const [originalProfileData, setOriginalProfileData] = useState({
    id: '',
    fullName: '',
    email: '',
    phone: '',
    role: ''
  });

  // State untuk edit form di modal
  const [editFormData, setEditFormData] = useState({
    fullName: '',
    email: '',
    phone: ''
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
  const [modalError, setModalError] = useState<string | null>(null);

  // Function to get user role
  const getUserRole = (): string | null => {
    if (!mounted) return null;
    return localStorage.getItem('userRole') || sessionStorage.getItem('userRole');
  };

  // Function to get token
  const getToken = (): string | null => {
    if (!mounted) return null;
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  };

  // Function to check if user is authenticated
  const checkAuth = (): boolean => {
    const token = getToken();
    if (!token) {
      setError('Anda belum login. Silakan login terlebih dahulu.');
      return false;
    }
    return true;
  };

  // API Base URL
  const API_URL = 'https://padicheckai-backend-production.up.railway.app';

  // Fetch user profile data
  const fetchProfileData = async () => {
    if (!checkAuth()) return;

    const token = getToken();
    if (!token) {
      setError('Token tidak ditemukan. Silakan login kembali.');
      return;
    }

    setLoading(prev => ({ ...prev, profile: true }));
    setError(null);

    try {
      const myHeaders = new Headers();
      myHeaders.append("Authorization", `Bearer ${token}`);

      const response = await fetch(`${API_URL}/profiles/me`, {
        method: "GET",
        headers: myHeaders,
        redirect: "follow" as RequestRedirect
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError('Sesi Anda telah berakhir. Silakan login kembali.');
          // Clear invalid token
          localStorage.removeItem('token');
          sessionStorage.removeItem('token');
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        const userData = result.data;
        const profile = {
          id: userData.id || '',
          fullName: userData.fullName || '',
          email: userData.email || '',
          phone: userData.phone || '',
          role: userData.role || 'ADMIN'
        };
        
        setProfileData(profile);
        setOriginalProfileData(profile);
        
        // Save role to storage if not exists
        const currentRole = getUserRole();
        if (!currentRole && userData.role) {
          localStorage.setItem('userRole', userData.role);
        }
      }
    } catch (err: any) {
      console.error('Error fetching profile:', err);
      setError('Gagal mengambil data profil. Silakan coba lagi.');
      
      // Fallback data jika API error
      const fallbackData = {
        id: '1ead5531-473b-4dae-b1cf-150511910c9d',
        fullName: 'Admin',
        email: 'admin@admin.com',
        phone: '08123456789',
        role: 'ADMIN'
      };
      
      setProfileData(fallbackData);
      setOriginalProfileData(fallbackData);
    } finally {
      setLoading(prev => ({ ...prev, profile: false }));
    }
  };

  // Update user profile dengan modal
  const updateProfileData = async () => {
    if (!checkAuth()) return;

    const token = getToken();
    if (!token) {
      setModalError('Token tidak ditemukan. Silakan login kembali.');
      return;
    }

    // Validasi input
    if (!editFormData.fullName.trim()) {
      setModalError('Nama lengkap tidak boleh kosong');
      return;
    }

    if (!editFormData.email.trim()) {
      setModalError('Email tidak boleh kosong');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editFormData.email)) {
      setModalError('Format email tidak valid');
      return;
    }

    if (!editFormData.phone.trim()) {
      setModalError('Nomor telepon tidak boleh kosong');
      return;
    }

    const phoneRegex = /^[0-9]{10,13}$/;
    if (!phoneRegex.test(editFormData.phone)) {
      setModalError('Nomor telepon harus 10-13 digit angka');
      return;
    }

    setLoading(prev => ({ ...prev, update: true }));
    setModalError(null);

    try {
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
      myHeaders.append("Authorization", `Bearer ${token}`);

      const raw = JSON.stringify({
        "fullName": editFormData.fullName,
        "email": editFormData.email,
        "phone": editFormData.phone
      });

      const response = await fetch(`${API_URL}/profiles/me`, {
        method: "PATCH",
        headers: myHeaders,
        body: raw,
        redirect: "follow" as RequestRedirect
      });

      if (!response.ok) {
        if (response.status === 401) {
          setModalError('Sesi Anda telah berakhir. Silakan login kembali.');
          localStorage.removeItem('token');
          sessionStorage.removeItem('token');
          return;
        }
        
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal memperbarui profil');
      }

      const result = await response.json();
      
      if (result.success) {
        setSuccess('Profil berhasil diperbarui!');
        
        // Update profile data state dengan data dari response
        if (result.data) {
          const updatedProfile = {
            id: result.data.id || profileData.id,
            fullName: result.data.fullName || editFormData.fullName,
            email: result.data.email || editFormData.email,
            phone: result.data.phone || editFormData.phone,
            role: result.data.role || profileData.role
          };
          setProfileData(updatedProfile);
          setOriginalProfileData(updatedProfile);
        } else {
          // Fallback jika data tidak ada di response
          const updatedProfile = {
            ...profileData,
            fullName: editFormData.fullName,
            email: editFormData.email,
            phone: editFormData.phone
          };
          setProfileData(updatedProfile);
          setOriginalProfileData(updatedProfile);
        }
        
        // Close modal
        setIsEditModalOpen(false);
        
        // Auto-hide success message after 3 seconds
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setModalError(err.message || 'Gagal memperbarui profil. Silakan coba lagi.');
    } finally {
      setLoading(prev => ({ ...prev, update: false }));
    }
  };

  // Format role for display
  const formatRole = (role: string) => {
    const roleMap: Record<string, string> = {
      'ADMIN': 'Admin',
      'USER': 'Pengguna',
      'SUPER_ADMIN': 'Super Admin',
      'PETANI': 'Petani',
      'PENGGUNA': 'Pengguna'
    };
    return roleMap[role] || role;
  };

  // Format phone number for display
  const formatPhoneDisplay = (phone: string) => {
    if (!phone) return '';
    
    // Remove any non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Format as Indonesian phone number
    if (cleaned.length === 10) {
      return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
    } else if (cleaned.length === 11) {
      return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, '$1 $2 $3');
    } else if (cleaned.length === 12) {
      return cleaned.replace(/(\d{3})(\d{4})(\d{5})/, '$1 $2 $3');
    } else if (cleaned.length === 13) {
      return cleaned.replace(/(\d{4})(\d{4})(\d{5})/, '$1 $2 $3');
    }
    
    return cleaned;
  };

  // Handle edit form change
  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let cleanedValue = value;
    
    // Untuk phone, hanya izinkan angka
    if (name === 'phone') {
      cleanedValue = value.replace(/\D/g, '');
    }
    
    setEditFormData(prev => ({
      ...prev,
      [name]: cleanedValue
    }));
  };

  const handleOpenEditModal = () => {
    // Set edit form dengan data profil saat ini
    setEditFormData({
      fullName: profileData.fullName,
      email: profileData.email,
      phone: profileData.phone
    });
    setModalError(null); // Reset error saat membuka modal
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setModalError(null); // Reset error saat menutup modal
  };

  const handleSaveProfile = () => {
    updateProfileData();
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    localStorage.removeItem('userRole');
    sessionStorage.removeItem('userRole');
    router.push('/login');
  };

  // Set mounted on component mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch profile data on component mount
  useEffect(() => {
    if (mounted) {
      fetchProfileData();
    }
  }, [mounted]);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(false);
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.querySelector('.sidebar-container');
      const menuButton = document.querySelector('.menu-button');
      
      if (isSidebarOpen && 
          sidebar && 
          !sidebar.contains(event.target as Node) && 
          menuButton && 
          !menuButton.contains(event.target as Node)) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSidebarOpen]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        sidebar-container fixed md:relative z-40 h-full transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
      </div>
      
      <div className="flex-1 md:ml-64 w-full">
        {/* Mobile Header */}
        <div className="md:hidden sticky top-0 z-30 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="menu-button p-2 rounded-lg hover:bg-gray-100"
          >
            <Menu className="w-6 h-6 text-gray-700" />
          </button>
          
          <h1 className="text-lg font-semibold text-gray-900">Pengaturan</h1>
          
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg hover:bg-red-50 text-red-600"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>

        {/* Desktop Navbar */}
        <div className="hidden md:block">
          <Navbar activeMenu={activeMenu} />
        </div>
        
        <main className="p-4 md:p-6 space-y-6">
          {/* Header Card */}
          <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-4 md:mb-6">
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-900">Pengaturan Pengguna</h1>
                <p className="text-gray-600 mt-1 text-sm md:text-base">
                  Kelola informasi akun dan keamanan Anda
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <button
                  onClick={handleOpenEditModal}
                  className="px-4 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2 text-sm md:text-base"
                >
                  <User className="w-4 h-4" />
                  Edit Profil
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2.5 border border-red-300 text-red-700 rounded-lg font-medium hover:bg-red-50 transition-colors text-sm md:text-base hidden md:block"
                >
                  Logout
                </button>
              </div>
            </div>

            {/* Success and Error Messages */}
            {error && !isEditModalOpen && (
              <div className="mb-4 p-3 md:p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm md:text-base">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 md:p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm md:text-base">
                {success}
              </div>
            )}
          </div>

          {/* Profil Pengguna Card */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 md:p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <User className="text-green-600 w-5 h-5 md:w-6 md:h-6" />
                <div>
                  <h2 className="text-base md:text-lg font-semibold text-gray-900">Profil Pengguna</h2>
                  <p className="text-gray-500 text-xs md:text-sm">Informasi akun Anda</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 md:p-6">
              {!mounted || loading.profile ? (
                <div className="flex flex-col items-center justify-center py-8 md:py-12">
                  <Loader2 className="w-6 h-6 md:w-8 md:h-8 animate-spin text-green-600" />
                  <span className="ml-2 text-gray-600 mt-2 text-sm md:text-base">Memuat data profil...</span>
                </div>
              ) : (
                <div className="space-y-4 md:space-y-6">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">Nama Lengkap</label>
                      <div className="w-full px-3 py-2.5 md:px-4 md:py-3 border border-gray-200 bg-gray-50 rounded-lg text-gray-700 text-sm md:text-base">
                        {profileData.fullName}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">Email</label>
                      <div className="w-full px-3 py-2.5 md:px-4 md:py-3 border border-gray-200 bg-gray-50 rounded-lg text-gray-700 text-sm md:text-base">
                        {profileData.email}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">Nomor Telepon</label>
                      <div className="w-full px-3 py-2.5 md:px-4 md:py-3 border border-gray-200 bg-gray-50 rounded-lg text-gray-700 text-sm md:text-base">
                        {formatPhoneDisplay(profileData.phone) || '-'}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">Role</label>
                      <div className="w-full px-3 py-2.5 md:px-4 md:py-3 border border-gray-200 bg-gray-50 rounded-lg text-gray-700 text-sm md:text-base">
                        {formatRole(profileData.role)}
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3 md:p-4 border border-gray-200">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <p className="text-xs md:text-sm text-gray-600">
                          Untuk memperbarui informasi profil, klik tombol <strong>`Edit Profil`</strong> di atas.
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Semua data dapat diperbarui kecuali role.
                        </p>
                      </div>
                      <button 
                        onClick={handleOpenEditModal}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors text-sm w-full sm:w-auto"
                      >
                        Edit Profil
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Modal Edit Profil */}
          {isEditModalOpen && (
            <div className="fixed inset-0 z-50">
              <div 
                className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                onClick={handleCloseEditModal}
              />
              
              <div className="fixed inset-0 overflow-y-auto">
                <div className="flex min-h-full items-center justify-center p-2 md:p-4">
                  <div className="relative bg-white rounded-lg md:rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden border border-gray-200">
                    <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm px-4 md:px-6 pt-4 md:pt-6 pb-3 md:pb-4 border-b border-gray-200">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1 min-w-0">
                          <h2 className="text-lg md:text-2xl font-bold text-gray-900 mb-1 md:mb-2">
                            Edit Profil
                          </h2>
                          <p className="text-gray-600 text-xs md:text-sm leading-relaxed">
                            Perbarui informasi profil Anda
                          </p>
                        </div>
                        <button
                          onClick={handleCloseEditModal}
                          className="flex-shrink-0 rounded-lg p-1 md:p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors -mt-1 -mr-1 md:-mt-1 md:-mr-2"
                        >
                          <X className="w-4 h-4 md:w-5 md:h-5" />
                        </button>
                      </div>
                    </div>

                    <div className="overflow-y-auto max-h-[calc(90vh-120px)] md:max-h-[calc(90vh-140px)]">
                      {modalError && (
                        <div className="mx-4 md:mx-6 mt-4 md:mt-6">
                          <div className="bg-red-50 border border-red-200 text-red-700 px-3 md:px-4 py-2 md:py-3 rounded-lg">
                            <div className="flex items-center">
                              <AlertTriangle className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                              <span className="text-xs md:text-sm">{modalError}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="px-4 md:px-6 py-4 md:py-5 space-y-4 md:space-y-5">
                        <div className="space-y-3 md:space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                              Nama Lengkap *
                            </label>
                            <input
                              type="text"
                              name="fullName"
                              value={editFormData.fullName}
                              onChange={handleEditFormChange}
                              className="w-full px-3 py-2.5 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm md:text-base"
                              placeholder="Masukkan nama lengkap"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                              Email *
                            </label>
                            <input
                              type="email"
                              name="email"
                              value={editFormData.email}
                              onChange={handleEditFormChange}
                              className="w-full px-3 py-2.5 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm md:text-base"
                              placeholder="email@contoh.com"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                              Nomor Telepon *
                            </label>
                            <input
                              type="text"
                              name="phone"
                              value={editFormData.phone}
                              onChange={handleEditFormChange}
                              className="w-full px-3 py-2.5 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm md:text-base"
                              placeholder="08123456789"
                              maxLength={13}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Masukkan nomor telepon tanpa kode negara dan spasi.
                            </p>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                              Role
                            </label>
                            <input
                              type="text"
                              value={formatRole(profileData.role)}
                              disabled
                              className="w-full px-3 py-2.5 md:px-4 md:py-3 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed text-sm md:text-base"
                            />
                            <p className="text-xs text-gray-500 mt-1">Role tidak dapat diubah</p>
                          </div>
                        </div>

                        <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 md:p-4">
                          <h4 className="text-xs md:text-sm font-medium text-blue-900 mb-1 md:mb-2">Informasi</h4>
                          <p className="text-xs text-blue-700">
                            Semua field yang bertanda * wajib diisi. Pastikan data yang Anda masukkan valid.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="sticky bottom-0 bg-white border-t border-gray-200 px-4 md:px-6 py-3 md:py-4">
                      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 md:gap-3">
                        <button
                          onClick={handleCloseEditModal}
                          disabled={loading.update}
                          className="px-3 py-2 md:px-4 md:py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 text-sm md:text-base"
                        >
                          Batal
                        </button>
                        <button
                          onClick={handleSaveProfile}
                          disabled={loading.update || 
                            (editFormData.fullName === originalProfileData.fullName && 
                             editFormData.email === originalProfileData.email && 
                             editFormData.phone === originalProfileData.phone)}
                          className="px-3 py-2 md:px-4 md:py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
                        >
                          {loading.update ? (
                            <>
                              <Loader2 className="w-3 h-3 md:w-4 md:h-4 animate-spin" />
                              Menyimpan...
                            </>
                          ) : (
                            <>
                              <Save className="w-3 h-3 md:w-4 md:h-4" />
                              Simpan Perubahan
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}