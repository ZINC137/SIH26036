const express = require('express');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const { authMiddleware } = require('../middleware/authMiddleware');
const {
  uploadDocument,
  getApplicationDocuments,
  downloadDocument,
} = require('../controllers/uploadController');

const router = express.Router();

// Multer disk storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    cb(null, `doc-${uniqueSuffix}${ext}`);
  },
});

// Allowed file types: JPEG, PNG, WEBP, PDF
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, PNG, WEBP, and PDF documents are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// Routes
router.post('/', authMiddleware, upload.single('file'), uploadDocument);
router.get('/application/:applicationId', authMiddleware, getApplicationDocuments);
router.get('/:id', downloadDocument);

module.exports = router;
