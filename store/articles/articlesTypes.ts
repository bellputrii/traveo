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
  description: string;
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

export interface CreateArticleData {
  title: string;
  description: string;
  cover_image_url: string;
  category?: number;
}

export interface UpdateArticleData {
  title?: string;
  description?: string;
  cover_image_url?: string;
  category?: number;
}

export interface ArticlesState {
  articles: Article[];
  currentArticle: Article | null;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    pageSize: number;
    pageCount: number;
    total: number;
  };
}

// articlesTypes.ts
export interface Category {
  id: number;
  documentId: string;
  name: string;
  description: string;
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

// Update ArticlesState untuk menambahkan categories
export interface ArticlesState {
  articles: Article[];
  currentArticle: Article | null;
  categories: Category[]; // Tambahkan ini
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    pageSize: number;
    pageCount: number;
    total: number;
  };
}

// Update CreateArticleData dan UpdateArticleData
export interface CreateArticleData {
  title: string;
  description: string;
  cover_image_url: string;
  category?: string; // Ubah dari number ke string (documentId)
}

export interface UpdateArticleData {
  title?: string;
  description?: string;
  cover_image_url?: string;
  category?: string; // Ubah dari number ke string (documentId)
}