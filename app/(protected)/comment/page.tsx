/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { 
  getComments, 
  deleteComment,
  clearError,
  addNotification,
  removeNotification
} from '../../../store/comments';
import Sidebar from '../../../components/dashboard/Sidebar';
import { Header } from '../../../components/dashboard/Header';
import {
  Trash2,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Calendar,
  FileText,
  CheckCircle,
  Loader2,
  AlertCircle,
  Check,
  XCircle
} from 'lucide-react';

// Notification Component dengan type yang sesuai
const Notification = ({ 
  id, 
  type, 
  message, 
  onClose 
}: { 
  id: string;
  type: 'success' | 'error';
  message: string;
  onClose: () => void;
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [id, onClose]);

  const Icon = type === 'success' ? Check : XCircle;
  const bgColor = type === 'success' ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100';
  const textColor = type === 'success' ? 'text-green-800' : 'text-red-800';
  const iconColor = type === 'success' ? 'text-green-500' : 'text-red-500';

  return (
    <div className={`flex items-start gap-3 p-4 border rounded-lg shadow-sm ${bgColor} animate-slideIn`}>
      <div className={`flex-shrink-0 ${iconColor}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${textColor}`}>
          {message}
        </p>
      </div>
      <button
        onClick={onClose}
        className={`flex-shrink-0 ${type === 'success' ? 'text-green-400 hover:text-green-600' : 'text-red-400 hover:text-red-600'}`}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

// Notification Container
const NotificationContainer = () => {
  const { notifications } = useAppSelector((state) => state.comments);
  const dispatch = useAppDispatch();

  const handleClose = useCallback((id: string) => {
    dispatch(removeNotification(id));
  }, [dispatch]);

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 max-w-md">
      {notifications.map((notification: any) => (
        <Notification
          key={notification.id}
          id={notification.id}
          type={notification.type}
          message={notification.message}
          onClose={() => handleClose(notification.id)}
        />
      ))}
    </div>
  );
};

// Delete Confirmation Modal
const DeleteConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  commentContent, 
  isDeleting 
}: { 
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  commentContent: string;
  isDeleting: boolean;
}) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isDeleting) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-full">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Delete Comment</h3>
              <p className="text-sm text-gray-500">Confirm your action</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          <div className="mb-6">
            <p className="text-gray-700 mb-2">
              Are you sure you want to delete this comment?
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <p className="text-sm text-gray-900 italic">
                `{commentContent.length > 100 ? commentContent.substring(0, 100) + '...' : commentContent}`
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
                This comment will be permanently removed from the system.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-5 py-2 text-sm font-medium text-gray-700 transition-colors bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white transition-colors bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                Delete Comment
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Loading Skeleton
const CommentsSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
        <div className="space-y-2 mb-4">
          <div className="h-3 bg-gray-200 rounded w-full"></div>
          <div className="h-3 bg-gray-200 rounded w-5/6"></div>
        </div>
        <div className="flex items-center justify-end">
          <div className="h-8 w-20 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    ))}
  </div>
);

// Check if user can delete comment
const canDeleteComment = (comment: any, currentUser: any) => {
  if (!currentUser) return false;
  
  // Admin can delete any comment
  if (currentUser.role === 'admin') return true;
  
  // User can only delete their own comments
  // Menggunakan optional chaining untuk menghindari error
  const commentUserId = comment.user?.documentId || comment.user?.id?.toString() || comment.userId;
  const currentUserId = currentUser.documentId || currentUser.id?.toString();
  
  return commentUserId === currentUserId;
};

