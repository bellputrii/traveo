// app/(public)/home/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import { Navbar } from '@/components/public/Navbar';
import { ArrowUpRight, Activity, AlertTriangle, Database, Server, RefreshCw, ExternalLink, Clock, Leaf, Thermometer, CheckCircle, Menu, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

// Type definitions
interface DashboardStats {
  totalDetections: number;
  averageAccuracy: number;
  topDisease: {
    name: string;
    total: number;
  };
}

interface DiseaseDistribution {
  name: string;
  count: number;
  percentage: number;
}

interface RecentActivity {
  id: string;
  diseaseName: string;
  status: string;
  thumbnailUrl: string;
  time: string;
}

export default function HomePage() {
  const router = useRouter();
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [loading, setLoading] = useState({
    stats: true,
    chart: true,
    recent: true
  });
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [distribution, setDistribution] = useState<DiseaseDistribution[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [userName, setUserName] = useState<string>('');
  const [apiConnected, setApiConnected] = useState<boolean>(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Set mounted to true after component mounts (client-side only)
  useEffect(() => {
    setMounted(true);
    const name = localStorage.getItem("userName") || sessionStorage.getItem("userName");
    if (name) setUserName(name);
  }, []);

  // Function to get token
  const getToken = (): string | null => {
    if (!mounted) return null;
    return localStorage.getItem("token") || sessionStorage.getItem("token");
  };

  // Function to format time ago
  const getTimeAgo = (dateString: string): string => {
    if (!dateString) return 'Waktu tidak tersedia';
    
    try {
      const now = new Date();
      const past = new Date(dateString);
      const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);
      
      if (diffInSeconds < 60) return 'Baru saja';
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} menit lalu`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} jam lalu`;
      if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} hari lalu`;
      return `${Math.floor(diffInSeconds / 2592000)} bulan lalu`;
    } catch (error) {
      return 'Waktu tidak valid';
    }
  };

  // Function to format date
  const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  // Function to get color for disease based on name
  const getDiseaseColor = (diseaseName: string): string => {
    if (!diseaseName) return 'bg-gray-500';
    
    const colorMap: Record<string, string> = {
      'Tanaman Sehat (Healthy)': 'bg-emerald-500',
      'Blast Daun (Leaf Blast)': 'bg-red-500',
      'Bercak Coklat (Brown Spot)': 'bg-yellow-500',
      'Hawar Daun Bakteri (BLB/Kresek)': 'bg-blue-500',
      'Hawar Pelepah (Leaf Scald)': 'bg-purple-500',
      'Narrow Brown Spot': 'bg-indigo-500',
      'Tungro': 'bg-orange-500',
    };
    
    return colorMap[diseaseName] || 'bg-gray-500';
  };

  // Function to get disease status color
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'Terdeteksi Penyakit':
        return 'text-red-600 bg-red-50 border-red-100';
      case 'Sehat':
        return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-100';
    }
  };

  // Function to get disease icon based on name
  const getDiseaseIcon = (diseaseName: string): string => {
    const iconMap: Record<string, string> = {
      'Tanaman Sehat (Healthy)': '🌿',
      'Blast Daun (Leaf Blast)': '🔥',
      'Bercak Coklat (Brown Spot)': '🍂',
      'Hawar Daun Bakteri (BLB/Kresek)': '🦠',
      'Hawar Pelepah (Leaf Scald)': '🍃',
      'Narrow Brown Spot': '🥀',
      'Tungro': '🟠',
    };
    
    return iconMap[diseaseName] || '📊';
  };

  // Function to fetch dashboard stats
  const fetchStats = async () => {
    const token = getToken();
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/stats`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
        setApiConnected(true);
      } else {
        // Fallback data
        setStats({
          totalDetections: 8,
          averageAccuracy: 82.16,
          topDisease: {
            name: "Blast Daun (Leaf Blast)",
            total: 3
          }
        });
        setApiConnected(false);
      }
    } catch (err) {
      // Fallback data
      setStats({
        totalDetections: 8,
        averageAccuracy: 82.16,
        topDisease: {
          name: "Blast Daun (Leaf Blast)",
          total: 3
        }
      });
      setApiConnected(false);
    } finally {
      setLoading(prev => ({ ...prev, stats: false }));
    }
  };

  // Function to fetch disease distribution
  const fetchDistribution = async () => {
    const token = getToken();
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/chart`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Sort by percentage descending and filter out diseases with 0%
        const sortedData = data
          .filter((item: DiseaseDistribution) => item.percentage > 0)
          .sort((a: DiseaseDistribution, b: DiseaseDistribution) => b.percentage - a.percentage);
        setDistribution(sortedData);
      } else {
        // Fallback data
        setDistribution([
          { name: "Blast Daun (Leaf Blast)", count: 3, percentage: 42.9 },
          { name: "Hawar Daun Bakteri (BLB/Kresek)", count: 2, percentage: 28.6 },
          { name: "Bercak Coklat (Brown Spot)", count: 1, percentage: 14.3 },
          { name: "Hawar Pelepah (Leaf Scald)", count: 1, percentage: 14.3 }
        ]);
      }
    } catch (err) {
      // Fallback data
      setDistribution([
        { name: "Blast Daun (Leaf Blast)", count: 3, percentage: 42.9 },
        { name: "Hawar Daun Bakteri (BLB/Kresek)", count: 2, percentage: 28.6 },
        { name: "Bercak Coklat (Brown Spot)", count: 1, percentage: 14.3 },
        { name: "Hawar Pelepah (Leaf Scald)", count: 1, percentage: 14.3 }
      ]);
    } finally {
      setLoading(prev => ({ ...prev, chart: false }));
    }
  };

  // Function to fetch recent activities
  const fetchRecentActivities = async () => {
    const token = getToken();
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/recent`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRecentActivities(data);
      } else {
        // Fallback data with recent timestamps
        const now = new Date();
        setRecentActivities([
          {
            id: "DET-2025-008",
            diseaseName: "Tanaman Sehat (Healthy)",
            status: "Sehat",
            thumbnailUrl: "https://padicheckai-backend-production.up.railway.app/uploads/image-1765238944547-157655523.jpg",
            time: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
          },
          {
            id: "DET-2025-007",
            diseaseName: "Blast Daun (Leaf Blast)",
            status: "Terdeteksi Penyakit",
            thumbnailUrl: "https://padicheckai-backend-production.up.railway.app/uploads/image-1765238139137-775971443.png",
            time: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString() // 4 hours ago
          },
          {
            id: "DET-2025-006",
            diseaseName: "Blast Daun (Leaf Blast)",
            status: "Terdeteksi Penyakit",
            thumbnailUrl: "https://padicheckai-backend-production.up.railway.app/uploads/image-1765237437345-154878918.png",
            time: new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString() // 5 hours ago
          },
          {
            id: "DET-2025-005",
            diseaseName: "Bercak Coklat (Brown Spot)",
            status: "Terdeteksi Penyakit",
            thumbnailUrl: "https://padicheckai-backend-production.up.railway.app/uploads/image-1765237408292-208244863.png",
            time: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString() // 6 hours ago
          }
        ]);
      }
    } catch (err) {
      // Fallback data
      const now = new Date();
      setRecentActivities([
        {
          id: "DET-2025-008",
          diseaseName: "Tanaman Sehat (Healthy)",
          status: "Sehat",
          thumbnailUrl: "https://padicheckai-backend-production.up.railway.app/uploads/image-1765238944547-157655523.jpg",
          time: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          id: "DET-2025-007",
          diseaseName: "Blast Daun (Leaf Blast)",
          status: "Terdeteksi Penyakit",
          thumbnailUrl: "https://padicheckai-backend-production.up.railway.app/uploads/image-1765238139137-775971443.png",
          time: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString()
        },
        {
          id: "DET-2025-006",
          diseaseName: "Blast Daun (Leaf Blast)",
          status: "Terdeteksi Penyakit",
          thumbnailUrl: "https://padicheckai-backend-production.up.railway.app/uploads/image-1765237437345-154878918.png",
          time: new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString()
        },
        {
          id: "DET-2025-005",
          diseaseName: "Bercak Coklat (Brown Spot)",
          status: "Terdeteksi Penyakit",
          thumbnailUrl: "https://padicheckai-backend-production.up.railway.app/uploads/image-1765237408292-208244863.png",
          time: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString()
        }
      ]);
    } finally {
      setLoading(prev => ({ ...prev, recent: false }));
    }
  };

  // Function to refresh all data
  const refreshAllData = async () => {
    setRefreshing(true);
    setError(null);
    
    // Reset loading states
    setLoading({ stats: true, chart: true, recent: true });
    
    // Fetch all data in parallel
    await Promise.all([
      fetchStats(),
      fetchDistribution(),
      fetchRecentActivities()
    ]);
    
    setRefreshing(false);
  };

  // Function to navigate to detection detail
  const navigateToDetectionDetail = (id: string) => {
    router.push(`/detection/${id}`);
  };

  // Function to navigate to new detection
  const navigateToNewDetection = () => {
    router.push('/detection/new');
  };

  // Function to logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('userName');
    router.push('/login');
  };

  // Function to view all detections
  const navigateToAllDetections = () => {
    router.push('/detection/history');
  };

  // Initial data fetch
  useEffect(() => {
    if (!mounted) return;
    
    const token = getToken();
    if (!token) {
      setLoading({ stats: false, chart: false, recent: false });
      setError('Silakan login untuk melihat dashboard.');
      return;
    }

    fetchStats();
    fetchDistribution();
    fetchRecentActivities();
  }, [mounted]);

  // Check if all data is still loading
  const isLoading = loading.stats || loading.chart || loading.recent;

  // Don't render anything until component is mounted
  if (!mounted) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <div className="w-64 hidden lg:block"></div>
        <div className="lg:ml-64 flex-1">
          <main className="p-4 md:p-6">
            <div className="h-8 w-32 bg-gray-200 rounded animate-pulse mb-6"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg md:rounded-xl p-4 md:p-5 border shadow-sm">
                  <div className="h-5 md:h-6 w-20 md:w-32 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-6 md:h-8 w-12 md:w-20 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar for desktop */}
      <div className="hidden lg:block">
        <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
      </div>
      
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)} />
          <div className="relative z-50 w-64 h-full">
            <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
          </div>
        </div>
      )}
      
      <div className="flex-1 lg:ml-64">
        {/* Custom Navbar for mobile */}
        <div className="lg:hidden bg-white border-b shadow-sm">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Dashboard</h1>
                <p className="text-sm text-gray-600 truncate max-w-[180px]">
                  Hi, {userName || 'Pengguna'}!
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-xs text-gray-500 text-right">
                {formatDate(new Date().toISOString())}
              </div>
            </div>
          </div>
        </div>
        
        {/* Desktop Navbar */}
        <div className="hidden lg:block">
          <Navbar />
        </div>
        
        <main className="p-4 md:p-6 space-y-4 md:space-y-6">
          {/* Welcome Header for Desktop */}
          <div className="hidden lg:flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Selamat datang kembali, {userName || 'Pengguna'}! 👋
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-500">
                {formatDate(new Date().toISOString())}
              </div>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Connection Status */}
          {!apiConnected && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-3 md:px-4 py-2 md:py-3 rounded-lg text-sm">
              <div className="flex items-start md:items-center">
                <AlertTriangle className="h-4 w-4 md:h-5 md:w-5 mr-2 flex-shrink-0 mt-0.5 md:mt-0" />
                <span>
                  Menampilkan data contoh. Pastikan backend API berjalan untuk data real-time.
                </span>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 md:px-4 py-2 md:py-3 rounded-lg text-sm">
              <div className="flex items-start md:items-center">
                <AlertTriangle className="h-4 w-4 md:h-5 md:w-5 mr-2 flex-shrink-0 mt-0.5 md:mt-0" />
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Header with Refresh Button */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 md:gap-0">
            <h2 className="text-base md:text-lg font-semibold text-gray-800">Ringkasan Statistik</h2>
            <div className="flex items-center gap-2 md:gap-3 w-full sm:w-auto">
              <div className={`flex items-center px-2 md:px-3 py-1 rounded-full text-xs md:text-sm ${
                apiConnected 
                  ? 'bg-emerald-100 text-emerald-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {apiConnected ? (
                  <>
                    <CheckCircle className="h-3 w-3 mr-1" />
                    <span className="hidden sm:inline">Terhubung ke API</span>
                    <span className="sm:hidden">Online</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    <span className="hidden sm:inline">Mode Demo</span>
                    <span className="sm:hidden">Demo</span>
                  </>
                )}
              </div>
              <button
                onClick={refreshAllData}
                disabled={refreshing || isLoading}
                className={`flex items-center gap-1 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-colors flex-shrink-0 ${
                  refreshing || isLoading
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                }`}
              >
                <RefreshCw className={`h-3 w-3 md:h-4 md:w-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">
                  {refreshing ? 'Menyegarkan...' : 'Refresh Data'}
                </span>
                <span className="sm:hidden">Refresh</span>
              </button>
            </div>
          </div>

          {/* ====== STAT CARDS ====== */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {/* Total Deteksi */}
            <div className="bg-white rounded-lg md:rounded-xl p-3 md:p-5 border shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs md:text-sm text-gray-600 flex items-center gap-1">
                    <Leaf className="h-3 w-3 md:h-4 md:w-4" />
                    <span className="truncate">Total Deteksi</span>
                  </p>
                  <div className="text-lg md:text-2xl font-semibold mt-1">
                    {loading.stats ? (
                      <div className="h-6 md:h-8 w-12 md:w-20 bg-gray-200 rounded animate-pulse"></div>
                    ) : (
                      stats?.totalDetections?.toLocaleString('id-ID') || '0'
                    )}
                  </div>
                </div>
                <Activity className="w-5 h-5 md:w-6 md:h-6 text-emerald-500 flex-shrink-0" />
              </div>
              <div className="text-xs text-emerald-500 mt-1 md:mt-2 flex items-center gap-1 truncate">
                {stats?.totalDetections && stats.totalDetections > 0 ? (
                  <>
                    <span>Total analisis</span>
                    <Clock className="h-2 w-2 md:h-3 md:w-3" />
                  </>
                ) : (
                  'Belum ada deteksi'
                )}
              </div>
            </div>

            {/* Akurasi Model */}
            <div className="bg-white rounded-lg md:rounded-xl p-3 md:p-5 border shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs md:text-sm text-gray-600 truncate">Akurasi Model</p>
                  <div className="text-lg md:text-2xl font-semibold mt-1">
                    {loading.stats ? (
                      <div className="h-6 md:h-8 w-12 md:w-20 bg-gray-200 rounded animate-pulse"></div>
                    ) : (
                      stats?.averageAccuracy ? `${stats.averageAccuracy.toFixed(1)}%` : '0%'
                    )}
                  </div>
                </div>
                <Database className="w-5 h-5 md:w-6 md:h-6 text-emerald-500 flex-shrink-0" />
              </div>
              <div className="text-xs text-emerald-500 mt-1 md:mt-2 truncate">
                {stats?.averageAccuracy && stats.averageAccuracy > 0 ? 'Rata-rata semua deteksi' : 'Belum ada data'}
              </div>
            </div>

            {/* Penyakit Terbanyak */}
            <div className="bg-white rounded-lg md:rounded-xl p-3 md:p-5 border shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <p className="text-xs md:text-sm text-gray-600 flex items-center gap-1">
                    <Thermometer className="h-3 w-3 md:h-4 md:w-4" />
                    <span className="truncate">Penyakit Terbanyak</span>
                  </p>
                  <div className="text-sm md:text-xl font-semibold mt-1 truncate">
                    {loading.stats ? (
                      <div className="h-5 md:h-7 w-16 md:w-24 bg-gray-200 rounded animate-pulse"></div>
                    ) : (
                      stats?.topDisease?.name ? (
                        <span className="truncate block">{stats.topDisease.name}</span>
                      ) : 'Tidak ada data'
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mt-1 truncate">
                    {loading.stats ? (
                      <div className="h-3 md:h-4 w-10 md:w-16 bg-gray-200 rounded animate-pulse"></div>
                    ) : (
                      stats?.topDisease?.total ? `${stats.topDisease.total} kasus` : '0 kasus'
                    )}
                  </div>
                </div>
                <AlertTriangle className="w-5 h-5 md:w-6 md:h-6 text-orange-500 flex-shrink-0 ml-1" />
              </div>
            </div>

            {/* Status Sistem */}
            <div className="bg-white rounded-lg md:rounded-xl p-3 md:p-5 border shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs md:text-sm text-gray-600">Status Sistem</p>
                  <div className="text-sm md:text-xl font-semibold mt-1">
                    <span className={`${apiConnected ? 'text-emerald-600' : 'text-yellow-600'}`}>
                      {apiConnected ? 'Online' : 'Demo'}
                    </span>
                  </div>
                  <div className={`text-xs mt-1 truncate ${apiConnected ? 'text-emerald-500' : 'text-yellow-500'}`}>
                    {apiConnected ? 'Sistem normal' : 'Data contoh'}
                  </div>
                </div>
                <Server className={`w-5 h-5 md:w-6 md:h-6 ${apiConnected ? 'text-purple-500' : 'text-yellow-500'} flex-shrink-0`} />
              </div>
            </div>
          </div>

          {/* ====== PROMO / START DETECTION BANNER ====== */}
          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-4 md:p-6 rounded-lg md:rounded-xl text-white shadow hover:shadow-lg transition-shadow">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="mb-2 md:mb-0">
                <h2 className="text-lg md:text-xl font-semibold mb-1 md:mb-2">Mulai Deteksi Baru</h2>
                <div className="text-xs md:text-sm text-emerald-50 max-w-xl">
                  Upload foto daun padi untuk deteksi penyakit otomatis dengan AI.
                  Hasil analisis dalam hitungan detik.
                </div>
              </div>
              <button 
                onClick={navigateToNewDetection}
                className="px-4 py-2 md:px-5 md:py-2.5 bg-white text-emerald-700 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-50 transition font-medium shadow w-full md:w-auto"
              >
                <span>Mulai Deteksi</span>
                <ArrowUpRight className="w-3 h-3 md:w-4 md:h-4" />
              </button>
            </div>
          </div>

          {/* ====== GRID: Aktivitas Terbaru & Distribusi ====== */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {/* ====== Aktivitas Terbaru ====== */}
            <div className="bg-white rounded-lg md:rounded-xl p-4 md:p-6 border shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center mb-3 md:mb-4">
                <h3 className="text-base md:text-lg font-semibold">Aktivitas Terbaru</h3>
                <button 
                  onClick={navigateToAllDetections}
                  className="text-xs md:text-sm text-emerald-600 hover:text-emerald-800 hover:underline"
                >
                  Lihat Semua →
                </button>
              </div>

              {loading.recent ? (
                // Skeleton loader for recent activities
                <div className="space-y-2 md:space-y-3">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="border rounded-lg p-2 md:p-3 animate-pulse">
                      <div className="h-3 md:h-4 w-24 md:w-32 bg-gray-200 rounded mb-2"></div>
                      <div className="h-2 md:h-3 w-16 md:w-24 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : recentActivities.length > 0 ? (
                <div className="space-y-2 md:space-y-3">
                  {recentActivities.slice(0, 5).map((activity) => (
                    <div 
                      key={activity.id} 
                      className="border rounded-lg p-2 md:p-3 hover:bg-gray-50 transition cursor-pointer group"
                      onClick={() => navigateToDetectionDetail(activity.id)}
                    >
                      <div className="flex items-start gap-2 md:gap-3">
                        {/* Image thumbnail */}
                        <div className="relative w-12 h-12 md:w-16 md:h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                          {activity.thumbnailUrl ? (
                            <Image
                              src={activity.thumbnailUrl}
                              alt={activity.diseaseName}
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 48px, 64px"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-200">
                              <Leaf className="h-4 w-4 md:h-6 md:w-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <div className="min-w-0">
                              <div className="flex items-center gap-1 md:gap-2">
                                <span className="text-base md:text-lg">{getDiseaseIcon(activity.diseaseName)}</span>
                                <div className="font-medium text-gray-800 truncate text-sm md:text-base">
                                  {activity.diseaseName}
                                </div>
                              </div>
                              <div className="text-xs text-gray-500 mt-0.5 md:mt-1 truncate">
                                ID: {activity.id}
                              </div>
                            </div>
                            <ExternalLink className="h-3 w-3 md:h-4 md:w-4 text-gray-400 group-hover:text-emerald-500 transition-colors flex-shrink-0 mt-1" />
                          </div>
                          
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-1 md:mt-2">
                            <span className={`px-1.5 py-0.5 md:px-2 md:py-0.5 rounded text-xs font-medium border ${getStatusColor(activity.status)} self-start`}>
                              {activity.status}
                            </span>
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <Clock className="h-2 w-2 md:h-3 md:w-3" />
                              {getTimeAgo(activity.time)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 md:py-8">
                  <div className="text-gray-400 mb-2 text-sm md:text-base">Belum ada aktivitas deteksi</div>
                  <div className="text-xs md:text-sm text-gray-500">Mulai deteksi pertama Anda!</div>
                </div>
              )}
            </div>

            {/* ====== Distribusi Penyakit ====== */}
            <div className="bg-white rounded-lg md:rounded-xl p-4 md:p-6 border shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center mb-3 md:mb-4">
                <h3 className="text-base md:text-lg font-semibold">Distribusi Penyakit</h3>
                {loading.chart && (
                  <div className="flex items-center text-xs md:text-sm text-gray-500">
                    <RefreshCw className="h-3 w-3 md:h-4 md:w-4 animate-spin mr-1 md:mr-2" />
                    Loading...
                  </div>
                )}
              </div>

              {loading.chart ? (
                // Skeleton loader for distribution
                <div className="space-y-3 md:space-y-5">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i}>
                      <div className="flex justify-between mb-1">
                        <div className="h-3 md:h-4 w-16 md:w-24 bg-gray-200 rounded"></div>
                        <div className="h-3 md:h-4 w-6 md:w-8 bg-gray-200 rounded"></div>
                      </div>
                      <div className="w-full h-1.5 md:h-2 bg-gray-200 rounded-full"></div>
                    </div>
                  ))}
                </div>
              ) : distribution.length > 0 ? (
                <>
                  <div className="space-y-3 md:space-y-5">
                    {distribution.map((item, i) => (
                      <div key={i}>
                        <div className="flex justify-between mb-1">
                          <div className="flex items-center gap-1 md:gap-2">
                            <div className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${getDiseaseColor(item.name)}`}></div>
                            <div className="text-xs md:text-sm font-medium truncate max-w-[150px] md:max-w-[200px]">
                              {item.name}
                            </div>
                          </div>
                          <div className="text-xs md:text-sm font-semibold">{item.percentage}%</div>
                        </div>
                        {/* Progress Bar */}
                        <div className="w-full h-1.5 md:h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`${getDiseaseColor(item.name)} h-full rounded-full transition-all duration-500`}
                            style={{ width: `${item.percentage}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5 md:mt-1 flex justify-between">
                          <span>{item.count} kasus</span>
                          <span>{item.percentage.toFixed(1)}% dari total</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Summary */}
                  <div className="mt-4 md:mt-6 pt-3 md:pt-4 border-t border-gray-100">
                    <div className="flex justify-between text-xs md:text-sm">
                      <span className="text-gray-600">Total Kasus:</span>
                      <span className="font-semibold">
                        {distribution.reduce((sum, item) => sum + item.count, 0)} deteksi
                      </span>
                    </div>
                    <div className="flex justify-between text-xs md:text-sm mt-0.5 md:mt-1">
                      <span className="text-gray-600">Rentang Akurasi:</span>
                      <span className="font-semibold text-emerald-600">82.16%</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-6 md:py-8">
                  <div className="text-gray-400 mb-2 text-sm md:text-base">Belum ada data distribusi</div>
                  <div className="text-xs md:text-sm text-gray-500">Lakukan deteksi untuk melihat distribusi penyakit</div>
                </div>
              )}
            </div>
          </div>

          {/* Info Footer */}
          <div className="bg-gray-50 rounded-lg md:rounded-xl p-3 md:p-4 border text-center">
            <p className="text-xs md:text-sm text-gray-600">
              Dashboard ini {apiConnected ? 'menampilkan data real-time' : 'sedang menampilkan data contoh'}. 
              {!apiConnected && ' Untuk data real-time, pastikan backend API berjalan.'}
            </p>
            <div className="mt-1 md:mt-2 text-xs text-gray-500">
              Data terakhir diperbarui: {new Date().toLocaleString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}