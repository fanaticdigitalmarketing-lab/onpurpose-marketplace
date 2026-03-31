import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listingsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import './CreateListing.css';

const CreateListing = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await listingsAPI.create(formData);
      navigate('/listings');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-listing-container">
      <div className="create-listing-card">
        <h1>Create Service Offering</h1>
        <p>Share your expertise and time with others</p>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="create-listing-form">
          <div className="form-group">
            <label htmlFor="title">Service Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="e.g., Local Food Tour, Photography Lesson"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="6"
              placeholder="Describe your service, what's included, and what makes it special..."
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="price">Price ($)</label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              placeholder="50.00"
            />
          </div>
          
          <div className="form-actions">
            <button 
              type="button" 
              onClick={() => navigate('/listings')}
              className="cancel-btn"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="submit-btn"
            >
              {loading ? 'Creating...' : 'Create Service'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateListing;
