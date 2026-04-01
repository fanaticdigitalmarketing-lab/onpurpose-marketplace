const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

// Email templates
const EMAIL_TEMPLATES = {
  welcome: {
    subject: 'Welcome to OnPurpose! 🎉',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to OnPurpose</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563d4; margin-bottom: 10px;">Welcome to OnPurpose!</h1>
            <p style="font-size: 18px; color: #666;">Book People, Not Places</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #333;">You're in! 🎉</h2>
            <p>Thank you for joining OnPurpose. You're now part of a community that believes in real human connections.</p>
            <p>What's next?</p>
            <ul>
              <li>Complete your profile</li>
              <li>Browse services from verified providers</li>
              <li>Book your first session</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="https://onpurpose.earth" style="background: #2563d4; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Get Started
            </a>
          </div>
          
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; font-size: 12px; color: #999;">
            <p>&copy; 2026 OnPurpose Inc. All rights reserved.</p>
            <p>Connection, not dating • Book People, Not Places</p>
          </div>
        </div>
      </body>
      </html>
    `
  },
  
  bookingConfirmation: {
    subject: 'Booking Confirmed - OnPurpose',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Booking Confirmed</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563d4;">Booking Confirmed! ✅</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2>Your booking details:</h2>
            <p><strong>Service:</strong> {{serviceName}}</p>
            <p><strong>Provider:</strong> {{providerName}}</p>
            <p><strong>Date:</strong> {{bookingDate}}</p>
            <p><strong>Time:</strong> {{bookingTime}}</p>
            <p><strong>Duration:</strong> {{duration}}</p>
            <p><strong>Total:</strong> {{totalPrice}}</p>
          </div>
          
          <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <p><strong>Important:</strong> You'll receive a separate email with joining instructions 24 hours before your session.</p>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="https://onpurpose.earth/dashboard" style="background: #2563d4; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              View My Bookings
            </a>
          </div>
        </div>
      </body>
      </html>
    `
  },
  
  providerNotification: {
    subject: 'New Booking Alert - OnPurpose',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Booking Alert</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563d4;">New Booking Alert! 🔔</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2>You have a new booking:</h2>
            <p><strong>Customer:</strong> {{customerName}}</p>
            <p><strong>Service:</strong> {{serviceName}}</p>
            <p><strong>Date:</strong> {{bookingDate}}</p>
            <p><strong>Time:</strong> {{bookingTime}}</p>
            <p><strong>Duration:</strong> {{duration}}</p>
            <p><strong>Earnings:</strong> {{earnings}}</p>
          </div>
          
          <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <p><strong>Action Required:</strong> Please confirm this booking within 24 hours.</p>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="https://onpurpose.earth/dashboard" style="background: #2563d4; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Manage Bookings
            </a>
          </div>
        </div>
      </body>
      </html>
    `
  }
};

// Email logging function
async function logEmail(emailData) {
  try {
    const { EmailLog } = require('../models');
    await EmailLog.create({
      to: emailData.to,
      subject: emailData.subject,
      template: emailData.template,
      status: emailData.status || 'sent',
      error: emailData.error || null
    });
  } catch (error) {
    console.error('Failed to log email:', error);
  }
}

// Main email sending function
async function sendEmail(options) {
  const { to, template, data = {} } = options;
  
  try {
    const emailTemplate = EMAIL_TEMPLATES[template];
    if (!emailTemplate) {
      throw new Error(`Email template '${template}' not found`);
    }
    
    // Replace template variables
    let html = emailTemplate.html;
    Object.keys(data).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      html = html.replace(regex, data[key]);
    });
    
    const emailData = {
      from: 'onpurpose@resend.dev',
      to: to,
      subject: emailTemplate.subject,
      html: html
    };
    
    const result = await resend.emails.send(emailData);
    
    // Log successful email
    await logEmail({
      to,
      subject: emailTemplate.subject,
      template,
      status: 'sent'
    });
    
    console.log('Email sent successfully:', result.id);
    return result;
    
  } catch (error) {
    // Log failed email
    await logEmail({
      to,
      subject: options.subject || 'Unknown',
      template,
      status: 'failed',
      error: error.message
    });
    
    console.error('Failed to send email:', error);
    throw error;
  }
}

// Specific email functions
async function sendWelcomeEmail(to, userName) {
  return sendEmail({
    to,
    template: 'welcome',
    data: { userName }
  });
}

async function sendBookingConfirmation(to, bookingDetails) {
  return sendEmail({
    to,
    template: 'bookingConfirmation',
    data: bookingDetails
  });
}

async function sendProviderNotification(to, bookingDetails) {
  return sendEmail({
    to,
    template: 'providerNotification',
    data: bookingDetails
  });
}

async function sendPasswordReset(to, resetToken) {
  return sendEmail({
    to,
    subject: 'Password Reset - OnPurpose',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2563d4;">Password Reset Request</h2>
        <p>Click the link below to reset your password:</p>
        <a href="https://onpurpose.earth/reset-password?token=${resetToken}" style="background: #2563d4; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px;">
          Reset Password
        </a>
        <p style="margin-top: 20px; font-size: 12px; color: #999;">This link expires in 1 hour.</p>
      </div>
    `
  });
}

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendBookingConfirmation,
  sendProviderNotification,
  sendPasswordReset,
  EMAIL_TEMPLATES
};
