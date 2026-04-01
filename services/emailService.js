require('dotenv').config();
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async ({ to, subject, html, from }) => {
  try {
    const { data, error } = await resend.emails.send({
      from: from || process.env.EMAIL_FROM || 'onboarding@resend.dev',
      to,
      subject,
      html,
    });
    
    if (error) {
      console.error('Email send error:', error);
      return { success: false, error };
    }
    
    console.log('Email sent successfully:', data.id);
    return { success: true, data };
  } catch (error) {
    console.error('Email service error:', error);
    return { success: false, error };
  }
};

module.exports = { sendEmail };
