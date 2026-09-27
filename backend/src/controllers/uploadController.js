const path = require('path');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const canAccessApplication = async (user, applicationId) => {
  if (user.role === 'admin') return true;

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    select: {
      user_id: true,
      assigned_lmo_id: true,
      assigned_fo_id: true,
      assigned_gatc_id: true,
    },
  });

  if (!application) return false;
  if (application.user_id === user.id) return true;

  const assignedUserByRole = {
    lmo: application.assigned_lmo_id,
    field_officer: application.assigned_fo_id,
    gatc: application.assigned_gatc_id,
  };
  return assignedUserByRole[user.role] === user.id;
};

const canAccessDocument = async (user, document) => {
  if (user.role === 'admin' || document.user_id === user.id) return true;
  if (!document.application_id) return false;
  return canAccessApplication(user, document.application_id);
};

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

    if (application_id && !(await canAccessApplication(req.user, application_id))) {
      await fs.promises.unlink(req.file.path);
      return res.status(403).json({ error: 'You are not authorized to attach documents to this application.' });
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

// Get documents for an application
const getApplicationDocuments = async (req, res) => {
  try {
    const { applicationId } = req.params;
    if (!(await canAccessApplication(req.user, applicationId))) {
      return res.status(403).json({ error: 'You are not authorized to view documents for this application.' });
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

// Stream / download document file
const downloadDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await prisma.document.findUnique({ where: { id } });

    if (!doc) {
      return res.status(404).json({ error: 'Document not found.' });
    }

    if (!(await canAccessDocument(req.user, doc))) {
      return res.status(403).json({ error: 'You are not authorized to access this document.' });
    }

    const absolutePath = path.join(__dirname, '../../', doc.file_path);
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
