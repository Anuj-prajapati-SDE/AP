import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

// Set default axios base URL from Vite env (fallback to localhost)
const API_BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5000';
axios.defaults.baseURL = API_BASE_URL;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user from local storage on initial load
  useEffect(() => {
    const loadUser = () => {
      try {
        console.log('Loading user from localStorage');
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');
        
        if (storedUser && storedToken) {
          const parsedUser = JSON.parse(storedUser);
          console.log('Found stored user:', parsedUser);
          setUser(parsedUser);
          setToken(storedToken);
          
          // Set default axios authorization header
          axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        } else {
          console.log('No stored user found');
        }
      } catch (err) {
        console.error('Error loading user from localStorage:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUser();
  }, []);

  // Login function for admin
  const loginAdmin = async (email, password) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Attempting admin login with:', email);
      const response = await axios.post('/api/v1/auth/login/admin', {
        email,
        password,
      });
      
      const { user, token } = response.data;
      
      console.log('Admin login successful:', user);
      
      // Save to state
      setUser(user);
      setToken(token);
      
      // Save to local storage
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
      
      // Set default axios authorization header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      return true;
    } catch (error) {
      console.error('Admin login failed:', error.response?.data || error);
      setError(error.response?.data?.msg || 'Login failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Login function for student
  const loginStudent = async (studentId, password) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Attempting student login with ID:', studentId);
      const response = await axios.post('/api/v1/auth/login/student', {
        studentId,
        password,
      });
      
      const { user, token } = response.data;
      
      console.log('Student login successful:', user);
      
      // Save to state
      setUser(user);
      setToken(token);
      
      // Save to local storage
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
      
      // Set default axios authorization header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      return true;
    } catch (error) {
      console.error('Student login failed:', error.response?.data || error);
      setError(error.response?.data?.msg || 'Login failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    console.log('Logging out user');
    
    // Remove from state
    setUser(null);
    setToken(null);
    
    // Remove from local storage
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    
    // Remove axios authorization header
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        error,
        loginAdmin,
        loginStudent,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);