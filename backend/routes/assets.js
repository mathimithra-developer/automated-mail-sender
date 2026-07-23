/** /api/assets — file upload & asset management */
import { Router } from 'express';
import { writeFile, unlink, mkdir, access } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { Asset } from '../lib/models.js';
import { uploadToS3, deleteFromS3, getFromS3, s3Client } from '../lib/s3.js';

const router = Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');

// Ensure uploads directory exists
mkdir(UPLOAD_DIR, { recursive: true }).catch(() => {});

// GET /api/assets
router.get('/', async (req, res) => {
  try {
    const orgId = req.session?.orgId;
    const assets = await Asset.find({ organization: orgId }).sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: assets });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/assets/upload — base64 upload (no multer dependency needed)
router.post('/upload', async (req, res) => {
  try {
    const orgId = req.session.orgId;  // always from session
    const { filename, mimeType, dataBase64 } = req.body;

    if (!filename || !dataBase64) return res.status(400).json({ error: 'filename and dataBase64 required' });

    const ext       = path.extname(filename) || '.png';
    const safeName  = `${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`;
    const filePath  = path.join(UPLOAD_DIR, safeName);
    const buffer    = Buffer.from(dataBase64.replace(/^data:[^;]+;base64,/, ''), 'base64');

    const isS3Configured = !!(
      process.env.AWS_ACCESS_KEY_ID &&
      process.env.AWS_SECRET_ACCESS_KEY &&
      process.env.AWS_REGION &&
      process.env.AWS_S3_BUCKET &&
      process.env.AWS_S3_PUBLIC_URL
    );

    let url = null;
    if (isS3Configured) {
      const s3Url = await uploadToS3(buffer, safeName, mimeType);
      if (s3Url) {
        url = s3Url;
      }
    }

    if (!url) {
      await writeFile(filePath, buffer);
      url = `/uploads/${safeName}`;
    }

    const asset = await Asset.create({
      organization: orgId,
      filename: safeName,
      originalName: filename,
      url,
      mimeType,
      size: buffer.length,
      uploadedBy: req.session?.userId,
    });

    res.status(201).json({ success: true, data: asset });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/assets/img/:filename — proxy asset to browser (local disk OR S3)
router.get('/img/:filename', async (req, res) => {
  const filename = req.params.filename;

  // 1. Try local disk first (fast path for locally-uploaded files)
  const localPath = path.join(UPLOAD_DIR, filename);
  try {
    await access(localPath);
    return res.sendFile(localPath);
  } catch { /* not on local disk — fall through to S3 */ }

  // 2. Proxy from S3 using server-side credentials
  if (!s3Client) return res.status(404).json({ error: 'File not found' });
  try {
    const s3Res = await getFromS3(filename);
    if (!s3Res) return res.status(404).json({ error: 'File not found in S3' });
    res.setHeader('Content-Type', s3Res.ContentType || 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    // s3Res.Body is a Node.js ReadableStream (AWS SDK v3)
    s3Res.Body.pipe(res);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/assets/:id
router.delete('/:id', async (req, res) => {
  try {
    const orgId = req.session.orgId;
    const asset = await Asset.findOneAndDelete({ _id: req.params.id, organization: orgId });
    if (!asset) return res.status(404).json({ error: 'Asset not found' });

    if (asset.url && (asset.url.startsWith('http') || asset.url.startsWith('/api/assets/img/'))) {
      await deleteFromS3(asset.filename);
    } else {
      // Remove file from disk
      const filePath = path.join(UPLOAD_DIR, asset.filename);
      await unlink(filePath).catch(() => {});
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


export default router;
