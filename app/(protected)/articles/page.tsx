'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { getArticles, deleteArticle } from '../../../store/articles/articlesThunk';
import { clearError } from '../../../store/articles/articlesSlice';
import Sidebar from '../../../components/dashboard/Sidebar';
import { Header } from '../../../components/dashboard/Header';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
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
  ChevronRight
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
  const { articles, loading, error, pagination } = useAppSelector((state) => state.articles);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [sortBy, setSortBy] = useState('Newest First');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

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

  const handleDelete = async (documentId: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus artikel ini?')) {
      setIsDeleting(documentId);
      try {
        await dispatch(deleteArticle(documentId)).unwrap();
        dispatch(getArticles(currentPage));
      } catch (error) {
        console.error('Delete failed:', error);
      } finally {
        setIsDeleting(null);
      }
    }
  };

  // Get unique categories from articles
  const categories = useMemo(() => {
    const categorySet = new Set<string>(['All Categories']);
    articles.forEach(article => {
      if (article.category?.name) {
        categorySet.add(article.category.name);
      }
    });
    return Array.from(categorySet);
  }, [articles]);

  const filteredArticles = useMemo(() => {
    let filtered = articles;
    
    // Filter by search term
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(article => {
        return (
          article.title?.toLowerCase().includes(searchLower) ||
          article.description?.toLowerCase().includes(searchLower) ||
          article.user?.username?.toLowerCase().includes(searchLower) ||
          article.category?.name?.toLowerCase().includes(searchLower)
        );
      });
    }
    
    // Filter by category
    if (selectedCategory !== 'All Categories') {
      filtered = filtered.filter(article => 
        article.category?.name === selectedCategory
      );
    }
    
    // Sort articles
    if (sortBy === 'Newest First') {
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === 'Oldest First') {
      filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
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
    <div className="min-h-screen bg-white px-4 py-6 md:px-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Articles</h1>
          <p className="text-gray-500">Manage your travel articles</p>
        </div>
        <Link href="/dashboard/articles/add">
          <button className="flex items-center gap-2 bg-[#1f3a5f] text-white px-5 py-2.5 rounded-xl shadow hover:bg-[#162b47] transition-all">
            <Plus className="w-5 h-5" />
            New Article
          </button>
        </Link>
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
                for "{searchTerm}"
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
        <Card className="border-dashed border-2 border-gray-200">
          <CardContent className="py-12 text-center">
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
              <Link href="/dashboard/articles/add">
                <button className="flex items-center gap-2 bg-[#1f3a5f] text-white px-5 py-2.5 rounded-xl shadow hover:bg-[#162b47] transition-all">
                  <Plus className="w-5 h-5" />
                  Create First Article
                </button>
              </Link>
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
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((article) => {
              const categoryColors = getCategoryColor(article.category?.name || '');
              
              return (
                <div
                  key={article.documentId}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all"
                >
                  {/* Article Image */}
                  <div className="h-48 w-full overflow-hidden bg-gray-100">
                    <img
                      src={article.cover_image_url || 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400&h=300&fit=crop'}
                      alt={article.title}
                      className="h-full w-full object-cover hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400&h=300&fit=crop';
                      }}
                    />
                  </div>

                  <div className="p-5">
                    {/* Category and Date */}
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
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

                    {/* Title */}
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 leading-tight">
                      {article.title}
                    </h3>
                    
                    {/* Description */}
                    <p className="text-sm text-gray-600 line-clamp-3 mb-4 leading-relaxed">
                      {article.description || 'No description available'}
                    </p>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/dashboard/articles/${article.documentId}`}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all"
                      >
                        <Eye className="w-3 h-3" />
                        View
                      </Link>
                      <Link
                        href={`/dashboard/articles/edit/${article.documentId}`}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg bg-[#4f7ea1] text-white hover:bg-[#3f6785] transition-all"
                      >
                        <Edit className="w-3 h-3" />
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(article.documentId)}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg bg-red-500 text-white hover:bg-red-600 transition-all disabled:opacity-50"
                        disabled={isDeleting === article.documentId}
                      >
                        {isDeleting === article.documentId ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Trash2 className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {pagination.pageCount > 1 && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-8 pt-6 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                Showing {filteredArticles.length} of {pagination.totalItems} articles
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
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const [activeMenu, setActiveMenu] = useState('articles');
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