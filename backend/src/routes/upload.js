const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { authMiddleware } = require('../middleware/authMiddleware');
const {
  uploadDocument,
  getApplicationDocuments,
  downloadDocument,
  detachDocument,
} = require('../controllers/uploadController');

const router = express.Router();

const rateLimit = require('express-rate-limit');

// Rate limiter for file uploads (defense against DoS and disk exhaustion)
const uploadRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 60 : 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too Many Requests',
    message: 'File upload rate limit reached. Please wait before uploading more documents.',
  },
});

const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.pdf', '.jfif', '.heic', '.heif', '.bmp'];
const ALLOWED_MIME_TYPES = {
  '.jpg': ['image/jpeg', 'image/jpg', 'image/pjpeg', 'application/octet-stream'],
  '.jpeg': ['image/jpeg', 'image/jpg', 'image/pjpeg', 'application/octet-stream'],
  '.png': ['image/png', 'image/x-png', 'application/octet-stream'],
  '.webp': ['image/webp', 'application/octet-stream'],
  '.pdf': ['application/pdf', 'application/x-pdf', 'application/octet-stream'],
  '.jfif': ['image/jpeg', 'image/jfif', 'image/pjpeg', 'application/octet-stream'],
  '.heic': ['image/heic', 'image/heif', 'application/octet-stream'],
  '.heif': ['image/heic', 'image/heif', 'application/octet-stream'],
  '.bmp': ['image/bmp', 'image/x-ms-bmp', 'application/octet-stream'],
};

// Forbidden extensions anywhere in the filename (prevents double extension attacks like test.php.jpg or invoice.pdf.exe)
const DANGEROUS_EXT_REGEX = /\.(exe|bat|cmd|sh|php|phtml|html|htm|svg|js|vbs|jar|scr|msi|dll|ps1|py|pl|cgi)(\.|$)/i;

// Multer disk storage configuration with randomized filenames
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}`;
    cb(null, `doc-${uniqueSuffix}${ext}`);
  },
});

// Strict file filter validating extension, MIME type, double extensions, and path traversal
const fileFilter = (req, file, cb) => {
  const originalName = file.originalname || '';

  // 1. Defend against path traversal and null-byte injection in filename
  if (originalName.includes('\0') || originalName.includes('..') || /[/\\]/.test(originalName)) {
    return cb(new Error('Invalid filename: Path traversal or control characters detected.'), false);
  }

  // 2. Reject executable / script extensions anywhere in the filename
  if (DANGEROUS_EXT_REGEX.test(originalName)) {
    return cb(new Error('Security violation: Dangerous file extension detected.'), false);
  }

  // 3. Strict extension whitelist
  const ext = path.extname(originalName).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return cb(new Error('Invalid file extension. Only JPG, PNG, WEBP, and PDF documents are permitted.'), false);
  }

  // 4. Strict MIME type check
  const allowedMimes = ALLOWED_MIME_TYPES[ext] || [];
  const fileMime = (file.mimetype || '').toLowerCase();
  if (!allowedMimes.includes(fileMime)) {
    return cb(new Error(`MIME type mismatch: Extension ${ext} does not match declared type ${file.mimetype}.`), false);
  }

  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit per file
    files: 1,
  },
});

// Wrapper to handle Multer upload errors cleanly with 400 Bad Request
const handleUpload = (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ error: 'File size exceeds maximum permitted limit (10MB).' });
        }
        return res.status(400).json({ error: `File upload error: ${err.message}` });
      }
      return res.status(400).json({ error: err.message || 'Invalid file upload.' });
    }
    next();
  });
};

// Routes
router.post('/', authMiddleware, uploadRateLimiter, handleUpload, uploadDocument);
router.get('/application/:applicationId', authMiddleware, getApplicationDocuments);
router.delete('/:id/application/:applicationId', authMiddleware, detachDocument);
router.get('/:id', authMiddleware, downloadDocument);

module.exports = router;
