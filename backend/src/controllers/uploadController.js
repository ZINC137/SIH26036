const path = require('path');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Upload document / photograph
const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const { doc_type, application_id } = req.body;
    const userId = req.user ? req.user.id : null;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required to upload documents.' });
    }

    const relativePath = `/uploads/${req.file.filename}`;

    const doc = await prisma.document.create({
      data: {
        user_id: userId,
        application_id: application_id || null,
        doc_type: doc_type || 'SUPPORTING_DOCUMENT',
        file_name: req.file.originalname,
        file_path: relativePath,
        file_size: req.file.size,
        mime_type: req.file.mimetype,
      },
    });

    return res.status(201).json({
      message: 'Document uploaded successfully',
      document: doc,
    });
  } catch (error) {
    console.error('Upload document error:', error);
    return res.status(500).json({ error: 'Failed to save document metadata.' });
  }
};

// Get documents for an application (Protected: Application Owner or Authorized Officer)
const getApplicationDocuments = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      return res.status(404).json({ error: 'Application not found.' });
    }

    const isOwner = req.user && application.user_id === req.user.id;
    const isOfficer = req.user && ['admin', 'lmo', 'gatc', 'field_officer'].includes(req.user.role);

    if (!isOwner && !isOfficer) {
      return res.status(403).json({ error: 'Forbidden: You do not have permission to view documents for this application.' });
    }

    const docs = await prisma.document.findMany({
      where: { application_id: applicationId },
      orderBy: { uploaded_at: 'desc' },
    });
    return res.status(200).json({ documents: docs });
  } catch (error) {
    console.error('Get application documents error:', error);
    return res.status(500).json({ error: 'Failed to load documents.' });
  }
};

// Stream / download document file (Protected: Document Uploader, Application Owner, or Authorized Officer)
const downloadDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await prisma.document.findUnique({
      where: { id },
      include: { application: true },
    });

    if (!doc) {
      return res.status(404).json({ error: 'Document not found.' });
    }

    // Access control: Uploader, Application Owner, or Authorized Legal Metrology Officer
    const isOwner = req.user && (doc.user_id === req.user.id || doc.application?.user_id === req.user.id);
    const isOfficer = req.user && ['admin', 'lmo', 'gatc', 'field_officer'].includes(req.user.role);

    if (!isOwner && !isOfficer) {
      return res.status(403).json({ error: 'Forbidden: You do not have permission to access this document.' });
    }

    const uploadsDir = path.resolve(__dirname, '../../uploads');
    const absolutePath = path.resolve(__dirname, '../../', doc.file_path);

    // Defense against path traversal
    if (!absolutePath.startsWith(uploadsDir)) {
      return res.status(403).json({ error: 'Access denied: Invalid file path.' });
    }

    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({ error: 'Physical file not found on server.' });
    }

    res.setHeader('Content-Type', doc.mime_type);
    res.setHeader('Content-Disposition', `inline; filename="${doc.file_name}"`);
    return res.sendFile(absolutePath);
  } catch (error) {
    console.error('Download document error:', error);
    return res.status(500).json({ error: 'Failed to retrieve file.' });
  }
};

module.exports = {
  uploadDocument,
  getApplicationDocuments,
  downloadDocument,
};
