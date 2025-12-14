import { User } from '../store/auth/authTypes';

export const setAuthToken = (token: string) => {
  localStorage.setItem('token', token);
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

export const removeAuthToken = () => {
  localStorage.removeItem('token');
};

export const setUserData = (user: User) => {
  localStorage.setItem('user', JSON.stringify(user));
};

export const getUserData = (): User | null => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

export const removeUserData = () => {
  localStorage.removeItem('user');
};

export const isAuthenticated = (): boolean => {
  const token = getAuthToken();
  return !!token;
};

export const clearAuthData = () => {
  removeAuthToken();
  removeUserData();
};