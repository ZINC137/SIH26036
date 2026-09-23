const nodemailer = require('nodemailer');

// Create reusable transporter using Gmail
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // Gmail App Password (16 chars)
    },
  });
};

/**
 * Sends a verification email to the newly registered user.
 * @param {string} toEmail - The recipient's email address
 * @param {string} token - The verification token
 */
const sendVerificationEmail = async (toEmail, token) => {
  const verificationUrl = `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/auth/verify?token=${token}`;

  const transporter = createTransporter();

  const mailOptions = {
    from: `"Legal Metrology Verification System" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: '✅ Verify Your Email — Legal Metrology Verification System',
    html: `
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

                  <!-- Header -->
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

                  <!-- Body -->
                  <tr>
                    <td style="padding:40px;">
                      <h2 style="margin:0 0 12px;color:#0D47A1;font-size:24px;font-weight:700;">
                        Verify Your Email Address
                      </h2>
                      <p style="margin:0 0 24px;color:#424242;font-size:15px;line-height:1.6;">
                        Thank you for registering! You're almost there.
                        Click the button below to verify your email address and activate your account.
                      </p>

                      <!-- CTA Button -->
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

                      <!-- Warning box -->
                      <div style="background:#FFF8E1;border-left:4px solid #FF9800;border-radius:4px;padding:14px 18px;margin-bottom:24px;">
                        <p style="margin:0;color:#795548;font-size:13px;line-height:1.6;">
                          ⚠️ This link will expire in <strong>24 hours</strong>.
                          If you did not create an account, you can safely ignore this email.
                        </p>
                      </div>

                      <!-- Fallback link -->
                      <p style="margin:0 0 8px;color:#757575;font-size:13px;">
                        If the button doesn't work, copy and paste this link into your browser:
                      </p>
                      <p style="margin:0;word-break:break-all;">
                        <a href="${verificationUrl}" style="color:#1565C0;font-size:12px;">${verificationUrl}</a>
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
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
      </html>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[EMAIL] Verification email sent to ${toEmail} — MessageId: ${info.messageId}`);
  } catch (error) {
    console.error(`[EMAIL] Failed to send to ${toEmail}:`, error.message);
    // Fallback: still print the link to console so dev can test
    console.log(`[EMAIL FALLBACK] Verification URL: ${verificationUrl}`);
  }
};

module.exports = { sendVerificationEmail };
