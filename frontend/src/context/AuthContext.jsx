import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('skillbridge_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('skillbridge_token');
      if (storedToken) {
        try {
          const res = await authApi.getCurrentUser();
          if (res.success && res.data) {
            setUser(res.data);
            localStorage.setItem('skillbridge_user', JSON.stringify(res.data));
          } else {
            logout();
          }
        } catch (err) {
          console.warn('Session expired or server unavailable:', err.message);
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    if (res.success && res.data) {
      const { token: jwtToken, id, fullName, email: userEmail, role } = res.data;
      localStorage.setItem('skillbridge_token', jwtToken);
      setToken(jwtToken);
      const userObj = { id, fullName, email: userEmail, role };
      setUser(userObj);
      localStorage.setItem('skillbridge_user', JSON.stringify(userObj));
      return userObj;
    }
    throw new Error(res.message || 'Login failed');
  };

  const register = async (userData) => {
    const res = await authApi.register(userData);
    if (res.success && res.data) {
      const { token: jwtToken, id, fullName, email: userEmail, role } = res.data;
      localStorage.setItem('skillbridge_token', jwtToken);
      setToken(jwtToken);
      const userObj = { id, fullName, email: userEmail, role };
      setUser(userObj);
      localStorage.setItem('skillbridge_user', JSON.stringify(userObj));
      return userObj;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const logout = () => {
    localStorage.removeItem('skillbridge_token');
    localStorage.removeItem('skillbridge_user');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const res = await authApi.getCurrentUser();
      if (res.success && res.data) {
        setUser(res.data);
        localStorage.setItem('skillbridge_user', JSON.stringify(res.data));
      }
    } catch (e) {
      console.error('Failed to refresh user:', e);
    }
  };

  const isAuthenticated = !!token && !!user;
  const isAdmin = user?.role === 'ROLE_ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        isAdmin,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
