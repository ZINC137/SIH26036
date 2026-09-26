const argon2 = require('argon2');
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Helper to log administrative audit trail
const recordAuditLog = async (action, actor, target, details) => {
  try {
    await prisma.auditLog.create({
      data: {
        action,
        actor: actor || 'SYSTEM',
        target: target || null,
        details: details || null,
      },
    });
  } catch (err) {
    console.error('Failed to record audit log:', err);
  }
};

// 1. Appoint Legal Metrology Officer (Admin only) -> writes to LmoProfile table
const appointLMO = async (req, res) => {
  try {
    const {
      name,
      email,
      employeeCode,
      gazetteOrderRef,
      state,
      district,
      zone,
      jurisdiction,
      dscKeyId,
      phone,
      initialPassword,
    } = req.body;

    if (!name || !email || !employeeCode || !gazetteOrderRef) {
      return res.status(400).json({
        error: 'Full Name, Official Email, Employee Code, and Gazette Notification Order are required.',
      });
    }

    // Check if email already exists in User, or employeeCode exists in LmoProfile
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (existingUser) {
      return res.status(409).json({ error: 'A user account with this email address already exists.' });
    }

    const existingLmo = await prisma.lmoProfile.findUnique({
      where: { employeeCode },
    });
    if (existingLmo) {
      return res.status(409).json({ error: 'An LMO with this Government Employee Code is already registered.' });
    }

    const assignedJurisdiction = jurisdiction || `${district || 'North Delhi'}, ${state || 'Delhi'}${zone ? ` (${zone})` : ''}`;
    const generatedDscKey = dscKeyId || `DSC-${state ? state.substring(0, 2).toUpperCase() : 'DL'}-${new Date().getFullYear()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    const defaultPassword = initialPassword || 'LmoPassword2026!';

    const password_hash = await argon2.hash(defaultPassword, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16,
      hashLength: 50,
    });

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: email.toLowerCase(),
          role: 'lmo',
          status: 'ACTIVE',
          is_verified: true,
          password_hash,
        },
      });

      const lmoProfile = await tx.lmoProfile.create({
        data: {
          user_id: user.id,
          full_name: name,
          employeeCode,
          gazetteOrderRef,
          state: state || 'Delhi',
          districtDivision: district || 'North Delhi',
          zoneSubDivision: zone || 'Zone 1',
          assignedJurisdiction,
          dscKeyId: generatedDscKey,
          appointedBy: req.user ? req.user.id : 'ADMIN_SUPER',
          phone: phone || '',
        },
      });

      return { user, lmoProfile };
    });

    await recordAuditLog(
      'LMO_COMMISSIONED',
      req.user ? req.user.email : 'admin@gov.in',
      result.user.email,
      `Commissioned LMO ${name} (${employeeCode}) with Jurisdiction: [${assignedJurisdiction}], DSC Key: [${generatedDscKey}], Gazette Ref: [${gazetteOrderRef}]`
    );

    return res.status(201).json({
      message: 'Legal Metrology Officer commissioned successfully into LmoProfile registry with Class-3 DSC credentials.',
      lmo: {
        id: result.user.id,
        name: result.lmoProfile.full_name,
        email: result.user.email,
        employeeCode: result.lmoProfile.employeeCode,
        gazetteOrderRef: result.lmoProfile.gazetteOrderRef,
        assignedJurisdiction: result.lmoProfile.assignedJurisdiction,
        dscKeyId: result.lmoProfile.dscKeyId,
        status: result.user.status,
        defaultPassword,
      },
    });
  } catch (error) {
    console.error('LMO appointment error:', error);
    return res.status(500).json({ error: 'Internal Server Error during LMO appointment.' });
  }
};

// 2. List all appointed LMOs from LmoProfile table
const listLMOs = async (req, res) => {
  try {
    const lmos = await prisma.user.findMany({
      where: { role: 'lmo' },
      include: { lmoProfile: true },
      orderBy: { created_at: 'desc' },
    });

    const formatted = lmos.map((u) => ({
      id: u.id,
      name: u.lmoProfile?.full_name || 'Gazetted Officer',
      email: u.email,
      employeeCode: u.lmoProfile?.employeeCode || 'LMO-GEN-01',
      gazetteOrderRef: u.lmoProfile?.gazetteOrderRef || 'GOV/NOTIF/2026/01',
      assignedJurisdiction: u.lmoProfile?.assignedJurisdiction || 'Delhi North Division',
      dscKeyId: u.lmoProfile?.dscKeyId || 'DSC-DL-2026-SHA256',
      status: u.status,
      phone: u.lmoProfile?.phone || 'N/A',
      created_at: u.created_at,
    }));

    return res.status(200).json({ lmos: formatted });
  } catch (error) {
    console.error('List LMOs error:', error);
    return res.status(500).json({ error: 'Failed to retrieve LMO registry.' });
  }
};

// 3. Get Field Inspectors awaiting clearance from FieldOfficerProfile table
const getPendingInspectorApprovals = async (req, res) => {
  try {
    const officers = await prisma.user.findMany({
      where: { role: 'field_officer' },
      include: { fieldOfficerProfile: true },
      orderBy: { created_at: 'desc' },
    });

    const formatted = officers.map((o) => ({
      id: o.id,
      name: o.fieldOfficerProfile?.full_name || 'Field Inspector',
      email: o.email,
      employeeCode: o.fieldOfficerProfile?.employeeCode || 'FO-DEL-GEN',
      assignedJurisdiction: o.fieldOfficerProfile?.circleZone || 'Karol Bagh Circle',
      status: o.status, // PENDING_VERIFICATION | PENDING_ACTIVATION | ACTIVE | REJECTED
      activationToken: o.fieldOfficerProfile?.activationToken,
      recommendingLmo: o.fieldOfficerProfile?.recommendingLmoName || 'District LMO (Delhi North)',
      submittedAt: o.fieldOfficerProfile?.created_at || o.created_at,
      phone: o.fieldOfficerProfile?.phone || 'N/A',
    }));

    return res.status(200).json({ officers: formatted });

  } catch (error) {
    console.error('Pending inspector approvals error:', error);
    return res.status(500).json({ error: 'Failed to retrieve inspector clearance queue.' });
  }
};

// 4. Verify & Clear Inspector Dossier -> updates FieldOfficerProfile with activation token
const clearInspector = async (req, res) => {
  try {
    const { officerId, action, notes } = req.body;

    if (!officerId || !action) {
      return res.status(400).json({ error: 'Officer ID and clearance action (approve/reject) are required.' });
    }

    const officer = await prisma.user.findUnique({
      where: { id: officerId },
      include: { fieldOfficerProfile: true },
    });

    if (!officer || officer.role !== 'field_officer') {
      return res.status(404).json({ error: 'Field Officer record not found.' });
    }

    if (action === 'approve') {
      const randPart1 = crypto.randomBytes(2).toString('hex').toUpperCase();
      const randPart2 = crypto.randomBytes(2).toString('hex').toUpperCase();
      const activationToken = `ACT-FO-${randPart1}-${randPart2}`;

      await prisma.$transaction([
        prisma.user.update({
          where: { id: officerId },
          data: { status: 'PENDING_ACTIVATION' },
        }),
        prisma.fieldOfficerProfile.update({
          where: { user_id: officerId },
          data: { activationToken },
        }),
      ]);

      await recordAuditLog(
        'INSPECTOR_CLEARANCE_APPROVED',
        req.user ? req.user.email : 'admin@gov.in',
        officer.email,
        `Vigilance & HRMS clearance granted for Inspector ${officer.fieldOfficerProfile?.full_name || officer.email} (${officer.fieldOfficerProfile?.employeeCode}). Issued single-use activation token: ${activationToken}`
      );

      return res.status(200).json({
        message: 'Field Officer dossier cleared. Single-use activation token generated in FieldOfficerProfile.',
        activationToken,
        officer: {
          id: officer.id,
          email: officer.email,
          name: officer.fieldOfficerProfile?.full_name,
          employeeCode: officer.fieldOfficerProfile?.employeeCode,
          status: 'PENDING_ACTIVATION',
          activationToken,
        },
      });
    } else if (action === 'reject') {
      await prisma.$transaction([
        prisma.user.update({
          where: { id: officerId },
          data: { status: 'REJECTED' },
        }),
        prisma.fieldOfficerProfile.update({
          where: { user_id: officerId },
          data: { activationToken: null },
        }),
      ]);

      await recordAuditLog(
        'INSPECTOR_CLEARANCE_REJECTED',
        req.user ? req.user.email : 'admin@gov.in',
        officer.email,
        `Dossier rejected/service re-verification requested. Notes: ${notes || 'Security audit flagged discrepancies.'}`
      );

      return res.status(200).json({ message: 'Field Officer nomination rejected / returned for re-verification.' });
    } else {
      return res.status(400).json({ error: "Invalid action. Use 'approve' or 'reject'." });
    }
  } catch (error) {
    console.error('Clear inspector error:', error);
    return res.status(500).json({ error: 'Failed to process inspector clearance.' });
  }
};

// 5. Get Statutory Security / Audit Trail Logs
const getAuditLogs = async (req, res) => {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { timestamp: 'desc' },
      take: 50,
    });
    return res.status(200).json({ logs });
  } catch (error) {
    console.error('Audit logs error:', error);
    return res.status(500).json({ error: 'Failed to fetch audit logs.' });
  }
};

// 6. User Management: list all system users pulling from their dedicated profile tables
const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        adminProfile: true,
        lmoProfile: true,
        fieldOfficerProfile: true,
        profile: true,
      },
      orderBy: { created_at: 'desc' },
    });

    const formatted = users.map((u) => {
      let name = u.email.split('@')[0];
      let employeeCode = null;
      let assignedJurisdiction = null;
      let dscKeyId = null;

      if (u.role === 'admin' && u.adminProfile) {
        name = u.adminProfile.full_name;
        employeeCode = u.adminProfile.employeeCode;
        assignedJurisdiction = u.adminProfile.department;
      } else if (u.role === 'lmo' && u.lmoProfile) {
        name = u.lmoProfile.full_name;
        employeeCode = u.lmoProfile.employeeCode;
        assignedJurisdiction = u.lmoProfile.assignedJurisdiction;
        dscKeyId = u.lmoProfile.dscKeyId;
      } else if (u.role === 'field_officer' && u.fieldOfficerProfile) {
        name = u.fieldOfficerProfile.full_name;
        employeeCode = u.fieldOfficerProfile.employeeCode;
        assignedJurisdiction = u.fieldOfficerProfile.circleZone;
      } else if (u.profile) {
        name = u.profile.full_name;
      }

      return {
        id: u.id,
        name,
        email: u.email,
        role: u.role,
        verified: u.is_verified,
        status: u.status,
        employeeCode,
        assignedJurisdiction,
        dscKeyId,
        joined: new Date(u.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      };
    });

    return res.status(200).json({ users: formatted });
  } catch (error) {
    console.error('Get all users error:', error);
    return res.status(500).json({ error: 'Failed to load system users.' });
  }
};

// 7. Toggle User Status or Role
const updateUserStatus = async (req, res) => {
  try {
    const { userId, status, role } = req.body;
    const updateData = {};
    if (status) updateData.status = status;
    if (role) updateData.role = role;

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    await recordAuditLog(
      'USER_STATUS_UPDATED',
      req.user ? req.user.email : 'admin@gov.in',
      user.email,
      `User ${user.email} updated: status=${user.status}, role=${user.role}`
    );

    return res.status(200).json({ message: 'User updated successfully', user });
  } catch (error) {
    console.error('Update user status error:', error);
    return res.status(500).json({ error: 'Failed to update user.' });
  }
};

// 8. Admin Analytics & State-Wide KPIs
const getAdminAnalytics = async (req, res) => {
  try {
    const [
      totalApps,
      pendingApps,
      inspectingApps,
      approvedApps,
      lmoCount,
      foCount,
      revenueResult,
      recentApps,
    ] = await Promise.all([
      prisma.application.count(),
      prisma.application.count({ where: { status: 'Pending' } }),
      prisma.application.count({ where: { status: 'Under Inspection' } }),
      prisma.application.count({ where: { status: 'Approved' } }),
      prisma.user.count({ where: { role: 'lmo' } }),
      prisma.user.count({ where: { role: 'field_officer', status: 'ACTIVE' } }),
      prisma.application.aggregate({ _sum: { fee_amount: true } }),
      prisma.application.findMany({
        take: 5,
        orderBy: { submitted_at: 'desc' },
      }),
    ]);

    const totalRevenue = revenueResult._sum.fee_amount || 0;

    return res.status(200).json({
      analytics: {
        totalApplications: totalApps,
        pendingReview: pendingApps,
        underInspection: inspectingApps,
        certificatesIssued: approvedApps,
        activeLMOs: lmoCount,
        activeFieldOfficers: foCount,
        revenueCollected: totalRevenue,
        recentApplications: recentApps,
      },
    });
  } catch (error) {
    console.error('Admin analytics error:', error);
    return res.status(500).json({ error: 'Failed to load analytics.' });
  }
};

// 9. Get State-Wide Verification Records & Certificate Registry
const getAllVerifications = async (req, res) => {
  try {
    const applications = await prisma.application.findMany({
      orderBy: { updated_at: 'desc' },
      include: {
        user: {
          select: { email: true, profile: true },
        },
      },
    });

    const formatted = applications.map((a) => {
      const isApproved = a.status === 'Approved';
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
        stampedBy: a.stamped_by || a.assigned_fo_name || 'Legal Metrology Inspector',
        inspectionDate: a.inspection_date ? new Date(a.inspection_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : null,
        inspectionResult: a.inspection_result || (isApproved ? 'Pass' : a.status === 'Rejected' ? 'Fail' : a.status),
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
      totalVerifications: applications.length,
      certificatesIssued: formatted.filter((c) => c.status === 'Approved').length,
      activeCertificates: formatted.filter((c) => c.validityStatus === 'Active').length,
      underInspection: formatted.filter((c) => c.status === 'Under Inspection').length,
      awaitingSigning: formatted.filter((c) => c.status === 'Inspection Reported').length,
      rejected: formatted.filter((c) => c.status === 'Rejected').length,
      pending: formatted.filter((c) => c.status === 'Pending').length,
    };

    return res.status(200).json({ verifications: formatted, stats });
  } catch (error) {
    console.error('Get all verifications error:', error);
    return res.status(500).json({ error: 'Failed to retrieve state-wide verifications.' });
  }
};

module.exports = {
  appointLMO,
  listLMOs,
  getPendingInspectorApprovals,
  clearInspector,
  getAuditLogs,
  getAllUsers,
  updateUserStatus,
  getAdminAnalytics,
  getAllVerifications,
  recordAuditLog,
};
