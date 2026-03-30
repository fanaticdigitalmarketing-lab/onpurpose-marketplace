/**
 * Payment API Routes
 * Stripe integration for payments
 */

const express = require('express');
const router = express.Router();

const { authenticate } = require('../middleware/auth');
const { stripeService, emailService } = require('../services');
const Booking = require('../models/Booking');
const Service = require('../models/Service');
const User = require('../models/User');

// POST /api/payments/create-checkout-session
router.post('/create-checkout-session', authenticate, async (req, res) => {
  try {
    const { bookingId } = req.body;
    
    const booking = await Booking.findByPk(bookingId, {
      include: [
        { model: Service, as: 'service' },
        { model: User, as: 'provider' },
        { model: User, as: 'customer' }
      ]
    });
    
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    
    if (booking.customerId !== req.userId) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    const session = await stripeService.createCheckoutSession({
      service: booking.service,
      provider: booking.provider,
      customer: booking.customer,
      booking
    }, booking.customer.email);
    
    if (!session.success) {
      return res.status(500).json({ success: false, message: session.message });
    }
    
    // Save session ID to booking
    await booking.update({ stripePaymentIntentId: session.sessionId });
    
    res.json({ success: true, data: { sessionId: session.sessionId, url: session.url } });
  } catch (error) {
    console.error('Create checkout session error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/payments/webhook - Stripe webhook
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const signature = req.headers['stripe-signature'];
    
    const result = await stripeService.handleWebhook(req.body, signature);
    
    if (!result.success) {
      return res.status(400).json({ success: false, message: result.message });
    }
    
    const event = result.event;
    
    // Handle specific events
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const bookingId = session.metadata.bookingId;
        
        await Booking.update(
          { 
            paymentStatus: 'paid',
            status: 'confirmed',
            stripePaymentIntentId: session.payment_intent
          },
          { where: { id: bookingId } }
        );
        
        // Send confirmation emails
        const booking = await Booking.findByPk(bookingId, {
          include: [
            { model: Service, as: 'service' },
            { model: User, as: 'customer' },
            { model: User, as: 'provider' }
          ]
        });
        
        if (booking) {
          emailService.sendBookingConfirmation(booking.customer.email, {
            service: booking.service,
            provider: booking.provider,
            booking,
            customer: booking.customer
          }).catch(console.error);
        }
        
        break;
      }
      
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        const bookingId = paymentIntent.metadata.bookingId;
        
        await Booking.update(
          { paymentStatus: 'failed' },
          { where: { id: bookingId } }
        );
        
        break;
      }
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/payments/status/:bookingId
router.get('/status/:bookingId', authenticate, async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.bookingId, {
      attributes: ['id', 'paymentStatus', 'status', 'totalAmount']
    });
    
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    
    if (booking.customerId !== req.userId && booking.providerId !== req.userId) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    res.json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
