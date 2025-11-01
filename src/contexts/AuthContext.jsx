import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api.js';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('=== AUTH CONTEXT INITIALIZATION ===');
    // Check if user is already logged in
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    
    console.log('Token exists:', !!token);
    console.log('UserData exists:', !!userData);
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        console.log('Parsed user data:', parsedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
        console.log('User restored from localStorage');
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
      }
    }
    
    setIsLoading(false);
    console.log('AuthContext initialization complete');
  }, []);

  const login = async (credentials) => {
    try {
      console.log('=== AUTH CONTEXT LOGIN ===');
      console.log('Credentials:', credentials);
      
      const response = await authAPI.login(credentials);
      
      console.log('=== AUTH API RESPONSE ===');
      console.log('Response:', response);
      
      if (response.success) {
        // Store the enhanced user object with additional fields
        const userData = {
          id: response.user.id,
          userId: response.user.userId, // Reference to users table
          username: response.user.username,
          role: response.user.role,
          name: response.user.name,
          email: response.user.email
        };
        
        console.log('=== USER DATA TO STORE ===');
        console.log('UserData:', userData);
        
        setUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('userData', JSON.stringify(userData));
        
        console.log('Login successful in AuthContext');
        return { success: true, user: userData };
      } else {
        console.log('Login failed in AuthContext:', response.message);
        return { success: false, error: response.message || 'Login failed' };
      }
    } catch (error) {
      console.log('=== AUTH CONTEXT ERROR ===');
      console.error('Login error:', error);
      return { success: false, error: error.message || 'Login failed' };
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
    }
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};