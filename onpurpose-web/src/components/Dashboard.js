import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../App';
import './Dashboard.css';

export default function Dashboard({ user, onLogout }) {
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('services');
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load services
      const servicesResponse = await api.get('/services');
      setServices(servicesResponse.data.data || []);

      // Load user bookings
      const bookingsResponse = await api.get('/bookings/my-bookings');
      setBookings(bookingsResponse.data.data || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  const handleBooking = async (serviceId) => {
    try {
      const response = await api.post('/bookings', {
        serviceId,
        date: new Date().toISOString().split('T')[0],
        time: '10:00'
      });
      
      if (response.data.success) {
        alert('Booking created successfully!');
        loadData(); // Reload bookings
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Failed to create booking');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="logo-icon">⏰</div>
          <h2>Loading Dashboard...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <nav className="navbar">
        <div className="container">
          <Link to="/" className="logo">
            <div className="logo-icon bouncing">⏰</div>
            <span>OnPurpose</span>
          </Link>
          
          <div className="navbar-actions">
            <span className="user-info">
              Welcome, {user?.name?.split(' ')[0] || user?.email}
            </span>
            <button onClick={handleLogout} className="btn btn-outline">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="dashboard-content">
        <div className="container">
          <div className="dashboard-header">
            <h1>Dashboard</h1>
            <div className="user-stats">
              <div className="stat-card">
                <span className="stat-number">{services.length}</span>
                <span className="stat-label">Services</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">{bookings.length}</span>
                <span className="stat-label">Bookings</span>
              </div>
            </div>
          </div>

          <div className="dashboard-tabs">
            <button
              className={`tab-btn ${activeTab === 'services' ? 'active' : ''}`}
              onClick={() => setActiveTab('services')}
            >
              Browse Services
            </button>
            <button
              className={`tab-btn ${activeTab === 'bookings' ? 'active' : ''}`}
              onClick={() => setActiveTab('bookings')}
            >
              My Bookings
            </button>
            {user?.role === 'provider' && (
              <button
                className={`tab-btn ${activeTab === 'provider' ? 'active' : ''}`}
                onClick={() => setActiveTab('provider')}
              >
                Provider Dashboard
              </button>
            )}
          </div>

          <div className="dashboard-body">
            {activeTab === 'services' && (
              <div className="services-grid">
                {services.length > 0 ? (
                  services.map((service) => (
                    <div key={service.id} className="service-card">
                      <div className="service-header">
                        <span className="service-category">{service.category}</span>
                        {service.isOnline && <span className="online-badge">Online</span>}
                      </div>
                      <h3 className="service-title">{service.title}</h3>
                      <p className="service-description">{service.description}</p>
                      <div className="service-footer">
                        <span className="service-price">${service.price}</span>
                        <button
                          onClick={() => handleBooking(service.id)}
                          className="btn btn-primary btn-sm"
                        >
                          Book Now
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <div className="empty-icon">🔍</div>
                    <h3>No services available</h3>
                    <p>Check back later for new services</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'bookings' && (
              <div className="bookings-list">
                {bookings.length > 0 ? (
                  bookings.map((booking) => (
                    <div key={booking.id} className="booking-card">
                      <div className="booking-header">
                        <h4>{booking.service?.title}</h4>
                        <span className={`status-badge ${booking.status}`}>
                          {booking.status}
                        </span>
                      </div>
                      <div className="booking-details">
                        <p><strong>Date:</strong> {new Date(booking.date).toLocaleDateString()}</p>
                        <p><strong>Time:</strong> {booking.time}</p>
                        <p><strong>Provider:</strong> {booking.service?.provider?.name}</p>
                      </div>
                      <div className="booking-footer">
                        <span className="booking-price">${booking.service?.price}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <div className="empty-icon">📅</div>
                    <h3>No bookings yet</h3>
                    <p>Browse services and make your first booking</p>
                    <button
                      onClick={() => setActiveTab('services')}
                      className="btn btn-primary"
                    >
                      Browse Services
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'provider' && user?.role === 'provider' && (
              <div className="provider-dashboard">
                <div className="provider-stats">
                  <div className="stat-card">
                    <span className="stat-number">0</span>
                    <span className="stat-label">Total Bookings</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-number">0</span>
                    <span className="stat-label">Completed</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-number">$0</span>
                    <span className="stat-label">Earnings</span>
                  </div>
                </div>
                
                <div className="provider-actions">
                  <h3>Provider Tools</h3>
                  <button className="btn btn-primary btn-full">
                    Add New Service
                  </button>
                  <button className="btn btn-outline btn-full">
                    View Schedule
                  </button>
                  <button className="btn btn-outline btn-full">
                    Manage Bookings
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
