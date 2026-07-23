/**
 * /api/templates — Email Template CRUD
 */
import { Router } from 'express';
import { EmailTemplate } from '../lib/models.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const orgId = req.session?.orgId;
    const { category, page = 1, limit = 20, all = 'false' } = req.query;
    const filter = { organization: orgId };
    if (category) filter.category = category;

    let queryBuilder = EmailTemplate.find(filter)
      .select('-htmlContent -jsonData')   // list view — skip heavy fields
      .sort({ updatedAt: -1 });

    if (all !== 'true') {
      queryBuilder = queryBuilder.skip((Number(page) - 1) * Number(limit)).limit(Number(limit));
    }

    const [templates, total] = await Promise.all([
      queryBuilder.lean(),
      EmailTemplate.countDocuments(filter),
    ]);

    res.json({ success: true, data: templates, pagination: { total } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const orgId = req.session.orgId;
    const template = await EmailTemplate.findOne({ _id: req.params.id, organization: orgId }).lean();
    if (!template) return res.status(404).json({ error: 'Template not found' });
    res.json({ success: true, data: template });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const orgId = req.session?.orgId;
    const template = await EmailTemplate.create({
      ...req.body,
      organization: orgId,
      createdBy:    req.session?.userId,
    });
    res.status(201).json({ success: true, data: template });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const orgId = req.session.orgId;
    const template = await EmailTemplate.findOneAndUpdate(
      { _id: req.params.id, organization: orgId },
      { ...req.body, lastUpdatedBy: req.session?.userId },
      { new: true, runValidators: true }
    );
    if (!template) return res.status(404).json({ error: 'Template not found' });
    res.json({ success: true, data: template });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const orgId = req.session.orgId;
    const deleted = await EmailTemplate.findOneAndDelete({ _id: req.params.id, organization: orgId });
    if (!deleted) return res.status(404).json({ error: 'Template not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
