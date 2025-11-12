'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import LayoutNavbar from '@/components/public/LayoutNavbar'
import { CheckCircle, Play, Users, Clock, BookOpen, Star, ArrowRight, Video, FileText, Award, Eye, ChevronDown } from 'lucide-react'
import Footer from '@/components/public/Footer'
import { useRouter } from 'next/navigation'

interface Course {
  id: number
  category: string
  title: string
  image: string
  duration: string
  participants: string
  level: string
  rating: number
  instructor: string
  featured?: boolean
}

interface ApiResponse {
  success: boolean
  data: {
    classes: Array<{
      id: number
      name: string
      description: string
      image_path: string
      categoryId: number
      image_path_relative: string
    }>
    meta: {
      totalItems: number
      itemsPerPage: number
      totalPages: number
      currentPage: number
    }
  }
  message?: string
}

export default function ELearningPage() {
  const router = useRouter()
  const [activeCategory, setActiveCategory] = useState('all')
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAllCourses, setShowAllCourses] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const categories = [
    { id: 'all', name: 'Semua Kursus' },
    { id: 'essay', name: 'Essay' },
    { id: 'business', name: 'Business Plan' },
    { id: 'research', name: 'Penelitian' },
    { id: 'design', name: 'Desain' }
  ]

  // Data untuk paket berlangganan
  const plans = [
    {
      name: "Paket 1 Bulan",
      originalPrice: "Rp 100.000",
      price: "Rp 30.000",
      discount: "70%",
      duration: "1 Bulan",
      features: [
        "Akses ke SEMUA kursus dan materi",
        "Download modul PDF eksklusif",
        "Grup diskusi komunitas",
        "Sertifikat penyelesaian kursus",
        "Update kursus berkala",
        "Forum tanya jawab"
      ],
      buttonText: "Pilih Paket 1 Bulan",
      popular: false,
      link: "https://link.id/ambilprestasi-elearning-1bulan"
    },
    {
      name: "Paket 2 Bulan",
      originalPrice: "Rp 200.000",
      price: "Rp 60.000",
      discount: "70%",
      duration: "2 Bulan",
      features: [
        "Akses ke SEMUA kursus dan materi",
        "Download modul PDF eksklusif",
        "Grup diskusi komunitas",
        "Sertifikat penyelesaian kursus",
        "Update kursus berkala",
        "Forum tanya jawab",
        "Priority support",
        "Video rekaman materi"
      ],
      buttonText: "Pilih Paket 2 Bulan",
      popular: true,
      link: "https://link.id/ambilprestasi-elearning-2bulan"
    },
    {
      name: "Paket 3 Bulan",
      originalPrice: "Rp 300.000",
      price: "Rp 90.000",
      discount: "70%",
      duration: "3 Bulan",
      features: [
        "Akses ke SEMUA kursus dan materi",
        "Download modul PDF eksklusif",
        "Grup diskusi komunitas",
        "Sertifikat penyelesaian kursus",
        "Update kursus berkala",
        "Forum tanya jawab",
        "Priority support",
        "Video rekaman materi",
        "Personal learning path",
        "Assessment perkembangan belajar"
      ],
      buttonText: "Pilih Paket 3 Bulan",
      popular: false,
      link: "https://link.id/ambilprestasi-elearning-3bulan"
    }
  ]

  // Data testimonials
  const testimonials = [
    {
      text: "Dengan paket berlangganan, saya bisa akses semua kursus dan materi pembelajaran. Sangat membantu persiapan lomba!",
      name: "Nina, Mahasiswa Psikologi",
      role: "Peserta Program 2 Bulan",
      rating: 5
    },
    {
      text: "Materi kursusnya lengkap dan selalu update. Pembelajaran jadi lebih terstruktur dan mudah dipahami.",
      name: "Dimas, Fresh Graduate",
      role: "Peserta Program 3 Bulan",
      rating: 5
    },
    {
      text: "Harga sangat terjangkau untuk akses seluas ini. Saya bisa belajar semua topik yang saya butuhkan untuk kompetisi.",
      name: "Rani, Pegawai Swasta",
      role: "Peserta Program 1 Bulan",
      rating: 5
    }
  ]

  // Fungsi untuk navigasi ke halaman detail kursus
  const handleViewCourseDetail = (courseId: number) => {
    router.push(`/elearning/${courseId}`)
  }

  // Fungsi untuk handle pemilihan paket
  const handlePackageSelect = (link: string) => {
    window.open(link, '_blank', 'noopener,noreferrer')
  }

  // Fungsi untuk handle show more courses
  const handleShowMoreCourses = () => {
    if (!isAuthenticated) {
      router.push('/auth/login')
      return
    }
    setShowAllCourses(true)
  }

  // Fetch data courses dari API
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true)
        
        const token = localStorage.getItem("token")
        
        if (!token) {
          setError('Token tidak ditemukan. Silakan login kembali.')
          setLoading(false)
          setIsAuthenticated(false)
          return
        }

        setIsAuthenticated(true)

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/public/classes`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
          redirect: "follow" as RequestRedirect
        })

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem("token")
            setError('Sesi telah berakhir. Silakan login kembali.')
            setIsAuthenticated(false)
            setTimeout(() => router.push('/auth/login'), 2000)
            return
          }
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const result: ApiResponse = await response.json()
        
        if (result.success && result.data.classes) {
          const transformedCourses = result.data.classes.map((classItem, index) => ({
            id: classItem.id,
            category: mapCategory(classItem.categoryId),
            title: classItem.name,
            image: classItem.image_path_relative || '/placeholder.png',
            duration: `${Math.floor(Math.random() * 6) + 3} Jam`,
            participants: (Math.floor(Math.random() * 400) + 100).toString(),
            level: ['Pemula', 'Menengah', 'Lanjutan'][index % 3],
            rating: parseFloat((4.5 + Math.random() * 0.5).toFixed(1)),
            instructor: getDefaultInstructor(index),
            featured: index < 2
          }))

          setCourses(transformedCourses)
          setError(null)
        } else {
          throw new Error(result.message || 'Gagal memuat data kelas')
        }
      } catch (err) {
        console.error('Error fetching courses:', err)
        setError('Gagal memuat data kursus. Silakan coba lagi.')
        setCourses(getFallbackCourses())
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()
  }, [router])

  // Helper functions untuk transform data
  const mapCategory = (categoryId: number): string => {
    const categoryMap: { [key: number]: string } = {
      1: 'essay',
      2: 'business',
      3: 'research',
      4: 'design'
    }
    return categoryMap[categoryId] || 'essay'
  }

  const getDefaultInstructor = (index: number): string => {
    const instructors = [
      'Dr. Sarah Wijaya',
      'Prof. Ahmad Rahman',
      'Dr. Lisa Santoso',
      'Maya Desain',
      'Dr. Budi Prasetyo',
      'Prof. Dian Sastro'
    ]
    return instructors[index % instructors.length]
  }

  // Fallback data jika API error
  const getFallbackCourses = (): Course[] => [
    {
      id: 1,
      category: 'essay',
      title: 'Menulis Esai Akademik yang Menang',
      image: '/essay.png',
      duration: '6 Jam',
      participants: '420',
      level: 'Pemula',
      rating: 4.8,
      instructor: 'Dr. Sarah Wijaya',
      featured: true
    },
    {
      id: 2,
      category: 'business',
      title: 'Business Plan untuk Kompetisi Startup',
      image: '/business-plan.png',
      duration: '8 Jam',
      participants: '310',
      level: 'Menengah',
      rating: 4.9,
      instructor: 'Prof. Ahmad Rahman',
      featured: true
    },
    {
      id: 3,
      category: 'research',
      title: 'Karya Tulis Ilmiah & Publikasi',
      image: '/karya-tulis-ilmiah.png',
      duration: '5 Jam',
      participants: '280',
      level: 'Pemula',
      rating: 4.7,
      instructor: 'Dr. Lisa Santoso'
    },
    {
      id: 4,
      category: 'design',
      title: 'Desain Poster Akademik yang Impactful',
      image: '/poster.png',
      duration: '4 Jam',
      participants: '355',
      level: 'Pemula',
      rating: 4.6,
      instructor: 'Maya Desain'
    },
    {
      id: 5,
      category: 'essay',
      title: 'Teknik Menulis Essay Beasiswa',
      image: '/essay.png',
      duration: '7 Jam',
      participants: '290',
      level: 'Menengah',
      rating: 4.8,
      instructor: 'Dr. Sarah Wijaya'
    },
    {
      id: 6,
      category: 'business',
      title: 'Analisis Pasar untuk Business Plan',
      image: '/business-plan.png',
      duration: '5 Jam',
      participants: '320',
      level: 'Lanjutan',
      rating: 4.7,
      instructor: 'Prof. Ahmad Rahman'
    }
  ]

  // Filter courses berdasarkan kategori dan batasi tampilan
  const filteredCourses = activeCategory === 'all' 
    ? courses 
    : courses.filter(course => course.category === activeCategory)

  // Tampilkan hanya 6 kursus pertama jika belum klik show more
  const displayedCourses = showAllCourses ? filteredCourses : filteredCourses.slice(0, 6)

  const stats = [
    { value: '180+', label: 'Video Pembelajaran', icon: <Video className="w-6 h-6" /> },
    { value: '90+', label: 'Modul Belajar', icon: <FileText className="w-6 h-6" /> },
    { value: `${courses.reduce((acc, course) => acc + parseInt(course.participants), 0)}+`, label: 'Peserta Aktif', icon: <Users className="w-6 h-6" /> },
    { value: '300+', label: 'Pemenang Kompetisi', icon: <Award className="w-6 h-6" /> },
  ]

  const learningPath = [
    {
      step: '1',
      title: 'Belajar Interaktif',
      desc: 'Pelajari konten-konten berkualitas dan tonton video dari mentor berpengalaman.',
      icon: <BookOpen className="w-6 h-6" />
    },
    {
      step: '2',
      title: 'Praktik Langsung',
      desc: 'Implementasikan materi dengan latihan dan studi kasus nyata.',
      icon: <Play className="w-6 h-6" />
    },
    {
      step: '3',
      title: 'Raih Prestasi',
      desc: 'Siap berkompetisi dan raih prestasi terbaik dengan bekal yang matang!',
      icon: <Award className="w-6 h-6" />
    }
  ]

  return (
    <>
      <LayoutNavbar>
        <div className="flex flex-col gap-12 md:gap-16 px-4 sm:px-6 pt-16 md:pt-20">
          {/* Hero Section */}
          <section className="w-full max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-6 bg-blue-700 rounded-xl p-6 text-white">
              <div className="space-y-4 order-2 lg:order-1">
                <div className="flex items-center gap-2 bg-blue-600 rounded-full px-3 py-1 w-fit">
                  <BookOpen className="w-4 h-4" />
                  <span className="text-sm font-medium">E-Learning Platform</span>
                </div>
                
                <h1 className="text-2xl sm:text-3xl font-bold leading-tight">
                  Tingkatkan Skill & Raih Prestasi Bersama E-Learning
                </h1>
                
                <p className="text-blue-100 text-base leading-relaxed">
                  Pelajari berbagai materi kuliah, lomba, dan keterampilan kompetitif.  
                  Belajar fleksibel dengan video, modul belajar, serta forum diskusi interaktif.
                </p>

                <div className="space-y-2">
                  {[
                    "Belajar fleksibel di mana saja & kapan saja",
                    "Modul dikurasi langsung oleh mentor berpengalaman",
                    "Gratis dan mudah diakses oleh seluruh mahasiswa"
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <CheckCircle className="text-green-300 flex-shrink-0" size={18} />
                      <span className="text-blue-100 text-sm">{item}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button 
                    onClick={() => document.getElementById('courses-section')?.scrollIntoView({ behavior: 'smooth' })}
                    className="bg-white text-blue-700 px-6 py-3 rounded-lg font-semibold transition-colors hover:bg-blue-50 shadow-md flex items-center gap-2 justify-center"
                  >
                    Jelajahi Kursus
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => document.getElementById('packages-section')?.scrollIntoView({ behavior: 'smooth' })}
                    className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold transition-colors hover:bg-white hover:text-blue-700"
                  >
                    Lihat Paket Harga
                  </button>
                </div>
              </div>

              <div className="flex justify-center lg:justify-end order-1 lg:order-2">
                <div className="relative w-full max-w-sm">
                  <img
                    src="/e-learning.png"
                    alt="E-Learning"
                    className="rounded-xl object-cover shadow-lg w-full h-auto"
                  />
                  <div className="absolute -bottom-3 -left-3 bg-white rounded-xl p-3 shadow-md">
                    <div className="flex items-center gap-2">
                      <div className="bg-green-100 p-2 rounded-lg">
                        <Award className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">300+</p>
                        <p className="text-xs text-gray-600">Pemenang Lomba</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Statistik Section */}
          <section className="w-full max-w-7xl mx-auto">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg p-4 shadow-md border border-gray-200 group hover:shadow-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg text-blue-700">
                      {stat.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">{stat.value}</h3>
                      <p className="text-gray-600 text-xs">{stat.label}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Kategori Kursus */}
          <section id="courses-section" className="w-full max-w-7xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Kategori Kursus
              </h2>
              <p className="text-gray-700 max-w-2xl mx-auto text-sm">
                Pilih kategori yang sesuai dengan minat dan kebutuhan belajarmu
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => {
                    setActiveCategory(category.id)
                    setShowAllCourses(false)
                  }}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
                    activeCategory === category.id
                      ? 'bg-blue-700 text-white shadow-md'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
                <span className="ml-3 text-gray-600">Memuat kursus...</span>
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="text-center py-8">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md mx-auto">
                  <p className="text-yellow-700 font-medium">{error}</p>
                  {error.includes('login kembali') && (
                    <button 
                      onClick={() => router.push('/auth/login')}
                      className="mt-3 bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors"
                    >
                      Login Kembali
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Kursus Grid */}
            {!loading && !error && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {displayedCourses.map((course) => (
                    <div
                      key={course.id}
                      className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-colors border border-gray-200"
                    >
                      <div className="relative h-40 overflow-hidden">
                        <Image
                          src={course.image}
                          alt={course.title}
                          fill
                          className="object-cover"
                        />
                        {course.featured && (
                          <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                            Featured
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button 
                            onClick={() => handleViewCourseDetail(course.id)}
                            className="bg-white text-blue-700 p-2 rounded-full hover:bg-blue-50 transition-colors"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="p-4 space-y-3">
                        <div className="flex justify-between items-start">
                          <span className="text-xs text-blue-700 font-semibold bg-blue-100 px-2 py-1 rounded-full">
                            {course.category.charAt(0).toUpperCase() + course.category.slice(1)}
                          </span>
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                            course.level === 'Pemula' ? 'bg-green-100 text-green-700' :
                            course.level === 'Menengah' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {course.level}
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-gray-800 leading-tight">
                          {course.title}
                        </h3>

                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span className="font-medium text-xs">{course.instructor}</span>
                        </div>

                        <div className="flex items-center justify-between text-xs text-gray-600">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{course.duration}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              <span>{course.participants}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-400 fill-current" />
                            <span className="font-semibold">{course.rating}</span>
                          </div>
                        </div>

                        <button 
                          onClick={() => handleViewCourseDetail(course.id)}
                          className="w-full bg-blue-700 text-white py-2 rounded-lg font-semibold transition-colors hover:bg-blue-800 flex items-center justify-center gap-2 text-sm"
                        >
                          <Eye className="w-3 h-3" />
                          Lihat Detail Kelas
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Show More Button */}
                {!showAllCourses && filteredCourses.length > 6 && (
                  <div className="text-center mt-8">
                    <div className="bg-blue-700 rounded-xl p-6 max-w-2xl mx-auto">
                      <h3 className="text-white text-lg font-bold mb-3">
                        {isAuthenticated ? 'Temukan Lebih Banyak Kursus' : 'Login untuk Mengakses Semua Kursus'}
                      </h3>
                      <p className="text-blue-100 mb-6 text-sm">
                        {isAuthenticated 
                          ? `Masih ada ${filteredCourses.length - 6} kursus lainnya yang menunggu untuk dipelajari!`
                          : 'Login untuk mengakses semua kursus premium dan fitur lengkap lainnya.'
                        }
                      </p>
                      <button 
                        onClick={handleShowMoreCourses}
                        className="bg-white text-blue-700 px-6 py-3 rounded-lg font-semibold transition-colors hover:bg-blue-50 shadow-md flex items-center gap-2 justify-center mx-auto"
                      >
                        <ChevronDown className="w-4 h-4" />
                        {isAuthenticated ? 'Tampilkan Semua Kursus' : 'Login Sekarang'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Show Less Button */}
                {showAllCourses && filteredCourses.length > 6 && (
                  <div className="text-center mt-8">
                    <button 
                      onClick={() => setShowAllCourses(false)}
                      className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold transition-colors hover:bg-gray-200 flex items-center gap-2 justify-center mx-auto"
                    >
                      <ChevronDown className="w-4 h-4 transform rotate-180" />
                      Tampilkan Lebih Sedikit
                    </button>
                  </div>
                )}
              </>
            )}

            {/* Empty State */}
            {!loading && !error && filteredCourses.length === 0 && (
              <div className="text-center py-12">
                <div className="bg-gray-50 rounded-lg p-8 max-w-md mx-auto">
                  <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Tidak ada kursus ditemukan</h3>
                  <p className="text-gray-500 text-sm">
                    Tidak ada kursus yang tersedia untuk kategori ini.
                  </p>
                </div>
              </div>
            )}
          </section>

          {/* Pricing Section */}
          <section id="packages-section" className="w-full max-w-7xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-blue-800 mb-3">
                Paket Berlangganan E-Learning
              </h2>
              <p className="text-gray-600 text-sm max-w-2xl mx-auto">
                Akses semua kursus premium dengan paket berlangganan bulanan. Belajar tanpa batas dan raih prestasi terbaikmu!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plans.map((plan, index) => (
                <div
                  key={index}
                  className={`bg-white rounded-xl p-6 shadow-lg border-2 ${
                    plan.popular 
                      ? 'border-blue-600 relative' 
                      : 'border-gray-200'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                        Paling Populer
                      </span>
                    </div>
                  )}
                  
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{plan.name}</h3>
                    <div className="flex flex-col items-center gap-2 mb-2">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl line-through text-gray-400">{plan.originalPrice}</span>
                        <span className="text-2xl font-bold text-blue-600">{plan.price}</span>
                      </div>
                      <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-sm font-semibold">
                        Hemat {plan.discount}
                      </span>
                    </div>
                    <p className="text-gray-600 font-semibold">{plan.duration} Akses Penuh</p>
                  </div>

                  <div className="mb-4 p-3 bg-blue-50 rounded-lg text-center">
                    <p className="text-blue-700 font-semibold text-sm">
                      ✅ Akses ke SEMUA Kursus & Materi
                    </p>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-3 text-gray-600">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button 
                    onClick={() => handlePackageSelect(plan.link)}
                    className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                      plan.popular
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    {plan.buttonText}
                  </button>
                </div>
              ))}
            </div>

            <div className="text-center mt-8">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-2xl mx-auto">
                <p className="text-green-700 font-semibold">
                  💫 Spesial Diskon 70%! Harga normal Rp 100.000/bulan menjadi Rp 30.000/bulan
                </p>
                <p className="text-green-600 text-sm mt-1">
                  Akses semua kursus, modul eksklusif, dan fitur premium lainnya
                </p>
              </div>
            </div>
          </section>

          {/* Testimonials Section */}
          <section className="w-full max-w-7xl mx-auto">
            <div className="bg-blue-700 rounded-xl p-6 text-white">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-3">
                  Testimoni Peserta E-Learning
                </h2>
                <p className="text-blue-100 text-sm max-w-2xl mx-auto">
                  Dengarkan pengalaman langsung dari peserta yang telah merasakan manfaat program berlangganan kami
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {testimonials.map((testimonial, index) => (
                  <div
                    key={index}
                    className="bg-blue-600 rounded-lg p-4 shadow-lg"
                  >
                    <div className="flex gap-1 mb-3">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star 
                          key={i} 
                          className="w-4 h-4 text-yellow-400 fill-current" 
                        />
                      ))}
                    </div>
                    <p className="text-blue-100 italic mb-3 leading-relaxed text-sm">
                      &quot;{testimonial.text}&quot;
                    </p>
                    <div>
                      <p className="font-semibold text-sm">{testimonial.name}</p>
                      <p className="text-blue-200 text-xs">{testimonial.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Alur Pembelajaran */}
          <section className="w-full max-w-7xl mx-auto">
            <div className="bg-blue-100 rounded-xl p-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  Alur Pembelajaran
                </h2>
                <p className="text-gray-700 max-w-2xl mx-auto text-sm">
                  Ikuti langkah-langkah sistematis untuk mencapai kesuksesan dalam kompetisi
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {learningPath.map((step, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-lg p-4 shadow-md text-center"
                  >
                    <div className="bg-blue-700 text-white w-10 h-10 rounded-full flex items-center justify-center text-base font-bold mb-3 mx-auto">
                      {step.step}
                    </div>
                    <div className="bg-blue-200 text-blue-700 p-2 rounded-lg w-fit mx-auto mb-3">
                      {step.icon}
                    </div>
                    <h3 className="font-bold text-base mb-2 text-gray-800">{step.title}</h3>
                    <p className="text-gray-600 leading-relaxed text-sm">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="w-full max-w-7xl mx-auto">
            <div className="bg-blue-700 rounded-xl p-6 text-white text-center">
              <h2 className="text-2xl font-bold mb-3">
                Siap Mengembangkan Potensimu?
              </h2>
              <p className="text-blue-100 mb-6 max-w-2xl mx-auto text-sm">
                Bergabung dengan ribuan mahasiswa lainnya dan raih prestasi terbaik melalui program E-Learning kami.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button 
                  onClick={() => document.getElementById('packages-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="bg-white text-blue-700 px-6 py-3 rounded-lg font-semibold transition-colors hover:bg-blue-50 shadow-md flex items-center gap-2 justify-center text-sm"
                >
                  <BookOpen className="w-4 h-4" />
                  Pilih Paket Belajar
                </button>
                <button 
                  onClick={() => document.getElementById('courses-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold transition-colors hover:bg-white hover:text-blue-700 text-sm"
                >
                  Lihat Semua Kursus
                </button>
              </div>
            </div>
          </section>
        </div>
      </LayoutNavbar>
      <Footer/>
    </>
  )
}