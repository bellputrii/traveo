/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { createArticle, getCategories } from '../../../../store/articles/articlesThunk';
import { clearError } from '../../../../store/articles/articlesSlice';
import Sidebar from '../../../../components/dashboard/Sidebar';
import { Header } from '../../../../components/dashboard/Header';
import {
  ArrowLeft,
  Upload,
  Image as ImageIcon,
  Globe,
  Tag,
  Loader2,
  X,
  AlertCircle,
  CheckCircle,
  CloudUpload
} from 'lucide-react';

// Fungsi untuk upload image ke API khusus menggunakan token dari localStorage
const uploadImageToAPI = async (file: File): Promise<string> => {
  try {
    // Ambil token dari localStorage
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found. Please login first.');
    }

    const formData = new FormData();
    formData.append("files", file, file.name);

    const response = await fetch("https://extra-brooke-yeremiadio-46b2183e.koyeb.app/api/upload", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Upload failed: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    console.log('Upload API result:', result);
    
    // Dari contoh response, ambil URL dari Cloudinary
    if (Array.isArray(result) && result.length > 0 && result[0].url) {
      return result[0].url; // URL dari Cloudinary
    }
    
    throw new Error('Invalid response format from upload API');
  } catch (error: any) {
    console.error('Upload image error:', error);
    throw new Error(error.message || 'Failed to upload image');
  }
};

