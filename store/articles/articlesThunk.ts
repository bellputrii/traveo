/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { 
  ArticlesResponse, 
  ArticleResponse, 
  CreateArticleData, 
  UpdateArticleData,
  CategoriesResponse,
} from '../articles/articlesTypes';

// Generate secretId untuk artikel baru
const generateSecretId = (): string => {
  return uuidv4();
};

// Helper untuk mendapatkan token dari localStorage
const getToken = (): string | null => {
  return localStorage.getItem('token') || sessionStorage.getItem('token');
};

// Upload image ke API upload khusus
export const uploadImage = async (file: File): Promise<string> => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('No token found. Please login first.');
    }

    const formData = new FormData();
    formData.append('files', file);
    
    const response = await fetch("https://extra-brooke-yeremiadio-46b2183e.koyeb.app/api/upload", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Upload failed');
    }
    
    const result = await response.json();
    console.log('Upload result:', result);
    
    // Asumsi API mengembalikan array of objects dengan url
    if (result && result.length > 0 && result[0].url) {
      return result[0].url;
    }
    
    throw new Error('Invalid response format');
  } catch (error: any) {
    console.error('Upload error:', error);
    throw new Error(error.message || 'Failed to upload image');
  }
};

// Get categories
export const getCategories = createAsyncThunk<CategoriesResponse, void, { rejectValue: string }>(
  'articles/getCategories',
  async (_, { rejectWithValue }) => {
    try {
      const token = getToken();
      if (!token) {
        return rejectWithValue('No token found. Please login first.');
      }

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/categories?populate=*`,
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
        'Failed to fetch categories'
      );
    }
  }
);

// Get all articles
export const getArticles = createAsyncThunk<ArticlesResponse, number | void, { rejectValue: string }>(
  'articles/getArticles',
  async (page = 1, { rejectWithValue }) => {
    try {
      const token = getToken();
      if (!token) {
        return rejectWithValue('No token found. Please login first.');
      }

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/articles?populate=*&pagination[page]=${page}&pagination[pageSize]=10`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      // Tambahkan secretId untuk artikel yang belum memilikinya
      const articlesWithSecretId = {
        ...response.data,
        data: response.data.data.map((article: any) => ({
          ...article,
          // Jika artikel sudah punya secretId, gunakan yang ada, jika tidak generate baru
          secretId: article.secretId || generateSecretId()
        }))
      };
      
      return articlesWithSecretId;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error?.message || 
        error.response?.data?.message || 
        'Failed to fetch articles'
      );
    }
  }
);

// Get single article by documentId
export const getArticle = createAsyncThunk<ArticleResponse, string, { rejectValue: string }>(
  'articles/getArticle',
  async (documentId, { rejectWithValue }) => {
    try {
      const token = getToken();
      if (!token) {
        return rejectWithValue('No token found. Please login first.');
      }

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/articles/${documentId}?populate=*`,
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
        'Failed to fetch article'
      );
    }
  }
);

// Get article by secretId
export const getArticleBySecretId = createAsyncThunk<ArticleResponse, string, { rejectValue: string }>(
  'articles/getArticleBySecretId',
  async (secretId, { rejectWithValue }) => {
    try {
      const token = getToken();
      if (!token) {
        return rejectWithValue('No token found. Please login first.');
      }

      // Query Strapi untuk mencari artikel berdasarkan secretId
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/articles?filters[secretId][$eq]=${secretId}&populate=*`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      if (!response.data.data || response.data.data.length === 0) {
        return rejectWithValue('Article not found');
      }
      
      // Return artikel pertama yang ditemukan
      return {
        data: response.data.data[0],
        meta: response.data.meta
      };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error?.message || 
        error.response?.data?.message || 
        'Failed to fetch article'
      );
    }
  }
);

