import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string) => void;
  logout: () => void;
  token: string | null;
  // API helper that handles auth errors globally
  authFetch: (url: string, options?: RequestInit) => Promise<Response>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Validate token with server on initial load
  useEffect(() => {
    const validateToken = async () => {
      const storedToken = localStorage.getItem('admin_token');

      if (!storedToken) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/validate-token', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${storedToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          // Token is valid
          setToken(storedToken);
          setIsAuthenticated(true);
        } else {
          // Token is invalid or expired
          console.log('Token validation failed, clearing token');
          localStorage.removeItem('admin_token');
          setToken(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error validating token:', error);
        // On network error during startup, clear token to be safe
        localStorage.removeItem('admin_token');
        setToken(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    validateToken();
  }, []); // Run only on mount

  // Auth-aware fetch wrapper that handles 401/403 globally
  const authFetch = useCallback(async (url: string, options: RequestInit = {}) => {
    const currentToken = localStorage.getItem('admin_token');

    const headers = {
      ...options.headers,
      ...(currentToken ? { 'Authorization': `Bearer ${currentToken}` } : {}),
    };

    const response = await fetch(url, { ...options, headers });

    // Handle auth errors globally
    if (response.status === 401 || response.status === 403) {
      console.log('Auth error detected, logging out');
      localStorage.removeItem('admin_token');
      setToken(null);
      setIsAuthenticated(false);
    }

    return response;
  }, []);

  const login = (newToken: string) => {
    localStorage.setItem('admin_token', newToken);
    setToken(newToken);
    setIsAuthenticated(true);
  };

  const logout = useCallback(() => {
    localStorage.removeItem('admin_token');
    setToken(null);
    setIsAuthenticated(false);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout, token, authFetch }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
