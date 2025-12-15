// store/slices/commentsSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { 
  getComments, 
  getComment,
  createComment, 
  updateComment, 
  deleteComment 
} from './commentsThunk';
import { CommentsState, Notification } from './commentsTypes';

const initialState: CommentsState = {
  comments: [],
  currentComment: null,
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

const commentsSlice = createSlice({
  name: 'comments',
  initialState,
  reducers: {
    clearComments: (state) => {
      state.comments = [];
      state.currentComment = null;
      state.error = null;
    },
    clearCurrentComment: (state) => {
      state.currentComment = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    // Actions untuk mengontrol modal
    openModal: (state, action) => {
      state.modals[action.payload.modal] = true;
      if (action.payload.comment) {
        state.currentComment = action.payload.comment;
      }
    },
    closeModal: (state, action) => {
      state.modals[action.payload] = false;
      if (action.payload !== 'view') {
        state.currentComment = null;
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
    // Get Comments
    builder.addCase(getComments.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getComments.fulfilled, (state, action) => {
      state.loading = false;
      state.comments = action.payload.data || [];
      state.pagination = action.payload.meta?.pagination || initialState.pagination;
    });
    builder.addCase(getComments.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string || 'Failed to fetch comments';
    });

    // Get Single Comment
    builder.addCase(getComment.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getComment.fulfilled, (state, action) => {
      state.loading = false;
      state.currentComment = action.payload.data || null;
    });
    builder.addCase(getComment.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string || 'Failed to fetch comment';
    });

    // Create Comment
    builder.addCase(createComment.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createComment.fulfilled, (state, action) => {
      state.loading = false;
      if (action.payload.data) {
        state.comments.unshift(action.payload.data);
        state.modals.add = false;
      }
    });
    builder.addCase(createComment.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string || 'Failed to create comment';
    });

    // Update Comment
    builder.addCase(updateComment.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateComment.fulfilled, (state, action) => {
      state.loading = false;
      if (action.payload.data) {
        const index = state.comments.findIndex(
          comment => comment.documentId === action.payload.data.documentId
        );
        if (index !== -1) {
          state.comments[index] = action.payload.data;
        }
        if (state.currentComment?.documentId === action.payload.data.documentId) {
          state.currentComment = action.payload.data;
        }
        state.modals.edit = false;
      }
    });
    builder.addCase(updateComment.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string || 'Failed to update comment';
    });

     // Delete Comment
     builder.addCase(deleteComment.pending, (state) => {
     state.loading = true;
     state.error = null;
     });
     builder.addCase(deleteComment.fulfilled, (state, action) => {
     state.loading = false;
     state.comments = state.comments.filter(
     comment => comment.documentId !== action.payload.documentId
     );
     state.modals.delete = false;
     });
     builder.addCase(deleteComment.rejected, (state, action) => {
     state.loading = false;
     state.error = action.payload as string || 'Failed to delete comment';
     });
  },
});

export const { 
  clearComments, 
  clearCurrentComment, 
  clearError,
  openModal,
  closeModal,
  addNotification,
  removeNotification,
  clearNotifications
} = commentsSlice.actions;
export default commentsSlice.reducer;