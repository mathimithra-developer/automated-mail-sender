/**
 * /api/segments — Dynamic audience segments
 */
import { Router } from 'express';
import { Segment, Customer } from '../lib/models.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const orgId = req.session?.orgId;
    const { page = 1, limit = 10, search = '', status = '', all = 'false' } = req.query;

    const filter = { organization: orgId };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (status === 'active') {
      filter.cachedCount = { $gt: 0 };
    } else if (status === 'inactive') {
      filter.cachedCount = 0;
    }

    let queryBuilder = Segment.find(filter).sort({ createdAt: -1 });
    if (all !== 'true') {
      const skip = (Number(page) - 1) * Number(limit);
      queryBuilder = queryBuilder.skip(skip).limit(Number(limit));
    }

    const [segments, total] = await Promise.all([
      queryBuilder,
      Segment.countDocuments(filter)
    ]);

    // Dynamically evaluate and update counts on retrieval for the paginated subset
    for (const segment of segments) {
      // Use segment.organization (not session orgId) to evaluate count in its own org's customer pool
      const segOrgId = segment.organization?.toString();
      const query = buildQuery(segOrgId, segment.conditions, segment.conditionGroups, segment.groupsMatch || 'all');
      const count = await Customer.countDocuments(query);
      if (segment.cachedCount !== count) {
        segment.cachedCount = count;
        segment.lastEvaluatedAt = new Date();
        await segment.save();
      }
    }

    res.json({
      success: true,
      data: segments,
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/segments/preview & /api/segments/preview-count — count and get matching customers for unsaved segment settings with server-side pagination
router.post(['/preview', '/preview-count'], async (req, res) => {
  try {
    const orgId = req.session?.orgId;
    const {
      conditions,
      conditionGroups,
      groupsMatch = 'all',
      page = 1,
      limit = 25,
      search = '',
      status = ''
    } = req.body;

    const baseQuery = buildQuery(orgId, conditions, conditionGroups, groupsMatch);
    
    // Combine base segment conditions with search and status filters
    const filter = { ...baseQuery };
    if (search && search.trim()) {
      const searchRegex = { $regex: search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
      filter.$and = [
        ...(filter.$and || []),
        {
          $or: [
            { name: searchRegex },
            { email: searchRegex },
            { phoneNo: searchRegex }
          ]
        }
      ];
    }
    if (status) {
      filter.emailStatus = status;
    }

    const numPage = Math.max(1, Number(page));
    const numLimit = Math.max(1, Math.min(100, Number(limit)));
    const skip = (numPage - 1) * numLimit;

    const [customers, totalCount, activeCount] = await Promise.all([
      Customer.find(filter)
        .select('name email phoneNo emailStatus allowBroadcast attributes createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(numLimit)
        .lean(),
      Customer.countDocuments(filter),
      Customer.countDocuments({ ...baseQuery, emailStatus: 'active' })
    ]);

    const pages = Math.ceil(totalCount / numLimit) || 1;

    res.json({
      success: true,
      count: totalCount,
      activeCount,
      customers,
      data: customers,
      pagination: {
        total: totalCount,
        page: numPage,
        limit: numLimit,
        pages
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const orgId = req.session.orgId;
    const segment = await Segment.findOne({ _id: req.params.id, organization: orgId }).lean();
    if (!segment) return res.status(404).json({ error: 'Segment not found' });
    res.json({ success: true, data: segment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const orgId = req.session?.orgId;
    const { name, description, conditions, conditionGroups, groupsMatch = 'all' } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    // Check for duplicate segment name case-insensitively in the same org
    const escapedName = name.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const existing = await Segment.findOne({
      organization: orgId,
      name: { $regex: new RegExp(`^${escapedName}$`, 'i') }
    });
    if (existing) {
      return res.status(400).json({ error: 'A segment with this name already exists. Duplicate segment names are not allowed.' });
    }

    // Evaluate count immediately on creation
    const query = buildQuery(orgId, conditions, conditionGroups, groupsMatch);
    const count = await Customer.countDocuments(query);

    const segment = await Segment.create({
      name: name.trim(),
      description,
      groupsMatch,
      conditions,
      conditionGroups,
      organization: orgId,
      createdBy: req.session?.userId,
      cachedCount: count,
      lastEvaluatedAt: new Date()
    });

    res.status(201).json({ success: true, data: segment });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const orgId = req.session?.orgId;
    const { name, description, conditions, conditionGroups, groupsMatch = 'all' } = req.body;

    if (name) {
      // Check for duplicate segment name case-insensitively in the same org, excluding self
      const escapedName = name.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const existing = await Segment.findOne({
        organization: orgId,
        _id: { $ne: req.params.id },
        name: { $regex: new RegExp(`^${escapedName}$`, 'i') }
      });
      if (existing) {
        return res.status(400).json({ error: 'A segment with this name already exists. Duplicate segment names are not allowed.' });
      }
    }

    // Evaluate count immediately on update
    const query = buildQuery(orgId, conditions, conditionGroups, groupsMatch);
    const count = await Customer.countDocuments(query);

    const segment = await Segment.findOneAndUpdate(
      { _id: req.params.id, organization: orgId },
      {
        name: name ? name.trim() : undefined,
        description,
        groupsMatch,
        conditions,
        conditionGroups,
        cachedCount: count,
        lastEvaluatedAt: new Date()
      },
      { new: true }
    );

    if (!segment) return res.status(404).json({ error: 'Segment not found' });
    res.json({ success: true, data: segment });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const orgId = req.session.orgId;
    const deleted = await Segment.findOneAndDelete({ _id: req.params.id, organization: orgId });
    if (!deleted) return res.status(404).json({ error: 'Segment not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/segments/:id/preview — count matching customers
router.post('/:id/preview', async (req, res) => {
  try {
    const orgId = req.session.orgId;
    const segment = await Segment.findOne({ _id: req.params.id, organization: orgId });
    if (!segment) return res.status(404).json({ error: 'Segment not found' });

    const query = buildQuery(orgId, segment.conditions, segment.conditionGroups, segment.groupsMatch || 'all');
    const count = await Customer.countDocuments(query);

    await segment.updateOne({ cachedCount: count, lastEvaluatedAt: new Date() });
    res.json({ success: true, count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/segments/:id/customers — paginated list of matching segment customers
router.get('/:id/customers', async (req, res) => {
  try {
    const orgId = req.session.orgId;
    const {
      page = 1,
      limit = 25,
      search = '',
      status = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const segment = await Segment.findOne({ _id: req.params.id, organization: orgId });
    if (!segment) return res.status(404).json({ error: 'Segment not found' });

    const segOrgId = segment.organization?.toString() || orgId;
    const baseQuery = buildQuery(segOrgId, segment.conditions, segment.conditionGroups, segment.groupsMatch || 'all');

    const filter = { ...baseQuery };
    if (search && search.trim()) {
      const searchRegex = { $regex: search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
      filter.$and = [
        ...(filter.$and || []),
        {
          $or: [
            { name: searchRegex },
            { email: searchRegex },
            { phoneNo: searchRegex }
          ]
        }
      ];
    }
    if (status) {
      filter.emailStatus = status;
    }

    const numPage = Math.max(1, Number(page));
    const numLimit = Math.max(1, Math.min(100, Number(limit)));
    const skip = (numPage - 1) * numLimit;

    const sortObj = {};
    sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [customers, filteredCount, totalSegmentCount, activeCount] = await Promise.all([
      Customer.find(filter)
        .select('name email phoneNo emailStatus allowBroadcast attributes createdAt')
        .sort(sortObj)
        .skip(skip)
        .limit(numLimit)
        .lean(),
      Customer.countDocuments(filter),
      Customer.countDocuments(baseQuery),
      Customer.countDocuments({ ...baseQuery, emailStatus: 'active' })
    ]);

    // Update segment cached count if total changed
    if (segment.cachedCount !== totalSegmentCount) {
      segment.cachedCount = totalSegmentCount;
      segment.lastEvaluatedAt = new Date();
      await segment.save();
    }

    const pages = Math.ceil(filteredCount / numLimit) || 1;

    res.json({
      success: true,
      data: customers,
      count: filteredCount,
      pagination: {
        total: filteredCount,
        page: numPage,
        limit: numLimit,
        pages
      },
      summary: {
        total: totalSegmentCount,
        activeCount,
        lastEvaluatedAt: segment.lastEvaluatedAt
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/segments/:id/export — export full customer list for segment as CSV
router.get('/:id/export', async (req, res) => {
  try {
    const orgId = req.session.orgId;
    const segment = await Segment.findOne({ _id: req.params.id, organization: orgId });
    if (!segment) return res.status(404).json({ error: 'Segment not found' });

    const segOrgId = segment.organization?.toString() || orgId;
    const baseQuery = buildQuery(segOrgId, segment.conditions, segment.conditionGroups, segment.groupsMatch || 'all');

    const customers = await Customer.find(baseQuery)
      .select('name email phoneNo emailStatus allowBroadcast attributes createdAt')
      .sort({ createdAt: -1 })
      .lean();

    const formatWhatsAppPhone = (phone) => {
      if (!phone) return '';
      let cleaned = String(phone).replace(/\D/g, '').replace(/^0+/, '');
      if (cleaned.length === 10) {
        cleaned = '91' + cleaned;
      }
      return cleaned;
    };

    const headers = ['Name', 'Phone', 'Email', 'allowBroadcast', 'Email Status', 'Created At'];
    const rows = customers.map(c => [
      `"${(c.name || '').replace(/"/g, '""')}"`,
      `"${formatWhatsAppPhone(c.phoneNo)}"`,
      `"${(c.email || '').replace(/"/g, '""')}"`,
      `"true"`,
      `"${(c.emailStatus || 'active').replace(/"/g, '""')}"`,
      `"${c.createdAt ? new Date(c.createdAt).toISOString() : ''}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    const filename = `segment-${segment.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}-export.csv`;
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.status(200).send(csvContent);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


function buildQuery(orgId, conditions = [], conditionGroups = [], groupsMatch = 'all') {
  const filter = { belongsTo: orgId };

  if (conditionGroups && conditionGroups.length > 0) {
    const groupFilters = [];
    for (const group of conditionGroups) {
      const condFilters = [];
      for (const c of group.conditions || []) {
        let condFilter = {};
        const systemCoreFields = ['name', 'email', 'phoneNo', 'leadSource', 'inboxStatus', 'emailStatus', 'allowBroadcast'];
        const isAttribute = c.field === 'attribute' || !systemCoreFields.includes(c.field);
        const attrKey = c.field === 'attribute' ? c.attrKey : c.field;

        if (isAttribute) {
          const valType = c.valueType || (attrKey === 'lead_score' || typeof c.value === 'number' ? 'num' : 'str');
          const valField = `v_${valType}`;
          const escKey = (attrKey || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          condFilter = {
            attributes: {
              $elemMatch: {
                k: { $regex: new RegExp(`^${escKey}$`, 'i') },
                [valField]: applyOp(c.operator, c.value),
              },
            },
          };
        } else {
          condFilter[c.field] = applyOp(c.operator, c.value);
        }
        condFilters.push(condFilter);
      }

      if (condFilters.length > 0) {
        if (group.matchType === 'any') {
          groupFilters.push({ $or: condFilters });
        } else {
          groupFilters.push({ $and: condFilters });
        }
      }
    }

    if (groupFilters.length > 0) {
      if (groupsMatch === 'any') {
        filter.$or = groupFilters;
      } else {
        filter.$and = groupFilters;
      }
    }
    return filter;
  }

  // Fallback to legacy flat conditions
  const systemCoreFields = ['name', 'email', 'phoneNo', 'leadSource', 'inboxStatus', 'emailStatus', 'allowBroadcast'];
  const attrConds = (conditions || []).filter(c => c.field === 'attribute' || !systemCoreFields.includes(c.field));
  const coreConds = (conditions || []).filter(c => c.field !== 'attribute' && systemCoreFields.includes(c.field));

  for (const c of coreConds) {
    filter[c.field] = applyOp(c.operator, c.value);
  }

  if (attrConds.length) {
    filter.$and = attrConds.map(c => {
      const key = c.field === 'attribute' ? c.attrKey : c.field;
      const valType = c.valueType || (key === 'lead_score' || typeof c.value === 'number' ? 'num' : 'str');
      const escKey = (key || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return {
        attributes: {
          $elemMatch: {
            k: { $regex: new RegExp(`^${escKey}$`, 'i') },
            [`v_${valType}`]: applyOp(c.operator, c.value),
          },
        },
      };
    });
  }
  return filter;
}

function applyOp(op, val) {
  const esc = string => (typeof string === 'string' ? string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') : string);
  switch (op) {
    case 'eq':
    case 'is':
      return typeof val === 'string' ? { $regex: `^${esc(val)}$`, $options: 'i' } : val;
    case 'neq':
    case 'is not':
    case 'is_not':
      return typeof val === 'string' ? { $not: new RegExp(`^${esc(val)}$`, 'i') } : { $ne: val };
    case 'gt':
    case 'greater than':
    case 'after':
      return { $gt: val };
    case 'lt':
    case 'less than':
    case 'before':
      return { $lt: val };
    case 'gte':
    case 'greater than or equal to':
    case 'on or after':
      return { $gte: val };
    case 'lte':
    case 'less than or equal to':
    case 'on or before':
      return { $lte: val };
    case 'contains':
    case 'contain':
      return { $regex: esc(val), $options: 'i' };
    case 'does not contain':
    case 'not_contains':
      return { $not: new RegExp(esc(val), 'i') };
    case 'starts with':
    case 'starts_with':
      return { $regex: `^${esc(val)}`, $options: 'i' };
    case 'ends with':
    case 'ends_with':
      return { $regex: `${esc(val)}$`, $options: 'i' };
    case 'does not start with':
    case 'not_starts_with':
      return { $not: new RegExp(`^${esc(val)}`, 'i') };
    case 'does not end with':
    case 'not_ends_with':
      return { $not: new RegExp(`${esc(val)}$`, 'i') };
    case 'matches pattern':
    case 'matches_pattern':
      return { $regex: val, $options: 'i' };
    case 'does not match pattern':
    case 'not_matches_pattern':
      return { $not: new RegExp(val, 'i') };
    case 'is empty':
    case 'is_empty':
      return { $in: [null, ''] };
    case 'is not empty':
    case 'is_not_empty':
      return { $nin: [null, ''] };
    default:
      return typeof val === 'string' ? { $regex: `^${esc(val)}$`, $options: 'i' } : val;
  }
}

export default router;

