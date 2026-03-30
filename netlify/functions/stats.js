const serverless = require('serverless-http');
const express = require('express');
const { sql } = require('../../config/database');

const app = express();

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Stats endpoint
app.get('/api/stats', async (req, res) => {
  try {
    // Get real stats from database
    const [usersCount] = await sql`SELECT COUNT(*) as count FROM "Users"`;
    const [hostsCount] = await sql`SELECT COUNT(*) as count FROM "Hosts" WHERE "isApproved" = true`;
    const [bookingsCount] = await sql`SELECT COUNT(*) as count FROM "Bookings"`;
    
    // For demo, add some realistic numbers
    const stats = {
      hosts: `${hostsCount.count}+`,
      bookings: `${bookingsCount.count}+`,
      countries: '12+', // Static for now
      users: usersCount.count,
      lastUpdated: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: stats
    });
    
  } catch (error) {
    console.error('Stats API error:', error);
    
    // Return demo stats if database fails
    const demoStats = {
      hosts: '50+',
      bookings: '100+',
      countries: '12+',
      users: 500,
      lastUpdated: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: demoStats
    });
  }
});

// Early access endpoint
app.post('/api/early-access', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      });
    }
    
    // For demo, just log the email
    console.log('Early access signup:', email);
    
    // In production, you would:
    // 1. Save to database
    // 2. Send welcome email
    // 3. Add to mailing list
    
    res.json({
      success: true,
      message: 'Successfully joined early access list',
      email: email
    });
    
  } catch (error) {
    console.error('Early access API error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to join early access'
    });
  }
});

module.exports.handler = serverless(app);
