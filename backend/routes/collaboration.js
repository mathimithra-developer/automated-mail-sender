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
    const orgId = req.session.orgId;
    const userId = req.session.userId;  // always from session (bypass-id bug fixed)
    const { text, sectionId } = req.body;
    if (!text) return res.status(400).json({ error: 'Comment text required' });

    // Verify the template belongs to this org before allowing a comment
    const template = await EmailTemplate.findOne({ _id: req.params.id, organization: orgId });
    if (!template) return res.status(404).json({ error: 'Template not found' });

    const comment = await Comment.create({
      template: req.params.id,
      organization: orgId,
      author: userId,
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
    const orgId = req.session.orgId;
    const comment = await Comment.findOneAndUpdate(
      { _id: req.params.cid, organization: orgId },
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
    const orgId = req.session.orgId;
    const { text } = req.body;
    const comment = await Comment.findOneAndUpdate(
      { _id: req.params.cid, organization: orgId },
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
    const orgId = req.session.orgId;
    const deleted = await Comment.findOneAndDelete({ _id: req.params.cid, organization: orgId });
    if (!deleted) return res.status(404).json({ error: 'Comment not found' });
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
    const orgId = req.session.orgId;
    const { label } = req.body;

    // Verify template belongs to this org
    const template = await EmailTemplate.findOne({ _id: req.params.id, organization: orgId });
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
    const orgId = req.session.orgId;

    // Both the version and the target template must belong to this org
    const version = await VersionHistory.findOne({ _id: req.params.vid, organization: orgId });
    if (!version) return res.status(404).json({ error: 'Version not found' });

    // Auto-save current state before restoring
    const current = await EmailTemplate.findOne({ _id: req.params.id, organization: orgId });
    if (!current) return res.status(404).json({ error: 'Template not found' });

    await VersionHistory.create({
      template:    req.params.id,
      organization: orgId,
      label:       'Before restore',
      snapshot:    current.jsonData,
      htmlSnapshot:current.htmlContent,
      createdBy:   req.session?.userId,
    });

    // Restore
    await EmailTemplate.findOneAndUpdate(
      { _id: req.params.id, organization: orgId },
      {
        jsonData:    version.snapshot,
        htmlContent: version.htmlSnapshot,
        lastUpdatedBy: req.session?.userId,
      }
    );

    res.json({ success: true, message: 'Version restored', version });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/templates/:id/versions/:vid
router.delete('/versions/:vid', async (req, res) => {
  try {
    const orgId = req.session.orgId;
    const deleted = await VersionHistory.findOneAndDelete({ _id: req.params.vid, organization: orgId });
    if (!deleted) return res.status(404).json({ error: 'Version not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
