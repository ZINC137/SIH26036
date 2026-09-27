const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { recordAuditLog } = require('./adminController');

// 1. Get Assigned Inspection Tasks for Field Officer
const getAssignedTasks = async (req, res) => {
  try {
    const foId = req.user?.id;

    // In a multi-inspector setup, fetch tasks assigned to this officer; if none assigned specifically, return active under-inspection tasks
    let where = { status: 'Under Inspection' };
    if (foId) {
      const specificCount = await prisma.application.count({
        where: { status: 'Under Inspection', assigned_fo_id: foId },
      });
      if (specificCount > 0) {
        where.assigned_fo_id = foId;
      }
    }

    const tasks = await prisma.application.findMany({
      where,
      orderBy: { submitted_at: 'desc' },
      include: { user: { include: { profile: true } } },
    });

    const formatted = tasks.map((t) => ({
      id: t.id,
      appNumber: t.app_number,
      applicant: t.business_name,
      contact: t.contact_phone,
      contactEmail: t.contact_email,
      contactPerson: t.contact_name,
      instrument: `${t.instrument_type} (${t.capacity}${t.unit})`,
      instrumentType: t.instrument_type,
      make: t.make,
      model: t.model || 'Standard',
      serial: t.serial_no,
      capacity: `${t.capacity} ${t.unit}`,
      accuracyClass: t.accuracy_class || 'Class III (Medium Accuracy)',
      address: `${t.address}, ${t.city}, ${t.state} - ${t.pincode}`,
      time: t.scheduled_time || '11:00 AM',
      date: t.scheduled_date || new Date().toISOString().split('T')[0],
      submitted: new Date(t.submitted_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      priority: t.priority || 'Normal',
      status: t.status,
      assignedFoName: t.assigned_fo_name,
      assignedFoCode: t.assigned_fo_code,
      notes: t.inspection_notes,
      raw: t,
    }));

    return res.status(200).json({ tasks: formatted });
  } catch (error) {
    console.error('Get assigned tasks error:', error);
    return res.status(500).json({ error: 'Failed to retrieve assigned tasks.' });
  }
};

// 2. Get Field Officer Dashboard Metrics
const getOfficerStats = async (req, res) => {
  try {
    const foId = req.user?.id;
    const profile = foId ? await prisma.fieldOfficerProfile.findUnique({ where: { user_id: foId } }) : null;

    const [todayCount, completedMonth, totalCompleted] = await Promise.all([
      prisma.application.count({
        where: {
          status: 'Under Inspection',
          ...(foId ? { assigned_fo_id: foId } : {}),
        },
      }),
      prisma.application.count({
        where: {
          status: 'Approved',
          ...(foId ? { assigned_fo_id: foId } : {}),
          inspection_date: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
      prisma.application.count({
        where: {
          status: 'Approved',
          ...(foId ? { assigned_fo_id: foId } : {}),
        },
      }),
    ]);

    const targetMonthly = 20;
    const progress = targetMonthly > 0 ? Math.min(Math.round((completedMonth / targetMonthly) * 100), 100) : 0;
    const activeCircle = profile?.circleZone || 'Designated Jurisdiction Circle';

    return res.status(200).json({
      stats: {
        todayAssigned: todayCount,
        completedMonthly: completedMonth,
        targetMonthly,
        progress,
        totalCompleted,
        activeCircle,
      },
    });
  } catch (error) {
    console.error('Get officer stats error:', error);
    return res.status(500).json({ error: 'Failed to retrieve officer statistics.' });
  }
};

// 3. Submit Field Inspection Report to LMO for Final Signing & Certificate Issuance
// Per Legal Metrology Act: FO conducts on-site physical inspection and submits findings.
// The LMO (Gazetted Officer) is the authority who legally verifies and issues the certificate.
const submitInspection = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      test_error_percentage,
      environmental_temp,
      test_readings,
      security_seal_no,
      inspection_notes,
      inspection_result, // 'Pass' | 'Fail' | 'Conditional'
    } = req.body;

    const app = await prisma.application.findUnique({ where: { id } });
    if (!app) {
      return res.status(404).json({ error: 'Application record not found.' });
    }

    if (app.status !== 'Under Inspection') {
      return res.status(400).json({ error: 'This application is not currently assigned for inspection.' });
    }

    // Determine inspector identity from logged-in user profile
    let officerName = req.user?.email || 'Authorized Inspector';
    let officerCode = 'FO-GEN-01';
    if (req.user?.id) {
      const foProfile = await prisma.fieldOfficerProfile.findUnique({
        where: { user_id: req.user.id },
      });
      if (foProfile) {
        officerName = foProfile.full_name;
        officerCode = foProfile.employeeCode;
      }
    }

    const year = new Date().getFullYear();
    const seal_no = security_seal_no || `SEAL-DL-${year}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;

    if (inspection_result === 'Pass' || inspection_result === 'Conditional') {
      // FO submits report → status moves to "Inspection Reported" for LMO to review & sign
      const updated = await prisma.application.update({
        where: { id },
        data: {
          status: 'Inspection Reported',
          assigned_fo_id: req.user?.id || app.assigned_fo_id,
          assigned_fo_name: officerName || app.assigned_fo_name,
          assigned_fo_code: officerCode || app.assigned_fo_code,
          inspection_date: new Date(),
          test_error_percentage: parseFloat(test_error_percentage) || 0.02,
          environmental_temp: environmental_temp || '26°C, 52% RH',
          test_readings: typeof test_readings === 'object'
            ? JSON.stringify(test_readings)
            : (test_readings || 'MPE within +/- 0.1%'),
          security_seal_no: seal_no,
          inspection_notes: inspection_notes ||
            'All verification parameters meet the Legal Metrology General Rules 2011 Schedule VII.',
          inspection_result: inspection_result || 'Pass',
          stamped_by: `${officerName} (${officerCode})`, // Inspector who conducted physical test
          // Certificate fields remain null — to be filled by LMO upon final signing
        },
      });

      await recordAuditLog(
        'INSPECTION_REPORT_SUBMITTED_TO_LMO',
        req.user ? req.user.email : officerName,
        app.app_number,
        `Field Inspector ${officerName} (${officerCode}) completed on-site physical verification of ${app.app_number} at ${app.business_name}. Result: ${inspection_result}. Report forwarded to LMO for statutory signing and certificate issuance under Section 24 of the Legal Metrology Act.`
      );

      return res.status(200).json({
        message: 'Inspection report submitted successfully to LMO for review and certificate issuance.',
        application: updated,
      });

    } else {
      // Inspection result is Fail — FO can reject directly (instrument failed MPE tolerance)
      const updated = await prisma.application.update({
        where: { id },
        data: {
          status: 'Rejected',
          assigned_fo_id: req.user?.id || app.assigned_fo_id,
          assigned_fo_name: officerName || app.assigned_fo_name,
          assigned_fo_code: officerCode || app.assigned_fo_code,
          inspection_date: new Date(),
          test_error_percentage: parseFloat(test_error_percentage) || 1.85,
          environmental_temp: environmental_temp || '26°C, 52% RH',
          inspection_notes: inspection_notes || 'Maximum permissible error exceeded. Rejection notice issued.',
          inspection_result: 'Fail',
          rejection_reason: inspection_notes || 'Failed accuracy tolerance under Section 24 test.',
          stamped_by: `${officerName} (${officerCode})`,
        },
      });

      await recordAuditLog(
        'INSPECTION_FAILED_NOTICE_ISSUED',
        req.user ? req.user.email : officerName,
        app.app_number,
        `Field inspection failed for ${app.app_number} at ${app.business_name}. Error exceeded MPE tolerances. Stamping refused by FO ${officerName}.`
      );

      return res.status(200).json({
        message: 'Inspection submitted: Verification failed. Statutory rejection notice issued.',
        application: updated,
      });
    }
  } catch (error) {
    console.error('Submit inspection error:', error);
    return res.status(500).json({ error: 'Failed to submit inspection report.' });
  }
};

// 4. Get Inspection History for Field Officer
// Shows all historical reports submitted, verifications, and resulting certificates
const getInspectionHistory = async (req, res) => {
  try {
    const foId = req.user?.id;
    let officerName = '';
    let officerCode = '';
    if (foId) {
      const foProfile = await prisma.fieldOfficerProfile.findUnique({
        where: { user_id: foId },
      });
      if (foProfile) {
        officerName = foProfile.full_name;
        officerCode = foProfile.employeeCode;
      }
    }

    const orClauses = [];
    if (foId) orClauses.push({ assigned_fo_id: foId });
    if (officerName) orClauses.push({ stamped_by: { contains: officerName } });
    if (officerCode) orClauses.push({ stamped_by: { contains: officerCode } });
    if (req.user?.email) orClauses.push({ assigned_fo_name: { contains: req.user.email } });

    // Show officer's verifications or all completed verifications if admin/auditor
    const whereFilter = orClauses.length > 0
      ? {
          status: { in: ['Inspection Reported', 'Approved', 'Rejected'] },
          OR: orClauses,
        }
      : { status: { in: ['Inspection Reported', 'Approved', 'Rejected'] } };

    const reports = await prisma.application.findMany({
      where: whereFilter,
      orderBy: { updated_at: 'desc' },
    });

    const formatted = reports.map((r) => {
      const isApproved = r.status === 'Approved';
      const validUntil = r.certificate_valid_until ? new Date(r.certificate_valid_until) : null;
      const isValid = isApproved && validUntil && validUntil > new Date();

      return {
        id: `RPT-${r.app_number.replace('APP-', '')}`,
        appId: r.app_number,
        rawId: r.id,
        applicant: r.business_name,
        contactPerson: r.contact_name,
        contactPhone: r.contact_phone,
        address: `${r.address}, ${r.city}, ${r.state} - ${r.pincode}`,
        instrument: `${r.instrument_type} (${r.capacity}${r.unit})`,
        instrumentType: r.instrument_type,
        make: r.make,
        model: r.model,
        serialNo: r.serial_no,
        capacity: `${r.capacity} ${r.unit}`,
        accuracyClass: r.accuracy_class,
        date: r.inspection_date ? new Date(r.inspection_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : new Date(r.updated_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        result: r.inspection_result || (isApproved ? 'Pass' : r.status === 'Inspection Reported' ? 'Pass (Pending LMO Sign)' : 'Fail'),
        lmoStatus: isApproved ? 'Certificate Issued by LMO' : r.status === 'Inspection Reported' ? 'Awaiting LMO Signing' : 'Rejected',
        status: r.status,
        certificateNo: r.certificate_no || null,
        certificateIssuedAt: r.certificate_issued_at ? new Date(r.certificate_issued_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : null,
        certificateValidUntil: r.certificate_valid_until ? new Date(r.certificate_valid_until).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : null,
        validityStatus: isValid ? 'Active' : (isApproved ? 'Expired' : r.status),
        sealNo: r.security_seal_no,
        errorPct: r.test_error_percentage ?? 0.02,
        environmentalTemp: r.environmental_temp || '26°C, 52% RH',
        testReadings: r.test_readings || 'MPE within +/- 0.1%',
        notes: r.inspection_notes,
        rejectionReason: r.rejection_reason,
        stampedBy: r.stamped_by || `${officerName} (${officerCode})`,
        fee: r.fee_amount,
        raw: r,
      };
    });

    return res.status(200).json({ reports: formatted });
  } catch (error) {
    console.error('Get inspection history error:', error);
    return res.status(500).json({ error: 'Failed to retrieve inspection history.' });
  }
};

module.exports = {
  getAssignedTasks,
  getOfficerStats,
  submitInspection,
  getInspectionHistory,
};
