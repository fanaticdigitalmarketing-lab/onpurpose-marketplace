import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { listingsAPI, bookingsAPI } from '../api';
import { formatDate } from '../utils/dateUtils';
import './Dashboard.css';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [myListings, setMyListings] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      navigate('/login');
      return;
    }
    
    setUser(JSON.parse(userData));
    fetchDashboardData();
  }, [navigate]);

  const fetchDashboardData = async () => {
    try {
      const [listingsResponse, bookingsResponse] = await Promise.all([
        listingsAPI.getAll(),
        bookingsAPI.getMyBookings()
      ]);
      
      const userId = JSON.parse(localStorage.getItem('user')).id;
      const myListings = listingsResponse.data.filter(listing => listing.userId === userId);
      
      setMyListings(myListings);
      setMyBookings(bookingsResponse.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Welcome, {user?.username}!</h1>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-section">
          <h2>My Experiences</h2>
          <button 
            onClick={() => navigate('/create-listing')}
            className="create-btn"
          >
            Create Experience
          </button>
          
          {myListings.length === 0 ? (
            <p>You haven't created any listings yet.</p>
          ) : (
            <div className="listings-grid">
              {myListings.map(listing => (
                <div key={listing.id} className="listing-card">
                  <h3>{listing.title}</h3>
                  <p>{listing.description}</p>
                  <div className="listing-footer">
                    <span className="price">${listing.price}</span>
                    <span className="status">Active</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="dashboard-section">
          <h2>My Bookings</h2>
          
          {myBookings.length === 0 ? (
            <p>You haven't made any bookings yet.</p>
          ) : (
            <div className="bookings-list">
              {myBookings.map(booking => (
                <div key={booking.id} className="booking-card">
                  <h3>{booking.Listing?.title}</h3>
                  <p>From: {formatDate(booking.startDate)}</p>
                  <p>To: {formatDate(booking.endDate)}</p>
                  <span className={`status ${booking.status}`}>{booking.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
