/** /api/ai — AI-powered email tools via Google Gemini */
import { Router } from 'express';
import * as AI from '../lib/ai.js';
import path from 'path';
import { fileURLToPath } from 'url';


const router = Router();

// POST /api/ai/generate — generate full email HTML from prompt
router.post('/generate', async (req, res) => {
  try {
    const { prompt, context } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Prompt is required' });
    const html = await AI.generateEmailContent(prompt, context || {});
    res.json({ success: true, html });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/ai/subject-lines — generate 5 subject line variants
router.post('/subject-lines', async (req, res) => {
  try {
    const { html, campaignName } = req.body;
    const lines = await AI.generateSubjectLines(html || '', campaignName || '');
    res.json({ success: true, lines });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/ai/analyze — spam score + readability
router.post('/analyze', async (req, res) => {
  try {
    const { html, subject } = req.body;
    if (!html) return res.status(400).json({ error: 'HTML is required' });
    const analysis = await AI.analyzeEmail(html, subject || '');
    res.json({ success: true, analysis });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/ai/accessibility — accessibility audit
router.post('/accessibility', async (req, res) => {
  try {
    const { html } = req.body;
    if (!html) return res.status(400).json({ error: 'HTML is required' });
    const result = await AI.checkAccessibility(html);
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/ai/rewrite — rewrite copy in a different tone
router.post('/rewrite', async (req, res) => {
  try {
    const { text, tone } = req.body;
    if (!text) return res.status(400).json({ error: 'Text is required' });
    const rewritten = await AI.rewriteContent(text, tone || 'professional');
    res.json({ success: true, text: rewritten });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/ai/ab-variant — generate an A/B subject variant
router.post('/ab-variant', async (req, res) => {
  try {
    const { subject } = req.body;
    if (!subject) return res.status(400).json({ error: 'Subject is required' });
    const variant = await AI.generateABVariant(subject);
    res.json({ success: true, variant });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/ai/generate-image — generate image using Together AI
router.post('/generate-image', async (req, res) => {
  try {
    const { prompt, width, height } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

    // Generate base64 image data from Together AI
    const base64Data = await AI.generateImage(prompt, width || 1024, height || 1024);

    const orgId = req.session.orgId;  // always from session — never fallback
    const filename = `ai_gen_${Date.now()}_${Math.random().toString(36).slice(2)}.png`;
    const mimeType = 'image/png';
    const buffer = Buffer.from(base64Data, 'base64');

    const isS3Configured = !!(
      process.env.AWS_ACCESS_KEY_ID &&
      process.env.AWS_SECRET_ACCESS_KEY &&
      process.env.AWS_REGION &&
      process.env.AWS_S3_BUCKET &&
      process.env.AWS_S3_PUBLIC_URL
    );

    let url = null;
    if (isS3Configured) {
      const { uploadToS3 } = await import('../lib/s3.js');
      const s3Url = await uploadToS3(buffer, filename, mimeType);
      if (s3Url) {
        url = s3Url;
      }
    }

    if (!url) {
      const __dirname = path.dirname(fileURLToPath(import.meta.url));
      const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
      const { writeFile, mkdir } = await import('fs/promises');
      await mkdir(UPLOAD_DIR, { recursive: true }).catch(() => {});
      const filePath = path.join(UPLOAD_DIR, filename);
      await writeFile(filePath, buffer);
      url = `/uploads/${filename}`;
    }

    const { Asset } = await import('../lib/models.js');
    const asset = await Asset.create({
      organization: orgId,
      filename,
      originalName: prompt.slice(0, 30).trim() + '.png',
      url,
      mimeType,
      size: buffer.length,
      uploadedBy: req.session?.userId,
    });

    res.status(201).json({ success: true, data: asset });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

