const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const recordAuditLog = async (action, actor, target, details) => {
  try {
    await prisma.auditLog.create({
      data: { action, actor, target, details },
    });
  } catch (err) {
    console.error('Failed to write audit log:', err);
  }
};

// 1. Get GATC Assigned Tasks
const getGatcTasks = async (req, res) => {
  try {
    const gatcUserId = req.user.id;
    let gatcProfile = await prisma.gatcProfile.findUnique({
      where: { user_id: gatcUserId },
    });

    const orClauses = [{ assigned_gatc_id: gatcUserId }];
    if (gatcProfile?.gatc_code) {
      orClauses.push({ assigned_gatc_code: gatcProfile.gatc_code });
    }

    const tasks = await prisma.application.findMany({
      where: {
        status: { in: ['Under Inspection', 'Pending'] },
        OR: orClauses,
      },
      orderBy: { updated_at: 'desc' },
      include: {
        documents: true,
      },
    });

    const formatted = tasks.map((t) => ({
      id: t.id,
      appNumber: t.app_number,
      businessName: t.business_name,
      instrumentType: t.instrument_type,
      make: t.make,
      model: t.model || 'Standard',
      serialNo: t.serial_no,
      capacity: `${t.capacity} ${t.unit}`,
      accuracyClass: t.accuracy_class,
      address: `${t.address}, ${t.city}, ${t.state} - ${t.pincode}`,
      contactName: t.contact_name,
      contactPhone: t.contact_phone,
      scheduledDate: t.scheduled_date || 'Awaiting Schedule',
      scheduledTime: t.scheduled_time || '10:00 AM',
      priority: t.priority,
      status: t.status,
      applicationType: t.application_type,
      documentsCount: t.documents?.length || 0,
    }));

    return res.status(200).json({ tasks: formatted });
  } catch (error) {
    console.error('Get GATC tasks error:', error);
    return res.status(500).json({ error: 'Failed to retrieve GATC test tasks.' });
  }
};

// 2. Get GATC Metrics & Capacity
const getGatcStats = async (req, res) => {
  try {
    const gatcUserId = req.user.id;
    const gatcProfile = await prisma.gatcProfile.findUnique({
      where: { user_id: gatcUserId },
    });

    const [pendingCount, completedCount, totalCount] = await Promise.all([
      prisma.application.count({
        where: {
          assigned_gatc_id: gatcUserId,
          status: { in: ['Under Inspection', 'Pending'] },
        },
      }),
      prisma.application.count({
        where: {
          assigned_gatc_id: gatcUserId,
          status: { in: ['Inspection Reported', 'Approved'] },
        },
      }),
      prisma.application.count({
        where: { assigned_gatc_id: gatcUserId },
      }),
    ]);

    return res.status(200).json({
      stats: {
        pendingTasks: pendingCount,
        completedTests: completedCount,
        totalAssigned: totalCount,
        centreName: gatcProfile?.centre_name || null,
        gatcCode: gatcProfile?.gatc_code || null,
        accreditationNo: gatcProfile?.accreditation_no || null,
        accreditationValidUntil: gatcProfile?.valid_until || null,
        authorizedScopes: gatcProfile?.authorized_scopes || null,
      },
    });
  } catch (error) {
    console.error('Get GATC stats error:', error);
    return res.status(500).json({ error: 'Failed to load GATC stats.' });
  }
};

