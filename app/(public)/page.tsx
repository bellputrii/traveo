import Link from 'next/link';
import { Button } from '../../components/ui/button';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Selamat Datang di Aplikasi Kami
          </h1>
          <p className="text-xl text-gray-600 mb-10">
            Platform lengkap untuk mengelola konten dengan mudah dan efisien.
            Daftar sekarang untuk mulai menggunakan semua fitur yang tersedia.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button size="lg" asChild>
              <Link href="/login">Masuk</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/register">Daftar</Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="text-2xl font-bold text-blue-600 mb-2">✓</div>
              <h3 className="font-semibold text-lg mb-2">Manajemen Konten</h3>
              <p className="text-gray-600">
                Kelola artikel, kategori, dan komentar dengan antarmuka yang intuitif.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="text-2xl font-bold text-blue-600 mb-2">✓</div>
              <h3 className="font-semibold text-lg mb-2">Keamanan Terjamin</h3>
              <p className="text-gray-600">
                Sistem autentikasi yang aman dengan token JWT untuk perlindungan data.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="text-2xl font-bold text-blue-600 mb-2">✓</div>
              <h3 className="font-semibold text-lg mb-2">Responsif</h3>
              <p className="text-gray-600">
                Akses aplikasi dari perangkat apapun dengan desain yang responsif.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}