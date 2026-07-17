/**
 * /api/templates — Email Template CRUD
 */
import { Router } from 'express';
import { EmailTemplate } from '../lib/models.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const orgId = req.session?.orgId;
    const { category, page = 1, limit = 20 } = req.query;
    const filter = { organization: orgId };
    if (category) filter.category = category;

    const [templates, total] = await Promise.all([
      EmailTemplate.find(filter)
        .select('-htmlContent -jsonData')   // list view — skip heavy fields
        .sort({ updatedAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .lean(),
      EmailTemplate.countDocuments(filter),
    ]);

    res.json({ success: true, data: templates, pagination: { total } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const template = await EmailTemplate.findById(req.params.id).lean();
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
    const template = await EmailTemplate.findByIdAndUpdate(
      req.params.id,
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
    await EmailTemplate.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
