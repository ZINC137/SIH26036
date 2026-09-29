const crypto = require('crypto');
const fs = require('fs/promises');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const projectRoot = path.resolve(__dirname, '../../..');

const resolveDatabasePath = () => {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl?.startsWith('file:')) {
    throw new Error('Automatic SQLite backups require a file: DATABASE_URL.');
  }

  const configuredPath = decodeURIComponent(databaseUrl.slice('file:'.length).split('?')[0]);
  return path.isAbsolute(configuredPath)
    ? configuredPath
    : path.resolve(__dirname, '../../prisma', configuredPath);
};

const reserveSnapshotName = async (directory, extension) => {
  const timestamp = new Date().toISOString().replace(/[-:.]/g, '');
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const name = `SIH26036-${timestamp}-${crypto.randomUUID()}${extension}`;
    const target = path.join(directory, name);
    try {
      await fs.access(target);
    } catch (error) {
      if (error.code === 'ENOENT') return { name, target };
      throw error;
    }
  }
  throw new Error(`Could not allocate a unique backup name in ${directory}.`);
};

const getRecordCounts = async (client) => {
  const [
    users,
    applications,
    instruments,
    documents,
    auditLogs,
    verificationRecords,
    notifications,
  ] = await Promise.all([
    client.user.count(),
    client.application.count(),
    client.instrument.count(),
    client.document.count(),
    client.auditLog.count(),
    client.verificationRecord.count(),
    client.notification.count(),
  ]);

  return { users, applications, instruments, documents, auditLogs, verificationRecords, notifications };
};

const findMissingUploads = async (client, uploadsSource) => {
  const documents = await client.document.findMany({
    select: { file_path: true, file_name: true },
  });
  const missing = [];

  for (const document of documents) {
    const relativePath = document.file_path.replace(/^[/\\]+/, '');
    if (!relativePath.startsWith('uploads/')) {
      throw new Error(`Refusing unsafe uploaded-document path in database: ${document.file_path}`);
    }
    const physicalPath = path.resolve(uploadsSource, relativePath.slice('uploads/'.length));
    const relativeToUploads = path.relative(uploadsSource, physicalPath);
    if (
      relativeToUploads.startsWith(`..${path.sep}`) ||
      relativeToUploads === '..' ||
      path.isAbsolute(relativeToUploads)
    ) {
      throw new Error(`Refusing unsafe uploaded-document path in database: ${document.file_path}`);
    }

    try {
      await fs.access(physicalPath);
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
      missing.push(document.file_name);
    }
  }

  return missing;
};

const restrictSnapshotPermissions = async (directory) => {
  await fs.chmod(directory, 0o700);
  const entries = await fs.readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      await restrictSnapshotPermissions(target);
    } else if (entry.isFile()) {
      await fs.chmod(target, 0o600);
    }
  }
};

const createBackupSnapshot = async (prisma) => {
  const backupRoot = path.resolve(process.env.SIH_BACKUP_DIR || path.join(projectRoot, 'backups'));
  const databaseDirectory = path.join(backupRoot, 'database');
  const uploadDirectory = path.join(backupRoot, 'uploads');
  await fs.mkdir(databaseDirectory, { recursive: true });
  await fs.mkdir(uploadDirectory, { recursive: true });

  const databaseSnapshot = await reserveSnapshotName(databaseDirectory, '.db');
  const uploadSnapshot = await reserveSnapshotName(uploadDirectory, '');
  const databasePath = resolveDatabasePath();

  await prisma.$executeRaw`VACUUM INTO ${databaseSnapshot.target}`;

  const snapshotClient = new PrismaClient({
    datasources: { db: { url: `file:${databaseSnapshot.target}` } },
  });
  let recordCounts;
  try {
    const integrityRows = await snapshotClient.$queryRaw`PRAGMA integrity_check`;
    if (integrityRows.length !== 1 || integrityRows[0].integrity_check !== 'ok') {
      throw new Error(`SQLite backup integrity check failed for ${databaseSnapshot.target}.`);
    }
    recordCounts = await getRecordCounts(snapshotClient);
  } finally {
    await snapshotClient.$disconnect();
  }

  const uploadsSource = path.resolve(__dirname, '../../uploads');
  const missingUploads = await findMissingUploads(prisma, uploadsSource);
  try {
    await fs.access(uploadsSource);
    await fs.cp(uploadsSource, uploadSnapshot.target, {
      recursive: true,
      errorOnExist: true,
      force: false,
    });
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    await fs.mkdir(uploadSnapshot.target, { recursive: false });
  }
  await fs.chmod(databaseSnapshot.target, 0o600);
  await restrictSnapshotPermissions(uploadSnapshot.target);

  return {
    databasePath: databaseSnapshot.target,
    uploadsPath: uploadSnapshot.target,
    sourceDatabasePath: databasePath,
    recordCounts,
    missingUploads,
  };
};

module.exports = { createBackupSnapshot };
