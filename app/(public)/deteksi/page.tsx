// app/(public)/deteksi/page.tsx
'use client';

import { useState } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import { Navbar } from '@/components/public/Navbar';
import { Upload, Camera, Image, AlertCircle, Check, X } from 'lucide-react';

export default function DeteksiPage() {
  const [activeMenu, setActiveMenu] = useState('deteksi');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    success: boolean;
    message: string;
    disease?: string;
    confidence?: number;
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    
    if (selectedFile) {
      // Validasi ukuran file (max 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        alert('File terlalu besar. Maksimal ukuran file adalah 5MB.');
        return;
      }

      // Validasi tipe file
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!validTypes.includes(selectedFile.type)) {
        alert('Format file tidak didukung. Gunakan JPG, JPEG, atau PNG.');
        return;
      }

      setFile(selectedFile);
      setUploadResult(null);
      
      // Buat URL preview
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert('Silakan pilih file terlebih dahulu.');
      return;
    }

    setIsUploading(true);
    setUploadResult(null);

    try {
      // Simulasi upload dan deteksi
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulasi hasil deteksi acak
      const diseases = [
        { name: 'Blast Daun (Leaf Blast)', confidence: 85 },
        { name: 'Hawar Daun Bakteri (BLB/Kresek)', confidence: 92 },
        { name: 'Bercak Coklat (Brown Spot)', confidence: 78 },
        { name: 'Tungro', confidence: 95 },
        { name: 'Sehat', confidence: 98 },
      ];

      const randomResult = diseases[Math.floor(Math.random() * diseases.length)];
      
      setUploadResult({
        success: true,
        message: 'Deteksi berhasil!',
        disease: randomResult.name,
        confidence: randomResult.confidence,
      });
    } catch (error) {
      setUploadResult({
        success: false,
        message: 'Terjadi kesalahan saat memproses gambar. Silakan coba lagi.',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleClear = () => {
    setFile(null);
    setPreviewUrl(null);
    setUploadResult(null);
    
    // Clean up preview URL
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
      
      // Validasi ukuran file
      if (droppedFile.size > 5 * 1024 * 1024) {
        alert('File terlalu besar. Maksimal ukuran file adalah 5MB.');
        return;
      }

      // Validasi tipe file
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

  const openCamera = () => {
    alert('Fitur kamera akan segera tersedia! Untuk saat ini, silakan upload foto dari galeri.');
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
      
      <div className="ml-64 flex-1">
        <Navbar activeMenu={activeMenu} />
        
        <main className="p-6 space-y-6">
          {/* Header */}
          {/* <div>
            <h1 className="text-2xl font-bold text-gray-900">Deteksi Penyakit Daun Padi</h1>
            <p className="text-gray-600 mt-1">
              Upload foto daun padi untuk mendeteksi penyakit menggunakan AI
            </p>
          </div> */}

          {/* Upload Area */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Upload Foto Daun Padi</h2>
              <p className="text-sm text-gray-500">
                Upload foto daun padi untuk mendeteksi penyakit. Pastikan foto jelas dan fokus pada daun.
              </p>
            </div>

            {/* Upload Box */}
            <div className="border-2 border-dashed border-emerald-300 rounded-xl p-8 bg-emerald-50">
              <label
                htmlFor="fileInput"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="cursor-pointer flex flex-col items-center justify-center py-8"
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                    <Upload className="w-8 h-8 text-emerald-600" />
                  </div>
                  
                  <div className="text-center">
                    <p className="text-gray-700 font-medium">
                      {file ? 'File terpilih' : 'Seret & lepas file di sini'}
                    </p>
                    <p className="text-gray-500 text-sm mt-1">
                      {file ? file.name : 'atau klik untuk memilih file'}
                    </p>
                  </div>

                  {!file && (
                    <div className="mt-4">
                      <div className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors inline-block">
                        Pilih File
                      </div>
                    </div>
                  )}
                </div>

                <p className="mt-6 text-xs text-gray-400">
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
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium text-gray-700">Preview:</p>
                    <button
                      onClick={handleClear}
                      className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1"
                    >
                      <X className="w-4 h-4" />
                      Hapus
                    </button>
                  </div>
                  <div className="relative w-full max-w-md mx-auto">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-auto rounded-lg shadow-sm border border-gray-200"
                    />
                    <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                      {file && (file.size / 1024).toFixed(0)} KB
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <button
                onClick={handleUpload}
                disabled={!file || isUploading}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                  !file || isUploading
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                {isUploading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Memproses...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    Mulai Deteksi
                  </>
                )}
              </button>

              <button
                onClick={handleClear}
                disabled={!file}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                  !file
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200'
                }`}
              >
                <X className="w-5 h-5" />
                Hapus File
              </button>
            </div>

            {/* Result Display */}
            {uploadResult && (
              <div className={`mt-6 p-4 rounded-lg border ${
                uploadResult.success
                  ? 'bg-emerald-50 border-emerald-200'
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-start gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    uploadResult.success ? 'bg-emerald-500' : 'bg-red-500'
                  }`}>
                    {uploadResult.success ? (
                      <Check className="w-4 h-4 text-white" />
                    ) : (
                      <X className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium ${
                      uploadResult.success ? 'text-emerald-800' : 'text-red-800'
                    }`}>
                      {uploadResult.message}
                    </p>
                    
                    {uploadResult.success && uploadResult.disease && uploadResult.confidence && (
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Hasil Deteksi:</span>
                          <span className="font-semibold text-gray-900">{uploadResult.disease}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Tingkat Akurasi:</span>
                          <span className="font-semibold text-emerald-600">{uploadResult.confidence}%</span>
                        </div>
                        
                        <div className="mt-3 pt-3 border-t border-emerald-100">
                          <p className="text-sm text-gray-600 mb-2">Rekomendasi:</p>
                          {uploadResult.disease === 'Sehat' ? (
                            <p className="text-sm text-emerald-600">
                              ✅ Daun padi dalam kondisi sehat. Tetap jaga kebersihan dan pemupukan.
                            </p>
                          ) : (
                            <ul className="text-sm text-gray-700 space-y-1 list-disc ml-4">
                              <li>Segera isolasi tanaman yang terinfeksi</li>
                              <li>Gunakan fungisida/bakterisida yang sesuai</li>
                              <li>Optimalkan drainase dan sirkulasi udara</li>
                              <li>Kurangi kelembaban berlebih</li>
                            </ul>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              onClick={openCamera}
              className="bg-white rounded-xl p-5 border shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Camera className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Ambil Foto</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Gunakan kamera untuk mengambil foto langsung
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 border shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Image className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Contoh Foto</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Lihat contoh foto yang baik untuk deteksi
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tips Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <AlertCircle className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-blue-900">Tips untuk Hasil Terbaik</h3>
            </div>
            
            <ul className="text-sm text-blue-800 space-y-2 list-disc ml-5">
              <li>Pastikan foto diambil di tempat dengan pencahayaan yang cukup</li>
              <li>Fokuskan kamera pada daun yang menunjukkan gejala penyakit</li>
              <li>Ambil foto dari jarak dekat untuk detail yang lebih baik</li>
              <li>Hindari bayangan atau pantulan yang menghalangi daun</li>
              <li>Pastikan daun berada di posisi tengah dan jelas</li>
              <li>Gunakan latar belakang yang kontras dengan daun</li>
            </ul>
          </div>

          {/* Additional Info */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
            <h3 className="font-semibold text-gray-900 mb-2">Informasi Penting</h3>
            <p className="text-sm text-gray-600">
              Sistem deteksi menggunakan AI dengan akurasi hingga 95%. Hasil deteksi adalah perkiraan 
              berdasarkan data training. Untuk diagnosis yang akurat, disarankan untuk berkonsultasi 
              dengan ahli pertanian atau petugas penyuluh lapangan.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}