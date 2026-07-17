/**
 * /api/segments — Dynamic audience segments
 */
import { Router } from 'express';
import { Segment, Customer } from '../lib/models.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const orgId = req.session?.orgId;
    const segments = await Segment.find({ organization: orgId }).sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: segments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const segment = await Segment.findById(req.params.id).lean();
    if (!segment) return res.status(404).json({ error: 'Segment not found' });
    res.json({ success: true, data: segment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const orgId = req.session?.orgId;
    const segment = await Segment.create({ ...req.body, organization: orgId, createdBy: req.session?.userId });
    res.status(201).json({ success: true, data: segment });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const segment = await Segment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!segment) return res.status(404).json({ error: 'Segment not found' });
    res.json({ success: true, data: segment });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Segment.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/segments/:id/preview — count matching customers
router.post('/:id/preview', async (req, res) => {
  try {
    const segment = await Segment.findById(req.params.id);
    if (!segment) return res.status(404).json({ error: 'Segment not found' });

    const orgId = req.session?.orgId;
    const query = buildQuery(orgId, segment.conditions);
    const count = await Customer.countDocuments({ ...query, emailStatus: 'active', allowBroadcast: true });

    await segment.updateOne({ cachedCount: count, lastEvaluatedAt: new Date() });
    res.json({ success: true, count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/segments/:id/customers — full list of matching customers
router.get('/:id/customers', async (req, res) => {
  try {
    const segment = await Segment.findById(req.params.id);
    if (!segment) return res.status(404).json({ error: 'Segment not found' });

    const orgId = req.session?.orgId;
    const query = buildQuery(orgId, segment.conditions);
    const customers = await Customer.find(query)
      .select('name email phoneNo emailStatus allowBroadcast attributes tags')
      .limit(200)
      .lean();

    // Update cachedCount
    await segment.updateOne({ cachedCount: customers.length, lastEvaluatedAt: new Date() });

    res.json({ success: true, data: customers, count: customers.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function buildQuery(orgId, conditions = []) {
  const filter = { belongsTo: orgId };
  const attrConds = conditions.filter(c => c.field === 'attribute');
  const coreConds = conditions.filter(c => c.field !== 'attribute');

  for (const c of coreConds) {
    filter[c.field] = applyOp(c.operator, c.value);
  }

  if (attrConds.length) {
    filter.$and = attrConds.map(c => ({
      attributes: {
        $elemMatch: {
          k: c.attrKey,
          [`v_${c.valueType || 'str'}`]: applyOp(c.operator, c.value),
        },
      },
    }));
  }
  return filter;
}

function applyOp(op, val) {
  switch (op) {
    case 'eq':  return val;
    case 'neq': return { $ne:  val };
    case 'gt':  return { $gt:  val };
    case 'lt':  return { $lt:  val };
    case 'gte': return { $gte: val };
    case 'lte': return { $lte: val };
    case 'contains': return { $regex: val, $options: 'i' };
    default:    return val;
  }
}

export default router;
