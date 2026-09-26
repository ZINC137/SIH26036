const { PrismaClient } = require("@prisma/client");
const crypto = require("crypto");
const prisma = new PrismaClient();

// Calculate statutory verification fee based on Legal Metrology Rules Schedule XII
const calculateFee = (instrument_type) => {
  const type = (instrument_type || "").toLowerCase();
  if (type.includes("fuel dispenser")) return 2500;
  if (type.includes("crane") || type.includes("weighbridge")) return 4000;
  if (type.includes("platform balance") || type.includes("500kg")) return 1200;
  if (type.includes("flow meter") || type.includes("moisture")) return 1500;
  if (type.includes("precision") || type.includes("analytical")) return 1000;
  return 500; // Standard counter/small scales
};

// Generate APP-YYYY-NNN style number
const generateAppNumber = async () => {
  const year = new Date().getFullYear();
  const count = await prisma.application.count();
  const seq = String(count + 1).padStart(3, "0");
  return `APP-${year}-${seq}`;
};

// POST /api/auth/applications
const submitApplication = async (req, res) => {
  try {
    const {
      instrument_type, make, model, serial_no, capacity, unit,
      business_name, gst_no, address, city, state, pincode,
      contact_name, contact_phone, contact_email,
      trade_type, accuracy_class, priority,
    } = req.body;

    const required = { instrument_type, make, serial_no, capacity, business_name, address, city, state, pincode, contact_name, contact_phone, contact_email };
    const missing = Object.entries(required).filter(([, v]) => !v).map(([k]) => k);
    if (missing.length > 0) {
      return res.status(400).json({ error: "Missing required fields: " + missing.join(", ") });
    }

    const app_number = await generateAppNumber();
    const fee_amount = calculateFee(instrument_type);
    const payment_ref = `TXN-BHARATKOSH-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;

    const application = await prisma.application.create({
      data: {
        app_number,
        user_id: req.user.id,
        instrument_type,
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
      },
    });

    // Record audit trail
    await prisma.auditLog.create({
      data: {
        action: "APPLICATION_SUBMITTED",
        actor: req.user.email,
        target: app_number,
        details: `Application ${app_number} submitted for ${instrument_type} (${make} ${serial_no}) by ${business_name}. Fee of ₹${fee_amount} settled via ${payment_ref}.`,
      },
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

    const formatted = certificates.map((c) => ({
      id: c.certificate_no,
      appId: c.app_number,
      instrument: `${c.instrument_type} (${c.capacity}${c.unit})`,
      make: c.make,
      serial: c.serial_no,
      business: c.business_name,
      address: `${c.address}, ${c.city}, ${c.state} - ${c.pincode}`,
      issued: c.certificate_issued_at ? new Date(c.certificate_issued_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—",
      expires: c.certificate_valid_until ? new Date(c.certificate_valid_until).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—",
      status: c.certificate_valid_until && new Date(c.certificate_valid_until) > new Date() ? "Valid" : "Expired",
      securitySeal: c.security_seal_no || "SEAL-DL-SECURED",
      stampedBy: c.stamped_by || "Legal Metrology Inspector",
      fee: c.fee_amount,
      raw: c,
    }));

    return res.status(200).json({ certificates: formatted });
  } catch (error) {
    console.error("Get certificates error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// GET /api/auth/dashboard-stats
const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const [total, pending, approved, underInspection, rejected] = await Promise.all([
      prisma.application.count({ where: { user_id: userId } }),
      prisma.application.count({ where: { user_id: userId, status: "Pending" } }),
      prisma.application.count({ where: { user_id: userId, status: "Approved" } }),
      prisma.application.count({ where: { user_id: userId, status: "Under Inspection" } }),
      prisma.application.count({ where: { user_id: userId, status: "Rejected" } }),
    ]);

    return res.status(200).json({
      stats: { total, pending, approved, underInspection, rejected, certificates: approved },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  submitApplication,
  getMyApplications,
  getApplicationById,
  getMyCertificates,
  getDashboardStats,
};
