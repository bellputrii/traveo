/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import LayoutNavbar from '@/components/public/LayoutNavbar'
import { ArrowLeft, Plus, Edit, Trash2, FileText, Video, File, Image as ImageIcon, BookOpen, Download, X, CheckCircle, XCircle, AlertTriangle, List, Info, Eye, Play, ExternalLink } from 'lucide-react'
import Footer from '@/components/public/Footer'

interface Material {
  id: number;
  title: string;
  content: string;
  video?: string;
  materialFile?: string;
  ringkasan?: string;
  template?: string;
  thumnail?: string;
  order: number;
  createdAt?: string;
  updatedAt?: string;
  xp?: number;
  thumnail_path?: string;
  video_path?: string;
  materialFilePath?: string;
  ringkasanPath?: string;
  templatePath?: string;
  sectionId?: number;
}

interface Section {
  id: number;
  title: string;
  description: string;
  order: number;
}

interface Class {
  id: number;
  name: string;
  description: string;
  image_path: string;
  categoryId: number;
}

interface ApiResponse {
  success: boolean
  data: any
  message?: string
}

export default function MaterialsPage() {
  const params = useParams()
  const router = useRouter()
  const classId = params.id as string
  const sectionId = params.sectionId as string

  const [materials, setMaterials] = useState<Material[]>([])
  const [section, setSection] = useState<Section | null>(null)
  const [classData, setClassData] = useState<Class | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showMaterialModal, setShowMaterialModal] = useState(false)
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null)
  const [materialForm, setMaterialForm] = useState({
    title: '',
    content: ''
  })
  const [files, setFiles] = useState<{
    video?: File | null;
    materialFile?: File | null;
    ringkasan?: File | null;
    template?: File | null;
    thumnail?: File | null;
  }>({})
  
  // State untuk message feedback
  const [messageSuccess, setMessageSuccess] = useState<string | null>(null)
  const [messageFailed, setMessageFailed] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{show: boolean, materialId: number | null, materialTitle: string}>({
    show: false,
    materialId: null,
    materialTitle: ''
  })

  // State untuk detail materi
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [detailMaterial, setDetailMaterial] = useState<Material | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  // Konstanta untuk validasi
  const VALIDATION_RULES = {
    title: {
      minLength: 10,
      maxLength: 200
    },
    files: {
      maxSize: 10 * 1024 * 1024, // 10MB
      video: {
        maxSize: 50 * 1024 * 1024, // 50MB untuk video
        formats: ['.mp4', '.mov', '.avi', '.mkv']
      },
      materialFile: {
        formats: ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx']
      },
      ringkasan: {
        formats: ['.pdf']
      },
      template: {
        formats: ['.pdf', '.doc', '.docx']
      },
      thumnail: {
        maxSize: 5 * 1024 * 1024, // 5MB untuk gambar
        formats: ['.jpg', '.jpeg', '.png', '.gif', '.webp']
      }
    }
  }

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

  // Fetch section data dengan struktur yang konsisten
  const fetchSectionData = async () => {
    try {
      const token = localStorage.getItem("token")
      
      if (!token) {
        setError('Token tidak ditemukan. Silakan login kembali.')
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/classes/${classId}/sections/${sectionId}`, {
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
        setSection(result.data)
        setError(null)
      } else {
        throw new Error(result.message || 'Gagal memuat data section')
      }
    } catch (err) {
      console.error('Error fetching section data:', err)
      setError('Gagal memuat data section. Silakan coba lagi.')
      setMessageFailed('Gagal memuat data section')
    }
  }

  // Fetch class data dengan struktur yang konsisten
  const fetchClassData = async () => {
    try {
      const token = localStorage.getItem("token")
      
      if (!token) {
        setError('Token tidak ditemukan. Silakan login kembali.')
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/classes/${classId}`, {
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
        setClassData(result.data)
        setError(null)
      } else {
        throw new Error(result.message || 'Gagal memuat data kelas')
      }
    } catch (err) {
      console.error('Error fetching class data:', err)
      setError('Gagal memuat data kelas. Silakan coba lagi.')
      setMessageFailed('Gagal memuat data kelas')
    }
  }

  // Fetch materials dengan struktur yang konsisten
  const fetchMaterials = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      
      if (!token) {
        setError('Token tidak ditemukan. Silakan login kembali.')
        setLoading(false)
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/classes/sections/${sectionId}/materials`, {
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
        setMaterials(result.data || [])
        setError(null)
      } else {
        throw new Error(result.message || 'Gagal memuat data materi')
      }
    } catch (err) {
      console.error('Error fetching materials:', err)
      setError('Gagal memuat data materi. Silakan coba lagi.')
      setMessageFailed('Gagal memuat data materi')
    } finally {
      setLoading(false)
    }
  }

  // Fetch detail materi
  const fetchMaterialDetail = async (materialId: number) => {
    setDetailLoading(true)
    try {
      const token = localStorage.getItem("token")
      
      if (!token) {
        setMessageFailed('Token tidak ditemukan. Silakan login kembali.')
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/public/materials/${materialId}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        redirect: "follow" as RequestRedirect
      })

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token")
          setMessageFailed('Sesi telah berakhir. Silakan login kembali.')
          setTimeout(() => router.push('/login'), 2000)
          return
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result: ApiResponse = await response.json()
      
      if (result.success) {
        setDetailMaterial(result.data)
        setShowDetailModal(true)
      } else {
        throw new Error(result.message || 'Gagal memuat detail materi')
      }
    } catch (err) {
      console.error('Error fetching material detail:', err)
      setMessageFailed('Gagal memuat detail materi. Silakan coba lagi.')
    } finally {
      setDetailLoading(false)
    }
  }

  // Open detail modal
  const handleViewDetail = (material: Material) => {
    // Jika data sudah lengkap (dari response materials), langsung tampilkan
    if (material.video_path || material.thumnail_path) {
      setDetailMaterial(material)
      setShowDetailModal(true)
    } else {
      // Jika data tidak lengkap, fetch detail dari API
      fetchMaterialDetail(material.id)
    }
  }

  useEffect(() => {
    if (classId && sectionId) {
      fetchClassData()
      fetchSectionData()
      fetchMaterials()
    }
  }, [classId, sectionId])

  // Handle material form input changes
  const handleMaterialInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setMaterialForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Handle file changes dengan validasi
  const handleFileChange = (fieldName: keyof typeof files) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    
    if (file) {
      // Validasi ukuran file
      const maxSize = fieldName === 'video' 
        ? VALIDATION_RULES.files.video.maxSize 
        : fieldName === 'thumnail'
        ? VALIDATION_RULES.files.thumnail.maxSize
        : VALIDATION_RULES.files.maxSize

      if (file.size > maxSize) {
        const maxSizeMB = maxSize / (1024 * 1024)
        setMessageFailed(`Ukuran file ${fieldName} terlalu besar. Maksimal ${maxSizeMB}MB`)
        e.target.value = '' // Reset input file
        return
      }

      // Validasi format file
      const fileName = file.name.toLowerCase()
      let isValidFormat = false

      switch (fieldName) {
        case 'video':
          isValidFormat = VALIDATION_RULES.files.video.formats.some(format => 
            fileName.endsWith(format)
          )
          break
        case 'materialFile':
          isValidFormat = VALIDATION_RULES.files.materialFile.formats.some(format => 
            fileName.endsWith(format)
          )
          break
        case 'ringkasan':
          isValidFormat = VALIDATION_RULES.files.ringkasan.formats.some(format => 
            fileName.endsWith(format)
          )
          break
        case 'template':
          isValidFormat = VALIDATION_RULES.files.template.formats.some(format => 
            fileName.endsWith(format)
          )
          break
        case 'thumnail':
          isValidFormat = VALIDATION_RULES.files.thumnail.formats.some(format => 
            fileName.endsWith(format)
          )
          break
      }

      if (!isValidFormat) {
        const allowedFormats = {
          video: VALIDATION_RULES.files.video.formats.join(', '),
          materialFile: VALIDATION_RULES.files.materialFile.formats.join(', '),
          ringkasan: VALIDATION_RULES.files.ringkasan.formats.join(', '),
          template: VALIDATION_RULES.files.template.formats.join(', '),
          thumnail: VALIDATION_RULES.files.thumnail.formats.join(', ')
        }
        setMessageFailed(`Format file tidak didukung untuk ${fieldName}. Format yang diperbolehkan: ${allowedFormats[fieldName]}`)
        e.target.value = '' // Reset input file
        return
      }
    }

    setFiles(prev => ({
      ...prev,
      [fieldName]: file || null
    }))
  }

  // Reset material form
  const resetMaterialForm = () => {
    setMaterialForm({
      title: '',
      content: ''
    })
    setFiles({})
    setEditingMaterial(null)
  }

  // Open create material modal
  const handleCreateMaterial = () => {
    resetMaterialForm()
    setShowMaterialModal(true)
  }

  // Open edit material modal
  const handleEditMaterial = (material: Material) => {
    setEditingMaterial(material)
    setMaterialForm({
      title: material.title,
      content: material.content || ''
    })
    setShowMaterialModal(true)
  }

  // Submit material form (create atau update) - dengan struktur yang konsisten
  const handleSubmitMaterial = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validasi judul
    if (!materialForm.title.trim()) {
      setMessageFailed('Judul materi wajib diisi')
      return
    }

    if (materialForm.title.length < VALIDATION_RULES.title.minLength) {
      setMessageFailed(`Judul materi minimal ${VALIDATION_RULES.title.minLength} karakter`)
      return
    }

    if (materialForm.title.length > VALIDATION_RULES.title.maxLength) {
      setMessageFailed(`Judul materi maksimal ${VALIDATION_RULES.title.maxLength} karakter`)
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

      // CREATE MATERIAL - menggunakan FormData
      if (!editingMaterial) {
        const formData = new FormData()
        formData.append('title', materialForm.title.trim())
        formData.append('content', materialForm.content.trim())

        // Append files if they exist
        if (files.video) formData.append('video', files.video)
        if (files.materialFile) formData.append('materialFile', files.materialFile)
        if (files.ringkasan) formData.append('ringkasan', files.ringkasan)
        if (files.template) formData.append('template', files.template)
        if (files.thumnail) formData.append('thumnail', files.thumnail)

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/classes/sections/${sectionId}/materials`, {
          method: "POST",
          headers: { 
            "Authorization": `Bearer ${token}`,
          },
          body: formData,
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
          await fetchMaterials()
          setShowMaterialModal(false)
          resetMaterialForm()
          setMessageSuccess('Materi berhasil dibuat')
        } else {
          throw new Error(result.message || 'Failed to create material')
        }
      } 
      // UPDATE MATERIAL - menggunakan FormData
      else {
        const formData = new FormData()
        formData.append('title', materialForm.title.trim())
        formData.append('content', materialForm.content.trim())

        // Append files if they exist
        if (files.video) formData.append('video', files.video)
        if (files.materialFile) formData.append('materialFile', files.materialFile)
        if (files.ringkasan) formData.append('ringkasan', files.ringkasan)
        if (files.template) formData.append('template', files.template)
        if (files.thumnail) formData.append('thumnail', files.thumnail)

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/classes/sections/${sectionId}/materials/${editingMaterial.id}`, {
          method: "PATCH",
          headers: { 
            "Authorization": `Bearer ${token}`,
          },
          body: formData,
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
          await fetchMaterials()
          setShowMaterialModal(false)
          resetMaterialForm()
          setMessageSuccess('Materi berhasil diperbarui')
        } else {
          throw new Error(result.message || 'Failed to update material')
        }
      }
    } catch (error) {
      console.error('Error saving material:', error)
      setMessageFailed(`Gagal menyimpan materi: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  // Delete material dengan struktur yang konsisten
  const handleDeleteMaterial = async (materialId: number) => {
    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      
      if (!token) {
        setMessageFailed('Token tidak ditemukan. Silakan login kembali.')
        setLoading(false)
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/classes/sections/${sectionId}/materials/${materialId}`, {
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
        await fetchMaterials()
        setMessageSuccess('Materi berhasil dihapus')
      } else {
        throw new Error(result.message || 'Failed to delete material')
      }
    } catch (error) {
      console.error('Error deleting material:', error)
      setMessageFailed(`Gagal menghapus materi: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
      setShowDeleteConfirm({ show: false, materialId: null, materialTitle: '' })
    }
  }

  // Open delete confirmation
  const openDeleteConfirm = (materialId: number, materialTitle: string) => {
    setShowDeleteConfirm({
      show: true,
      materialId,
      materialTitle
    })
  }

  // Get file type icon
  const getFileTypeIcon = (fileName: string) => {
    if (fileName?.includes('.mp4') || fileName?.includes('.mov') || fileName?.includes('.avi')) {
      return <Video className="w-4 h-4" />
    }
    if (fileName?.includes('.jpg') || fileName?.includes('.png') || fileName?.includes('.jpeg')) {
      return <ImageIcon className="w-4 h-4" />
    }
    return <File className="w-4 h-4" />
  }

  // Get file type label
  const getFileTypeLabel = (fileName: string) => {
    if (fileName?.includes('.mp4') || fileName?.includes('.mov') || fileName?.includes('.avi')) {
      return 'Video'
    }
    if (fileName?.includes('.jpg') || fileName?.includes('.png') || fileName?.includes('.jpeg')) {
      return 'Gambar'
    }
    if (fileName?.includes('.pdf')) {
      return 'PDF'
    }
    if (fileName?.includes('.doc') || fileName?.includes('.docx')) {
      return 'Dokumen'
    }
    return 'File'
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

  if (loading && !section) {
    return (
      <LayoutNavbar>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </LayoutNavbar>
    )
  }

  if (!section) {
    return (
      <LayoutNavbar>
        <div className="flex flex-col items-center justify-center min-h-screen">
          <FileText className="w-16 h-16 text-gray-300 mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Section tidak ditemukan</h2>
          <p className="text-gray-600 mb-4">Section yang Anda cari tidak ditemukan</p>
          <button 
            onClick={() => router.push(`/classes/${classId}`)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Kembali ke Kelas
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
                onClick={() => router.push(`/classes/${classId}`)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Kembali ke Kelas</span>
              </button>
              <div className="h-4 w-px bg-gray-300"></div>
              <button 
                onClick={() => router.push(`/classes/${classId}`)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <List className="w-4 h-4" />
                <span>Kembali ke Section</span>
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
                    Materi Pembelajaran
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      {classData?.name}
                    </span>
                    <span className="flex items-center gap-1">
                      <List className="w-4 h-4" />
                      {section.title}
                    </span>
                    {section.description && (
                      <span className="text-gray-500">{section.description}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Materials Section */}
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                  Daftar Materi
                </h2>
                <p className="text-gray-700 text-sm sm:text-base">
                  Kelola materi pembelajaran untuk section `{section.title}`
                </p>
              </div>
              <button 
                onClick={handleCreateMaterial}
                disabled={loading}
                className="bg-green-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Tambah Materi</span>
              </button>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-4">Memuat data materi...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {materials.map((material) => (
                  <div 
                    key={material.id}
                    className="bg-white rounded-xl shadow-md border border-gray-200 transition-all duration-300 hover:shadow-lg group"
                  >
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="bg-blue-100 text-blue-600 rounded-lg p-2 mt-1">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-700 transition-colors">
                              {material.title}
                            </h3>
                            {material.content && (
                              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                {material.content}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 ml-4">
                          <button 
                            onClick={() => handleViewDetail(material)}
                            disabled={loading}
                            className="bg-green-500 text-white p-2 rounded-lg transition-all duration-300 hover:bg-green-600 hover:scale-105 active:scale-95 disabled:opacity-50"
                            title="Lihat Detail"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {/* Tombol Kelola Quiz */}
                          <button 
                            onClick={() => router.push(`/classes/${classId}/sections/${sectionId}/materials/${material.id}/quizzes`)}
                            disabled={loading}
                            className="bg-purple-500 text-white p-2 rounded-lg transition-all duration-300 hover:bg-purple-600 hover:scale-105 active:scale-95 disabled:opacity-50"
                            title="Kelola Quiz"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleEditMaterial(material)}
                            disabled={loading}
                            className="bg-blue-500 text-white p-2 rounded-lg transition-all duration-300 hover:bg-blue-600 hover:scale-105 active:scale-95 disabled:opacity-50"
                            title="Edit Materi"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => openDeleteConfirm(material.id, material.title)}
                            disabled={loading}
                            className="bg-red-500 text-white p-2 rounded-lg transition-all duration-300 hover:bg-red-600 hover:scale-105 active:scale-95 disabled:opacity-50"
                            title="Hapus Materi"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* File Attachments */}
                      <div className="space-y-2 mb-4">
                        {material.video && (
                          <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center gap-2">
                              <Video className="w-4 h-4 text-blue-600" />
                              <span className="text-sm text-gray-700">Video Materi</span>
                            </div>
                            <button className="text-blue-600 hover:text-blue-800 transition-colors">
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                        
                        {material.materialFile && (
                          <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center gap-2">
                              <File className="w-4 h-4 text-green-600" />
                              <span className="text-sm text-gray-700">File Materi</span>
                            </div>
                            <button className="text-green-600 hover:text-green-800 transition-colors">
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        )}

                        {material.ringkasan && (
                          <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-purple-600" />
                              <span className="text-sm text-gray-700">Ringkasan</span>
                            </div>
                            <button className="text-purple-600 hover:text-purple-800 transition-colors">
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        )}

                        {material.template && (
                          <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center gap-2">
                              <File className="w-4 h-4 text-orange-600" />
                              <span className="text-sm text-gray-700">Template</span>
                            </div>
                            <button className="text-orange-600 hover:text-orange-800 transition-colors">
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Metadata */}
                      <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
                        <span>Urutan: {material.order}</span>
                        <span>
                          {material.createdAt && `Dibuat: ${new Date(material.createdAt).toLocaleDateString('id-ID')}`}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {materials.length === 0 && !loading && (
              <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada materi</h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  Mulai dengan membuat materi pertama untuk section `{section.title}`
                </p>
                <button 
                  onClick={handleCreateMaterial}
                  disabled={loading}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95 flex items-center gap-2 mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-5 h-5" />
                  Buat Materi Pertama
                </button>
              </div>
            )}
          </div>
        </div>
      </LayoutNavbar>
      <Footer/>

      {/* Create/Edit Material Modal */}
      {showMaterialModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-gray-200 shadow-2xl">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-white">
              <h3 className="text-xl font-bold text-gray-900">
                {editingMaterial ? 'Edit Materi' : 'Tambah Materi Baru'}
              </h3>
              <button 
                onClick={() => {
                  setShowMaterialModal(false)
                  resetMaterialForm()
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                disabled={loading}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="flex-1 overflow-y-auto">
              <form onSubmit={handleSubmitMaterial} className="p-6">
                <div className="space-y-6">
                  {/* Title Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Judul Materi *
                    </label>
                    <input
                      type="text"
                      name="title"
                      required
                      value={materialForm.title}
                      onChange={handleMaterialInputChange}
                      disabled={loading}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 disabled:opacity-50 bg-white"
                      placeholder={`Masukkan judul materi (minimal ${VALIDATION_RULES.title.minLength} karakter)`}
                      minLength={VALIDATION_RULES.title.minLength}
                      maxLength={VALIDATION_RULES.title.maxLength}
                    />
                    <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                      <Info className="w-3 h-3" />
                      <span>
                        {materialForm.title.length}/{VALIDATION_RULES.title.maxLength} karakter
                        {materialForm.title.length > 0 && materialForm.title.length < VALIDATION_RULES.title.minLength && (
                          <span className="text-red-500 ml-2">
                            (Minimal {VALIDATION_RULES.title.minLength} karakter)
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                  
                  {/* Content Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Konten Materi
                    </label>
                    <textarea
                      name="content"
                      value={materialForm.content}
                      onChange={handleMaterialInputChange}
                      rows={4}
                      disabled={loading}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 resize-none disabled:opacity-50 bg-white"
                      placeholder="Deskripsi atau konten materi (opsional)"
                    />
                  </div>

                  {/* File Uploads */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Video Upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Video Materi
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-500 transition-colors">
                        <Video className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 mb-1">Upload video materi</p>
                        <p className="text-xs text-gray-500 mb-2">
                          Format: {VALIDATION_RULES.files.video.formats.join(', ')} | Maks: 50MB
                        </p>
                        <input
                          type="file"
                          accept={VALIDATION_RULES.files.video.formats.join(',')}
                          onChange={handleFileChange('video')}
                          disabled={loading}
                          className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                      </div>
                    </div>

                    {/* Material File Upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        File Materi
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-500 transition-colors">
                        <File className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 mb-1">Upload file materi</p>
                        <p className="text-xs text-gray-500 mb-2">
                          Format: {VALIDATION_RULES.files.materialFile.formats.join(', ')} | Maks: 10MB
                        </p>
                        <input
                          type="file"
                          accept={VALIDATION_RULES.files.materialFile.formats.join(',')}
                          onChange={handleFileChange('materialFile')}
                          disabled={loading}
                          className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                      </div>
                    </div>

                    {/* Ringkasan Upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        File Ringkasan
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-500 transition-colors">
                        <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 mb-1">Upload file ringkasan</p>
                        <p className="text-xs text-gray-500 mb-2">
                          Format: {VALIDATION_RULES.files.ringkasan.formats.join(', ')} | Maks: 10MB
                        </p>
                        <input
                          type="file"
                          accept={VALIDATION_RULES.files.ringkasan.formats.join(',')}
                          onChange={handleFileChange('ringkasan')}
                          disabled={loading}
                          className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                      </div>
                    </div>

                    {/* Template Upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        File Template
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-500 transition-colors">
                        <File className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 mb-1">Upload file template</p>
                        <p className="text-xs text-gray-500 mb-2">
                          Format: {VALIDATION_RULES.files.template.formats.join(', ')} | Maks: 10MB
                        </p>
                        <input
                          type="file"
                          accept={VALIDATION_RULES.files.template.formats.join(',')}
                          onChange={handleFileChange('template')}
                          disabled={loading}
                          className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                      </div>
                    </div>

                    {/* Thumbnail Upload */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Thumbnail
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-500 transition-colors">
                        <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 mb-1">Upload thumbnail materi</p>
                        <p className="text-xs text-gray-500 mb-2">
                          Format: {VALIDATION_RULES.files.thumnail.formats.join(', ')} | Maks: 5MB
                        </p>
                        <input
                          type="file"
                          accept={VALIDATION_RULES.files.thumnail.formats.join(',')}
                          onChange={handleFileChange('thumnail')}
                          disabled={loading}
                          className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex gap-3 justify-end mt-8 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowMaterialModal(false)
                      resetMaterialForm()
                    }}
                    disabled={loading}
                    className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors font-medium disabled:opacity-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={loading || materialForm.title.length < VALIDATION_RULES.title.minLength}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Menyimpan...
                      </>
                    ) : (
                      editingMaterial ? 'Simpan Perubahan' : 'Buat Materi'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Detail Material Modal */}
      {showDetailModal && detailMaterial && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-6xl w-full max-h-[95vh] overflow-hidden flex flex-col border border-gray-200 shadow-2xl">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-white">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Detail Materi
                </h3>
                <p className="text-gray-600 text-sm mt-1">
                  Informasi lengkap tentang materi pembelajaran
                </p>
              </div>
              <button 
                onClick={() => {
                  setShowDetailModal(false)
                  setDetailMaterial(null)
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6">
                {detailLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                      {/* Thumbnail */}
                      {detailMaterial.thumnail_path && (
                        <div className="rounded-lg overflow-hidden bg-gray-100">
                          <img 
                            src={detailMaterial.thumnail_path} 
                            alt={detailMaterial.title}
                            className="w-full h-48 object-cover"
                          />
                        </div>
                      )}

                      {/* Video Player */}
                      {detailMaterial.video_path && (
                        <div className="bg-black rounded-lg overflow-hidden">
                          <video 
                            controls 
                            className="w-full h-auto max-h-96"
                            poster={detailMaterial.thumnail_path}
                          >
                            <source src={detailMaterial.video_path} type="video/mp4" />
                            Browser Anda tidak mendukung pemutar video.
                          </video>
                        </div>
                      )}

                      {/* Video External Link */}
                      {detailMaterial.video_path && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Video className="w-5 h-5 text-blue-600" />
                              <div>
                                <p className="font-medium text-blue-900">Video Materi</p>
                                <p className="text-sm text-blue-700">
                                  Buka video di tab baru jika mengalami masalah pemutaran
                                </p>
                              </div>
                            </div>
                            <a 
                              href={detailMaterial.video_path}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                            >
                              <ExternalLink className="w-4 h-4" />
                              Buka Video
                            </a>
                          </div>
                        </div>
                      )}

                      {/* Content */}
                      <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h4 className="text-lg font-bold text-gray-900 mb-4">Deskripsi Materi</h4>
                        <div className="prose max-w-none">
                          <p className="text-gray-700 whitespace-pre-line">
                            {detailMaterial.content || 'Tidak ada deskripsi yang tersedia.'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Sidebar - Info & Files */}
                    <div className="space-y-6">
                      {/* Basic Info */}
                      {/* <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h4 className="text-lg font-bold text-gray-900 mb-4">Informasi Materi</h4>
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm font-medium text-gray-500">Judul</p>
                            <p className="text-gray-900 font-semibold">{detailMaterial.title}</p>
                          </div>
                          {detailMaterial.xp && (
                            <div>
                              <p className="text-sm font-medium text-gray-500">XP</p>
                              <p className="text-green-600 font-semibold">+{detailMaterial.xp} XP</p>
                            </div>
                          )}
                          {detailMaterial.createdAt && (
                            <div>
                              <p className="text-sm font-medium text-gray-500">Dibuat</p>
                              <p className="text-gray-700">{formatDate(detailMaterial.createdAt)}</p>
                            </div>
                          )}
                          {detailMaterial.updatedAt && (
                            <div>
                              <p className="text-sm font-medium text-gray-500">Diperbarui</p>
                              <p className="text-gray-700">{formatDate(detailMaterial.updatedAt)}</p>
                            </div>
                          )}
                        </div>
                      </div> */}

                      {/* File Attachments */}
                      <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h4 className="text-lg font-bold text-gray-900 mb-4">File Terlampir</h4>
                        <div className="space-y-3">
                          {detailMaterial.materialFilePath && (
                            <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                              <div className="flex items-center gap-2">
                                <File className="w-4 h-4 text-green-600" />
                                <span className="text-sm text-gray-700">File Materi</span>
                              </div>
                              <a 
                                href={detailMaterial.materialFilePath}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-green-600 hover:text-green-800 transition-colors"
                                title="Download File Materi"
                              >
                                <Download className="w-4 h-4" />
                              </a>
                            </div>
                          )}

                          {detailMaterial.ringkasanPath && (
                            <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                              <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-purple-600" />
                                <span className="text-sm text-gray-700">Ringkasan</span>
                              </div>
                              <a 
                                href={detailMaterial.ringkasanPath}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-purple-600 hover:text-purple-800 transition-colors"
                                title="Download Ringkasan"
                              >
                                <Download className="w-4 h-4" />
                              </a>
                            </div>
                          )}

                          {detailMaterial.templatePath && (
                            <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                              <div className="flex items-center gap-2">
                                <File className="w-4 h-4 text-orange-600" />
                                <span className="text-sm text-gray-700">Template</span>
                              </div>
                              <a 
                                href={detailMaterial.templatePath}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-orange-600 hover:text-orange-800 transition-colors"
                                title="Download Template"
                              >
                                <Download className="w-4 h-4" />
                              </a>
                            </div>
                          )}

                          {!detailMaterial.materialFilePath && !detailMaterial.ringkasanPath && !detailMaterial.templatePath && (
                            <p className="text-gray-500 text-sm text-center py-4">
                              Tidak ada file terlampir
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h4 className="text-lg font-bold text-gray-900 mb-4">Aksi</h4>
                        <div className="space-y-3">
                          <button
                            onClick={() => {
                              setShowDetailModal(false)
                              handleEditMaterial(detailMaterial)
                            }}
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                          >
                            <Edit className="w-4 h-4" />
                            Edit Materi
                          </button>
                          <button
                            onClick={() => {
                              setShowDetailModal(false)
                              openDeleteConfirm(detailMaterial.id, detailMaterial.title)
                            }}
                            className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            Hapus Materi
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
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
                Apakah Anda yakin ingin menghapus materi <span className="font-semibold text-gray-900">`{showDeleteConfirm.materialTitle}`</span>? Tindakan ini tidak dapat dibatalkan.
              </p>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowDeleteConfirm({ show: false, materialId: null, materialTitle: '' })}
                  disabled={loading}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors font-medium disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  onClick={() => showDeleteConfirm.materialId && handleDeleteMaterial(showDeleteConfirm.materialId)}
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