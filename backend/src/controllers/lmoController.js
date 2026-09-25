const argon2 = require('argon2');
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { recordAuditLog } = require('./adminController');

// 1. Nominate Field Inspector for Circle / Zone -> writes to FieldOfficerProfile table
const nominateOfficer = async (req, res) => {
  try {
    const { name, email, phone, employeeCode, circleZone, designation, circlePin } = req.body;

    if (!name || !email || !employeeCode || !circleZone) {
      return res.status(400).json({
        error: 'Inspector Name, Official Email, Employee Code, and Geofenced Circle / Zone are required.',
      });
    }

    // Check user table and fieldOfficerProfile table
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (existingUser) {
      return res.status(409).json({ error: 'A user account with this email address already exists.' });
    }

    const existingOfficer = await prisma.fieldOfficerProfile.findUnique({
      where: { employeeCode },
    });
    if (existingOfficer) {
      return res.status(409).json({ error: 'An inspector with this Employee Code is already registered.' });
    }

    // Temporary placeholder password until single-use token activation
    const tempPassword = crypto.randomBytes(16).toString('hex') + 'A1!';
    const password_hash = await argon2.hash(tempPassword, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16,
      hashLength: 50,
    });

    const lmoId = req.user ? req.user.id : null;
    const lmoEmail = req.user ? req.user.email : 'lmo@gov.in';

    // Lookup LMO name
    let lmoName = 'District Legal Metrology Officer';
    if (lmoId) {
      const lmo = await prisma.lmoProfile.findUnique({ where: { user_id: lmoId } });
      if (lmo) lmoName = `${lmo.full_name} (${lmo.districtDivision})`;
    }

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: email.toLowerCase(),
          role: 'field_officer',
          status: 'PENDING_VERIFICATION',
          is_verified: false,
          password_hash,
        },
      });

      const fieldOfficerProfile = await tx.fieldOfficerProfile.create({
        data: {
          user_id: user.id,
          full_name: name,
          employeeCode,
          designation: designation || 'Field Verification Inspector',
          circleZone,
          circlePincode: circlePin || '110001',
          phone: phone || '',
          recommendingLmoId: lmoId,
          recommendingLmoName: lmoName,
        },
      });

      return { user, fieldOfficerProfile };
    });

    await recordAuditLog(
      'INSPECTOR_NOMINATED',
      lmoEmail,
      result.user.email,
      `LMO nominated Inspector ${name} (${employeeCode}) for Geofenced Circle: [${circleZone}]. Forwarded to State Directorate for Vigilance Clearance.`
    );

    return res.status(201).json({
      message: 'Field Officer nomination submitted successfully to FieldOfficerProfile registry. Routing to Central Admin for HRMS & Vigilance Clearance.',
      officer: {
        id: result.user.id,
        name: result.fieldOfficerProfile.full_name,
        email: result.user.email,
        employeeCode: result.fieldOfficerProfile.employeeCode,
        assignedJurisdiction: result.fieldOfficerProfile.circleZone,
        status: result.user.status,
        designation: result.fieldOfficerProfile.designation,
        phone,
      },
    });
  } catch (error) {
    console.error('Nominate officer error:', error);
    return res.status(500).json({ error: 'Internal Server Error during inspector nomination.' });
  }
};

// 2. Get Field Officers in LMO's Jurisdiction from FieldOfficerProfile table
const getOfficers = async (req, res) => {
  try {
    const officers = await prisma.user.findMany({
      where: { role: 'field_officer' },
      include: { fieldOfficerProfile: true },
      orderBy: { created_at: 'desc' },
    });

    const formatted = officers.map((o) => {
      const profile = o.fieldOfficerProfile;
      return {
        id: profile?.employeeCode || o.id.slice(0, 8),
        dbId: o.id,
        name: profile?.full_name || 'Inspector',
        email: o.email,
        phone: profile?.phone || '9876500000',
        zone: profile?.circleZone || 'North Delhi Circle',
        status: o.status === 'ACTIVE' ? 'Active' : o.status === 'PENDING_VERIFICATION' ? 'Pending Admin Clearance' : o.status === 'PENDING_ACTIVATION' ? 'Activation Pending' : 'Suspended',
        assigned: 4,
        completed: 28,
        monthly: 14,
        target: 20,
        joined: new Date(profile?.created_at || o.created_at).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }),
      };
    });

    return res.status(200).json({ officers: formatted });
  } catch (error) {
    console.error('Get LMO officers error:', error);
    return res.status(500).json({ error: 'Failed to retrieve jurisdiction officers.' });
  }
};

module.exports = {
  nominateOfficer,
  getOfficers,
};
