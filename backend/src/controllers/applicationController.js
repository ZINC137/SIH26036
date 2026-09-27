const { PrismaClient } = require("@prisma/client");
const crypto = require("crypto");
const { createRuleSnapshot } = require("../services/ruleEngineService");
const prisma = new PrismaClient();

// Calculate statutory verification fee based on Legal Metrology Rules Schedule XII
const calculateFee = (instrument_type, application_type) => {
  const type = (instrument_type || "").toLowerCase();
  let baseFee = 500;
  if (type.includes("fuel dispenser")) baseFee = 2500;
  else if (type.includes("crane") || type.includes("weighbridge")) baseFee = 4000;
  else if (type.includes("platform balance") || type.includes("500kg")) baseFee = 1200;
  else if (type.includes("flow meter") || type.includes("moisture")) baseFee = 1500;
  else if (type.includes("precision") || type.includes("analytical")) baseFee = 1000;

  // Re-verification fee is standard statutory fee
  return baseFee;
};

// Generate unique APP-YYYY-NNN style number with collision-defense suffix
const generateAppNumber = async () => {
  const year = new Date().getFullYear();
  const count = await prisma.application.count();
  const seq = String(count + 1).padStart(3, "0");
  const randHex = crypto.randomBytes(2).toString("hex").toUpperCase();
  return `APP-${year}-${seq}-${randHex}`;
};

// Check and trigger automated expiry alerts & reminder notifications (Requirement 5 & 6)
const triggerExpiryNotifications = async (userId) => {
  try {
    const now = new Date();
    const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const userApps = await prisma.application.findMany({
      where: {
        user_id: userId,
        status: "Approved",
        certificate_valid_until: { not: null },
      },
    });

    for (const app of userApps) {
      const expiry = new Date(app.certificate_valid_until);

      // 1. Expired
      if (expiry <= now) {
        const existing = await prisma.notification.findFirst({
          where: {
            user_id: userId,
            type: "EXPIRED",
            reference_id: app.certificate_no || app.app_number,
          },
        });
        if (!existing) {
          await prisma.notification.create({
            data: {
              user_id: userId,
              type: "EXPIRED",
              title: `Statutory Stamping Expired: ${app.certificate_no}`,
              message: `The Legal Metrology verification certificate for ${app.instrument_type} (${app.make} ${app.serial_no}) expired on ${expiry.toLocaleDateString("en-IN")}. Immediate re-verification is mandated by Section 24 to avoid statutory penalties.`,
              reference_id: app.certificate_no || app.app_number,
            },
          });
        }
      }
      // 2. Expiring in 7 Days
      else if (expiry <= sevenDaysFromNow) {
        const existing = await prisma.notification.findFirst({
          where: {
            user_id: userId,
            type: "EXPIRY_WARNING_7D",
            reference_id: app.certificate_no || app.app_number,
          },
        });
        if (!existing) {
          await prisma.notification.create({
            data: {
              user_id: userId,
              type: "EXPIRY_WARNING_7D",
              title: `URGENT: Stamping Validity Expires in 7 Days`,
              message: `Certificate ${app.certificate_no} for ${app.instrument_type} expires on ${expiry.toLocaleDateString("en-IN")}. Please submit your re-verification application now.`,
              reference_id: app.certificate_no || app.app_number,
            },
          });
        }
      }
      // 3. Expiring in 30 Days
      else if (expiry <= thirtyDaysFromNow) {
        const existing = await prisma.notification.findFirst({
          where: {
            user_id: userId,
            type: "EXPIRY_WARNING_30D",
            reference_id: app.certificate_no || app.app_number,
          },
        });
        if (!existing) {
          await prisma.notification.create({
            data: {
              user_id: userId,
              type: "EXPIRY_WARNING_30D",
              title: `Upcoming Verification Renewal: 30-Day Alert`,
              message: `Your annual stamping certificate ${app.certificate_no} will be due for re-verification on ${expiry.toLocaleDateString("en-IN")}. Schedule your verification in advance.`,
              reference_id: app.certificate_no || app.app_number,
            },
          });
        }
      }
    }
  } catch (err) {
    console.error("Error triggering expiry notifications:", err);
  }
};

