// app/(public)/deteksi/page.tsx
'use client';

import { useState, useEffect, useRef, JSX } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import { Navbar } from '@/components/public/Navbar';
import { 
  Upload, Camera, Image, AlertCircle, Check, X, User, 
  Calendar, Clock, AlertTriangle, ImageIcon, Thermometer, 
  Droplets, Shield, CheckCircle, Sprout, Leaf, RotateCw,
  Maximize, Minimize, Menu
} from 'lucide-react';

// Type untuk response API
interface Disease {
  name: string;
  description: string;
  solutions: string[];
}

interface Article {
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

interface DetectionResponse {
  message: string;
  data: {
    id: string;
    imageUrl: string;
    accuracy: number;
    status: string;
    detectedAt: string;
    disease: Disease;
    articleSlug: string;
  };
}

export default function DeteksiPage() {
  const [activeMenu, setActiveMenu] = useState('deteksi');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // State untuk modal artikel
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  
  // State untuk kamera
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const [uploadResult, setUploadResult] = useState<{
    success: boolean;
    message: string;
    disease?: Disease;
    accuracy?: number;
    status?: string;
    detectedAt?: string;
    articleSlug?: string;
  } | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const cameraModalRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

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

  // Set mounted to true when component is mounted (client-side)
  useEffect(() => {
    setMounted(true);
    return () => {
      // Cleanup camera stream on unmount
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Effect untuk mengatur fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Effect untuk menutup sidebar ketika klik di luar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && 
          !sidebarRef.current.contains(event.target as Node) &&
          sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [sidebarOpen]);

  // Fungsi untuk fetch detail artikel
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
        id: 1,
        title: "Informasi Lengkap Penyakit",
        slug: slug,
        category: uploadResult?.disease?.name || "Penyakit Padi",
        author: "Admin PadiCheck AI",
        description: "Informasi lengkap tentang penyakit yang terdeteksi.",
        symptoms: "Gejala umum penyakit pada tanaman padi.",
        causes: "Penyebab utama penyakit pada tanaman padi.",
        treatment: "Pengobatan yang disarankan untuk mengatasi penyakit.",
        prevention: "Langkah-langkah pencegahan yang bisa dilakukan.",
        conclusion: "Kesimpulan dan rekomendasi penanganan.",
        thumbnailUrl: "https://images.unsplash.com/photo-1560493676-04071c5f467b?w=600&h=300&fit=crop",
        createdAt: new Date().toISOString(),
        diseaseId: 1,
        disease: {
          name: uploadResult?.disease?.name || "Penyakit Padi",
          code: slug
        }
      });
    } finally {
      setModalLoading(false);
    }
  };

  // Fungsi untuk membuka modal artikel
  const openArticleModal = async (slug: string) => {
    setIsArticleModalOpen(true);
    await fetchArticleDetail(slug);
  };

  // Fungsi untuk menutup modal
  const closeArticleModal = () => {
    setIsArticleModalOpen(false);
    setSelectedArticle(null);
    setModalError(null);
  };

  // Helper functions for modal
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Bacterial Leaf Blight': 'bg-red-100 text-red-800 border-red-300',
      'Brown Spot': 'bg-amber-100 text-amber-800 border-amber-300',
      'Leaf Smut': 'bg-gray-100 text-gray-800 border-gray-300',
      'Default': 'bg-blue-100 text-blue-800 border-blue-300'
    };
    return colors[category] || colors['Default'];
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, JSX.Element> = {
      'Bacterial Leaf Blight': <Thermometer className="w-3.5 h-3.5" />,
      'Brown Spot': <AlertCircle className="w-3.5 h-3.5" />,
      'Leaf Smut': <Droplets className="w-3.5 h-3.5" />,
      'Default': <Leaf className="w-3.5 h-3.5" />
    };
    return icons[category] || icons['Default'];
  };

  const formatDisplayDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    if (diffInDays === 0) return 'Hari ini';
    if (diffInDays === 1) return 'Kemarin';
    return `${diffInDays} hari yang lalu`;
  };

  const generateFallbackThumbnail = (title: string) => {
    const colors = ['6B7280', '10B981', '3B82F6', '8B5CF6', 'EF4444'];
    const color = colors[title.length % colors.length];
    return `https://via.placeholder.com/600x300/${color}/FFFFFF?text=${encodeURIComponent(title)}`;
  };

  // Fungsi untuk membuka kamera
  const openCamera = async () => {
    try {
      setCameraError(null);
      
      // Cek apakah browser mendukung getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError('Browser Anda tidak mendukung akses kamera. Silakan gunakan browser yang lebih baru atau izinkan akses kamera.');
        return;
      }

      // Minta izin akses kamera
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      setCameraStream(stream);
      setIsCameraOpen(true);

      // Set stream ke video element
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setCameraError('Gagal mengakses kamera. Pastikan Anda memberikan izin akses kamera atau gunakan perangkat yang berbeda.');
    }
  };

  // Fungsi untuk mengambil foto dari kamera
  const takePhoto = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const context = canvas.getContext('2d');
    if (!context) return;

    // Gambar frame video ke canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Konversi canvas ke blob
    canvas.toBlob((blob) => {
      if (blob) {
        // Buat file dari blob
        const file = new File([blob], 'camera_photo.jpg', {
          type: 'image/jpeg',
          lastModified: Date.now()
        });

        setFile(file);
        setUploadResult(null);
        
        // Buat URL preview
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);

        // Tutup kamera
        closeCamera();
      }
    }, 'image/jpeg', 0.85);
  };

  // Fungsi untuk menutup kamera
  const closeCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setIsCameraOpen(false);
    setCameraError(null);
  };

  // Fungsi untuk mengganti kamera (depan/belakang)
  const switchCamera = async () => {
    if (!cameraStream) return;

    const currentVideoTrack = cameraStream.getVideoTracks()[0];
    if (!currentVideoTrack) return;

    const currentConstraints = currentVideoTrack.getConstraints();
    const currentFacingMode = currentConstraints.facingMode || 'environment';
    
    const newFacingMode = currentFacingMode === 'environment' ? 'user' : 'environment';

    currentVideoTrack.stop();

    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: newFacingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      setCameraStream(newStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
    } catch (error) {
      console.error('Error switching camera:', error);
      setCameraError('Gagal mengganti kamera');
    }
  };

  // Fungsi untuk toggle fullscreen
  const toggleFullscreen = () => {
    if (!cameraModalRef.current) return;

    if (!document.fullscreenElement) {
      cameraModalRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        alert('File terlalu besar. Maksimal ukuran file adalah 5MB.');
        return;
      }

      const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!validTypes.includes(selectedFile.type)) {
        alert('Format file tidak didukung. Gunakan JPG, JPEG, atau PNG.');
        return;
      }

      setFile(selectedFile);
      setUploadResult(null);
      
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert('Silakan pilih file terlebih dahulu.');
      return;
    }

    const token = getToken();
    if (!token) {
      setUploadResult({
        success: false,
        message: 'Anda harus login terlebih dahulu untuk menggunakan fitur deteksi.',
      });
      return;
    }

    setIsUploading(true);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/detections`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Token tidak valid atau telah kadaluarsa. Silakan login kembali.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: DetectionResponse = await response.json();

      if (result.message === "Deteksi berhasil") {
        setUploadResult({
          success: true,
          message: 'Deteksi berhasil!',
          disease: result.data.disease,
          accuracy: result.data.accuracy,
          status: result.data.status,
          detectedAt: result.data.detectedAt,
          articleSlug: result.data.articleSlug,
        });
      } else {
        throw new Error(result.message || 'Deteksi gagal');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadResult({
        success: false,
        message: error instanceof Error 
          ? `Terjadi kesalahan: ${error.message}`
          : 'Terjadi kesalahan saat memproses gambar. Silakan coba lagi.',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleClear = () => {
    setFile(null);
    setPreviewUrl(null);
    setUploadResult(null);
    
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      
      if (droppedFile.size > 5 * 1024 * 1024) {
        alert('File terlalu besar. Maksimal ukuran file adalah 5MB.');
        return;
      }

      const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!validTypes.includes(droppedFile.type)) {
        alert('Format file tidak didukung. Gunakan JPG, JPEG, atau PNG.');
        return;
      }

      setFile(droppedFile);
      setUploadResult(null);
      
      const url = URL.createObjectURL(droppedFile);
      setPreviewUrl(url);
    }
  };

  // Fungsi untuk format tanggal
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Optional: Tampilkan info login jika belum login
  const renderLoginWarning = () => {
    if (mounted && !getToken()) {
      return (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <div>
              <p className="font-medium text-yellow-800">Perhatian</p>
              <p className="text-sm text-yellow-700">
                Anda harus <a href="/login" className="font-semibold underline">login</a> terlebih dahulu untuk menggunakan fitur deteksi.
              </p>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 p-2 bg-white rounded-lg shadow-md border border-gray-200"
      >
        <Menu className="w-5 h-5 text-gray-700" />
      </button>

      {/* Sidebar untuk Desktop */}
      <div className="hidden lg:block">
        <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
      </div>

      {/* Sidebar untuk Mobile */}
      <div 
        ref={sidebarRef}
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
      </div>

      {/* Overlay untuk Mobile Sidebar */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        <Navbar activeMenu={activeMenu} />
        
        <main className="p-4 lg:p-6 space-y-4 lg:space-y-6">
          {/* Warning jika belum login */}
          {renderLoginWarning()}

          {/* Upload Area */}
          <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6">
            <div className="mb-4 lg:mb-6">
              <h2 className="text-base lg:text-lg font-semibold text-gray-900">Upload Foto Daun Padi</h2>
              <p className="text-xs lg:text-sm text-gray-500 mt-1">
                Upload foto daun padi untuk mendeteksi penyakit. Pastikan foto jelas dan fokus pada daun.
              </p>
            </div>

            {/* Upload Box */}
            <div className="border-2 border-dashed border-emerald-300 rounded-xl p-4 lg:p-8 bg-emerald-50">
              <label
                htmlFor="fileInput"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="cursor-pointer flex flex-col items-center justify-center py-4 lg:py-8"
              >
                <div className="flex flex-col items-center gap-3 lg:gap-4">
                  <div className="w-12 h-12 lg:w-16 lg:h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                    <Upload className="w-6 h-6 lg:w-8 lg:h-8 text-emerald-600" />
                  </div>
                  
                  <div className="text-center">
                    <p className="text-gray-700 font-medium text-sm lg:text-base">
                      {file ? 'File terpilih' : 'Seret & lepas file di sini'}
                    </p>
                    <p className="text-gray-500 text-xs lg:text-sm mt-1 truncate max-w-xs">
                      {file ? file.name : 'atau klik untuk memilih file'}
                    </p>
                  </div>

                  {!file && (
                    <div className="mt-3 lg:mt-4">
                      <div className="px-3 lg:px-4 py-1.5 lg:py-2 bg-emerald-600 text-white rounded-lg text-xs lg:text-sm font-medium hover:bg-emerald-700 transition-colors inline-block">
                        Pilih File
                      </div>
                    </div>
                  )}
                </div>

                <p className="mt-4 lg:mt-6 text-xs text-gray-400">
                  Format: JPG, PNG (Maksimal 5MB)
                </p>

                <input
                  id="fileInput"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>

              {/* Preview Image */}
              {previewUrl && (
                <div className="mt-4 lg:mt-6">
                  <div className="flex items-center justify-between mb-2 lg:mb-3">
                    <p className="text-xs lg:text-sm font-medium text-gray-700">Preview:</p>
                    <button
                      onClick={handleClear}
                      className="text-red-500 hover:text-red-700 text-xs lg:text-sm flex items-center gap-1"
                    >
                      <X className="w-3 h-3 lg:w-4 lg:h-4" />
                      Hapus
                    </button>
                  </div>
                  <div className="relative w-full mx-auto">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-auto rounded-lg shadow-sm border border-gray-200 max-h-64 object-contain"
                    />
                    <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                      {file && (file.size / 1024).toFixed(0)} KB
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 lg:gap-4 mt-4 lg:mt-6">
              <button
                onClick={handleUpload}
                disabled={!file || isUploading || !getToken()}
                className={`py-2.5 lg:py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                  !file || isUploading || !getToken()
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                {isUploading ? (
                  <>
                    <div className="w-4 h-4 lg:w-5 lg:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Memproses...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 lg:w-5 lg:h-5" />
                    Mulai Deteksi
                  </>
                )}
              </button>

              <button
                onClick={handleClear}
                disabled={!file}
                className={`py-2.5 lg:py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                  !file
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200'
                }`}
              >
                <X className="w-4 h-4 lg:w-5 lg:h-5" />
                Hapus File
              </button>
            </div>

            {/* Result Display */}
            {uploadResult && (
              <div className={`mt-4 lg:mt-6 p-3 lg:p-4 rounded-lg border ${
                uploadResult.success
                  ? 'bg-emerald-50 border-emerald-200'
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-start gap-2 lg:gap-3">
                  <div className={`w-5 h-5 lg:w-6 lg:h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                    uploadResult.success ? 'bg-emerald-500' : 'bg-red-500'
                  }`}>
                    {uploadResult.success ? (
                      <Check className="w-3 h-3 lg:w-4 lg:h-4 text-white" />
                    ) : (
                      <X className="w-3 h-3 lg:w-4 lg:h-4 text-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium text-sm lg:text-base ${
                      uploadResult.success ? 'text-emerald-800' : 'text-red-800'
                    }`}>
                      {uploadResult.message}
                    </p>
                    
                    {uploadResult.success && uploadResult.disease && (
                      <div className="mt-2 space-y-2 lg:space-y-3">
                        {/* Status dan Waktu */}
                        <div className="grid grid-cols-1 gap-2 lg:gap-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                            <span className="text-xs lg:text-sm text-gray-600">Status:</span>
                            <span className="font-semibold text-gray-900 text-sm lg:text-base">{uploadResult.status}</span>
                          </div>
                          {uploadResult.detectedAt && (
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                              <span className="text-xs lg:text-sm text-gray-600">Waktu Deteksi:</span>
                              <span className="text-xs lg:text-sm text-gray-700 text-right">{formatDate(uploadResult.detectedAt)}</span>
                            </div>
                          )}
                        </div>

                        {/* Hasil Deteksi */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pt-2 border-t border-emerald-100">
                          <span className="text-xs lg:text-sm text-gray-600">Hasil Deteksi:</span>
                          <span className="font-semibold text-gray-900 text-sm lg:text-base truncate">{uploadResult.disease.name}</span>
                        </div>

                        {/* Tingkat Akurasi */}
                        {uploadResult.accuracy && (
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pt-2 border-t border-emerald-100">
                            <span className="text-xs lg:text-sm text-gray-600">Tingkat Akurasi:</span>
                            <span className="font-semibold text-emerald-600 text-sm lg:text-base">{uploadResult.accuracy.toFixed(1)}%</span>
                          </div>
                        )}

                        {/* Deskripsi Penyakit */}
                        <div className="pt-2 lg:pt-3 border-t border-emerald-100">
                          <p className="text-xs lg:text-sm font-medium text-gray-700 mb-1 lg:mb-2">Deskripsi:</p>
                          <p className="text-xs lg:text-sm text-gray-600">{uploadResult.disease.description}</p>
                        </div>

                        {/* Solusi */}
                        <div className="pt-2 lg:pt-3 border-t border-emerald-100">
                          <p className="text-xs lg:text-sm font-medium text-gray-700 mb-1 lg:mb-2">Rekomendasi Penanganan:</p>
                          <ul className="text-xs lg:text-sm text-gray-700 space-y-0.5 lg:space-y-1 list-disc ml-4">
                            {uploadResult.disease.solutions.map((solution, index) => (
                              <li key={index} className="break-words">{solution}</li>
                            ))}
                          </ul>
                        </div>

                        {/* Link ke Artikel dalam Modal */}
                        {uploadResult.articleSlug && (
                          <div className="pt-2 lg:pt-3 border-t border-emerald-100">
                            <p className="text-xs lg:text-sm text-gray-600">
                              Ingin tahu lebih lanjut? 
                              <button 
                                onClick={() => openArticleModal(uploadResult.articleSlug!)}
                                className="ml-1 lg:ml-2 text-emerald-600 hover:text-emerald-700 font-medium focus:outline-none focus:underline"
                              >
                                Baca artikel lengkap →
                              </button>
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4">
            <div
              onClick={openCamera}
              className="bg-white rounded-xl p-4 lg:p-5 border shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-center gap-3 lg:gap-4">
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Camera className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm lg:text-base">Ambil Foto</h3>
                  <p className="text-xs lg:text-sm text-gray-500 mt-0.5 lg:mt-1">
                    Gunakan kamera untuk mengambil foto langsung
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 lg:p-5 border shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center gap-3 lg:gap-4">
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Image className="w-5 h-5 lg:w-6 lg:h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm lg:text-base">Contoh Foto</h3>
                  <p className="text-xs lg:text-sm text-gray-500 mt-0.5 lg:mt-1">
                    Lihat contoh foto yang baik untuk deteksi
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tips Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 lg:p-5">
            <div className="flex items-center gap-2 lg:gap-3 mb-2 lg:mb-3">
              <AlertCircle className="w-4 h-4 lg:w-5 lg:h-5 text-blue-600 flex-shrink-0" />
              <h3 className="font-semibold text-blue-900 text-sm lg:text-base">Tips untuk Hasil Terbaik</h3>
            </div>
            
            <ul className="text-xs lg:text-sm text-blue-800 space-y-1 lg:space-y-2 list-disc ml-4 lg:ml-5">
              <li>Pastikan foto diambil di tempat dengan pencahayaan yang cukup</li>
              <li>Fokuskan kamera pada daun yang menunjukkan gejala penyakit</li>
              <li>Ambil foto dari jarak dekat untuk detail yang lebih baik</li>
              <li>Hindari bayangan atau pantulan yang menghalangi daun</li>
              <li>Pastikan daun berada di posisi tengah dan jelas</li>
              <li>Gunakan latar belakang yang kontras dengan daun</li>
            </ul>
          </div>

          {/* Additional Info */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 lg:p-5">
            <h3 className="font-semibold text-gray-900 text-sm lg:text-base mb-1 lg:mb-2">Informasi Penting</h3>
            <p className="text-xs lg:text-sm text-gray-600">
              Sistem deteksi menggunakan AI dengan akurasi hingga 95%. Hasil deteksi adalah perkiraan 
              berdasarkan data training. Untuk diagnosis yang akurat, disarankan untuk berkonsultasi 
              dengan ahli pertanian atau petugas penyuluh lapangan.
            </p>
          </div>
        </main>
      </div>

      {/* Modal Kamera */}
      {isCameraOpen && (
        <div className="fixed inset-0 z-50">
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={closeCamera}
          />
          
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-2 lg:p-4">
              <div 
                ref={cameraModalRef}
                className="relative bg-black rounded-lg lg:rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
              >
                {/* Modal Header */}
                <div className="absolute top-0 left-0 right-0 z-10 bg-black/60 backdrop-blur-sm px-3 lg:px-6 pt-3 lg:pt-6 pb-2 lg:pb-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 lg:gap-3">
                      <Camera className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
                      <h3 className="text-white font-semibold text-sm lg:text-base">Ambil Foto Daun Padi</h3>
                    </div>
                    <button
                      onClick={closeCamera}
                      className="flex-shrink-0 rounded-lg p-1.5 lg:p-2 text-white hover:text-gray-300 hover:bg-white/20 transition-colors"
                      aria-label="Tutup kamera"
                    >
                      <X className="w-4 h-4 lg:w-5 lg:h-5" />
                    </button>
                  </div>
                </div>

                {/* Camera Error */}
                {cameraError && (
                  <div className="absolute inset-0 flex items-center justify-center z-20">
                    <div className="bg-red-50/90 border border-red-200 rounded-xl p-4 lg:p-6 text-center max-w-md mx-2 lg:mx-4">
                      <AlertTriangle className="h-8 w-8 lg:h-12 lg:w-12 text-red-400 mx-auto mb-2 lg:mb-3" />
                      <h3 className="text-red-800 font-medium text-sm lg:text-base mb-1 lg:mb-2">Gagal Mengakses Kamera</h3>
                      <p className="text-red-600 text-xs lg:text-sm mb-3 lg:mb-4">{cameraError}</p>
                      <button
                        onClick={closeCamera}
                        className="px-3 lg:px-4 py-1.5 lg:py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors text-xs lg:text-sm"
                      >
                        Tutup Kamera
                      </button>
                    </div>
                  </div>
                )}

                {/* Camera Preview */}
                <div className="relative h-full">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-contain"
                  />
                  
                  {/* Camera Controls */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 lg:p-6">
                    <div className="flex justify-center items-center gap-3 lg:gap-6">
                      {/* Switch Camera Button */}
                      <button
                        onClick={switchCamera}
                        className="p-2 lg:p-3 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                        title="Ganti Kamera"
                      >
                        <RotateCw className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                      </button>

                      {/* Take Photo Button */}
                      <button
                        onClick={takePhoto}
                        className="p-4 lg:p-6 bg-white/90 hover:bg-white rounded-full transition-colors border-3 lg:border-4 border-white/50"
                        title="Ambil Foto"
                      >
                        <div className="w-8 h-8 lg:w-12 lg:h-12 bg-white rounded-full"></div>
                      </button>

                      {/* Fullscreen Button */}
                      <button
                        onClick={toggleFullscreen}
                        className="p-2 lg:p-3 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                        title={isFullscreen ? "Keluar Fullscreen" : "Fullscreen"}
                      >
                        {isFullscreen ? (
                          <Minimize className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                        ) : (
                          <Maximize className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Camera Guidelines */}
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <div className="w-48 h-48 lg:w-64 lg:h-64 border-2 border-white/50 rounded-lg"></div>
                    </div>
                  </div>
                </div>

                {/* Camera Instructions */}
                <div className="absolute bottom-16 lg:bottom-20 left-1/2 transform -translate-x-1/2 text-center">
                  <p className="text-white/80 text-xs lg:text-sm bg-black/50 px-2 lg:px-3 py-1 rounded-lg">
                    Arahkan kamera ke daun padi dan tekan tombol lingkaran
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detail Artikel */}
      {isArticleModalOpen && (
        <div className="fixed inset-0 z-50">
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={closeArticleModal}
          />
          
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-2 lg:p-4">
              <div className="relative bg-white rounded-lg lg:rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-gray-200">
                {/* Modal Header */}
                <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm px-4 lg:px-6 pt-4 lg:pt-6 pb-3 lg:pb-4 border-b border-gray-200">
                  <div className="flex justify-between items-start gap-2 lg:gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Category and Date */}
                      <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-3 mb-2 lg:mb-3">
                        <span className={`inline-flex items-center gap-1.5 text-xs px-2 lg:px-3 py-1 lg:py-1.5 rounded-md font-medium ${getCategoryColor(selectedArticle?.category || '')} border w-fit`}>
                          {getCategoryIcon(selectedArticle?.category || '')}
                          <span className="truncate max-w-[120px] lg:max-w-none">
                            {selectedArticle?.category}
                          </span>
                        </span>
                        <div className="flex flex-wrap items-center gap-2 lg:gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1.5">
                            <User className="w-3 h-3 lg:w-3.5 lg:h-3.5" />
                            <span className="truncate">{selectedArticle?.author || 'Admin'}</span>
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-3 h-3 lg:w-3.5 lg:h-3.5" />
                            {selectedArticle ? formatDisplayDate(selectedArticle.createdAt) : ''}
                          </span>
                        </div>
                      </div>
                      
                      {/* Title */}
                      <h2 className="text-lg lg:text-2xl font-bold text-gray-900 mb-2 lg:mb-3 pr-6 lg:pr-8 line-clamp-2">
                        {selectedArticle?.title}
                      </h2>
                      
                      {/* Description */}
                      <p className="text-gray-600 text-xs lg:text-sm leading-relaxed pr-6 lg:pr-8 line-clamp-2 lg:line-clamp-none">
                        {selectedArticle?.description}
                      </p>
                    </div>
                    <button
                      onClick={closeArticleModal}
                      className="flex-shrink-0 rounded-lg p-1.5 lg:p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors -mt-1 -mr-1 lg:-mt-1 lg:-mr-2"
                      aria-label="Tutup modal"
                    >
                      <X className="w-4 h-4 lg:w-5 lg:h-5" />
                    </button>
                  </div>
                </div>

                {/* Modal Content - Scrollable */}
                <div className="overflow-y-auto max-h-[calc(90vh-120px)] lg:max-h-[calc(90vh-140px)]">
                  {/* Modal Loading State */}
                  {modalLoading && (
                    <div className="px-4 lg:px-6 py-4 lg:py-8 space-y-3 lg:space-y-4">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className="space-y-2">
                          <div className="h-4 w-32 lg:w-48 bg-gray-200 rounded animate-pulse"></div>
                          <div className="h-16 lg:h-20 w-full bg-gray-200 rounded animate-pulse"></div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Modal Error State */}
                  {modalError && !modalLoading && (
                    <div className="px-4 lg:px-6 py-4 lg:py-8">
                      <div className="bg-red-50 border border-red-200 rounded-xl p-4 lg:p-6 text-center">
                        <AlertTriangle className="h-8 w-8 lg:h-12 lg:w-12 text-red-400 mx-auto mb-2 lg:mb-3" />
                        <h3 className="text-red-800 font-medium text-sm lg:text-base mb-1 lg:mb-2">Gagal Memuat Artikel</h3>
                        <p className="text-red-600 text-xs lg:text-sm mb-3 lg:mb-4">{modalError}</p>
                        <button
                          onClick={closeArticleModal}
                          className="px-3 lg:px-4 py-1.5 lg:py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors text-xs lg:text-sm"
                        >
                          Tutup Artikel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Modal Content */}
                  {selectedArticle && !modalLoading && !modalError && (
                    <div className="px-4 lg:px-6 py-4 lg:py-5 space-y-4 lg:space-y-6">
                      {/* Mini Thumbnail */}
                      {selectedArticle.thumbnailUrl && (
                        <div className="mb-3 lg:mb-4">
                          <div className="flex items-center gap-2 mb-1 lg:mb-2">
                            <ImageIcon className="w-3 h-3 lg:w-4 lg:h-4 text-gray-500" />
                            <span className="text-xs lg:text-sm font-medium text-gray-700">Gambar Ilustrasi</span>
                          </div>
                          <div className="relative h-40 lg:h-48 rounded-lg overflow-hidden border border-gray-200">
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
                      <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-3 lg:p-5 border border-emerald-100">
                        <div className="flex items-start gap-2 lg:gap-3 mb-3 lg:mb-4">
                          <div className="p-1.5 lg:p-2 bg-emerald-100 rounded-lg flex-shrink-0">
                            <Thermometer className="w-4 h-4 lg:w-5 lg:h-5 text-emerald-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-emerald-800 text-sm lg:text-base mb-0.5 lg:mb-1">Informasi Penyakit</h3>
                            <p className="text-xs lg:text-sm text-emerald-600">Detail penyakit yang dibahas dalam artikel ini</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 gap-2 lg:grid-cols-2 lg:gap-4">
                          <div className="bg-white/50 rounded-lg p-3 lg:p-4 border border-emerald-200">
                            <p className="text-xs font-medium text-emerald-700 mb-0.5 lg:mb-1">Nama Penyakit</p>
                            <p className="text-gray-900 font-medium text-sm lg:text-base truncate">
                              {selectedArticle.disease?.name || selectedArticle.category || 'Tidak Diketahui'}
                            </p>
                          </div>
                          <div className="bg-white/50 rounded-lg p-3 lg:p-4 border border-emerald-200">
                            <p className="text-xs font-medium text-emerald-700 mb-0.5 lg:mb-1">Kode Penyakit</p>
                            <p className="text-gray-900 font-medium text-xs lg:text-base font-mono truncate">
                              {selectedArticle.disease?.code || selectedArticle.category?.toLowerCase().replace(/\s+/g, '_') || 'unknown'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Symptoms */}
                      <div className="space-y-2 lg:space-y-3">
                        <div className="flex items-center gap-2 lg:gap-3">
                          <div className="p-1.5 lg:p-2 bg-red-100 rounded-lg flex-shrink-0">
                            <AlertCircle className="w-4 h-4 lg:w-5 lg:h-5 text-red-600" />
                          </div>
                          <h3 className="font-semibold text-gray-900 text-base lg:text-lg">Gejala yang Terlihat</h3>
                        </div>
                        <div className="bg-red-50/50 border border-red-100 rounded-xl p-3 lg:p-5">
                          <p className="text-gray-700 whitespace-pre-line leading-relaxed text-sm lg:text-base">
                            {selectedArticle.symptoms}
                          </p>
                        </div>
                      </div>

                      {/* Causes */}
                      <div className="space-y-2 lg:space-y-3">
                        <div className="flex items-center gap-2 lg:gap-3">
                          <div className="p-1.5 lg:p-2 bg-blue-100 rounded-lg flex-shrink-0">
                            <Droplets className="w-4 h-4 lg:w-5 lg:h-5 text-blue-600" />
                          </div>
                          <h3 className="font-semibold text-gray-900 text-base lg:text-lg">Penyebab Utama</h3>
                        </div>
                        <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3 lg:p-5">
                          <p className="text-gray-700 whitespace-pre-line leading-relaxed text-sm lg:text-base">
                            {selectedArticle.causes}
                          </p>
                        </div>
                      </div>

                      {/* Grid: Treatment dan Prevention */}
                      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
                        {/* Treatment */}
                        <div className="space-y-2 lg:space-y-3">
                          <div className="flex items-center gap-2 lg:gap-3">
                            <div className="p-1.5 lg:p-2 bg-purple-100 rounded-lg flex-shrink-0">
                              <Shield className="w-4 h-4 lg:w-5 lg:h-5 text-purple-600" />
                            </div>
                            <h3 className="font-semibold text-gray-900 text-base lg:text-lg">Pengobatan</h3>
                          </div>
                          <div className="bg-purple-50/50 border border-purple-100 rounded-xl p-3 lg:p-5">
                            <p className="text-gray-700 whitespace-pre-line leading-relaxed text-sm lg:text-base">
                              {selectedArticle.treatment}
                            </p>
                          </div>
                        </div>

                        {/* Prevention */}
                        <div className="space-y-2 lg:space-y-3">
                          <div className="flex items-center gap-2 lg:gap-3">
                            <div className="p-1.5 lg:p-2 bg-green-100 rounded-lg flex-shrink-0">
                              <CheckCircle className="w-4 h-4 lg:w-5 lg:h-5 text-green-600" />
                            </div>
                            <h3 className="font-semibold text-gray-900 text-base lg:text-lg">Pencegahan</h3>
                          </div>
                          <div className="bg-green-50/50 border border-green-100 rounded-xl p-3 lg:p-5">
                            <p className="text-gray-700 whitespace-pre-line leading-relaxed text-sm lg:text-base">
                              {selectedArticle.prevention}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Conclusion */}
                      <div className="space-y-2 lg:space-y-3">
                        <div className="flex items-center gap-2 lg:gap-3">
                          <div className="p-1.5 lg:p-2 bg-emerald-100 rounded-lg flex-shrink-0">
                            <Sprout className="w-4 h-4 lg:w-5 lg:h-5 text-emerald-600" />
                          </div>
                          <h3 className="font-semibold text-gray-900 text-base lg:text-lg">Kesimpulan</h3>
                        </div>
                        <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-100 rounded-xl p-3 lg:p-5">
                          <p className="text-gray-700 whitespace-pre-line leading-relaxed text-sm lg:text-base">
                            {selectedArticle.conclusion}
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="pt-4 lg:pt-8 pb-4 lg:pb-8 mt-4 lg:mt-6 border-t border-gray-200">
                        <div className="flex justify-center">
                          <button
                            onClick={closeArticleModal}
                            className="px-6 lg:px-8 py-2 lg:py-3 bg-emerald-600 text-white rounded-lg lg:rounded-xl font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2 shadow-sm hover:shadow-md text-sm lg:text-base"
                          >
                            <X className="w-4 h-4 lg:w-5 lg:h-5" />
                            Tutup Artikel
                          </button>
                        </div>
                        <p className="text-center text-gray-500 text-xs lg:text-sm mt-3 lg:mt-4">
                          Artikel ini memberikan informasi lengkap tentang penyakit yang terdeteksi
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}