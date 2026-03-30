const express = require('express');
const router = express.Router();

// Development endpoints
router.post('/create-payment-intent', (req, res) => {
  res.json({ message: 'Create payment intent endpoint - development mode', clientSecret: 'pi_test_123' });
});

router.post('/webhook', (req, res) => {
  res.json({ message: 'Payment webhook endpoint - development mode' });
});

router.get('/methods', (req, res) => {
  res.json({ message: 'Get payment methods endpoint - development mode' });
});

router.post('/confirm-payment', (req, res) => {
  res.json({ message: 'Confirm payment endpoint - development mode' });
});

router.get('/history', (req, res) => {
  res.json({ message: 'Payment history endpoint - development mode', payments: [] });
});

router.post('/create-connect-account', (req, res) => {
  res.json({ message: 'Create connect account endpoint - development mode' });
});

module.exports = router;
