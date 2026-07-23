/**
 * /api/campaigns — Create, send, and track campaigns via Zepto
 */
import { Router } from 'express';
import { Campaign, Customer, EmailTemplate, SendLog, Segment } from '../lib/models.js';
import { sendCampaignBatch } from '../lib/mailer.js';

const router = Router();

// ── GET /api/campaigns ─────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const orgId = req.session?.orgId;
    const { status, page = 1, limit = 20, all = 'false' } = req.query;
    const filter = { organization: orgId };
    if (status) filter.status = status;

    let queryBuilder = Campaign.find(filter)
      .populate('template', 'name thumbnail')
      .populate('segment', 'name')
      .sort({ createdAt: -1 });

    if (all !== 'true') {
      queryBuilder = queryBuilder.skip((Number(page) - 1) * Number(limit)).limit(Number(limit));
    }

    const [campaigns, total] = await Promise.all([
      queryBuilder.lean(),
      Campaign.countDocuments(filter),
    ]);

    res.json({ success: true, data: campaigns, pagination: { total, page: Number(page), limit: Number(limit) } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/campaigns/:id ──────────────────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const orgId = req.session.orgId;
    const campaign = await Campaign.findOne({ _id: req.params.id, organization: orgId })
      .populate('template', 'name htmlContent jsonData')
      .populate('segment', 'name conditions')
      .lean();
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });
    res.json({ success: true, data: campaign });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/campaigns ──────────────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const orgId = req.session.orgId;
    // Whitelist permitted fields — clients cannot set status, stats, or organization
    const { name, subject, template, audienceType, segment, staticList,
            fromName, fromEmail, scheduledAt } = req.body;

    const body = {
      name, subject, template, audienceType, segment, staticList,
      fromName, fromEmail,
      organization: orgId,
      createdBy: req.session?.userId,
    };

    // Allow explicit scheduling; otherwise keep status as draft
    if (scheduledAt && new Date(scheduledAt) > new Date()) {
      body.scheduledAt = scheduledAt;
      body.status = 'scheduled';
    }

    const campaign = await Campaign.create(body);
    res.status(201).json({ success: true, data: campaign });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ── PATCH /api/campaigns/:id ──────────────────────────────────────────────────────────────────
