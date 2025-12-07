// app/(public)/home/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import { Navbar } from '@/components/public/Navbar';
import { ArrowUpRight, Activity, AlertTriangle, Database, Server, RefreshCw } from 'lucide-react';

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
  imageUrl: string;
  time: string;
}

export default function HomePage() {
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

  // // API Base URL
  // const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://padicheckai-backend-production.up.railway.app";

  // Set mounted to true after component mounts (client-side only)
  useEffect(() => {
    setMounted(true);
  }, []);

  // Function to get token
  const getToken = (): string | null => {
    if (!mounted) return null; // Prevent accessing localStorage during SSR
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
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} menit yang lalu`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} jam yang lalu`;
      if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} hari yang lalu`;
      return `${Math.floor(diffInSeconds / 2592000)} bulan yang lalu`;
    } catch (error) {
      return 'Waktu tidak valid';
    }
  };

  // Function to get color for disease based on name
  const getDiseaseColor = (diseaseName: string): string => {
    if (!diseaseName) return 'bg-gray-500';
    
    const colorMap: Record<string, string> = {
      'Tungro': 'bg-orange-500',
      'Blast Daun (Leaf Blast)': 'bg-red-500',
      'Bercak Coklat (Brown Spot)': 'bg-yellow-500',
      'Hawar Daun Bakteri (BLB/Kresek)': 'bg-blue-400',
      'Hawar Pelepah (Leaf Scald)': 'bg-purple-500',
      'Narrow Brown Spot': 'bg-indigo-500',
      'Blast': 'bg-red-500',
      'Brown Spot': 'bg-yellow-500',
      'Bacterial Blight': 'bg-blue-400',
    };
    
    return colorMap[diseaseName] || 'bg-gray-500';
  };

  // Function to fetch dashboard stats
  const fetchStats = async () => {
    const token = getToken();
    if (!token) {
      setError('Anda belum login. Silakan login terlebih dahulu.');
      setLoading(prev => ({ ...prev, stats: false }));
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/stats`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setStats(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError('Gagal mengambil data statistik. Menggunakan data dummy.');
      // Fallback to dummy data
      setStats({
        totalDetections: 1,
        averageAccuracy: 77.1,
        topDisease: { name: "Blast Daun (Leaf Blast)", total: 1 }
      });
    } finally {
      setLoading(prev => ({ ...prev, stats: false }));
    }
  };

  // Function to fetch disease distribution
  const fetchDistribution = async () => {
    const token = getToken();
    if (!token) {
      setLoading(prev => ({ ...prev, chart: false }));
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/chart`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      // Filter out diseases with 0% for better display
      const filteredData = data.filter((item: DiseaseDistribution) => item.percentage > 0);
      setDistribution(filteredData);
    } catch (err) {
      console.error('Error fetching distribution:', err);
      // Fallback to dummy data
      setDistribution([
        { name: "Blast Daun (Leaf Blast)", count: 1, percentage: 50 },
        { name: "Hawar Daun Bakteri (BLB/Kresek)", count: 1, percentage: 50 }
      ]);
    } finally {
      setLoading(prev => ({ ...prev, chart: false }));
    }
  };

  // Function to fetch recent activities
  const fetchRecentActivities = async () => {
    const token = getToken();
    if (!token) {
      setLoading(prev => ({ ...prev, recent: false }));
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/recent`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setRecentActivities(data);
    } catch (err) {
      console.error('Error fetching recent activities:', err);
      // Fallback to dummy data with timestamps
      setRecentActivities([
        {
          id: "DET-2025-002",
          diseaseName: "Hawar Daun Bakteri (BLB/Kresek)",
          status: "Terdeteksi Penyakit",
          imageUrl: "",
          time: new Date(Date.now() - 15 * 60 * 1000).toISOString() // 15 minutes ago
        },
        {
          id: "DET-2025-001",
          diseaseName: "Blast Daun (Leaf Blast)",
          status: "Terdeteksi Penyakit",
          imageUrl: "",
          time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
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

  // Initial data fetch
  useEffect(() => {
    if (!mounted) return; // Wait until component is mounted
    
    const token = getToken();
    if (!token) {
      // If no token, set all loading to false and show error
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

  // Don't render anything until component is mounted (prevent hydration mismatch)
  if (!mounted) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <div className="w-64"></div>
        <div className="ml-64 flex-1">
          <main className="p-6">
            <div className="h-8 w-32 bg-gray-200 rounded animate-pulse mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-5 border shadow-sm">
                  <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
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
      <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
      
      <div className="ml-64 flex-1">
        <Navbar />
        
        <main className="p-6 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  <span>{error}</span>
                </div>
                <button 
                  onClick={refreshAllData}
                  className="text-red-700 hover:text-red-900 text-sm font-medium"
                >
                  Coba lagi
                </button>
              </div>
            </div>
          )}

          {/* Header with Refresh Button */}
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <button
              onClick={refreshAllData}
              disabled={refreshing || isLoading}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                refreshing || isLoading
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
              }`}
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Menyegarkan...' : 'Refresh Data'}
            </button>
          </div>

          {/* ====== STAT CARDS ====== */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Total Deteksi */}
            <div className="bg-white rounded-xl p-5 border shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-600">Total Deteksi</p>
                  <div className="text-2xl font-semibold mt-1">
                    {loading.stats ? (
                      <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
                    ) : (
                      stats?.totalDetections.toLocaleString() || '0'
                    )}
                  </div>
                </div>
                <Activity className="w-6 h-6 text-emerald-500" />
              </div>
              <div className="text-xs text-emerald-500 mt-2">
                {stats?.totalDetections && stats.totalDetections > 0 ? 'Data real-time' : 'Belum ada deteksi'}
              </div>
            </div>

            {/* Akurasi Model */}
            <div className="bg-white rounded-xl p-5 border shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-600">Akurasi Model</p>
                  <div className="text-2xl font-semibold mt-1">
                    {loading.stats ? (
                      <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
                    ) : (
                      stats?.averageAccuracy ? `${stats.averageAccuracy.toFixed(2)}%` : '0%'
                    )}
                  </div>
                </div>
                <Database className="w-6 h-6 text-emerald-500" />
              </div>
              <div className="text-xs text-emerald-500 mt-2">
                {stats?.averageAccuracy && stats.averageAccuracy > 0 ? 'Rata-rata dari semua deteksi' : 'Belum ada data'}
              </div>
            </div>

            {/* Penyakit Terbanyak */}
            <div className="bg-white rounded-xl p-5 border shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-600">Penyakit Terbanyak</p>
                  <div className="text-xl font-semibold mt-1">
                    {loading.stats ? (
                      <div className="h-7 w-24 bg-gray-200 rounded animate-pulse"></div>
                    ) : (
                      stats?.topDisease?.name || 'Tidak ada data'
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    {loading.stats ? (
                      <div className="h-4 w-16 bg-gray-200 rounded animate-pulse mt-1"></div>
                    ) : (
                      stats?.topDisease?.total ? `${stats.topDisease.total} kasus` : '0 kasus'
                    )}
                  </div>
                </div>
                <AlertTriangle className="w-6 h-6 text-orange-500" />
              </div>
            </div>

            {/* Status Server */}
            <div className="bg-white rounded-xl p-5 border shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-600">Status Server</p>
                  <div className="text-xl font-semibold mt-1">Online</div>
                  <div className="text-xs text-emerald-500">99.9% uptime</div>
                </div>
                <Server className="w-6 h-6 text-purple-500" />
              </div>
            </div>
          </div>

          {/* ====== PROMO / START DETECTION BANNER ====== */}
          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-8 rounded-xl text-white shadow">
            <h2 className="text-xl font-semibold mb-2">Mulai Deteksi Baru</h2>
            <div className="text-sm text-emerald-50 max-w-xl">
              Upload foto daun padi Anda untuk mendeteksi penyakit secara otomatis menggunakan AI.
              Dapatkan hasil analisis dalam hitungan detik dengan akurasi tinggi.
            </div>

            <button className="mt-5 px-5 py-2 bg-white text-emerald-700 rounded-lg flex items-center gap-2 hover:bg-gray-100 transition">
              Mulai Deteksi
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          {/* ====== GRID: Aktivitas Terbaru & Distribusi ====== */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* ====== Aktivitas Terbaru ====== */}
            <div className="bg-white rounded-xl p-6 border shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Aktivitas Terbaru</h3>
                {loading.recent && (
                  <div className="flex items-center text-sm text-gray-500">
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    Loading...
                  </div>
                )}
              </div>

              {loading.recent ? (
                // Skeleton loader for recent activities
                <div className="space-y-3">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="border rounded-lg p-3 animate-pulse">
                      <div className="h-4 w-32 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 w-24 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : recentActivities.length > 0 ? (
                <div className="space-y-3">
                  {recentActivities.map((activity, i) => (
                    <div key={i} className="flex justify-between items-center border rounded-lg p-3 hover:bg-gray-50">
                      <div>
                        <div className="font-medium text-gray-800">{activity.diseaseName}</div>
                        <div className="text-xs text-gray-500">{getTimeAgo(activity.time)}</div>
                      </div>
                      <button className="text-xs text-emerald-600 hover:underline">Detail</button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-2">Belum ada aktivitas deteksi</div>
                  <div className="text-sm text-gray-500">Mulai deteksi pertama Anda!</div>
                </div>
              )}
            </div>

            {/* ====== Distribusi Penyakit ====== */}
            <div className="bg-white rounded-xl p-6 border shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Distribusi Penyakit</h3>
                {loading.chart && (
                  <div className="flex items-center text-sm text-gray-500">
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    Loading...
                  </div>
                )}
              </div>

              {loading.chart ? (
                // Skeleton loader for distribution
                <div className="space-y-5">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i}>
                      <div className="flex justify-between mb-1">
                        <div className="h-4 w-24 bg-gray-200 rounded"></div>
                        <div className="h-4 w-8 bg-gray-200 rounded"></div>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full"></div>
                    </div>
                  ))}
                </div>
              ) : distribution.length > 0 ? (
                <div className="space-y-5">
                  {distribution.map((item, i) => (
                    <div key={i}>
                      <div className="flex justify-between mb-1">
                        <div className="text-sm">{item.name}</div>
                        <div className="text-sm">{item.percentage}%</div>
                      </div>
                      {/* Progress Bar */}
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`${getDiseaseColor(item.name)} h-full rounded-full transition-all duration-500`}
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{item.count} kasus</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-2">Belum ada data distribusi</div>
                  <div className="text-sm text-gray-500">Lakukan deteksi untuk melihat distribusi penyakit</div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}