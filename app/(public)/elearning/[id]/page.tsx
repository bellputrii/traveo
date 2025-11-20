'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import LayoutNavbar from '@/components/public/LayoutNavbar'
import Footer from '@/components/public/Footer'
import { Play, FileText, Clock, Users, ArrowLeft, CheckCircle, Star, Award, Video, Download, ChevronDown, ChevronUp, File, VideoIcon, Sparkles, BookOpen, List, Edit, Trash2, Plus, MessageCircle, ThumbsUp, X, Save } from 'lucide-react'

interface Review {
  id: number
  userId: string
  classId: number
  rating: number
  comment: string
  isApproved: boolean
  createdAt: string
  updatedAt: string
  User: {
    id: string
    name: string
    username: string
    profileImage: string
  }
  Class: {
    id: number
    name: string
  }
}

interface Material {
  id: number
  title: string
  content: string
  xp: number
  thumnail_path: string
  video_path?: string
  materialFilePath?: string
  ringkasanPath?: string
  templatePath?: string
  createdAt: string
  updatedAt: string
  sectionId: number
}

interface Quiz {
  id: number
  title: string
  description: string | null
}

interface Section {
  id: number
  title: string
  description: string | null
  order: number
  Material: Material[]
  Quiz: Quiz[]
}

interface ClassDetail {
  id: number
  name: string
  description: string
  image_path: string
  categoryId: number
  image_path_relative: string
  sections: Section[]
  averageRating: number
  totalReviews: number
  studentCount?: number
  materialCount?: number
}

interface ApiResponse {
  success: boolean
  data: ClassDetail
  message?: string
}

interface MaterialApiResponse {
  success: boolean
  data: Material
  message?: string
}

interface ReviewResponse {
  success: boolean
  data: Review | null
  message?: string
}

interface ReviewsResponse {
  success: boolean
  data: Review[]
  message?: string
}

