import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import Home from './components/Home';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import './App.css';

// API Configuration
const API_URL = 'https://a2af4a45-7022-4638-8f12-9076c7f94464.up.railway.app/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: { 
    'Content-Type': 'application/json'
  },
  timeout: 30000,
  withCredentials: false,
});

// Add request interceptor to include auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('op_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export { api };

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Detect mobile device
    const detectMobile = () => {
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                            window.innerWidth < 768;
      setIsMobile(isMobileDevice);
    };

    // Check authentication status
    const checkAuth = () => {
      const token = localStorage.getItem('op_token');
      const userData = localStorage.getItem('op_user');
      
      if (token && userData) {
        try {
          setUser(JSON.parse(userData));
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Error parsing user data:', error);
          localStorage.removeItem('op_token');
          localStorage.removeItem('op_user');
        }
      }
      setLoading(false);
    };

    detectMobile();
    checkAuth();

    // Listen for resize events
    window.addEventListener('resize', detectMobile);
    return () => window.removeEventListener('resize', detectMobile);
  }, []);

  const handleLogin = (userData, token) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('op_token', token);
    localStorage.setItem('op_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('op_token');
    localStorage.removeItem('op_user');
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="logo-icon bouncing">⏰</div>
          <h2>Loading OnPurpose...</h2>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className={`app ${isMobile ? 'mobile' : 'desktop'}`}>
        <div className="platform-indicator">
          <span className="platform-badge">
            {isMobile ? '📱 Mobile' : '🌐 Web'}
          </span>
        </div>
        
        <Routes>
          <Route 
            path="/" 
            element={
              isAuthenticated ? 
              <Navigate to="/dashboard" /> : 
              <Home />
            } 
          />
          <Route 
            path="/auth" 
            element={
              isAuthenticated ? 
              <Navigate to="/dashboard" /> : 
              <Auth onLogin={handleLogin} />
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              isAuthenticated ? 
              <Dashboard user={user} onLogout={handleLogout} /> : 
              <Navigate to="/auth" />
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
