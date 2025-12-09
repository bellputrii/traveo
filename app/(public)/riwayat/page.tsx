/* eslint-disable @typescript-eslint/no-explicit-any */
// app/(public)/riwayat/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import { Navbar } from '@/components/public/Navbar';
import { Calendar, Download, Loader2, X, CheckCircle, AlertCircle, Menu, Filter } from 'lucide-react';

interface DetectionHistory {
  id: string;
  hasil: string;
  akurasi: string;
  tingkat: string;
  tanggal: string;
  waktu: string;
  status: string;
  detectedAt: Date;
  imageUrl?: string;
  disease?: {
    id: number;
    name: string;
    description: string;
    solutions: string[];
    thumbnailUrl: string;
  };
}

export default function RiwayatDeteksiPage() {
  const [activeMenu, setActiveMenu] = useState('riwayat');
  const [selectedFilter, setSelectedFilter] = useState('Semua');
  const [detectionData, setDetectionData] = useState<DetectionHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // State untuk modal
  const [showExportConfirm, setShowExportConfirm] = useState(false);
  const [showExportSuccess, setShowExportSuccess] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Ref untuk modal
  const modalRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const fetchDetectionHistory = async () => {
      try {
        const token = getToken();
        
        if (!token) {
          setError('Anda belum login. Silakan login terlebih dahulu.');
          setLoading(false);
          return;
        }

        const myHeaders = new Headers();
        myHeaders.append("Authorization", `Bearer ${token}`);

        const response = await fetch(
          "https://padicheckai-backend-production.up.railway.app/detections/history",
          {
            method: "GET",
            headers: myHeaders,
            redirect: "follow" as RequestRedirect
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        // Mapping data dari API ke format yang digunakan di komponen
        const mappedData: DetectionHistory[] = result.data.map((item: any) => {
          const detectedAt = new Date(item.detectedAt);
          const tanggal = detectedAt.toISOString().split('T')[0];
          const waktu = detectedAt.toLocaleTimeString('id-ID', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
          });

          // Menentukan tingkat berdasarkan akurasi
          const getTingkat = (accuracy: number) => {
            if (accuracy >= 90) return "Tinggi";
            if (accuracy >= 80) return "Sedang";
            if (accuracy >= 70) return "Rendah";
            return "Sangat Rendah";
          };

          // Mapping status
          const statusMap: { [key: string]: string } = {
            "Terdeteksi Penyakit": "Terdeteksi",
            "Healthy": "Sehat"
          };

          return {
            id: item.id,
            hasil: item.disease?.name || "Sehat",
            akurasi: `${item.accuracy.toFixed(1)}%`,
            tingkat: getTingkat(item.accuracy),
            tanggal,
            waktu,
            status: statusMap[item.status] || item.status,
            detectedAt,
            imageUrl: item.imageUrl,
            disease: item.disease
          };
        });

        // Sort by latest date
        mappedData.sort((a, b) => b.detectedAt.getTime() - a.detectedAt.getTime());
        
        setDetectionData(mappedData);
      } catch (error: any) {
        console.error('Error fetching detection history:', error);
        setError(error.message || 'Terjadi kesalahan saat mengambil data');
        
        // Fallback ke data mockup jika API error
        setDetectionData(getMockData());
      } finally {
        setLoading(false);
      }
    };

    fetchDetectionHistory();
  }, [mounted]);

  // Mock data fallback
  const getMockData = (): DetectionHistory[] => {
    return [
      { 
        id: "DET-2024-001", 
        hasil: "Tungro", 
        akurasi: "96.5%", 
        tingkat: "Tinggi", 
        tanggal: "2024-11-26", 
        waktu: "14:30", 
        status: "Terdeteksi",
        detectedAt: new Date('2024-11-26T14:30:00')
      },
      { 
        id: "DET-2024-002", 
        hasil: "Blast", 
        akurasi: "94.2%", 
        tingkat: "Sedang", 
        tanggal: "2024-11-26", 
        waktu: "12:15", 
        status: "Terdeteksi",
        detectedAt: new Date('2024-11-26T12:15:00')
      },
      { 
        id: "DET-2024-003", 
        hasil: "Healthy", 
        akurasi: "99.1%", 
        tingkat: "Sehat", 
        tanggal: "2024-11-25", 
        waktu: "16:45", 
        status: "Sehat",
        detectedAt: new Date('2024-11-25T16:45:00')
      },
      { 
        id: "DET-2024-004", 
        hasil: "Bacterial Blight", 
        akurasi: "91.8%", 
        tingkat: "Tinggi", 
        tanggal: "2024-11-25", 
        waktu: "10:20", 
        status: "Terdeteksi",
        detectedAt: new Date('2024-11-25T10:20:00')
      },
      { 
        id: "DET-2024-005", 
        hasil: "Brown Spot", 
        akurasi: "88.7%", 
        tingkat: "Rendah", 
        tanggal: "2024-11-24", 
        waktu: "15:30", 
        status: "Terdeteksi",
        detectedAt: new Date('2024-11-24T15:30:00')
      },
      { 
        id: "DET-2024-006", 
        hasil: "Healthy", 
        akurasi: "97.3%", 
        tingkat: "Sehat", 
        tanggal: "2024-11-24", 
        waktu: "09:10", 
        status: "Sehat",
        detectedAt: new Date('2024-11-24T09:10:00')
      },
    ];
  };

  const filters = ['Semua', 'Hari Ini', 'Minggu Ini', 'Bulan Ini'];

  // Filter data berdasarkan pilihan
  const filteredData = detectionData.filter((item) => {
    if (selectedFilter === 'Semua') return true;
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    const date = item.detectedAt;
    
    switch (selectedFilter) {
      case 'Hari Ini':
        return date.getDate() === today.getDate() &&
               date.getMonth() === today.getMonth() &&
               date.getFullYear() === today.getFullYear();
      
      case 'Minggu Ini':
        return date >= startOfWeek && date <= endOfWeek;
      
      case 'Bulan Ini':
        return date.getMonth() === now.getMonth() && 
               date.getFullYear() === now.getFullYear();
      
      default:
        return true;
    }
  });

  const badgeColor = (tingkat: string) => {
    switch (tingkat) {
      case "Tinggi": return "bg-red-100 text-red-800";
      case "Sedang": return "bg-yellow-100 text-yellow-800";
      case "Rendah": return "bg-orange-100 text-orange-800";
      case "Sangat Rendah": return "bg-orange-50 text-orange-600";
      case "Sehat": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "Sehat": return "text-green-600";
      case "Terdeteksi": return "text-orange-600";
      default: return "text-gray-600";
    }
  };

  const handleExportClick = () => {
    setShowExportConfirm(true);
  };

  const handleConfirmExport = () => {
    setIsExporting(true);
    
    // Simulasi proses export
    setTimeout(() => {
      // Format data untuk export
      const exportData = detectionData.map(item => ({
        ID: item.id,
        Hasil: item.hasil,
        Akurasi: item.akurasi,
        Tingkat: item.tingkat,
        Tanggal: item.tanggal,
        Waktu: item.waktu,
        Status: item.status
      }));
      
      const csv = [
        Object.keys(exportData[0]).join(','),
        ...exportData.map(row => Object.values(row).join(','))
      ].join('\n');
      
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `riwayat-deteksi-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      setIsExporting(false);
      setShowExportConfirm(false);
      setShowExportSuccess(true);
      
      // Auto close success message after 3 seconds
      setTimeout(() => {
        setShowExportSuccess(false);
      }, 3000);
    }, 1000);
  };

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        if (showExportConfirm) setShowExportConfirm(false);
        if (showExportSuccess) setShowExportSuccess(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showExportConfirm, showExportSuccess]);

  // Modal Konfirmasi Export
  const ExportConfirmModal = () => (
    <div className="fixed inset-0 z-50">
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={() => setShowExportConfirm(false)}
      />
      
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-2 md:p-4">
          <div 
            ref={modalRef}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-200"
          >
            <div className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="p-1.5 md:p-2 bg-blue-100 rounded-lg">
                    <AlertCircle className="w-4 h-4 md:w-6 md:h-6 text-blue-600" />
                  </div>
                  <h3 className="text-base md:text-lg font-semibold text-gray-900">
                    Konfirmasi Export
                  </h3>
                </div>
                <button
                  onClick={() => setShowExportConfirm(false)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <X className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              </div>
              
              <p className="text-gray-600 text-sm md:text-base mb-4 md:mb-6">
                Anda akan mengekspor <span className="font-semibold">{detectionData.length} data riwayat</span> ke dalam format CSV. File akan diunduh secara otomatis.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
                <button
                  onClick={() => setShowExportConfirm(false)}
                  className="flex-1 px-3 py-2 md:px-4 md:py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm md:text-base order-2 sm:order-1"
                  disabled={isExporting}
                >
                  Batal
                </button>
                <button
                  onClick={handleConfirmExport}
                  className="flex-1 px-3 py-2 md:px-4 md:py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-1.5 md:gap-2 text-sm md:text-base order-1 sm:order-2"
                  disabled={isExporting}
                >
                  {isExporting ? (
                    <>
                      <Loader2 className="w-3 h-3 md:w-4 md:h-4 animate-spin" />
                      <span>Mengekspor...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3 h-3 md:w-4 md:h-4" />
                      <span>Export CSV</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Modal Success
  const ExportSuccessModal = () => (
    <div className="fixed inset-0 z-50">
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={() => setShowExportSuccess(false)}
      />
      
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-2 md:p-4">
          <div 
            ref={modalRef}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-200"
          >
            <div className="p-4 md:p-6">
              <div className="flex flex-col items-center text-center">
                <div className="p-2 md:p-3 bg-green-100 rounded-full mb-3 md:mb-4">
                  <CheckCircle className="w-8 h-8 md:w-12 md:h-12 text-green-600" />
                </div>
                
                <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-1 md:mb-2">
                  Export Berhasil!
                </h3>
                
                <p className="text-gray-600 text-sm md:text-base mb-4 md:mb-6">
                  File CSV berhasil diunduh. Data riwayat deteksi telah berhasil diekspor.
                </p>
                
                <div className="bg-gray-50 rounded-lg p-3 md:p-4 w-full mb-4 md:mb-6">
                  <div className="flex justify-between items-center">
                    <div className="text-left">
                      <p className="text-xs md:text-sm text-gray-600">Jumlah Data</p>
                      <p className="font-semibold text-gray-900 text-sm md:text-base">{detectionData.length} riwayat</p>
                    </div>
                    <div className="text-left">
                      <p className="text-xs md:text-sm text-gray-600">Format</p>
                      <p className="font-semibold text-gray-900 text-sm md:text-base">CSV</p>
                    </div>
                    <div className="text-left">
                      <p className="text-xs md:text-sm text-gray-600">Status</p>
                      <p className="font-semibold text-green-600 text-sm md:text-base">Berhasil</p>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => setShowExportSuccess(false)}
                  className="w-full px-3 py-2 md:px-4 md:py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors text-sm md:text-base"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
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
              <h1 className="text-lg font-bold text-gray-900">Riwayat Deteksi</h1>
              <div className="w-10"></div>
            </div>
          </div>

          {/* Desktop Navbar */}
          <div className="hidden md:block">
            <Navbar activeMenu={activeMenu} />
          </div>
          
          <main className="p-4 md:p-6 flex items-center justify-center h-[calc(100vh-80px)]">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-green-600 mx-auto mb-4" />
              <p className="text-gray-600 text-sm md:text-base">Memuat data riwayat...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error && detectionData.length === 0) {
    return (
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
              <h1 className="text-lg font-bold text-gray-900">Riwayat Deteksi</h1>
              <div className="w-10"></div>
            </div>
          </div>

          {/* Desktop Navbar */}
          <div className="hidden md:block">
            <Navbar activeMenu={activeMenu} />
          </div>
          
          <main className="p-4 md:p-6">
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 md:p-6 text-center">
              <h3 className="text-base md:text-lg font-semibold text-red-800 mb-1 md:mb-2">Gagal Memuat Data</h3>
              <p className="text-red-600 text-sm md:text-base mb-3 md:mb-4">{error}</p>
              <p className="text-gray-600 text-sm md:text-base">Menampilkan data contoh...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
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
            <h1 className="text-lg font-bold text-gray-900">Riwayat Deteksi</h1>
            <div className="w-10"></div>
          </div>
        </div>

        {/* Desktop Navbar */}
        <div className="hidden md:block">
          <Navbar activeMenu={activeMenu} />
        </div>
        
        <main className="p-4 md:p-6 space-y-4 md:space-y-6">
          {/* Header Card */}
          <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-3 md:gap-0 mb-4 md:mb-6">
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-900">Riwayat Deteksi</h1>
                <p className="text-gray-600 mt-1 text-sm md:text-base">
                  Lihat semua hasil deteksi penyakit yang telah dilakukan
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded-md text-xs md:text-sm font-medium">
                    {filteredData.length} Riwayat
                  </span>
                  <span className="text-gray-400 text-xs md:text-sm">•</span>
                  <span className="text-gray-500 text-xs md:text-sm">Filter: {selectedFilter}</span>
                </div>
              </div>
              <button
                onClick={handleExportClick}
                className="px-3 py-2 md:px-4 md:py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-1.5 md:gap-2 w-full sm:w-auto justify-center text-sm md:text-base shadow-sm hover:shadow-md mt-3 sm:mt-0"
              >
                <Download className="w-3 h-3 md:w-4 md:h-4" />
                Export CSV
              </button>
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap items-center gap-2 mb-4 md:mb-6">
              <div className="flex items-center gap-2 text-gray-700 font-medium text-sm">
                <Filter className="w-3 h-3 md:w-4 md:h-4" />
                <span>Filter:</span>
              </div>
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setSelectedFilter(filter)}
                  className={`px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-medium border transition-colors ${
                    selectedFilter === filter
                      ? 'bg-green-100 text-green-700 border-green-300'
                      : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {filter} {selectedFilter === filter && `(${filteredData.length})`}
                </button>
              ))}
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 mb-4 md:mb-6"></div>
          </div>

          {/* Table Card */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-700 uppercase">
                  <tr>
                    <th className="p-3 md:p-4 font-medium text-xs md:text-sm">ID Deteksi</th>
                    <th className="p-3 md:p-4 font-medium text-xs md:text-sm">Hasil</th>
                    <th className="p-3 md:p-4 font-medium text-xs md:text-sm">Akurasi</th>
                    <th className="p-3 md:p-4 font-medium text-xs md:text-sm">Tingkat</th>
                    <th className="p-3 md:p-4 font-medium text-xs md:text-sm">Tanggal & Waktu</th>
                    <th className="p-3 md:p-4 font-medium text-xs md:text-sm">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-6 md:p-8 text-center text-gray-500 text-sm md:text-base">
                        Tidak ada data riwayat untuk filter `{selectedFilter}`
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((item) => (
                      <tr key={item.id} className="border-t border-gray-200 hover:bg-gray-50">
                        <td className="p-3 md:p-4 font-medium text-gray-900 text-xs md:text-sm">
                          <span className="block truncate max-w-[80px] md:max-w-none">{item.id}</span>
                        </td>
                        <td className="p-3 md:p-4 font-medium text-gray-900 text-xs md:text-sm">
                          <span className="block truncate max-w-[80px] md:max-w-none">{item.hasil}</span>
                        </td>
                        <td className="p-3 md:p-4 font-medium text-gray-900 text-xs md:text-sm">
                          {item.akurasi}
                        </td>
                        <td className="p-3 md:p-4">
                          <span className={`px-2 py-1 md:px-3 md:py-1 rounded-full text-xs font-medium ${badgeColor(item.tingkat)}`}>
                            {item.tingkat}
                          </span>
                        </td>
                        <td className="p-3 md:p-4">
                          <div className="flex items-center gap-1.5 md:gap-2 text-gray-700 text-xs md:text-sm">
                            <Calendar className="w-3 h-3 md:w-4 md:h-4 text-gray-400 flex-shrink-0" />
                            <div>
                              <span className="block md:inline">{item.tanggal}</span>
                              <span className="text-gray-500 text-xs md:text-sm md:ml-1.5">• {item.waktu}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 md:p-4">
                          <span className={`font-medium text-xs md:text-sm ${statusColor(item.status)}`}>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="p-3 md:p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 md:gap-0">
                <p className="text-xs md:text-sm text-gray-600">
                  Menampilkan {filteredData.length} dari {detectionData.length} hasil
                </p>
                {filteredData.length > 0 && (
                  <div className="flex items-center gap-1.5 md:gap-2">
                    <button className="px-2 py-1 md:px-3 md:py-1 border border-gray-300 rounded text-xs md:text-sm text-gray-600 hover:bg-gray-50">
                      Sebelumnya
                    </button>
                    <button className="px-2 py-1 md:px-3 md:py-1 bg-green-100 text-green-700 border border-green-300 rounded text-xs md:text-sm font-medium">
                      1
                    </button>
                    <button className="px-2 py-1 md:px-3 md:py-1 border border-gray-300 rounded text-xs md:text-sm text-gray-600 hover:bg-gray-50">
                      Selanjutnya
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Info Card */}
          <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
            <h3 className="font-semibold text-gray-900 mb-3 text-base md:text-lg">Keterangan Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 md:w-3 md:h-3 bg-green-100 rounded-full border border-green-300 flex-shrink-0"></div>
                  <span className="text-xs md:text-sm text-gray-700">Sehat: Tanaman tidak terdeteksi penyakit</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 md:w-3 md:h-3 bg-orange-100 rounded-full border border-orange-300 flex-shrink-0"></div>
                  <span className="text-xs md:text-sm text-gray-700">Terdeteksi: Tanaman teridentifikasi penyakit</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 md:w-3 md:h-3 bg-red-100 rounded-full border border-red-300 flex-shrink-0"></div>
                  <span className="text-xs md:text-sm text-gray-700">Tinggi: Akurasi ≥ 90%</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 md:w-3 md:h-3 bg-yellow-100 rounded-full border border-yellow-300 flex-shrink-0"></div>
                  <span className="text-xs md:text-sm text-gray-700">Sedang: Akurasi 80-90%</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 md:w-3 md:h-3 bg-orange-100 rounded-full border border-orange-300 flex-shrink-0"></div>
                  <span className="text-xs md:text-sm text-gray-700">Rendah: Akurasi 70-80%</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Modal Konfirmasi Export */}
      {showExportConfirm && <ExportConfirmModal />}

      {/* Modal Success */}
      {showExportSuccess && <ExportSuccessModal />}
    </div>
  );
}