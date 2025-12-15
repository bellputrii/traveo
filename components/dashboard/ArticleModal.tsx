// components/dashboard/ArticleModal.tsx
/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { createArticle, updateArticle, getArticles, getCategories } from '../../store/articles/articlesThunk';
import { clearError, setCurrentArticle } from '../../store/articles/articlesSlice';
import { 
  X, 
  Upload, 
  Image as ImageIcon,
  Loader2,
  Globe,
  Tag
} from 'lucide-react';

interface ArticleModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  article?: any;
}

const ArticleModal = ({ isOpen, onClose, mode, article }: ArticleModalProps) => {
  const dispatch = useAppDispatch();
  const { loading, error, categories } = useAppSelector((state) => state.articles);
  const { user } = useAppSelector((state) => state.auth); // Tambahkan ini
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    cover_image_url: '',
    category: '',
  });
  
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ownArticleError, setOwnArticleError] = useState<string>('');

  useEffect(() => {
    if (mode === 'edit' && article && user) {
      // Check if current user is the owner of the article
      const currentUserId = user.documentId || user.id?.toString();
      const articleUserId = article.user?.documentId || article.user?.id?.toString();
      
      if (currentUserId !== articleUserId) {
        setOwnArticleError('You can only edit your own articles');
        const timer = setTimeout(() => {
          onClose();
        }, 2000);
        return () => clearTimeout(timer);
      } else {
        setOwnArticleError('');
      }
    }
  }, [mode, article, user, onClose]);

  useEffect(() => {
    if (mode === 'edit' && article) {
      setFormData({
        title: article.title || '',
        description: article.description || '',
        cover_image_url: article.cover_image_url || '',
        category: article.category?.documentId || '',
      });
      if (article.cover_image_url) {
        setImagePreview(article.cover_image_url);
      }
    } else {
      resetForm();
    }
  }, [mode, article]);

  useEffect(() => {
    if (isOpen) {
      dispatch(getCategories());
    }
  }, [isOpen, dispatch]);

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      cover_image_url: '',
      category: '',
    });
    setImagePreview('');
    setOwnArticleError('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setFormData(prev => ({
          ...prev,
          cover_image_url: result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Jika ada error hak akses, jangan lanjutkan
    if (ownArticleError) {
      return;
    }
    
    if (!formData.title || !formData.description || !formData.cover_image_url) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === 'create') {
        await dispatch(createArticle({
          ...formData,
          category: formData.category || undefined,
        })).unwrap();
      } else if (mode === 'edit' && article) {
        await dispatch(updateArticle({
          documentId: article.documentId,
          data: {
            ...formData,
            category: formData.category || undefined,
          },
        })).unwrap();
      }
      
      dispatch(getArticles(1));
      resetForm();
      onClose();
    } catch (error: any) {
      console.error('Failed to save article:', error);
      if (error.includes('403') || error.includes('Forbidden')) {
        setOwnArticleError('You are not allowed to update this article.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    resetForm();
    dispatch(clearError());
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" 
          onClick={handleClose}
        />

        {/* Modal */}
        <div className="inline-block w-full max-w-2xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                {mode === 'create' ? 'Create New Article' : 'Edit Article'}
              </h3>
              <p className="text-sm text-gray-500">
                {mode === 'create' ? 'Add a new travel article' : 'Update your article details'}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 text-gray-400 transition-colors rounded-lg hover:text-gray-600 hover:bg-gray-100"
              disabled={isSubmitting}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="px-6 py-4 space-y-6">
              {/* Access Error Alert */}
              {ownArticleError && (
                <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
                  {ownArticleError}
                  <p className="mt-1 text-xs">Closing modal in a moment...</p>
                </div>
              )}

              {/* API Error Alert */}
              {error && (
                <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
                  {error}
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1f3a5f] focus:border-transparent disabled:bg-gray-100"
                  placeholder="Enter article title"
                  required
                  disabled={isSubmitting || !!ownArticleError}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1f3a5f] focus:border-transparent disabled:bg-gray-100"
                  placeholder="Enter article description"
                  required
                  disabled={isSubmitting || !!ownArticleError}
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1f3a5f] focus:border-transparent disabled:bg-gray-100"
                    disabled={isSubmitting || !!ownArticleError}
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat.documentId} value={cat.documentId}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cover Image *
                </label>
                <div className="space-y-4">
                  {/* Image Preview */}
                  {imagePreview && (
                    <div className="relative w-full h-64 overflow-hidden rounded-xl border border-gray-200">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="object-cover w-full h-full"
                      />
                      {!ownArticleError && (
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview('');
                            setFormData(prev => ({ ...prev, cover_image_url: '' }));
                          }}
                          className="absolute p-1 text-white transition-colors bg-red-500 rounded-full top-2 right-2 hover:bg-red-600"
                          disabled={isSubmitting}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}

                  {/* Upload Area */}
                  {!imagePreview && !ownArticleError && (
                    <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-xl hover:border-[#1f3a5f] cursor-pointer transition-colors disabled:cursor-not-allowed disabled:opacity-50">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-12 h-12 mb-3 text-gray-400" />
                        <p className="mb-1 text-sm text-gray-500">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">
                          PNG, JPG, GIF up to 10MB
                        </p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        disabled={isSubmitting}
                      />
                    </label>
                  )}

                  {/* URL Input */}
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={formData.cover_image_url}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, cover_image_url: e.target.value }));
                        if (e.target.value) {
                          setImagePreview(e.target.value);
                        }
                      }}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1f3a5f] focus:border-transparent disabled:bg-gray-100"
                      placeholder="Or enter image URL"
                      disabled={isSubmitting || !!ownArticleError}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                className="px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors bg-gray-100 rounded-xl hover:bg-gray-200 disabled:opacity-50"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !!ownArticleError}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white transition-colors bg-[#1f3a5f] rounded-xl hover:bg-[#162b47] disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {mode === 'create' ? 'Creating...' : 'Updating...'}
                  </>
                ) : (
                  <>
                    <ImageIcon className="w-4 h-4" />
                    {mode === 'create' ? 'Create Article' : 'Update Article'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ArticleModal;