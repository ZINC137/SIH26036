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
        completedMonthly,
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

// 3. Conduct Field Inspection & Stamp Instrument (Issue Certificate or Reject)
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

    // Determine inspector signature from logged-in user profile
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

    const stamped_by = `${officerName} (${officerCode})`;

    if (inspection_result === 'Pass' || inspection_result === 'Conditional') {
      const year = new Date().getFullYear();
      const randHex = crypto.randomBytes(2).toString('hex').toUpperCase();
      const certificate_no = `CERT-DL-${year}-${randHex}`;
      const certificate_issued_at = new Date();
      const certificate_valid_until = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1-year statutory validity
      const seal_no = security_seal_no || `SEAL-DL-${year}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;

      const updated = await prisma.application.update({
        where: { id },
        data: {
          status: 'Approved',
          inspection_date: new Date(),
          test_error_percentage: parseFloat(test_error_percentage) || 0.02,
          environmental_temp: environmental_temp || '26°C, 52% RH',
          test_readings: typeof test_readings === 'object' ? JSON.stringify(test_readings) : (test_readings || 'MPE within +/- 0.1%'),
          security_seal_no: seal_no,
          inspection_notes: inspection_notes || 'All verification parameters meet the Legal Metrology General Rules 2011 Schedule VII.',
          inspection_result: inspection_result || 'Pass',
          certificate_no,
          certificate_issued_at,
          certificate_valid_until,
          stamped_by,
        },
      });

      await recordAuditLog(
        'INSPECTION_COMPLETED_AND_STAMPED',
        req.user ? req.user.email : officerName,
        app.app_number,
        `Field Inspector ${officerName} conducted physical verification for ${app.app_number} at ${app.business_name}. Affixed lead/polycarbonate seal ${seal_no}. Stamping Certificate ${certificate_no} issued (Valid until ${certificate_valid_until.toISOString().split('T')[0]}).`
      );

      return res.status(200).json({
        message: 'Inspection completed successfully! Stamping seal affixed and Verification Certificate issued.',
        application: updated,
      });
    } else {
      // Rejection
      const updated = await prisma.application.update({
        where: { id },
        data: {
          status: 'Rejected',
          inspection_date: new Date(),
          test_error_percentage: parseFloat(test_error_percentage) || 1.85,
          environmental_temp: environmental_temp || '26°C, 52% RH',
          inspection_notes: inspection_notes || 'Maximum permissible error exceeded. Rejection notice issued.',
          inspection_result: 'Fail',
          rejection_reason: inspection_notes || 'Failed accuracy tolerance under Section 24 test.',
          stamped_by,
        },
      });

      await recordAuditLog(
        'INSPECTION_FAILED_NOTICE_ISSUED',
        req.user ? req.user.email : officerName,
        app.app_number,
        `Field inspection failed for ${app.app_number} at ${app.business_name}. Error exceeded MPE tolerances. Stamping refused.`
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
const getInspectionHistory = async (req, res) => {
  try {
    const reports = await prisma.application.findMany({
      where: {
        status: { in: ['Approved', 'Rejected'] },
      },
      orderBy: { updated_at: 'desc' },
    });

    const formatted = reports.map((r) => ({
      id: `RPT-${r.app_number.replace('APP-', '')}`,
      appId: r.app_number,
      rawId: r.id,
      applicant: r.business_name,
      instrument: `${r.instrument_type} (${r.capacity}${r.unit})`,
      date: r.inspection_date ? new Date(r.inspection_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : new Date(r.updated_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      result: r.inspection_result || (r.status === 'Approved' ? 'Pass' : 'Fail'),
      lmo: r.status === 'Approved' ? 'Approved' : 'Reviewed',
      status: r.status,
      certificateNo: r.certificate_no,
      sealNo: r.security_seal_no,
      errorPct: r.test_error_percentage,
      notes: r.inspection_notes,
      stampedBy: r.stamped_by,
      raw: r,
    }));

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
