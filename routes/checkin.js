/**
 * OnPurpose QR Check-In System
 * © 2025 OnPurpose Inc. All rights reserved.
 * Patent-pending intellectual property
 */

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { authenticate } = require('../middleware/auth');
const { updateProviderTrustScore } = require('../services/trustScore');

const QR_TOKEN_EXPIRY = '30m';

const generateNonce = () => crypto.randomBytes(32).toString('hex');
const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

// POST /api/checkin/generate
router.post('/checkin/generate', authenticate, async (req, res) => {
  try {
    const { bookingId } = req.body;
    const { Booking, Service, User } = req.app.locals.models;
    
    if (!bookingId) {
      return res.status(400).json({ success: false, message: 'Booking ID required' });
    }
    
    const booking = await Booking.findByPk(bookingId, {
      include: [{ model: Service, as: 'service' }, { model: User, as: 'provider' }]
    });
    
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    
    if (booking.userId !== req.userId) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    if (booking.status !== 'confirmed' || booking.paymentStatus !== 'paid') {
      return res.status(400).json({ success: false, message: 'Booking must be confirmed and paid' });
    }
    
    // Verify within 24 hours
    const bookingDate = new Date(booking.date + 'T' + booking.time);
    const now = new Date();
    const hoursUntil = (bookingDate - now) / (1000 * 60 * 60);
    
    if (hoursUntil > 24 || hoursUntil < -2) {
      return res.status(400).json({ success: false, message: 'QR code can only be generated within 24 hours of booking' });
    }
    
    // Generate QR token
    const nonce = generateNonce();
    const qrToken = jwt.sign({
      bookingId: booking.id,
      providerId: booking.providerId,
      customerId: booking.userId,
      date: booking.date,
      time: booking.time,
      nonce: nonce,
      type: 'qr-checkin'
    }, process.env.QR_SECRET, { expiresIn: QR_TOKEN_EXPIRY });
    
    // Store hash for replay prevention
    await booking.update({ qrTokenHash: hashToken(qrToken) });
    
    res.json({
      success: true,
      data: { qrToken, expiresInMinutes: 30, bookingId: booking.id }
    });
  } catch (error) {
    console.error('QR generate error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate QR code' });
  }
});

// POST /api/checkin/scan - THE ATOMIC METHOD
router.post('/checkin/scan', authenticate, async (req, res) => {
  const transaction = await req.app.locals.sequelize.transaction();
  
  try {
    const { token } = req.body;
    const { Booking, Service } = req.app.locals.models;
    
    if (!token) {
      await transaction.rollback();
      return res.status(400).json({ success: false, message: 'QR token required' });
    }
    
    // Verify JWT
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.QR_SECRET);
    } catch (err) {
      await transaction.rollback();
      return res.status(401).json({ success: false, message: 'Invalid QR token' });
    }
    
    if (decoded.type !== 'qr-checkin') {
      await transaction.rollback();
      return res.status(400).json({ success: false, message: 'Invalid token type' });
    }
    
    // Verify provider matches
    if (decoded.providerId !== req.userId) {
      await transaction.rollback();
      return res.status(403).json({ success: false, message: 'Not authorized - provider mismatch' });
    }
    
    // Get booking with lock
    const booking = await Booking.findByPk(decoded.bookingId, {
      transaction,
      lock: transaction.LOCK.UPDATE
    });
    
    if (!booking) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    
    // Verify nonce hash matches (replay prevention)
    if (booking.qrTokenHash !== hashToken(token)) {
      await transaction.rollback();
      return res.status(401).json({ success: false, message: 'Invalid or expired QR token' });
    }
    
    if (booking.status === 'in-progress' || booking.status === 'completed') {
      await transaction.rollback();
      return res.status(400).json({ success: false, message: 'Booking already checked in' });
    }
    
    const now = new Date();
    const service = await Service.findByPk(booking.serviceId, { transaction });
    const escrowReleaseAt = new Date(now.getTime() + (service.duration * 60 * 1000));
    
    // Atomic updates
    await booking.update({
      status: 'in-progress',
      sessionStartTime: now,
      escrowReleaseScheduled: true,
      escrowReleaseAt: escrowReleaseAt,
      qrTokenHash: null // Invalidate QR
    }, { transaction });
    
    await transaction.commit();
    
    // Update trust score non-blocking
    setImmediate(async () => {
      await updateProviderTrustScore(req.userId, req.app.locals.models);
    });
    
    res.json({
      success: true,
      data: {
        session: {
          bookingId: booking.id,
          sessionStartTime: now,
          serviceTitle: service.title,
          duration: service.duration,
          totalAmount: booking.totalAmount,
          escrowReleaseAt
        }
      }
    });
  } catch (error) {
    await transaction.rollback();
    console.error('QR scan error:', error);
    res.status(500).json({ success: false, message: 'Failed to process check-in' });
  }
});

// POST /api/checkin/complete
router.post('/checkin/complete', authenticate, async (req, res) => {
  try {
    const { bookingId } = req.body;
    const { Booking, Service } = req.app.locals.models;
    
    const booking = await Booking.findByPk(bookingId, {
      include: [{ model: Service, as: 'service' }]
    });
    
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    
    if (booking.providerId !== req.userId) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    if (booking.status !== 'in-progress') {
      return res.status(400).json({ success: false, message: 'Booking must be in-progress' });
    }
    
    const now = new Date();
    const durationMinutes = booking.sessionStartTime ?
      Math.round((now - new Date(booking.sessionStartTime)) / (1000 * 60)) : null;
    
    await booking.update({
      status: 'completed',
      sessionEndTime: now,
      sessionDurationMinutes: durationMinutes
    });
    
    res.json({
      success: true,
      data: {
        bookingId: booking.id,
        status: 'completed',
        sessionDurationMinutes: durationMinutes,
        providerAmount: booking.providerAmount,
        message: 'Session completed. Payout will be processed.'
      }
    });
  } catch (error) {
    console.error('Complete error:', error);
    res.status(500).json({ success: false, message: 'Failed to complete session' });
  }
});

// GET /api/checkin/status/:bookingId
router.get('/checkin/status/:bookingId', authenticate, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { Booking, Service } = req.app.locals.models;
    
    const booking = await Booking.findByPk(bookingId, {
      include: [{ model: Service, as: 'service', attributes: ['title', 'duration'] }]
    });
    
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    
    if (booking.userId !== req.userId && booking.providerId !== req.userId) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    res.json({
      success: true,
      data: {
        bookingId: booking.id,
        status: booking.status,
        sessionStartTime: booking.sessionStartTime,
        sessionEndTime: booking.sessionEndTime,
        sessionDurationMinutes: booking.sessionDurationMinutes,
        escrowReleaseScheduled: booking.escrowReleaseScheduled,
        escrowReleaseAt: booking.escrowReleaseAt,
        hasQR: !!booking.qrTokenHash,
        service: booking.service
      }
    });
  } catch (error) {
    console.error('Status error:', error);
    res.status(500).json({ success: false, message: 'Failed to get status' });
  }
});

module.exports = router;
