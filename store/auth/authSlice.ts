// store/auth/authSlice.ts
import { createSlice } from '@reduxjs/toolkit';
import { login, register, getMe, logout } from './authThunk';

// Types
interface User {
  createdAt: string;
  updatedAt: string;
  id: number;
  username: string;
  email: string;
  confirmed: boolean;
  blocked: boolean;
  name?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  validationErrors: {
    email?: string;
    username?: string;
    password?: string;
    [key: string]: string | undefined;
  };
}

// Initial state
const initialState: AuthState = {
  user: null,
  token: null,
  loading: false,
  error: null,
  isAuthenticated: false,
  validationErrors: {},
};

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.validationErrors = {};
    },
    clearValidationErrors: (state) => {
      state.validationErrors = {};
    },
    // Local logout tanpa thunk
    localLogout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      state.validationErrors = {};
    },
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.validationErrors = {};
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.jwt;
        state.isAuthenticated = true;
        state.error = null;
        state.validationErrors = {};
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Login failed';
        state.validationErrors = {};
      })
      
      // Register cases
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.validationErrors = {};
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.jwt;
        state.isAuthenticated = true;
        state.error = null;
        state.validationErrors = {};
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        const errorMessage = action.payload as string || 'Registration failed';
        state.error = errorMessage;
        
        // Parse validation errors
        const validationErrors: AuthState['validationErrors'] = {};
        
        if (errorMessage.includes('Email') && errorMessage.includes('already taken')) {
          validationErrors.email = 'Email is already taken. Please use a different email.';
        }
        
        if (errorMessage.includes('Username') && errorMessage.includes('already taken')) {
          validationErrors.username = 'Username is already taken. Please choose a different username.';
        }
        
        if (errorMessage.includes('email')) {
          if (errorMessage.includes('required') || errorMessage.includes('missing')) {
            validationErrors.email = 'Email is required';
          } else if (errorMessage.includes('valid') || errorMessage.includes('format')) {
            validationErrors.email = 'Please enter a valid email address';
          }
        }
        
        if (errorMessage.includes('username')) {
          if (errorMessage.includes('required') || errorMessage.includes('missing')) {
            validationErrors.username = 'Username is required';
          } else if (errorMessage.includes('min') || errorMessage.includes('length')) {
            validationErrors.username = 'Username must be at least 3 characters long';
          }
        }
        
        if (errorMessage.includes('password')) {
          if (errorMessage.includes('required') || errorMessage.includes('missing')) {
            validationErrors.password = 'Password is required';
          } else if (errorMessage.includes('min') || errorMessage.includes('length')) {
            validationErrors.password = 'Password must be at least 6 characters long';
          }
        }
        
        state.validationErrors = validationErrors;
      })
      
      // GetMe cases
      .addCase(getMe.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMe.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(getMe.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = action.payload as string || 'Failed to fetch user';
        
        // Clear localStorage jika getMe gagal
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      })
      
      // Logout case
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
        state.validationErrors = {};
      });
  },
});

export const { clearError, clearValidationErrors, localLogout } = authSlice.actions;
export default authSlice.reducer;