'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import LayoutNavbar from '@/components/public/LayoutNavbar'
import { ArrowLeft, Plus, Edit, Trash2, FileText, CheckCircle, XCircle, X, AlertTriangle, List, Clock, Target, BarChart3, Calendar, Users, BookOpen, Eye } from 'lucide-react'
import Footer from '@/components/public/Footer'

interface Quiz {
  id: number;
  title: string;
  description: string;
  max_attempts: number;
  time_limit: number;
  passing_grade: number;
  xp?: number;
  open_at?: string;
  close_at?: string;
  createdAt?: string;
  updatedAt?: string;
  materialId: number;
  quiz_question: any[];
  _count: {
    quiz_attempt: number;
  };
}

interface Material {
  id: number;
  title: string;
  content: string;
}

interface ApiResponse {
  success: boolean
  data: any
  message?: string
}

export default function QuizzesPage() {
  const params = useParams()
  const router = useRouter()
  const classId = params.id as string
  const sectionId = params.sectionId as string
  const materialId = params.materialId as string

  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [material, setMaterial] = useState<Material | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showQuizModal, setShowQuizModal] = useState(false)
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null)
  const [quizForm, setQuizForm] = useState({
    title: '',
    description: '',
    max_attempts: 3,
    time_limit: 60,
    passing_grade: 70,
    open_at: '',
    close_at: '',
    xp: 0
  })
  
  // State untuk message feedback
  const [messageSuccess, setMessageSuccess] = useState<string | null>(null)
  const [messageFailed, setMessageFailed] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{show: boolean, quizId: number | null, quizTitle: string}>({
    show: false,
    quizId: null,
    quizTitle: ''
  })

  // Auto hide messages after 5 seconds
  useEffect(() => {
    if (messageSuccess || messageFailed) {
      const timer = setTimeout(() => {
        setMessageSuccess(null)
        setMessageFailed(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [messageSuccess, messageFailed])

  // Fetch material data
  const fetchMaterialData = async () => {
    try {
      const token = localStorage.getItem("token")
      
      if (!token) {
        setError('Token tidak ditemukan. Silakan login kembali.')
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/classes/sections/${sectionId}/materials/${materialId}`, {
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
          setTimeout(() => router.push('/login'), 2000)
          return
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result: ApiResponse = await response.json()
      
      if (result.success) {
        setMaterial(result.data)
        setError(null)
      } else {
        throw new Error(result.message || 'Gagal memuat data materi')
      }
    } catch (err) {
      console.error('Error fetching material data:', err)
      setError('Gagal memuat data materi. Silakan coba lagi.')
      setMessageFailed('Gagal memuat data materi')
    }
  }

  // Fetch quizzes
  const fetchQuizzes = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      
      if (!token) {
        setError('Token tidak ditemukan. Silakan login kembali.')
        setLoading(false)
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/classes/sections/materials/${materialId}/quizzes`, {
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
          setTimeout(() => router.push('/login'), 2000)
          return
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result: ApiResponse = await response.json()
      
      if (result.success) {
        setQuizzes(result.data || [])
        setError(null)
      } else {
        throw new Error(result.message || 'Gagal memuat data quiz')
      }
    } catch (err) {
      console.error('Error fetching quizzes:', err)
      setError('Gagal memuat data quiz. Silakan coba lagi.')
      setMessageFailed('Gagal memuat data quiz')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (materialId) {
      fetchMaterialData()
      fetchQuizzes()
    }
  }, [materialId])

  // Reset quiz form
  const resetQuizForm = () => {
    setQuizForm({
      title: '',
      description: '',
      max_attempts: 3,
      time_limit: 60,
      passing_grade: 70,
      open_at: '',
      close_at: '',
      xp: 0
    })
    setEditingQuiz(null)
  }

  // Open create quiz modal
  const handleCreateQuiz = () => {
    resetQuizForm()
    setShowQuizModal(true)
  }

  // Open edit quiz modal
  const handleEditQuiz = (quiz: Quiz) => {
    setEditingQuiz(quiz)
    setQuizForm({
      title: quiz.title,
      description: quiz.description || '',
      max_attempts: quiz.max_attempts,
      time_limit: quiz.time_limit,
      passing_grade: quiz.passing_grade,
      open_at: quiz.open_at ? new Date(quiz.open_at).toISOString().slice(0, 16) : '',
      close_at: quiz.close_at ? new Date(quiz.close_at).toISOString().slice(0, 16) : '',
      xp: quiz.xp || 0
    })
    setShowQuizModal(true)
  }

  // Handle quiz form input changes
  const handleQuizInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setQuizForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Submit quiz form (create atau update) - DIPERBAIKI
  const handleSubmitQuiz = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validasi
    if (!quizForm.title.trim()) {
      setMessageFailed('Judul quiz wajib diisi')
      return
    }

    setLoading(true)

    try {
      const token = localStorage.getItem("token")
      
      if (!token) {
        setMessageFailed('Token tidak ditemukan. Silakan login kembali.')
        setLoading(false)
        return
      }

      const payload = {
        title: quizForm.title.trim(),
        description: quizForm.description.trim(),
        max_attempts: Number(quizForm.max_attempts),
        time_limit: Number(quizForm.time_limit),
        passing_grade: Number(quizForm.passing_grade),
        open_at: quizForm.open_at ? new Date(quizForm.open_at).toISOString() : null,
        close_at: quizForm.close_at ? new Date(quizForm.close_at).toISOString() : null,
        xp: Number(quizForm.xp)
      }

      let url = ''
      let method = ''

      if (!editingQuiz) {
        // CREATE - Sudah benar
        url = `${process.env.NEXT_PUBLIC_API_URL}/classes/sections/materials/${materialId}/quizzes`
        method = 'POST'
      } else {
        // UPDATE - DIPERBAIKI: tambahkan /sections/ dalam endpoint
        url = `${process.env.NEXT_PUBLIC_API_URL}/classes/sections/materials/${materialId}/quizzes/${editingQuiz.id}`
        method = 'PUT' // atau 'PATCH' tergantung API
      }

      const response = await fetch(url, {
        method,
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token")
          setMessageFailed('Sesi telah berakhir. Silakan login kembali.')
          setTimeout(() => router.push('/login'), 2000)
          return
        }
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.message || `HTTP error! status: ${response.status}`)
      }

      const result: ApiResponse = await response.json()
      
      if (result.success) {
        await fetchQuizzes()
        setShowQuizModal(false)
        resetQuizForm()
        setMessageSuccess(editingQuiz ? 'Quiz berhasil diperbarui' : 'Quiz berhasil dibuat')
      } else {
        throw new Error(result.message || 'Failed to save quiz')
      }
    } catch (error) {
      console.error('Error saving quiz:', error)
      setMessageFailed(`Gagal menyimpan quiz: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  // Delete quiz - DIPERBAIKI
  const handleDeleteQuiz = async (quizId: number) => {
    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      
      if (!token) {
        setMessageFailed('Token tidak ditemukan. Silakan login kembali.')
        setLoading(false)
        return
      }

      // DIPERBAIKI: Gunakan endpoint yang sama dengan update (dengan /sections/)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/classes/sections/materials/${materialId}/quizzes/${quizId}`, {
        method: "DELETE",
        headers: { 
          "Authorization": `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token")
          setMessageFailed('Sesi telah berakhir. Silakan login kembali.')
          setTimeout(() => router.push('/login'), 2000)
          return
        }
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.message || `HTTP error! status: ${response.status}`)
      }

      const result: ApiResponse = await response.json()
      
      if (result.success) {
        await fetchQuizzes()
        setMessageSuccess('Quiz berhasil dihapus')
      } else {
        throw new Error(result.message || 'Failed to delete quiz')
      }
    } catch (error) {
      console.error('Error deleting quiz:', error)
      setMessageFailed(`Gagal menghapus quiz: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
      setShowDeleteConfirm({ show: false, quizId: null, quizTitle: '' })
    }
  }

  // Open delete confirmation
  const openDeleteConfirm = (quizId: number, quizTitle: string) => {
    setShowDeleteConfirm({
      show: true,
      quizId,
      quizTitle
    })
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Handle view detail quiz
  const handleViewDetail = (quiz: Quiz) => {
    // TODO: Implement detail view or navigate to detail page
    console.log('View detail for quiz:', quiz)
    // Anda bisa menambahkan modal detail atau navigate ke halaman detail
  }

  if (loading && !material) {
    return (
      <LayoutNavbar>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </LayoutNavbar>
    )
  }

  if (!material) {
    return (
      <LayoutNavbar>
        <div className="flex flex-col items-center justify-center min-h-screen">
          <FileText className="w-16 h-16 text-gray-300 mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Materi tidak ditemukan</h2>
          <p className="text-gray-600 mb-4">Materi yang Anda cari tidak ditemukan</p>
          <button 
            onClick={() => router.push(`/classes/${classId}/sections/${sectionId}/materials`)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Kembali ke Materi
          </button>
        </div>
      </LayoutNavbar>
    )
  }

  return (
    <>
      <LayoutNavbar>
        {/* Success Message */}
        {messageSuccess && (
          <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right duration-300">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg max-w-sm">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <div>
                  <p className="text-green-800 font-medium text-sm">{messageSuccess}</p>
                </div>
                <button 
                  onClick={() => setMessageSuccess(null)}
                  className="text-green-600 hover:text-green-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {messageFailed && (
          <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right duration-300">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg max-w-sm">
              <div className="flex items-center gap-3">
                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <div>
                  <p className="text-red-800 font-medium text-sm">{messageFailed}</p>
                </div>
                <button 
                  onClick={() => setMessageFailed(null)}
                  className="text-red-600 hover:text-red-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="px-4 sm:px-6 lg:px-8 pt-16 md:pt-20">
          {/* Header Section */}
          <div className="max-w-7xl mx-auto mb-8">
            <div className="flex items-center gap-4 mb-6">
              <button 
                onClick={() => router.push(`/classes/${classId}/sections/${sectionId}/materials`)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Kembali ke Materi</span>
              </button>
            </div>

            {/* Error State */}
            {error && !loading && (
              <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-700 font-medium">{error}</p>
                {error.includes('login kembali') && (
                  <button 
                    onClick={() => router.push('/login')}
                    className="mt-3 bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors"
                  >
                    Login Kembali
                  </button>
                )}
              </div>
            )}

            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                    Kelola Quiz
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      Materi: {material.title}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quizzes Section */}
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                  Daftar Quiz
                </h2>
                <p className="text-gray-700 text-sm sm:text-base">
                  Kelola quiz untuk materi `{material.title}`
                </p>
              </div>
              <button 
                onClick={handleCreateQuiz}
                disabled={loading}
                className="bg-green-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Tambah Quiz</span>
              </button>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-4">Memuat data quiz...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {quizzes.map((quiz) => (
                  <div 
                    key={quiz.id}
                    className="bg-white rounded-xl shadow-md border border-gray-200 transition-all duration-300 hover:shadow-lg group"
                  >
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="bg-purple-100 text-purple-600 rounded-lg p-2 mt-1">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-purple-700 transition-colors">
                              {quiz.title}
                            </h3>
                            {quiz.description && (
                              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                {quiz.description}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 ml-4">
                          {/* Tombol Detail Quiz */}
                          <button 
                            onClick={() => handleViewDetail(quiz)}
                            disabled={loading}
                            className="bg-green-500 text-white p-2 rounded-lg transition-all duration-300 hover:bg-green-600 hover:scale-105 active:scale-95 disabled:opacity-50"
                            title="Detail Quiz"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {/* Tombol Kelola Questions */}
                          <button 
                            onClick={() => router.push(`/classes/${classId}/sections/${sectionId}/materials/${materialId}/quizzes/${quiz.id}/questions`)}
                            disabled={loading}
                            className="bg-purple-500 text-white p-2 rounded-lg transition-all duration-300 hover:bg-purple-600 hover:scale-105 active:scale-95 disabled:opacity-50"
                            title="Kelola Questions"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleEditQuiz(quiz)}
                            disabled={loading}
                            className="bg-blue-500 text-white p-2 rounded-lg transition-all duration-300 hover:bg-blue-600 hover:scale-105 active:scale-95 disabled:opacity-50"
                            title="Edit Quiz"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => openDeleteConfirm(quiz.id, quiz.title)}
                            disabled={loading}
                            className="bg-red-500 text-white p-2 rounded-lg transition-all duration-300 hover:bg-red-600 hover:scale-105 active:scale-95 disabled:opacity-50"
                            title="Hapus Quiz"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Quiz Details */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500 flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            Maks Attempt
                          </span>
                          <span className="font-medium">{quiz.max_attempts} kali</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500 flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            Batas Waktu
                          </span>
                          <span className="font-medium">{quiz.time_limit} menit</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500 flex items-center gap-1">
                            <Target className="w-4 h-4" />
                            Nilai Kelulusan
                          </span>
                          <span className="font-medium">{quiz.passing_grade}%</span>
                        </div>
                        {quiz.xp && quiz.xp > 0 && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">XP</span>
                            <span className="font-medium text-green-600">+{quiz.xp} XP</span>
                          </div>
                        )}
                        {quiz.open_at && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500 flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              Mulai
                            </span>
                            <span className="font-medium text-xs">
                              {formatDate(quiz.open_at)}
                            </span>
                          </div>
                        )}
                        {quiz.close_at && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500 flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              Selesai
                            </span>
                            <span className="font-medium text-xs">
                              {formatDate(quiz.close_at)}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Metadata */}
                      <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
                        <span className="flex items-center gap-1">
                          <BarChart3 className="w-3 h-3" />
                          {quiz._count?.quiz_attempt || 0} attempt
                        </span>
                        <span>
                          {quiz.createdAt && `Dibuat: ${new Date(quiz.createdAt).toLocaleDateString('id-ID')}`}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {quizzes.length === 0 && !loading && (
              <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada quiz</h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  Mulai dengan membuat quiz pertama untuk materi "{material.title}"
                </p>
                <button 
                  onClick={handleCreateQuiz}
                  disabled={loading}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95 flex items-center gap-2 mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-5 h-5" />
                  Buat Quiz Pertama
                </button>
              </div>
            )}
          </div>
        </div>
      </LayoutNavbar>
      <Footer/>

      {/* Create/Edit Quiz Modal */}
      {showQuizModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-gray-200 shadow-2xl">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-white">
              <h3 className="text-xl font-bold text-gray-900">
                {editingQuiz ? 'Edit Quiz' : 'Tambah Quiz Baru'}
              </h3>
              <button 
                onClick={() => {
                  setShowQuizModal(false)
                  resetQuizForm()
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                disabled={loading}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="flex-1 overflow-y-auto">
              <form onSubmit={handleSubmitQuiz} className="p-6">
                <div className="space-y-6">
                  {/* Title Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Judul Quiz *
                    </label>
                    <input
                      type="text"
                      name="title"
                      required
                      value={quizForm.title}
                      onChange={handleQuizInputChange}
                      disabled={loading}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 disabled:opacity-50 bg-white"
                      placeholder="Masukkan judul quiz"
                    />
                  </div>
                  
                  {/* Description Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Deskripsi Quiz
                    </label>
                    <textarea
                      name="description"
                      value={quizForm.description}
                      onChange={handleQuizInputChange}
                      rows={3}
                      disabled={loading}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 resize-none disabled:opacity-50 bg-white"
                      placeholder="Deskripsi quiz (opsional)"
                    />
                  </div>

                  {/* Quiz Settings */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Max Attempts */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Maks Attempt
                      </label>
                      <input
                        type="number"
                        name="max_attempts"
                        min="1"
                        max="10"
                        value={quizForm.max_attempts}
                        onChange={handleQuizInputChange}
                        disabled={loading}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 disabled:opacity-50 bg-white"
                      />
                    </div>

                    {/* Time Limit */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Batas Waktu (menit)
                      </label>
                      <input
                        type="number"
                        name="time_limit"
                        min="1"
                        max="300"
                        value={quizForm.time_limit}
                        onChange={handleQuizInputChange}
                        disabled={loading}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 disabled:opacity-50 bg-white"
                      />
                    </div>

                    {/* Passing Grade */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nilai Kelulusan (%)
                      </label>
                      <input
                        type="number"
                        name="passing_grade"
                        min="0"
                        max="100"
                        value={quizForm.passing_grade}
                        onChange={handleQuizInputChange}
                        disabled={loading}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 disabled:opacity-50 bg-white"
                      />
                    </div>

                    {/* XP */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        XP Reward
                      </label>
                      <input
                        type="number"
                        name="xp"
                        min="0"
                        max="1000"
                        value={quizForm.xp}
                        onChange={handleQuizInputChange}
                        disabled={loading}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 disabled:opacity-50 bg-white"
                        placeholder="XP yang didapat saat lulus"
                      />
                    </div>
                  </div>

                  {/* Date & Time */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Open At */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mulai Pada
                      </label>
                      <input
                        type="datetime-local"
                        name="open_at"
                        value={quizForm.open_at}
                        onChange={handleQuizInputChange}
                        disabled={loading}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 disabled:opacity-50 bg-white"
                      />
                    </div>

                    {/* Close At */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Selesai Pada
                      </label>
                      <input
                        type="datetime-local"
                        name="close_at"
                        value={quizForm.close_at}
                        onChange={handleQuizInputChange}
                        disabled={loading}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 disabled:opacity-50 bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex gap-3 justify-end mt-8 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowQuizModal(false)
                      resetQuizForm()
                    }}
                    disabled={loading}
                    className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors font-medium disabled:opacity-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Menyimpan...
                      </>
                    ) : (
                      editingQuiz ? 'Simpan Perubahan' : 'Buat Quiz'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm.show && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full border border-gray-200 shadow-2xl">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-red-100 p-2 rounded-full">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Konfirmasi Hapus</h3>
              </div>
              
              <p className="text-gray-600 mb-6">
                Apakah Anda yakin ingin menghapus quiz <span className="font-semibold text-gray-900">`{showDeleteConfirm.quizTitle}`</span>? Tindakan ini tidak dapat dibatalkan.
              </p>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowDeleteConfirm({ show: false, quizId: null, quizTitle: '' })}
                  disabled={loading}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors font-medium disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  onClick={() => showDeleteConfirm.quizId && handleDeleteQuiz(showDeleteConfirm.quizId)}
                  disabled={loading}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Menghapus...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Hapus
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}