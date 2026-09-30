const nodemailer = require('nodemailer');

// Create reusable transporter using Gmail SSL on port 465
const createTransporter = () => {
  const user = (process.env.EMAIL_USER || '').trim();
  const pass = (process.env.EMAIL_PASS || '').replace(/\s+/g, '').trim();

  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // Direct SSL
    connectionTimeout: 8000,
    greetingTimeout: 8000,
    socketTimeout: 8000,
    auth: {
      user,
      pass,
    },
  });
};

const getEmailHtml = (verificationUrl) => `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
  </head>
  <body style="margin:0;padding:0;background:#F0F4FF;font-family:'Segoe UI',Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#F0F4FF;padding:40px 20px;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(13,71,161,0.12);">
            <tr>
              <td style="background:linear-gradient(135deg,#0D47A1,#1565C0);padding:32px 40px;text-align:center;">
                <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:0.5px;">
                  Legal Metrology Verification System
                </h1>
                <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:13px;">
                  Ministry of Consumer Affairs, Government of India
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:40px;">
                <h2 style="margin:0 0 12px;color:#0D47A1;font-size:24px;font-weight:700;">
                  Verify Your Email Address
                </h2>
                <p style="margin:0 0 24px;color:#424242;font-size:15px;line-height:1.6;">
                  Thank you for registering! You're almost there.
                  Click the button below to verify your email address and activate your account.
                </p>
                <table cellpadding="0" cellspacing="0" style="margin:0 auto 32px;">
                  <tr>
                    <td style="border-radius:8px;background:linear-gradient(135deg,#0D47A1,#1565C0);box-shadow:0 4px 12px rgba(13,71,161,0.35);">
                      <a href="${verificationUrl}"
                         style="display:inline-block;padding:14px 36px;color:#ffffff;font-size:16px;font-weight:700;text-decoration:none;border-radius:8px;letter-spacing:0.5px;">
                        ✅ Verify My Email
                      </a>
                    </td>
                  </tr>
                </table>
                <div style="background:#FFF8E1;border-left:4px solid #FF9800;border-radius:4px;padding:14px 18px;margin-bottom:24px;">
                  <p style="margin:0;color:#795548;font-size:13px;line-height:1.6;">
                    ⚠️ This link will expire in <strong>24 hours</strong>.<br />
                    If you did not create an account, you can safely ignore this email.
                  </p>
                </div>
                <p style="margin:0 0 8px;color:#757575;font-size:13px;">
                  If the button doesn't work, copy and paste this link into your browser:
                </p>
                <p style="margin:0;word-break:break-all;">
                  <a href="${verificationUrl}" style="color:#1565C0;font-size:12px;">${verificationUrl}</a>
                </p>
              </td>
            </tr>
            <tr>
              <td style="background:#F5F5F5;padding:20px 40px;text-align:center;border-top:1px solid #E0E0E0;">
                <p style="margin:0;color:#9E9E9E;font-size:12px;">
                  © 2026 Legal Metrology Verification System &nbsp;|&nbsp; Ministry of Consumer Affairs
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

/**
 * Sends a verification email to the newly registered user.
 * @param {string} toEmail - The recipient's email address
 * @param {string} token - The verification token
 */
const sendVerificationEmail = async (toEmail, token) => {
  const backendUrl = (process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5001}`).replace(/\/+$/, '');
  const verificationUrl = `${backendUrl}/api/auth/verify?token=${token}`;

  // Priority 1: Resend HTTP API (Fastest and 100% reliable from cloud hosts)
  if (process.env.RESEND_API_KEY) {
    try {
      const { Resend } = require('resend');
      const resend = new Resend(process.env.RESEND_API_KEY.trim());
      const resendFrom = process.env.RESEND_FROM || 'Legal Metrology <onboarding@resend.dev>';
      const sendRes = await resend.emails.send({
        from: resendFrom,
        to: toEmail,
        subject: '✅ Verify Your Email — Legal Metrology Verification System',
        html: getEmailHtml(verificationUrl),
      });
      console.log(`[RESEND EMAIL] Delivered verification email to ${toEmail}:`, sendRes);
      return { success: true, verificationUrl, messageId: sendRes.data?.id };
    } catch (resendErr) {
      console.warn(`[RESEND EMAIL NOTICE] Could not send via Resend (${resendErr.message}). Falling back.`);
    }
  }

  // If no credentials or mock credentials, return immediately with link
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || process.env.EMAIL_PASS === 'mock-dev-password') {
    console.log(`[EMAIL DEV/DEMO] Generated verification link for ${toEmail}: ${verificationUrl}`);
    return { success: true, verificationUrl, simulated: true };
  }

  const transporter = createTransporter();

  const mailOptions = {
    from: `"Legal Metrology Verification System" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: '✅ Verify Your Email — Legal Metrology Verification System',
    html: getEmailHtml(verificationUrl),
  };

  try {
    const sendPromise = transporter.sendMail(mailOptions);
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('SMTP timeout after 4000ms')), 4000)
    );

    const info = await Promise.race([sendPromise, timeoutPromise]);
    console.log(`[EMAIL] Verification email sent to ${toEmail} — MessageId: ${info.messageId}`);
    return { success: true, messageId: info.messageId, verificationUrl };
  } catch (error) {
    console.warn(`[EMAIL NOTICE] Could not send via SMTP to ${toEmail} (${error.message}). Returning direct link.`);
    console.log(`[EMAIL FALLBACK] Verification URL: ${verificationUrl}`);
    return { success: true, verificationUrl, simulated: true, error: error.message };
  }
};

module.exports = { sendVerificationEmail };
