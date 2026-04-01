import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../App';
import './Auth.css';

export default function Auth({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'customer'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const payload = isLogin 
        ? { email: formData.email, password: formData.password }
        : formData;

      console.log('Making request to:', endpoint);
      console.log('Payload:', payload);

      const response = await api.post(endpoint, payload);
      
      console.log('Response:', response.data);

      if (response.data.success || response.data.accessToken) {
        const userData = response.data.user || {
          id: response.data.id,
          name: formData.name || formData.email.split('@')[0],
          email: formData.email,
          role: formData.role
        };

        setSuccess(isLogin ? 'Welcome back!' : 'Account created successfully!');
        
        // Call login handler
        onLogin(userData, response.data.accessToken);
        
        // Navigate to dashboard
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      } else {
        setError('Authentication failed');
      }
    } catch (err) {
      console.error('Auth error:', err);
      
      let errorMessage = 'Authentication failed';
      
      if (err.response) {
        console.error('Error response:', err.response.data);
        errorMessage = err.response.data.message || 
                        err.response.data.error || 
                        err.response.data.error?.message || 
                        'Server error';
      } else if (err.request) {
        console.error('Network error details:', err);
        if (err.code === 'ECONNABORTED') {
          errorMessage = 'Request timed out. The server may be busy. Please try again.';
        } else if (err.code === 'ERR_NETWORK') {
          errorMessage = 'Network error - unable to reach the server. Please check your internet connection.';
        } else if (err.code === 'ERR_CONNECTION_REFUSED') {
          errorMessage = 'Connection refused - the server may be down. Please try again later.';
        } else {
          errorMessage = 'Unable to connect to server. Please check your connection and try again.';
        }
      } else {
        errorMessage = err.message || 'An unexpected error occurred';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <nav className="auth-nav">
          <Link to="/" className="logo">
            <div className="logo-icon bouncing">⏰</div>
            <span>OnPurpose</span>
          </Link>
        </nav>

        <div className="auth-content">
          <div className="auth-card">
            <div className="auth-header">
              <h1>{isLogin ? 'Welcome Back' : 'Create Account'}</h1>
              <p>{isLogin ? 'Sign in to your account' : 'Join OnPurpose today'}</p>
            </div>

            {error && (
              <div className="alert alert-danger">
                {error}
                {(error.includes('Network') || error.includes('timed out') || error.includes('connect')) && (
                  <button
                    type="button"
                    className="btn btn-outline btn-small"
                    onClick={handleSubmit}
                    style={{ marginTop: '10px', marginLeft: '10px' }}
                  >
                    Retry
                  </button>
                )}
              </div>
            )}

            {success && (
              <div className="alert alert-success">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              {!isLogin && (
                <div className="form-group">
                  <label htmlFor="name">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="input"
                    placeholder="Enter your full name"
                    required={!isLogin}
                  />
                </div>
              )}

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input"
                  placeholder="Enter your password"
                  required
                  minLength={8}
                />
              </div>

              {!isLogin && (
                <div className="form-group">
                  <label>I want to:</label>
                  <div className="role-toggle">
                    <button
                      type="button"
                      className={`role-btn ${formData.role === 'customer' ? 'active' : ''}`}
                      onClick={() => setFormData({...formData, role: 'customer'})}
                    >
                      Book Services
                    </button>
                    <button
                      type="button"
                      className={`role-btn ${formData.role === 'provider' ? 'active' : ''}`}
                      onClick={() => setFormData({...formData, role: 'provider'})}
                    >
                      Offer Services
                    </button>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary btn-full"
                disabled={loading}
              >
                {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
              </button>
            </form>

            <div className="auth-switch">
              <p>
                {isLogin ? "Don't have an account?" : "Already have an account?"}
                <button
                  type="button"
                  className="link-btn"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError('');
                    setSuccess('');
                  }}
                >
                  {isLogin ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            </div>

            <div className="debug-info">
              <h4>🧪 Debug Info:</h4>
              <p><strong>Mode:</strong> {isLogin ? 'Login' : 'Register'}</p>
              <p><strong>Role:</strong> {formData.role}</p>
              <p><strong>Email:</strong> {formData.email || 'Not set'}</p>
              <p><strong>API:</strong> https://ydmxe6sf.up.railway.app</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
