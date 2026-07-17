/** /api/assets — file upload & asset management */
import { Router } from 'express';
import { writeFile, unlink, mkdir } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { Asset } from '../lib/models.js';

const router = Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = path.join(__dirname, '..', 'public', 'uploads');

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
    const orgId = req.session?.orgId || 'bypass-org';
    const { filename, mimeType, dataBase64 } = req.body;

    if (!filename || !dataBase64) return res.status(400).json({ error: 'filename and dataBase64 required' });

    const ext       = path.extname(filename) || '.png';
    const safeName  = `${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`;
    const filePath  = path.join(UPLOAD_DIR, safeName);
    const buffer    = Buffer.from(dataBase64.replace(/^data:[^;]+;base64,/, ''), 'base64');

    await writeFile(filePath, buffer);

    const url = `/uploads/${safeName}`;
    const asset = await Asset.create({
      organization: orgId === 'bypass-org' ? undefined : orgId,
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

// DELETE /api/assets/:id
router.delete('/:id', async (req, res) => {
  try {
    const asset = await Asset.findByIdAndDelete(req.params.id);
    if (!asset) return res.status(404).json({ error: 'Asset not found' });

    // Remove file from disk
    const filePath = path.join(UPLOAD_DIR, asset.filename);
    await unlink(filePath).catch(() => {});

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
