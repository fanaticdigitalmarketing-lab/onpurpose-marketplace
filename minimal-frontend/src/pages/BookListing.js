import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { listingsAPI, bookingsAPI } from '../api';
import { formatDate } from '../utils/dateUtils';
import './BookListing.css';

const BookListing = () => {
  const { listingId } = useParams();
  const [listing, setListing] = useState(null);
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchListing();
  }, [listingId, navigate]);

  const fetchListing = async () => {
    try {
      const response = await listingsAPI.getById(listingId);
      setListing(response.data);
    } catch (err) {
      setError('Listing not found');
    }
  };

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
      await bookingsAPI.create({
        listingId: parseInt(listingId),
        startDate: formData.startDate,
        endDate: formData.endDate
      });
      
      navigate('/dashboard');
    } catch (err) {
      if (err.response?.status === 409) {
        const details = err.response.data.details;
        setError(
          `Already booked from ${formatDate(details.startDate)} to ${formatDate(details.endDate)}`
        );
      } else {
        setError(err.response?.data?.message || 'Failed to create booking');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!listing) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="book-listing-container">
      <div className="book-listing-card">
        <div className="listing-details">
          <h1>{listing.title}</h1>
          <p className="host">Hosted by {listing.User?.username}</p>
          <p className="description">{listing.description}</p>
          <div className="price">${listing.price}</div>
        </div>

        <div className="booking-form">
          <h2>Request Session</h2>
          
          {error && <div className="error">{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Start Date & Time</label>
              <input
                type="datetime-local"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label>End Date & Time</label>
              <input
                type="datetime-local"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                required
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
                className="book-btn"
              >
                {loading ? 'Requesting...' : 'Request Session'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookListing;