// 3. Submit GATC Laboratory Test Report
const submitGatcInspection = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      test_error_percentage,
      environmental_temp,
      security_seal_no,
      inspection_result,
      inspection_notes,
      working_standards_used,
      test_observations,
    } = req.body;

    const app = await prisma.application.findUnique({ where: { id } });
    if (!app) {
      return res.status(404).json({ error: 'Application not found.' });
    }

    const gatcProfile = await prisma.gatcProfile.findUnique({
      where: { user_id: req.user.id },
    });

    if (
      req.user.role !== 'gatc' ||
      !gatcProfile ||
      !gatcProfile.is_active_recognition ||
      !['ACTIVE', 'ACCREDITED'].includes(gatcProfile.status) ||
      gatcProfile.valid_until < new Date()
    ) {
      return res.status(403).json({ error: 'An active, accredited GATC profile is required to submit test reports.' });
    }

    const isAssignedCentre =
      app.assigned_gatc_id === req.user.id ||
      app.assigned_gatc_code === gatcProfile.gatc_code;
    if (!isAssignedCentre || app.status !== 'Under Inspection') {
      return res.status(403).json({ error: 'This application is not currently assigned to your GATC for inspection.' });
    }

    const centreName = gatcProfile.centre_name;
    const gatcCode = gatcProfile.gatc_code;
    const sealNo = security_seal_no || `GATC-SEAL-${Date.now().toString().slice(-6)}`;

    const newStatus =
      inspection_result === 'Fail'
        ? 'Rejected'
        : inspection_result === 'Correction Required'
        ? 'Correction Required'
        : 'Inspection Reported';

    // 1. Create a structured VerificationRecord
    const verificationRecord = await prisma.verificationRecord.create({
      data: {
        application_id: app.id,
        instrument_id: app.instrument_id || null,
        verification_type: app.application_type === 'RE_VERIFICATION' ? 'PERIODICAL_REVERIFICATION' : 'INITIAL',
        verifier_type: 'GATC',
        verifier_id: req.user.id,
        verifier_name: centreName,
        verifier_code: gatcCode,
        test_error_percentage: parseFloat(test_error_percentage) || 0.015,
        environmental_conditions: environmental_temp || '23°C, 45% RH (Controlled Lab)',
        working_standards_used: working_standards_used || 'NABL Traceable E2/F1 Weights & Deadweight Standards',
        test_observations: test_observations || `Repeatability test: Pass. Zero load error: 0.00%. Max capacity error: ${test_error_percentage || '0.015'}%.`,
        result: inspection_result || 'Pass',
        security_seal_no: sealNo,
        remarks: inspection_notes || 'Tested in accordance with Legal Metrology General Rules.',
      },
    });

    // 2. Update Application state
    const updatedApp = await prisma.application.update({
      where: { id },
      data: {
        status: newStatus,
        inspection_date: new Date(),
        test_error_percentage: parseFloat(test_error_percentage) || 0.015,
        environmental_temp: environmental_temp || '23°C, 45% RH (Controlled Lab)',
        security_seal_no: sealNo,
        inspection_result: inspection_result || 'Pass',
        inspection_notes: `[GATC: ${centreName}] ${inspection_notes || 'Verification test completed against working standards.'}`,
        rejection_reason: inspection_result === 'Fail' ? (inspection_notes || 'Failed MPE test') : null,
        stamped_by: `${centreName} (${gatcCode})`,
        assigned_gatc_id: req.user.id,
        assigned_gatc_name: centreName,
        assigned_gatc_code: gatcCode,
      },
    });

    await recordAuditLog(
      'GATC_TEST_REPORT_SUBMITTED',
      centreName,
      app.app_number,
      `GATC ${centreName} (${gatcCode}) completed verification testing for ${app.app_number} (${app.instrument_type}). Result: ${inspection_result}. Seal: ${sealNo}. Forwarded to LMO for statutory Form D endorsement.`
    );

    return res.status(200).json({
      message: `GATC verification test report submitted successfully. Report forwarded to LMO for statutory endorsement.`,
      application: updatedApp,
      verificationRecord,
    });
  } catch (error) {
    console.error('Submit GATC inspection error:', error);
    return res.status(500).json({ error: 'Failed to record GATC test report.' });
  }
};

// 4. Get GATC Testing History
const getGatcHistory = async (req, res) => {
  try {
    const gatcUserId = req.user.id;
    const gatcProfile = await prisma.gatcProfile.findUnique({
      where: { user_id: gatcUserId },
    });

    const orClauses = [{ assigned_gatc_id: gatcUserId }];
    if (gatcProfile?.gatc_code) {
      orClauses.push({ assigned_gatc_code: gatcProfile.gatc_code });
    }

    const apps = await prisma.application.findMany({
      where: {
        OR: orClauses,
        status: { in: ['Inspection Reported', 'Approved', 'Rejected', 'Correction Required'] },
      },
      orderBy: { updated_at: 'desc' },
      include: {
        verifications: true,
      },
    });

    const formatted = apps.map((a) => {
      const isApproved = a.status === 'Approved';
      const validUntil = a.certificate_valid_until ? new Date(a.certificate_valid_until) : null;
      const isValid = isApproved && validUntil && validUntil > new Date();

      return {
        id: `GATC-RPT-${a.app_number.replace('APP-', '')}`,
        rawId: a.id,
        appNumber: a.app_number,
        businessName: a.business_name,
        contactName: a.contact_name,
        instrumentType: a.instrument_type,
        make: a.make,
        model: a.model,
        serialNo: a.serial_no,
        capacity: `${a.capacity} ${a.unit}`,
        accuracyClass: a.accuracy_class,
        testDate: a.inspection_date ? new Date(a.inspection_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—',
        result: a.inspection_result || (isApproved ? 'Pass' : a.status),
        status: a.status,
        certificateNo: a.certificate_no || null,
        certificateIssuedAt: a.certificate_issued_at ? new Date(a.certificate_issued_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : null,
        certificateValidUntil: a.certificate_valid_until ? new Date(a.certificate_valid_until).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : null,
        validityStatus: isValid ? 'Active' : (isApproved ? 'Expired' : a.status),
        sealNo: a.security_seal_no,
        errorPercentage: a.test_error_percentage ?? 0.015,
        notes: a.inspection_notes,
        stampedBy: a.stamped_by,
        verifications: a.verifications,
        raw: a,
      };
    });

    return res.status(200).json({ reports: formatted });
  } catch (error) {
    console.error('Get GATC history error:', error);
    return res.status(500).json({ error: 'Failed to retrieve GATC history.' });
  }
};

module.exports = {
  getGatcTasks,
  getGatcStats,
  submitGatcInspection,
  getGatcHistory,
};
