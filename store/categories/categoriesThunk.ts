/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { 
  CategoriesResponse, 
  CategoryResponse, 
  CreateCategoryData, 
  UpdateCategoryData 
} from './categoriesTypes';

// Helper untuk generate random ID
const generateId = () => Math.random().toString(36).substr(2, 9);

// Get all categories
export const getCategories = createAsyncThunk<CategoriesResponse, number | void, { rejectValue: string }>(
  'categories/getCategories',
  async (page = 1, { rejectWithValue, dispatch }) => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        return rejectWithValue('No token found');
      }

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/categories?populate=*&pagination[page]=${page}&pagination[pageSize]=100`,
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
            type: 'categories/addNotification',
            payload: {
              id: generateId(),
              type: 'success',
              title: 'Kategori Dimuat',
              message: `${response.data.data.length} kategori berhasil dimuat`,
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
          type: 'categories/addNotification',
          payload: {
            id: generateId(),
            type: 'error',
            title: 'Gagal Memuat',
            message: 'Tidak dapat memuat data kategori',
            duration: 5000,
          }
        });
      }, 500);
      
      return rejectWithValue(
        error.response?.data?.error?.message || 
        error.response?.data?.message || 
        'Failed to fetch categories'
      );
    }
  }
);

// Get single category by documentId
export const getCategory = createAsyncThunk<CategoryResponse, string, { rejectValue: string }>(
  'categories/getCategory',
  async (documentId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        return rejectWithValue('No token found');
      }

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/categories/${documentId}?populate=*`,
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
        'Failed to fetch category'
      );
    }
  }
);

// Create category
export const createCategory = createAsyncThunk<CategoryResponse, CreateCategoryData, { rejectValue: string }>(
  'categories/createCategory',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        return rejectWithValue('No token found');
      }

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/categories`,
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
          type: 'categories/addNotification',
          payload: {
            id: generateId(),
            type: 'success',
            title: 'Kategori Berhasil Dibuat',
            message: `Kategori "${data.name}" berhasil dibuat`,
            duration: 4000,
          }
        });
      }, 500);
      
      return response.data;
    } catch (error: any) {
      // Tambah notifikasi error
      setTimeout(() => {
        dispatch({
          type: 'categories/addNotification',
          payload: {
            id: generateId(),
            type: 'error',
            title: 'Gagal Membuat Kategori',
            message: error.response?.data?.error?.message || 'Tidak dapat membuat kategori',
            duration: 5000,
          }
        });
      }, 500);
      
      return rejectWithValue(
        error.response?.data?.error?.message || 
        error.response?.data?.message || 
        'Failed to create category'
      );
    }
  }
);

// Update category
export const updateCategory = createAsyncThunk<
  CategoryResponse, 
  { documentId: string; data: UpdateCategoryData }, 
  { rejectValue: string }
>(
  'categories/updateCategory',
  async ({ documentId, data }, { rejectWithValue, dispatch }) => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        return rejectWithValue('No token found');
      }

      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/categories/${documentId}`,
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
          type: 'categories/addNotification',
          payload: {
            id: generateId(),
            type: 'success',
            title: 'Perubahan Disimpan',
            message: `Kategori "${data.name}" berhasil diperbarui`,
            duration: 4000,
          }
        });
      }, 500);
      
      return response.data;
    } catch (error: any) {
      // Tambah notifikasi error
      setTimeout(() => {
        dispatch({
          type: 'categories/addNotification',
          payload: {
            id: generateId(),
            type: 'error',
            title: 'Gagal Memperbarui',
            message: error.response?.data?.error?.message || 'Tidak dapat memperbarui kategori',
            duration: 5000,
          }
        });
      }, 500);
      
      return rejectWithValue(
        error.response?.data?.error?.message || 
        error.response?.data?.message || 
        'Failed to update category'
      );
    }
  }
);

// Delete category
export const deleteCategory = createAsyncThunk<
  { documentId: string; response: any }, 
  string, 
  { rejectValue: string }
>(
  'categories/deleteCategory',
  async (documentId, { rejectWithValue, dispatch }) => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        return rejectWithValue('No token found');
      }

      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/categories/${documentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      // Tambah notifikasi sukses
      setTimeout(() => {
        dispatch({
          type: 'categories/addNotification',
          payload: {
            id: generateId(),
            type: 'success',
            title: 'Kategori Dihapus',
            message: 'Kategori berhasil dihapus',
            duration: 4000,
          }
        });
      }, 500);
      
      return { documentId, response: response.data };
    } catch (error: any) {
      // Tambah notifikasi error
      setTimeout(() => {
        dispatch({
          type: 'categories/addNotification',
          payload: {
            id: generateId(),
            type: 'error',
            title: 'Gagal Menghapus',
            message: error.response?.data?.error?.message || 'Tidak dapat menghapus kategori',
            duration: 5000,
          }
        });
      }, 500);
      
      return rejectWithValue(
        error.response?.data?.error?.message || 
        error.response?.data?.message || 
        'Failed to delete category'
      );
    }
  }
);