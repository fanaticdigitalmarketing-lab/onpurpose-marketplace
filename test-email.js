require('dotenv').config();
const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);
async function run() {
  const { data, error } = await resend.emails.send({
    from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
    to: 'onpurposeearth@gmail.com',
    subject: 'OnPurpose — Email system test',
    html: '<h2 style="font-family:Georgia,serif;color:#1a2744">Email is working</h2><p>Sent: ' + new Date().toLocaleString() + '</p>',
  });
  if (error) { console.error('FAILED:', error); process.exit(1); }
  console.log('SUCCESS — ID:', data.id);
  console.log('Check onpurposeearth@gmail.com now.');
}
run();
