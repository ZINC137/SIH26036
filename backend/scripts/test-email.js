require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function test() {
  console.log('Testing Gmail with:', process.env.EMAIL_USER);

  try {
    const info = await transporter.sendMail({
      from: `"Legal Metrology System" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // Send test to yourself
      subject: '✅ Test Email — Legal Metrology System',
      html: '<h2 style="color:#0D47A1">Gmail email service is working! 🎉</h2><p>Your verification emails will be sent from this account.</p>',
    });

    console.log('✅ Email test PASSED! MessageId:', info.messageId);
    console.log('📬 Check your inbox at:', process.env.EMAIL_USER);
  } catch (error) {
    console.error('❌ Email test FAILED:', error.message);
  }
}

test();
