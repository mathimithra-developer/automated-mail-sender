/**
 * /api/customers — full CRUD + attribute querying
 */
import { Router } from 'express';
import { Customer, Tag } from '../lib/models.js';

const router = Router();

// ── GET /api/customers — list with filters ────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const orgId = req.session.orgId;
    const {
      page = 1, limit = 25, search = '',
      inboxStatus, allowBroadcast, emailStatus,
      tagId, attrKey, attrVal, attrOp = 'eq',
      sortBy = 'createdAt', sortDir = -1,
    } = req.query;

    const filter = { belongsTo: orgId };

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
      const textFields = ['city', 'plan', 'industry', 'name', 'email', 'company'];
      const isTextField = textFields.includes(attrKey);
      const isGtLt = (attrOp === 'gt' || attrOp === 'lt' || attrOp === 'gte' || attrOp === 'lte');
      const numVal = Number(attrVal);
      const isNum  = !isNaN(numVal);

      if ((isTextField && isGtLt) || (isGtLt && !isNum)) {
        // Force query to match nothing
        filter._id = null;
      } else {
        const attrFilter = { k: attrKey };
        const valField = isNum ? 'v_num' : 'v_str';

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

// ── GET /api/customers/:id ────────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const orgId = req.session.orgId;
    const customer = await Customer.findOne({ _id: req.params.id, belongsTo: orgId })
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

// ── POST /api/customers ────────────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const orgId = req.session.orgId;  // always from session — never from body
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

// ── PATCH /api/customers/:id ───────────────────────────────────────────────────────────────
router.patch('/:id', async (req, res) => {
  try {
    const orgId = req.session.orgId;
    const { attributes, ...coreFields } = req.body;

    const update = { ...coreFields, lastUpdatedBy: req.session?.userId };
    if (attributes) update.attributes = attributes;  // full replace of attributes array

    const customer = await Customer.findOneAndUpdate(
      { _id: req.params.id, belongsTo: orgId },
      update,
      { new: true, runValidators: true }
    ).populate('tags', 'name color');

    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    res.json({ success: true, data: customer });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ── PATCH /api/customers/:id/attr — upsert a single attribute ─────────────────────────────
router.patch('/:id/attr', async (req, res) => {
  try {
    const orgId = req.session.orgId;
    const { k, v_str, v_num, v_date } = req.body;
    if (!k) return res.status(400).json({ error: 'Attribute key (k) is required' });

    // Remove existing entry for this key then push new one
    const customer = await Customer.findOneAndUpdate(
      { _id: req.params.id, belongsTo: orgId },
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

    const updated = await Customer.findOneAndUpdate(
      { _id: req.params.id, belongsTo: orgId },
      { $push: { attributes: newAttr } },
      { new: true }
    );

    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ── DELETE /api/customers/:id ──────────────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const orgId = req.session.orgId;
    const customer = await Customer.findOneAndDelete({ _id: req.params.id, belongsTo: orgId });
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/customers/import — bulk CSV import ───────────────────────────────────────────
router.post('/import', async (req, res) => {
  try {
    const orgId = req.session.orgId;  // always from session — never from body
    const { rows = [] } = req.body;

    const docs = rows.map(row => {
      // Normalize keys to lowercase to handle alternate column spellings and casings
      const normalizedRow = {};
      for (const [key, value] of Object.entries(row)) {
        if (key && value !== undefined && value !== null) {
          const normKey = key.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
          normalizedRow[normKey] = value;
        }
      }

      // Map standard schema fields with fallbacks
      const rawName = normalizedRow.name || normalizedRow.fullname || normalizedRow.contactname || normalizedRow.customername || 'Unknown';
      const name = String(rawName).trim() || 'Unknown';

      const rawPhone = normalizedRow.phoneno || normalizedRow.phone || normalizedRow.mobile || normalizedRow.tel || normalizedRow.telephone || normalizedRow.customerphone;
      const phoneNo = (rawPhone && String(rawPhone).trim()) ? String(rawPhone).trim() : '0000000000';

      const email = String(normalizedRow.email || normalizedRow.emailaddress || normalizedRow.customeremail || '').trim().toLowerCase();

      const leadSource = String(normalizedRow.leadsource || normalizedRow.source || '').trim();
      
      const rawBroadcast = normalizedRow.allowbroadcast || normalizedRow.broadcast || '';
      const allowBroadcast = ['true', 'yes', '1', 'y'].includes(String(rawBroadcast).trim().toLowerCase());

      const emailStatusVal = String(normalizedRow.emailstatus || normalizedRow.status || 'active').trim().toLowerCase();
      const emailStatus = ['active', 'unsubscribed', 'bounced', 'complained'].includes(emailStatusVal) ? emailStatusVal : 'active';

      const inboxStatusVal = String(normalizedRow.inboxstatus || 'closed').trim().toLowerCase();
      const inboxStatus = ['open', 'closed', 'in progress'].includes(inboxStatusVal) ? inboxStatusVal : 'closed';

      // Anything else goes into attributes, except helper keys we mapped
      const mappedKeys = ['name', 'fullname', 'contactname', 'customername', 'phoneno', 'phone', 'mobile', 'tel', 'telephone', 'customerphone', 'email', 'emailaddress', 'customeremail', 'leadsource', 'source', 'allowbroadcast', 'broadcast', 'emailstatus', 'status', 'inboxstatus'];
      
      const attributes = [];
      for (const [key, val] of Object.entries(row)) {
        const normKey = key.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
        if (mappedKeys.includes(normKey)) continue;

        const cleanVal = String(val).trim();
        if (cleanVal === '') continue;

        // Try number conversion
        const num = Number(cleanVal);
        if (!isNaN(num)) {
          attributes.push({ k: key.trim(), v_num: num });
        } else if (!isNaN(Date.parse(cleanVal)) && (cleanVal.includes('-') || cleanVal.includes('/'))) {
          attributes.push({ k: key.trim(), v_date: new Date(cleanVal) });
        } else {
          attributes.push({ k: key.trim(), v_str: cleanVal });
        }
      }

      return {
        name,
        phoneNo,
        email,
        leadSource,
        allowBroadcast,
        emailStatus,
        inboxStatus,
        belongsTo: orgId,
        attributes
      };
    });

    const result = await Customer.insertMany(docs, { ordered: false });
    res.json({ success: true, inserted: result.length });
  } catch (err) {
    res.status(400).json({ error: err.message, inserted: err.result?.nInserted || 0 });
  }
});

export default router;
