// app/dashboard/articles/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { getArticle, deleteArticle } from '../../../../store/articles/articlesThunk';
import { clearError, clearCurrentArticle } from '../../../../store/articles/articlesSlice';
import Sidebar from '../../../../components/dashboard/Sidebar';
import { Header } from '../../../../components/dashboard/Header';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Eye,
  Calendar,
  User,
  Tag,
  MessageSquare,
  Globe,
  Copy,
  Share2,
  Bookmark,
  Heart,
  MoreVertical,
  Loader2,
  AlertCircle
} from 'lucide-react';
import Image from 'next/image';

export default function ArticleDetailPage() {
  const router = useRouter();
  const params = useParams();
  const documentId = params.id as string;
  
  const dispatch = useAppDispatch();
  const { currentArticle, loading, error } = useAppSelector((state) => state.articles);
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  
  const [activeMenu, setActiveMenu] = useState('articles');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth');
      return;
    }
    
    dispatch(getArticle(documentId));
    
    return () => {
      dispatch(clearCurrentArticle());
    };
  }, [dispatch, documentId, isAuthenticated, router]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleEdit = () => {
    if (currentArticle) {
      router.push(`/articles/edit/${currentArticle.documentId}`);
    }
  };

  const handleDelete = async () => {
    if (!currentArticle) return;
    
    setIsDeleting(true);
    try {
      await dispatch(deleteArticle(currentArticle.documentId)).unwrap();
      router.push('/articles');
    } catch (error) {
      console.error('Delete error:', error);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleCopyLink = () => {
    if (currentArticle) {
      const link = `${window.location.origin}/articles/${currentArticle.documentId}`;
      navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = () => {
    if (currentArticle) {
      const shareData = {
        title: currentArticle.title,
        text: currentArticle.description,
        url: `${window.location.origin}/articles/${currentArticle.documentId}`,
      };
      
      if (navigator.share) {
        navigator.share(shareData);
      } else {
        handleCopyLink();
      }
    }
  };

  const handleBack = () => {
    router.push('/articles');
  };

  const isOwner = () => {
    if (!currentArticle || !user) return false;
    const currentUserId = user.documentId || user.id?.toString();
    const articleUserId = currentArticle.user?.documentId || currentArticle.user?.id?.toString();
    return currentUserId === articleUserId;
  };

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
          userEmail="Please login"
          onSidebarToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
        />
        <main className="flex-1 md:ml-64 pt-16 p-2">
          <div className="max-w-md mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-red-50 flex items-center justify-center mb-4">
                <div className="h-8 w-8 text-red-500">🔒</div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Authentication Required</h3>
              <button 
                onClick={() => router.push('/auth')}
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

  if (loading && !currentArticle) {
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
          userName={user?.username || 'User'}
          userEmail={user?.email || 'user@example.com'}
          onSidebarToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
        />
        <main className="md:ml-64 pt-16 p-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-[#1f3a5f]" />
          </div>
        </main>
      </div>
    );
  }

  if (!currentArticle) {
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
          userName={user?.username || 'User'}
          userEmail={user?.email || 'user@example.com'}
          onSidebarToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
        />
        <main className="md:ml-64 pt-16 p-8">
          <div className="max-w-md mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-gray-50 flex items-center justify-center mb-4">
                <AlertCircle className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Article Not Found</h3>
              <p className="text-gray-600 mb-6">The article you're looking for doesn't exist or you don't have access.</p>
              <button 
                onClick={handleBack}
                className="flex items-center gap-2 bg-[#1f3a5f] text-white px-5 py-2.5 rounded-xl shadow hover:bg-[#162b47] transition-all mx-auto"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Articles
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
        userName={user?.username || 'User'}
        userEmail={user?.email || 'user@example.com'}
        onSidebarToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
      />
      <main className="md:ml-64 pt-5">
        <div className="p-4 md:p-6">
          <div className="max-w-6xl mx-auto">
            {/* Header with Actions */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={handleBack}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Articles
                </button>
                
                {isOwner() && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      disabled={isDeleting}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 bg-red-50 rounded-xl hover:bg-red-100 disabled:opacity-50"
                    >
                      {isDeleting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                      Delete
                    </button>
                    <button
                      onClick={handleEdit}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-[#4f7ea1] rounded-xl hover:bg-[#3f6785]"
                    >
                      <Edit className="w-4 h-4" />
                      Edit Article
                    </button>
                  </div>
                )}
              </div>
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                    {currentArticle.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>{currentArticle.user?.username || 'Unknown Author'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(currentArticle.createdAt)}</span>
                    </div>
                    {currentArticle.category && (
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4" />
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full text-xs font-medium">
                          {currentArticle.category.name}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyLink}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                    title="Copy link"
                  >
                    {copied ? (
                      <span className="text-green-600 text-xs">Copied!</span>
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={handleShare}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                    title="Share"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                    title="Bookmark"
                  >
                    <Bookmark className="w-4 h-4" />
                  </button>
                  <button
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                    title="Like"
                  >
                    <Heart className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Cover Image */}
            <div className="mb-8 rounded-2xl overflow-hidden border border-gray-200">
              <div className="aspect-[21/9] relative bg-gray-100">
                <Image
                  src={currentArticle.cover_image_url || '/placeholder.jpg'}
                  alt={currentArticle.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>

            {/* Article Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2">
                <div className="prose prose-lg max-w-none">
                  <div className="whitespace-pre-line text-gray-700 leading-relaxed">
                    {currentArticle.description}
                  </div>
                </div>

                {/* Comments Section */}
                {currentArticle.comments && currentArticle.comments.length > 0 && (
                  <div className="mt-12 pt-8 border-t border-gray-200">
                    <div className="flex items-center gap-2 mb-6">
                      <MessageSquare className="w-5 h-5 text-gray-500" />
                      <h3 className="text-lg font-semibold text-gray-900">
                        Comments ({currentArticle.comments.length})
                      </h3>
                    </div>
                    
                    <div className="space-y-6">
                      {currentArticle.comments.map((comment) => (
                        <div key={comment.documentId} className="bg-gray-50 rounded-xl p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-600">?</span>
                            </div>
                            <div>
                              <p className="text-sm text-gray-900">
                                {formatDate(comment.createdAt)}
                              </p>
                            </div>
                          </div>
                          <p className="text-gray-700">{comment.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar - Article Info */}
              <div className="lg:col-span-1">
                <div className="sticky top-24 space-y-6">
                  {/* Author Info */}
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                    <h3 className="text-sm font-medium text-gray-700 mb-4">About the Author</h3>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-lg font-medium text-blue-600">
                          {currentArticle.user?.username?.charAt(0).toUpperCase() || 'A'}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {currentArticle.user?.username || 'Anonymous'}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {currentArticle.user?.email || 'No email available'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Article Stats */}
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                    <h3 className="text-sm font-medium text-gray-700 mb-4">Article Details</h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs text-gray-500">Published</p>
                        <p className="text-sm text-gray-900">
                          {formatDate(currentArticle.createdAt)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Last Updated</p>
                        <p className="text-sm text-gray-900">
                          {formatDate(currentArticle.updatedAt)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Status</p>
                        <p className="text-sm text-gray-900">
                          <span className="px-2 py-0.5 bg-green-100 text-green-600 rounded-full text-xs font-medium">
                            Published
                          </span>
                        </p>
                      </div>
                      {currentArticle.category && (
                        <div>
                          <p className="text-xs text-gray-500">Category</p>
                          <p className="text-sm text-gray-900">
                            {currentArticle.category.name}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" />
            
            <div className="inline-block w-full max-w-md my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
              <div className="px-6 py-4">
                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                  Delete Article
                </h3>
                <p className="text-sm text-gray-500 text-center mb-6">
                  Are you sure you want to delete "{currentArticle.title}"? This action cannot be undone.
                </p>
                
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors bg-gray-100 rounded-xl hover:bg-gray-200"
                    disabled={isDeleting}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white transition-colors bg-red-600 rounded-xl hover:bg-red-700 disabled:opacity-50"
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      'Delete Article'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}