// Comments Content Component
const CommentsContent = () => {
  const dispatch = useAppDispatch();
  const { 
    comments, 
    loading, 
    error, 
    pagination 
  } = useAppSelector((state: any) => state.comments);
  const { user } = useAppSelector((state: any) => state.auth);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('Newest First');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<{
    documentId: string;
    content: string;
  } | null>(null);

  useEffect(() => {
    dispatch(getComments(currentPage));
  }, [dispatch, currentPage]);

  useEffect(() => {
    if (error) {
      // Menggunakan object yang sesuai dengan tipe
      dispatch(addNotification({
        id: Date.now().toString(), // Menambahkan id
        type: 'error',
        message: error,
        title: 'Error' // Menambahkan title
      } as any)); // Menggunakan type assertion untuk menghindari error
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleDeleteClick = (comment: any) => {
    if (!canDeleteComment(comment, user)) {
      dispatch(addNotification({
        id: Date.now().toString(),
        type: 'error',
        message: 'You can only delete your own comments',
        title: 'Permission Denied'
      } as any));
      return;
    }
    
    setCommentToDelete({
      documentId: comment.documentId || comment.id?.toString() || '',
      content: comment.content || ''
    });
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!commentToDelete) return;
    
    setIsDeleting(true);
    try {
      await dispatch(deleteComment(commentToDelete.documentId)).unwrap();
      dispatch(addNotification({
        id: Date.now().toString(),
        type: 'success',
        message: 'Comment deleted successfully',
        title: 'Success'
      } as any));
      dispatch(getComments(currentPage));
      setShowDeleteConfirm(false);
      setCommentToDelete(null);
    } catch (error: any) {
      dispatch(addNotification({
        id: Date.now().toString(),
        type: 'error',
        message: error?.message || 'Failed to delete comment',
        title: 'Error'
      } as any));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setCommentToDelete(null);
  };

  const filteredComments = useMemo(() => {
    let filtered = [...comments];
    
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((comment: any) => {
        return (
          comment.content?.toLowerCase().includes(searchLower) ||
          comment.user?.username?.toLowerCase().includes(searchLower) ||
          (typeof comment.article?.title === 'string' && comment.article.title.toLowerCase().includes(searchLower))
        );
      });
    }
    
    if (sortBy === 'Newest First') {
      filtered.sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    } else if (sortBy === 'Oldest First') {
      filtered.sort((a: any, b: any) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());
    }
    
    return filtered;
  }, [comments, searchTerm, sortBy]);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'No date';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid date';
    }
  };

  // Mengambil nilai pagination dengan aman
  const pageCount = pagination?.pageCount || 1;
  const totalItems = pagination?.total || pagination?.totalItems || filteredComments.length;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Notification Container */}
      <NotificationContainer />

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Comments</h1>
          <p className="text-gray-600 mt-1">Manage user comments</p>
        </div>
        <div className="text-sm text-gray-500">
          View and manage comments on articles
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Search and Info Bar */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search comments..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1f3a5f] focus:border-transparent transition-all text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            
            <div className="flex items-center gap-4">
              {searchTerm && (
                <div className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-1.5" />
                  {filteredComments.length} results found
                </div>
              )}
              
              <select 
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-[#1f3a5f] focus:border-transparent bg-white"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="Newest First">Newest First</option>
                <option value="Oldest First">Oldest First</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {loading && comments.length === 0 ? (
            <CommentsSkeleton />
          ) : filteredComments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <MessageSquare className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchTerm ? 'No comments found' : 'No comments yet'}
              </h3>
              <p className="text-gray-600 text-center max-w-md mb-6">
                {searchTerm
                  ? 'Try using different keywords'
                  : 'Comments will appear here when users comment on articles'}
              </p>
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="text-sm text-gray-700 hover:text-gray-900 underline"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredComments.map((comment: any) => {
                const canDelete = canDeleteComment(comment, user);
                
                return (
                  <div
                    key={comment.documentId || comment.id || Math.random()}
                    className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all"
                  >
                    {/* Comment Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <MessageSquare className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {comment.user?.username || 'Anonymous'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatDate(comment.createdAt)}
                          </div>
                        </div>
                      </div>
                      {canDelete && (
                        <button
                          onClick={() => handleDeleteClick(comment)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete comment"
                          disabled={isDeleting && commentToDelete?.documentId === comment.documentId}
                        >
                          {isDeleting && commentToDelete?.documentId === comment.documentId ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </div>

                    {/* Comment Content */}
                    <div className="mb-4">
                      <p className="text-sm text-gray-700 line-clamp-4 leading-relaxed">
                        {comment.content || 'No content'}
                      </p>
                    </div>

                    {/* Metadata */}
                    <div className="space-y-2 text-xs text-gray-500">
                      {comment.article && (
                        <div className="flex items-center gap-2">
                          <FileText className="w-3.5 h-3.5" />
                          <span className="truncate">
                            Article: {comment.article.title || `ID: ${comment.article.documentId || comment.articleId || 'N/A'}`}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Created: {formatDate(comment.createdAt)}</span>
                      </div>
                    </div>

                    {/* Delete Warning (if cannot delete) */}
                    {!canDelete && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-2 text-xs text-amber-600">
                          <AlertCircle className="w-3 h-3" />
                          <span>Only comment owners can delete</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {!loading && pageCount > 1 && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6 pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                Showing <span className="font-medium">{filteredComments.length}</span> of{' '}
                <span className="font-medium">{totalItems}</span> comments
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1 || loading}
                  className="flex items-center gap-1 px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, pageCount) }, (_, i) => {
                    let pageNum;
                    if (pageCount <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= pageCount - 2) {
                      pageNum = pageCount - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        disabled={loading}
                        className={`w-8 h-8 text-sm rounded-lg transition-colors ${
                          currentPage === pageNum
                            ? 'bg-[#1f3a5f] text-white'
                            : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, pageCount))}
                  disabled={currentPage === pageCount || loading}
                  className="flex items-center gap-1 px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        commentContent={commentToDelete?.content || ''}
        isDeleting={isDeleting}
      />
    </div>
  );
};

// Main Page Component
export default function CommentsPage() {
  const { user, isAuthenticated } = useAppSelector((state: any) => state.auth);
  const [activeMenu, setActiveMenu] = useState('comments');
  // Hapus state isSidebarOpen dan setIsSidebarOpen karena tidak ada di SidebarProps
  // const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen bg-white">
        {/* Hapus props isOpen dan setIsOpen karena tidak diperlukan */}
        <Sidebar 
          activeMenu={activeMenu} 
          setActiveMenu={setActiveMenu}
        />
        <Header 
          activeMenu={activeMenu}
          userName="Guest"
          userEmail="Silakan login"
          onSidebarToggle={() => {}} // Fungsi kosong karena sidebar tidak mendukung toggle
          isSidebarOpen={false} // Default false
        />
        <main className="flex-1 md:ml-64 pt-16 p-8">
          <div className="max-w-md mx-auto bg-white rounded-xl border border-gray-200 p-8 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-red-50 flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h3>
            <p className="text-gray-600 mb-6">Please login to access comments</p>
            <button 
              onClick={() => window.location.href = '/auth'}
              className="flex items-center gap-2 bg-[#1f3a5f] text-white px-5 py-2.5 rounded-lg hover:bg-[#162b47] transition-colors mx-auto"
            >
              Login to Dashboard
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hapus props isOpen dan setIsOpen karena tidak diperlukan */}
      <Sidebar 
        activeMenu={activeMenu} 
        setActiveMenu={setActiveMenu}
      />
      <Header 
        activeMenu={activeMenu}
        userName={user?.name || 'User'}
        userEmail={user?.email || 'user@example.com'}
        onSidebarToggle={() => {}} // Fungsi kosong karena sidebar tidak mendukung toggle
        isSidebarOpen={false} // Default false
      />
      <main className="md:ml-64 pt-16">
        <CommentsContent />
      </main>
    </div>
  );
}