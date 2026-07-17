/**
 * /api/customers — full CRUD + attribute querying
 */
import { Router } from 'express';
import { Customer, Tag } from '../lib/models.js';

const router = Router();

// ── GET /api/customers — list with filters ────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const orgId = req.session?.orgId || 'bypass-org';
    const {
      page = 1, limit = 25, search = '',
      inboxStatus, allowBroadcast, emailStatus,
      tagId, attrKey, attrVal, attrOp = 'eq',
      sortBy = 'createdAt', sortDir = -1,
    } = req.query;

    const filter = {};

    // Only filter by org if not bypass
    if (req.query.bypass !== 'true' && orgId !== 'bypass-org') {
      filter.belongsTo = orgId;
    }

    if (search) {
      filter.$or = [
        { name:    { $regex: search, $options: 'i' } },
        { email:   { $regex: search, $options: 'i' } },
        { phoneNo: { $regex: search, $options: 'i' } },
      ];
    }

    if (inboxStatus)    filter.inboxStatus    = inboxStatus;
    if (emailStatus)    filter.emailStatus    = emailStatus;
    if (allowBroadcast) filter.allowBroadcast = allowBroadcast === 'true';
    if (tagId)          filter.tags           = tagId;

    // Attribute filter — e.g. ?attrKey=city&attrVal=Mumbai&attrOp=eq
    if (attrKey && attrVal) {
      const attrFilter = { 'attributes.k': attrKey };
      const numVal = Number(attrVal);
      const isNum  = !isNaN(numVal);

      const valField = isNum ? 'attributes.v_num' : 'attributes.v_str';

      switch (attrOp) {
        case 'eq':       attrFilter[valField] = isNum ? numVal : attrVal; break;
        case 'neq':      attrFilter[valField] = { $ne:  isNum ? numVal : attrVal }; break;
        case 'gt':       attrFilter[valField] = { $gt:  isNum ? numVal : attrVal }; break;
        case 'lt':       attrFilter[valField] = { $lt:  isNum ? numVal : attrVal }; break;
        case 'gte':      attrFilter[valField] = { $gte: isNum ? numVal : attrVal }; break;
        case 'lte':      attrFilter[valField] = { $lte: isNum ? numVal : attrVal }; break;
        case 'contains': attrFilter[valField] = { $regex: attrVal, $options: 'i' }; break;
        default:         attrFilter[valField] = attrVal;
      }

      filter.$and = [{ attributes: { $elemMatch: attrFilter } }];
    }

    const skip  = (Number(page) - 1) * Number(limit);
    const sort  = { [sortBy]: Number(sortDir) };

    const [customers, total] = await Promise.all([
      Customer.find(filter)
        .populate('tags', 'name color')
        .populate('contactOwner', 'name email')
        .sort(sort)
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Customer.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: customers,
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('GET /customers error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/customers/:id ─────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id)
      .populate('tags', 'name color')
      .populate('contactOwner', 'name email')
      .populate('responsive', 'name email')
      .lean();

    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    res.json({ success: true, data: customer });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/customers ────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const orgId = req.session?.orgId || req.body.orgId;
    const { name, phoneNo, email, attributes = [], ...rest } = req.body;

    const customer = await Customer.create({
      name,
      phoneNo,
      email,
      belongsTo:    orgId,
      attributes,
      createdBy:    req.session?.userId,
      lastUpdatedBy:req.session?.userId,
      ...rest,
    });

    res.status(201).json({ success: true, data: customer });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ error: 'Duplicate entry' });
    res.status(400).json({ error: err.message });
  }
});

// ── PATCH /api/customers/:id ───────────────────────────────────────────────
router.patch('/:id', async (req, res) => {
  try {
    const { attributes, ...coreFields } = req.body;

    const update = { ...coreFields, lastUpdatedBy: req.session?.userId };
    if (attributes) update.attributes = attributes;  // full replace of attributes array

    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true, runValidators: true }
    ).populate('tags', 'name color');

    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    res.json({ success: true, data: customer });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ── PATCH /api/customers/:id/attr — upsert a single attribute ─────────────
router.patch('/:id/attr', async (req, res) => {
  try {
    const { k, v_str, v_num, v_date } = req.body;
    if (!k) return res.status(400).json({ error: 'Attribute key (k) is required' });

    // Remove existing entry for this key then push new one
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      {
        $pull: { attributes: { k } },
        $set:  { lastUpdatedBy: req.session?.userId },
      },
      { new: false }
    );

    if (!customer) return res.status(404).json({ error: 'Customer not found' });

    const newAttr = { k };
    if (v_str  !== undefined) newAttr.v_str  = v_str;
    if (v_num  !== undefined) newAttr.v_num  = v_num;
    if (v_date !== undefined) newAttr.v_date = new Date(v_date);

    const updated = await Customer.findByIdAndUpdate(
      req.params.id,
      { $push: { attributes: newAttr } },
      { new: true }
    );

    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ── DELETE /api/customers/:id ──────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    await Customer.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/customers/import — bulk CSV import ───────────────────────────
router.post('/import', async (req, res) => {
  try {
    const orgId = req.session?.orgId || req.body.orgId;
    const { rows = [] } = req.body;  // array of { name, phoneNo, email, [attr keys...] }

    const knownKeys = ['name', 'phoneNo', 'email', 'leadSource', 'allowBroadcast', 'followUp'];

    const docs = rows.map(row => {
      const { name, phoneNo, email, leadSource, allowBroadcast, followUp, ...rest } = row;
      const attributes = Object.entries(rest).map(([k, v]) => {
        const num = Number(v);
        if (!isNaN(num) && v !== '') return { k, v_num: num };
        if (v && !isNaN(Date.parse(v))) return { k, v_date: new Date(v) };
        return { k, v_str: String(v) };
      });

      return { name, phoneNo, email, leadSource, allowBroadcast, followUp, belongsTo: orgId, attributes };
    });

    const result = await Customer.insertMany(docs, { ordered: false });
    res.json({ success: true, inserted: result.length });
  } catch (err) {
    res.status(400).json({ error: err.message, inserted: err.result?.nInserted || 0 });
  }
});

export default router;
