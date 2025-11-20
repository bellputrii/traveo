'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import LayoutNavbar from '@/components/public/LayoutNavbar'
import { Users, FolderOpen, Shield, BookOpen, UserCheck, ArrowRight, Ticket, Star } from 'lucide-react'
import Footer from '@/components/public/Footer'

interface AdminStats {
  totalTeachers: number;
  totalCategories: number;
  totalClasses: number;
  pendingTeachers: number;
  totalRedeemCodes: number;
  activeRedeemCodes: number;
  totalRedeemed: number;
  totalReviews: number;
  pendingReviews: number;
  approvedReviews: number;
}

interface Teacher {
  id: string;
  name: string;
  email: string;
  username: string;
  profileImage: string;
  roleId: number;
  telp: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  specialization: string | null;
  bio: string | null;
}

interface Category {
  id: number;
  name: string;
}

interface RedeemCode {
  id: number;
  code: string;
  durationDays: number;
  maxUses: number;
  usedCount: number;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Review {
  id: number;
  userId: string;
  classId: number;
  rating: number;
  comment: string;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
  User: {
    id: string;
    name: string;
    username: string;
    profileImage: string;
  };
  Class: {
    id: number;
    name: string;
  };
}

interface ApiResponseTeachers {
  success: boolean;
  message: string;
  data: Teacher[];
  meta: {
    totalItems: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}

interface ApiResponseCategories {
  success: boolean;
  message: string;
  data: Category[];
}

interface ApiResponseRedeemCodes {
  success: boolean;
  message: string;
  data: RedeemCode[];
  meta: {
    totalItems: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}

interface ApiResponseReviews {
  success: boolean;
  message: string;
  data: Review[];
  meta: {
    totalItems: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}

export default function AdminDashboard() {
  const router = useRouter()
  const [isVisible, setIsVisible] = useState(false)
  const [stats, setStats] = useState<AdminStats>({
    totalTeachers: 0,
    totalCategories: 0,
    totalClasses: 0,
    pendingTeachers: 0,
    totalRedeemCodes: 0,
    activeRedeemCodes: 0,
    totalRedeemed: 0,
    totalReviews: 0,
    pendingReviews: 0,
    approvedReviews: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch real data from APIs
  const fetchAdminStats = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const token = localStorage.getItem("token")
      
      if (!token) {
        setError('Token tidak ditemukan. Silakan login kembali.')
        setLoading(false)
        return
      }

      // Fetch teachers data
      const teachersResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/teachers`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      })

      if (!teachersResponse.ok) {
        if (teachersResponse.status === 401) {
          localStorage.removeItem("token")
          setError('Sesi telah berakhir. Silakan login kembali.')
          setTimeout(() => router.push('/auth/login'), 2000)
          return
        }
        throw new Error(`HTTP error! status: ${teachersResponse.status}`)
      }

      const teachersData: ApiResponseTeachers = await teachersResponse.json()
      
      // Fetch categories data
      const categoriesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      })

      if (!categoriesResponse.ok) {
        if (categoriesResponse.status === 401) {
          localStorage.removeItem("token")
          setError('Sesi telah berakhir. Silakan login kembali.')
          setTimeout(() => router.push('/auth/login'), 2000)
          return
        }
        throw new Error(`HTTP error! status: ${categoriesResponse.status}`)
      }

      const categoriesData: ApiResponseCategories = await categoriesResponse.json()

      // Fetch redeem codes data
      const redeemCodesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/redeem/admin`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      })

      if (!redeemCodesResponse.ok) {
        if (redeemCodesResponse.status === 401) {
          localStorage.removeItem("token")
          setError('Sesi telah berakhir. Silakan login kembali.')
          setTimeout(() => router.push('/auth/login'), 2000)
          return
        }
        throw new Error(`HTTP error! status: ${redeemCodesResponse.status}`)
      }

      const redeemCodesData: ApiResponseRedeemCodes = await redeemCodesResponse.json()

      // Fetch reviews data
      const reviewsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reviews/admin/all?search`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      })

      if (!reviewsResponse.ok) {
        if (reviewsResponse.status === 401) {
          localStorage.removeItem("token")
          setError('Sesi telah berakhir. Silakan login kembali.')
          setTimeout(() => router.push('/auth/login'), 2000)
          return
        }
        throw new Error(`HTTP error! status: ${reviewsResponse.status}`)
      }

      const reviewsData: ApiResponseReviews = await reviewsResponse.json()

      // Calculate stats from real data
      if (teachersData.success && categoriesData.success && redeemCodesData.success && reviewsData.success) {
        const totalTeachers = teachersData.data.length
        const pendingTeachers = teachersData.data.filter(teacher => teacher.status === 'INACTIVE').length
        const totalCategories = categoriesData.data.length
        const totalRedeemCodes = redeemCodesData.data.length
        const totalRedeemed = redeemCodesData.data.reduce((sum, code) => sum + code.usedCount, 0)
        const activeRedeemCodes = redeemCodesData.data.filter(code => 
          code.usedCount < code.maxUses && 
          (!code.expiresAt || new Date(code.expiresAt) > new Date())
        ).length
        
        const totalReviews = reviewsData.data.length
        const pendingReviews = reviewsData.data.filter(review => !review.isApproved).length
        const approvedReviews = totalReviews - pendingReviews

        setStats({
          totalTeachers,
          totalCategories,
          totalClasses: 0, // You can replace this with actual classes data if available
          pendingTeachers,
          totalRedeemCodes,
          totalRedeemed,
          activeRedeemCodes,
          totalReviews,
          pendingReviews,
          approvedReviews
        })
      } else {
        throw new Error('Gagal memuat data statistik')
      }

    } catch (err) {
      console.error('Error fetching admin stats:', err)
      setError('Gagal memuat data statistik. Silakan coba lagi.')
      
      // Fallback to sample data if API fails
      setStats({
        totalTeachers: 45,
        totalCategories: 8,
        totalClasses: 156,
        pendingTeachers: 3,
        totalRedeemCodes: 12,
        activeRedeemCodes: 8,
        totalRedeemed: 45,
        totalReviews: 23,
        pendingReviews: 5,
        approvedReviews: 18
      })
    } finally {
      setLoading(false)
    }
  }

  // Data untuk card admin - dengan data real
  const adminCards = [
    {
      id: 1,
      title: "Kelola Teacher",
      description: "Kelola data teacher, verifikasi akun, dan atur akses teacher",
      icon: <Users className="w-8 h-8" />,
      color: "bg-blue-600",
      iconColor: "text-blue-600",
      bgColor: "bg-blue-100",
      borderColor: "border-blue-200",
      buttonColor: "bg-blue-600 hover:bg-blue-700",
      href: "/teacher",
      stats: [
        { label: "Total Teacher", value: stats.totalTeachers.toString() },
        { label: "Pending Verification", value: stats.pendingTeachers.toString() },
        { label: "Active", value: (stats.totalTeachers - stats.pendingTeachers).toString() }
      ]
    },
    {
      id: 2,
      title: "Kelola Kategori",
      description: "Kelola kategori kelas, buat kategori baru, dan atur hierarki",
      icon: <FolderOpen className="w-8 h-8" />,
      color: "bg-green-600",
      iconColor: "text-green-600",
      bgColor: "bg-green-100",
      borderColor: "border-green-200",
      buttonColor: "bg-green-600 hover:bg-green-700",
      href: "/categories",
      stats: [
        { label: "Total Kategori", value: stats.totalCategories.toString() },
        { label: "Kelas Terdaftar", value: stats.totalClasses.toString() },
        { label: "Aktif", value: stats.totalCategories.toString() }
      ]
    },
    {
      id: 3,
      title: "Kelola Redeem Code",
      description: "Buat dan kelola kode redeem untuk akses kelas premium",
      icon: <Ticket className="w-8 h-8" />,
      color: "bg-purple-600",
      iconColor: "text-purple-600",
      bgColor: "bg-purple-100",
      borderColor: "border-purple-200",
      buttonColor: "bg-purple-600 hover:bg-purple-700",
      href: "/redeem",
      stats: [
        { label: "Total Kode", value: stats.totalRedeemCodes.toString() },
        { label: "Aktif", value: stats.activeRedeemCodes.toString() },
        { label: "Total Ditukar", value: stats.totalRedeemed.toString() }
      ]
    },
    {
      id: 4,
      title: "Kelola Review",
      description: "Kelola review kelas, approve dan hapus review yang tidak sesuai",
      icon: <Star className="w-8 h-8" />,
      color: "bg-amber-600",
      iconColor: "text-amber-600",
      bgColor: "bg-amber-100",
      borderColor: "border-amber-200",
      buttonColor: "bg-amber-600 hover:bg-amber-700",
      href: "/admin-review",
      stats: [
        { label: "Total Review", value: stats.totalReviews.toString() },
        { label: "Pending", value: stats.pendingReviews.toString() },
        { label: "Approved", value: stats.approvedReviews.toString() }
      ]
    }
  ]

  // Statistik utama - dengan data real
  const mainStats = [
    { 
      value: stats.totalTeachers.toString(), 
      label: 'Total Teacher', 
      icon: <Users className="w-6 h-6" />,
      color: 'bg-blue-500',
      textColor: 'text-blue-700'
    },
    { 
      value: stats.totalCategories.toString(), 
      label: 'Kategori Kelas', 
      icon: <FolderOpen className="w-6 h-6" />,
      color: 'bg-green-500',
      textColor: 'text-green-700'
    },
    { 
      value: stats.pendingTeachers.toString(), 
      label: 'Teacher Pending', 
      icon: <UserCheck className="w-6 h-6" />,
      color: 'bg-orange-500',
      textColor: 'text-orange-700'
    },
    { 
      value: stats.pendingReviews.toString(), 
      label: 'Review Pending', 
      icon: <Star className="w-6 h-6" />,
      color: 'bg-amber-500',
      textColor: 'text-amber-700'
    },
  ]

  useEffect(() => {
    setIsVisible(true)
    fetchAdminStats()
  }, [])

  return (
    <>
      <LayoutNavbar>
        <div className={`flex flex-col gap-8 md:gap-12 px-4 sm:px-6 pt-16 md:pt-20 transition-all duration-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          
          {/* Header Section */}
          <section className="w-full max-w-7xl mx-auto">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="bg-purple-100 p-3 rounded-xl">
                  <Shield className="w-8 h-8 text-purple-600" />
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
                  Admin Dashboard
                </h1>
              </div>
              <p className="text-gray-700 max-w-2xl mx-auto text-base">
                Kelola teacher, kategori kelas, redeem code, dan review platform Ambil Prestasi
              </p>
            </div>

            {/* Error State */}
            {error && (
              <div className="mb-4 bg-yellow-500 border border-yellow-600 rounded-lg p-3">
                <p className="text-white font-medium text-sm">{error}</p>
                {error.includes('login kembali') && (
                  <button 
                    onClick={() => router.push('/auth/login')}
                    className="mt-2 bg-white text-yellow-600 px-3 py-1 rounded text-sm hover:bg-gray-100 transition-colors"
                  >
                    Login Kembali
                  </button>
                )}
              </div>
            )}
          </section>

          {/* Stats Section */}
          <section className="w-full max-w-7xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
              {mainStats.map((stat, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg p-4 shadow-md border border-gray-200 transition-colors hover:shadow-lg cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg text-white ${stat.color}`}>
                      {stat.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{stat.value}</h3>
                      <p className="text-gray-700 text-sm">{stat.label}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Loading State */}
          {loading && (
            <section className="w-full max-w-7xl mx-auto">
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                <p className="text-gray-600 mt-4">Memuat data dashboard...</p>
              </div>
            </section>
          )}

          {/* Admin Cards Section */}
          {!loading && (
            <section className="w-full max-w-7xl mx-auto">
              <div className="mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                  Management Panel
                </h2>
                <p className="text-gray-700 text-sm">
                  Kelola teacher, kategori kelas, redeem code, dan review platform
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {adminCards.map((card) => (
                  <div 
                    key={card.id}
                    className={`bg-white rounded-lg overflow-hidden shadow-md border ${card.borderColor} transition-colors hover:shadow-lg cursor-pointer`}
                    onClick={() => router.push(card.href)}
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className={`p-2 rounded-lg ${card.bgColor}`}>
                          <div className={card.iconColor}>
                            {card.icon}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${card.bgColor} ${card.iconColor}`}>
                            Kelola
                          </div>
                        </div>
                      </div>
                      
                      <h3 className="font-bold text-lg text-gray-900 mb-2">
                        {card.title}
                      </h3>
                      
                      <p className="text-gray-600 text-sm mb-4">
                        {card.description}
                      </p>
                      
                      {/* Card Stats dengan Data Real */}
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        {card.stats.map((stat, index) => (
                          <div key={index} className="text-center">
                            <div className="text-base font-bold text-gray-900">{stat.value}</div>
                            <div className="text-xs text-gray-500">{stat.label}</div>
                          </div>
                        ))}
                      </div>

                      {/* Action Button */}
                      <div className={`w-full ${card.buttonColor} text-white py-2 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2`}>
                        <span>Kelola</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </LayoutNavbar>
      <Footer/>
    </>
  )
}