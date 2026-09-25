const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

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
    } = req.body;

    const required = { instrument_type, make, serial_no, capacity, business_name, address, city, state, pincode, contact_name, contact_phone, contact_email };
    const missing = Object.entries(required).filter(([, v]) => !v).map(([k]) => k);
    if (missing.length > 0) {
      return res.status(400).json({ error: "Missing required fields: " + missing.join(", ") });
    }

    const app_number = await generateAppNumber();

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
        business_name,
        gst_no: gst_no || null,
        address,
        city,
        state,
        pincode,
        contact_name,
        contact_phone,
        contact_email,
        status: "Pending",
      },
    });

    return res.status(201).json({ message: "Application submitted successfully", application });
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

module.exports = { submitApplication, getMyApplications, getDashboardStats };
