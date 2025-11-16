'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import LayoutNavbar from '@/components/public/LayoutNavbar'
import Footer from '@/components/public/Footer'
import { Play, FileText, Clock, Users, ArrowLeft, CheckCircle, Star, Award, Video, Download, ChevronDown, ChevronUp, File, VideoIcon, Sparkles, BookOpen, List } from 'lucide-react'

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

  // Fetch data detail kelas
  useEffect(() => {
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

    if (params.id) {
      fetchClassDetail()
    }
  }, [params.id, router])

  // Call subscription check
  useEffect(() => {
    checkSubscriptionStatus()
  }, [])

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

  // Stats untuk ditampilkan
  const stats = [
    { value: classDetail?.studentCount?.toString() || '0', label: 'Siswa', icon: <Users className="w-5 h-5" /> },
    { value: classDetail?.sections?.length.toString() || '0', label: 'Section', icon: <List className="w-5 h-5" /> },
    { value: totalMaterials.toString(), label: 'Total Materi', icon: <FileText className="w-5 h-5" /> },
    { value: classDetail?.averageRating?.toString() || '0', label: 'Rating', icon: <Award className="w-5 h-5" /> },
  ]

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
          <section className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <button 
                onClick={() => router.push('/elearning')}
                className="flex items-center gap-2 text-blue-700 hover:text-blue-800 transition-colors mb-6"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Kembali ke Kelas</span>
              </button>

              <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
                <div className="flex flex-col lg:flex-row">
                  {/* Class Image */}
                  <div className="lg:w-1/3 h-64 lg:h-80 relative">
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
                  </div>

                  {/* Class Info */}
                  <div className="lg:w-2/3 p-6 sm:p-8">
                    <div className="mb-4">
                      <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium mb-4">
                        {mapCategory(classDetail.categoryId)}
                      </span>
                      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                        {classDetail.name}
                      </h1>
                      <p className="text-gray-600 leading-relaxed mb-6">
                        {classDetail.description}
                      </p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                      {stats.map((stat, index) => (
                        <div
                          key={index}
                          className="bg-gray-50 rounded-lg p-4 text-center"
                        >
                          <div className="flex justify-center mb-2">
                            <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                              {stat.icon}
                            </div>
                          </div>
                          <h3 className="text-lg sm:text-xl font-bold text-gray-900">{stat.value}</h3>
                          <p className="text-gray-600 text-sm">{stat.label}</p>
                        </div>
                      ))}
                    </div>

                    {/* Mentor Info */}
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        M
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Mentor Ahli</h4>
                        <p className="text-sm text-gray-600">Pengajar Berpengalaman</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Content Section */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Kurikulum Kelas */}
              <div className="lg:col-span-2">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                    Kurikulum Kelas
                  </h2>
                  <p className="text-gray-600 text-sm">
                    {totalMaterials} Materi • {totalQuizzes} Quiz
                  </p>
                </div>
                
                <div className="space-y-4">
                  {classDetail.sections?.map((section) => (
                    <div key={section.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                      <button
                        onClick={() => toggleSection(section.id)}
                        className="w-full p-6 bg-gray-50 border-b border-gray-200 flex items-center justify-between hover:bg-gray-100 transition-colors"
                      >
                        <div className="text-left flex items-start gap-4 flex-1">
                          <div className="bg-blue-100 text-blue-600 rounded-lg p-3 mt-1">
                            <List className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 text-lg">{section.title}</h3>
                            {section.description && (
                              <p className="text-sm text-gray-600 mt-2">{section.description}</p>
                            )}
                            <p className="text-xs text-gray-500 mt-2">
                              {section.Material?.length || 0} Materi • {section.Quiz?.length || 0} Quiz
                            </p>
                          </div>
                        </div>
                        {expandedSections.includes(section.id) ? (
                          <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                        )}
                      </button>
                      
                      {expandedSections.includes(section.id) && (
                        <div className="divide-y divide-gray-200">
                          {/* Materials */}
                          {section.Material?.map((material) => (
                            <div 
                              key={material.id} 
                              className={`p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                                selectedMaterialId === material.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                              }`}
                              onClick={() => fetchMaterialDetail(material.id)}
                            >
                              <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-700">
                                <Play className="w-5 h-5" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900">{material.title}</h4>
                                <p className="text-sm text-gray-600 line-clamp-2">{material.content}</p>
                                {/* Tampilkan XP jika tersedia */}
                                {material.xp && material.xp > 0 && (
                                  <div className="flex items-center gap-1 mt-1">
                                    <Award className="w-3 h-3 text-yellow-600" />
                                    <span className="text-xs text-yellow-700 font-medium">{material.xp} XP</span>
                                  </div>
                                )}
                              </div>
                              <div className="flex-shrink-0 flex items-center gap-2">
                                <span className="text-sm text-gray-500">10:00</span>
                                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                              </div>
                            </div>
                          ))}
                          
                          {/* Quizzes */}
                          {section.Quiz?.map((quiz) => (
                            <div key={quiz.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                              <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-green-700">
                                <FileText className="w-5 h-5" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900">{quiz.title}</h4>
                                {quiz.description && (
                                  <p className="text-sm text-gray-600">{quiz.description}</p>
                                )}
                              </div>
                              <div className="flex-shrink-0">
                                <span className="text-sm text-gray-500">5 soal</span>
                              </div>
                            </div>
                          ))}

                          {/* Empty state jika tidak ada materi atau quiz */}
                          {(!section.Material?.length && !section.Quiz?.length) && (
                            <div className="p-4 text-center text-gray-500">
                              Tidak ada materi atau quiz dalam section ini
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Empty state jika tidak ada sections */}
                  {!classDetail.sections?.length && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">Belum ada kurikulum</h3>
                      <p className="text-gray-500">
                        Kurikulum untuk kelas ini sedang dalam persiapan.
                      </p>
                    </div>
                  )}
                </div>

                {/* Detail Materi */}
                {materialDetail && (
                  <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">{materialDetail.title}</h3>
                      
                      {materialLoading ? (
                        <div className="flex justify-center items-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
                          <span className="ml-3 text-gray-600">Memuat detail materi...</span>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {/* Thumbnail Materi */}
                          {materialDetail.thumnail_path && (
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-3">Thumbnail Materi</h4>
                              <div className="relative w-full h-64 rounded-lg overflow-hidden">
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
                              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                <VideoIcon className="w-5 h-5 text-blue-600" />
                                Video Pembelajaran
                              </h4>
                              <div className="bg-black rounded-lg overflow-hidden">
                                <video 
                                  controls 
                                  className="w-full h-auto max-h-96"
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
                            <h4 className="font-semibold text-gray-900 mb-3">Deskripsi Materi</h4>
                            <div className="prose max-w-none">
                              <p className="text-gray-700 whitespace-pre-line">{materialDetail.content}</p>
                            </div>
                          </div>

                          {/* File-file Pendukung */}
                          {(materialDetail.materialFilePath || materialDetail.ringkasanPath || materialDetail.templatePath) && (
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-3">File Pendukung</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {materialDetail.materialFilePath && (
                                  <a 
                                    href={getValidImageUrl(materialDetail.materialFilePath)} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                  >
                                    <File className="w-8 h-8 text-blue-600" />
                                    <div>
                                      <p className="font-medium text-gray-900">Materi PDF</p>
                                      <p className="text-sm text-gray-600">Download materi lengkap</p>
                                    </div>
                                  </a>
                                )}
                                
                                {materialDetail.ringkasanPath && (
                                  <a 
                                    href={getValidImageUrl(materialDetail.ringkasanPath)} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                  >
                                    <FileText className="w-8 h-8 text-green-600" />
                                    <div>
                                      <p className="font-medium text-gray-900">Ringkasan</p>
                                      <p className="text-sm text-gray-600">Download ringkasan materi</p>
                                    </div>
                                  </a>
                                )}
                                
                                {materialDetail.templatePath && (
                                  <a 
                                    href={getValidImageUrl(materialDetail.templatePath)} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                  >
                                    <Download className="w-8 h-8 text-purple-600" />
                                    <div>
                                      <p className="font-medium text-gray-900">Template</p>
                                      <p className="text-sm text-gray-600">Download template</p>
                                    </div>
                                  </a>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Informasi XP */}
                          {materialDetail.xp && materialDetail.xp > 0 && (
                            <div className="bg-blue-50 rounded-lg p-4">
                              <div className="flex items-center gap-3">
                                <Award className="w-6 h-6 text-blue-600" />
                                <div>
                                  <p className="font-semibold text-blue-900">Dapatkan {materialDetail.xp} XP</p>
                                  <p className="text-sm text-blue-700">Selesaikan materi ini untuk mendapatkan poin pengalaman</p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Informasi Tanggal */}
                          <div className="border-t pt-4 mt-6">
                            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                              <div>
                                <span className="font-medium">Dibuat:</span>{' '}
                                {new Date(materialDetail.createdAt).toLocaleDateString('id-ID', {
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric'
                                })}
                              </div>
                              <div>
                                <span className="font-medium">Diperbarui:</span>{' '}
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
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="space-y-6">
                  {/* CTA Box */}
                  <div className="bg-blue-700 rounded-lg p-6 text-white sticky top-24">
                    <h3 className="font-bold mb-3">Siap Memulai Perjalanan Belajarmu?</h3>
                    <p className="text-blue-100 text-sm mb-4">
                      Bergabung dengan {totalMaterials + totalQuizzes} materi pembelajaran berkualitas tinggi
                    </p>
                    <button 
                      onClick={handleGoToPricing}
                      className="w-full bg-white text-blue-700 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 active:scale-95"
                    >
                      Jelajahi Kursus Lainnya
                    </button>
                  </div>

                  {/* Info Tambahan */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="font-bold text-gray-900 mb-4">Tentang Mentor</h3>
                    
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                        M
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Mentor Ahli</h4>
                        <p className="text-sm text-gray-600">Pengajar Berpengalaman</p>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600">
                      Mentor kami memiliki pengalaman lebih dari 5 tahun dalam bidangnya dan telah membantu ratusan siswa meraih prestasi terbaik.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </LayoutNavbar>
      <Footer />
    </>
  )
}