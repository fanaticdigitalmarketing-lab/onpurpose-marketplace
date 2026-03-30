import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { listingsAPI, bookingsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import './Booking.css';

const Booking = () => {
  const { listingId } = useParams();
  const [listing, setListing] = useState(null);
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchListing();
  }, [listingId, user, navigate]);

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
      const response = await bookingsAPI.create({
        listingId: parseInt(listingId),
        startDate: formData.startDate,
        endDate: formData.endDate
      });
      
      navigate('/my-bookings');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  if (!listing) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="booking-container">
      <div className="booking-card">
        <div className="listing-info">
          <h1>{listing.title}</h1>
          <p className="host">Hosted by {listing.User?.username}</p>
          <p className="description">{listing.description}</p>
          <div className="price">${listing.price}</div>
        </div>

        <div className="booking-form-section">
          <h2>Book This Service</h2>
          
          {error && <div className="error-message">{error}</div>}
          
          <form onSubmit={handleSubmit} className="booking-form">
            <div className="form-group">
              <label htmlFor="startDate">Start Date & Time</label>
              <input
                type="datetime-local"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="endDate">End Date & Time</label>
              <input
                type="datetime-local"
                id="endDate"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="booking-actions">
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
                {loading ? 'Booking...' : 'Book Now'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Booking;
