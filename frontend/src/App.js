import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Auth from './components/Auth';
import Listings from './components/Listings';
import CreateListing from './components/CreateListing';
import Booking from './components/Booking';
import './App.css';

function Nav() {
  const { user, logout } = useAuth();
  const location = useLocation();

  // Hide nav on auth page
  if (location.pathname === '/auth') return null;

  return (
    <nav className="nav">
      <Link to="/listings" className="nav-brand">OnPurpose</Link>
      <div className="nav-links">
        <Link to="/listings" className={`nav-link${location.pathname === '/listings' ? ' active' : ''}`}>
          Browse
        </Link>
        {user ? (
          <>
            <Link to="/create-listing" className={`nav-link${location.pathname === '/create-listing' ? ' active' : ''}`}>
              Create Service
            </Link>
            <button onClick={logout} className="nav-link" style={{ background: 'none', border: 'none', cursor: 'pointer', font: 'inherit' }}>
              Logout
            </button>
          </>
        ) : (
          <Link to="/auth" className="nav-link">Login</Link>
        )}
      </div>
    </nav>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Nav />
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/listings" element={<Listings />} />
            <Route path="/create-listing" element={<CreateListing />} />
            <Route path="/book/:listingId" element={<Booking />} />
            <Route path="/" element={<Navigate to="/listings" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