router.patch('/:id', async (req, res) => {
  try {
    const orgId = req.session.orgId;
    // Whitelist permitted fields — clients cannot overwrite organization, status, or stats
    const { name, subject, template, audienceType, segment, staticList,
            fromName, fromEmail, scheduledAt } = req.body;
    const update = { name, subject, template, audienceType, segment, staticList,
                     fromName, fromEmail, scheduledAt,
                     lastUpdatedBy: req.session?.userId };
    // Remove undefined keys so we don’t overwrite existing values with undefined
    Object.keys(update).forEach(k => update[k] === undefined && delete update[k]);

    const campaign = await Campaign.findOneAndUpdate(
      { _id: req.params.id, organization: orgId },
      update,
      { new: true, runValidators: true }
    );
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });
    res.json({ success: true, data: campaign });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ── DELETE /api/campaigns/:id ──────────────────────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const orgId = req.session.orgId;
    const campaign = await Campaign.findOneAndDelete({ _id: req.params.id, organization: orgId });
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/campaigns/:id/send — trigger send via Zepto ───────────────────────────────────
router.post('/:id/send', async (req, res) => {
  try {
    const orgId = req.session.orgId;
    const campaign = await Campaign.findOne({ _id: req.params.id, organization: orgId }).populate('template');
    if (!campaign)            return res.status(404).json({ error: 'Campaign not found' });
    if (campaign.status === 'sending') return res.status(400).json({ error: 'Already sending' });
    if (campaign.status === 'sent')    return res.status(400).json({ error: 'Already sent' });

    const orgIdStr = campaign.organization.toString();

    // Resolve recipients
    let recipients = [];
    if (campaign.audienceType === 'static') {
      recipients = await Customer.find({
        _id:           { $in: campaign.staticList },
        emailStatus:   'active',
        allowBroadcast: true,
      }).lean();
    } else if (campaign.audienceType === 'segment' && campaign.segment) {
      const segment = await Segment.findById(campaign.segment);
      if (segment) {
        const query = buildSegmentQuery(orgIdStr, segment.conditions, segment.conditionGroups);
        recipients = await Customer.find({ ...query, emailStatus: 'active', allowBroadcast: true }).lean();
      }
    } else {
      // all opted-in contacts
      recipients = await Customer.find({ belongsTo: orgIdStr, emailStatus: 'active', allowBroadcast: true }).lean();
    }

    if (recipients.length === 0) {
      return res.status(400).json({ error: 'No eligible recipients. Check allowBroadcast and emailStatus.' });
    }

    // Mark as sending
    await Campaign.findByIdAndUpdate(campaign._id, {
      status: 'sending',
      startedAt: new Date(),
      'stats.total': recipients.length,
    });

    const htmlTemplate = campaign.template?.htmlContent || '';
    const subject      = campaign.subject;

    // Create queued send-log entries
    const logDocs = recipients.map(c => ({
      campaign:     campaign._id,
      customer:     c._id,
      organization: orgIdStr,
      email:        c.email,
      status:       'queued',
    }));
    await SendLog.insertMany(logDocs, { ordered: false });

    // Send in background — respond immediately to client
    res.json({ success: true, message: `Sending to ${recipients.length} recipients…`, total: recipients.length });

    // Background batch send
    const results = await sendCampaignBatch({ orgId: orgIdStr, campaign, recipients, htmlTemplate, subject });

    let sent = 0, failed = 0;
    for (const r of results) {
      if (r.error) {
        failed++;
        await SendLog.findOneAndUpdate(
          { campaign: campaign._id, customer: r.customerId },
          { status: 'failed', failureReason: r.error, sentAt: new Date() }
        );
      } else {
        sent++;
        await SendLog.findOneAndUpdate(
          { campaign: campaign._id, customer: r.customerId },
          { status: 'sent', messageId: r.messageId, sentAt: new Date() }
        );
      }
    }

    await Campaign.findByIdAndUpdate(campaign._id, {
      status:       'sent',
      completedAt:  new Date(),
      'stats.sent': sent,
      'stats.failed': failed,
    });

  } catch (err) {
    console.error('Campaign send error:', err);
    await Campaign.findByIdAndUpdate(req.params.id, { status: 'failed' });
  }
});

// ── GET /api/campaigns/:id/stats ──────────────────────────────────────────────────────────────────
router.get('/:id/stats', async (req, res) => {
  try {
    const orgId = req.session.orgId;
    const campaign = await Campaign.findOne({ _id: req.params.id, organization: orgId }).lean();
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

    // Return the full aggregation array, not just the first element (MED-7 fix)
    const statusBreakdown = await SendLog.aggregate([
      { $match: { campaign: campaign._id } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    res.json({ success: true, stats: campaign.stats, breakdown: statusBreakdown });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/campaigns/webhook/zepto — Zepto event webhooks ──────────────
router.post('/webhook/zepto', async (req, res) => {
  try {
    const events = Array.isArray(req.body) ? req.body : [req.body];

    for (const event of events) {
      const msgId  = event.message_id;
      const type   = event.event_type; // delivered, opened, clicked, bounced, spamreport

      if (!msgId) continue;

      const log = await SendLog.findOne({ messageId: msgId });
      if (!log) continue;

      switch (type) {
        case 'delivered':
          await log.updateOne({ status: 'delivered', deliveredAt: new Date() });
          await Campaign.findByIdAndUpdate(log.campaign, { $inc: { 'stats.delivered': 1 } });
          break;

        case 'opened':
          const wasOpened = log.status === 'opened';
          await log.updateOne({
            status:        'opened',
            lastOpenedAt:  new Date(),
            firstOpenedAt: log.firstOpenedAt || new Date(),
            $inc:          { openCount: 1 },
          });
          if (!wasOpened) {
            await Campaign.findByIdAndUpdate(log.campaign, {
              $inc: { 'stats.opened': 1, 'stats.uniqueOpens': 1 },
            });
          } else {
            await Campaign.findByIdAndUpdate(log.campaign, { $inc: { 'stats.opened': 1 } });
          }
          break;

        case 'clicked':
          const url = event.click_url;
          const wasClicked = log.status === 'clicked';
          await log.updateOne({
            status:         'clicked',
            firstClickedAt: log.firstClickedAt || new Date(),
            $inc:           { clickCount: 1 },
            $push:          { clicks: { url, clickedAt: new Date() } },
          });
          if (!wasClicked) {
            await Campaign.findByIdAndUpdate(log.campaign, {
              $inc: { 'stats.clicked': 1, 'stats.uniqueClicks': 1 },
            });
          } else {
            await Campaign.findByIdAndUpdate(log.campaign, { $inc: { 'stats.clicked': 1 } });
          }
          break;

        case 'bounced':
          const bounceType = event.bounce_category === 'Permanent' ? 'hard' : 'soft';
          await log.updateOne({ status: 'bounced', bouncedAt: new Date(), bounceType });
          await Campaign.findByIdAndUpdate(log.campaign, { $inc: { 'stats.bounced': 1 } });
          if (bounceType === 'hard') {
            await Customer.findByIdAndUpdate(log.customer, { emailStatus: 'bounced' });
          }
          break;

        case 'spamreport':
          await log.updateOne({ status: 'complained', complaintAt: new Date() });
          await Campaign.findByIdAndUpdate(log.campaign, { $inc: { 'stats.complained': 1 } });
          await Customer.findByIdAndUpdate(log.customer, { emailStatus: 'complained' });
          break;
      }
    }

    res.json({ received: events.length });
  } catch (err) {
    console.error('Zepto webhook error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Helper — build Mongoose filter from segment conditions
function buildSegmentQuery(orgId, conditions = [], conditionGroups = []) {
  const filter = { belongsTo: orgId };

  if (conditionGroups && conditionGroups.length > 0) {
    const groupFilters = [];
    for (const group of conditionGroups) {
      const condFilters = [];
      for (const c of group.conditions || []) {
        let condFilter = {};
        if (c.field === 'attribute') {
          const valField = `v_${c.valueType || 'str'}`;
          condFilter = {
            attributes: {
              $elemMatch: {
                k: c.attrKey,
                [valField]: applyOperator(c.operator, c.value),
              },
            },
          };
        } else {
          condFilter[c.field] = applyOperator(c.operator, c.value);
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
      filter.$and = groupFilters;
    }
    return filter;
  }

  const attrConditions = (conditions || []).filter(c => c.field === 'attribute');
  const coreConditions = (conditions || []).filter(c => c.field !== 'attribute');

  for (const cond of coreConditions) {
    filter[cond.field] = applyOperator(cond.operator, cond.value);
  }

  if (attrConditions.length) {
    filter.$and = attrConditions.map(cond => {
      const valField = `v_${cond.valueType || 'str'}`;
      return {
        attributes: {
          $elemMatch: {
            k:         cond.attrKey,
            [valField]: applyOperator(cond.operator, cond.value),
          },
        },
      };
    });
  }

  return filter;
}

function applyOperator(op, value) {
  const esc = string => (string ? string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') : '');
  switch (op) {
    case 'eq':
    case 'is':
      return value;
    case 'neq':
    case 'is not':
      return { $ne: value };
    case 'gt':
    case 'greater than':
    case 'after':
      return { $gt: value };
    case 'lt':
    case 'less than':
    case 'before':
      return { $lt: value };
    case 'gte':
    case 'greater than or equal to':
    case 'on or after':
      return { $gte: value };
    case 'lte':
    case 'less than or equal to':
    case 'on or before':
      return { $lte: value };
    case 'contains':
    case 'contain':
      return { $regex: esc(value), $options: 'i' };
    case 'does not contain':
    case 'not_contains':
      return { $not: new RegExp(esc(value), 'i') };
    case 'starts with':
    case 'starts_with':
      return { $regex: `^${esc(value)}`, $options: 'i' };
    case 'ends with':
    case 'ends_with':
      return { $regex: `${esc(value)}$`, $options: 'i' };
    case 'does not start with':
      return { $not: new RegExp(`^${esc(value)}`, 'i') };
    case 'does not end with':
      return { $not: new RegExp(`${esc(value)}$`, 'i') };
    case 'in':
      return { $in: Array.isArray(value) ? value : [value] };
    default:
      return value;
  }
}

export default router;
