import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { listingsAPI } from '../api';
import './ViewListings.css';

const ViewListings = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      const response = await listingsAPI.getAll();
      setListings(response.data);
    } catch (error) {
      console.error('Failed to fetch listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookNow = (listingId) => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate(`/book/${listingId}`);
  };

  if (loading) {
    return <div className="loading">Loading listings...</div>;
  }

  return (
    <div className="view-listings-container">
      <div className="view-listings-header">
        <h1>Available Experiences</h1>
        <p>Discover amazing services from our providers</p>
        {user && (
          <button 
            onClick={() => navigate('/dashboard')}
            className="dashboard-btn"
          >
            Dashboard
          </button>
        )}
      </div>

      <div className="listings-grid">
        {listings.length === 0 ? (
          <div className="no-listings">
            <h3>No services available</h3>
            <p>Be the first to offer a service!</p>
          </div>
        ) : (
          listings.map(listing => (
            <div key={listing.id} className="listing-card">
              <div className="listing-info">
                <h3>{listing.title}</h3>
                <p className="host">by {listing.User?.username}</p>
                <p className="description">{listing.description}</p>
              </div>
              
              <div className="listing-footer">
                <span className="price">${listing.price}</span>
                <button 
                  onClick={() => handleBookNow(listing.id)}
                  className="book-btn"
                >
                  Request Session
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ViewListings;
