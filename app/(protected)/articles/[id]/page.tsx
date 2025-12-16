/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { getArticle, deleteArticle } from '../../../../store/articles/articlesThunk';
import { createComment, deleteComment } from '../../../../store/comments/commentsThunk';
import { clearError, clearCurrentArticle } from '../../../../store/articles/articlesSlice';
import { addNotification, removeNotification } from '../../../../store/comments/commentsSlice';
import Sidebar from '../../../../components/dashboard/Sidebar';
import { Header } from '../../../../components/dashboard/Header';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Calendar,
  User as UserIcon,
  Tag,
  MessageSquare,
  Share2,
  Copy,
  Loader2,
  AlertCircle,
  X,
  Check,
  Send,
  MoreVertical
} from 'lucide-react';

// Notification Component
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

  const Icon = type === 'success' ? Check : X;
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

  // Filter hanya notification dengan type 'success' atau 'error'
  const filteredNotifications = notifications.filter(n => 
    n.type === 'success' || n.type === 'error'
  );

  if (filteredNotifications.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 max-w-md">
      {filteredNotifications.map((notification) => (
        <Notification
          key={notification.id}
          id={notification.id}
          type={notification.type as 'success' | 'error'}
          message={notification.message}
          onClose={() => handleClose(notification.id)}
        />
      ))}
    </div>
  );
};

