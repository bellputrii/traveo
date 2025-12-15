import { configureStore } from '@reduxjs/toolkit';
import authReducer from './auth/authSlice';
import articlesReducer from './articles/articlesSlice';
import categoriesReducer from './categories/categoriesSlice';
import commentsReducer from './comments/commentsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    articles: articlesReducer,
    categories: categoriesReducer,
    comments: commentsReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;