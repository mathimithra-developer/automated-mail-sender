/**
 * /api/customers — full CRUD + attribute querying
 */
import { Router } from 'express';
import multer from 'multer';
import { Customer, Tag } from '../lib/models.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

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
    const orgId = req.session.orgId;
    const { name, phoneNo, email, attributes = [], ...rest } = req.body;

    const customer = await Customer.create({
      name: name || 'Unknown Customer',
      phoneNo: phoneNo || '',
      email: email || '',
      belongsTo: orgId,
      attributes,
      createdBy: req.session?.userId,
      lastUpdatedBy: req.session?.userId,
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
    if (attributes) update.attributes = attributes;

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

// Helper: Parse CSV text content into JS objects handling quotes & mismatches
function parseCsvBuffer(bufferText) {
  const lines = bufferText.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];

  const splitRow = (lineStr) => {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < lineStr.length; i++) {
      const char = lineStr[i];
      if (char === '"' || char === "'") {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim().replace(/^["']|["']$/g, ''));
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim().replace(/^["']|["']$/g, ''));
    return result;
  };

  const headers = splitRow(lines[0]);
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const values = splitRow(lines[i]);
    const obj = {};
    headers.forEach((h, idx) => {
      if (h) obj[h] = values[idx] !== undefined ? values[idx] : '';
    });
    rows.push(obj);
  }

  return rows;
}

// ── POST /api/customers/import — bulk CSV import ───────────────────────────────────────────
router.post('/import', upload.single('file'), async (req, res) => {
  try {
    const orgId = req.session.orgId;
    let rawRows = [];

    if (req.file) {
      const bufferText = req.file.buffer.toString('utf-8');
      rawRows = parseCsvBuffer(bufferText);
    } else if (Array.isArray(req.body.rows)) {
      rawRows = req.body.rows;
    } else if (req.body.csvData) {
      rawRows = parseCsvBuffer(String(req.body.csvData));
    }

    if (rawRows.length === 0) {
      return res.status(400).json({ error: 'No customer data found in CSV file.' });
    }

    const docs = rawRows.map((row, rowIdx) => {
      const normalizedRow = {};
      for (const [key, value] of Object.entries(row)) {
        if (key && value !== undefined && value !== null) {
          const normKey = String(key).trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
          normalizedRow[normKey] = String(value).trim();
        }
      }

      // Name extraction
      const rawName = normalizedRow.name || normalizedRow.fullname || normalizedRow.full_name || normalizedRow.contactname || normalizedRow.customername || normalizedRow.displayname || normalizedRow.first_name || '';
      const fallbackName = Object.values(row).find((v) => v && typeof v === 'string' && /[a-zA-Z]/.test(v)) || `Customer #${rowIdx + 1}`;
      const name = rawName ? rawName : String(fallbackName).trim();

      // Phone extraction
      const rawPhone = normalizedRow.phoneno || normalizedRow.phone || normalizedRow.phone_number || normalizedRow.mobile || normalizedRow.tel || normalizedRow.telephone || normalizedRow.customerphone || normalizedRow.whatsapp || '';
      const phoneNo = rawPhone ? rawPhone : '';

      // Email extraction
      const rawEmail = normalizedRow.email || normalizedRow.emailaddress || normalizedRow.email_address || normalizedRow.customeremail || normalizedRow.mail || '';
      const email = rawEmail ? rawEmail.toLowerCase() : '';

      // Lead Source
      const leadSource = normalizedRow.leadsource || normalizedRow.lead_source || normalizedRow.source || normalizedRow.channel || '';

      // Broadcast & Status
      const rawBroadcast = normalizedRow.allowbroadcast || normalizedRow.broadcast || '';
      const allowBroadcast = !['false', 'no', '0', 'n'].includes(rawBroadcast.toLowerCase());

      const emailStatusVal = (normalizedRow.emailstatus || normalizedRow.email_status || normalizedRow.status || 'active').toLowerCase();
      const emailStatus = ['active', 'unsubscribed', 'bounced', 'complained'].includes(emailStatusVal) ? emailStatusVal : 'active';

      // Map Custom Attributes (including city, plan, lead_score, company, industry aliases)
      const mappedKeys = ['name', 'fullname', 'full_name', 'contactname', 'customername', 'displayname', 'first_name', 'phoneno', 'phone', 'phone_number', 'mobile', 'tel', 'telephone', 'customerphone', 'whatsapp', 'email', 'emailaddress', 'email_address', 'customeremail', 'mail', 'leadsource', 'lead_source', 'source', 'channel', 'allowbroadcast', 'broadcast', 'emailstatus', 'email_status', 'status'];

      const attributes = [];

      for (const [origKey, val] of Object.entries(row)) {
        if (!val || String(val).trim() === '') continue;
        const normKey = String(origKey).trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
        if (mappedKeys.includes(normKey)) continue;

        const cleanVal = String(val).trim();
        let targetKey = origKey.trim();

        // Standardize column key aliases for table columns
        if (['city', 'customer_city', 'location', 'town'].includes(normKey)) targetKey = 'city';
        else if (['plan', 'user_plan', 'subscription'].includes(normKey)) targetKey = 'plan';
        else if (['lead_score', 'leadscore', 'score'].includes(normKey)) targetKey = 'lead_score';
        else if (['company', 'company_name', 'organization', 'organisation'].includes(normKey)) targetKey = 'company';
        else if (['industry', 'domain', 'category'].includes(normKey)) targetKey = 'industry';

        const num = Number(cleanVal);
        if (!isNaN(num) && cleanVal !== '') {
          attributes.push({ k: targetKey, v_num: num });
        } else {
          attributes.push({ k: targetKey, v_str: cleanVal });
        }
      }

      return {
        name,
        phoneNo,
        email,
        leadSource,
        allowBroadcast,
        emailStatus,
        inboxStatus: 'closed',
        belongsTo: orgId,
        attributes,
      };
    });

    let insertedDocs = [];
    try {
      insertedDocs = await Customer.insertMany(docs, { ordered: false });
    } catch (insertErr) {
      insertedDocs = insertErr.insertedDocs || insertErr.result?.insertedDocs || docs;
    }

    res.json({ success: true, count: docs.length, inserted: insertedDocs.length, data: docs });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
