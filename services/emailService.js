const { Resend } = require('resend');

const getResend = () => new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.EMAIL_FROM || 'OnPurpose <noreply@onpurpose.earth>';

// Base HTML template wrapper
const base = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>OnPurpose</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a2744; margin: 0; padding: 0; background: #f7f8fc; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 20px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 32px; font-weight: 700; }
    .content { padding: 40px 30px; }
    .btn { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
    .btn:hover { opacity: 0.9; }
    .footer { padding: 20px 30px; background: #f7f8fc; border-top: 1px solid #eef1f8; text-align: center; font-size: 13px; color: #6b7a99; }
    a { color: #2563d4; text-decoration: none; }
    .info-box { background: #f7f8fc; border-radius: 12px; padding: 20px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>OnPurpose</h1>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>© 2026 OnPurpose — Marketplace for human connection</p>
      <p><a href="mailto:onpurposeearth@gmail.com">onpurposeearth@gmail.com</a></p>
    </div>
  </div>
</body>
</html>
`;

const emailService = {
  // Send booking confirmation to customer
  sendBookingConfirmation: async (to, bookingData) => {
    try {
      const { service, provider, booking, customer } = bookingData;
      
      const { data, error } = await resend.emails.send({
        from: FROM_EMAIL,
        to,
        subject: 'Booking Confirmed - OnPurpose',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #b8ff4f; padding: 20px; text-align: center;">
              <h1 style="color: #0a0a0a; margin: 0;">OnPurpose</h1>
            </div>
            <div style="padding: 30px; background: #ffffff;">
              <h2 style="color: #0a0a0a; margin-bottom: 20px;">Your booking is confirmed!</h2>
              <p style="color: #333; font-size: 16px; line-height: 1.5;">
                Hi ${customer.firstName},
              </p>
              <p style="color: #333; font-size: 16px; line-height: 1.5;">
                Your booking for <strong>${service.title}</strong> with ${provider.firstName} ${provider.lastName} has been confirmed.
              </p>
              
              <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #0a0a0a; margin-bottom: 15px;">Booking Details</h3>
                <p style="margin: 5px 0;"><strong>Service:</strong> ${service.title}</p>
                <p style="margin: 5px 0;"><strong>Provider:</strong> ${provider.firstName} ${provider.lastName}</p>
                <p style="margin: 5px 0;"><strong>Date:</strong> ${booking.scheduledDate}</p>
                <p style="margin: 5px 0;"><strong>Time:</strong> ${booking.scheduledTime}</p>
                <p style="margin: 5px 0;"><strong>Duration:</strong> ${booking.duration} minutes</p>
                <p style="margin: 5px 0;"><strong>Location:</strong> ${booking.location || service.location || 'Online'}</p>
                <p style="margin: 5px 0;"><strong>Total:</strong> $${booking.totalAmount}</p>
              </div>
              
              <p style="color: #666; font-size: 14px;">
                Need to make changes? You can manage your booking in your <a href="${process.env.FRONTEND_URL}/dashboard.html" style="color: #b8ff4f;">dashboard</a>.
              </p>
            </div>
          </div>
        `
      });
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Email sendBookingConfirmation error:', error);
      return { success: false, message: error.message };
    }
  },

  // Send booking notification to provider
  sendBookingNotification: async (to, bookingData) => {
    try {
      const { service, customer, booking } = bookingData;
      
      const { data, error } = await resend.emails.send({
        from: FROM_EMAIL,
        to,
        subject: 'New Booking - OnPurpose',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #b8ff4f; padding: 20px; text-align: center;">
              <h1 style="color: #0a0a0a; margin: 0;">OnPurpose</h1>
            </div>
            <div style="padding: 30px; background: #ffffff;">
              <h2 style="color: #0a0a0a; margin-bottom: 20px;">You have a new booking!</h2>
              <p style="color: #333; font-size: 16px; line-height: 1.5;">
                ${customer.firstName} ${customer.lastName} has booked your service <strong>${service.title}</strong>.
              </p>
              
              <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #0a0a0a; margin-bottom: 15px;">Booking Details</h3>
                <p style="margin: 5px 0;"><strong>Customer:</strong> ${customer.firstName} ${customer.lastName}</p>
                <p style="margin: 5px 0;"><strong>Date:</strong> ${booking.scheduledDate}</p>
                <p style="margin: 5px 0;"><strong>Time:</strong> ${booking.scheduledTime}</p>
                <p style="margin: 5px 0;"><strong>You'll earn:</strong> $${booking.price - booking.platformFee}</p>
              </div>
              
              <p style="color: #666; font-size: 14px;">
                View in your <a href="${process.env.FRONTEND_URL}/dashboard.html" style="color: #b8ff4f;">dashboard</a>.
              </p>
            </div>
          </div>
        `
      });
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Email sendBookingNotification error:', error);
      return { success: false, message: error.message };
    }
  },

  // Send welcome email
  sendWelcomeEmail: async (to, userData) => {
    try {
      const { data, error } = await resend.emails.send({
        from: FROM_EMAIL,
        to,
        subject: 'Welcome to OnPurpose!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #ffffff;">
            <div style="background: #b8ff4f; padding: 30px; text-align: center;">
              <h1 style="color: #0a0a0a; margin: 0; font-size: 28px;">OnPurpose</h1>
            </div>
            <div style="padding: 40px 30px;">
              <h2 style="color: #b8ff4f; margin-bottom: 20px;">Welcome to OnPurpose!</h2>
              <p style="color: #ffffff; font-size: 16px; line-height: 1.6;">
                Hi ${userData.firstName},
              </p>
              <p style="color: #a0a0a0; font-size: 16px; line-height: 1.6;">
                We're excited to have you on OnPurpose — the marketplace for booking people, not places.
              </p>
              <div style="text-align: center; margin: 40px 0;">
                <a href="${process.env.FRONTEND_URL}/dashboard.html" 
                   style="background: #b8ff4f; color: #0a0a0a; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                  ${userData.isHost ? 'Create Your First Service' : 'Browse Services'}
                </a>
              </div>
            </div>
            <div style="background: #141414; padding: 20px; text-align: center; border-top: 1px solid #2a2a2a;">
              <p style="color: #666; font-size: 12px; margin: 0;">© 2025 OnPurpose Inc. All rights reserved.</p>
            </div>
          </div>
        `
      });
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Email sendWelcomeEmail error:', error);
      return { success: false, message: error.message };
    }
  },

  // Send verification email
  sendVerificationEmail: async (email, name, token) => {
    const verifyUrl = `${process.env.FRONTEND_URL || 'https://onpurpose.earth'}/auth/verify-email?token=${token}`;
    try {
      const resend = getResend();
      await resend.emails.send({
        from: process.env.EMAIL_FROM || 'OnPurpose <noreply@onpurpose.earth>',
        to: email,
        subject: `Welcome to OnPurpose, ${name}!`,
        html: base(`
          <h2>Welcome, ${name}!</h2>
          <p>You're officially part of OnPurpose — the marketplace where real people connect for real services.</p>
          <p>Click below to verify your email and activate your account:</p>
          <a href="${verifyUrl}" class="btn">Verify my email address</a>
          <p style="font-size:12px;color:#9ca3af;margin-top:1rem">
            This link expires in 24 hours. If you did not create an account, 
            you can safely ignore this email.
          </p>
          <div style="margin-top:1.5rem;padding-top:1.25rem;border-top:1px solid #eef1f8;font-size:13px;color:#6b7a99">
            Questions? Reply to this email or reach us at 
            <a href="mailto:onpurposeearth@gmail.com" style="color:#2563d4">onpurposeearth@gmail.com</a>
          </div>
        `)
      });
    } catch (e) {
      console.error('Verification email failed:', e.message);
    }
  },

  // Send owner alert for new signup
  sendOwnerNewSignupAlert: async (newUser) => {
    const resend = getResend();
    const emailHtml = base(`
      <h2>New user just signed up</h2>
      <div class="info-box">
        <div style="margin-bottom:8px"><strong style="color:#1a2744">Name:</strong> <span style="color:#6b7a99">${newUser.name}</span></div>
        <div style="margin-bottom:8px"><strong style="color:#1a2744">Email:</strong> <span style="color:#2563d4">${newUser.email}</span></div>
        <div style="margin-bottom:8px"><strong style="color:#1a2744">Role:</strong> <span style="color:#6b7a99">${newUser.role}</span></div>
        <div style="margin-bottom:8px"><strong style="color:#1a2744">Location:</strong> <span style="color:#6b7a99">${newUser.location || 'Not provided'}</span></div>
        <div><strong style="color:#1a2744">Signed up:</strong> <span style="color:#6b7a99">${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })} ET</span></div>
      </div>
      <a href="https://onpurpose.earth/dashboard" class="btn">View in dashboard</a>
    `);
    const subject = `New signup — ${newUser.name} (${newUser.role})`;

    // Try verified domain first
    try {
      const { data, error } = await resend.emails.send({
        from: process.env.EMAIL_FROM || 'OnPurpose <noreply@onpurpose.earth>',
        to: 'onpurposeearth@gmail.com',
        subject,
        html: emailHtml
      });
      if (error && error.statusCode === 403) {
        // Domain not verified yet — fall back to Resend test sender
        console.log('Domain not verified yet, using Resend test sender...');
        const fallback = await resend.emails.send({
          from: 'OnPurpose <onboarding@resend.dev>',
          to: process.env.RESEND_ACCOUNT_EMAIL || 'fanaticdigitalmarketing@gmail.com',
          subject,
          html: emailHtml
        });
        if (fallback.error) {
          console.error('Fallback email error:', JSON.stringify(fallback.error));
        } else {
          console.log('Owner alert sent via fallback:', fallback.data?.id);
        }
      } else if (error) {
        console.error('Owner alert email API error:', JSON.stringify(error));
      } else {
        console.log('Owner alert email sent:', data?.id);
      }
    } catch (e) {
      console.error('Owner alert email failed:', e.message);
    }
  },

  // Send password reset email
  sendPasswordResetEmail: async (to, token) => {
    try {
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
      
      const { data, error } = await resend.emails.send({
        from: FROM_EMAIL,
        to,
        subject: 'Reset Your Password - OnPurpose',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #ffffff;">
            <div style="background: #b8ff4f; padding: 30px; text-align: center;">
              <h1 style="color: #0a0a0a; margin: 0; font-size: 28px;">OnPurpose</h1>
            </div>
            <div style="padding: 40px 30px;">
              <h2 style="color: #b8ff4f; margin-bottom: 20px;">Reset Your Password</h2>
              <p style="color: #a0a0a0; font-size: 16px; line-height: 1.6;">
                You requested a password reset. Click the button below to set a new password:
              </p>
              <div style="text-align: center; margin: 40px 0;">
                <a href="${resetUrl}" 
                   style="background: #b8ff4f; color: #0a0a0a; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                  Reset Password
                </a>
              </div>
              <p style="color: #666; font-size: 12px;">
                This link expires in 1 hour. If you didn't request this, please ignore this email.
              </p>
            </div>
          </div>
        `
      });
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Email sendPasswordResetEmail error:', error);
      return { success: false, message: error.message };
    }
  },

  // Send booking status email
  sendBookingStatusEmail: async (to, status, bookingData) => {
    try {
      const { service, provider, booking, customer } = bookingData;
      
      const statusMessages = {
        confirmed: { title: 'Booking Confirmed', color: '#4ade80' },
        cancelled: { title: 'Booking Cancelled', color: '#f87171' },
        completed: { title: 'Booking Completed', color: '#60a5fa' }
      };
      
      const statusInfo = statusMessages[status] || statusMessages.confirmed;
      
      const { data, error } = await resend.emails.send({
        from: FROM_EMAIL,
        to,
        subject: `${statusInfo.title} - OnPurpose`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #ffffff;">
            <div style="background: ${statusInfo.color}; padding: 30px; text-align: center;">
              <h1 style="color: #0a0a0a; margin: 0; font-size: 28px;">OnPurpose</h1>
            </div>
            <div style="padding: 40px 30px;">
              <h2 style="color: ${statusInfo.color}; margin-bottom: 20px;">${statusInfo.title}</h2>
              <p style="color: #a0a0a0; font-size: 16px; line-height: 1.6;">
                Hi ${customer.firstName},
              </p>
              <p style="color: #a0a0a0; font-size: 16px; line-height: 1.6;">
                Your booking for <strong style="color: #ffffff;">${service.title}</strong> has been ${status}.
              </p>
              
              <div style="background: #141414; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #2a2a2a;">
                <h3 style="color: #b8ff4f; margin-bottom: 15px;">Booking Details</h3>
                <p style="margin: 5px 0; color: #a0a0a0;"><strong style="color: #ffffff;">Service:</strong> ${service.title}</p>
                <p style="margin: 5px 0; color: #a0a0a0;"><strong style="color: #ffffff;">Provider:</strong> ${provider.firstName} ${provider.lastName}</p>
                <p style="margin: 5px 0; color: #a0a0a0;"><strong style="color: #ffffff;">Date:</strong> ${booking.date}</p>
                <p style="margin: 5px 0; color: #a0a0a0;"><strong style="color: #ffffff;">Time:</strong> ${booking.time}</p>
              </div>
              
              <p style="color: #666; font-size: 14px;">
                Manage your booking in your <a href="${process.env.FRONTEND_URL}/dashboard.html" style="color: #b8ff4f;">dashboard</a>.
              </p>
            </div>
          </div>
        `
      });
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Email sendBookingStatusEmail error:', error);
      return { success: false, message: error.message };
    }
  },

  // Send new booking notification to provider
  sendNewBookingNotificationToProvider: async (to, bookingData) => {
    try {
      const { service, customer, booking } = bookingData;
      
      const { data, error } = await resend.emails.send({
        from: FROM_EMAIL,
        to,
        subject: 'New Booking - OnPurpose',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #ffffff;">
            <div style="background: #b8ff4f; padding: 30px; text-align: center;">
              <h1 style="color: #0a0a0a; margin: 0; font-size: 28px;">OnPurpose</h1>
            </div>
            <div style="padding: 40px 30px;">
              <h2 style="color: #b8ff4f; margin-bottom: 20px;">New Booking!</h2>
              <p style="color: #a0a0a0; font-size: 16px; line-height: 1.6;">
                ${customer.name} has booked your service <strong style="color: #ffffff;">${service.title}</strong>.
              </p>
              
              <div style="background: #141414; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #2a2a2a;">
                <h3 style="color: #b8ff4f; margin-bottom: 15px;">Booking Details</h3>
                <p style="margin: 5px 0; color: #a0a0a0;"><strong style="color: #ffffff;">Customer:</strong> ${customer.name}</p>
                <p style="margin: 5px 0; color: #a0a0a0;"><strong style="color: #ffffff;">Date:</strong> ${booking.date}</p>
                <p style="margin: 5px 0; color: #a0a0a0;"><strong style="color: #ffffff;">Time:</strong> ${booking.time}</p>
                <p style="margin: 5px 0; color: #a0a0a0;"><strong style="color: #ffffff;">You'll earn:</strong> $${booking.providerAmount}</p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL}/dashboard.html" 
                   style="background: #b8ff4f; color: #0a0a0a; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                  View in Dashboard
                </a>
              </div>
            </div>
          </div>
        `
      });
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Email sendNewBookingNotificationToProvider error:', error);
      return { success: false, message: error.message };
    }
  }
};

module.exports = emailService;
