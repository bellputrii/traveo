'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import LayoutNavbar from '@/components/public/LayoutNavbar'
import Footer from '@/components/public/Footer'
import { CheckCircle, Crown, Sparkles, Award, Clock, User, Mail, Calendar, AlertCircle, ArrowRight, Edit, Save, X, Upload, MapPin, BookOpen, Star, Phone, Globe, Cake } from 'lucide-react'

interface UserProfile {
  id: string
  email: string
  username: string
  name: string
  profileImage: string
  telp: string | null
  bio: string | null
  verified_at: string
  role: string
  createdAt: string
  updatedAt: string
  subscriptionExpiredAt?: string | null
  specialization?: string | null
}

interface SubscriptionStatus {
  success: boolean
  message: string
  data: UserProfile
}

export default function ProfilePage() {
  const router = useRouter()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [redeemCode, setRedeemCode] = useState('')
  const [redeemLoading, setRedeemLoading] = useState(false)
  const [redeemMessage, setRedeemMessage] = useState('')
  const [showRedeemForm, setShowRedeemForm] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [updateLoading, setUpdateLoading] = useState(false)
  const [updateMessage, setUpdateMessage] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    telp: '',
    bio: '',
    specialization: '',
    profileImage: null as File | null
  })
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  // Fetch user profile
  const fetchUserProfile = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      
      if (!token) {
        setError('Silakan login terlebih dahulu')
        setLoading(false)
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/profile`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result: SubscriptionStatus = await response.json()
      
      if (result.success) {
        setUserProfile(result.data)
        // Set form data untuk edit mode
        setFormData({
          name: result.data.name || '',
          username: result.data.username || '',
          telp: result.data.telp || '',
          bio: result.data.bio || '',
          specialization: result.data.specialization || '',
          profileImage: null
        })
        setError(null)
      } else {
        throw new Error(result.message || 'Gagal memuat profile')
      }
    } catch (err) {
      console.error('Error fetching profile:', err)
      setError('Gagal memuat data profile. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  // Handle redeem code (hanya untuk student)
  const handleRedeemCode = async () => {
    if (!redeemCode.trim()) {
      setRedeemMessage('Masukkan kode redeem')
      return
    }

    setRedeemLoading(true)
    setRedeemMessage('')

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        setRedeemMessage('Silakan login terlebih dahulu')
        setRedeemLoading(false)
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/redeem`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          code: redeemCode
        }),
      })

      const result = await response.json()

      if (result.success) {
        setRedeemMessage('Subscription berhasil diaktifkan!')
        setRedeemCode('')
        setShowRedeemForm(false)
        // Refresh profile data
        await fetchUserProfile()
      } else {
        setRedeemMessage(result.message || 'Gagal mengaktifkan subscription')
      }
    } catch (error) {
      console.error('Error redeeming code:', error)
      setRedeemMessage('Terjadi kesalahan saat mengaktifkan subscription')
    } finally {
      setRedeemLoading(false)
    }
  }

  // Handle update profile
  const handleUpdateProfile = async () => {
    if (!formData.name.trim()) {
      setUpdateMessage('Nama wajib diisi')
      return
    }

    setUpdateLoading(true)
    setUpdateMessage('')

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        setUpdateMessage('Silakan login terlebih dahulu')
        setUpdateLoading(false)
        return
      }

      const submitData = new FormData()
      submitData.append('name', formData.name.trim())
      submitData.append('username', formData.username.trim())
      
      if (formData.telp) {
        submitData.append('telp', formData.telp.trim())
      }
      
      if (formData.bio) {
        submitData.append('bio', formData.bio.trim())
      }
      
      // Hanya kirim specialization untuk teacher
      if (userProfile?.role === 'Teacher' && formData.specialization) {
        submitData.append('specialization', formData.specialization.trim())
      }
      
      if (formData.profileImage) {
        submitData.append('profileImage', formData.profileImage)
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/profile`, {
        method: "PATCH",
        headers:
         {
          "Authorization": `Bearer ${token}`,
        },
        body: submitData
      })

      const result = await response.json()

      if (result.success) {
        setUpdateMessage('Profile berhasil diperbarui!')
        setEditMode(false)
        // Refresh profile data
        await fetchUserProfile()
      } else {
        setUpdateMessage(result.message || 'Gagal memperbarui profile')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      setUpdateMessage('Terjadi kesalahan saat memperbarui profile')
    } finally {
      setUpdateLoading(false)
    }
  }

  // Handle image upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setUpdateMessage('Ukuran file maksimal 2MB')
        return
      }

      if (!file.type.startsWith('image/')) {
        setUpdateMessage('File harus berupa gambar')
        return
      }

      setFormData(prev => ({
        ...prev,
        profileImage: file
      }))
      
      // Create URL untuk preview
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) {
          setImagePreview(e.target.result as string)
        }
      }
      reader.onerror = () => {
        setUpdateMessage('Gagal memuat gambar')
      }
      reader.readAsDataURL(file)
    }
  }

  // Reset edit mode
  const resetEditMode = () => {
    setEditMode(false)
    setImagePreview(null)
    if (userProfile) {
      setFormData({
        name: userProfile.name || '',
        username: userProfile.username || '',
        telp: userProfile.telp || '',
        bio: userProfile.bio || '',
        specialization: userProfile.specialization || '',
        profileImage: null
      })
    }
  }

  useEffect(() => {
    fetchUserProfile()
  }, [])

  // Cek status subscription (hanya untuk student)
  const hasActiveSubscription = userProfile?.role === 'Student' && 
    userProfile?.subscriptionExpiredAt && 
    new Date(userProfile.subscriptionExpiredAt) > new Date()

  const subscriptionDaysLeft = userProfile?.subscriptionExpiredAt ? 
    Math.ceil((new Date(userProfile.subscriptionExpiredAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0

  // Role-based configurations
  const roleConfig = {
    Admin: {
      color: 'purple',
      icon: Crown,
      description: 'Administrator Sistem'
    },
    Teacher: {
      color: 'blue',
      icon: BookOpen,
      description: 'Pengajar'
    },
    Student: {
      color: 'green',
      icon: User,
      description: 'Pelajar'
    }
  }

  const currentRoleConfig = roleConfig[userProfile?.role as keyof typeof roleConfig] || roleConfig.Student

  if (loading) {
    return (
      <LayoutNavbar>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
          <span className="ml-3 text-gray-600">Memuat profile...</span>
        </div>
      </LayoutNavbar>
    )
  }

  if (error && !userProfile) {
    return (
      <LayoutNavbar>
        <div className="flex flex-col justify-center items-center min-h-screen">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md mx-auto">
            <p className="text-yellow-700 font-medium">{error}</p>
            <button 
              onClick={() => router.push('/auth/login')}
              className="mt-3 bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors"
            >
              Login Kembali
            </button>
          </div>
        </div>
      </LayoutNavbar>
    )
  }

  return (
    <>
      <LayoutNavbar>
        <div className="pt-16 md:pt-20 min-h-screen bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Profile Saya</h1>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Kelola informasi profile dan {userProfile?.role === 'Student' ? 'status langganan' : 'informasi akun'} Anda
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Sidebar - Profile Card */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  {/* Profile Header */}
                  <div className="text-center mb-6">
                    <div className="relative inline-block mb-4">
                      {imagePreview || userProfile?.profileImage ? (
                        <img
                          src={imagePreview || userProfile?.profileImage}
                          alt="Profile"
                          className="w-24 h-24 rounded-full object-cover mx-auto border-2 border-gray-200"
                        />
                      ) : (
                        <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto">
                          {userProfile?.name?.charAt(0) || 'U'}
                        </div>
                      )}
                      {editMode && (
                        <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-1 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
                          <Upload className="w-4 h-4" />
                          <input 
                            type="file" 
                            className="hidden" 
                            accept="image/*"
                            onChange={handleImageChange}
                          />
                        </label>
                      )}
                    </div>
                    
                    {editMode ? (
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="text-xl font-bold text-gray-900 bg-transparent border-b border-gray-300 focus:outline-none focus:border-blue-500 text-center w-full mb-2"
                        placeholder="Nama lengkap"
                      />
                    ) : (
                      <h2 className="text-xl font-bold text-gray-900 mb-2">{userProfile?.name}</h2>
                    )}
                    
                    {editMode ? (
                      <input
                        type="text"
                        value={formData.username}
                        onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                        className="text-gray-600 text-sm bg-transparent border-b border-gray-300 focus:outline-none focus:border-blue-500 text-center w-full"
                        placeholder="Username"
                      />
                    ) : (
                      <p className="text-gray-600 text-sm">@{userProfile?.username}</p>
                    )}
                  </div>

                  {/* Role Badge */}
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-${currentRoleConfig.color}-100 text-${currentRoleConfig.color}-800 mb-4 mt-4`}>
                    <currentRoleConfig.icon className="w-4 h-4 mr-1" />
                    {userProfile?.role}
                  </div>

                  {/* Edit Mode Actions */}
                  {editMode && (
                    <div className="mt-6 flex gap-3">
                      <button
                        onClick={resetEditMode}
                        className="flex-1 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors font-medium border border-gray-300 rounded-lg hover:border-gray-400"
                      >
                        <X className="w-4 h-4 inline mr-1" />
                        Batal
                      </button>
                      <button
                        onClick={handleUpdateProfile}
                        disabled={updateLoading}
                        className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {updateLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Menyimpan...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            Simpan
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Update Message */}
                  {updateMessage && (
                    <div className={`mt-4 p-3 rounded-lg text-sm ${
                      updateMessage.includes('berhasil') 
                        ? 'bg-green-100 text-green-700 border border-green-200' 
                        : 'bg-red-100 text-red-700 border border-red-200'
                    }`}>
                      {updateMessage}
                    </div>
                  )}
                </div>
              </div>

              {/* Main Content - Contact Information */}
              <div className="lg:col-span-3">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Informasi Kontak</h3>
                    {!editMode && (
                      <button 
                        onClick={() => setEditMode(true)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left Column - Personal Info */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-4">INFORMASI PRIBADI</h4>
                      
                      <div className="space-y-6">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <User className="w-4 h-4 text-gray-500" />
                            <p className="font-medium text-gray-900">Username</p>
                          </div>
                          <p className="text-sm text-gray-600 ml-6">@{userProfile?.username}</p>
                        </div>
                        
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Mail className="w-4 h-4 text-gray-500" />
                            <p className="font-medium text-gray-900">Email</p>
                          </div>
                          <p className="text-sm text-gray-600 ml-6">{userProfile?.email}</p>
                        </div>
                        
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Phone className="w-4 h-4 text-gray-500" />
                            <p className="font-medium text-gray-900">Telepon</p>
                          </div>
                          {editMode ? (
                            <input
                              type="text"
                              value={formData.telp}
                              onChange={(e) => setFormData(prev => ({ ...prev, telp: e.target.value }))}
                              className="text-sm text-gray-600 bg-transparent border-b border-gray-300 focus:outline-none focus:border-blue-500 w-full ml-6"
                              placeholder="Nomor telepon"
                            />
                          ) : (
                            <p className="text-sm text-gray-600 ml-6">{userProfile?.telp || 'Belum ada nomor telepon'}</p>
                          )}
                        </div>
                        
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <p className="font-medium text-gray-900">Bergabung</p>
                          </div>
                          <p className="text-sm text-gray-600 ml-6">
                            {new Date(userProfile?.createdAt || '').toLocaleDateString('id-ID', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Right Column - Role & Specialization */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-4">INFORMASI AKUN</h4>
                      
                      <div className="space-y-6">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <currentRoleConfig.icon className="w-4 h-4 text-gray-500" />
                            <p className="font-medium text-gray-900">Role</p>
                          </div>
                          <div className="ml-6">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-${currentRoleConfig.color}-100 text-${currentRoleConfig.color}-800`}>
                              {userProfile?.role}
                            </span>
                            <p className="text-xs text-gray-500 mt-1">{currentRoleConfig.description}</p>
                          </div>
                        </div>
                        
                        {/* Specialization untuk Teacher */}
                        {userProfile?.role === 'Teacher' && (
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <BookOpen className="w-4 h-4 text-gray-500" />
                              <p className="font-medium text-gray-900">Spesialisasi</p>
                            </div>
                            {editMode ? (
                              <input
                                type="text"
                                value={formData.specialization}
                                onChange={(e) => setFormData(prev => ({ ...prev, specialization: e.target.value }))}
                                className="text-sm text-gray-600 bg-transparent border-b border-gray-300 focus:outline-none focus:border-blue-500 w-full ml-6"
                                placeholder="Contoh: UI/UX Design, Web Development"
                              />
                            ) : (
                              <p className="text-sm text-gray-600 ml-6">{userProfile?.specialization || 'Belum ada spesialisasi'}</p>
                            )}
                          </div>
                        )}
                        
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle className="w-4 h-4 text-gray-500" />
                            <p className="font-medium text-gray-900">Status Verifikasi</p>
                          </div>
                          <div className="ml-6">
                            {userProfile?.verified_at ? (
                              <div className="flex items-center gap-2">
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Terverifikasi
                                </span>
                                <span className="text-xs text-gray-500">
                                  {new Date(userProfile.verified_at).toLocaleDateString('id-ID')}
                                </span>
                              </div>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                Belum Terverifikasi
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Subscription Status untuk Student */}
                        {userProfile?.role === 'Student' && (
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Crown className="w-4 h-4 text-gray-500" />
                              <p className="font-medium text-gray-900">Status Langganan</p>
                            </div>
                            <div className="ml-6">
                              {hasActiveSubscription ? (
                                <div className="space-y-1">
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    Premium Aktif
                                  </span>
                                  <p className="text-xs text-gray-500">
                                    Berlaku hingga {new Date(userProfile!.subscriptionExpiredAt!).toLocaleDateString('id-ID')}
                                  </p>
                                </div>
                              ) : (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                  Belum Berlangganan
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                        
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <p className="font-medium text-gray-900">Terakhir Diperbarui</p>
                          </div>
                          <p className="text-sm text-gray-600 ml-6">
                            {new Date(userProfile?.updatedAt || '').toLocaleDateString('id-ID', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Subscription Section - Hanya untuk Student */}
                {userProfile?.role === 'Student' && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Status Langganan</h3>
                    
                    {hasActiveSubscription ? (
                      <div className="space-y-4">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <div className="flex items-center gap-3">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                            <div>
                              <h4 className="font-semibold text-green-900">Langganan Aktif</h4>
                              <p className="text-green-700 text-sm">
                                Berlaku hingga {new Date(userProfile!.subscriptionExpiredAt!).toLocaleDateString('id-ID', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold text-blue-900">Sisa Waktu</h4>
                              <p className="text-blue-700 text-sm">
                                {subscriptionDaysLeft} hari lagi
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-blue-600">{subscriptionDaysLeft}</p>
                              <p className="text-blue-600 text-sm">hari</p>
                            </div>
                          </div>
                        </div>

                        <button 
                          onClick={() => router.push('/elearning')}
                          className="w-full bg-blue-700 text-white py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors flex items-center justify-center gap-2"
                        >
                          <ArrowRight className="w-5 h-5" />
                          Mulai Belajar Sekarang
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {/* Warning Message */}
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <div className="flex items-center gap-3">
                            <AlertCircle className="w-6 h-6 text-yellow-600" />
                            <div>
                              <h4 className="font-semibold text-yellow-900">Belum Berlangganan</h4>
                              <p className="text-yellow-700 text-sm">
                                Anda perlu berlangganan untuk mengakses semua kursus premium
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Redeem Code Section */}
                        {!showRedeemForm ? (
                          <div className="text-center space-y-4">
                            <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-6 text-white">
                              <Crown className="w-12 h-12 mx-auto mb-3" />
                              <h4 className="font-bold text-lg mb-2">Akses Semua Kursus Premium</h4>
                              <p className="text-purple-100 text-sm">
                                Redeem kode yang Anda dapatkan setelah pembelian paket
                              </p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3">
                              <button 
                                onClick={() => setShowRedeemForm(true)}
                                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                              >
                                <Award className="w-5 h-5" />
                                Redeem Kode
                              </button>
                              <a
                                href="https://lynk.id/ambilprestasi"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                              >
                                <Sparkles className="w-5 h-5" />
                                Lihat Paket
                              </a>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <h4 className="font-semibold text-gray-900">Masukkan Kode Redeem</h4>
                            
                            <div className="space-y-3">
                              <div>
                                <label htmlFor="redeemCode" className="block text-sm font-medium text-gray-700 mb-2">
                                  Kode Redeem
                                </label>
                                <input
                                  type="text"
                                  id="redeemCode"
                                  value={redeemCode}
                                  onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
                                  placeholder="Contoh: PYQ01AIK"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  disabled={redeemLoading}
                                />
                              </div>

                              {redeemMessage && (
                                <div className={`p-3 rounded-lg text-sm ${
                                  redeemMessage.includes('berhasil') 
                                    ? 'bg-green-100 text-green-700 border border-green-200' 
                                    : 'bg-red-100 text-red-700 border border-red-200'
                                }`}>
                                  {redeemMessage}
                                </div>
                              )}
                            </div>

                            <div className="flex gap-3">
                              <button
                                onClick={() => {
                                  setShowRedeemForm(false)
                                  setRedeemMessage('')
                                  setRedeemCode('')
                                }}
                                className="flex-1 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors font-medium border border-gray-300 rounded-lg hover:border-gray-400"
                                disabled={redeemLoading}
                              >
                                Batal
                              </button>
                              <button
                                onClick={handleRedeemCode}
                                disabled={redeemLoading}
                                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                              >
                                {redeemLoading ? (
                                  <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Memproses...
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="w-4 h-4" />
                                    Aktifkan Subscription
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Info Paket */}
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900 mb-2">Tidak memiliki kode?</h4>
                          <p className="text-gray-600 text-sm mb-3">
                            Beli paket berlangganan untuk mendapatkan kode redeem dan akses semua kursus premium
                          </p>
                          <a
                            href="https://lynk.id/ambilprestasi"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-1"
                          >
                            Lihat paket berlangganan <ArrowRight className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Dashboard untuk Teacher dan Admin */}
                {(userProfile?.role === 'Teacher' || userProfile?.role === 'Admin') && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      {userProfile?.role === 'Teacher' ? 'Dashboard Pengajar' : 'Dashboard Admin'}
                    </h3>
                    
                    <div className="space-y-4">
                      <div className={`bg-${currentRoleConfig.color}-50 border border-${currentRoleConfig.color}-200 rounded-lg p-4`}>
                        <div className="flex items-center gap-3">
                          <currentRoleConfig.icon className={`w-6 h-6 text-${currentRoleConfig.color}-600`} />
                          <div>
                            <h4 className={`font-semibold text-${currentRoleConfig.color}-900`}>
                              {userProfile?.role === 'Teacher' ? 'Status Pengajar' : 'Status Administrator'}
                            </h4>
                            <p className={`text-${currentRoleConfig.color}-700 text-sm`}>
                              {userProfile?.role === 'Teacher' 
                                ? 'Anda memiliki akses penuh untuk mengelola kelas dan materi pembelajaran'
                                : 'Anda memiliki akses penuh untuk mengelola sistem dan pengguna'
                              }
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-1 gap-2">
                        {userProfile?.role === 'Teacher' ? (
                          <>
                            <button 
                              onClick={() => router.push('/teacher/classes')}
                              className="bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                            >
                              <BookOpen className="w-5 h-5" />
                              Kelola Kelas
                            </button>
                          </>
                        ) : (
                          <>
                            <button 
                              onClick={() => router.push('/admin/users')}
                              className="bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                            >
                              <User className="w-5 h-5" />
                              Kelola Pengguna
                            </button>
                            <button 
                              onClick={() => router.push('/admin/dashboard')}
                              className="border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                            >
                              <Crown className="w-5 h-5" />
                              Dashboard Admin
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </LayoutNavbar>
      <Footer />
    </>
  )
}