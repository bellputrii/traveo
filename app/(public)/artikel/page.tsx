// app/(public)/artikel/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import { Navbar } from '@/components/public/Navbar';
import { 
  BookOpen, ArrowRight, RefreshCw, AlertTriangle, X, 
  Calendar, User, Clock, AlertCircle, CheckCircle, 
  Thermometer, Droplets, Shield, Sprout
} from 'lucide-react';

interface Article {
  id: number;
  title: string;
  slug: string;
  category: string;
  thumbnailUrl: string;
  description: string;
  readTime?: string;
  date?: string;
}

interface ArticleDetail {
  id: number;
  title: string;
  slug: string;
  category: string;
  author: string;
  description: string;
  symptoms: string;
  causes: string;
  treatment: string;
  prevention: string;
  conclusion: string;
  thumbnailUrl: string;
  createdAt: string;
  diseaseId: number;
  disease: {
    name: string;
    code: string;
  };
}

export default function ArticlesPage() {
  const [activeMenu, setActiveMenu] = useState('artikel');
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<ArticleDetail | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // API Base URL
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://padicheckai-backend-production.up.railway.app";

  // Set mounted to true after component mounts (client-side only)
  useEffect(() => {
    setMounted(true);
  }, []);

  // Function to get token
  const getToken = (): string | null => {
    if (!mounted) return null;
    return localStorage.getItem("token") || sessionStorage.getItem("token");
  };

  // Function to get category color
  const getCategoryColor = (category: string): string => {
    const categoryColorMap: Record<string, string> = {
      "Tungro": "bg-yellow-100 text-yellow-800",
      "Blast": "bg-red-100 text-red-800",
      "Blast Daun (Leaf Blast)": "bg-red-100 text-red-800",
      "Bacterial Blight": "bg-blue-100 text-blue-800",
      "Brown Spot": "bg-orange-100 text-orange-800",
      "Narrow Brown Spot": "bg-indigo-100 text-indigo-800",
      "Leaf Scald": "bg-purple-100 text-purple-800",
      "Hawar Daun Bakteri (BLB/Kresek)": "bg-blue-100 text-blue-800",
      "Hawar Pelepah (Leaf Scald)": "bg-purple-100 text-purple-800",
      "Umum": "bg-green-100 text-green-800"
    };
    
    return categoryColorMap[category] || "bg-gray-100 text-gray-800";
  };

  // Function to get estimated read time based on description length
  const getReadTime = (description: string): string => {
    const wordCount = description.split(' ').length;
    const minutes = Math.ceil(wordCount / 200);
    return `${minutes} min read`;
  };

  // Function to format date
  const formatDate = (): string => {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = { month: 'short', year: 'numeric' };
    return now.toLocaleDateString('id-ID', options);
  };

  // Function to format date for display
  const formatDisplayDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return formatDate();
    }
  };

  // Function to fetch articles from API
  const fetchArticles = async () => {
    const token = getToken();
    
    if (!token) {
      setError('Anda belum login. Silakan login terlebih dahulu untuk melihat artikel.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/articles`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: Article[] = await response.json();
      
      // Enhance articles with additional data
      const enhancedArticles = data.map(article => ({
        ...article,
        readTime: getReadTime(article.description),
        date: formatDate()
      }));
      
      setArticles(enhancedArticles);
      setError(null);
    } catch (err) {
      console.error('Error fetching articles:', err);
      setError('Gagal mengambil data artikel. Menggunakan data contoh.');
      
      // Fallback to example data
      const exampleArticles: Article[] = [
        {
          id: 1,
          category: "Tungro",
          title: "Cara Mengatasi Penyakit Tungro pada Padi",
          slug: "cara-mengatasi-penyakit-tungro-pada-padi",
          thumbnailUrl: "https://images.unsplash.com/photo-1625246335522-3f9d7c5e5580?w=400&h-250&fit=crop",
          description: "Panduan lengkap untuk mengidentifikasi, mencegah, dan mengatasi penyakit Tungro pada tanaman padi. Pelajari gejala, penyebab, dan solusi pengendalian yang efektif.",
          readTime: "5 min read",
          date: "Mar 2024"
        },
        {
          id: 2,
          category: "Blast",
          title: "Blast: Gejala dan Penanganannya",
          slug: "blast-gejala-dan-penanganan",
          thumbnailUrl: "https://images.unsplash.com/photo-1586773860418-dc22f8b874bc?w=400&h=250&fit=crop",
          description: "Pelajari cara mengenali gejala awal penyakit Blast dan metode pengendalian yang efektif sebelum menyebar ke seluruh lahan pertanian.",
          readTime: "4 min read",
          date: "Mar 2024"
        },
        {
          id: 3,
          category: "Bacterial Blight",
          title: "Pencegahan Bacterial Blight",
          slug: "pencegahan-bacterial-blight",
          thumbnailUrl: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400&h=250&fit=crop",
          description: "Langkah-langkah pencegahan dan pengendalian Bacterial Blight untuk melindungi tanaman padi Anda dari kerusakan serius.",
          readTime: "6 min read",
          date: "Mar 2024"
        },
        {
          id: 4,
          category: "Brown Spot",
          title: "Mengenal Brown Spot pada Daun Padi",
          slug: "mengenal-brown-spot",
          thumbnailUrl: "https://images.unsplash.com/photo-1560493676-04071c5f467b?w=400&h=250&fit=crop",
          description: "Informasi lengkap tentang penyakit Brown Spot, mulai dari penyebab hingga cara pengendalian yang efektif untuk meningkatkan produktivitas.",
          readTime: "4 min read",
          date: "Mar 2024"
        },
        {
          id: 5,
          category: "Umum",
          title: "Nutrisi Tanaman untuk Mencegah Penyakit",
          slug: "nutrisi-tanaman-untuk-mencegah-penyakit",
          thumbnailUrl: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=250&fit=crop",
          description: "Pentingnya nutrisi yang tepat untuk meningkatkan ketahanan tanaman padi terhadap berbagai penyakit. Panduan pemupukan yang benar.",
          readTime: "7 min read",
          date: "Mar 2024"
        },
        {
          id: 6,
          category: "Umum",
          title: "Praktik Terbaik dalam Budidaya Padi",
          slug: "praktik-terbaik-dalam-budidaya-padi",
          thumbnailUrl: "https://images.unsplash.com/photo-1625246335522-3f9d7c5e5580?w=400&h=250&fit=crop",
          description: "Kumpulan praktik terbaik untuk budidaya padi yang sehat dan produktif. Teknik modern yang dapat meningkatkan hasil panen.",
          readTime: "8 min read",
          date: "Mar 2024"
        }
      ];
      
      setArticles(exampleArticles);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Function to fetch article detail
  const fetchArticleDetail = async (slug: string) => {
    const token = getToken();
    
    if (!token) {
      setModalError('Anda belum login. Silakan login terlebih dahulu.');
      return;
    }

    setModalLoading(true);
    setModalError(null);

    try {
      const response = await fetch(`${API_URL}/articles/${slug}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setSelectedArticle(result.data);
      } else {
        throw new Error('Gagal mengambil data artikel');
      }
    } catch (err) {
      console.error('Error fetching article detail:', err);
      setModalError('Gagal memuat detail artikel. Silakan coba lagi.');
      
      // Fallback to mock data for demonstration
      setSelectedArticle({
        id: 2,
        title: "Mengenal Brown Spot pada Daun Padi",
        slug: "mengenal-brown-spot",
        category: "Brown Spot",
        author: "Admin",
        description: "Informasi lengkap tentang penyakit Brown Spot, mulai dari penyebab hingga cara pengendalian yang efektif.",
        symptoms: "Bercak berbentuk oval atau bulat seperti biji wijen. Berwarna coklat dengan titik pusat abu-abu atau putih. Daun bisa mengering jika parah.",
        causes: "Disebabkan oleh jamur *Bipolaris oryzae*. Faktor pemicu utama adalah kekurangan unsur hara (terutama Kalium & Silika) dan tanah yang kurus.",
        treatment: "Semprotkan fungisida berbahan aktif Difenokonazol atau Propikonazol. Tambahkan pupuk KCL untuk memperkuat daun.",
        prevention: "Gunakan benih yang sehat (seed treatment), pemupukan berimbang, dan jangan biarkan lahan tergenang terus menerus.",
        conclusion: "Brown Spot adalah indikator kesehatan tanah. Selain obat kimia, perbaikan kualitas tanah adalah kunci jangka panjang.",
        thumbnailUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Brown_spot_of_rice_02.jpg/640px-Brown_spot_of_rice_02.jpg",
        createdAt: "2025-12-04T22:48:16.921Z",
        diseaseId: 2,
        disease: {
          name: "Bercak Coklat (Brown Spot)",
          code: "brown_spot"
        }
      });
    } finally {
      setModalLoading(false);
    }
  };

  // Function to refresh articles
  const refreshArticles = async () => {
    setRefreshing(true);
    await fetchArticles();
  };

  // Initial data fetch
  useEffect(() => {
    if (!mounted) return;
    
    fetchArticles();
  }, [mounted]);

  // Handle article click
  const handleArticleClick = async (slug: string) => {
    setIsModalOpen(true);
    await fetchArticleDetail(slug);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedArticle(null);
    setModalError(null);
  };

  // Don't render anything until component is mounted
  if (!mounted) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <div className="w-64"></div>
        <div className="ml-64 flex-1">
          <main className="p-6">
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="h-40 bg-gray-200 animate-pulse"></div>
                  <div className="p-5 space-y-3">
                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-6 w-full bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-12 w-full bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
        
        <div className="ml-64 flex-1">
          <Navbar activeMenu={activeMenu} />
          
          <main className="p-6 space-y-6">
            {/* Header Section */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Artikel & Panduan</h1>
                  <p className="text-gray-600 mt-1">
                    Kumpulan artikel dan panduan lengkap tentang penyakit padi dan cara penanganannya
                  </p>
                </div>
                <button
                  onClick={refreshArticles}
                  disabled={refreshing}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    refreshing
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                  }`}
                >
                  <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                  {refreshing ? 'Menyegarkan...' : 'Refresh'}
                </button>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <AlertTriangle className="h-5 w-5 mr-2" />
                      <span>{error}</span>
                    </div>
                    <button 
                      onClick={refreshArticles}
                      className="text-red-700 hover:text-red-900 text-sm font-medium"
                    >
                      Coba lagi
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-pulse">
                    <div className="h-40 bg-gray-200"></div>
                    <div className="p-5 space-y-3">
                      <div className="flex justify-between">
                        <div className="h-4 w-20 bg-gray-200 rounded"></div>
                        <div className="h-4 w-16 bg-gray-200 rounded"></div>
                      </div>
                      <div className="h-6 w-full bg-gray-200 rounded"></div>
                      <div className="h-12 w-full bg-gray-200 rounded"></div>
                      <div className="h-4 w-32 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                {/* Articles Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {articles.map((article) => (
                    <div 
                      key={article.id} 
                      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
                      onClick={() => handleArticleClick(article.slug)}
                    >
                      {/* Article Thumbnail */}
                      <div className="relative h-40 w-full overflow-hidden">
                        <div 
                          className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-300"
                          style={{ 
                            backgroundImage: `url(${article.thumbnailUrl})`,
                            backgroundColor: '#10B981'
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                        <div className="absolute bottom-4 left-4 text-white">
                          <BookOpen className="w-8 h-8 mb-2" />
                          <span className="text-sm font-medium">Artikel</span>
                        </div>
                      </div>

                      {/* Article Content */}
                      <div className="p-5 flex flex-col gap-3">
                        {/* Category and Time */}
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-xs px-3 py-1 rounded-md font-medium ${getCategoryColor(article.category)}`}
                          >
                            {article.category}
                          </span>
                          <div className="text-xs text-gray-500">
                            {article.readTime} • {article.date}
                          </div>
                        </div>

                        {/* Title */}
                        <h3 className="font-bold text-gray-900 text-base leading-tight line-clamp-2">
                          {article.title}
                        </h3>

                        {/* Description */}
                        <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                          {article.description}
                        </p>

                        {/* Read More Link */}
                        <div className="text-emerald-600 hover:text-emerald-700 font-medium text-sm mt-2 inline-flex items-center gap-1 group">
                          Baca Selengkapnya 
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Info Section */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Tips Membaca Artikel</h3>
                  <ul className="text-sm text-gray-600 space-y-2 list-disc ml-5">
                    <li>Pilih artikel berdasarkan kategori penyakit yang ingin dipelajari</li>
                    <li>Baca artikel secara lengkap untuk pemahaman yang lebih baik</li>
                    <li>Terapkan pengetahuan dari artikel dengan bijak di lahan pertanian</li>
                    <li>Simpan artikel favorit untuk referensi di kemudian hari</li>
                    <li>Artikel diperbarui secara berkala dengan informasi terkini</li>
                  </ul>
                </div>
              </>
            )}

            {/* Empty State */}
            {!loading && articles.length === 0 && (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada artikel tersedia</h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  Artikel akan segera tersedia. Silakan coba lagi nanti atau hubungi administrator untuk informasi lebih lanjut.
                </p>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Modal Detail Artikel */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50">
          {/* Overlay with blurred background */}
          <div 
            className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
            onClick={closeModal}
          />
          
          {/* Modal Content Container */}
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              {/* Modal Content */}
              <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
                {/* Modal Header */}
                <div className="sticky top-0 z-10 bg-white px-6 pt-5 pb-4 border-b border-gray-200">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`text-xs px-3 py-1 rounded-md font-medium ${getCategoryColor(selectedArticle?.category || '')}`}>
                          {selectedArticle?.category}
                        </span>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {selectedArticle ? formatDisplayDate(selectedArticle.createdAt) : ''}
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {selectedArticle?.author || 'Admin'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {selectedArticle ? getReadTime(selectedArticle.description) : ''}
                          </span>
                        </div>
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-3 pr-8">
                        {selectedArticle?.title}
                      </h2>
                      <p className="text-gray-600 mb-2">
                        {selectedArticle?.description}
                      </p>
                    </div>
                    <button
                      onClick={closeModal}
                      className="absolute right-4 top-4 flex-shrink-0 rounded-lg p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Modal Content - Scrollable */}
                <div className="overflow-y-auto max-h-[calc(90vh-140px)] px-6 pb-6">
                  {/* Modal Loading State */}
                  {modalLoading && (
                    <div className="space-y-4 py-4">
                      {[...Array(4)].map((_, i) => (
                        <div key={i}>
                          <div className="h-4 w-32 bg-gray-200 rounded mb-2"></div>
                          <div className="h-20 w-full bg-gray-200 rounded"></div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Modal Error State */}
                  {modalError && !modalLoading && (
                    <div className="py-4">
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center">
                          <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
                          <span className="text-red-700 text-sm">{modalError}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Modal Content */}
                  {selectedArticle && !modalLoading && !modalError && (
                    <div className="space-y-6 py-4">
                      {/* Thumbnail */}
                      <div className="relative h-64 rounded-xl overflow-hidden">
                        <img
                          src={selectedArticle.thumbnailUrl}
                          alt={selectedArticle.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = `https://via.placeholder.com/800x400/10B981/FFFFFF?text=${encodeURIComponent(selectedArticle.title)}`;
                          }}
                        />
                      </div>

                      {/* Disease Info */}
                      <div className="bg-emerald-50 rounded-xl p-5">
                        <h3 className="font-semibold text-emerald-800 mb-3 flex items-center gap-2">
                          <Thermometer className="w-5 h-5" />
                          Informasi Penyakit
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-1">Nama Penyakit</p>
                            <p className="text-gray-900">{selectedArticle.disease.name}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-1">Kode Penyakit</p>
                            <p className="text-gray-900 font-mono">{selectedArticle.disease.code}</p>
                          </div>
                        </div>
                      </div>

                      {/* Gejala */}
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <AlertCircle className="w-5 h-5 text-red-500" />
                          Gejala yang Terlihat
                        </h3>
                        <div className="bg-red-50 border border-red-100 rounded-lg p-4">
                          <p className="text-gray-700 whitespace-pre-line">{selectedArticle.symptoms}</p>
                        </div>
                      </div>

                      {/* Penyebab */}
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <Droplets className="w-5 h-5 text-blue-500" />
                          Penyebab Utama
                        </h3>
                        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                          <p className="text-gray-700 whitespace-pre-line">{selectedArticle.causes}</p>
                        </div>
                      </div>

                      {/* Grid: Treatment dan Prevention */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Pengobatan */}
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <Shield className="w-5 h-5 text-purple-500" />
                            Pengobatan
                          </h3>
                          <div className="bg-purple-50 border border-purple-100 rounded-lg p-4">
                            <p className="text-gray-700 whitespace-pre-line">{selectedArticle.treatment}</p>
                          </div>
                        </div>

                        {/* Pencegahan */}
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            Pencegahan
                          </h3>
                          <div className="bg-green-50 border border-green-100 rounded-lg p-4">
                            <p className="text-gray-700 whitespace-pre-line">{selectedArticle.prevention}</p>
                          </div>
                        </div>
                      </div>

                      {/* Kesimpulan */}
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <Sprout className="w-5 h-5 text-emerald-600" />
                          Kesimpulan
                        </h3>
                        <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4">
                          <p className="text-gray-700 whitespace-pre-line">{selectedArticle.conclusion}</p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 mt-6">
                        <button
                          onClick={closeModal}
                          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                        >
                          Tutup
                        </button>
                        <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2">
                          <BookOpen className="w-4 h-4" />
                          Simpan Artikel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}