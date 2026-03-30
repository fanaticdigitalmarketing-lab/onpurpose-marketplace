const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Basic middleware
app.use(express.json());

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'OnPurpose Hospitality Marketplace',
    status: 'running',
    version: '1.0.0-minimal',
    timestamp: new Date().toISOString()
  });
});

// Health endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// API endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'OnPurpose API',
    status: 'operational',
    endpoints: ['/', '/health', '/api']
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`OnPurpose minimal server running on port ${PORT}`);
});

module.exports = app;
