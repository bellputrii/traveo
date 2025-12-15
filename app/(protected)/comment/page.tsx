'use client';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../../store';
import { 
  fetchComments, 
  deleteComment, 
  resetComment,
  Comment 
} from '../../../store/comments';
import { Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

const CommentsPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { comments, loading, error, pagination } = useSelector((state: RootState) => state.comments);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    dispatch(fetchComments(currentPage));
  }, [dispatch, currentPage]);

  const handleDelete = async (documentId: string) => {
    try {
      await dispatch(deleteComment(documentId)).unwrap();
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  const filteredComments = comments.filter(comment =>
    comment.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    comment.documentId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= pagination.pageCount) {
      setCurrentPage(page);
    }
  };

  if (loading && comments.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1f3a5f]"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Comments Management</h1>
          <p className="text-gray-600 mt-2">Manage and moderate user comments</p>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/comments/create">
            <button className="flex items-center gap-2 bg-[#1f3a5f] text-white px-5 py-2.5 rounded-xl shadow hover:bg-[#162b47] transition-all">
              <Plus className="w-5 h-5" />
              New Comment
            </button>
          </Link>
        </div>
      </div>

      {/* Search and Stats */}
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="relative w-full md:w-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search comments by content or ID..."
              className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl w-full md:w-96 focus:outline-none focus:ring-2 focus:ring-[#1f3a5f] focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              Showing <span className="font-semibold">{filteredComments.length}</span> of{' '}
              <span className="font-semibold">{pagination.total}</span> comments
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
          {error}
        </div>
      )}

      {/* Comments Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Content
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Document ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created At
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredComments.map((comment) => (
                <tr key={comment.documentId} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {comment.content}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600 font-mono">
                      {comment.documentId}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Published
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Link href={`/comments/edit/${comment.documentId}`}>
                        <button className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                          <Pencil className="w-4 h-4" />
                          Edit
                        </button>
                      </Link>
                      <button
                        onClick={() => setDeleteConfirm(comment.documentId)}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredComments.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">No comments found</div>
            <p className="text-gray-500">Try adjusting your search or create a new comment</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.pageCount > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`p-2 rounded-lg ${currentPage === 1 ? 'text-gray-400' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
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
                onClick={() => handlePageChange(pageNum)}
                className={`px-4 py-2 rounded-lg ${currentPage === pageNum ? 'bg-[#1f3a5f] text-white' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                {pageNum}
              </button>
            );
          })}
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === pagination.pageCount}
            className={`p-2 rounded-lg ${currentPage === pagination.pageCount ? 'text-gray-400' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this comment? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommentsPage;