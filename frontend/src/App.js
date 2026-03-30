import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Auth from './components/Auth';
import Listings from './components/Listings';
import CreateListing from './components/CreateListing';
import Booking from './components/Booking';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
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
