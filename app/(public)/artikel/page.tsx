// app/(public)/artikel/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import { Navbar } from '@/components/public/Navbar';
import { 
  BookOpen, ArrowRight, RefreshCw, AlertTriangle, X, 
  Calendar, User, Clock, AlertCircle, CheckCircle, 
  Thermometer, Droplets, Shield, Sprout, FileText,
  ChevronRight, Tag, Globe, ShieldAlert, ChevronDown,
  Plus, Edit, Trash2, Save, AlertOctagon, Image as ImageIcon,
  Menu, Search, Filter
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
  disease?: {
    name: string;
    code: string;
  };
}

interface ArticleFormData {
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
  diseaseId: number;
}

export default function ArticlesPage() {
  const [activeMenu, setActiveMenu] = useState('artikel');
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<ArticleDetail | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // CRUD Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [crudLoading, setCrudLoading] = useState(false);
  const [crudError, setCrudError] = useState<string | null>(null);
  const [formData, setFormData] = useState<ArticleFormData>({
    title: '',
    slug: '',
    category: 'Umum',
    author: '',
    description: '',
    symptoms: '',
    causes: '',
    treatment: '',
    prevention: '',
    conclusion: '',
    thumbnailUrl: '',
    diseaseId: 0
  });

  // Show More states
  const [displayCount, setDisplayCount] = useState(6);
  const [showMoreLoading, setShowMoreLoading] = useState(false);

  // API Base URL
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://padicheckai-backend-production.up.railway.app";

  // Ref untuk modal
  const modalRef = useRef<HTMLDivElement>(null);

  // Set mounted to true after component mounts (client-side only)
  useEffect(() => {
    setMounted(true);
  }, []);

  // Function to get token
  const getToken = (): string | null => {
    if (!mounted) return null;
    return localStorage.getItem("token") || sessionStorage.getItem("token");
  };

  // Function to get user role
  const getUserRole = (): string | null => {
    if (!mounted) return null;
    return localStorage.getItem('userRole') || sessionStorage.getItem('userRole');
  };

  // Function to get category color
  const getCategoryColor = (category: string): string => {
    const categoryColorMap: Record<string, string> = {
      "Tungro": "bg-yellow-100 text-yellow-800 border-yellow-200",
      "Blast": "bg-red-100 text-red-800 border-red-200",
      "Blast Daun (Leaf Blast)": "bg-red-100 text-red-800 border-red-200",
      "Bacterial Blight": "bg-blue-100 text-blue-800 border-blue-200",
      "Brown Spot": "bg-orange-100 text-orange-800 border-orange-200",
      "Narrow Brown Spot": "bg-indigo-100 text-indigo-800 border-indigo-200",
      "Leaf Scald": "bg-purple-100 text-purple-800 border-purple-200",
      "Hawar Daun Bakteri (BLB/Kresek)": "bg-blue-100 text-blue-800 border-blue-200",
      "Hawar Pelepah (Leaf Scald)": "bg-purple-100 text-purple-800 border-purple-200",
      "Umum": "bg-green-100 text-green-800 border-green-200"
    };
    
    return categoryColorMap[category] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  // Function to get icon based on category
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Tungro':
      case 'Blast':
      case 'Bacterial Blight':
        return <ShieldAlert className="w-4 h-4" />;
      default:
        return <Tag className="w-4 h-4" />;
    }
  };

  // Get unique categories for filter
  const getUniqueCategories = () => {
    const categories = articles.map(article => article.category);
    return ['Semua', ...Array.from(new Set(categories))];
  };

  // Filter articles based on search and category
  const getFilteredArticles = () => {
    return articles.filter(article => {
      const matchesSearch = searchQuery === '' || 
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === 'Semua' || 
        article.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  };

  // Function to get estimated read time based on description length
  const getReadTime = (description: string): string => {
    const wordCount = description.split(' ').length;
    const minutes = Math.ceil(wordCount / 200);
    return `${minutes} menit`;
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

  // Function to format relative time
  const formatRelativeTime = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return 'Hari ini';
      if (diffDays === 1) return 'Kemarin';
      if (diffDays < 7) return `${diffDays} hari yang lalu`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} minggu yang lalu`;
      if (diffDays < 365) return `${Math.floor(diffDays / 30)} bulan yang lalu`;
      return `${Math.floor(diffDays / 365)} tahun yang lalu`;
    } catch {
      return 'Baru saja';
    }
  };

  // Function to generate fallback thumbnail
  const generateFallbackThumbnail = (title: string) => {
    const colors = ['10B981', '3B82F6', 'EF4444', 'F59E0B', '8B5CF6'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    return `https://via.placeholder.com/600x300/${color}/FFFFFF?text=${encodeURIComponent(title.substring(0, 30))}`;
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/articles`, {
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
        date: formatDate(),
        thumbnailUrl: article.thumbnailUrl || generateFallbackThumbnail(article.title)
      }));
      
      setArticles(enhancedArticles);
      setError(null);
    } catch (err) {
      console.error('Error fetching articles:', err);
      setError('Gagal mengambil data artikel. Menggunakan data contoh.');
      
      // Fallback to example data - extended to 12 items for testing show more
      const exampleArticles: Article[] = [
        {
          id: 1,
          category: "Tungro",
          title: "Cara Mengatasi Penyakit Tungro pada Padi",
          slug: "cara-mengatasi-penyakit-tungro-pada-padi",
          thumbnailUrl: "https://images.unsplash.com/photo-1625246335522-3f9d7c5e5580?w=400&h=250&fit=crop",
          description: "Panduan lengkap untuk mengidentifikasi, mencegah, dan mengatasi penyakit Tungro pada tanaman padi. Pelajari gejala, penyebab, dan solusi pengendalian yang efektif.",
          readTime: "5 menit",
          date: "Mar 2024"
        },
        {
          id: 2,
          category: "Blast",
          title: "Blast: Gejala dan Penanganannya",
          slug: "blast-gejala-dan-penanganan",
          thumbnailUrl: "https://images.unsplash.com/photo-1586773860418-dc22f8b874bc?w=400&h=250&fit=crop",
          description: "Pelajari cara mengenali gejala awal penyakit Blast dan metode pengendalian yang efektif sebelum menyebar ke seluruh lahan pertanian.",
          readTime: "4 menit",
          date: "Mar 2024"
        },
        {
          id: 3,
          category: "Bacterial Blight",
          title: "Pencegahan Bacterial Blight",
          slug: "pencegahan-bacterial-blight",
          thumbnailUrl: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400&h=250&fit=crop",
          description: "Langkah-langkah pencegahan dan pengendalian Bacterial Blight untuk melindungi tanaman padi Anda dari kerusakan serius.",
          readTime: "6 menit",
          date: "Mar 2024"
        },
        {
          id: 4,
          category: "Brown Spot",
          title: "Mengenal Brown Spot pada Daun Padi",
          slug: "mengenal-brown-spot",
          thumbnailUrl: "https://images.unsplash.com/photo-1560493676-04071c5f467b?w=400&h=250&fit=crop",
          description: "Informasi lengkap tentang penyakit Brown Spot, mulai dari penyebab hingga cara pengendalian yang efektif untuk meningkatkan produktivitas.",
          readTime: "4 menit",
          date: "Mar 2024"
        },
        {
          id: 5,
          category: "Umum",
          title: "Nutrisi Tanaman untuk Mencegah Penyakit",
          slug: "nutrisi-tanaman-untuk-mencegah-penyakit",
          thumbnailUrl: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=250&fit=crop",
          description: "Pentingnya nutrisi yang tepat untuk meningkatkan ketahanan tanaman padi terhadap berbagai penyakit. Panduan pemupukan yang benar.",
          readTime: "7 menit",
          date: "Mar 2024"
        },
        {
          id: 6,
          category: "Umum",
          title: "Praktik Terbaik dalam Budidaya Padi",
          slug: "praktik-terbaik-dalam-budidaya-padi",
          thumbnailUrl: "https://images.unsplash.com/photo-1625246335522-3f9d7c5e5580?w=400&h=250&fit=crop",
          description: "Kumpulan praktik terbaik untuk budidaya padi yang sehat dan produktif. Teknik modern yang dapat meningkatkan hasil panen.",
          readTime: "8 menit",
          date: "Mar 2024"
        },
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/articles/${slug}`, {
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
        const articleData = result.data;
        setSelectedArticle({
          ...articleData,
          disease: articleData.disease || {
            name: articleData.category || 'Tidak Diketahui',
            code: articleData.category?.toLowerCase().replace(/\s+/g, '_') || 'unknown'
          },
          thumbnailUrl: articleData.thumbnailUrl || generateFallbackThumbnail(articleData.title)
        });
      } else {
        throw new Error('Gagal mengambil data artikel');
      }
    } catch (err) {
      console.error('Error fetching article detail:', err);
      setModalError('Gagal memuat detail artikel. Silakan coba lagi.');
      
      setSelectedArticle({
        id: 2,
        title: "Mengenal Brown Spot pada Daun Padi",
        slug: "mengenal-brown-spot",
        category: "Brown Spot",
        author: "Admin PadiCheck AI",
        description: "Informasi lengkap tentang penyakit Brown Spot, mulai dari penyebab hingga cara pengendalian yang efektif untuk meningkatkan produktivitas tanaman padi Anda.",
        symptoms: "Bercak berbentuk oval atau bulat seperti biji wijen. Berwarna coklat dengan titik pusat abu-abu atau putih. Daun bisa mengering jika parah. Biasanya muncul pada daun tua terlebih dahulu.\n\nGejala tambahan: Lesi dapat menyatu membentuk bercak yang lebih besar, menyebabkan daun menguning dan gugur prematur.",
        causes: "Disebabkan oleh jamur *Bipolaris oryzae*. Faktor pemicu utama adalah:\n• Kekurangan unsur hara (terutama Kalium & Silika)\n• Tanah yang kurus dan miskin hara\n• Kondisi kelembaban tinggi\n• Suhu optimal 25-30°C\n• Penggunaan benih yang terinfeksi\n• Drainase yang buruk",
        treatment: "1. Semprotkan fungisida berbahan aktif Difenokonazol atau Propikonazol\n2. Tambahkan pupuk KCL untuk memperkuat daun\n3. Berikan pupuk daun mengandung silika\n4. Lakukan rotasi tanaman jika memungkinkan\n5. Buang dan hancurkan bagian tanaman yang terinfeksi berat",
        prevention: "1. Gunakan benih yang sehat (seed treatment)\n2. Pemupukan berimbang dengan perhatian khusus pada Kalium\n3. Jangan biarkan lahan tergenang terus menerus\n4. Pertahankan jarak tanam yang optimal\n5. Monitoring rutin kondisi tanaman\n6. Gunakan varietas tahan penyakit jika tersedia",
        conclusion: "Brown Spot adalah indikator kesehatan tanah. Selain pengobatan kimia, perbaikan kualitas tanah dan manajemen nutrisi adalah kunci jangka panjang. Deteksi dini dan penanganan tepat dapat mengurangi kerugian hingga 30%.",
        thumbnailUrl: "https://images.unsplash.com/photo-1560493676-04071c5f467b?w=600&h=300&fit=crop",
        createdAt: "2024-03-15T22:48:16.921Z",
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
    setDisplayCount(6); // Reset to initial display count
    await fetchArticles();
  };

  // Function to handle show more
  const handleShowMore = () => {
    setShowMoreLoading(true);
    setTimeout(() => {
      setDisplayCount(prev => prev + 6);
      setShowMoreLoading(false);
    }, 500);
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

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        if (isModalOpen) closeModal();
        if (isCreateModalOpen) setIsCreateModalOpen(false);
        if (isEditModalOpen) setIsEditModalOpen(false);
        if (isDeleteModalOpen) setIsDeleteModalOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isModalOpen, isCreateModalOpen, isEditModalOpen, isDeleteModalOpen]);

  // CRUD Functions
  const openCreateModal = () => {
    setFormData({
      title: '',
      slug: '',
      category: 'Umum',
      author: '',
      description: '',
      symptoms: '',
      causes: '',
      treatment: '',
      prevention: '',
      conclusion: '',
      thumbnailUrl: '',
      diseaseId: 0
    });
    setCrudError(null);
    setIsCreateModalOpen(true);
  };

  const openEditModal = (article: ArticleDetail) => {
    setFormData({
      title: article.title,
      slug: article.slug,
      category: article.category,
      author: article.author,
      description: article.description,
      symptoms: article.symptoms,
      causes: article.causes,
      treatment: article.treatment,
      prevention: article.prevention,
      conclusion: article.conclusion,
      thumbnailUrl: article.thumbnailUrl,
      diseaseId: article.diseaseId || 0
    });
    setCrudError(null);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (article: ArticleDetail) => {
    setSelectedArticle(article);
    setIsDeleteModalOpen(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'diseaseId' ? parseInt(value) || 0 : value
    }));
  };

  const handleCreateArticle = async () => {
    const token = getToken();
    if (!token) {
      setCrudError('Anda belum login. Silakan login terlebih dahulu.');
      return;
    }

    setCrudLoading(true);
    setCrudError(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/articles`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Article created:', result);

      // Refresh articles
      await fetchArticles();
      setIsCreateModalOpen(false);
      setCrudLoading(false);
    } catch (error) {
      console.error('Error creating article:', error);
      setCrudError('Gagal membuat artikel. Silakan coba lagi.');
      setCrudLoading(false);
    }
  };

  const handleUpdateArticle = async () => {
    if (!selectedArticle) return;

    const token = getToken();
    if (!token) {
      setCrudError('Anda belum login. Silakan login terlebih dahulu.');
      return;
    }

    setCrudLoading(true);
    setCrudError(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/articles/${selectedArticle.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Article updated:', result);

      // Refresh articles and close modals
      await fetchArticles();
      setIsEditModalOpen(false);
      closeModal();
      setCrudLoading(false);
    } catch (error) {
      console.error('Error updating article:', error);
      setCrudError('Gagal mengupdate artikel. Silakan coba lagi.');
      setCrudLoading(false);
    }
  };

  const handleDeleteArticle = async () => {
    if (!selectedArticle) return;

    const token = getToken();
    if (!token) {
      setCrudError('Anda belum login. Silakan login terlebih dahulu.');
      return;
    }

    setCrudLoading(true);
    setCrudError(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/articles/${selectedArticle.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Article deleted:', result);

      // Refresh articles and close modals
      await fetchArticles();
      setIsDeleteModalOpen(false);
      closeModal();
      setCrudLoading(false);
    } catch (error) {
      console.error('Error deleting article:', error);
      setCrudError('Gagal menghapus artikel. Silakan coba lagi.');
      setCrudLoading(false);
    }
  };

  // Get displayed articles
  const filteredArticles = getFilteredArticles();
  const displayedArticles = filteredArticles.slice(0, displayCount);
  const hasMoreArticles = filteredArticles.length > displayCount;

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

  const isAdmin = getUserRole() === 'admin';

  return (
    <>
      <div className="flex min-h-screen bg-gray-50">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar for Desktop and Mobile */}
        <div className={`
          fixed md:static inset-y-0 left-0 z-40
          transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 transition-transform duration-300 ease-in-out
        `}>
          <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
        </div>
        
        <div className="flex-1 md:ml-64">
          {/* Mobile Header */}
          <div className="md:hidden sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 text-gray-600 hover:text-gray-900"
              >
                <Menu className="w-6 h-6" />
              </button>
              <h1 className="text-lg font-bold text-gray-900">Artikel</h1>
              <div className="w-10"></div>
            </div>
          </div>

          {/* Desktop Navbar */}
          <div className="hidden md:block">
            <Navbar activeMenu={activeMenu} />
          </div>
          
          <main className="p-4 md:p-6 space-y-6">
            {/* Header Section */}
            <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 md:w-6 md:h-6 text-emerald-600" />
                    Artikel & Panduan
                  </h1>
                  <p className="text-gray-600 text-sm md:text-base mt-1">
                    Kumpulan artikel dan panduan lengkap tentang penyakit padi dan cara penanganannya
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-gray-500">
                    <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-md font-medium text-xs md:text-sm">
                      {filteredArticles.length} Artikel Tersedia
                    </span>
                    <span className="hidden md:inline text-gray-400">•</span>
                    <span className="text-xs md:text-sm">Menampilkan {Math.min(displayCount, filteredArticles.length)} artikel</span>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                  {isAdmin && (
                    <button
                      onClick={openCreateModal}
                      className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors shadow-sm hover:shadow-md text-sm md:text-base w-full md:w-auto justify-center"
                    >
                      <Plus className="w-4 h-4" />
                      Tambah Artikel
                    </button>
                  )}
                  <button
                    onClick={refreshArticles}
                    disabled={refreshing}
                    className={`flex items-center gap-2 px-3 py-2 md:px-4 md:py-2 rounded-lg text-sm font-medium transition-colors w-full md:w-auto justify-center ${
                      refreshing
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                    }`}
                  >
                    <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                    {refreshing ? 'Menyegarkan...' : 'Refresh'}
                  </button>
                </div>
              </div>

              {/* Search and Filter Section */}
              <div className="space-y-4 mt-4">
                {/* Search Bar */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari artikel..."
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm md:text-base"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    </button>
                  )}
                </div>

                {/* Category Filter */}
                <div className="flex flex-wrap gap-2">
                  <div className="flex items-center gap-2 text-gray-700 font-medium">
                    <Filter className="w-4 h-4" />
                    <span className="text-sm">Filter:</span>
                  </div>
                  {getUniqueCategories().map(category => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-colors ${
                        selectedCategory === category
                          ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mt-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div className="flex items-center">
                      <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
                      <span className="text-sm md:text-base">{error}</span>
                    </div>
                    <button 
                      onClick={refreshArticles}
                      className="text-red-700 hover:text-red-900 text-sm font-medium self-start md:self-center"
                    >
                      Coba lagi
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-pulse">
                    <div className="h-40 bg-gray-200"></div>
                    <div className="p-4 md:p-5 space-y-3">
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
                {filteredArticles.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                      {displayedArticles.map((article) => (
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
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                            <div className="absolute top-4 left-4">
                              <span
                                className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md font-medium ${getCategoryColor(article.category)} border`}
                              >
                                {getCategoryIcon(article.category)}
                                <span className="truncate max-w-[80px] md:max-w-none">
                                  {article.category}
                                </span>
                              </span>
                            </div>
                            <div className="absolute bottom-4 left-4 text-white">
                              <FileText className="w-5 h-5 mb-1" />
                              <span className="text-sm font-medium hidden sm:inline">Baca Artikel</span>
                            </div>
                          </div>

                          {/* Article Content */}
                          <div className="p-4 md:p-5 flex flex-col gap-3">
                            {/* Title */}
                            <h3 className="font-bold text-gray-900 text-base md:text-lg leading-tight line-clamp-2 group-hover:text-emerald-700 transition-colors">
                              {article.title}
                            </h3>

                            {/* Description */}
                            <p className="text-gray-600 text-sm leading-relaxed line-clamp-2 md:line-clamp-3">
                              {article.description}
                            </p>

                            {/* Footer Info */}
                            <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-2">
                              <div className="flex items-center gap-3 text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {article.readTime}
                                </span>
                                <span className="hidden sm:flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {article.date}
                                </span>
                              </div>
                              <div className="text-emerald-600 group-hover:text-emerald-700 font-medium text-sm inline-flex items-center gap-1">
                                Baca
                                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Show More Button */}
                    {hasMoreArticles && (
                      <div className="flex justify-center pt-4">
                        <button
                          onClick={handleShowMore}
                          disabled={showMoreLoading}
                          className={`flex items-center gap-2 px-4 py-2 md:px-6 md:py-3 rounded-xl font-medium transition-colors w-full sm:w-auto justify-center ${
                            showMoreLoading
                              ? 'bg-emerald-100 text-emerald-400 cursor-not-allowed'
                              : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm hover:shadow-md'
                          }`}
                        >
                          {showMoreLoading ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              <span>Memuat...</span>
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-5 h-5" />
                              <span className="hidden sm:inline">Tampilkan Lebih Banyak ({filteredArticles.length - displayCount} artikel tersisa)</span>
                              <span className="sm:hidden">Tampilkan Lebih Banyak</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    {/* Show Less Button (if more than initial are shown) */}
                    {displayCount > 6 && (
                      <div className="flex justify-center pt-2">
                        <button
                          onClick={() => setDisplayCount(6)}
                          className="text-emerald-600 hover:text-emerald-700 font-medium text-sm flex items-center gap-1"
                        >
                          <ChevronDown className="w-4 h-4 rotate-180" />
                          <span>Tampilkan Lebih Sedikit</span>
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  /* No Results State */
                  <div className="text-center py-12">
                    <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada artikel ditemukan</h3>
                    <p className="text-gray-600 max-w-md mx-auto">
                      {searchQuery || selectedCategory !== 'Semua' 
                        ? `Tidak ada artikel yang cocok dengan pencarian "${searchQuery}"${selectedCategory !== 'Semua' ? ` dan kategori "${selectedCategory}"` : ''}.`
                        : 'Artikel akan segera tersedia. Silakan coba lagi nanti atau hubungi administrator untuk informasi lebih lanjut.'}
                    </p>
                    {(searchQuery || selectedCategory !== 'Semua') && (
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setSelectedCategory('Semua');
                        }}
                        className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
                      >
                        Reset Filter
                      </button>
                    )}
                  </div>
                )}

                {/* Info Section */}
                <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 border border-emerald-100">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-emerald-600" />
                    Tips Membaca Artikel
                  </h3>
                  <ul className="text-sm text-gray-600 space-y-2 ml-5">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0"></div>
                      <span>Pilih artikel berdasarkan kategori penyakit yang ingin dipelajari</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0"></div>
                      <span>Baca artikel secara lengkap untuk pemahaman yang lebih baik</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0"></div>
                      <span>Terapkan pengetahuan dari artikel dengan bijak di lahan pertanian</span>
                    </li>
                  </ul>
                </div>
              </>
            )}
          </main>
        </div>
      </div>

      {/* Modal Detail Artikel */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50">
          {/* Overlay with blurred background */}
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={closeModal}
          />
          
          {/* Modal Content Container */}
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-2 md:p-4">
              {/* Modal Content */}
              <div 
                ref={modalRef}
                className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-gray-200"
              >
                {/* Modal Header */}
                <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm px-4 md:px-6 pt-4 md:pt-6 pb-3 md:pb-4 border-b border-gray-200">
                  <div className="flex justify-between items-start gap-2 md:gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Category and Date */}
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className={`inline-flex items-center gap-1.5 text-xs px-2 md:px-3 py-1 md:py-1.5 rounded-md font-medium ${getCategoryColor(selectedArticle?.category || '')} border`}>
                          {getCategoryIcon(selectedArticle?.category || '')}
                          <span className="truncate max-w-[80px] md:max-w-none">
                            {selectedArticle?.category}
                          </span>
                        </span>
                        <div className="flex items-center flex-wrap gap-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5" />
                            <span className="truncate max-w-[100px] md:max-w-none">
                              {selectedArticle?.author || 'Admin'}
                            </span>
                          </span>
                          <span className="hidden md:flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            {selectedArticle ? formatDisplayDate(selectedArticle.createdAt) : ''}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            {selectedArticle ? formatRelativeTime(selectedArticle.createdAt) : ''}
                          </span>
                        </div>
                      </div>
                      
                      {/* Title */}
                      <h2 className="text-lg md:text-2xl font-bold text-gray-900 mb-2 md:mb-3 pr-6 md:pr-8 line-clamp-2">
                        {selectedArticle?.title}
                      </h2>
                      
                      {/* Description */}
                      <p className="text-gray-600 text-xs md:text-sm leading-relaxed pr-6 md:pr-8 line-clamp-2 md:line-clamp-none">
                        {selectedArticle?.description}
                      </p>
                    </div>
                    <button
                      onClick={closeModal}
                      className="flex-shrink-0 rounded-lg p-1 md:p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors -mt-1 -mr-1 md:-mt-1 md:-mr-2"
                      aria-label="Tutup modal"
                    >
                      <X className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                  </div>
                </div>

                {/* Modal Content - Scrollable */}
                <div className="overflow-y-auto max-h-[calc(90vh-100px)]">
                  {/* Modal Loading State */}
                  {modalLoading && (
                    <div className="px-4 md:px-6 py-6 md:py-8 space-y-4">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="space-y-2">
                          <div className="h-4 w-32 md:w-48 bg-gray-200 rounded animate-pulse"></div>
                          <div className="h-16 md:h-20 w-full bg-gray-200 rounded animate-pulse"></div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Modal Error State */}
                  {modalError && !modalLoading && (
                    <div className="px-4 md:px-6 py-6 md:py-8">
                      <div className="bg-red-50 border border-red-200 rounded-xl p-4 md:p-6 text-center">
                        <AlertTriangle className="h-8 md:h-12 w-8 md:w-12 text-red-400 mx-auto mb-3" />
                        <h3 className="text-red-800 font-medium mb-2 text-sm md:text-base">Gagal Memuat Artikel</h3>
                        <p className="text-red-600 text-xs md:text-sm mb-4">{modalError}</p>
                        <button
                          onClick={closeModal}
                          className="px-3 py-1.5 md:px-4 md:py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors text-sm"
                        >
                          Tutup Artikel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Modal Content */}
                  {selectedArticle && !modalLoading && !modalError && (
                    <div className="px-4 md:px-6 py-4 md:py-5 space-y-4 md:space-y-6">
                      {/* Mini Thumbnail */}
                      {selectedArticle.thumbnailUrl && (
                        <div className="mb-3 md:mb-4">
                          <div className="flex items-center gap-2 mb-1 md:mb-2">
                            <ImageIcon className="w-3 h-3 md:w-4 md:h-4 text-gray-500" />
                            <span className="text-xs md:text-sm font-medium text-gray-700">Gambar Ilustrasi</span>
                          </div>
                          <div className="relative h-32 md:h-48 rounded-lg overflow-hidden border border-gray-200">
                            <img
                              src={selectedArticle.thumbnailUrl}
                              alt={selectedArticle.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = generateFallbackThumbnail(selectedArticle.title);
                              }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Disease Information Card */}
                      <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-3 md:p-5 border border-emerald-100">
                        <div className="flex items-start gap-2 md:gap-3 mb-3 md:mb-4">
                          <div className="p-1.5 md:p-2 bg-emerald-100 rounded-lg flex-shrink-0">
                            <Thermometer className="w-4 h-4 md:w-5 md:h-5 text-emerald-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-emerald-800 mb-1 text-sm md:text-base">Informasi Penyakit</h3>
                            <p className="text-emerald-600 text-xs md:text-sm">Detail penyakit yang dibahas dalam artikel ini</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                          <div className="bg-white/50 rounded-lg p-3 md:p-4 border border-emerald-200">
                            <p className="text-xs font-medium text-emerald-700 mb-1">Nama Penyakit</p>
                            <p className="text-gray-900 font-medium text-sm md:text-base truncate">
                              {selectedArticle.disease?.name || selectedArticle.category || 'Tidak Diketahui'}
                            </p>
                          </div>
                          <div className="bg-white/50 rounded-lg p-3 md:p-4 border border-emerald-200">
                            <p className="text-xs font-medium text-emerald-700 mb-1">Kode Penyakit</p>
                            <p className="text-gray-900 font-medium font-mono text-sm md:text-base truncate">
                              {selectedArticle.disease?.code || selectedArticle.category?.toLowerCase().replace(/\s+/g, '_') || 'unknown'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Symptoms */}
                      <div className="space-y-2 md:space-y-3">
                        <div className="flex items-center gap-2 md:gap-3">
                          <div className="p-1.5 md:p-2 bg-red-100 rounded-lg flex-shrink-0">
                            <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-red-600" />
                          </div>
                          <h3 className="font-semibold text-gray-900 text-base md:text-lg">Gejala yang Terlihat</h3>
                        </div>
                        <div className="bg-red-50/50 border border-red-100 rounded-xl p-3 md:p-5">
                          <p className="text-gray-700 whitespace-pre-line leading-relaxed text-sm md:text-base">
                            {selectedArticle.symptoms}
                          </p>
                        </div>
                      </div>

                      {/* Causes */}
                      <div className="space-y-2 md:space-y-3">
                        <div className="flex items-center gap-2 md:gap-3">
                          <div className="p-1.5 md:p-2 bg-blue-100 rounded-lg flex-shrink-0">
                            <Droplets className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
                          </div>
                          <h3 className="font-semibold text-gray-900 text-base md:text-lg">Penyebab Utama</h3>
                        </div>
                        <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3 md:p-5">
                          <p className="text-gray-700 whitespace-pre-line leading-relaxed text-sm md:text-base">
                            {selectedArticle.causes}
                          </p>
                        </div>
                      </div>

                      {/* Grid: Treatment dan Prevention */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        {/* Treatment */}
                        <div className="space-y-2 md:space-y-3">
                          <div className="flex items-center gap-2 md:gap-3">
                            <div className="p-1.5 md:p-2 bg-purple-100 rounded-lg flex-shrink-0">
                              <Shield className="w-4 h-4 md:w-5 md:h-5 text-purple-600" />
                            </div>
                            <h3 className="font-semibold text-gray-900 text-base md:text-lg">Pengobatan</h3>
                          </div>
                          <div className="bg-purple-50/50 border border-purple-100 rounded-xl p-3 md:p-5">
                            <p className="text-gray-700 whitespace-pre-line leading-relaxed text-sm md:text-base">
                              {selectedArticle.treatment}
                            </p>
                          </div>
                        </div>

                        {/* Prevention */}
                        <div className="space-y-2 md:space-y-3">
                          <div className="flex items-center gap-2 md:gap-3">
                            <div className="p-1.5 md:p-2 bg-green-100 rounded-lg flex-shrink-0">
                              <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
                            </div>
                            <h3 className="font-semibold text-gray-900 text-base md:text-lg">Pencegahan</h3>
                          </div>
                          <div className="bg-green-50/50 border border-green-100 rounded-xl p-3 md:p-5">
                            <p className="text-gray-700 whitespace-pre-line leading-relaxed text-sm md:text-base">
                              {selectedArticle.prevention}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Conclusion */}
                      <div className="space-y-2 md:space-y-3">
                        <div className="flex items-center gap-2 md:gap-3">
                          <div className="p-1.5 md:p-2 bg-emerald-100 rounded-lg flex-shrink-0">
                            <Sprout className="w-4 h-4 md:w-5 md:h-5 text-emerald-600" />
                          </div>
                          <h3 className="font-semibold text-gray-900 text-base md:text-lg">Kesimpulan</h3>
                        </div>
                        <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-100 rounded-xl p-3 md:p-5">
                          <p className="text-gray-700 whitespace-pre-line leading-relaxed text-sm md:text-base">
                            {selectedArticle.conclusion}
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="pt-4 md:pt-6 border-t border-gray-200 mt-2">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                          <div>
                            {isAdmin && selectedArticle && (
                              <div className="flex flex-wrap gap-2">
                                <button
                                  onClick={() => openEditModal(selectedArticle)}
                                  className="px-3 py-1.5 md:px-4 md:py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-1.5 md:gap-2 text-sm"
                                >
                                  <Edit className="w-3 h-3 md:w-4 md:h-4" />
                                  Edit Artikel
                                </button>
                                <button
                                  onClick={() => openDeleteModal(selectedArticle)}
                                  className="px-3 py-1.5 md:px-4 md:py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center gap-1.5 md:gap-2 text-sm"
                                >
                                  <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
                                  Hapus Artikel
                                </button>
                              </div>
                            )}
                          </div>
                          <button
                            onClick={closeModal}
                            className="px-4 py-2 md:px-6 md:py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors flex items-center gap-1.5 md:gap-2 shadow-sm hover:shadow-md w-full sm:w-auto justify-center text-sm md:text-base"
                          >
                            <X className="w-4 h-4" />
                            Tutup Artikel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Article Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50">
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsCreateModalOpen(false)}
          />
          
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-2 md:p-4">
              <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden border border-gray-200">
                <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm px-4 md:px-6 pt-4 md:pt-6 pb-3 md:pb-4 border-b border-gray-200">
                  <div className="flex justify-between items-start gap-2 md:gap-4">
                    <div className="flex-1 min-w-0">
                      <h2 className="text-lg md:text-2xl font-bold text-gray-900 mb-1 md:mb-2">
                        Tambah Artikel Baru
                      </h2>
                      <p className="text-gray-600 text-xs md:text-sm leading-relaxed">
                        Isi formulir di bawah untuk menambahkan artikel baru
                      </p>
                    </div>
                    <button
                      onClick={() => setIsCreateModalOpen(false)}
                      className="flex-shrink-0 rounded-lg p-1 md:p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors -mt-1 -mr-1 md:-mt-1 md:-mr-2"
                    >
                      <X className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                  </div>
                </div>

                <div className="overflow-y-auto max-h-[calc(90vh-100px)]">
                  {crudError && (
                    <div className="mx-4 md:mx-6 mt-4 md:mt-6">
                      <div className="bg-red-50 border border-red-200 text-red-700 px-3 md:px-4 py-2 md:py-3 rounded-lg">
                        <div className="flex items-center">
                          <AlertTriangle className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                          <span className="text-sm">{crudError}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="px-4 md:px-6 py-3 md:py-5 space-y-3 md:space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                          Judul Artikel *
                        </label>
                        <input
                          type="text"
                          name="title"
                          value={formData.title}
                          onChange={handleFormChange}
                          className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm md:text-base"
                          placeholder="Masukkan judul artikel"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                          Slug *
                        </label>
                        <input
                          type="text"
                          name="slug"
                          value={formData.slug}
                          onChange={handleFormChange}
                          className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm md:text-base"
                          placeholder="slug-artikel"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                          Kategori *
                        </label>
                        <select
                          name="category"
                          value={formData.category}
                          onChange={handleFormChange}
                          className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm md:text-base"
                        >
                          <option value="Umum">Umum</option>
                          <option value="Tungro">Tungro</option>
                          <option value="Blast">Blast</option>
                          <option value="Bacterial Blight">Bacterial Blight</option>
                          <option value="Brown Spot">Brown Spot</option>
                          <option value="Narrow Brown Spot">Narrow Brown Spot</option>
                          <option value="Leaf Scald">Leaf Scald</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                          Penulis *
                        </label>
                        <input
                          type="text"
                          name="author"
                          value={formData.author}
                          onChange={handleFormChange}
                          className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm md:text-base"
                          placeholder="Nama penulis"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                        URL Thumbnail
                      </label>
                      <input
                        type="text"
                        name="thumbnailUrl"
                        value={formData.thumbnailUrl}
                        onChange={handleFormChange}
                        className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm md:text-base"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                        Deskripsi *
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleFormChange}
                        rows={3}
                        className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm md:text-base"
                        placeholder="Deskripsi singkat artikel"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                          Gejala
                        </label>
                        <textarea
                          name="symptoms"
                          value={formData.symptoms}
                          onChange={handleFormChange}
                          rows={3}
                          className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm md:text-base"
                          placeholder="Gejala penyakit"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                          Penyebab
                        </label>
                        <textarea
                          name="causes"
                          value={formData.causes}
                          onChange={handleFormChange}
                          rows={3}
                          className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm md:text-base"
                          placeholder="Penyebab penyakit"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                          Pengobatan
                        </label>
                        <textarea
                          name="treatment"
                          value={formData.treatment}
                          onChange={handleFormChange}
                          rows={3}
                          className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm md:text-base"
                          placeholder="Cara pengobatan"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                          Pencegahan
                        </label>
                        <textarea
                          name="prevention"
                          value={formData.prevention}
                          onChange={handleFormChange}
                          rows={3}
                          className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm md:text-base"
                          placeholder="Cara pencegahan"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                        Kesimpulan
                      </label>
                      <textarea
                        name="conclusion"
                        value={formData.conclusion}
                        onChange={handleFormChange}
                        rows={3}
                        className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm md:text-base"
                        placeholder="Kesimpulan artikel"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                        Disease ID
                      </label>
                      <input
                        type="number"
                        name="diseaseId"
                        value={formData.diseaseId}
                        onChange={handleFormChange}
                        className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm md:text-base"
                        placeholder="ID penyakit (opsional)"
                      />
                    </div>
                  </div>
                </div>

                <div className="sticky bottom-0 bg-white border-t border-gray-200 px-4 md:px-6 py-3 md:py-4">
                  <div className="flex flex-col sm:flex-row justify-end gap-2 md:gap-3">
                    <button
                      onClick={() => setIsCreateModalOpen(false)}
                      className="px-3 py-1.5 md:px-4 md:py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm md:text-base order-2 sm:order-1"
                    >
                      Batal
                    </button>
                    <button
                      onClick={handleCreateArticle}
                      disabled={crudLoading}
                      className="px-3 py-1.5 md:px-4 md:py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center gap-1.5 md:gap-2 justify-center text-sm md:text-base order-1 sm:order-2"
                    >
                      {crudLoading ? (
                        <>
                          <div className="w-3 h-3 md:w-4 md:h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Menyimpan...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-3 h-3 md:w-4 md:h-4" />
                          <span>Simpan Artikel</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Article Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50">
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsEditModalOpen(false)}
          />
          
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-2 md:p-4">
              <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden border border-gray-200">
                <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm px-4 md:px-6 pt-4 md:pt-6 pb-3 md:pb-4 border-b border-gray-200">
                  <div className="flex justify-between items-start gap-2 md:gap-4">
                    <div className="flex-1 min-w-0">
                      <h2 className="text-lg md:text-2xl font-bold text-gray-900 mb-1 md:mb-2">
                        Edit Artikel
                      </h2>
                      <p className="text-gray-600 text-xs md:text-sm leading-relaxed">
                        Edit informasi artikel yang dipilih
                      </p>
                    </div>
                    <button
                      onClick={() => setIsEditModalOpen(false)}
                      className="flex-shrink-0 rounded-lg p-1 md:p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors -mt-1 -mr-1 md:-mt-1 md:-mr-2"
                    >
                      <X className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                  </div>
                </div>

                <div className="overflow-y-auto max-h-[calc(90vh-100px)]">
                  {crudError && (
                    <div className="mx-4 md:mx-6 mt-4 md:mt-6">
                      <div className="bg-red-50 border border-red-200 text-red-700 px-3 md:px-4 py-2 md:py-3 rounded-lg">
                        <div className="flex items-center">
                          <AlertTriangle className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                          <span className="text-sm">{crudError}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="px-4 md:px-6 py-3 md:py-5 space-y-3 md:space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                          Judul Artikel *
                        </label>
                        <input
                          type="text"
                          name="title"
                          value={formData.title}
                          onChange={handleFormChange}
                          className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm md:text-base"
                          placeholder="Masukkan judul artikel"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                          Slug *
                        </label>
                        <input
                          type="text"
                          name="slug"
                          value={formData.slug}
                          onChange={handleFormChange}
                          className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm md:text-base"
                          placeholder="slug-artikel"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                          Kategori *
                        </label>
                        <select
                          name="category"
                          value={formData.category}
                          onChange={handleFormChange}
                          className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm md:text-base"
                        >
                          <option value="Umum">Umum</option>
                          <option value="Tungro">Tungro</option>
                          <option value="Blast">Blast</option>
                          <option value="Bacterial Blight">Bacterial Blight</option>
                          <option value="Brown Spot">Brown Spot</option>
                          <option value="Narrow Brown Spot">Narrow Brown Spot</option>
                          <option value="Leaf Scald">Leaf Scald</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                          Penulis *
                        </label>
                        <input
                          type="text"
                          name="author"
                          value={formData.author}
                          onChange={handleFormChange}
                          className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm md:text-base"
                          placeholder="Nama penulis"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                        URL Thumbnail
                      </label>
                      <input
                        type="text"
                        name="thumbnailUrl"
                        value={formData.thumbnailUrl}
                        onChange={handleFormChange}
                        className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm md:text-base"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                        Deskripsi *
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleFormChange}
                        rows={3}
                        className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm md:text-base"
                        placeholder="Deskripsi singkat artikel"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                          Gejala
                        </label>
                        <textarea
                          name="symptoms"
                          value={formData.symptoms}
                          onChange={handleFormChange}
                          rows={3}
                          className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm md:text-base"
                          placeholder="Gejala penyakit"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                          Penyebab
                        </label>
                        <textarea
                          name="causes"
                          value={formData.causes}
                          onChange={handleFormChange}
                          rows={3}
                          className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm md:text-base"
                          placeholder="Penyebab penyakit"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                          Pengobatan
                        </label>
                        <textarea
                          name="treatment"
                          value={formData.treatment}
                          onChange={handleFormChange}
                          rows={3}
                          className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm md:text-base"
                          placeholder="Cara pengobatan"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                          Pencegahan
                        </label>
                        <textarea
                          name="prevention"
                          value={formData.prevention}
                          onChange={handleFormChange}
                          rows={3}
                          className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm md:text-base"
                          placeholder="Cara pencegahan"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                        Kesimpulan
                      </label>
                      <textarea
                        name="conclusion"
                        value={formData.conclusion}
                        onChange={handleFormChange}
                        rows={3}
                        className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm md:text-base"
                        placeholder="Kesimpulan artikel"
                      />
                    </div>
                  </div>
                </div>

                <div className="sticky bottom-0 bg-white border-t border-gray-200 px-4 md:px-6 py-3 md:py-4">
                  <div className="flex flex-col sm:flex-row justify-end gap-2 md:gap-3">
                    <button
                      onClick={() => setIsEditModalOpen(false)}
                      className="px-3 py-1.5 md:px-4 md:py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm md:text-base order-2 sm:order-1"
                    >
                      Batal
                    </button>
                    <button
                      onClick={handleUpdateArticle}
                      disabled={crudLoading}
                      className="px-3 py-1.5 md:px-4 md:py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center gap-1.5 md:gap-2 justify-center text-sm md:text-base order-1 sm:order-2"
                    >
                      {crudLoading ? (
                        <>
                          <div className="w-3 h-3 md:w-4 md:h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Menyimpan...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-3 h-3 md:w-4 md:h-4" />
                          <span>Update Artikel</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Article Modal */}
      {isDeleteModalOpen && selectedArticle && (
        <div className="fixed inset-0 z-50">
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsDeleteModalOpen(false)}
          />
          
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden border border-gray-200">
                <div className="p-4 md:p-6">
                  <div className="text-center mb-4 md:mb-6">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                      <AlertOctagon className="w-6 h-6 md:w-8 md:h-8 text-red-600" />
                    </div>
                    <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-1 md:mb-2">Hapus Artikel</h3>
                    <p className="text-gray-600 text-sm md:text-base">
                      Apakah Anda yakin ingin menghapus artikel <span className="font-semibold">`{selectedArticle.title}`</span>? Tindakan ini tidak dapat dibatalkan.
                    </p>
                  </div>
                  
                  {crudError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 md:px-4 md:py-3 rounded-lg mb-3 md:mb-4">
                      <div className="flex items-center">
                        <AlertTriangle className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                        <span className="text-sm">{crudError}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row justify-center gap-2 md:gap-3">
                    <button
                      onClick={() => setIsDeleteModalOpen(false)}
                      className="px-3 py-1.5 md:px-4 md:py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm md:text-base"
                    >
                      Batal
                    </button>
                    <button
                      onClick={handleDeleteArticle}
                      disabled={crudLoading}
                      className="px-3 py-1.5 md:px-4 md:py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center gap-1.5 md:gap-2 justify-center text-sm md:text-base"
                    >
                      {crudLoading ? (
                        <>
                          <div className="w-3 h-3 md:w-4 md:h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Menghapus...</span>
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
                          <span>Hapus Artikel</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}