const express = require('express');
const pool = require('./db');
const app = express();
const port = process.env.PORT || 3000;

// Serve static files
app.use(express.static('public'));

app.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.send(`Hello from Windsurf! DB time: ${result.rows[0].now}`);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).send('Database connection failed');
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.listen(port, () => {
  console.log(`🚀 Windsurf server running on port ${port}`);
});
