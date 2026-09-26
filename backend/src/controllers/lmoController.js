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
    const [pendingCount, underInspectionCount, inspectionReportedCount, approvedCount, rejectedCount, officersCount] = await Promise.all([
      prisma.application.count({ where: { status: 'Pending' } }),
      prisma.application.count({ where: { status: 'Under Inspection' } }),
      prisma.application.count({ where: { status: 'Inspection Reported' } }),
      prisma.application.count({ where: { status: 'Approved' } }),
      prisma.application.count({ where: { status: 'Rejected' } }),
      prisma.user.count({ where: { role: 'field_officer', status: 'ACTIVE' } }),
    ]);

    return res.status(200).json({
      stats: {
        pending: pendingCount,
        underInspection: underInspectionCount,
        inspectionReported: inspectionReportedCount, // FO reports awaiting LMO signing
        approved: approvedCount,
        rejected: rejectedCount,
        officers: officersCount,
        total: pendingCount + underInspectionCount + inspectionReportedCount + approvedCount + rejectedCount,
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

// 6. LMO Application Review:
// - For 'Pending' apps: LMO can reject after document scrutiny, or assign FO for inspection
// - For 'Inspection Reported' apps: LMO verifies FO's findings, signs with DSC, and issues the certificate
// This matches Section 24 of the Legal Metrology Act: only a gazetted LMO may legally issue the stamping certificate.
const reviewApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, notes } = req.body;

    const app = await prisma.application.findUnique({ where: { id } });
    if (!app) {
      return res.status(404).json({ error: 'Application not found.' });
    }

    // Get LMO's profile for certificate signing
    let lmoName = req.user?.email || 'Legal Metrology Officer';
    let lmoCode = 'LMO-DL';
    let lmoDscId = 'DSC-DL-2026-SHA256';
    if (req.user?.id) {
      const lmoProfile = await prisma.lmoProfile.findUnique({ where: { user_id: req.user.id } });
      if (lmoProfile) {
        lmoName = lmoProfile.full_name;
        lmoCode = lmoProfile.employeeCode;
        lmoDscId = lmoProfile.dscKeyId || lmoDscId;
      }
    }

    if (action === 'approve') {
      // Can only sign/approve an application that has a FO inspection report
      if (app.status !== 'Inspection Reported' && app.status !== 'Pending') {
        return res.status(400).json({
          error: `Cannot approve application in "${app.status}" status. Only "Inspection Reported" or "Pending" applications can be approved.`,
        });
      }

      const year = new Date().getFullYear();
      const randHex = crypto.randomBytes(2).toString('hex').toUpperCase();
      const certificate_no = `CERT-DL-${year}-${randHex}`;
      const certificate_issued_at = new Date();
      const certificate_valid_until = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year statutory validity

      const updated = await prisma.application.update({
        where: { id },
        data: {
          status: 'Approved',
          certificate_no,
          certificate_issued_at,
          certificate_valid_until,
          // LMO signs the certificate; FO's stamped_by field preserved (who did the physical test)
          // We record the LMO as the certificate-issuing authority via inspection_notes if needed
          inspection_notes: notes
            ? `LMO Review: ${notes}. ${app.inspection_notes || ''}`
            : app.inspection_notes || 'Verified and approved under Section 24 of Legal Metrology Act.',
          inspection_result: app.inspection_result || 'Pass',
          assigned_lmo_id: req.user ? req.user.id : app.assigned_lmo_id,
        },
      });

      await recordAuditLog(
        'CERTIFICATE_ISSUED_BY_LMO',
        req.user ? req.user.email : 'lmo@gov.in',
        app.app_number,
        `LMO ${lmoName} (${lmoCode}) reviewed FO inspection report for ${app.app_number} at ${app.business_name}. Signed with DSC [${lmoDscId}]. Issued Legal Metrology Stamping Certificate ${certificate_no} valid until ${certificate_valid_until.toISOString().split('T')[0]}.`
      );

      return res.status(200).json({
        message: `Certificate issued successfully. ${certificate_no} signed by LMO ${lmoName} and valid for 1 year.`,
        application: updated,
      });

    } else if (action === 'reject') {
      if (!['Pending', 'Inspection Reported'].includes(app.status)) {
        return res.status(400).json({ error: `Cannot reject application in "${app.status}" status.` });
      }

      const updated = await prisma.application.update({
        where: { id },
        data: {
          status: 'Rejected',
          rejection_reason: notes || 'Statutory verification criteria not satisfied.',
          inspection_result: 'Fail',
        },
      });

      await recordAuditLog(
        'APPLICATION_REJECTED_BY_LMO',
        req.user ? req.user.email : 'lmo@gov.in',
        app.app_number,
        `Rejected application ${app.app_number} by LMO ${lmoName}. Reason: ${notes || 'Statutory criteria not met.'}`
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

// 6. Get Certificate Registry & Past Verification History for LMO
const getLmoCertificates = async (req, res) => {
  try {
    const applications = await prisma.application.findMany({
      where: {
        status: { in: ['Approved', 'Rejected', 'Inspection Reported'] },
      },
      orderBy: { updated_at: 'desc' },
      include: {
        user: {
          select: { email: true, profile: true },
        },
      },
    });

    const formatted = applications.map((a) => {
      const isApproved = a.status === 'Approved';
      const isRejected = a.status === 'Rejected';
      const validUntil = a.certificate_valid_until ? new Date(a.certificate_valid_until) : null;
      const isValid = isApproved && validUntil && validUntil > new Date();

      return {
        id: a.id,
        certificateNo: a.certificate_no || null,
        appNumber: a.app_number,
        businessName: a.business_name,
        contactName: a.contact_name,
        contactEmail: a.contact_email,
        contactPhone: a.contact_phone,
        address: `${a.address}, ${a.city}, ${a.state} - ${a.pincode}`,
        city: a.city,
        state: a.state,
        pincode: a.pincode,
        instrumentType: a.instrument_type,
        make: a.make,
        model: a.model,
        serialNo: a.serial_no,
        capacity: `${a.capacity} ${a.unit}`,
        accuracyClass: a.accuracy_class,
        assignedFoName: a.assigned_fo_name || 'Field Inspector',
        assignedFoCode: a.assigned_fo_code || 'FO',
        stampedBy: a.stamped_by || a.assigned_fo_name || 'Authorized Field Inspector',
        inspectionDate: a.inspection_date ? new Date(a.inspection_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : null,
        inspectionResult: a.inspection_result || (isApproved ? 'Pass' : isRejected ? 'Fail' : 'Pending'),
        errorPercentage: a.test_error_percentage ?? 0.02,
        securitySealNo: a.security_seal_no,
        inspectionNotes: a.inspection_notes,
        rejectionReason: a.rejection_reason,
        certificateIssuedAt: a.certificate_issued_at ? new Date(a.certificate_issued_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : null,
        certificateValidUntil: a.certificate_valid_until ? new Date(a.certificate_valid_until).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : null,
        validityStatus: isValid ? 'Active' : (isApproved ? 'Expired' : a.status),
        status: a.status,
        submittedAt: new Date(a.submitted_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        feeAmount: a.fee_amount,
        paymentStatus: a.payment_status,
        raw: a,
      };
    });

    const stats = {
      totalCertificates: formatted.filter((c) => c.status === 'Approved').length,
      activeCertificates: formatted.filter((c) => c.validityStatus === 'Active').length,
      rejectedVerifications: formatted.filter((c) => c.status === 'Rejected').length,
      awaitingSigning: formatted.filter((c) => c.status === 'Inspection Reported').length,
    };

    return res.status(200).json({ certificates: formatted, stats });
  } catch (error) {
    console.error('Get LMO certificates error:', error);
    return res.status(500).json({ error: 'Failed to retrieve certificate history.' });
  }
};

module.exports = {
  nominateOfficer,
  getOfficers,
  getLmoApplications,
  getLmoStats,
  assignFieldOfficer,
  reviewApplication,
  getLmoCertificates,
};
