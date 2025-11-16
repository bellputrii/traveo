'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import LayoutNavbar from '@/components/public/LayoutNavbar'
import Footer from '@/components/public/Footer'
import { CheckCircle, Crown, Sparkles, Award, Clock, User, Mail, Calendar, AlertCircle, ArrowRight } from 'lucide-react'

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
  subscriptionExpiredAt: string | null
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

  // Handle redeem code
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

  useEffect(() => {
    fetchUserProfile()
  }, [])

  // Cek status subscription
  const hasActiveSubscription = userProfile?.subscriptionExpiredAt && 
    new Date(userProfile.subscriptionExpiredAt) > new Date()

  const subscriptionDaysLeft = userProfile?.subscriptionExpiredAt ? 
    Math.ceil((new Date(userProfile.subscriptionExpiredAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0

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
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Profile Saya</h1>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Kelola informasi profile dan status langganan Anda
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Sidebar - Info Profile */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="text-center mb-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                      {userProfile?.name?.charAt(0) || 'U'}
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">{userProfile?.name}</h2>
                    <p className="text-gray-600 text-sm">@{userProfile?.username}</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-gray-600">
                      <Mail className="w-5 h-5" />
                      <span className="text-sm">{userProfile?.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600">
                      <User className="w-5 h-5" />
                      <span className="text-sm capitalize">{userProfile?.role?.toLowerCase()}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600">
                      <Calendar className="w-5 h-5" />
                      <span className="text-sm">
                        Bergabung {new Date(userProfile?.createdAt || '').toLocaleDateString('id-ID')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Content - Status Langganan */}
              <div className="lg:col-span-2">
                {/* Status Langganan */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
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
                            <button 
                              onClick={() => router.push('/elearning')}
                              className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                            >
                              <Sparkles className="w-5 h-5" />
                              Lihat Paket
                            </button>
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
                        <button 
                          onClick={() => router.push('/elearning')}
                          className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-1"
                        >
                          Lihat paket berlangganan <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Info Tambahan */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Clock className="w-6 h-6 text-blue-600" />
                      <h4 className="font-semibold text-gray-900">Fitur Premium</h4>
                    </div>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Akses semua kursus premium
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Download materi PDF
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Video pembelajaran lengkap
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Sertifikat kelulusan
                      </li>
                    </ul>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Award className="w-6 h-6 text-purple-600" />
                      <h4 className="font-semibold text-gray-900">Keuntungan</h4>
                    </div>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Belajar fleksibel
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Mentor berpengalaman
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Update materi berkala
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Komunitas eksklusif
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </LayoutNavbar>
      <Footer />
    </>
  )
}