/** /api/templates/:id/comments & /api/templates/:id/versions */
import { Router } from 'express';
import { Comment, VersionHistory, EmailTemplate } from '../lib/models.js';

const router = Router({ mergeParams: true });

// ── COMMENTS ─────────────────────────────────────────────────────────────────

// GET /api/templates/:id/comments
router.get('/comments', async (req, res) => {
  try {
    const comments = await Comment.find({ template: req.params.id })
      .populate('author', 'name email')
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, data: comments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/templates/:id/comments
router.post('/comments', async (req, res) => {
  try {
    const orgId = req.session?.orgId;
    const userId = req.session?.userId || 'bypass-id';
    const { text, sectionId } = req.body;
    if (!text) return res.status(400).json({ error: 'Comment text required' });

    const comment = await Comment.create({
      template: req.params.id,
      organization: orgId,
      author: userId === 'bypass-id' ? undefined : userId,
      text, sectionId,
    });

    res.status(201).json({ success: true, data: comment });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PATCH /api/templates/:id/comments/:cid/resolve
router.patch('/comments/:cid/resolve', async (req, res) => {
  try {
    const comment = await Comment.findByIdAndUpdate(
      req.params.cid,
      { resolved: true, resolvedBy: req.session?.userId },
      { new: true }
    );
    if (!comment) return res.status(404).json({ error: 'Comment not found' });
    res.json({ success: true, data: comment });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/templates/:id/comments/:cid/reply
router.post('/comments/:cid/reply', async (req, res) => {
  try {
    const { text } = req.body;
    const comment = await Comment.findByIdAndUpdate(
      req.params.cid,
      { $push: { replies: { author: req.session?.userId, text, createdAt: new Date() } } },
      { new: true }
    );
    if (!comment) return res.status(404).json({ error: 'Comment not found' });
    res.json({ success: true, data: comment });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/templates/:id/comments/:cid
router.delete('/comments/:cid', async (req, res) => {
  try {
    await Comment.findByIdAndDelete(req.params.cid);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── VERSION HISTORY ───────────────────────────────────────────────────────────

// GET /api/templates/:id/versions
router.get('/versions', async (req, res) => {
  try {
    const versions = await VersionHistory.find({ template: req.params.id })
      .select('-snapshot -htmlSnapshot')   // don't send heavy fields in list
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    res.json({ success: true, data: versions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/templates/:id/versions — save a named snapshot
router.post('/versions', async (req, res) => {
  try {
    const orgId  = req.session?.orgId;
    const { label } = req.body;

    const template = await EmailTemplate.findById(req.params.id);
    if (!template) return res.status(404).json({ error: 'Template not found' });

    const version = await VersionHistory.create({
      template:    req.params.id,
      organization: orgId,
      label:       label || `Saved ${new Date().toLocaleString()}`,
      snapshot:    template.jsonData,
      htmlSnapshot:template.htmlContent,
      createdBy:   req.session?.userId,
    });

    res.status(201).json({ success: true, data: version });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/templates/:id/versions/:vid/restore — restore snapshot
router.post('/versions/:vid/restore', async (req, res) => {
  try {
    const version = await VersionHistory.findById(req.params.vid);
    if (!version) return res.status(404).json({ error: 'Version not found' });

    // Auto-save current before restoring
    const current = await EmailTemplate.findById(req.params.id);
    if (current) {
      await VersionHistory.create({
        template:    req.params.id,
        organization: req.session?.orgId,
        label:       'Before restore',
        snapshot:    current.jsonData,
        htmlSnapshot:current.htmlContent,
        createdBy:   req.session?.userId,
      });
    }

    // Restore
    await EmailTemplate.findByIdAndUpdate(req.params.id, {
      jsonData:    version.snapshot,
      htmlContent: version.htmlSnapshot,
      lastUpdatedBy: req.session?.userId,
    });

    res.json({ success: true, message: 'Version restored', version });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/templates/:id/versions/:vid
router.delete('/versions/:vid', async (req, res) => {
  try {
    await VersionHistory.findByIdAndDelete(req.params.vid);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
