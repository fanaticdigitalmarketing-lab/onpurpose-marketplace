// Minimal server test to check basic functionality
const express = require('express');
const app = express();

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    time: new Date().toISOString(),
    port: process.env.PORT || 3000
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Minimal server running on port ${PORT}`);
  console.log(`Health: http://localhost:${PORT}/health`);
});
