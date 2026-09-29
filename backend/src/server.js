const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const lmoRoutes = require('./routes/lmo');
const fieldOfficerRoutes = require('./routes/fieldOfficer');
const gatcRoutes = require('./routes/gatc');
const uploadRoutes = require('./routes/upload');
const rulesRoutes = require('./routes/rules');
const path = require('path');

const { securityHeaders } = require('./middleware/securityHeaders');
const { authMiddleware } = require('./middleware/authMiddleware');
const prisma = require('./db');

dotenv.config();

const app = express();

// Disable information disclosure header
app.disable('x-powered-by');

// Security Headers Middleware (OWASP recommended defense-in-depth)
app.use(securityHeaders);

// Body and Cookie Parsers
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true, // Allow cookies to be sent
}));

// Protected static files for uploaded supporting documents and photographs
// Enforces:
// 1. Valid authentication (via cookie or Bearer token)
// 2. Object-level authorization (Owner, LMO/Admin supervisor, or assigned Field Officer / GATC)
app.use(
  '/uploads',
  authMiddleware,
  async (req, res, next) => {
    try {
      const filename = path.basename(req.path);
      if (!filename || filename === '.' || filename === '/') {
        return res.status(403).json({ error: 'Directory listing forbidden.' });
      }

      const doc = await prisma.document.findFirst({
        where: { file_path: { endsWith: filename } },
        include: { application: true },
      });

      if (!doc) {
        return res.status(404).json({ error: 'Document or physical file not found.' });
      }

      const isOwner = req.user && (doc.user_id === req.user.id || doc.application?.user_id === req.user.id);
      const isSupervisor = req.user && ['admin', 'lmo'].includes(req.user.role);
      const isAssignedFo = req.user && req.user.role === 'field_officer' && (doc.application?.assigned_fo_id === req.user.id || doc.user_id === req.user.id);
      const isAssignedGatc = req.user && req.user.role === 'gatc' && (doc.application?.assigned_gatc_id === req.user.id || doc.user_id === req.user.id);

      if (!isOwner && !isSupervisor && !isAssignedFo && !isAssignedGatc) {
        return res.status(403).json({ error: 'Forbidden: You do not have permission to access this document.' });
      }

      next();
    } catch (err) {
      console.error('Uploads authorization check error:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  },
  express.static(path.join(__dirname, '../uploads'))
);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/lmo', lmoRoutes);
app.use('/api/field-officer', fieldOfficerRoutes);
app.use('/api/gatc', gatcRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/rules', rulesRoutes);


// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
