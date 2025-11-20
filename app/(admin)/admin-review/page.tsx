'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import LayoutNavbar from '@/components/public/LayoutNavbar'
import { Star, Search, CheckCircle, XCircle, Eye, Calendar, User, BookOpen, Trash2, AlertTriangle, X } from 'lucide-react'
import Footer from '@/components/public/Footer'

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

export default function ReviewManagement() {
  const router = useRouter()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterApproved, setFilterApproved] = useState<'all' | 'approved' | 'pending'>('all')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [reviewToDelete, setReviewToDelete] = useState<Review | null>(null)

  const fetchReviews = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const token = localStorage.getItem("token")
      
      if (!token) {
        setError('Token tidak ditemukan. Silakan login kembali.')
        setLoading(false)
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reviews/admin/all?search=${searchTerm}`, {
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
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: ApiResponseReviews = await response.json()
      
      if (data.success) {
        setReviews(data.data)
      } else {
        throw new Error('Gagal memuat data review')
      }

    } catch (err) {
      console.error('Error fetching reviews:', err)
      setError('Gagal memuat data review. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  const approveReview = async (reviewId: number) => {
    try {
      const token = localStorage.getItem("token")
      
      if (!token) {
        setError('Token tidak ditemukan. Silakan login kembali.')
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reviews/admin/${reviewId}/approve`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success) {
        // Update local state
        setReviews(prev => prev.map(review => 
          review.id === reviewId ? { ...review, isApproved: true } : review
        ))
      } else {
        throw new Error('Gagal approve review')
      }

    } catch (err) {
      console.error('Error approving review:', err)
      setError('Gagal approve review. Silakan coba lagi.')
    }
  }

  const deleteReview = async () => {
    if (!reviewToDelete) return
    setDeleteLoading(true)
    try {
      const token = localStorage.getItem("token")
      
      if (!token) {
        setError('Token tidak ditemukan. Silakan login kembali.')
        setDeleteLoading(false)
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reviews/admin/${reviewToDelete.id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success) {
        // Remove from local state
        setReviews(prev => prev.filter(review => review.id !== reviewToDelete.id))
        setShowDeleteConfirm(false)
        setReviewToDelete(null)
      } else {
        throw new Error('Gagal menghapus review')
      }

    } catch (err) {
      console.error('Error deleting review:', err)
      setError('Gagal menghapus review. Silakan coba lagi.')
    } finally {
      setDeleteLoading(false)
    }
  }

  // Filter reviews based on search term and approval status
  const filteredReviews = reviews.filter(review => {
    const matchesSearch = 
      review.User.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.Class.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.comment.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = 
      filterApproved === 'all' ||
      (filterApproved === 'approved' && review.isApproved) ||
      (filterApproved === 'pending' && !review.isApproved)
    
    return matchesSearch && matchesFilter
  })

  useEffect(() => {
    fetchReviews()
  }, [searchTerm])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'text-amber-500 fill-amber-500' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    )
  }

  return (
    <>
      <LayoutNavbar>
        <div className="min-h-screen bg-gray-50 pt-16 md:pt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-amber-100 p-2 rounded-lg">
                  <Star className="w-6 h-6 text-amber-600" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Kelola Review
                </h1>
              </div>
              <p className="text-gray-600">
                Kelola dan moderasi review dari siswa untuk berbagai kelas
              </p>
            </div>

            {/* Error State */}
            {error && (
              <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                <p>{error}</p>
                {error.includes('login kembali') && (
                  <button 
                    onClick={() => router.push('/auth/login')}
                    className="mt-2 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                  >
                    Login Kembali
                  </button>
                )}
              </div>
            )}

            {/* Filters and Search */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Cari berdasarkan nama siswa, kelas, atau komentar..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <select
                    value={filterApproved}
                    onChange={(e) => setFilterApproved(e.target.value as 'all' | 'approved' | 'pending')}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  >
                    <option value="all">Semua Status</option>
                    <option value="approved">Approved</option>
                    <option value="pending">Pending</option>
                  </select>
                  <button
                    onClick={fetchReviews}
                    className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                  >
                    Refresh
                  </button>
                </div>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
                <p className="text-gray-600 mt-4">Memuat data review...</p>
              </div>
            )}

            {/* Reviews List */}
            {!loading && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {filteredReviews.length === 0 ? (
                  <div className="text-center py-12">
                    <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">Tidak ada review ditemukan</p>
                    <p className="text-gray-400 text-sm mt-2">
                      {searchTerm || filterApproved !== 'all' 
                        ? 'Coba ubah pencarian atau filter' 
                        : 'Belum ada review yang tersedia'
                      }
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {filteredReviews.map((review) => (
                      <div key={review.id} className="p-6 hover:bg-gray-50 transition-colors">
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                          {/* Review Content */}
                          <div className="flex-1">
                            <div className="flex items-start gap-3 mb-3">
                              <img
                                src={review.User.profileImage}
                                alt={review.User.name}
                                className="w-10 h-10 rounded-full"
                              />
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-semibold text-gray-900">
                                    {review.User.name}
                                  </h3>
                                  {review.isApproved ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                                      <CheckCircle className="w-3 h-3" />
                                      Approved
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                                      <Eye className="w-3 h-3" />
                                      Pending
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                                  <div className="flex items-center gap-1">
                                    <User className="w-3 h-3" />
                                    <span>@{review.User.username}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <BookOpen className="w-3 h-3" />
                                    <span>Kelas: {review.Class.name}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    <span>{formatDate(review.createdAt)}</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Rating */}
                            <div className="mb-3">
                              {renderStars(review.rating)}
                            </div>

                            {/* Comment */}
                            <p className="text-gray-700 bg-gray-50 rounded-lg p-3">
                              {review.comment}
                            </p>
                          </div>

                          {/* Actions */}
                          {!review.isApproved && (
                            <div className="flex lg:flex-col gap-2">
                              <button
                                onClick={() => approveReview(review.id)}
                                className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                              >
                                <CheckCircle className="w-4 h-4" />
                                Approve
                              </button>
                              <button
                                onClick={() => { setReviewToDelete(review); setShowDeleteConfirm(true) }}
                                className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                              >
                                <XCircle className="w-4 h-4" />
                                Hapus
                              </button>
                            </div>
                          )}
                          {review.isApproved && (
                            <div className="flex lg:flex-col gap-2">
                              <button
                                onClick={() => { setReviewToDelete(review); setShowDeleteConfirm(true) }}
                                className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                              >
                                <XCircle className="w-4 h-4" />
                                Hapus
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Stats Summary */}
            {!loading && reviews.length > 0 && (
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Star className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{reviews.length}</p>
                      <p className="text-sm text-gray-600">Total Review</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {reviews.filter(r => r.isApproved).length}
                      </p>
                      <p className="text-sm text-gray-600">Approved</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <Eye className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {reviews.filter(r => !r.isApproved).length}
                      </p>
                      <p className="text-sm text-gray-600">Pending</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </LayoutNavbar>
      <Footer />
      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && reviewToDelete && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Hapus Review</h3>
                  <p className="text-sm text-gray-600">Tindakan ini tidak dapat dibatalkan.</p>
                </div>
              </div>
              <button
                onClick={() => { if (!deleteLoading) { setShowDeleteConfirm(false); setReviewToDelete(null) } }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-700">
                Apakah Anda yakin ingin menghapus review dari <span className="font-semibold">{reviewToDelete.User.name}</span> untuk kelas <span className="font-semibold">{reviewToDelete.Class.name}</span>?
              </p>
              <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                `{reviewToDelete.comment}`
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setShowDeleteConfirm(false); setReviewToDelete(null) }}
                disabled={deleteLoading}
                className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={deleteReview}
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
                    Hapus
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}