// Create article dengan secretId dan upload gambar
export const createArticle = createAsyncThunk<ArticleResponse, { data: CreateArticleData; imageFile?: File }, { rejectValue: string }>(
  'articles/createArticle',
  async ({ data, imageFile }, { rejectWithValue }) => {
    try {
      const token = getToken();
      if (!token) {
        return rejectWithValue('No token found. Please login first.');
      }

      let imageUrl = data.cover_image_url;
      
      // Upload gambar jika ada file
      if (imageFile) {
        try {
          imageUrl = await uploadImage(imageFile);
          console.log('Image uploaded successfully:', imageUrl);
        } catch (uploadError: any) {
          return rejectWithValue(`Failed to upload image: ${uploadError.message}`);
        }
      }

      // Generate secretId untuk artikel baru
      const secretId = generateSecretId();
      
      // Siapkan data artikel dengan URL gambar yang sudah diupload
      const dataWithSecretId: CreateArticleData = {
        ...data,
        secretId: secretId,
        cover_image_url: imageUrl
      };

      // Kirim data artikel ke API
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/articles`,
        { data: dataWithSecretId },
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
        'Failed to create article'
      );
    }
  }
);

// Update article dengan upload gambar
export const updateArticle = createAsyncThunk<
  ArticleResponse, 
  { documentId: string; data: UpdateArticleData; imageFile?: File }, 
  { rejectValue: string }
>(
  'articles/updateArticle',
  async ({ documentId, data, imageFile }, { rejectWithValue }) => {
    try {
      const token = getToken();
      if (!token) {
        return rejectWithValue('No token found. Please login first.');
      }

      let imageUrl = data.cover_image_url;
      
      // Upload gambar baru jika ada
      if (imageFile) {
        try {
          imageUrl = await uploadImage(imageFile);
          console.log('Image uploaded successfully:', imageUrl);
        } catch (uploadError: any) {
          return rejectWithValue(`Failed to upload image: ${uploadError.message}`);
        }
      }

      // Siapkan data update dengan gambar baru
      const dataWithSecretId = {
        ...data,
        cover_image_url: imageUrl,
        // Hanya tambahkan secretId jika belum ada di data
        secretId: (data as any).secretId || generateSecretId()
      };

      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/articles/${documentId}`,
        { data: dataWithSecretId },
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
        'Failed to update article'
      );
    }
  }
);

// Update article by secretId dengan upload gambar
export const updateArticleBySecretId = createAsyncThunk<
  ArticleResponse, 
  { secretId: string; data: UpdateArticleData; imageFile?: File }, 
  { rejectValue: string }
>(
  'articles/updateArticleBySecretId',
  async ({ secretId, data, imageFile }, { rejectWithValue }) => {
    try {
      const token = getToken();
      if (!token) {
        return rejectWithValue('No token found. Please login first.');
      }

      let imageUrl = data.cover_image_url;
      
      // Upload gambar baru jika ada
      if (imageFile) {
        try {
          imageUrl = await uploadImage(imageFile);
          console.log('Image uploaded successfully:', imageUrl);
        } catch (uploadError: any) {
          return rejectWithValue(`Failed to upload image: ${uploadError.message}`);
        }
      }

      // Pertama, cari artikel berdasarkan secretId untuk mendapatkan documentId
      const searchResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/articles?filters[secretId][$eq]=${secretId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      if (!searchResponse.data.data || searchResponse.data.data.length === 0) {
        return rejectWithValue('Article not found');
      }
      
      const article = searchResponse.data.data[0];
      const documentId = article.id;
      
      // Siapkan data update dengan gambar baru
      const updatedData = {
        ...data,
        cover_image_url: imageUrl
      };
      
      // Kemudian update artikel dengan documentId yang ditemukan
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/articles/${documentId}`,
        { data: updatedData },
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
        'Failed to update article'
      );
    }
  }
);

// Delete article by secretId
export const deleteArticleBySecretId = createAsyncThunk<
  { secretId: string; success: boolean }, 
  string, 
  { rejectValue: string }
>(
  'articles/deleteArticleBySecretId',
  async (secretId, { rejectWithValue }) => {
    try {
      const token = getToken();
      if (!token) {
        return rejectWithValue('No token found. Please login first.');
      }

      // Pertama, cari artikel berdasarkan secretId untuk mendapatkan documentId
      const searchResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/articles?filters[secretId][$eq]=${secretId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      if (!searchResponse.data.data || searchResponse.data.data.length === 0) {
        return rejectWithValue('Article not found');
      }
      
      const article = searchResponse.data.data[0];
      const documentId = article.id;
      
      // Kemudian hapus artikel dengan documentId yang ditemukan
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/articles/${documentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      console.log('Delete article with secretId:', secretId);
      
      return { 
        secretId, 
        success: true 
      };
    } catch (error: any) {
      console.error('Delete API error:', error.response || error);
      return rejectWithValue(
        error.response?.data?.error?.message || 
        error.response?.data?.message || 
        'Failed to delete article'
      );
    }
  }
);

// Delete article by documentId (tetap dipertahankan untuk kompatibilitas)
export const deleteArticle = createAsyncThunk<
  { documentId: string; success: boolean }, 
  string, 
  { rejectValue: string }
>(
  'articles/deleteArticle',
  async (documentId, { rejectWithValue }) => {
    try {
      const token = getToken();
      if (!token) {
        return rejectWithValue('No token found. Please login first.');
      }

      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/articles/${documentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      console.log('Delete API response:', response.data);
      
      return { 
        documentId, 
        success: true 
      };
    } catch (error: any) {
      console.error('Delete API error:', error.response || error);
      return rejectWithValue(
        error.response?.data?.error?.message || 
        error.response?.data?.message || 
        'Failed to delete article'
      );
    }
  }
);