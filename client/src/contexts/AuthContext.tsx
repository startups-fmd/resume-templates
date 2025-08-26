import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

// Types
interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  isEmailVerified: boolean;
  isOAuthUser: boolean;
  subscription: {
    plan: 'free' | 'pro' | 'enterprise';
    usage: {
      coverLetters: number;
      jobSearches: number;
      resumeAnalyses: number;
    };
  };
  lastLogin: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  refreshAuth: () => Promise<void>;
  clearError: () => void;
  updateUser: (userData: Partial<User>) => void;
  setAuthTokens: (token: string, refreshToken: string, user: User) => void;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

// Action types
type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; token: string; refreshToken: string } }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'UPDATE_USER'; payload: Partial<User> }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_AUTH_TOKENS'; payload: { user: User; token: string; refreshToken: string } };

// Initial state
const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  refreshToken: localStorage.getItem('refreshToken'),
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        refreshToken: action.payload.refreshToken,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'SET_AUTH_TOKENS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        refreshToken: action.payload.refreshToken,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// API base URL - Use backend URL for API calls
const API_BASE_URL = 'https://resume-templates-server.vercel.app/api';
console.log('API_BASE_URL:', API_BASE_URL);

// API helper function
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const fullUrl = `${API_BASE_URL}${endpoint}`;
  console.log('Making request to:', fullUrl);
  const response = await fetch(fullUrl, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
};

// Provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const { t } = useTranslation();

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        dispatch({ type: 'SET_LOADING', payload: false });
        return;
      }

      try {
        const data = await apiRequest('/auth/me');
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: {
            user: data.data.user,
            token,
            refreshToken: localStorage.getItem('refreshToken') || '',
          },
        });
      } catch (error) {
        // Token is invalid, clear it
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    checkAuth();
  }, []);

  // Update localStorage when token changes
  useEffect(() => {
    if (state.token) {
      localStorage.setItem('token', state.token);
    } else {
      localStorage.removeItem('token');
    }
  }, [state.token]);

  useEffect(() => {
    if (state.refreshToken) {
      localStorage.setItem('refreshToken', state.refreshToken);
    } else {
      localStorage.removeItem('refreshToken');
    }
  }, [state.refreshToken]);

  // Login function
  const login = async (email: string, password: string) => {
    dispatch({ type: 'AUTH_START' });

    try {
      const data = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user: data.data.user,
          token: data.data.token,
          refreshToken: data.data.refreshToken,
        },
      });

      toast.success(t('auth.loginSuccess'));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      toast.error(errorMessage);
    }
  };

  // Register function
  const register = async (userData: RegisterData) => {
    dispatch({ type: 'AUTH_START' });

    try {
      const data = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });

      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user: data.data.user,
          token: data.data.token,
          refreshToken: data.data.refreshToken,
        },
      });

      toast.success(t('auth.registerSuccess'));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      toast.error(errorMessage);
    }
  };

  // Logout function
  const logout = () => {
    // Call logout endpoint (optional)
    apiRequest('/auth/logout', { method: 'POST' }).catch(() => {
      // Ignore errors on logout
    });

    dispatch({ type: 'LOGOUT' });
    toast.success(t('auth.logoutSuccess'));
  };

  // Set auth tokens (for OAuth)
  const setAuthTokens = (token: string, refreshToken: string, user: User) => {
    dispatch({
      type: 'SET_AUTH_TOKENS',
      payload: { user, token, refreshToken },
    });
  };

  // Refresh authentication
  const refreshAuth = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      dispatch({ type: 'LOGOUT' });
      return;
    }

    try {
      const data = await apiRequest('/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      });

      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user: state.user!,
          token: data.data.token,
          refreshToken: data.data.refreshToken,
        },
      });
    } catch (error) {
      dispatch({ type: 'LOGOUT' });
    }
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Update user data
  const updateUser = (userData: Partial<User>) => {
    dispatch({ type: 'UPDATE_USER', payload: userData });
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    refreshAuth,
    clearError,
    updateUser,
    setAuthTokens,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
