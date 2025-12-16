/* eslint-disable @typescript-eslint/no-explicit-any */
// store/thunks/commentsThunk.ts
import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { 
  CommentsResponse, 
  CommentResponse, 
  CreateCommentData, 
  UpdateCommentData 
} from './commentsTypes';

// Helper untuk generate random ID
const generateId = () => Math.random().toString(36).substr(2, 9);

// Get all comments
export const getComments = createAsyncThunk<CommentsResponse, number | void, { rejectValue: string }>(
  'comments/getComments',
  async (page = 1, { rejectWithValue, dispatch }) => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        return rejectWithValue('No token found');
      }

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/comments?pagination[page]=${page}&pagination[pageSize]=25`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      // Tambah notifikasi jika berhasil
      if (response.data.data?.length > 0) {
        setTimeout(() => {
          dispatch({
            type: 'comments/addNotification',
            payload: {
              id: generateId(),
              type: 'success',
              title: 'Komentar Dimuat',
              message: `${response.data.data.length} komentar berhasil dimuat`,
              duration: 3000,
            }
          });
        }, 500);
      }
      
      return response.data;
    } catch (error: any) {
      // Tambah notifikasi error
      setTimeout(() => {
        dispatch({
          type: 'comments/addNotification',
          payload: {
            id: generateId(),
            type: 'error',
            title: 'Gagal Memuat',
            message: 'Tidak dapat memuat data komentar',
            duration: 5000,
          }
        });
      }, 500);
      
      return rejectWithValue(
        error.response?.data?.error?.message || 
        error.response?.data?.message || 
        'Failed to fetch comments'
      );
    }
  }
);

// Get single comment by documentId
export const getComment = createAsyncThunk<CommentResponse, string, { rejectValue: string }>(
  'comments/getComment',
  async (documentId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        return rejectWithValue('No token found');
      }

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/comments/${documentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error?.message || 
        error.response?.data?.message || 
        'Failed to fetch comment'
      );
    }
  }
);

// Create comment
export const createComment = createAsyncThunk<CommentResponse, CreateCommentData, { rejectValue: string }>(
  'comments/createComment',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        return rejectWithValue('No token found');
      }

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/comments`,
        { data },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      // Tambah notifikasi sukses
      setTimeout(() => {
        dispatch({
          type: 'comments/addNotification',
          payload: {
            id: generateId(),
            type: 'success',
            title: 'Komentar Berhasil Dibuat',
            message: 'Komentar berhasil dibuat',
            duration: 4000,
          }
        });
      }, 500);
      
      return response.data;
    } catch (error: any) {
      // Tambah notifikasi error
      setTimeout(() => {
        dispatch({
          type: 'comments/addNotification',
          payload: {
            id: generateId(),
            type: 'error',
            title: 'Gagal Membuat Komentar',
            message: error.response?.data?.error?.message || 'Tidak dapat membuat komentar',
            duration: 5000,
          }
        });
      }, 500);
      
      return rejectWithValue(
        error.response?.data?.error?.message || 
        error.response?.data?.message || 
        'Failed to create comment'
      );
    }
  }
);

// Update comment
export const updateComment = createAsyncThunk<
  CommentResponse, 
  { documentId: string; data: UpdateCommentData }, 
  { rejectValue: string }
>(
  'comments/updateComment',
  async ({ documentId, data }, { rejectWithValue, dispatch }) => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        return rejectWithValue('No token found');
      }

      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/comments/${documentId}`,
        { data },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      // Tambah notifikasi sukses
      setTimeout(() => {
        dispatch({
          type: 'comments/addNotification',
          payload: {
            id: generateId(),
            type: 'success',
            title: 'Perubahan Disimpan',
            message: 'Komentar berhasil diperbarui',
            duration: 4000,
          }
        });
      }, 500);
      
      return response.data;
    } catch (error: any) {
      // Tambah notifikasi error
      setTimeout(() => {
        dispatch({
          type: 'comments/addNotification',
          payload: {
            id: generateId(),
            type: 'error',
            title: 'Gagal Memperbarui',
            message: error.response?.data?.error?.message || 'Tidak dapat memperbarui komentar',
            duration: 5000,
          }
        });
      }, 500);
      
      return rejectWithValue(
        error.response?.data?.error?.message || 
        error.response?.data?.message || 
        'Failed to update comment'
      );
    }
  }
);

// Delete comment
export const deleteComment = createAsyncThunk<
  { documentId: string; success: boolean }, 
  string, 
  { rejectValue: string }
>(
  'comments/deleteComment',
  async (documentId, { rejectWithValue, dispatch }) => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        return rejectWithValue('No token found');
      }

      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/comments/${documentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      console.log('Delete Comment API response:', response.data);
      
      // Tambah notifikasi sukses
      setTimeout(() => {
        dispatch({
          type: 'comments/addNotification',
          payload: {
            id: generateId(),
            type: 'success',
            title: 'Komentar Dihapus',
            message: 'Komentar berhasil dihapus',
            duration: 4000,
          }
        });
      }, 500);
      
      // Return simple object
      return { 
        documentId, 
        success: true 
      };
    } catch (error: any) {
      console.error('Delete Comment API error:', error.response || error);
      
      // Tambah notifikasi error
      setTimeout(() => {
        dispatch({
          type: 'comments/addNotification',
          payload: {
            id: generateId(),
            type: 'error',
            title: 'Gagal Menghapus',
            message: error.response?.data?.error?.message || 'Tidak dapat menghapus komentar',
            duration: 5000,
          }
        });
      }, 500);
      
      return rejectWithValue(
        error.response?.data?.error?.message || 
        error.response?.data?.message || 
        'Failed to delete comment'
      );
    }
  }
);