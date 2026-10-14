import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('campus_voice_token') || null);
  const [loading, setLoading] = useState(() => !!localStorage.getItem('campus_voice_token'));

  const logout = useCallback(() => {
    localStorage.removeItem('campus_voice_token');
    setToken(null);
    setUser(null);
    setLoading(false);
  }, []);

  useEffect(() => {
    async function loadUser() {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.getMe();
        if (res.success && res.user) {
          setUser(res.user);
        } else {
          logout();
        }
      } catch (err) {
        console.warn('Auth token expired or invalid:', err.message);
        logout();
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, [token, logout]);

  // Listen for 401 unauthorized signals from api service
  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
    };
    window.addEventListener('campus_voice_unauthorized', handleUnauthorized);
    return () => window.removeEventListener('campus_voice_unauthorized', handleUnauthorized);
  }, [logout]);

  const login = async (email, password) => {
    const res = await api.login({ email, password });
    if (res.success) {
      localStorage.setItem('campus_voice_token', res.token);
      setToken(res.token);
      setUser(res.user);
      setLoading(false);
      return res.user;
    }
    throw new Error(res.message || 'Login failed');
  };

  const register = async (userData) => {
    const res = await api.register(userData);
    if (res.success) {
      localStorage.setItem('campus_voice_token', res.token);
      setToken(res.token);
      setUser(res.user);
      setLoading(false);
      return res.user;
    }
    throw new Error(res.message || 'Registration failed');
  };

  // One-click demo role switcher for frictionless testing and evaluation
  const quickSwitch = async (role) => {
    const roleEmails = {
      student: 'student@campus.edu',
      moderator: 'moderator@campus.edu',
      admin: 'admin@campus.edu',
    };
    const targetEmail = roleEmails[role] || 'student@campus.edu';
    return await login(targetEmail, 'Password123!');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        quickSwitch,
        isAuthenticated: !!user && !!token,
        isStudent: user?.role === 'student',
        isModerator: user?.role === 'moderator' || user?.role === 'admin',
        isAdmin: user?.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
