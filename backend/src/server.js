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
const fs = require('fs');

const { securityHeaders } = require('./middleware/securityHeaders');
const { authMiddleware } = require('./middleware/authMiddleware');
const prisma = require('./db');
const { canAccessDocument } = require('./controllers/uploadController');
const { createBackupSnapshot } = require('./services/backupService');

dotenv.config();

const app = express();

// Trust reverse proxy (Create React App dev proxy / Nginx)
app.set('trust proxy', 1);

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

const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Protected static files for uploaded supporting documents and photographs
// Enforces:
// 1. Valid authentication (via cookie or Bearer token)
// 2. Object-level authorization (Owner, LMO/Admin supervisor, or assigned Field Officer / GATC)
app.use(
  '/uploads',
  authMiddleware,
  async (req, res) => {
    try {
      const filename = path.basename(req.path);
      if (!filename || filename === '.' || filename === '..' || req.path !== `/${filename}`) {
        return res.status(403).json({ error: 'Directory listing forbidden.' });
      }

      const doc = await prisma.document.findFirst({
        where: { file_path: `/uploads/${filename}` },
        include: { application: true, content: true },
      });

      if (!doc) {
        return res.status(404).json({ error: 'Document or physical file not found.' });
      }

      if (!(await canAccessDocument(req.user, doc))) {
        return res.status(403).json({ error: 'Forbidden: You do not have permission to access this document.' });
      }

      const filePath = path.join(__dirname, '../uploads', filename);

      // 1. If physical file exists on disk cache, stream directly
      if (fs.existsSync(filePath)) {
        res.setHeader('Content-Type', doc.mime_type || 'application/octet-stream');
        res.setHeader('Content-Disposition', `inline; filename="${doc.file_name || filename}"`);
        return res.sendFile(filePath);
      }

      // 2. If ephemeral container disk wiped it, stream from Neon cloud database
      if (doc.content && doc.content.data_base64) {
        const buffer = Buffer.from(doc.content.data_base64, 'base64');
        fs.promises.writeFile(filePath, buffer).catch(() => {});
        res.setHeader('Content-Type', doc.mime_type || 'application/octet-stream');
        res.setHeader('Content-Disposition', `inline; filename="${doc.file_name || filename}"`);
        return res.send(buffer);
      }

      return res.status(404).json({ error: 'Physical file not found on server.' });
    } catch (err) {
      console.error('Uploads authorization check error:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
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
const backupIntervalHours = Number.parseInt(process.env.SIH_BACKUP_INTERVAL_HOURS || '24', 10);

if (!Number.isInteger(backupIntervalHours) || backupIntervalHours < 1) {
  throw new Error('SIH_BACKUP_INTERVAL_HOURS must be a positive integer.');
}

let backupInProgress = false;
const runScheduledBackup = async (reason) => {
  if (backupInProgress) {
    console.warn(`[Backup] Skipping ${reason} snapshot because a backup is already running.`);
    return;
  }

  backupInProgress = true;
  try {
    const snapshot = await createBackupSnapshot(prisma);
    console.log(
      `[Backup] Created ${reason} snapshot at ${snapshot.databasePath} and ${snapshot.uploadsPath}. ` +
      `Records: ${JSON.stringify(snapshot.recordCounts)}`
    );
    if (snapshot.missingUploads.length > 0) {
      console.error(
        `[Backup] The database references ${snapshot.missingUploads.length} uploaded file(s) missing from backend/uploads: ` +
        snapshot.missingUploads.join(', ')
      );
    }
  } catch (error) {
    console.error(`[Backup] Failed to create ${reason} snapshot:`, error);
  } finally {
    backupInProgress = false;
  }
};

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  try {
    const { seedRules } = require('./rules/seedRules');
    await seedRules();
  } catch (err) {
    console.warn('Statutory rule verification notice:', err.message);
  }
  void runScheduledBackup('startup');
  const backupInterval = setInterval(
    () => void runScheduledBackup('scheduled'),
    backupIntervalHours * 60 * 60 * 1000
  );
  backupInterval.unref();
});
