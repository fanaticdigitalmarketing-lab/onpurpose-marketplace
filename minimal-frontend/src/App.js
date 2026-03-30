import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CreateListing from './pages/CreateListing';
import ViewListings from './pages/ViewListings';
import BookListing from './pages/BookListing';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/create-listing" element={<CreateListing />} />
          <Route path="/listings" element={<ViewListings />} />
          <Route path="/book/:listingId" element={<BookListing />} />
          <Route path="/" element={<Navigate to="/listings" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
