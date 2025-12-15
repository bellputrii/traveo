/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { 
  ArticlesResponse, 
  ArticleResponse, 
  CreateArticleData, 
  UpdateArticleData,
  CategoriesResponse,
} from '../articles/articlesTypes';


// Get categories
export const getCategories = createAsyncThunk<CategoriesResponse, void, { rejectValue: string }>(
  'articles/getCategories',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        return rejectWithValue('No token found');
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
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        return rejectWithValue('No token found');
      }

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/articles?populate=*&pagination[page]=${page}&pagination[pageSize]=10`,
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
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        return rejectWithValue('No token found');
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

// Create article
export const createArticle = createAsyncThunk<ArticleResponse, CreateArticleData, { rejectValue: string }>(
  'articles/createArticle',
  async (data, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        return rejectWithValue('No token found');
      }

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/articles`,
        { data },
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

// Update article
export const updateArticle = createAsyncThunk<
  ArticleResponse, 
  { documentId: string; data: UpdateArticleData }, 
  { rejectValue: string }
>(
  'articles/updateArticle',
  async ({ documentId, data }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        return rejectWithValue('No token found');
      }

      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/articles/${documentId}`,
        { data },
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

// Delete article
// Delete article - Fixed version
export const deleteArticle = createAsyncThunk<
  { documentId: string; success: boolean }, 
  string, 
  { rejectValue: string }
>(
  'articles/deleteArticle',
  async (documentId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        return rejectWithValue('No token found');
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
      
      // Return simple object
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