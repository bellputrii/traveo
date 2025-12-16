import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { 
  getComments, 
  getComment,
  createComment, 
  updateComment, 
  deleteComment 
} from './commentsThunk';
import { CommentsState, Notification, Comment } from './commentsTypes';

// Tipe untuk modal
type ModalType = 'add' | 'edit' | 'view' | 'delete';

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
    openModal: (state, action: PayloadAction<{ modal: ModalType; comment?: Comment }>) => {
      state.modals[action.payload.modal] = true;
      if (action.payload.comment) {
        state.currentComment = action.payload.comment;
      }
    },
    closeModal: (state, action: PayloadAction<ModalType>) => {
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
    // ... extraReducers tetap sama
    // (kode extraReducers tidak diubah, jadi kita biarkan seperti sebelumnya)
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