// Comment Input Component
const CommentInput = ({ 
  articleId, 
  onSubmit, 
  isSubmitting 
}: { 
  articleId: string;
  onSubmit: (content: string) => Promise<void>;
  isSubmitting: boolean;
}) => {
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!comment.trim()) {
      setError('Comment cannot be empty');
      return;
    }

    if (comment.length > 1000) {
      setError('Comment must be less than 1000 characters');
      return;
    }

    setError('');
    try {
      await onSubmit(comment);
      setComment('');
    } catch (err) {
      setError('Failed to post comment');
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">Add a Comment</h3>
      
      {error && (
        <div className="mb-3 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">{error}</span>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your thoughts..."
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1f3a5f] focus:border-transparent resize-none text-sm"
            maxLength={1000}
            disabled={isSubmitting}
          />
          <div className="flex justify-between mt-2">
            <p className="text-xs text-gray-500">
              Share your perspective respectfully
            </p>
            <p className={`text-xs ${comment.length > 950 ? 'text-amber-600' : 'text-gray-500'}`}>
              {comment.length}/1000
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500">
            Your comment will be visible to everyone
          </div>
          <button
            type="submit"
            disabled={isSubmitting || !comment.trim()}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#1f3a5f] rounded-lg hover:bg-[#162b47] disabled:opacity-50 transition-colors"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Posting...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Post Comment
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

// Comment Item Component
const CommentItem = ({ comment, currentUser }: { comment: any; currentUser: any }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const dispatch = useAppDispatch();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const canDeleteComment = () => {
    if (!currentUser) return false;
    
    // Admin can delete any comment
    if (currentUser.role === 'admin') return true;
    
    // User can only delete their own comments
    const commentUserId = comment.user?.id;
    const currentUserId = currentUser.id;
    
    return commentUserId === currentUserId;
  };

  const handleDelete = async () => {
    if (!canDeleteComment()) return;
    
    setIsDeleting(true);
    try {
      await dispatch(deleteComment(comment.documentId)).unwrap();
      dispatch(addNotification({
        id: Date.now().toString(),
        type: 'success',
        title: 'Success',
        message: 'Comment deleted successfully',
        duration: 3000
      }));
      // Refresh article to update comments
      window.location.reload();
    } catch (error) {
      dispatch(addNotification({
        id: Date.now().toString(),
        type: 'error',
        title: 'Error',
        message: 'Failed to delete comment',
        duration: 5000
      }));
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4 mb-3">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-sm font-medium text-blue-600">
              {comment.user?.username?.charAt(0).toUpperCase() || '?'}
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-900">
                {comment.user?.username || 'Anonymous'}
              </span>
              <span className="text-xs text-gray-500">•</span>
              <span className="text-xs text-gray-500">
                {formatDate(comment.createdAt)}
              </span>
            </div>
          </div>
        </div>
        
        {canDeleteComment() && (
          <div className="relative">
            <button
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isDeleting}
              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
            >
              {isDeleting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <MoreVertical className="w-4 h-4" />
              )}
            </button>
            
            {showDeleteConfirm && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 w-48">
                <div className="p-2">
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Comment
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      <p className="text-gray-700 text-sm leading-relaxed">
        {comment.content}
      </p>
    </div>
  );
};

export default function ArticleDetailPage() {
  const router = useRouter();
  const params = useParams();
  const documentId = params.id as string;
  
  const dispatch = useAppDispatch();
  const { currentArticle, loading, error } = useAppSelector((state) => state.articles);
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { loading: commentLoading } = useAppSelector((state) => state.comments);
  
  const [activeMenu, setActiveMenu] = useState('articles');
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isPostingComment, setIsPostingComment] = useState(false);

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
    } catch (error: any) {
      dispatch(addNotification({
        id: Date.now().toString(),
        type: 'error',
        title: 'Error',
        message: error || 'Failed to delete article',
        duration: 5000
      }));
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

  const handlePostComment = async (content: string) => {
    if (!currentArticle || !user) return;
    
    setIsPostingComment(true);
    try {
      await dispatch(createComment({
        content,
        article: currentArticle.id ? Number(currentArticle.id) : undefined
      })).unwrap();
      
      dispatch(addNotification({
        id: Date.now().toString(),
        type: 'success',
        title: 'Success',
        message: 'Comment posted successfully',
        duration: 3000
      }));
      
      // Refresh article to show new comment
      dispatch(getArticle(documentId));
    } catch (error: any) {
      dispatch(addNotification({
        id: Date.now().toString(),
        type: 'error',
        title: 'Error',
        message: error || 'Failed to post comment',
        duration: 5000
      }));
    } finally {
      setIsPostingComment(false);
    }
  };

  const isOwner = () => {
    if (!currentArticle || !user) return false;
    return user.id === currentArticle.user?.id;
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading && !currentArticle) {
    return (
      <div className="min-h-screen bg-white">
        <Sidebar 
          activeMenu={activeMenu} 
          setActiveMenu={setActiveMenu}
        />
        <Header 
          activeMenu={activeMenu}
          userName={user?.username || 'User'}
          userEmail={user?.email || 'user@example.com'}
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
        />
        <Header 
          activeMenu={activeMenu}
          userName={user?.username || 'User'}
          userEmail={user?.email || 'user@example.com'}
        />
        <main className="md:ml-64 pt-16 p-8">
          <div className="max-w-md mx-auto bg-white rounded-xl border border-gray-200 p-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Article Not Found</h3>
              <p className="text-gray-600 mb-6">The article youre looking for doesn&apos;t exist.</p>
              <button 
                onClick={() => router.push('/articles')}
                className="flex items-center gap-2 bg-[#1f3a5f] text-white px-5 py-2.5 rounded-lg hover:bg-[#162b47] transition-colors mx-auto"
              >
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
      <NotificationContainer />
      
      <Sidebar 
        activeMenu={activeMenu} 
        setActiveMenu={setActiveMenu}
      />
      <Header 
        activeMenu={activeMenu}
        userName={user?.username || 'User'}
        userEmail={user?.email || 'user@example.com'}
      />
      <main className="md:ml-64 pt-5">
        <div className="p-4 md:p-6">
          <div className="max-w-6xl mx-auto">
            {/* Header with Actions */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => router.push('/articles')}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm"
                >
                  ← Back to Articles
                </button>
                
                {isOwner() && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      disabled={isDeleting}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 bg-red-50 rounded-lg hover:bg-red-100 disabled:opacity-50 transition-colors"
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
                      className="flex items-center gap-2 px-3 py-2 text-sm text-white bg-[#4f7ea1] rounded-lg hover:bg-[#3f6785] transition-colors"
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
                      <UserIcon className="w-4 h-4" />
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
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                    title="Copy link"
                  >
                    {copied ? (
                      <span className="text-green-600 text-xs">Copied!</span>
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => handleCopyLink()}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                    title="Share"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Cover Image */}
            {currentArticle.cover_image_url && (
              <div className="mb-6 rounded-xl overflow-hidden border border-gray-200">
                <div className="aspect-[21/9] relative bg-gray-100">
                  <img
                    src={currentArticle.cover_image_url || '/placeholder.jpg'}
                    alt={currentArticle.title}
                    className="object-cover w-full h-full"
                  />
                </div>
              </div>
            )}

            {/* Article Content & Comments */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2">
                <div className="mb-8">
                  <div className="whitespace-pre-line text-gray-700 leading-relaxed text-base">
                    {currentArticle.description}
                  </div>
                </div>

                {/* Add Comment Section */}
                <div className="mb-8">
                  <CommentInput
                    articleId={currentArticle.documentId}
                    onSubmit={handlePostComment}
                    isSubmitting={isPostingComment}
                  />
                </div>

                {/* Comments Section */}
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <div className="flex items-center gap-2 mb-6">
                    <MessageSquare className="w-5 h-5 text-gray-500" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      Comments {currentArticle.comments && `(${currentArticle.comments.length})`}
                    </h3>
                  </div>
                  
                  {currentArticle.comments && currentArticle.comments.length > 0 ? (
                    <div className="space-y-4">
                      {currentArticle.comments.map((comment: any) => (
                        <CommentItem
                          key={comment.documentId || comment.id}
                          comment={comment}
                          currentUser={user}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4">
                        <MessageSquare className="w-8 h-8 text-gray-400" />
                      </div>
                      <h4 className="text-lg font-medium text-gray-900 mb-2">No comments yet</h4>
                      <p className="text-gray-600 max-w-md mx-auto">
                        Be the first to share your thoughts on this article!
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar - Article Info */}
              <div className="lg:col-span-1">
                <div className="sticky top-24 space-y-6">
                  {/* Author Info */}
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">About the Author</h3>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-base font-medium text-blue-600">
                          {(currentArticle.user?.username || 'A').charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {currentArticle.user?.username || 'Anonymous'}
                        </h4>
                        <p className="text-sm text-gray-500 truncate max-w-[150px]">
                          {currentArticle.user?.email || 'No email available'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Article Stats */}
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Article Details</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Published</p>
                        <p className="text-sm text-gray-900">
                          {formatDate(currentArticle.createdAt)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Last Updated</p>
                        <p className="text-sm text-gray-900">
                          {formatDate(currentArticle.updatedAt)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Status</p>
                        <p className="text-sm text-gray-900">
                          <span className="px-2 py-0.5 bg-green-100 text-green-600 rounded-full text-xs font-medium">
                            Published
                          </span>
                        </p>
                      </div>
                      {currentArticle.category && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Category</p>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Delete Article</h3>
                  <p className="text-gray-600 text-sm">
                    Are you sure you want to delete &quot;{currentArticle.title}&quot;?
                  </p>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6">
                <p className="text-sm text-amber-800">
                  This action cannot be undone. All comments will also be deleted.
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  {isDeleting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Deleting...
                    </span>
                  ) : (
                    'Delete Article'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}