export default function ClassDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [classDetail, setClassDetail] = useState<ClassDetail | null>(null)
  const [materialDetail, setMaterialDetail] = useState<Material | null>(null)
  const [loading, setLoading] = useState(true)
  const [materialLoading, setMaterialLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expandedSections, setExpandedSections] = useState<number[]>([])
  const [selectedMaterialId, setSelectedMaterialId] = useState<number | null>(null)
  
  // Subscription state
  const [hasSubscription, setHasSubscription] = useState(false)
  const [subscriptionLoading, setSubscriptionLoading] = useState(true)
  
  // Review states
  const [reviews, setReviews] = useState<Review[]>([])
  const [userReview, setUserReview] = useState<Review | null>(null)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [reviewLoading, setReviewLoading] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: ''
  })

  // Fungsi untuk toggle section
  const toggleSection = (sectionId: number) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    )
  }

  // Check subscription status from profile
  const checkSubscriptionStatus = async () => {
    try {
      setSubscriptionLoading(true)
      const token = localStorage.getItem('token')
      if (!token) {
        setHasSubscription(false)
        return
      }
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/profile`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) {
        setHasSubscription(false)
        return
      }
      const result = await response.json()
      if (result.success && result.data) {
        const subscriptionExpiredAt = result.data.subscriptionExpiredAt
        if (subscriptionExpiredAt && new Date(subscriptionExpiredAt) > new Date()) {
          setHasSubscription(true)
        } else {
          setHasSubscription(false)
        }
      } else {
        setHasSubscription(false)
      }
    } catch (err) {
      console.error('Error checking subscription:', err)
      setHasSubscription(false)
    } finally {
      setSubscriptionLoading(false)
    }
  }

  // Fungsi untuk navigasi ke halaman pricing
  const handleGoToPricing = () => {
    router.push('/elearning')
  }

  // FUNGSI UNTUK MENGAMBIL DETAIL MATERI - SESUAI API BARU
  const fetchMaterialDetail = async (materialId: number) => {
    try {
      setMaterialLoading(true)
      setSelectedMaterialId(materialId)
      const token = localStorage.getItem("token")
      
      if (!token) {
        setError('Token tidak ditemukan. Silakan login kembali.')
        return
      }

      // Gunakan endpoint students/materials sesuai API baru
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/students/materials/${materialId}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        if (response.status === 404) {
          setError('Detail materi tidak ditemukan')
          return
        }
        if (response.status === 401) {
          setError('Token tidak valid. Silakan login kembali.')
          return
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result: MaterialApiResponse = await response.json()
      
      if (result.success) {
        setMaterialDetail(result.data)
        setError(null)
      } else {
        throw new Error(result.message || 'Gagal memuat detail materi')
      }
    } catch (err) {
      console.error('Error fetching material detail:', err)
      setError('Gagal memuat detail materi. Silakan coba lagi.')
    } finally {
      setMaterialLoading(false)
    }
  }

  // Fetch reviews untuk kelas ini
  const fetchReviews = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reviews/class/${params.id}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const result: ReviewsResponse = await response.json()
        if (result.success) {
          setReviews(result.data || [])
        }
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
    }
  }

  // Fetch user's review untuk kelas ini - DIPERBAIKI dengan pengecekan null
  const fetchUserReview = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reviews/my-review/class/${params.id}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const result: ReviewResponse = await response.json()
        if (result.success && result.data) {
          setUserReview(result.data)
          // Pre-fill form jika user sudah punya review
          setReviewForm({
            rating: result.data.rating,
            comment: result.data.comment
          })
        } else {
          // Reset jika tidak ada review
          setUserReview(null)
          setReviewForm({ rating: 5, comment: '' })
        }
      } else {
        // Reset jika response tidak ok
        setUserReview(null)
        setReviewForm({ rating: 5, comment: '' })
      }
    } catch (error) {
      console.error('Error fetching user review:', error)
      setUserReview(null)
      setReviewForm({ rating: 5, comment: '' })
    }
  }

  // Handle create/update review
  const handleSubmitReview = async () => {
    if (!reviewForm.comment.trim()) {
      alert('Komentar tidak boleh kosong')
      return
    }

    setReviewLoading(true)
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        alert('Silakan login terlebih dahulu')
        return
      }

      const url = userReview 
        ? `${process.env.NEXT_PUBLIC_API_URL}/reviews/${userReview.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/reviews/class/${params.id}`
      
      const method = userReview ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rating: reviewForm.rating,
          comment: reviewForm.comment
        })
      })

      const result = await response.json()

      if (result.success) {
        setShowReviewModal(false)
        // Refresh reviews
        await fetchUserReview()
        await fetchReviews()
        // Refresh class detail untuk update rating
        await fetchClassDetail()
      } else {
        alert(result.message || 'Gagal menyimpan review')
      }
    } catch (error) {
      console.error('Error submitting review:', error)
      alert('Terjadi kesalahan saat menyimpan review')
    } finally {
      setReviewLoading(false)
    }
  }

  // Handle delete review - DIPERBAIKI dengan confirmation dialog
  const handleDeleteReview = async () => {
    if (!userReview) return

    setDeleteLoading(true)

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        alert('Silakan login terlebih dahulu')
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reviews/${userReview.id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      })

      const result = await response.json()

      if (result.success) {
        setUserReview(null)
        setReviewForm({ rating: 5, comment: '' })
        setShowDeleteConfirm(false)
        await fetchReviews()
        await fetchClassDetail()
      } else {
        alert(result.message || 'Gagal menghapus review')
      }
    } catch (error) {
      console.error('Error deleting review:', error)
      alert('Terjadi kesalahan saat menghapus review')
    } finally {
      setDeleteLoading(false)
    }
  }

  // Reset review form ketika modal ditutup
  const handleCloseReviewModal = () => {
    setShowReviewModal(false)
    if (userReview) {
      setReviewForm({
        rating: userReview.rating,
        comment: userReview.comment
      })
    } else {
      setReviewForm({ rating: 5, comment: '' })
    }
  }

  // Fetch data detail kelas
  const fetchClassDetail = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      
      if (!token) {
        setError('Token tidak ditemukan. Silakan login kembali.')
        setLoading(false)
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/public/classes/${params.id}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token")
          setError('Sesi telah berakhir. Silakan login kembali.')
          setTimeout(() => router.push('/auth/login'), 2000)
          return
        }
        if (response.status === 404) {
          setError('Kelas tidak ditemukan')
          setLoading(false)
          return
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result: ApiResponse = await response.json()
      
      if (result.success && result.data) {
        const classData: ClassDetail = {
          ...result.data,
          studentCount: Math.floor(Math.random() * 100) + 50,
          materialCount: result.data.sections?.reduce((acc: number, section: Section) => 
            acc + (section.Material?.length || 0), 0) || 0
        }
        
        setClassDetail(classData)
        
        // Expand first section by default
        if (classData.sections && classData.sections.length > 0) {
          setExpandedSections([classData.sections[0].id])
          // Load first material by default if exists
          const firstSection = classData.sections[0]
          if (firstSection.Material && firstSection.Material.length > 0) {
            fetchMaterialDetail(firstSection.Material[0].id)
          }
        }
        setError(null)
      } else {
        throw new Error(result.message || 'Gagal memuat detail kelas')
      }
    } catch (err) {
      console.error('Error fetching class detail:', err)
      setError('Gagal memuat detail kelas. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (params.id) {
      fetchClassDetail()
      checkSubscriptionStatus()
      fetchReviews()
      fetchUserReview()
    }
  }, [params.id])

  // Helper function untuk map category
  const mapCategory = (categoryId: number): string => {
    const categoryMap: { [key: number]: string } = {
      1: 'Essay',
      2: 'Business Plan',
      3: 'Penelitian',
      4: 'Desain'
    }
    return categoryMap[categoryId] || 'Kursus'
  }

  // Helper function untuk get valid image URL
  const getValidImageUrl = (path: string | null | undefined): string => {
    if (!path) return '/placeholder.png';
    
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    
    if (path.includes('undefined/')) {
      path = path.replace('undefined/', '');
    }
    
    if (!path.startsWith('/') && !path.startsWith('http')) {
      return `${process.env.NEXT_PUBLIC_API_URL}/${path}`;
    }
    
    return path;
  };

  // Hitung total materi dan quiz dengan safe access
  const totalMaterials = classDetail?.sections?.reduce((acc, section) => 
    acc + (section.Material?.length || 0), 0) || 0
  const totalQuizzes = classDetail?.sections?.reduce((acc, section) => 
    acc + (section.Quiz?.length || 0), 0) || 0

  // Stats untuk ditampilkan - DIPERBAIKI dengan auto calculation dari reviews
  const stats = [
    { value: classDetail?.sections?.length.toString() || '0', label: 'Section', icon: <List className="w-5 h-5" /> },
    { value: totalMaterials.toString(), label: 'Total Materi', icon: <FileText className="w-5 h-5" /> },
    { 
      value: reviews.length > 0 
        ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
        : classDetail?.averageRating?.toFixed(1) || '0.0', 
      label: 'Rating', 
      icon: <Award className="w-5 h-5" /> 
    },
  ]

  // Render stars untuk rating - DIPERBAIKI dengan pengecekan null
  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const safeRating = rating || 0
    const sizeClass = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6'
    }[size]

    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClass} ${
              star <= safeRating 
                ? 'text-yellow-400 fill-current' 
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-1 text-sm font-medium text-gray-700">{safeRating.toFixed(1)}</span>
      </div>
    )
  }

  // Gate by subscription before rendering main content
  if (subscriptionLoading) {
    return (
      <LayoutNavbar>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
          <span className="ml-3 text-gray-600">Memeriksa status langganan...</span>
        </div>
      </LayoutNavbar>
    )
  }

  if (!hasSubscription && !subscriptionLoading) {
    return (
      <LayoutNavbar>
        <div className="pt-16 md:pt-20 min-h-screen bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-yellow-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Akses Premium Diperlukan</h1>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Untuk mengakses kelas ini, Anda perlu berlangganan paket premium terlebih dahulu.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6 max-w-md mx-auto">
                <h3 className="font-semibold text-blue-900 mb-3">Keuntungan Berlangganan:</h3>
                <ul className="text-sm text-blue-700 space-y-2 text-left">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Akses ke semua kursus premium
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Video pembelajaran lengkap
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Download materi PDF eksklusif
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Sertifikat kelulusan
                  </li>
                </ul>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => router.push('/profile')}
                  className="bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors flex items-center gap-2"
                >
                  <Award className="w-5 h-5" />
                  Redeem Kode Sekarang
                </button>
                <button
                  onClick={() => router.push('/elearning')}
                  className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <Sparkles className="w-5 h-5" />
                  Lihat Paket Berlangganan
                </button>
              </div>
              <div className="mt-6 text-sm text-gray-500">
                Sudah memiliki kode? Redeem di halaman profile untuk mengaktifkan subscription
              </div>
            </div>
          </div>
        </div>
      </LayoutNavbar>
    )
  }

  if (loading) {
    return (
      <LayoutNavbar>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
          <span className="ml-3 text-gray-600">Memuat detail kelas...</span>
        </div>
      </LayoutNavbar>
    )
  }

  if (error) {
    return (
      <LayoutNavbar>
        <div className="flex flex-col justify-center items-center min-h-screen">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md mx-auto">
            <p className="text-yellow-700 font-medium">{error}</p>
            <div className="flex gap-3 mt-4">
              <button 
                onClick={() => router.push('/auth/login')}
                className="bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors"
              >
                Login Kembali
              </button>
              <button 
                onClick={() => router.push('/elearning')}
                className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Kembali ke E-Learning
              </button>
            </div>
          </div>
        </div>
      </LayoutNavbar>
    )
  }

  if (!classDetail) {
    return (
      <LayoutNavbar>
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-700">Kelas tidak ditemukan</h2>
            <button 
              onClick={() => router.push('/elearning')}
              className="mt-4 bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors"
            >
              Kembali ke E-Learning
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
          {/* Header Section */}
          <section className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <button 
                onClick={() => router.push('/elearning')}
                className="flex items-center gap-2 text-blue-700 hover:text-blue-800 transition-colors mb-6 group"
              >
                <ArrowLeft className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" />
                <span className="font-medium">Kembali ke Kelas</span>
              </button>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-sm border border-blue-100 overflow-hidden">
                <div className="flex flex-col lg:flex-row">
                  {/* Class Image */}
                  <div className="lg:w-2/5 h-64 lg:h-80 relative">
                    <Image
                      src={getValidImageUrl(classDetail.image_path_relative || classDetail.image_path)}
                      alt={classDetail.name}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder.png';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent lg:hidden"></div>
                  </div>

                  {/* Class Info */}
                  <div className="lg:w-3/5 p-6 sm:p-8">
                    <div className="mb-6">
                      <span className="inline-block bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold mb-4 shadow-sm">
                        {mapCategory(classDetail.categoryId)}
                      </span>
                      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                        {classDetail.name}
                      </h1>
                      <p className="text-gray-600 leading-relaxed text-lg mb-6">
                        {classDetail.description}
                      </p>
                    </div>

                    {/* Rating & Reviews */}
                    <div className="flex items-center gap-6 mb-6">
                      <div className="flex items-center gap-2">
                        {renderStars(classDetail.averageRating, 'lg')}
                        <span className="text-gray-500 text-sm">
                          ({classDetail.totalReviews} review)
                        </span>
                      </div>
                      <button
                        onClick={() => setShowReviewModal(true)}
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
                      >
                        <MessageCircle className="w-5 h-5" />
                        {userReview ? 'Edit Review' : 'Tulis Review'}
                      </button>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                      {stats.map((stat, index) => (
                        <div
                          key={index}
                          className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center border border-white/50 shadow-sm"
                        >
                          <div className="flex justify-center mb-2">
                            <div className="bg-blue-100 p-2 rounded-lg text-blue-600 shadow-sm">
                              {stat.icon}
                            </div>
                          </div>
                          <h3 className="text-xl font-bold text-gray-900">{stat.value}</h3>
                          <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Content Section */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-3 space-y-8">
                {/* Kurikulum Kelas */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Kurikulum Kelas
                      </h2>
                      <p className="text-gray-600">
                        {totalMaterials} Materi • {totalQuizzes} Quiz • {classDetail.sections?.length || 0} Section
                      </p>
                    </div>
                    <div className="bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-medium border border-green-200">
                      {totalMaterials + totalQuizzes} Total Pembelajaran
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {classDetail.sections?.map((section, index) => (
                      <div key={section.id} className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                        <button
                          onClick={() => toggleSection(section.id)}
                          className="w-full p-6 flex items-center justify-between hover:bg-gray-100 transition-colors"
                        >
                          <div className="text-left flex items-start gap-4 flex-1">
                            <div className="bg-blue-600 text-white rounded-xl p-3 mt-1 shadow-sm">
                              <span className="font-bold text-lg">{index + 1}</span>
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 text-lg mb-2">{section.title}</h3>
                              {section.description && (
                                <p className="text-sm text-gray-600">{section.description}</p>
                              )}
                              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                  <Play className="w-4 h-4" />
                                  {section.Material?.length || 0} Materi
                                </span>
                                <span className="flex items-center gap-1">
                                  <FileText className="w-4 h-4" />
                                  {section.Quiz?.length || 0} Quiz
                                </span>
                              </div>
                            </div>
                          </div>
                          {expandedSections.includes(section.id) ? (
                            <ChevronUp className="w-6 h-6 text-gray-500 flex-shrink-0" />
                          ) : (
                            <ChevronDown className="w-6 h-6 text-gray-500 flex-shrink-0" />
                          )}
                        </button>
                        
                        {expandedSections.includes(section.id) && (
                          <div className="divide-y divide-gray-200 bg-white">
                            {/* Materials */}
                            {section.Material?.map((material) => (
                              <div 
                                key={material.id} 
                                className={`p-4 flex items-center gap-4 hover:bg-blue-50 transition-all cursor-pointer group ${
                                  selectedMaterialId === material.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                                }`}
                                onClick={() => fetchMaterialDetail(material.id)}
                              >
                                <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform ${
                                  selectedMaterialId === material.id 
                                    ? 'bg-blue-600 text-white' 
                                    : 'bg-blue-100 text-blue-600'
                                }`}>
                                  <Play className="w-6 h-6" />
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                                    {material.title}
                                  </h4>
                                  <p className="text-sm text-gray-600 line-clamp-2 mt-1">{material.content}</p>
                                  {/* Tampilkan XP jika tersedia */}
                                  {material.xp && material.xp > 0 && (
                                    <div className="flex items-center gap-1 mt-2">
                                      <Award className="w-4 h-4 text-yellow-600" />
                                      <span className="text-xs text-yellow-700 font-medium bg-yellow-50 px-2 py-1 rounded-full">
                                        {material.xp} XP
                                      </span>
                                    </div>
                                  )}
                                </div>
                                <div className="flex-shrink-0 flex items-center gap-3">
                                  <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">10:00</span>
                                  <div className={`w-3 h-3 rounded-full ${
                                    selectedMaterialId === material.id ? 'bg-blue-600' : 'bg-blue-400'
                                  }`}></div>
                                </div>
                              </div>
                            ))}
                            
                            {/* Quizzes */}
                            {section.Quiz?.map((quiz) => (
                              <div key={quiz.id} className="p-4 flex items-center gap-4 hover:bg-green-50 transition-colors group">
                                <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-700 shadow-sm group-hover:scale-110 transition-transform">
                                  <FileText className="w-6 h-6" />
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-semibold text-gray-900 group-hover:text-green-700 transition-colors">
                                    {quiz.title}
                                  </h4>
                                  {quiz.description && (
                                    <p className="text-sm text-gray-600 mt-1">{quiz.description}</p>
                                  )}
                                </div>
                                <div className="flex-shrink-0">
                                  <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">5 soal</span>
                                </div>
                              </div>
                            ))}

                            {/* Empty state jika tidak ada materi atau quiz */}
                            {(!section.Material?.length && !section.Quiz?.length) && (
                              <div className="p-6 text-center text-gray-500 bg-gray-50">
                                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                <p>Tidak ada materi atau quiz dalam section ini</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Empty state jika tidak ada sections */}
                    {!classDetail.sections?.length && (
                      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                        <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">Belum ada kurikulum</h3>
                        <p className="text-gray-500 max-w-md mx-auto">
                          Kurikulum untuk kelas ini sedang dalam persiapan. Silakan check kembali nanti.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Detail Materi */}
                {materialDetail && (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                      <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                        <Play className="w-6 h-6 text-blue-600" />
                        {materialDetail.title}
                      </h3>
                    </div>
                    
                    <div className="p-6">
                      {materialLoading ? (
                        <div className="flex justify-center items-center py-12">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
                          <span className="ml-3 text-gray-600">Memuat detail materi...</span>
                        </div>
                      ) : (
                        <div className="space-y-8">
                          {/* Thumbnail Materi */}
                          {materialDetail.thumnail_path && (
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-4 text-lg">Thumbnail Materi</h4>
                              <div className="relative w-full h-80 rounded-xl overflow-hidden border border-gray-200">
                                <Image
                                  src={getValidImageUrl(materialDetail.thumnail_path)}
                                  alt={materialDetail.title}
                                  fill
                                  className="object-cover"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = '/placeholder.png';
                                  }}
                                />
                              </div>
                            </div>
                          )}

                          {/* Video Materi */}
                          {materialDetail.video_path && (
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-4 text-lg flex items-center gap-2">
                                <VideoIcon className="w-6 h-6 text-blue-600" />
                                Video Pembelajaran
                              </h4>
                              <div className="bg-black rounded-xl overflow-hidden border border-gray-800 shadow-lg">
                                <video 
                                  controls 
                                  className="w-full h-auto"
                                  poster={getValidImageUrl(materialDetail.thumnail_path)}
                                >
                                  <source src={getValidImageUrl(materialDetail.video_path)} type="video/mp4" />
                                  Browser Anda tidak mendukung pemutaran video.
                                </video>
                              </div>
                            </div>
                          )}

                          {/* Konten Materi */}
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-4 text-lg">Deskripsi Materi</h4>
                            <div className="prose max-w-none bg-gray-50 rounded-xl p-6 border border-gray-200">
                              <p className="text-gray-700 leading-relaxed whitespace-pre-line">{materialDetail.content}</p>
                            </div>
                          </div>

                          {/* File-file Pendukung */}
                          {(materialDetail.materialFilePath || materialDetail.ringkasanPath || materialDetail.templatePath) && (
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-4 text-lg">File Pendukung</h4>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {materialDetail.materialFilePath && (
                                  <a 
                                    href={getValidImageUrl(materialDetail.materialFilePath)} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group"
                                  >
                                    <File className="w-10 h-10 text-blue-600 group-hover:scale-110 transition-transform" />
                                    <div>
                                      <p className="font-semibold text-gray-900 group-hover:text-blue-700">Materi PDF</p>
                                      <p className="text-sm text-gray-600">Download materi lengkap</p>
                                    </div>
                                  </a>
                                )}
                                
                                {materialDetail.ringkasanPath && (
                                  <a 
                                    href={getValidImageUrl(materialDetail.ringkasanPath)} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all group"
                                  >
                                    <FileText className="w-10 h-10 text-green-600 group-hover:scale-110 transition-transform" />
                                    <div>
                                      <p className="font-semibold text-gray-900 group-hover:text-green-700">Ringkasan</p>
                                      <p className="text-sm text-gray-600">Download ringkasan materi</p>
                                    </div>
                                  </a>
                                )}
                                
                                {materialDetail.templatePath && (
                                  <a 
                                    href={getValidImageUrl(materialDetail.templatePath)} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all group"
                                  >
                                    <Download className="w-10 h-10 text-purple-600 group-hover:scale-110 transition-transform" />
                                    <div>
                                      <p className="font-semibold text-gray-900 group-hover:text-purple-700">Template</p>
                                      <p className="text-sm text-gray-600">Download template</p>
                                    </div>
                                  </a>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Informasi XP */}
                          {materialDetail.xp && materialDetail.xp > 0 && (
                            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                              <div className="flex items-center gap-4">
                                <Award className="w-8 h-8" />
                                <div>
                                  <p className="font-bold text-lg">Dapatkan {materialDetail.xp} XP</p>
                                  <p className="text-blue-100">Selesaikan materi ini untuk mendapatkan poin pengalaman</p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Informasi Tanggal */}
                          <div className="border-t pt-6 mt-6">
                            <div className="flex flex-wrap gap-6 text-sm text-gray-600">
                              <div className="bg-gray-50 px-4 py-2 rounded-lg">
                                <span className="font-medium text-gray-700">Dibuat:</span>{' '}
                                {new Date(materialDetail.createdAt).toLocaleDateString('id-ID', {
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric'
                                })}
                              </div>
                              <div className="bg-gray-50 px-4 py-2 rounded-lg">
                                <span className="font-medium text-gray-700">Diperbarui:</span>{' '}
                                {new Date(materialDetail.updatedAt).toLocaleDateString('id-ID', {
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric'
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Reviews Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Ulasan & Rating</h2>
                      <div className="flex items-center gap-4">
                        {renderStars(classDetail.averageRating, 'lg')}
                        <span className="text-gray-600">({reviews.length} ulasan)</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowReviewModal(true)}
                      className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
                    >
                      <Plus className="w-5 h-5" />
                      {userReview ? 'Edit Review' : 'Tulis Review'}
                    </button>
                  </div>

                  {/* User's Review */}
                  {userReview && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="font-semibold text-blue-900 text-lg">Review Anda</h3>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setShowReviewModal(true)}
                            className="text-blue-600 hover:text-blue-800 transition-colors p-2"
                            title="Edit Review"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="text-red-600 hover:text-red-800 transition-colors p-2"
                            title="Hapus Review"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {userReview.User?.name?.charAt(0) || 'U'}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold text-gray-900">{userReview.User?.name || 'User'}</h4>
                            {renderStars(userReview.rating, 'sm')}
                            <span className="text-sm text-gray-500">
                              {new Date(userReview.createdAt).toLocaleDateString('id-ID')}
                            </span>
                          </div>
                          <p className="text-gray-700">{userReview.comment}</p>
                          {!userReview.isApproved && (
                            <div className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-medium mt-2">
                              <Clock className="w-3 h-3" />
                              Menunggu persetujuan admin
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Other Reviews */}
                  <div className="space-y-6">
                    {reviews.filter(review => review.id !== userReview?.id).map((review) => (
                      <div key={review.id} className="border-b border-gray-200 pb-6 last:border-0">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-gray-500 to-gray-700 rounded-full flex items-center justify-center text-white font-bold text-lg">
                            {review.User?.name?.charAt(0) || 'U'}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-semibold text-gray-900">{review.User?.name || 'User'}</h4>
                              {renderStars(review.rating, 'sm')}
                              <span className="text-sm text-gray-500">
                                {new Date(review.createdAt).toLocaleDateString('id-ID')}
                              </span>
                            </div>
                            <p className="text-gray-700">{review.comment}</p>
                          </div>
                        </div>
                      </div>
                    ))}

                    {reviews.length === 0 && (
                      <div className="text-center py-8">
                        <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Belum ada ulasan</h3>
                        <p className="text-gray-500 mb-4">Jadilah yang pertama memberikan ulasan untuk kelas ini</p>
                        <button
                          onClick={() => setShowReviewModal(true)}
                          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                        >
                          Tulis Review Pertama
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1 space-y-6">
                {/* Progress Stats */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <h3 className="font-bold text-gray-900 mb-4">Progress Belajar</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Materi Diselesaikan</span>
                      <span className="font-semibold text-gray-900">0/{totalMaterials}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '0%' }}></div>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-semibold text-blue-600">0%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </LayoutNavbar>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                {userReview ? 'Edit Review' : 'Tulis Review'}
              </h3>
              <button
                onClick={handleCloseReviewModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Rating Stars */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating
                </label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewForm(prev => ({ ...prev, rating: star }))}
                      className="p-1 transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= reviewForm.rating
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment */}
              <div>
                <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                  Komentar
                </label>
                <textarea
                  id="comment"
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Bagikan pengalaman belajar Anda..."
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleCloseReviewModal}
                  className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleSubmitReview}
                  disabled={reviewLoading}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {reviewLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Simpan Review
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Hapus Review</h3>
                <p className="text-sm text-gray-600">Tindakan ini tidak dapat dibatalkan</p>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-gray-700">
                Apakah Anda yakin ingin menghapus review ini? Review yang telah dihapus tidak dapat dikembalikan.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleteLoading}
                className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteReview}
                disabled={deleteLoading}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleteLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Menghapus...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Hapus Review
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  )
}