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

    const formatted = await Promise.all(officers.map(async (o) => {
      const profile = o.fieldOfficerProfile;
      const assignedCount = await prisma.application.count({
        where: { assigned_fo_id: o.id, status: { in: ['Under Inspection', 'Pending'] } },
      });
      const completedCount = await prisma.application.count({
        where: { assigned_fo_id: o.id, status: 'Approved' },
      });

      return {
        id: profile?.employeeCode || o.id.slice(0, 8),
        dbId: o.id,
        name: profile?.full_name || 'Field Inspector',
        email: o.email,
        phone: profile?.phone || '',
        zone: profile?.circleZone || 'Assigned Circle',
        status: o.status === 'ACTIVE' ? 'Active' : o.status === 'PENDING_VERIFICATION' ? 'Pending Admin Clearance' : o.status === 'PENDING_ACTIVATION' ? 'Activation Pending' : 'Suspended',
        assigned: assignedCount,
        completed: completedCount,
        monthly: completedCount,
        target: 20,
        joined: new Date(profile?.created_at || o.created_at).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }),
      };
    }));

    return res.status(200).json({ officers: formatted });
  } catch (error) {
    console.error('Get LMO officers error:', error);
    return res.status(500).json({ error: 'Failed to retrieve jurisdiction officers.' });
  }
};