export default function CreateArticlePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { loading, error, categories } = useAppSelector((state: any) => state.articles);
  const { user, isAuthenticated } = useAppSelector((state: any) => state.auth);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    cover_image_url: '',
    category: '',
  });
  
  const [imagePreview, setImagePreview] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [activeMenu, setActiveMenu] = useState('articles');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth');
      return;
    }
    dispatch(getCategories());
  }, [dispatch, isAuthenticated, router]);

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

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validasi ukuran file (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setFormErrors(prev => ({ ...prev, image: 'Image size must be less than 5MB' }));
      return;
    }

    // Validasi tipe file
    if (!file.type.startsWith('image/')) {
      setFormErrors(prev => ({ ...prev, image: 'File must be an image' }));
      return;
    }

    setImageFile(file);
    
    // Create preview locally
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setImagePreview(result);
      setFormErrors(prev => ({ ...prev, image: '' }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setIsUploading(true);
    setUploadProgress(0);
    dispatch(clearError());

    try {
      let imageUrl = formData.cover_image_url;
      
      // Upload gambar ke API jika ada file
      if (imageFile) {
        try {
          // Cek token sebelum upload
          const token = localStorage.getItem('token') || sessionStorage.getItem('token');
          if (!token) {
            throw new Error('No authentication token found. Please login again.');
          }

          // Simulasi progress upload
          const progressInterval = setInterval(() => {
            setUploadProgress(prev => {
              if (prev >= 90) {
                clearInterval(progressInterval);
                return 90;
              }
              return prev + 10;
            });
          }, 200);

          // Upload gambar ke API khusus
          const uploadedUrl = await uploadImageToAPI(imageFile);
          imageUrl = uploadedUrl;
          console.log('Image uploaded to Cloudinary:', uploadedUrl);
          
          clearInterval(progressInterval);
          setUploadProgress(100);
          
          // Tunggu sebentar untuk menunjukkan progress 100%
          await new Promise(resolve => setTimeout(resolve, 500));
          
        } catch (uploadError: any) {
          console.error('Upload image error:', uploadError);
          setFormErrors(prev => ({ 
            ...prev, 
            image: 'Failed to upload image: ' + uploadError.message,
            submit: 'Failed to upload image'
          }));
          setIsUploading(false);
          setIsSubmitting(false);
          return;
        }
      }

      setIsUploading(false);
      setUploadProgress(0);

      // Gunakan category sebagai string (documentId)
      const categoryId = formData.category || undefined;

      const articleData = {
        title: formData.title,
        description: formData.description,
        cover_image_url: imageUrl, // URL dari Cloudinary
        category: categoryId,
      };

      // Kirim articleData langsung (tanpa wrapper { data: ... })
      await dispatch(createArticle(articleData)).unwrap();
      
      // Redirect ke dashboard articles setelah sukses
      router.push('/articles');
      
    } catch (err: any) {
      console.error('Create article error:', err);
      setFormErrors(prev => ({ 
        ...prev, 
        submit: err.message || 'Failed to create article' 
      }));
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBack = () => {
    router.push('/articles');
  };

  const handleClearImage = () => {
    setImagePreview('');
    setImageFile(null);
    setFormData(prev => ({ ...prev, cover_image_url: '' }));
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
              <p className="text-gray-600 mb-6">Please login to create articles</p>
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
      <main className="md:ml-64 pt-10">
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
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Create New Article</h1>
                  <p className="text-gray-500">Share your travel experiences with the world</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 font-medium">
                      {user?.username?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <span>Posted by {user?.username || 'You'}</span>
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

            {/* Upload Progress */}
            {isUploading && (
              <div className="mb-6 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <CloudUpload className="w-5 h-5" />
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Uploading image to Cloudinary...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                </div>
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
                      placeholder="Enter a captivating title for your article"
                      disabled={isSubmitting}
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
                      placeholder="Share your travel story, tips, and experiences..."
                      disabled={isSubmitting}
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
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1f3a5f] focus:border-transparent disabled:opacity-50"
                        disabled={isSubmitting}
                      >
                        <option value="">Select a category (optional)</option>
                        {categories.map((cat: any) => (
                          <option key={cat.documentId} value={cat.documentId}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      Choose a category to help readers find your article
                    </p>
                  </div>
                </div>

                {/* Right Column - Image Upload & Preview */}
                <div className="lg:col-span-1 space-y-6">
                  {/* Image Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cover Image *
                      {imageFile && (
                        <span className="ml-2 text-xs text-green-600">
                          (Will be uploaded to Cloudinary)
                        </span>
                      )}
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
                            onClick={handleClearImage}
                            disabled={isSubmitting}
                            className="absolute top-2 right-2 p-2 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-colors disabled:opacity-50"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="p-3 bg-gray-50 border-t border-gray-200">
                          <div className="flex items-center text-xs text-gray-600">
                            <CloudUpload className="w-3 h-3 mr-1" />
                            <span>File selected: {imageFile?.name}</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <label className="block">
                        <div className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
                          formErrors.image ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-[#1f3a5f]'
                        } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}>
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-12 h-12 mb-3 text-gray-400" />
                            <p className="mb-1 text-sm text-gray-500">
                              <span className="font-semibold">Click to upload</span>
                            </p>
                            <p className="text-xs text-gray-500">
                              PNG, JPG, GIF up to 5MB
                            </p>
                            <p className="text-xs text-blue-500 mt-2">
                              Images will be uploaded to Cloudinary
                            </p>
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                            disabled={isSubmitting}
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
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1f3a5f] focus:border-transparent disabled:opacity-50"
                          placeholder="Or enter Cloudinary image URL"
                          disabled={isSubmitting || !!imageFile}
                        />
                      </div>
                      <p className="mt-2 text-sm text-gray-500">
                        {imageFile ? 'Using uploaded file' : 'Provide a Cloudinary URL or upload an image'}
                      </p>
                    </div>
                  </div>

                  {/* Preview Card */}
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Article Preview</h3>
                    <div className="space-y-3">
                      <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
                        {imagePreview ? (
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 line-clamp-2">
                          {formData.title || 'Your article title will appear here'}
                        </h4>
                        <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                          {formData.description || 'Your article description will appear here'}
                        </p>
                      </div>
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
                <button
                  type="submit"
                  disabled={isSubmitting || loading}
                  className="flex items-center gap-2 px-6 py-3 text-sm font-medium text-white transition-colors bg-[#1f3a5f] rounded-xl hover:bg-[#162b47] disabled:opacity-50 min-w-[140px] justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {isUploading ? 'Uploading...' : 'Publishing...'}
                    </>
                  ) : (
                    <>
                      <ImageIcon className="w-4 h-4" />
                      Publish Article
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}