// POST /api/auth/applications (Requirement 2 & 15: Verification & Re-verification Submission)
const submitApplication = async (req, res) => {
  try {
    const {
      application_type,
      instrument_id,
      previous_certificate_no,
      preferred_date,
      preferred_time,
      inspection_mode,
      instrument_type,
      selected_category_code,
      preferred_verification_route,
      category_fields_data,
      make,
      model,
      serial_no,
      capacity,
      unit,
      business_name,
      gst_no,
      address,
      city,
      state,
      pincode,
      contact_name,
      contact_phone,
      contact_email,
      trade_type,
      accuracy_class,
      priority,
      document_ids,
    } = req.body;

    const required = {
      instrument_type,
      make,
      serial_no,
      capacity,
      business_name,
      address,
      city,
      state,
      pincode,
      contact_name,
      contact_phone,
      contact_email,
    };
    const missing = Object.entries(required)
      .filter(([, v]) => !v)
      .map(([k]) => k);
    if (missing.length > 0) {
      return res.status(400).json({ error: "Missing required fields: " + missing.join(", ") });
    }

    // Validate instrument ownership if re-verifying an existing instrument
    if (instrument_id) {
      const ownedInstrument = await prisma.instrument.findFirst({
        where: { id: instrument_id, user_id: req.user.id },
      });
      if (!ownedInstrument) {
        return res.status(400).json({ error: "Invalid instrument ID: You can only apply for re-verification of instruments registered to your account." });
      }
    }

    const app_number = await generateAppNumber();
    const appType = application_type || "INITIAL_VERIFICATION";
    const fee_amount = calculateFee(instrument_type, appType);
    const payment_ref = `TXN-BHARATKOSH-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;

    // Create immutable frozen Legal Metrology rule snapshot
    const catCode = selected_category_code || instrument_type;
    const ruleSnapshotData = await createRuleSnapshot(catCode, state, appType);

    // Atomically persist application, link owned documents, write audit log, and dispatch notification
    const application = await prisma.$transaction(async (tx) => {
      const app = await tx.application.create({
        data: {
          app_number,
          user_id: req.user.id,
          application_type: appType,
          instrument_id: instrument_id || null,
          previous_certificate_no: previous_certificate_no || null,
          preferred_date: preferred_date || null,
          preferred_time: preferred_time || null,
          inspection_mode: inspection_mode || "ON_SITE",
          instrument_type,
          selected_category_code: catCode,
          make,
          model: model || null,
          serial_no,
          capacity,
          unit: unit || "kg",
          accuracy_class: accuracy_class || "Class III (Medium Accuracy)",
          business_name,
          trade_type: trade_type || "Commercial Trader",
          gst_no: gst_no || null,
          address,
          city,
          state,
          pincode,
          contact_name,
          contact_phone,
          contact_email,
          priority: priority || "Normal",
          fee_amount,
          payment_status: "PAID",
          payment_ref,
          status: "Pending",

          // Objective A & B: Rule configuration & routing snapshot
          rule_set_id: ruleSnapshotData.ruleSetId,
          rule_version: ruleSnapshotData.ruleVersion,
          authority_eligibility_version: ruleSnapshotData.authorityEligibilityVersion,
          rule_snapshot: ruleSnapshotData.ruleSnapshot,
          legacy_rule_snapshot: false,
          preferred_verification_route: preferred_verification_route || "NO_PREFERENCE",
          eligible_authority_types: ruleSnapshotData.eligibleAuthorityTypes || "LMO",
          category_fields_data: category_fields_data
            ? (typeof category_fields_data === 'string' ? category_fields_data : JSON.stringify(category_fields_data))
            : null,
        },
      });

      // Link uploaded documents to this application if provided (strictly enforcing ownership)
      if (Array.isArray(document_ids) && document_ids.length > 0) {
        await tx.document.updateMany({
          where: { id: { in: document_ids }, user_id: req.user.id },
          data: { application_id: app.id },
        });
      }

      // Record audit trail
      await tx.auditLog.create({
        data: {
          action: "APPLICATION_SUBMITTED",
          actor: req.user.email,
          target: app_number,
          details: `${appType} application ${app_number} submitted for ${instrument_type} (${make} ${serial_no}) by ${business_name}. Fee ₹${fee_amount} settled via ${payment_ref}.`,
        },
      });

      // Create confirmation notification
      await tx.notification.create({
        data: {
          user_id: req.user.id,
          type: "APPLICATION_UPDATE",
          title: `Application Registered: ${app_number}`,
          message: `Your ${appType === "RE_VERIFICATION" ? "re-verification" : "verification"} application has been lodged and sent to the jurisdictional LMO for scheduling.`,
          reference_id: app_number,
        },
      });

      return app;
    });

    return res.status(201).json({
      message: "Application submitted successfully",
      application,
    });
  } catch (error) {
    console.error("Submit application error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// GET /api/auth/applications
const getMyApplications = async (req, res) => {
  try {
    const applications = await prisma.application.findMany({
      where: { user_id: req.user.id },
      orderBy: { submitted_at: "desc" },
      include: {
        documents: true,
        verifications: true,
      },
    });
    return res.status(200).json({ applications });
  } catch (error) {
    console.error("Get applications error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// GET /api/auth/applications/:id
const getApplicationById = async (req, res) => {
  try {
    const { id } = req.params;
    const application = await prisma.application.findFirst({
      where: {
        id,
        user_id: req.user.id,
      },
      include: {
        documents: true,
        verifications: true,
      },
    });
    if (!application) {
      return res.status(404).json({ error: "Application not found" });
    }
    return res.status(200).json({ application });
  } catch (error) {
    console.error("Get application by ID error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// GET /api/auth/certificates
const getMyCertificates = async (req, res) => {
  try {
    const certificates = await prisma.application.findMany({
      where: {
        user_id: req.user.id,
        status: "Approved",
        certificate_no: { not: null },
      },
      orderBy: { certificate_issued_at: "desc" },
    });

    const now = new Date();
    const formatted = certificates.map((c) => {
      const validUntil = c.certificate_valid_until ? new Date(c.certificate_valid_until) : null;
      let validityStatus = "Expired";
      if (validUntil) {
        if (validUntil > now) {
          const diffDays = Math.ceil((validUntil - now) / (1000 * 60 * 60 * 24));
          validityStatus = diffDays <= 30 ? "Expiring Soon" : "Valid";
        } else {
          validityStatus = "Expired";
        }
      }

      return {
        id: c.certificate_no,
        appId: c.app_number,
        rawId: c.id,
        instrumentId: c.instrument_id,
        instrument: `${c.instrument_type} (${c.capacity}${c.unit})`,
        instrumentType: c.instrument_type,
        make: c.make,
        model: c.model,
        serial: c.serial_no,
        capacity: `${c.capacity} ${c.unit}`,
        accuracyClass: c.accuracy_class,
        business: c.business_name,
        address: `${c.address}, ${c.city}, ${c.state} - ${c.pincode}`,
        issued: c.certificate_issued_at
          ? new Date(c.certificate_issued_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
          : "—",
        expires: c.certificate_valid_until
          ? new Date(c.certificate_valid_until).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
          : "—",
        status: validityStatus,
        securitySeal: c.security_seal_no || "SEAL-DL-SECURED",
        stampedBy: c.stamped_by || "Legal Metrology Inspector",
        fee: c.fee_amount,
        raw: c,
      };
    });

    return res.status(200).json({ certificates: formatted });
  } catch (error) {
    console.error("Get certificates error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// GET /api/auth/instruments (Requirement 6 & 10: Centralized Digital Instrument Repository)
const getMyInstruments = async (req, res) => {
  try {
    const instruments = await prisma.instrument.findMany({
      where: { user_id: req.user.id },
      orderBy: { updated_at: "desc" },
      include: {
        applications: {
          select: { id: true, app_number: true, status: true, submitted_at: true },
        },
        verification_history: {
          orderBy: { test_date: "desc" },
        },
      },
    });

    const now = new Date();
    const formatted = instruments.map((inst) => {
      const expiry = inst.validity_expiry_date ? new Date(inst.validity_expiry_date) : null;
      let lifecycleStatus = inst.current_status;
      if (expiry) {
        if (expiry <= now) lifecycleStatus = "REVERIFICATION_DUE";
        else {
          const daysLeft = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
          lifecycleStatus = daysLeft <= 30 ? "EXPIRING_SOON" : "VERIFIED";
        }
      }

      return {
        id: inst.id,
        instrumentId: inst.instrument_id,
        instrument_id: inst.instrument_id,
        type: inst.instrument_type,
        instrument_type: inst.instrument_type,
        make: inst.make,
        model: inst.model || "Standard",
        serialNo: inst.serial_no,
        serial_no: inst.serial_no,
        capacity: inst.capacity,
        unit: inst.unit,
        capacityWithUnit: `${inst.capacity} ${inst.unit}`,
        accuracyClass: inst.accuracy_class,
        location: inst.location_address,
        businessName: inst.business_name,
        status: lifecycleStatus,
        current_status: lifecycleStatus,
        lastVerification: inst.last_verification_date
          ? new Date(inst.last_verification_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
          : "—",
        last_verification_date: inst.last_verification_date,
        nextDueDate: inst.validity_expiry_date
          ? new Date(inst.validity_expiry_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
          : "—",
        validity_expiry_date: inst.validity_expiry_date,
        certificateNo: inst.current_certificate_no,
        current_certificate_no: inst.current_certificate_no,
        securitySealNo: inst.current_security_seal_no,
        reverificationsCount: inst.reverification_count,
        history: inst.verification_history,
        applicationsCount: inst.applications.length,
      };
    });

    return res.status(200).json({ instruments: formatted });
  } catch (error) {
    console.error("Get instruments error:", error);
    return res.status(500).json({ error: "Failed to retrieve instrument repository." });
  }
};

// GET /api/auth/notifications (Requirement 6: Expiry alerts & notifications)
const getNotifications = async (req, res) => {
  try {
    await triggerExpiryNotifications(req.user.id);

    const notifications = await prisma.notification.findMany({
      where: { user_id: req.user.id },
      orderBy: { created_at: "desc" },
      take: 50,
    });

    const unreadCount = notifications.filter((n) => !n.is_read).length;
    return res.status(200).json({ notifications, unreadCount });
  } catch (error) {
    console.error("Get notifications error:", error);
    return res.status(500).json({ error: "Failed to load notifications." });
  }
};

// PUT /api/auth/notifications/:id/read
const markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.notification.updateMany({
      where: { id, user_id: req.user.id },
      data: { is_read: true },
    });
    return res.status(200).json({ message: "Notification marked as read" });
  } catch (error) {
    console.error("Mark notification read error:", error);
    return res.status(500).json({ error: "Failed to update notification." });
  }
};

// GET /api/auth/dashboard-stats
const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;
    await triggerExpiryNotifications(userId);

    const [total, pending, approved, underInspection, rejected, instrumentsCount, unreadAlerts] = await Promise.all([
      prisma.application.count({ where: { user_id: userId } }),
      prisma.application.count({ where: { user_id: userId, status: "Pending" } }),
      prisma.application.count({ where: { user_id: userId, status: "Approved" } }),
      prisma.application.count({ where: { user_id: userId, status: { in: ["Under Inspection", "Inspection Reported"] } } }),
      prisma.application.count({ where: { user_id: userId, status: { in: ["Rejected", "Correction Required"] } } }),
      prisma.instrument.count({ where: { user_id: userId } }),
      prisma.notification.count({ where: { user_id: userId, is_read: false } }),
    ]);

    return res.status(200).json({
      stats: {
        total,
        pending,
        approved,
        underInspection,
        rejected,
        certificates: approved,
        instruments: instrumentsCount,
        unreadAlerts,
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// Multi-Criteria Universal Search (Requirement 11)
const searchRegistry = async (req, res) => {
  try {
    const { q, type, status, state, city } = req.query;
    const queryStr = (q || "").trim().toLowerCase();

    const where = {};
    // Non-supervisors (citizens/traders) can strictly search only their own registered applications and instruments
    if (!['admin', 'lmo'].includes(req.user?.role)) {
      where.user_id = req.user.id;
    }

    if (status && status !== "All") where.status = status;
    if (type && type !== "All") where.instrument_type = { contains: type };
    if (state && state !== "All") where.state = { contains: state };
    if (city) where.city = { contains: city };

    const applications = await prisma.application.findMany({
      where,
      orderBy: { updated_at: "desc" },
      take: 100,
    });

    let results = applications;
    if (queryStr) {
      results = applications.filter(
        (a) =>
          a.app_number.toLowerCase().includes(queryStr) ||
          (a.certificate_no && a.certificate_no.toLowerCase().includes(queryStr)) ||
          a.serial_no.toLowerCase().includes(queryStr) ||
          a.business_name.toLowerCase().includes(queryStr) ||
          a.instrument_type.toLowerCase().includes(queryStr) ||
          (a.security_seal_no && a.security_seal_no.toLowerCase().includes(queryStr))
      );
    }

    const formatted = results.map((r) => ({
      appNumber: r.app_number,
      certificateNo: r.certificate_no,
      businessName: r.business_name,
      instrumentType: r.instrument_type,
      serialNo: r.serial_no,
      status: r.status,
      sealNo: r.security_seal_no,
      city: r.city,
      state: r.state,
      validUntil: r.certificate_valid_until,
      submittedAt: r.submitted_at,
    }));

    return res.status(200).json({ results: formatted, total: formatted.length });
  } catch (error) {
    console.error("Search registry error:", error);
    return res.status(500).json({ error: "Search failed." });
  }
};

module.exports = {
  submitApplication,
  getMyApplications,
  getApplicationById,
  getMyCertificates,
  getMyInstruments,
  getNotifications,
  markNotificationRead,
  getDashboardStats,
  searchRegistry,
};
