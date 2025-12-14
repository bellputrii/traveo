'use client';

import { useEffect, useState, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { 
  getCategories, 
  getCategory,
  createCategory, 
  updateCategory, 
  deleteCategory 
} from '../../../store/categories/categoriesThunk';
import { 
  clearError,
  openModal,
  closeModal 
} from '../../../store/categories/categoriesSlice';
import NotificationContainer from '../../../components/dashboard/NotificationContainer';
import Sidebar from '../../../components/dashboard/Sidebar';
import { Header } from '../../../components/dashboard/Header';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import {
  Folder,
  Search,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  AlertCircle,
  ChevronDown,
  X,
  CheckCircle,
  FileText
} from 'lucide-react';

// Komponen Modal untuk Add/Edit
function CategoryModal({ mode = 'add' }: { mode: 'add' | 'edit' }) {
  const dispatch = useAppDispatch();
  const { currentCategory, loading, error, modals } = useAppSelector((state) => state.categories);
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (mode === 'edit' && currentCategory) {
      setName(currentCategory.name);
      setDescription(currentCategory.description || '');
    } else {
      setName('');
      setDescription('');
    }
    setFormError(null);
  }, [mode, currentCategory, modals[mode]]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      setFormError('Nama kategori wajib diisi');
      return;
    }

    const categoryData = { name, description };

    try {
      if (mode === 'add') {
        await dispatch(createCategory(categoryData)).unwrap();
      } else if (mode === 'edit' && currentCategory?.documentId) {
        await dispatch(updateCategory({ 
          documentId: currentCategory.documentId, 
          data: categoryData 
        })).unwrap();
      }
    } catch (err: any) {
      setFormError(err || `Gagal ${mode === 'add' ? 'membuat' : 'memperbarui'} kategori`);
    }
  };

  const modalTitle = mode === 'add' ? 'Tambah Kategori Baru' : 'Edit Kategori';
  const modalId = mode === 'add' ? 'add' : 'edit';

  if (!modals[modalId]) return null;

  return (
    <div className="fixed inset-0 bg-black/50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">{modalTitle}</h3>
          <button
            onClick={() => dispatch(closeModal(modalId))}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            disabled={loading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {(error || formError) && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{error || formError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Kategori *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1f3a5f] focus:border-transparent transition-all"
                  required
                  disabled={loading}
                  placeholder="Masukkan nama kategori"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deskripsi (Opsional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1f3a5f] focus:border-transparent transition-all"
                  rows={3}
                  disabled={loading}
                  placeholder="Masukkan deskripsi kategori"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-100 mt-6">
              <button
                type="button"
                onClick={() => dispatch(closeModal(modalId))}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all disabled:opacity-50"
                disabled={loading}
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2.5 text-sm font-medium text-white bg-[#1f3a5f] hover:bg-[#162b47] rounded-xl transition-all shadow-sm hover:shadow disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center">
                    <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />
                    {mode === 'add' ? 'Membuat...' : 'Memperbarui...'}
                  </span>
                ) : (
                  mode === 'add' ? 'Buat Kategori' : 'Perbarui Kategori'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Komponen Modal untuk Delete Confirmation
function DeleteModal() {
  const dispatch = useAppDispatch();
  const { currentCategory, loading, modals } = useAppSelector((state) => state.categories);

  if (!modals.delete || !currentCategory) return null;

  const handleDelete = async () => {
    try {
      await dispatch(deleteCategory(currentCategory.documentId)).unwrap();
    } catch (error) {
      // Error sudah ditangani di thunk
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Hapus Kategori</h3>
              <p className="text-gray-600">
                Apakah Anda yakin ingin menghapus <span className="font-semibold text-gray-900">"{currentCategory.name}"</span>?
              </p>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-red-700">
              ⚠️ Tindakan ini tidak dapat dibatalkan. Semua artikel dalam kategori ini akan kehilangan kategorinya.
            </p>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={() => dispatch(closeModal('delete'))}
              className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all disabled:opacity-50"
              disabled={loading}
            >
              Batal
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="px-4 py-2.5 text-sm font-medium text-white bg-[#ef4444] hover:bg-[#dc2626] rounded-xl transition-all shadow-sm hover:shadow disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center">
                  <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />
                  Menghapus...
                </span>
              ) : (
                'Hapus Kategori'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Komponen Categories Content
const CategoriesContent = () => {
  const dispatch = useAppDispatch();
  const { categories, loading, error, pagination } = useAppSelector((state) => state.categories);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(getCategories(1));
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) return categories;
    
    const searchLower = searchTerm.toLowerCase();
    return categories.filter(category =>
      category.name.toLowerCase().includes(searchLower) ||
      (category.description && category.description.toLowerCase().includes(searchLower))
    );
  }, [categories, searchTerm]);

  const handleEdit = (category: any) => {
    dispatch(getCategory(category.documentId));
    dispatch(openModal({ modal: 'edit', category }));
  };

  const handleDelete = (category: any) => {
    dispatch(openModal({ modal: 'delete', category }));
  };

  return (
    <div className="min-h-screen bg-white p-4 md:p-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Kategori</h1>
          <p className="text-gray-500">Organize your articles by category</p>
        </div>
        <button 
          onClick={() => dispatch(openModal({ modal: 'add' }))}
          className="flex items-center gap-2 bg-[#1f3a5f] text-white px-5 py-2.5 rounded-xl shadow hover:bg-[#162b47] transition-all"
        >
          <Plus className="w-5 h-5" />
          New Category
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search categories..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1f3a5f] focus:border-transparent transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
          <button 
            onClick={() => dispatch(clearError())}
            className="text-red-500 hover:text-red-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Results Info */}
      {searchTerm && (
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            <CheckCircle className="w-3.5 h-3.5 inline mr-1.5 text-green-500" />
            {filteredCategories.length} kategori ditemukan untuk pencarian "{searchTerm}"
          </p>
        </div>
      )}

      {/* Table Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading && categories.length === 0 ? (
          <div className="p-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Memuat kategori...</p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-20 h-20 mx-auto rounded-full bg-gray-50 flex items-center justify-center mb-4">
              <Folder className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm ? 'Kategori tidak ditemukan' : 'Belum ada kategori'}
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {searchTerm
                ? 'Coba gunakan kata kunci yang berbeda'
                : 'Mulai dengan membuat kategori pertama Anda'}
            </p>
            {!searchTerm ? (
              <button 
                onClick={() => dispatch(openModal({ modal: 'add' }))}
                className="flex items-center gap-2 bg-[#1f3a5f] text-white px-5 py-2.5 rounded-xl shadow hover:bg-[#162b47] transition-all mx-auto"
              >
                <Plus className="w-5 h-5" />
                Buat Kategori Pertama
              </button>
            ) : (
              <button 
                onClick={() => setSearchTerm('')}
                className="px-4 py-2.5 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all"
              >
                Tampilkan Semua Kategori
              </button>
            )}
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead className="bg-gray-50">
              <tr className="text-left text-sm text-gray-500">
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Articles</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.map((category, index) => (
                <tr
                  key={category.documentId}
                  className={`border-t border-gray-100 hover:bg-gray-50/50 transition-all ${
                    index === filteredCategories.length - 1 ? 'last:border-b' : ''
                  }`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        category.name === 'Asia' ? 'bg-blue-100' :
                        category.name === 'Europe' ? 'bg-purple-100' :
                        category.name === 'Africa' ? 'bg-amber-100' :
                        category.name === 'Oceania' ? 'bg-violet-100' :
                        category.name === 'Americas' ? 'bg-emerald-100' :
                        'bg-gray-100'
                      }`}>
                        <Folder className={`w-5 h-5 ${
                          category.name === 'Asia' ? 'text-blue-600' :
                          category.name === 'Europe' ? 'text-purple-600' :
                          category.name === 'Africa' ? 'text-amber-600' :
                          category.name === 'Oceania' ? 'text-violet-600' :
                          category.name === 'Americas' ? 'text-emerald-600' :
                          'text-gray-600'
                        }`} />
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">
                          {category.name}
                        </span>
                        {category.description && (
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                            {category.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="flex items-center gap-1 text-sm font-bold font-medium text-gray-600 pt-4">
                    <div className="flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5" />
                      {category.articles?.length || 0} articles
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-3">
                      <button 
                        onClick={() => handleEdit(category)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#4f7ea1] text-white hover:bg-[#3f6785] transition-all"
                      >
                        <Pencil className="w-4 h-4" />
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(category)}
                        className="p-2.5 rounded-xl bg-[#ef4444] text-white hover:bg-[#dc2626] transition-all"
                        disabled={loading}
                      >
                        {loading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination Info */}
      {!loading && pagination.pageCount > 0 && (
        <div className="flex items-center justify-between mt-6 text-sm text-gray-500">
          <div>
            Menampilkan {filteredCategories.length} dari {pagination.totalItems} kategori
          </div>
          <div>
            Halaman {pagination.currentPage} dari {pagination.pageCount}
          </div>
        </div>
      )}

      {/* Render Modals */}
      <CategoryModal mode="add" />
      <CategoryModal mode="edit" />
      <DeleteModal />
    </div>
  );
};

export default function CategoriesPage() {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const [activeMenu, setActiveMenu] = useState('categories');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen bg-white">
        <Sidebar 
          activeMenu={activeMenu} 
          setActiveMenu={setActiveMenu}
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
        />
        <Header 
          activeMenu={activeMenu}
          userName="Guest"
          userEmail="Silakan login"
          onSidebarToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
        />
        <main className="flex-1 md:ml-64 pt-16 flex items-center justify-center p-8">
          <Card className="max-w-md w-full border-0 shadow-lg">
            <CardContent className="pt-6 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-red-50 flex items-center justify-center mb-4 border border-red-100">
                <AlertCircle className="h-8 w-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Autentikasi Diperlukan</h3>
              <p className="text-gray-600 mb-6">Silakan login untuk mengakses halaman kategori</p>
              <button 
                onClick={() => window.location.href = '/auth'}
                className="flex items-center gap-2 bg-[#1f3a5f] text-white px-5 py-2.5 rounded-xl shadow hover:bg-[#162b47] transition-all mx-auto"
              >
                Login ke Dashboard
              </button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <NotificationContainer />
      <Sidebar 
        activeMenu={activeMenu} 
        setActiveMenu={setActiveMenu}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />
      <Header 
        activeMenu={activeMenu}
        userName={user?.name || 'User'}
        userEmail={user?.email || 'user@example.com'}
        onSidebarToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
      />
      <main className="md:ml-64 pt-6">
        <div className="p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            <CategoriesContent />
          </div>
        </div>
      </main>
    </div>
  );
}