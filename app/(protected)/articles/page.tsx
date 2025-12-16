/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
// articles/page.tsx (updated - tanpa modal)
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { getArticles, deleteArticle } from '../../../store/articles/articlesThunk';
import { clearError } from '../../../store/articles/articlesSlice';
import Sidebar from '../../../components/dashboard/Sidebar';
import { Header } from '../../../components/dashboard/Header';
import {
  Plus,
  Eye,
  Edit,
  Trash2,
  Search,
  Loader2,
  X,
  CheckCircle,
  FileText,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  AlertTriangle,
  AlertCircle
} from 'lucide-react';

// Simple inline loading skeleton
const ArticlesCardSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
        <div className="h-48 bg-gray-200"></div>
        <div className="p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-5 bg-gray-200 rounded w-16"></div>
            <div className="h-4 bg-gray-200 rounded w-20"></div>
          </div>
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="space-y-2 mb-4">
            <div className="h-3 bg-gray-200 rounded w-full"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
            <div className="h-3 bg-gray-200 rounded w-4/6"></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-8 flex-1 bg-gray-200 rounded-lg"></div>
            <div className="h-8 flex-1 bg-gray-200 rounded-lg"></div>
            <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

// Komponen Articles Content
const ArticlesContent = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { articles, loading, error, pagination } = useAppSelector((state: any) => state.articles);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [sortBy, setSortBy] = useState('Newest First');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  
  // Delete confirmation state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);

  useEffect(() => {
    dispatch(getArticles(currentPage));
  }, [dispatch, currentPage]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  const handleDeleteClick = (documentId: string, articleTitle: string) => {
    setArticleToDelete({
      id: documentId,
      title: articleTitle
    });
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!articleToDelete) return;
    
    setIsDeleting(articleToDelete.id);
    try {
      await dispatch(deleteArticle(articleToDelete.id)).unwrap();
      dispatch(getArticles(currentPage));
      setShowDeleteConfirm(false);
      setArticleToDelete(null);
    } catch (error) {
      console.error('Delete failed:', error);
    } finally {
      setIsDeleting(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setArticleToDelete(null);
  };

  const handleCreate = () => {
    router.push('/articles/add');
  };

  const handleEdit = (article: any) => {
    router.push(`/articles/edit/${article.documentId}`);
  };

  const handleView = (article: any) => {
    window.open(`/articles/${article.documentId}`, '_blank');
  };

  // Get unique categories from articles
  const categories = useMemo(() => {
    const categorySet = new Set<string>(['All Categories']);
    articles.forEach((article: any) => {
      if (article.category?.name) {
        categorySet.add(article.category.name);
      }
    });
    return Array.from(categorySet);
  }, [articles]);

  const filteredArticles = useMemo(() => {
    let filtered = [...articles];
    
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((article: any) => {
        return (
          article.title?.toLowerCase().includes(searchLower) ||
          article.description?.toLowerCase().includes(searchLower) ||
          article.user?.username?.toLowerCase().includes(searchLower) ||
          article.category?.name?.toLowerCase().includes(searchLower)
        );
      });
    }
    
    if (selectedCategory !== 'All Categories') {
      filtered = filtered.filter((article: any) => 
        article.category?.name === selectedCategory
      );
    }
    
    if (sortBy === 'Newest First') {
      filtered.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === 'Oldest First') {
      filtered.sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }
    
    return filtered;
  }, [articles, searchTerm, selectedCategory, sortBy]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCategoryColor = (categoryName: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      'Asia': { bg: 'bg-blue-100', text: 'text-blue-600' },
      'Europe': { bg: 'bg-purple-100', text: 'text-purple-600' },
      'Africa': { bg: 'bg-amber-100', text: 'text-amber-600' },
      'Oceania': { bg: 'bg-violet-100', text: 'text-violet-600' },
      'Americas': { bg: 'bg-emerald-100', text: 'text-emerald-600' },
    };
    
    return colors[categoryName] || { bg: 'bg-gray-100', text: 'text-gray-600' };
  };

  return (
    <div className="min-h-screen bg-white px-4 md:px-6">
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-full">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Delete Article</h3>
                  <p className="text-sm text-gray-500">Confirm your action</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-5">
              <div className="mb-6">
                <p className="text-gray-700 mb-2">
                  Are you sure you want to delete this article?
                </p>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {articleToDelete?.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    This action cannot be undone.
                  </p>
                </div>
              </div>

              {/* Warning */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700">
                    All data associated with this article will be permanently removed.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-200">
              <button
                type="button"
                onClick={handleDeleteCancel}
                disabled={isDeleting === articleToDelete?.id}
                className="px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors bg-white border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isDeleting === articleToDelete?.id}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white transition-colors bg-red-600 rounded-xl hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting === articleToDelete?.id ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete Article
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Articles</h1>
          <p className="text-gray-500">Manage your travel articles</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 bg-[#1f3a5f] text-white px-5 py-2.5 rounded-xl shadow hover:bg-[#162b47] transition-all cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          New Article
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search articles..."
            className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1f3a5f] focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <select 
          className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 focus:ring-2 focus:ring-[#1f3a5f] focus:border-transparent"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          {categories.map((category) => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
        <select 
          className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 focus:ring-2 focus:ring-[#1f3a5f] focus:border-transparent"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option>Newest First</option>
          <option>Oldest First</option>
        </select>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center justify-between">
          <span className="text-sm">{error}</span>
          <button 
            onClick={() => dispatch(clearError())}
            className="text-red-500 hover:text-red-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Results Info */}
      {(searchTerm || selectedCategory !== 'All Categories') && (
        <div className="mb-4">
          <p className="text-sm text-gray-600 flex items-center">
            <CheckCircle className="w-3.5 h-3.5 text-green-500 mr-1.5" />
            {filteredArticles.length} articles found
            {searchTerm && (
              <span className="ml-1">
                for {searchTerm}
              </span>
            )}
            {selectedCategory !== 'All Categories' && (
              <span className="ml-1">
                in {selectedCategory}
              </span>
            )}
          </p>
        </div>
      )}

      {/* Articles Grid */}
      {loading && articles.length === 0 ? (
        <ArticlesCardSkeleton />
      ) : filteredArticles.length === 0 ? (
        <div className="bg-white border-dashed border-2 border-gray-200 rounded-2xl">
          <div className="py-12 text-center">
            <div className="w-20 h-20 mx-auto rounded-full bg-gray-50 flex items-center justify-center mb-4">
              <FileText className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm || selectedCategory !== 'All Categories' ? 'No articles found' : 'No articles yet'}
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {searchTerm || selectedCategory !== 'All Categories'
                ? 'Try using different keywords or filters'
                : 'Start by creating your first article'}
            </p>
            {!searchTerm && selectedCategory === 'All Categories' ? (
              <button
                onClick={handleCreate}
                className="flex items-center gap-2 bg-[#1f3a5f] text-white px-5 py-2.5 rounded-xl shadow hover:bg-[#162b47] transition-all"
              >
                <Plus className="w-5 h-5" />
                Create First Article
              </button>
            ) : (
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('All Categories');
                }}
                className="px-4 py-2.5 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all"
              >
                Show All Articles
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((article: any) => {
              const categoryColors = getCategoryColor(article.category?.name || '');
              
              return (
                <div
                  key={article.documentId}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all group"
                >
                  {/* Article Image */}
                  <div className="h-48 w-full overflow-hidden bg-gray-100 relative">
                    <img
                      src={article.cover_image_url || 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400&h=300&fit=crop'}
                      alt={article.title}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400&h=300&fit=crop';
                      }}
                    />
                  </div>

                  <div className="p-5">
                    {/* Category and Date */}
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                      <div className="flex items-center gap-2">
                        {article.category ? (
                          <span className={`px-2 py-0.5 rounded-full font-medium ${categoryColors.bg} ${categoryColors.text}`}>
                            {article.category.name}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">
                            No Category
                          </span>
                        )}
                        <span>{formatDate(article.createdAt)}</span>
                      </div>
                      <button
                        className="p-1 text-gray-400 hover:text-gray-600"
                        onClick={() => handleEdit(article)}
                        title="Edit article"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 leading-tight">
                      {article.title}
                    </h3>
                    
                    {/* Description */}
                    <p className="text-sm text-gray-600 line-clamp-3 mb-4 leading-relaxed">
                      {article.description || 'No description available'}
                    </p>

                    {/* Author */}
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                      <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-xs font-medium">
                          {article.user?.username?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      </div>
                      <span>by {article.user?.username || 'Unknown'}</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 justify-center">
                      <button
                        onClick={() => handleView(article)}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all"
                      >
                        <Eye className="w-3 h-3" />
                        View
                      </button>
                      <button
                        onClick={() => handleEdit(article)}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg bg-[#4f7ea1] text-white hover:bg-[#3f6785] transition-all"
                      >
                        <Edit className="w-3 h-3" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClick(article.documentId, article.title)}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-all disabled:opacity-50"
                        disabled={isDeleting === article.documentId}
                      >
                        {isDeleting === article.documentId ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Trash2 className="w-3 h-3" />
                        )}
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {pagination && pagination.pageCount > 1 && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-8 pt-6 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                Showing {filteredArticles.length} of {pagination.total || filteredArticles.length} articles
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1 || loading}
                  className="flex items-center gap-1 px-4 py-2 text-sm text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, pagination.pageCount) }, (_, i) => {
                    let pageNum;
                    if (pagination.pageCount <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= pagination.pageCount - 2) {
                      pageNum = pagination.pageCount - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        disabled={loading}
                        className={`w-9 h-9 text-sm rounded-xl transition-all ${
                          currentPage === pageNum
                            ? 'bg-[#1f3a5f] text-white shadow-sm'
                            : 'text-gray-700 bg-white border border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.pageCount))}
                  disabled={currentPage === pagination.pageCount || loading}
                  className="flex items-center gap-1 px-4 py-2 text-sm text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default function ArticlesPage() {
  const { user, isAuthenticated } = useAppSelector((state: any) => state.auth);
  const [activeMenu, setActiveMenu] = useState('articles');

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen bg-white">
        <Sidebar 
          activeMenu={activeMenu} 
          setActiveMenu={setActiveMenu}
        />
        <Header 
          activeMenu={activeMenu}
          userName="Guest"
          userEmail="Silakan login"
          onSidebarToggle={() => {}}
          isSidebarOpen={false}
        />
        <main className="flex-1 md:ml-64 pt-16 p-8">
          <div className="max-w-md mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-red-50 flex items-center justify-center mb-4">
                <div className="h-8 w-8 text-red-500">👤</div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Authentication Required</h3>
              <p className="text-gray-600 mb-6">Please login to access articles page</p>
              <button 
                onClick={() => window.location.href = '/auth'}
                className="flex items-center gap-2 bg-[#1f3a5f] text-white px-5 py-2.5 rounded-xl shadow hover:bg-[#162b47] transition-all mx-auto"
              >
                Login to Dashboard
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Sidebar 
        activeMenu={activeMenu} 
        setActiveMenu={setActiveMenu}
      />
      <Header 
        activeMenu={activeMenu}
        userName={user?.name || 'User'}
        userEmail={user?.email || 'user@example.com'}
        onSidebarToggle={() => {}}
        isSidebarOpen={false}
      />
      <main className="md:ml-64 pt-16">
        <div className="p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            <ArticlesContent />
          </div>
        </div>
      </main>
    </div>
  );
}