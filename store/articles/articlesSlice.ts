import { createSlice } from '@reduxjs/toolkit';
import { 
  getArticles, 
  getArticle, 
  createArticle, 
  updateArticle, 
  deleteArticle 
} from './articlesThunk';
import { ArticlesState } from './articlesTypes';

const initialState: ArticlesState = {
  articles: [],
  currentArticle: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    pageSize: 10,
    pageCount: 0,
    total: 0,
  },
};

const articlesSlice = createSlice({
  name: 'articles',
  initialState,
  reducers: {
    clearArticles: (state) => {
      state.articles = [];
      state.currentArticle = null;
      state.error = null;
    },
    clearCurrentArticle: (state) => {
      state.currentArticle = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Get Articles
    builder.addCase(getArticles.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getArticles.fulfilled, (state, action) => {
      state.loading = false;
      state.articles = action.payload.data || [];
      state.pagination = action.payload.meta?.pagination || initialState.pagination;
    });
    builder.addCase(getArticles.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string || 'Failed to fetch articles';
    });

    // Get Single Article
    builder.addCase(getArticle.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getArticle.fulfilled, (state, action) => {
      state.loading = false;
      state.currentArticle = action.payload.data || null;
    });
    builder.addCase(getArticle.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string || 'Failed to fetch article';
    });

    // Create Article
    builder.addCase(createArticle.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createArticle.fulfilled, (state, action) => {
      state.loading = false;
      if (action.payload.data) {
        state.articles.unshift(action.payload.data);
      }
    });
    builder.addCase(createArticle.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string || 'Failed to create article';
    });

    // Update Article
    builder.addCase(updateArticle.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateArticle.fulfilled, (state, action) => {
      state.loading = false;
      if (action.payload.data) {
        const index = state.articles.findIndex(
          article => article.documentId === action.payload.data.documentId
        );
        if (index !== -1) {
          state.articles[index] = action.payload.data;
        }
        if (state.currentArticle?.documentId === action.payload.data.documentId) {
          state.currentArticle = action.payload.data;
        }
      }
    });
    builder.addCase(updateArticle.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string || 'Failed to update article';
    });

    // Delete Article
    builder.addCase(deleteArticle.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteArticle.fulfilled, (state, action) => {
      state.loading = false;
      state.articles = state.articles.filter(
        article => article.documentId !== action.payload.documentId
      );
    });
    builder.addCase(deleteArticle.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string || 'Failed to delete article';
    });
  },
});

export const { clearArticles, clearCurrentArticle, clearError } = articlesSlice.actions;
export default articlesSlice.reducer;