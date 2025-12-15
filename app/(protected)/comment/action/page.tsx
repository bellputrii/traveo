// pages/comments/[action]/[id].tsx
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../../store';
import { 
  fetchComment, 
  createComment, 
  updateComment, 
  resetComment,
  CommentFormData 
} from '../../../store/comments';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

const CommentFormPage = () => {
  const router = useRouter();
  const { id, action } = router.query;
  const isEdit = action === 'edit';
  
  const dispatch = useDispatch<AppDispatch>();
  const { currentComment, loading, error, success } = useSelector((state: RootState) => state.comments);
  
  const [formData, setFormData] = useState<CommentFormData>({
    content: '',
    article: undefined,
  });

  useEffect(() => {
    if (isEdit && id) {
      dispatch(fetchComment(id as string));
    }
    
    return () => {
      dispatch(resetComment());
    };
  }, [dispatch, id, isEdit]);

  useEffect(() => {
    if (currentComment && isEdit) {
      setFormData({
        content: currentComment.content,
        article: currentComment.article,
      });
    }
  }, [currentComment, isEdit]);

  useEffect(() => {
    if (success) {
      router.push('/comments');
    }
  }, [success, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isEdit && id) {
        await dispatch(updateComment(id as string, formData)).unwrap();
      } else {
        await dispatch(createComment(formData)).unwrap();
      }
    } catch (error) {
      console.error('Failed to save comment:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'article' ? parseInt(value) || undefined : value,
    }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/comments">
            <button className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors">
              <ArrowLeft className="w-5 h-5" />
              Back to Comments
            </button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">
            {isEdit ? 'Edit Comment' : 'Create New Comment'}
          </h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-xl shadow p-6">
            {/* Content Field */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comment Content *
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1f3a5f] focus:border-transparent resize-none"
                placeholder="Enter comment content..."
              />
            </div>

            {/* Article ID Field (Optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Article ID (Optional)
              </label>
              <input
                type="number"
                name="article"
                value={formData.article || ''}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1f3a5f] focus:border-transparent"
                placeholder="Enter article ID..."
              />
              <p className="text-sm text-gray-500 mt-1">
                Leave empty if comment is not associated with an article
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4">
            <Link href="/comments">
              <button
                type="button"
                className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-[#1f3a5f] text-white px-6 py-2.5 rounded-xl shadow hover:bg-[#162b47] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  {isEdit ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  {isEdit ? 'Update Comment' : 'Create Comment'}
                </>
              )}
            </button>
          </div>
        </form>

        {/* Preview (for edit mode) */}
        {isEdit && currentComment && (
          <div className="mt-8 bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Comment Preview</h3>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-600">Document ID:</span>
                <div className="font-mono text-sm bg-white px-3 py-2 rounded-lg mt-1">
                  {currentComment.documentId}
                </div>
              </div>
              <div>
                <span className="text-sm text-gray-600">Created:</span>
                <div className="text-sm mt-1">
                  {new Date(currentComment.createdAt).toLocaleString()}
                </div>
              </div>
              <div>
                <span className="text-sm text-gray-600">Last Updated:</span>
                <div className="text-sm mt-1">
                  {new Date(currentComment.updatedAt).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentFormPage;