// types/commentsTypes.ts

export interface Comment {
  id: number;
  documentId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  locale: string | null;
  article?: number;
}

export interface Pagination {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
}

export interface CommentsResponse {
  data: Comment[];
  meta: {
    pagination: Pagination;
  };
}

export interface CommentResponse {
  data: Comment;
  meta: object;
}

export interface CreateCommentData {
  content: string;
  article?: number;
}

export interface UpdateCommentData {
  content?: string;
  article?: number;
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  duration?: number;
}

export interface CommentsState {
  comments: Comment[];
  currentComment: Comment | null;
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