// 3. Get Applications in Jurisdiction for LMO review
const getLmoApplications = async (req, res) => {
  try {
    const { status, search } = req.query;

    const where = {};
    if (status && status !== 'All') {
      where.status = status;
    }

    const apps = await prisma.application.findMany({
      where,
      orderBy: { submitted_at: 'desc' },
      include: { user: { include: { profile: true } } },
    });

    let filtered = apps;
    if (search) {
      const q = search.toLowerCase();
      filtered = apps.filter(
        (a) =>
          a.app_number.toLowerCase().includes(q) ||
          a.business_name.toLowerCase().includes(q) ||
          a.instrument_type.toLowerCase().includes(q) ||
          a.serial_no.toLowerCase().includes(q)
      );
    }

    const formatted = filtered.map((a) => ({
      id: a.id,
      appNumber: a.app_number,
      applicant: a.business_name,
      contact: a.contact_phone,
      contactEmail: a.contact_email,
      contactPerson: a.contact_name,
      instrument: `${a.instrument_type} (${a.capacity}${a.unit})`,
      instrumentType: a.instrument_type,
      make: a.make,
      model: a.model,
      serial: a.serial_no,
      capacity: `${a.capacity} ${a.unit}`,
      accuracyClass: a.accuracy_class,
      address: `${a.address}, ${a.city}, ${a.state} - ${a.pincode}`,
      submitted: new Date(a.submitted_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      priority: a.priority || 'Normal',
      status: a.status,
      assignedFoId: a.assigned_fo_id,
      assignedFoName: a.assigned_fo_name,
      assignedFoCode: a.assigned_fo_code,
      scheduledDate: a.scheduled_date,
      scheduledTime: a.scheduled_time,
      fee: a.fee_amount,
      paymentStatus: a.payment_status,
      paymentRef: a.payment_ref,
      certificateNo: a.certificate_no,
      inspectionResult: a.inspection_result,
      securitySealNo: a.security_seal_no,
      stampedBy: a.stamped_by,
      raw: a,
    }));

    return res.status(200).json({ applications: formatted });
  } catch (error) {
    console.error('Get LMO applications error:', error);
    return res.status(500).json({ error: 'Failed to retrieve applications.' });
  }
};

// 4. Get LMO Dashboard Key Performance Indicators (Live DB stats)
const getLmoStats = async (req, res) => {
  try {
    const [pendingCount, underInspectionCount, approvedCount, rejectedCount, officersCount] = await Promise.all([
      prisma.application.count({ where: { status: 'Pending' } }),
      prisma.application.count({ where: { status: 'Under Inspection' } }),
      prisma.application.count({ where: { status: 'Approved' } }),
      prisma.application.count({ where: { status: 'Rejected' } }),
      prisma.user.count({ where: { role: 'field_officer', status: 'ACTIVE' } }),
    ]);

    return res.status(200).json({
      stats: {
        pending: pendingCount,
        underInspection: underInspectionCount,
        approved: approvedCount,
        rejected: rejectedCount,
        officers: officersCount,
        total: pendingCount + underInspectionCount + approvedCount + rejectedCount,
      },
    });
  } catch (error) {
    console.error('Get LMO stats error:', error);
    return res.status(500).json({ error: 'Failed to retrieve stats.' });
  }
};

// 5. Assign Field Officer to Application
const assignFieldOfficer = async (req, res) => {
  try {
    const { id } = req.params;
    const { foUserId, scheduledDate, scheduledTime, priority, notes } = req.body;

    if (!foUserId) {
      return res.status(400).json({ error: 'Field Officer selection is required.' });
    }

    const officer = await prisma.user.findUnique({
      where: { id: foUserId },
      include: { fieldOfficerProfile: true },
    });

    if (!officer || officer.role !== 'field_officer') {
      return res.status(404).json({ error: 'Selected Field Officer not found.' });
    }

    const app = await prisma.application.findUnique({ where: { id } });
    if (!app) {
      return res.status(404).json({ error: 'Application not found.' });
    }

    const foName = officer.fieldOfficerProfile?.full_name || officer.email;
    const foCode = officer.fieldOfficerProfile?.employeeCode || 'FO-DEL-INSP';

    const updatedApp = await prisma.application.update({
      where: { id },
      data: {
        status: 'Under Inspection',
        assigned_fo_id: officer.id,
        assigned_fo_name: foName,
        assigned_fo_code: foCode,
        assigned_lmo_id: req.user ? req.user.id : null,
        assigned_at: new Date(),
        scheduled_date: scheduledDate || new Date().toISOString().split('T')[0],
        scheduled_time: scheduledTime || '11:00 AM',
        priority: priority || app.priority || 'Normal',
        inspection_notes: notes || app.inspection_notes,
      },
    });

    await recordAuditLog(
      'APPLICATION_ASSIGNED_TO_FO',
      req.user ? req.user.email : 'lmo@gov.in',
      app.app_number,
      `Assigned application ${app.app_number} (${app.instrument_type} at ${app.business_name}) to Inspector ${foName} (${foCode}) for on-ground stamping. Inspection scheduled for ${scheduledDate || 'immediate'} ${scheduledTime || ''}.`
    );

    return res.status(200).json({
      message: `Application successfully assigned to Inspector ${foName}.`,
      application: updatedApp,
    });
  } catch (error) {
    console.error('Assign field officer error:', error);
    return res.status(500).json({ error: 'Failed to assign field officer.' });
  }
};

// 6. Direct LMO Application Review / Approval / Rejection
const reviewApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, notes } = req.body;

    const app = await prisma.application.findUnique({ where: { id } });
    if (!app) {
      return res.status(404).json({ error: 'Application not found.' });
    }

    if (action === 'approve') {
      const year = new Date().getFullYear();
      const randHex = crypto.randomBytes(2).toString('hex').toUpperCase();
      const certificate_no = `CERT-DL-${year}-${randHex}`;
      const certificate_issued_at = new Date();
      const certificate_valid_until = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year validity

      const updated = await prisma.application.update({
        where: { id },
        data: {
          status: 'Approved',
          certificate_no,
          certificate_issued_at,
          certificate_valid_until,
          stamped_by: req.user ? req.user.email : 'LMO Officer (Class-3 DSC)',
          inspection_result: 'Pass',
          inspection_notes: notes || 'Verified and approved under Section 24 of Legal Metrology Act.',
        },
      });

      await recordAuditLog(
        'APPLICATION_APPROVED_CERTIFICATE_ISSUED',
        req.user ? req.user.email : 'lmo@gov.in',
        app.app_number,
        `Approved verification for ${app.app_number}. Issued Legal Metrology Stamping Certificate ${certificate_no} valid until ${certificate_valid_until.toISOString().split('T')[0]}.`
      );

      return res.status(200).json({
        message: 'Application approved and digital Stamping Certificate issued.',
        application: updated,
      });
    } else if (action === 'reject') {
      const updated = await prisma.application.update({
        where: { id },
        data: {
          status: 'Rejected',
          rejection_reason: notes || 'Statutory verification criteria not satisfied.',
          inspection_result: 'Fail',
        },
      });

      await recordAuditLog(
        'APPLICATION_REJECTED',
        req.user ? req.user.email : 'lmo@gov.in',
        app.app_number,
        `Rejected application ${app.app_number}. Reason: ${notes || 'Statutory criteria not met.'}`
      );

      return res.status(200).json({
        message: 'Application rejected.',
        application: updated,
      });
    } else {
      return res.status(400).json({ error: "Invalid action. Use 'approve' or 'reject'." });
    }
  } catch (error) {
    console.error('Review application error:', error);
    return res.status(500).json({ error: 'Failed to review application.' });
  }
};

module.exports = {
  nominateOfficer,
  getOfficers,
  getLmoApplications,
  getLmoStats,
  assignFieldOfficer,
  reviewApplication,
};
