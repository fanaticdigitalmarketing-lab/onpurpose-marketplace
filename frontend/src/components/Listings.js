import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { listingsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import './Listings.css';

const Listings = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      const response = await listingsAPI.getAll();
      setListings(response.data);
    } catch (err) {
      setError('Failed to fetch listings');
    } finally {
      setLoading(false);
    }
  };

  const handleBookNow = (listingId) => {
    if (!user) {
      navigate('/auth');
      return;
    }
    navigate(`/book/${listingId}`);
  };

  if (loading) {
    return <div className="loading">Loading listings...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="listings-container">
      <div className="listings-header">
        <h1>OnPurpose Services</h1>
        <p>Discover amazing experiences and services from local hosts</p>
        {user && (
          <button 
            className="create-listing-btn"
            onClick={() => navigate('/create-listing')}
          >
            Create Service
          </button>
        )}
      </div>

      <div className="listings-grid">
        {listings.length === 0 ? (
          <div className="no-listings">
            <h3>No services available yet</h3>
            <p>Be the first to offer a service!</p>
          </div>
        ) : (
          listings.map((listing) => (
            <div key={listing.id} className="listing-card">
              <div className="listing-header-info">
                <h3>{listing.title}</h3>
                <p className="host-info">
                  by {listing.User?.username || 'Unknown Host'}
                </p>
              </div>
              
              <div className="listing-description">
                <p>{listing.description}</p>
              </div>
              
              <div className="listing-footer">
                <div className="price">
                  ${listing.price}
                </div>
                <button 
                  className="book-btn"
                  onClick={() => handleBookNow(listing.id)}
                >
                  Book Now
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Listings;
