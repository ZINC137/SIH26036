const path = require('path');
const fs = require('fs');
const prisma = require('../db');

const canAccessApplication = async (user, applicationId) => {
  if (user.role === 'admin' || user.role === 'lmo') return true;

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
  if (user.role === 'admin' || user.role === 'lmo' || document.user_id === user.id) return true;
  if (!document.application_id) return false;
  return canAccessApplication(user, document.application_id);
};

const canAttachDocuments = async (userId, applicationId, documentIds, client = prisma) => {
  const ids = [...new Set(documentIds)];
  if (ids.some((id) => typeof id !== 'string' || !id)) return false;
  if (ids.length === 0) return true;

  const count = await client.document.count({
    where: {
      id: { in: ids },
      user_id: userId,
      OR: [{ application_id: null }, { application_id: applicationId }],
    },
  });
  return count === ids.length;
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

// Get documents for an application (Protected: Application Owner or Authorized Officer)
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

// Stream / download document file (Protected: Document Uploader, Application Owner, Supervisor, or Assigned Officer)
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

    if (!(await canAccessDocument(req.user, doc))) {
      return res.status(403).json({ error: 'You are not authorized to access this document.' });
    }

    const uploadsDir = path.resolve(__dirname, '../../uploads');
    const absolutePath = path.resolve(__dirname, '../..', doc.file_path.replace(/^[/\\]+/, ''));
    const relativePath = path.relative(uploadsDir, absolutePath);
    if (relativePath === '.' || relativePath.startsWith(`..${path.sep}`) || relativePath === '..' || path.isAbsolute(relativePath)) {
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

const detachDocument = async (req, res) => {
  try {
    const { id, applicationId } = req.params;
    const document = await prisma.document.findUnique({ where: { id } });
    if (!document) {
      return res.status(404).json({ error: 'Document not found.' });
    }

    if (
      document.user_id !== req.user.id ||
      document.application_id !== applicationId ||
      !['field_officer', 'gatc'].includes(req.user.role)
    ) {
      return res.status(403).json({ error: 'You are not authorized to detach this document.' });
    }

    if (!(await canAccessApplication(req.user, applicationId))) {
      return res.status(403).json({ error: 'You are not assigned to this application.' });
    }

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      select: { status: true },
    });
    if (!application || application.status !== 'Under Inspection') {
      return res.status(409).json({ error: 'Evidence can only be detached before the inspection report is submitted.' });
    }

    const result = await prisma.document.updateMany({
      where: { id, user_id: req.user.id, application_id: applicationId },
      data: { application_id: null },
    });
    if (result.count !== 1) {
      return res.status(409).json({ error: 'Document association changed; refresh and try again.' });
    }

    return res.status(200).json({ message: 'Document detached from the inspection. The uploaded file was retained.' });
  } catch (error) {
    console.error('Detach inspection document error:', error);
    return res.status(500).json({ error: 'Failed to detach inspection document.' });
  }
};

module.exports = {
  uploadDocument,
  getApplicationDocuments,
  downloadDocument,
  detachDocument,
  canAccessDocument,
  canAttachDocuments,
};
