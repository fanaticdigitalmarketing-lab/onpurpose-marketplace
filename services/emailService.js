'use strict';

const { Resend } = require('resend');

// ── Resend client (lazy init so missing key doesn't crash) ───
function getResend() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY not set in environment variables');
  }
  return new Resend(process.env.RESEND_API_KEY);
}

// ── Email log helper ─────────────────────────────────────────
async function logEmail(models, { recipientEmail, recipientName,
  emailType, subject, status, error, metadata }) {
  try {
    if (models && models.EmailLog) {
      await models.EmailLog.create({
        recipientEmail, recipientName,
        emailType, subject,
        status: status || 'sent',
        error: error || null,
        metadata: metadata || null
      });
    }
  } catch (e) {
    console.error('[EmailLog] Failed to log email:', e.message);
  }
}

// ── BASE HTML TEMPLATE ───────────────────────────────────────
function base(content) {
  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"/>
<style>
  body { font-family: 'DM Sans', Arial, sans-serif; background: #f7f8fc;
         color: #1a2744; margin: 0; padding: 0; }
  .wrap { max-width: 600px; margin: 40px auto; background: #ffffff;
          border-radius: 18px; overflow: hidden;
          box-shadow: 0 4px 24px rgba(37,99,212,0.10); }
  .hdr { background: #1a2744; padding: 28px 36px;
         display: flex; align-items: center; gap: 14px; }
  .hdr-name { font-size: 22px; font-weight: 700; color: #ffffff;
              font-family: Georgia, serif; }
  .hdr-tag { font-size: 11px; color: #3b7ef8; margin-top: 2px; }
  .body { padding: 36px; }
  h2 { font-family: Georgia, serif; color: #1a2744;
       font-size: 22px; margin-bottom: 12px; }
  p { font-size: 15px; line-height: 1.7; color: #6b7a99;
      margin-bottom: 14px; }
  .btn { display: inline-block; background: #2563d4; color: #ffffff;
         text-decoration: none; padding: 14px 32px; border-radius: 100px;
         font-weight: 600; font-size: 15px; margin: 16px 0; }
  .info-box { background: #f7f8fc; border: 1px solid rgba(26,39,68,0.10);
              border-radius: 14px; padding: 20px 24px; margin: 16px 0; }
  .info-row { display: flex; justify-content: space-between;
              padding: 6px 0; font-size: 14px; }
  .info-label { color: #1a2744; font-weight: 600; }
  .info-val { color: #6b7a99; }
  .ftr { background: #1a2744; padding: 20px 36px; text-align: center;
         font-size: 12px; color: rgba(255,255,255,0.4); }
  .ftr a { color: #3b7ef8; text-decoration: none; }
</style></head>
<body><div class="wrap">
<div class="hdr">
  <div>
    <div class="hdr-name">OnPurpose</div>
    <div class="hdr-tag">Connection, not dating</div>
  </div>
</div>
<div class="body">${content}</div>
<div class="ftr">
  © 2025 OnPurpose Inc. · 
  <a href="https://onpurpose.earth">onpurpose.earth</a> · 
  Book People, Not Places
</div>
</div></body></html>`;
}

// ────────────────────────────────────────────────────────────
// EMAIL 1 — VERIFICATION EMAIL (sent to new user)
// ────────────────────────────────────────────────────────────
async function sendVerificationEmail(email, name, token, models) {
  const verifyUrl = `${process.env.FRONTEND_URL || 'https://onpurpose.earth'}/api/auth/verify-email?token=${token}`;
  const subject = `Verify your OnPurpose account, ${name.split(' ')[0]}!`;

  try {
    const resend = getResend();
    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'OnPurpose <noreply@onpurpose.earth>',
      to: email,
      subject,
      html: base(`
        <h2>Welcome to OnPurpose, ${name.split(' ')[0]}! 👋</h2>
        <p>You're one step away from booking real people for real services
           in your city. Click below to verify your email address and
           activate your account.</p>
        <a href="${verifyUrl}" class="btn">Verify my email address →</a>
        <p style="font-size:13px;color:#9ca3af">
          This link expires in 24 hours. If you didn't create an account,
          you can safely ignore this email.
        </p>
        <div style="margin-top:1.5rem;padding-top:1.25rem;
                    border-top:1px solid #eef1f8;font-size:13px;color:#6b7a99">
          Questions? Email us at
          <a href="mailto:onpurposeearth@gmail.com"
             style="color:#2563d4">onpurposeearth@gmail.com</a>
        </div>
      `)
    });

    await logEmail(models, {
      recipientEmail: email,
      recipientName: name,
      emailType: 'verification',
      subject,
      status: 'sent'
    });

    console.log('[Email] Verification sent to:', email);
  } catch (err) {
    console.error('[Email] Verification failed:', err.message);
    await logEmail(models, {
      recipientEmail: email,
      recipientName: name,
      emailType: 'verification',
      subject,
      status: 'failed',
      error: err.message
    });
  }
}

// ────────────────────────────────────────────────────────────
// EMAIL 2 — OWNER ALERT (sent to onpurposeearth@gmail.com)
// ────────────────────────────────────────────────────────────
async function sendOwnerNewSignupAlert(newUser, models) {
  const subject = `🎉 New ${newUser.role} signed up — ${newUser.name}`;
  const now = new Date().toLocaleString('en-US', {
    timeZone: 'America/New_York',
    dateStyle: 'full',
    timeStyle: 'short'
  });

  try {
    const resend = getResend();
    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'OnPurpose <noreply@onpurpose.earth>',
      to: 'onpurposeearth@gmail.com',
      subject,
      html: base(`
        <h2>New user just signed up 🎉</h2>
        <p>Someone just created an OnPurpose account.
           Here are their details:</p>
        <div class="info-box">
          <div class="info-row">
            <span class="info-label">Name</span>
            <span class="info-val">${newUser.name}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Email</span>
            <span class="info-val">${newUser.email}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Account type</span>
            <span class="info-val">${newUser.role === 'provider' ? '⚡ Service Provider' : '👤 Customer'}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Location</span>
            <span class="info-val">${newUser.location || 'Not provided'}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Signed up</span>
            <span class="info-val">${now} ET</span>
          </div>
          <div class="info-row">
            <span class="info-label">User ID</span>
            <span class="info-val" style="font-size:11px;font-family:monospace">
              ${newUser.id}
            </span>
          </div>
        </div>
        <p>This user is saved permanently in your Subscribers database.</p>
        <a href="https://onpurpose.earth/dashboard.html" class="btn">
          View Dashboard →
        </a>
      `)
    });

    await logEmail(models, {
      recipientEmail: 'onpurposeearth@gmail.com',
      recipientName: 'Tyler Forbes',
      emailType: 'owner-alert',
      subject,
      status: 'sent',
      metadata: { newUserId: newUser.id, newUserEmail: newUser.email }
    });

    console.log('[Email] Owner alert sent for:', newUser.email);
  } catch (err) {
    console.error('[Email] Owner alert failed:', err.message);
    await logEmail(models, {
      recipientEmail: 'onpurposeearth@gmail.com',
      recipientName: 'Tyler Forbes',
      emailType: 'owner-alert',
      subject,
      status: 'failed',
      error: err.message
    });
  }
}

// ────────────────────────────────────────────────────────────
// EMAIL 3 — PASSWORD RESET
// ────────────────────────────────────────────────────────────
async function sendPasswordResetEmail(email, token, models) {
  const resetUrl = `${process.env.FRONTEND_URL || 'https://onpurpose.earth'}/reset-password?token=${token}`;
  const subject = 'Reset your OnPurpose password';

  try {
    const resend = getResend();
    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'OnPurpose <noreply@onpurpose.earth>',
      to: email,
      subject,
      html: base(`
        <h2>Password reset request</h2>
        <p>We received a request to reset your password.
           Click the button below — this link expires in 1 hour.</p>
        <a href="${resetUrl}" class="btn">Reset my password →</a>
        <p style="font-size:13px;color:#9ca3af">
          If you didn't request this, ignore this email.
          Your password will not change.
        </p>
      `)
    });

    await logEmail(models, {
      recipientEmail: email,
      emailType: 'password-reset',
      subject,
      status: 'sent'
    });
  } catch (err) {
    console.error('[Email] Password reset failed:', err.message);
    await logEmail(models, {
      recipientEmail: email,
      emailType: 'password-reset',
      subject,
      status: 'failed',
      error: err.message
    });
  }
}

// ────────────────────────────────────────────────────────────
// EMAIL 4 — BOOKING CONFIRMATION (to customer)
// ────────────────────────────────────────────────────────────
async function sendBookingConfirmation(email, name, booking, service, models) {
  const subject = `Booking confirmed — ${service.title}`;
  try {
    const resend = getResend();
    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'OnPurpose <noreply@onpurpose.earth>',
      to: email,
      subject,
      html: base(`
        <h2>Your booking is confirmed ✅</h2>
        <p>Hi ${name.split(' ')[0]}, your booking has been confirmed.
           Here are the details:</p>
        <div class="info-box">
          <div class="info-row">
            <span class="info-label">Service</span>
            <span class="info-val">${service.title}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Date</span>
            <span class="info-val">${booking.date}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Time</span>
            <span class="info-val">${booking.time}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Total</span>
            <span class="info-val">$${parseFloat(booking.totalAmount).toFixed(2)}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Status</span>
            <span class="info-val">${booking.paymentStatus === 'paid' ? '✅ Paid' : '⏳ Payment pending'}</span>
          </div>
        </div>
        <a href="https://onpurpose.earth/dashboard.html" class="btn">
          View my booking →
        </a>
      `)
    });
    await logEmail(models, {
      recipientEmail: email, recipientName: name,
      emailType: 'booking-confirm', subject, status: 'sent',
      metadata: { bookingId: booking.id }
    });
  } catch (err) {
    console.error('[Email] Booking confirm failed:', err.message);
    await logEmail(models, {
      recipientEmail: email, emailType: 'booking-confirm',
      subject, status: 'failed', error: err.message
    });
  }
}

// ────────────────────────────────────────────────────────────
// EMAIL 5 — NEW BOOKING ALERT (to provider)
// ────────────────────────────────────────────────────────────
async function sendNewBookingNotificationToProvider(
  providerEmail, { service, customer, booking }, models) {
  const subject = `New booking request — ${service.title}`;
  try {
    const resend = getResend();
    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'OnPurpose <noreply@onpurpose.earth>',
      to: providerEmail,
      subject,
      html: base(`
        <h2>You have a new booking request 📅</h2>
        <div class="info-box">
          <div class="info-row">
            <span class="info-label">Service</span>
            <span class="info-val">${service.title}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Customer</span>
            <span class="info-val">${customer.name}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Date</span>
            <span class="info-val">${booking.date}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Time</span>
            <span class="info-val">${booking.time}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Amount</span>
            <span class="info-val">$${parseFloat(booking.providerAmount).toFixed(2)} (after platform fee)</span>
          </div>
        </div>
        <a href="https://onpurpose.earth/dashboard.html" class="btn">
          Confirm or decline →
        </a>
      `)
    });
    await logEmail(models, {
      recipientEmail: providerEmail,
      emailType: 'booking-notify-provider',
      subject, status: 'sent',
      metadata: { bookingId: booking.id }
    });
  } catch (err) {
    console.error('[Email] Provider booking notify failed:', err.message);
  }
}

module.exports = {
  sendVerificationEmail,
  sendOwnerNewSignupAlert,
  sendPasswordResetEmail,
  sendBookingConfirmation,
  sendNewBookingNotificationToProvider
};
