const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransporter({
      service: 'SendGrid',
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY
      }
    });
  }

  // Email templates
  getTemplate(type, data) {
    const templates = {
      welcome: {
        subject: 'Welcome to OnPurpose - Connection, Not Dating',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #2F6FE4;">Welcome to OnPurpose, ${data.firstName}!</h1>
            <p>We're excited to have you join our community of meaningful connections.</p>
            <p>OnPurpose is about building genuine relationships through shared experiences and authentic hospitality.</p>
            <div style="background: #FDF7F2; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>What's Next?</h3>
              <ul>
                <li>Complete your profile</li>
                <li>Browse local hosts in NYC</li>
                <li>Book your first connection experience</li>
              </ul>
            </div>
            <a href="${process.env.FRONTEND_URL}/profile" style="background: #2F6FE4; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Complete Profile</a>
          </div>
        `
      },
      hostApproval: {
        subject: 'Your OnPurpose Host Application - Approved!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #22C55E;">Congratulations ${data.firstName}!</h1>
            <p>Your host application has been approved. You're now part of our curated community of NYC hosts.</p>
            <div style="background: #FDF7F2; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>Next Steps:</h3>
              <ul>
                <li>Set up your Stripe Connect account for payments</li>
                <li>Configure your availability calendar</li>
                <li>Start receiving booking requests</li>
              </ul>
            </div>
            <p><strong>Your Category:</strong> ${data.category}</p>
            <p><strong>Hourly Rate:</strong> $${data.hourlyRate}</p>
            <a href="${process.env.FRONTEND_URL}/host/dashboard" style="background: #22C55E; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Access Host Dashboard</a>
          </div>
        `
      },
      bookingConfirmation: {
        subject: 'Booking Confirmed - OnPurpose Experience',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #2F6FE4;">Booking Confirmed!</h1>
            <p>Hi ${data.guestName},</p>
            <p>Your OnPurpose experience has been confirmed with ${data.hostName}.</p>
            <div style="background: #FDF7F2; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>Booking Details:</h3>
              <p><strong>Host:</strong> ${data.hostName}</p>
              <p><strong>Category:</strong> ${data.category}</p>
              <p><strong>Date & Time:</strong> ${data.startTime}</p>
              <p><strong>Duration:</strong> ${data.duration} hours</p>
              <p><strong>Total Amount:</strong> $${data.totalAmount}</p>
            </div>
            <p>We'll send you a reminder 24 hours before your experience.</p>
            <a href="${process.env.FRONTEND_URL}/bookings/${data.bookingId}" style="background: #2F6FE4; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">View Booking</a>
          </div>
        `
      },
      paymentReceived: {
        subject: 'Payment Received - OnPurpose',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #22C55E;">Payment Received!</h1>
            <p>Hi ${data.hostName},</p>
            <p>You've received a payment for your OnPurpose experience.</p>
            <div style="background: #FDF7F2; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>Payment Details:</h3>
              <p><strong>Guest:</strong> ${data.guestName}</p>
              <p><strong>Experience Date:</strong> ${data.experienceDate}</p>
              <p><strong>Your Earnings:</strong> $${data.hostEarnings}</p>
              <p><strong>Platform Fee:</strong> $${data.platformFee}</p>
            </div>
            <p>Funds will be transferred to your connected bank account within 2-7 business days.</p>
            <a href="${process.env.FRONTEND_URL}/host/earnings" style="background: #22C55E; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">View Earnings</a>
          </div>
        `
      }
    };

    return templates[type] || null;
  }

  // Send email
  async sendEmail(to, type, data) {
    try {
      const template = this.getTemplate(type, data);
      if (!template) {
        throw new Error(`Email template '${type}' not found`);
      }

      const mailOptions = {
        from: `OnPurpose <${process.env.FROM_EMAIL}>`,
        to,
        subject: template.subject,
        html: template.html
      };

      const result = await this.transporter.sendMail(mailOptions);
      return result;
    } catch (error) {
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  // Send welcome email
  async sendWelcomeEmail(user) {
    return this.sendEmail(user.email, 'welcome', {
      firstName: user.firstName
    });
  }

  // Send host approval email
  async sendHostApprovalEmail(user, host) {
    return this.sendEmail(user.email, 'hostApproval', {
      firstName: user.firstName,
      category: host.category,
      hourlyRate: host.hourlyRate
    });
  }

  // Send booking confirmation
  async sendBookingConfirmation(booking, guest, host) {
    return this.sendEmail(guest.email, 'bookingConfirmation', {
      guestName: guest.firstName,
      hostName: `${host.firstName} ${host.lastName}`,
      category: host.category,
      startTime: booking.startTime.toLocaleString(),
      duration: Math.ceil((booking.endTime - booking.startTime) / (1000 * 60 * 60)),
      totalAmount: booking.totalAmount,
      bookingId: booking.id
    });
  }

  // Send payment notification to host
  async sendPaymentNotification(booking, guest, host) {
    return this.sendEmail(host.email, 'paymentReceived', {
      hostName: host.firstName,
      guestName: `${guest.firstName} ${guest.lastName}`,
      experienceDate: booking.startTime.toDateString(),
      hostEarnings: booking.hostEarnings,
      platformFee: booking.platformFee
    });
  }
}

module.exports = new EmailService();
