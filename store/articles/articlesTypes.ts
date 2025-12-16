/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */

export interface ArticleUser {
  id: number;
  documentId: string;
  username: string;
  email: string;
  provider: string;
  confirmed: boolean;
  blocked: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  locale: string | null;
}

export interface ArticleCategory {
  id: number;
  documentId: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  locale: string | null;
}

export interface ArticleComment {
  id: number;
  documentId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  locale: string | null;
}

export interface Article {
  id: number;
  documentId: string;
  secretId: string; // Tambahkan ini
  title: string;
  description: string;
  cover_image_url: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  locale: string | null;
  user: ArticleUser;
  category: ArticleCategory | null;
  comments: ArticleComment[];
  localizations: any[];
}

export interface ArticlesResponse {
  data: Article[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface ArticleResponse {
  data: Article;
  meta: object;
}

export interface Category {
  id: number;
  documentId: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  locale: string | null;
}

export interface CategoriesResponse {
  data: Category[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface CategoryResponse {
  data: Category;
  meta: object;
}

export interface ArticlesState {
  articles: Article[];
  currentArticle: Article | null;
  categories: Category[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    pageSize: number;
    pageCount: number;
    total: number;
  };
}

// Untuk membuat artikel baru - category adalah documentId (string)
export interface CreateArticleData {
  title: string;
  description: string;
  cover_image_url: string;
  category?: string; // documentId dari category
  secretId?: string; // Optional, bisa di-generate otomatis
}

// Untuk update artikel - category adalah documentId (string)
export interface UpdateArticleData {
  title?: string;
  description?: string;
  cover_image_url?: string;
  category?: string; // documentId dari category
  secretId?: string; // Optional untuk update
}

export interface CreateCategoryData {
  name: string;
  description?: string;
}

export interface UpdateCategoryData {
  name?: string;
  description?: string | null;
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  duration?: number;
}

export interface CategoriesState {
  categories: Category[];
  currentCategory: Category | null;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    pageSize: number;
    pageCount: number;
    total: number;
  };
  modals: {
    add: boolean;
    edit: boolean;
    view: boolean;
    delete: boolean;
  };
  notifications: Notification[];
}