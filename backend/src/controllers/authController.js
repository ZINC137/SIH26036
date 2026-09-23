const argon2 = require('argon2');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { sendVerificationEmail } = require('../utils/emailService');
const prisma = new PrismaClient();

const register = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validate payload
    if (!email || !password || password.length < 12) {
      return res.status(400).json({ error: 'Valid email and password (min 12 chars) are required.' });
    }

    // 2. Check if email exists
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      // Do not throw error stating email is taken
      return res.status(200).json({ message: 'If this email is eligible, a verification link has been sent.' });
    }

    // 3. Create new user
    // Hash password
    const password_hash = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16,
      hashLength: 50,
    });

    // Generate token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours from now

    // Insert user
    await prisma.user.create({
      data: {
        email,
        password_hash,
        is_verified: false,
        verification_token: token,
        verification_token_expires_at: expiresAt,
      },
    });

    // Send email
    await sendVerificationEmail(email, token);

    return res.status(200).json({ message: 'If this email is eligible, a verification link has been sent.' });

  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

const verify = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ error: 'Invalid or expired verification link' });
    }

    // Find user with this token
    const user = await prisma.user.findFirst({
      where: { verification_token: token },
    });

    // Validate token existence and expiration
    if (!user || !user.verification_token_expires_at || new Date() > user.verification_token_expires_at) {
      return res.status(400).json({ error: 'Invalid or expired verification link' });
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

    return res.status(200).json({ message: 'Email verified successfully. You can now log in.' });
  } catch (error) {
    console.error('Verification error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    // 1. Check if user account is locked
    if (user && user.lockout_until && new Date() < user.lockout_until) {
      return res.status(423).json({ error: 'Account locked. Please try again later.' });
    }

    // 2. Verify credentials
    let isPasswordValid = false;
    if (user) {
      isPasswordValid = await argon2.verify(user.password_hash, password);
    }

    // 3. Handle failure
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

    // 4. Handle success
    if (!user.is_verified) {
      return res.status(403).json({ error: 'Please verify your email before logging in' });
    }

    // Reset lockout counters
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failed_login_attempts: 0,
        lockout_until: null,
      },
    });

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
      sameSite: 'Lax',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    return res.status(200).json({ 
      message: 'Logged in successfully',
      user: { id: user.id, email: user.email, role: user.role }
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
      include: { profile: true },
    });
    return res.status(200).json({ user: { id: user.id, email: user.email, profile: user.profile } });
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

const saveProfile = async (req, res) => {
  try {
    const { full_name, phone, address, city, state, pincode, organization } = req.body;

    if (!full_name) {
      return res.status(400).json({ error: 'Full name is required' });
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

module.exports = {
  register,
  verify,
  login,
  logout,
  me,
  saveProfile
};
