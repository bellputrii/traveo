import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { 
  getCategories, 
  getCategory,
  createCategory, 
  updateCategory, 
  deleteCategory 
} from './categoriesThunk';
import { CategoriesState, Notification } from './categoriesTypes';

const initialState: CategoriesState = {
  categories: [],
  currentCategory: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    pageSize: 10,
    pageCount: 0,
    total: 0,
  },
  modals: {
    add: false,
    edit: false,
    view: false,
    delete: false,
  },
  notifications: [],
};

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    clearCategories: (state) => {
      state.categories = [];
      state.currentCategory = null;
      state.error = null;
    },
    clearCurrentCategory: (state) => {
      state.currentCategory = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    // Actions untuk mengontrol modal
    openModal: (state, action) => {
      state.modals[action.payload.modal] = true;
      if (action.payload.category) {
        state.currentCategory = action.payload.category;
      }
    },
    closeModal: (state, action) => {
      state.modals[action.payload] = false;
      if (action.payload !== 'view') {
        state.currentCategory = null;
      }
    },
    // Notification actions
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.push(action.payload);
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        notification => notification.id !== action.payload
      );
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
  },
  extraReducers: (builder) => {
    // Get Categories
    builder.addCase(getCategories.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getCategories.fulfilled, (state, action) => {
      state.loading = false;
      state.categories = action.payload.data || [];
      state.pagination = action.payload.meta?.pagination || initialState.pagination;
    });
    builder.addCase(getCategories.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string || 'Failed to fetch categories';
    });

    // Get Single Category
    builder.addCase(getCategory.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getCategory.fulfilled, (state, action) => {
      state.loading = false;
      state.currentCategory = action.payload.data || null;
    });
    builder.addCase(getCategory.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string || 'Failed to fetch category';
    });

    // Create Article - dengan notifikasi sukses
    builder.addCase(createCategory.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createCategory.fulfilled, (state, action) => {
      state.loading = false;
      if (action.payload.data) {
        state.categories.unshift(action.payload.data);
        state.modals.add = false;
      }
    });
    builder.addCase(createCategory.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string || 'Failed to create category';
    });

    // Update Article - dengan notifikasi sukses
    builder.addCase(updateCategory.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateCategory.fulfilled, (state, action) => {
      state.loading = false;
      if (action.payload.data) {
        const index = state.categories.findIndex(
          category => category.documentId === action.payload.data.documentId
        );
        if (index !== -1) {
          state.categories[index] = action.payload.data;
        }
        if (state.currentCategory?.documentId === action.payload.data.documentId) {
          state.currentCategory = action.payload.data;
        }
        state.modals.edit = false;
      }
    });
    builder.addCase(updateCategory.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string || 'Failed to update category';
    });

    // Delete Article - dengan notifikasi sukses
    builder.addCase(deleteCategory.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteCategory.fulfilled, (state, action) => {
      state.loading = false;
      state.categories = state.categories.filter(
        category => category.documentId !== action.payload.documentId
      );
      state.modals.delete = false;
    });
    builder.addCase(deleteCategory.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string || 'Failed to delete category';
    });
  },
});

export const { 
  clearCategories, 
  clearCurrentCategory, 
  clearError,
  openModal,
  closeModal,
  addNotification,
  removeNotification,
  clearNotifications
} = categoriesSlice.actions;
export default categoriesSlice.reducer;