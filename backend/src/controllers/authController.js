const argon2 = require('argon2');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const prisma = require('../db');
const { sendVerificationEmail } = require('../utils/emailService');
const { demoPortals } = require('../config/demoPortals');

const getDemoPortalCredentials = (req, res) => {
  return res.status(200).json({
    portals: Object.fromEntries(
      demoPortals.map(({ email, password, role }) => [role, { email, password }])
    ),
  });
};

const renderVerificationHtml = ({ success, title, message, redirectUrl, buttonText }) => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title} — Legal Metrology Verification System</title>
  <meta http-equiv="refresh" content="3;url=${redirectUrl}" />
  <style>
    body {
      margin: 0;
      padding: 0;
      background: #F0F4FF;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
    }
    .card {
      background: #ffffff;
      max-width: 500px;
      margin: 20px;
      padding: 40px 32px;
      border-radius: 16px;
      box-shadow: 0 10px 30px rgba(13, 71, 161, 0.12);
      text-align: center;
    }
    .icon {
      font-size: 64px;
      line-height: 1;
      margin-bottom: 20px;
    }
    h1 {
      font-size: 24px;
      color: #0D47A1;
      margin: 0 0 12px;
      font-weight: 700;
    }
    p {
      color: #4B5563;
      font-size: 15px;
      line-height: 1.6;
      margin: 0 0 24px;
    }
    .btn {
      display: inline-block;
      background: linear-gradient(135deg, #0D47A1 0%, #1565C0 100%);
      color: #ffffff;
      text-decoration: none;
      font-weight: 600;
      padding: 12px 28px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(13, 71, 161, 0.25);
      transition: all 0.2s ease;
    }
    .btn:hover {
      background: linear-gradient(135deg, #0B3C8A 0%, #0D47A1 100%);
      transform: translateY(-1px);
    }
    .countdown {
      margin-top: 18px;
      font-size: 13px;
      color: #9CA3AF;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">${success ? '✅' : '⚠️'}</div>
    <h1>${title}</h1>
    <p>${message}</p>
    <a href="${redirectUrl}" class="btn">${buttonText || 'Proceed to Login →'}</a>
    <div class="countdown">Automatically redirecting to login in a few seconds...</div>
  </div>
</body>
</html>`;
};

const register = async (req, res) => {
  try {
    const { email, password, full_name, phone, organization, address, city, state, pincode } = req.body;

    // 1. Validate credentials
    if (!email || !password || password.length < 12) {
      return res.status(400).json({ error: 'Valid email and password (min 12 chars) are required.' });
    }

    // 2. Validate all profile fields
    const missing = [];
    if (!full_name)    missing.push('Full Name');
    if (!phone)        missing.push('Phone Number');
    if (!organization) missing.push('Organization');
    if (!address)      missing.push('Address');
    if (!city)         missing.push('City');
    if (!state)        missing.push('State');
    if (!pincode)      missing.push('Pincode');

    if (missing.length > 0) {
      return res.status(400).json({ error: `The following fields are required: ${missing.join(', ')}` });
    }

    const normalizedEmail = (email || '').toLowerCase().trim();

    // 3. Check if email already exists
    const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existingUser) {
      // If user exists and is NOT verified, refresh token and resend verification email!
      if (!existingUser.is_verified) {
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);

        await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            verification_token: token,
            verification_token_expires_at: expiresAt,
          },
        });

        const sendResult = await sendVerificationEmail(normalizedEmail, token);
        return res.status(200).json({
          message: 'If this email is eligible, a verification link has been sent.',
          verificationUrl: sendResult?.verificationUrl,
        });
      }

      // If user is already verified, inform them cleanly
      return res.status(200).json({
        message: 'This email is already registered and verified. You can log in directly.',
        alreadyVerified: true,
      });
    }

    // 4. Hash password
    const password_hash = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16,
      hashLength: 50,
    });

    // 5. Generate verification token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // 6. Create user + profile in a single transaction
    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: normalizedEmail,
          password_hash,
          is_verified: true,
          status: 'ACTIVE',
          verification_token: token,
          verification_token_expires_at: expiresAt,
        },
      });

      await tx.userProfile.create({
        data: {
          user_id: user.id,
          full_name,
          phone,
          organization,
          address,
          city,
          state,
          pincode,
        },
      });
    });

    // 7. Send verification email
    const sendResult = await sendVerificationEmail(normalizedEmail, token);

    return res.status(200).json({
      message: 'If this email is eligible, a verification link has been sent.',
      verificationUrl: sendResult?.verificationUrl,
    });

  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Registration failed. Please verify your submitted information and try again.' });
  }
};

const verify = async (req, res) => {
  try {
    const { token } = req.query;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const acceptsHtml = req.headers.accept && req.headers.accept.includes('text/html');

    if (!token) {
      if (acceptsHtml) {
        return res.status(400).send(renderVerificationHtml({
          success: false,
          title: 'Invalid Verification Link',
          message: 'No verification token was provided. Please verify the link in your email.',
          redirectUrl: `${frontendUrl}/login?error=invalid_token`,
          buttonText: 'Return to Login',
        }));
      }
      return res.status(400).json({ error: 'Invalid or expired verification link' });
    }

    // Find user with this token
    const user = await prisma.user.findFirst({
      where: { verification_token: token },
    });

    // Validate token existence
    if (!user) {
      if (acceptsHtml) {
        return res.status(400).send(renderVerificationHtml({
          success: false,
          title: 'Invalid Verification Link',
          message: 'This verification link is invalid or has already been utilized. Please sign in or request a new verification link.',
          redirectUrl: `${frontendUrl}/login?error=invalid_token`,
          buttonText: 'Return to Login',
        }));
      }
      return res.status(400).json({ error: 'Invalid or expired verification link' });
    }

    // Validate expiration
    if (!user.verification_token_expires_at || new Date() > user.verification_token_expires_at) {
      if (acceptsHtml) {
        return res.status(400).send(renderVerificationHtml({
          success: false,
          title: 'Verification Link Expired',
          message: 'This verification link has expired (24-hour limit). Please sign in to request a fresh link.',
          redirectUrl: `${frontendUrl}/login?error=token_expired&email=${encodeURIComponent(user.email)}`,
          buttonText: 'Request New Link / Login',
        }));
      }
      return res.status(400).json({ error: 'Verification link has expired. Please request a new one.' });
    }

    // Mark as verified
    await prisma.user.update({
      where: { id: user.id },
      data: {
        is_verified: true,
        verification_token: null,
        verification_token_expires_at: null,
      },
    });

    if (acceptsHtml) {
      return res.status(200).send(renderVerificationHtml({
        success: true,
        title: 'Email Verified Successfully!',
        message: 'Your email has been verified. Welcome to the Legal Metrology Verification System.',
        redirectUrl: `${frontendUrl}/login?verified=true&email=${encodeURIComponent(user.email)}`,
        buttonText: 'Proceed to Login →',
      }));
    }

    return res.status(200).json({ message: 'Email verified successfully. You can now log in.' });
  } catch (error) {
    console.error('Verification error:', error);
    if (req.headers.accept && req.headers.accept.includes('text/html')) {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      return res.status(500).send(renderVerificationHtml({
        success: false,
        title: 'Verification Failed',
        message: 'A server error occurred while verifying your email. Please try again.',
        redirectUrl: `${frontendUrl}/login?error=server_error`,
        buttonText: 'Return to Login',
      }));
    }
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const normalizedEmail = (email || '').toLowerCase().trim();
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    if (!user) {
      // Do not reveal whether user exists
      return res.status(200).json({ message: 'If this email is eligible, a new verification link has been sent.' });
    }

    if (user.is_verified) {
      return res.status(200).json({
        message: 'This email is already verified. You can log in directly.',
        alreadyVerified: true,
      });
    }

    // Generate fresh token and set expiry
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        verification_token: token,
        verification_token_expires_at: expiresAt,
      },
    });

    const sendResult = await sendVerificationEmail(normalizedEmail, token);

    return res.status(200).json({
      message: 'A fresh verification link has been sent to your email.',
      verificationUrl: process.env.NODE_ENV !== 'production' ? sendResult?.verificationUrl : undefined,
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password, role, portalRole } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const normalizedEmail = (email || '').toLowerCase().trim();
    // Portal role requested (defaults to 'user' for public citizen portal)
    const requestedRole = (role || portalRole || 'user').toLowerCase().trim();

    // Find user with specialized profiles
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: {
        adminProfile: true,
        lmoProfile: true,
        fieldOfficerProfile: true,
        gatcProfile: true,
        profile: true,
      },
    });

    // 1. Check if user account is locked
    if (user && user.lockout_until && new Date() < user.lockout_until) {
      return res.status(423).json({ error: 'Account locked. Please try again later.' });
    }

    // 2. Verify credentials
    let isPasswordValid = false;
    if (user) {
      isPasswordValid = await argon2.verify(user.password_hash, password);
    }

    // 3. Handle credential failure
    if (!user || !isPasswordValid) {
      if (user) {
        let newAttempts = user.failed_login_attempts + 1;
        let lockoutUntil = user.lockout_until;

        if (newAttempts >= 5) {
          lockoutUntil = new Date();
          lockoutUntil.setMinutes(lockoutUntil.getMinutes() + 15); // Lockout for 15 mins
        }

        await prisma.user.update({
          where: { id: user.id },
          data: {
            failed_login_attempts: newAttempts,
            lockout_until: lockoutUntil,
          },
        });
      }
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // 3.5. Strictly validate portal & role match
    const ROLE_LABELS = {
      user: 'Public Citizen / Trader',
      lmo: 'Legal Metrology Officer (LMO)',
      field_officer: 'Field Verification Officer',
      gatc: 'Government Approved Test Centre (GATC)',
      admin: 'Administrator',
    };

    const PORTAL_LABELS = {
      user: 'Public User Portal',
      lmo: 'LMO Officer Portal',
      field_officer: 'Field Officer Portal',
      gatc: 'GATC Testing Centre Portal',
      admin: 'Administrator Portal',
    };

    if (requestedRole && user.role !== requestedRole) {
      const userRoleLabel = ROLE_LABELS[user.role] || user.role;
      const attemptedPortal = PORTAL_LABELS[requestedRole] || `${requestedRole} portal`;
      const correctPortal = PORTAL_LABELS[user.role] || `${user.role} portal`;

      return res.status(403).json({
        error: `Portal Access Restricted: This account belongs to a ${userRoleLabel}. You cannot log in through the ${attemptedPortal}. Please switch to the ${correctPortal}.`,
        code: 'PORTAL_ROLE_MISMATCH',
        expectedRole: requestedRole,
        actualRole: user.role,
        suggestedPortalUrl: `/login?role=${user.role}`,
      });
    }

    // 4. Handle success and account status
    if (user.status === 'SUSPENDED') {
      return res.status(403).json({ error: 'Account suspended. Contact the State Directorate Admin.' });
    }

    if (user.status === 'PENDING_VERIFICATION') {
      return res.status(403).json({ error: 'Your officer dossier is awaiting Central Admin HRMS & Vigilance Clearance.' });
    }

    if (user.status === 'PENDING_ACTIVATION') {
      return res.status(403).json({ error: 'Account clearance granted! First-time activation is required using your activation token.' });
    }

    if (!user.is_verified) {
      if (user.role === 'user') {
        // Auto-verify citizen on legitimate sign-in to prevent email sandbox lockout
        await prisma.user.update({
          where: { id: user.id },
          data: { is_verified: true, status: 'ACTIVE' },
        });
      } else {
        return res.status(403).json({
          error: 'Please verify your email before logging in. Check your inbox or request a new verification link.',
          code: 'EMAIL_NOT_VERIFIED',
          email: user.email,
        });
      }
    }

    // Reset lockout counters
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failed_login_attempts: 0,
        lockout_until: null,
      },
    });

    // Extract specialized metadata from the appropriate profile table
    const employeeCode = user.adminProfile?.employeeCode || user.lmoProfile?.employeeCode || user.fieldOfficerProfile?.employeeCode || user.gatcProfile?.gatc_code || null;
    const assignedJurisdiction = user.adminProfile?.department || user.lmoProfile?.assignedJurisdiction || user.fieldOfficerProfile?.circleZone || user.gatcProfile?.centre_name || null;
    const dscKeyId = user.lmoProfile?.dscKeyId || user.gatcProfile?.accreditation_no || null;

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Attach session cookie
    res.cookie('sessionId', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    return res.status(200).json({ 
      message: 'Logged in successfully',
      token,
      user: { 
        id: user.id, 
        email: user.email, 
        role: user.role,
        status: user.status,
        employeeCode,
        assignedJurisdiction,
        dscKeyId,
        gatcProfile: user.gatcProfile,
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

const logout = async (req, res) => {
  // Clear the cookie
  res.cookie('sessionId', '', {
    httpOnly: true,
    expires: new Date(0), // Max-Age=0 essentially
  });
  
  return res.status(200).json({ message: 'Logged out successfully' });
};

const me = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        adminProfile: true,
        lmoProfile: true,
        fieldOfficerProfile: true,
        gatcProfile: true,
        profile: true,
      },
    });

    if (!user) {
      return res.status(401).json({ error: 'User session not found or account deactivated.' });
    }

    const employeeCode = user.adminProfile?.employeeCode || user.lmoProfile?.employeeCode || user.fieldOfficerProfile?.employeeCode || user.gatcProfile?.gatc_code || null;
    const assignedJurisdiction = user.adminProfile?.department || user.lmoProfile?.assignedJurisdiction || user.fieldOfficerProfile?.circleZone || user.gatcProfile?.centre_name || null;
    const dscKeyId = user.lmoProfile?.dscKeyId || user.gatcProfile?.accreditation_no || null;

    return res.status(200).json({ 
      user: { 
        id: user.id, 
        email: user.email, 
        role: user.role,
        status: user.status,
        employeeCode,
        assignedJurisdiction,
        dscKeyId,
        profile: user.profile || user.adminProfile || user.lmoProfile || user.fieldOfficerProfile || user.gatcProfile,
      } 
    });

  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

const saveProfile = async (req, res) => {
  try {
    const { full_name, phone, address, city, state, pincode, organization } = req.body;

    // Validate all fields are required
    const missing = [];
    if (!full_name)    missing.push('Full Name');
    if (!phone)        missing.push('Phone Number');
    if (!organization) missing.push('Organization');
    if (!address)      missing.push('Address');
    if (!city)         missing.push('City');
    if (!state)        missing.push('State');
    if (!pincode)      missing.push('Pincode');

    if (missing.length > 0) {
      return res.status(400).json({ error: `The following fields are required: ${missing.join(', ')}` });
    }

    // Upsert profile (create or update)
    const profile = await prisma.userProfile.upsert({
      where: { user_id: req.user.id },
      update: { full_name, phone, address, city, state, pincode, organization },
      create: { user_id: req.user.id, full_name, phone, address, city, state, pincode, organization },
    });

    return res.status(200).json({ message: 'Profile saved successfully', profile });
  } catch (error) {
    console.error('Save profile error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// First-time Field Officer Activation with Admin-issued single-use token
const activateFieldOfficer = async (req, res) => {
  try {
    const { email, activationToken, newPassword } = req.body;

    if (!email || !activationToken || !newPassword) {
      return res.status(400).json({ error: 'Official email, single-use activation token, and new password are required.' });
    }

    if (newPassword.length < 12) {
      return res.status(400).json({ error: 'Password must be at least 12 characters long.' });
    }

    const user = await prisma.user.findFirst({
      where: {
        email: email.toLowerCase(),
        role: 'field_officer',
      },
      include: { fieldOfficerProfile: true },
    });

    if (!user || !user.fieldOfficerProfile) {
      return res.status(404).json({ error: 'No Field Officer profile found with this email address.' });
    }

    if (!user.fieldOfficerProfile.activationToken || user.fieldOfficerProfile.activationToken.trim().toUpperCase() !== activationToken.trim().toUpperCase()) {
      return res.status(400).json({ error: 'Invalid or expired activation token. Please verify with Central Admin.' });
    }

    // Hash permanent password
    const password_hash = await argon2.hash(newPassword, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16,
      hashLength: 50,
    });

    // Activate officer in User and clear activationToken in FieldOfficerProfile
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: {
          password_hash,
          status: 'ACTIVE',
          is_verified: true,
        },
      }),
      prisma.fieldOfficerProfile.update({
        where: { user_id: user.id },
        data: {
          activationToken: null,
          activatedAt: new Date(),
        },
      }),
    ]);

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: 'FIELD_OFFICER_ACTIVATED',
        actor: user.email,
        target: user.email,
        details: `Field Officer ${user.fieldOfficerProfile.full_name} (${user.fieldOfficerProfile.employeeCode}) completed first-time token activation.`,
      },
    });

    // Session token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.cookie('sessionId', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: 'Account successfully activated.',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        status: 'ACTIVE',
        employeeCode: user.fieldOfficerProfile.employeeCode,
        assignedJurisdiction: user.fieldOfficerProfile.circleZone,
      },
    });
  } catch (error) {
    console.error('Officer activation error:', error);
    return res.status(500).json({ error: 'Internal Server Error during officer activation.' });
  }
};



module.exports = {
  getDemoPortalCredentials,
  register,
  verify,
  resendVerification,
  login,
  logout,
  me,
  saveProfile,
  activateFieldOfficer,
};
