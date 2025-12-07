// app/(public)/riwayat/page.tsx
'use client';

import { useState } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import { Navbar } from '@/components/public/Navbar';
import { Calendar, Eye, Download } from 'lucide-react';

interface DetectionHistory {
  id: string;
  hasil: string;
  akurasi: string;
  tingkat: string;
  tanggal: string;
  waktu: string;
  status: string;
}

export default function RiwayatDeteksiPage() {
  const [activeMenu, setActiveMenu] = useState('riwayat');
  const [selectedFilter, setSelectedFilter] = useState('Semua');

  const detectionData: DetectionHistory[] = [
    { 
      id: "DET-2024-001", 
      hasil: "Tungro", 
      akurasi: "96.5%", 
      tingkat: "Tinggi", 
      tanggal: "2024-11-26", 
      waktu: "14:30", 
      status: "Terdeteksi"
    },
    { 
      id: "DET-2024-002", 
      hasil: "Blast", 
      akurasi: "94.2%", 
      tingkat: "Sedang", 
      tanggal: "2024-11-26", 
      waktu: "12:15", 
      status: "Terdeteksi"
    },
    { 
      id: "DET-2024-003", 
      hasil: "Healthy", 
      akurasi: "99.1%", 
      tingkat: "Sehat", 
      tanggal: "2024-11-25", 
      waktu: "16:45", 
      status: "Sehat"
    },
    { 
      id: "DET-2024-004", 
      hasil: "Bacterial Blight", 
      akurasi: "91.8%", 
      tingkat: "Tinggi", 
      tanggal: "2024-11-25", 
      waktu: "10:20", 
      status: "Terdeteksi"
    },
    { 
      id: "DET-2024-005", 
      hasil: "Brown Spot", 
      akurasi: "88.7%", 
      tingkat: "Rendah", 
      tanggal: "2024-11-24", 
      waktu: "15:30", 
      status: "Terdeteksi"
    },
    { 
      id: "DET-2024-006", 
      hasil: "Healthy", 
      akurasi: "97.3%", 
      tingkat: "Sehat", 
      tanggal: "2024-11-24", 
      waktu: "09:10", 
      status: "Sehat"
    },
  ];

  const filters = ['Semua', 'Hari Ini', 'Minggu Ini', 'Bulan Ini'];

  const badgeColor = (tingkat: string) => {
    switch (tingkat) {
      case "Tinggi": return "bg-red-100 text-red-800";
      case "Sedang": return "bg-yellow-100 text-yellow-800";
      case "Rendah": return "bg-orange-100 text-orange-800";
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

  const handleExport = () => {
    alert('Data riwayat deteksi berhasil di-export!');
  };

  const handleViewDetail = (id: string) => {
    alert(`Melihat detail untuk ID: ${id}`);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
      
      <div className="ml-64 flex-1">
        <Navbar activeMenu={activeMenu} />
        
        <main className="p-6 space-y-6">
          {/* Header Card */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Riwayat Deteksi</h1>
                <p className="text-gray-600 mt-1">
                  Lihat semua hasil deteksi penyakit yang telah dilakukan
                </p>
              </div>
              <button
                onClick={handleExport}
                className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center gap-3 mb-6">
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setSelectedFilter(filter)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    selectedFilter === filter
                      ? 'bg-green-100 text-green-700 border-green-300'
                      : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 mb-6"></div>
          </div>

          {/* Table Card */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-700 uppercase">
                  <tr>
                    <th className="p-4 font-medium">ID Deteksi</th>
                    <th className="p-4 font-medium">Hasil</th>
                    <th className="p-4 font-medium">Akurasi</th>
                    <th className="p-4 font-medium">Tingkat</th>
                    <th className="p-4 font-medium">Tanggal & Waktu</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {detectionData.map((item) => (
                    <tr key={item.id} className="border-t border-gray-200 hover:bg-gray-50">
                      <td className="p-4 font-medium text-gray-900">{item.id}</td>
                      <td className="p-4 font-medium text-gray-900">{item.hasil}</td>
                      <td className="p-4 font-medium text-gray-900">{item.akurasi}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${badgeColor(item.tingkat)}`}>
                          {item.tingkat}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-gray-700">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>{item.tanggal} • {item.waktu}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`font-medium ${statusColor(item.status)}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => handleViewDetail(item.id)}
                          className="text-green-600 hover:text-green-700 font-medium flex items-center gap-1"
                        >
                          <Eye className="w-4 h-4" />
                          Detail
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Menampilkan {detectionData.length} dari {detectionData.length} hasil
                </p>
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-50">
                    Sebelumnya
                  </button>
                  <button className="px-3 py-1 bg-green-100 text-green-700 border border-green-300 rounded text-sm font-medium">
                    1
                  </button>
                  <button className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-50">
                    Selanjutnya
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Info Card */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Keterangan Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-100 rounded-full border border-green-300"></div>
                  <span className="text-sm text-gray-700">Sehat: Tanaman tidak terdeteksi penyakit</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-100 rounded-full border border-red-300"></div>
                  <span className="text-sm text-gray-700">Terdeteksi: Tanaman teridentifikasi penyakit</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-100 rounded-full border border-red-300"></div>
                  <span className="text-sm text-gray-700">Tinggi: Tingkat keparahan tinggi</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-100 rounded-full border border-yellow-300"></div>
                  <span className="text-sm text-gray-700">Sedang: Tingkat keparahan sedang</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-100 rounded-full border border-orange-300"></div>
                  <span className="text-sm text-gray-700">Rendah: Tingkat keparahan rendah</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}