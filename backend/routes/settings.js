/**
 * /api/settings — Org email settings (Zepto API key, sender, etc.)
 */
import { Router } from 'express';
import { OrgEmailSettings } from '../lib/models.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const orgId    = req.session?.orgId;
    const settings = await OrgEmailSettings.findOne({ organization: orgId }).lean();
    if (!settings)  return res.json({ success: true, data: null });

    // Mask API key — only show last 6 chars
    const safe = { ...settings };
    if (safe.apiKey) safe.apiKey = '••••••' + safe.apiKey.slice(-6);
    if (safe.smtpPass) safe.smtpPass = '••••••••';

    res.json({ success: true, data: safe });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/', async (req, res) => {
  try {
    const orgId = req.session?.orgId;
    const body  = req.body;

    // Don't overwrite masked value
    if (body.apiKey?.startsWith('••••')) delete body.apiKey;
    if (body.smtpPass?.startsWith('••••')) delete body.smtpPass;

    const settings = await OrgEmailSettings.findOneAndUpdate(
      { organization: orgId },
      { ...body, organization: orgId },
      { new: true, upsert: true, runValidators: true }
    );

    res.json({ success: true, data: settings });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/settings/test-send — send a test email using current settings
router.post('/test-send', async (req, res) => {
  try {
    const { to } = req.body;
    if (!to) return res.status(400).json({ error: 'Recipient email required' });

    const { sendEmail } = await import('../lib/mailer.js');
    const orgId = req.session.orgId;

    await sendEmail({
      orgId,
      to,
      toName: to,
      subject: '✅ Test email from Mail Sender',
      htmlBody: `<h2>Test successful!</h2><p>Your Zepto integration is working correctly.</p><p>Sent at: ${new Date().toISOString()}</p>`,
    });

    res.json({ success: true, message: `Test email sent to ${to}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/settings/sys-status — get configuration status of system keys
router.get('/sys-status', (req, res) => {
  const s3Configured = !!(
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY &&
    process.env.AWS_REGION &&
    process.env.AWS_S3_BUCKET &&
    process.env.AWS_S3_PUBLIC_URL
  );
  const togetherConfigured = !!process.env.TOGETHER_API_KEY;
  const geminiConfigured = !!process.env.GEMINI_API_KEY;

  res.json({
    success: true,
    s3: s3Configured,
    together: togetherConfigured,
    gemini: geminiConfigured
  });
});

export default router;
