/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '../../../../../store/hooks';
import { getArticle, updateArticle, getCategories } from '../../../../../store/articles/articlesThunk';
import { clearError, clearCurrentArticle } from '../../../../../store/articles/articlesSlice';
import Sidebar from '../../../../../components/dashboard/Sidebar';
import { Header } from '../../../../../components/dashboard/Header';
import {
  ArrowLeft,
  Upload,
  Image as ImageIcon,
  Globe,
  Tag,
  Loader2,
  X,
  AlertCircle,
  Eye,
  Save
} from 'lucide-react';

export default function EditArticlePage() {
  const router = useRouter();
  const params = useParams();
  const documentId = params.id as string;
  
  const dispatch = useAppDispatch();
  const { currentArticle, loading, error, categories } = useAppSelector((state) => state.articles);
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    cover_image_url: '',
    category: '',
  });
  
  const [imagePreview, setImagePreview] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [activeMenu, setActiveMenu] = useState('articles');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth');
      return;
    }
    
    dispatch(getArticle(documentId));
    dispatch(getCategories());
    
    return () => {
      dispatch(clearCurrentArticle());
    };
  }, [dispatch, documentId, isAuthenticated, router]);

  useEffect(() => {
    if (currentArticle) {
      // Check if current user is the owner
      const currentUserId = user?.id;
      const articleUserId = currentArticle.user?.id;
      
      if (currentUserId !== articleUserId) {
        router.push('/articles');
        return;
      }
      
      setFormData({
        title: currentArticle.title || '',
        description: currentArticle.description || '',
        cover_image_url: currentArticle.cover_image_url || '',
        category: currentArticle.category?.id?.toString() || '',
      });
      
      if (currentArticle.cover_image_url) {
        setImagePreview(currentArticle.cover_image_url);
      }
    }
  }, [currentArticle, user, router]);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    } else if (formData.title.length < 3) {
      errors.title = 'Title must be at least 3 characters';
    }
    
    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    } else if (formData.description.length < 10) {
      errors.description = 'Description must be at least 10 characters';
    }
    
    if (!formData.cover_image_url && !imageFile) {
      errors.image = 'Cover image is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setFormErrors(prev => ({ ...prev, image: 'Image size must be less than 5MB' }));
      return;
    }

    if (!file.type.startsWith('image/')) {
      setFormErrors(prev => ({ ...prev, image: 'File must be an image' }));
      return;
    }

    setImageFile(file);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setImagePreview(result);
      setFormData(prev => ({ ...prev, cover_image_url: result }));
      setFormErrors(prev => ({ ...prev, image: '' }));
    };
    reader.readAsDataURL(file);
  };

  // Pada bagian handleSubmit, ubah cara mengonversi categoryId:

     const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     
     if (!validateForm()) {
     return;
     }

     setIsSubmitting(true);
     dispatch(clearError());

     try {
     let imageUrl = formData.cover_image_url;
     
     // For now, use the existing URL or base64 from file
     // You can add Cloudinary upload later
     if (imageFile) {
          // If using file, use base64 for now
          imageUrl = imagePreview;
     }

     // Convert category to string if needed (jika API mengharapkan string)
     // Atau gunakan langsung string dari formData
     const categoryId = formData.category || undefined;

     const articleData = {
          title: formData.title,
          description: formData.description,
          cover_image_url: imageUrl,
          category: categoryId, // Ini sudah string atau undefined
     };

     await dispatch(updateArticle({
          documentId,
          data: articleData
     })).unwrap();
     
     router.push('/articles');
     
     } catch (err) {
     console.error('Update article error:', err);
     setFormErrors(prev => ({ 
          ...prev, 
          submit: 'Failed to update article' 
     }));
     } finally {
     setIsSubmitting(false);
     }
     };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBack = () => {
    router.push('/articles');
  };

  const handleView = () => {
    if (currentArticle) {
      window.open(`/articles/${currentArticle.documentId}`, '_blank');
    }
  };

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
          userEmail="Please login"
        />
        <main className="flex-1 md:ml-64 pt-16 p-8">
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
      <main className="md:ml-64 pt-8">
        <div className="p-8 md:p-6">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <button
                onClick={handleBack}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Articles
              </button>
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Edit Article</h1>
                  <p className="text-gray-500">Update your travel article</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleView}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200"
                  >
                    <Eye className="w-4 h-4" />
                    View Article
                  </button>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600 font-medium">
                        {user?.username?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    <span>by {user?.username || 'You'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Error Alert */}
            {(error || formErrors.submit) && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm">{error || formErrors.submit}</p>
                </div>
                <button 
                  onClick={() => {
                    dispatch(clearError());
                    setFormErrors(prev => ({ ...prev, submit: '' }));
                  }}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Form Fields */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Article Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#1f3a5f] focus:border-transparent text-lg ${
                        formErrors.title ? 'border-red-300' : 'border-gray-200'
                      }`}
                      placeholder="Enter article title"
                    />
                    {formErrors.title && (
                      <p className="mt-2 text-sm text-red-600">{formErrors.title}</p>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Article Description *
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={8}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#1f3a5f] focus:border-transparent ${
                        formErrors.description ? 'border-red-300' : 'border-gray-200'
                      }`}
                      placeholder="Enter article description"
                    />
                    {formErrors.description && (
                      <p className="mt-2 text-sm text-red-600">{formErrors.description}</p>
                    )}
                    <p className="mt-2 text-sm text-gray-500">
                      {formData.description.length} characters
                    </p>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <div className="relative">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1f3a5f] focus:border-transparent"
                      >
                        <option value="">Select a category (optional)</option>
                        {categories.map((cat) => (
                          <option key={cat.id || cat.documentId} value={cat.id?.toString() || cat.documentId}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Right Column - Image Upload & Preview */}
                <div className="lg:col-span-1 space-y-6">
                  {/* Image Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cover Image *
                    </label>
                    
                    {/* Image Preview */}
                    {imagePreview ? (
                      <div className="relative rounded-xl overflow-hidden border border-gray-200">
                        <div className="aspect-video relative bg-gray-100">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="object-cover w-full h-full"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setImagePreview('');
                              setImageFile(null);
                              setFormData(prev => ({ ...prev, cover_image_url: '' }));
                            }}
                            className="absolute top-2 right-2 p-2 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label className="block">
                        <div className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-xl hover:border-[#1f3a5f] cursor-pointer transition-colors">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-12 h-12 mb-3 text-gray-400" />
                            <p className="mb-1 text-sm text-gray-500">
                              <span className="font-semibold">Click to upload</span>
                            </p>
                            <p className="text-xs text-gray-500">
                              PNG, JPG, GIF up to 5MB
                            </p>
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                          />
                        </div>
                      </label>
                    )}
                    
                    {formErrors.image && (
                      <p className="mt-2 text-sm text-red-600">{formErrors.image}</p>
                    )}

                    {/* Or URL Input */}
                    <div className="mt-4">
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          value={formData.cover_image_url}
                          onChange={(e) => {
                            setFormData(prev => ({ ...prev, cover_image_url: e.target.value }));
                            if (e.target.value) {
                              setImagePreview(e.target.value);
                              setImageFile(null);
                            }
                          }}
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1f3a5f] focus:border-transparent"
                          placeholder="Or enter image URL"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Article Info */}
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Article Info</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-gray-500">Created</p>
                        <p className="text-sm text-gray-900">
                          {currentArticle?.createdAt ? new Date(currentArticle.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          }) : 'Unknown'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Last Updated</p>
                        <p className="text-sm text-gray-900">
                          {currentArticle?.updatedAt ? new Date(currentArticle.updatedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          }) : 'Unknown'}
                        </p>
                      </div>
                      {currentArticle?.category && (
                        <div>
                          <p className="text-xs text-gray-500">Current Category</p>
                          <p className="text-sm text-gray-900">{currentArticle.category.name}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-8 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors bg-gray-100 rounded-xl hover:bg-gray-200 disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={isSubmitting || loading}
                    className="flex items-center gap-2 px-6 py-3 text-sm font-medium text-white transition-colors bg-[#1f3a5f] rounded-xl hover:bg-[#162b47] disabled:opacity-50 min-w-[140px] justify-center"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}