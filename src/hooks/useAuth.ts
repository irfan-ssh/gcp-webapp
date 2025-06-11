import { useState, useEffect } from 'react';
import { User, AuthState } from '../types';
import { authService } from '../services/authService';

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    sessionId: null,
    loading: true
  });

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      // Check URL params for session
      const urlParams = new URLSearchParams(window.location.search);
      const session = urlParams.get('session');
      const authenticated = urlParams.get('authenticated');
      
      if (session && authenticated) {
        localStorage.setItem('sessionId', session);
        window.history.replaceState({}, document.title, window.location.pathname);
        await validateSession(session);
      } else {
        // Check for existing session
        const savedSession = localStorage.getItem('sessionId');
        if (savedSession) {
          await validateSession(savedSession);
        } else {
          setAuthState(prev => ({ ...prev, loading: false }));
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      setAuthState(prev => ({ ...prev, loading: false }));
    }
  };

  const validateSession = async (sessionId: string) => {
    try {
      const user = await authService.getUser(sessionId);
      setAuthState({
        isAuthenticated: true,
        user,
        sessionId,
        loading: false
      });
    } catch (error) {
      console.error('Session validation failed:', error);
      localStorage.removeItem('sessionId');
      setAuthState({
        isAuthenticated: false,
        user: null,
        sessionId: null,
        loading: false
      });
    }
  };

  const login = async () => {
    try {
      const authUrl = await authService.getAuthUrl();
      window.location.href = authUrl;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (authState.sessionId) {
        await authService.logout(authState.sessionId);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('sessionId');
      setAuthState({
        isAuthenticated: false,
        user: null,
        sessionId: null,
        loading: false
      });
    }
  };

  return {
    ...authState,
    login,
    logout
  };
};