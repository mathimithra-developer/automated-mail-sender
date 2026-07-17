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
    const { status, page = 1, limit = 20 } = req.query;
    const filter = { organization: orgId };
    if (status) filter.status = status;

    const [campaigns, total] = await Promise.all([
      Campaign.find(filter)
        .populate('template', 'name thumbnail')
        .populate('segment', 'name')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .lean(),
      Campaign.countDocuments(filter),
    ]);

    res.json({ success: true, data: campaigns, pagination: { total, page: Number(page), limit: Number(limit) } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/campaigns/:id ─────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id)
      .populate('template', 'name htmlContent jsonData')
      .populate('segment', 'name conditions')
      .lean();
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });
    res.json({ success: true, data: campaign });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/campaigns ────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const orgId = req.session?.orgId;
    const campaign = await Campaign.create({ ...req.body, organization: orgId, createdBy: req.session?.userId });
    res.status(201).json({ success: true, data: campaign });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ── PATCH /api/campaigns/:id ───────────────────────────────────────────────
router.patch('/:id', async (req, res) => {
  try {
    const campaign = await Campaign.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });
    res.json({ success: true, data: campaign });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ── DELETE /api/campaigns/:id ──────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const campaign = await Campaign.findByIdAndDelete(req.params.id);
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/campaigns/:id/send — trigger send via Zepto ─────────────────
router.post('/:id/send', async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id).populate('template');
    if (!campaign)            return res.status(404).json({ error: 'Campaign not found' });
    if (campaign.status === 'sending') return res.status(400).json({ error: 'Already sending' });
    if (campaign.status === 'sent')    return res.status(400).json({ error: 'Already sent' });

    const orgId = campaign.organization.toString();

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
        const query = buildSegmentQuery(orgId, segment.conditions);
        recipients = await Customer.find({ ...query, emailStatus: 'active', allowBroadcast: true }).lean();
      }
    } else {
      // all opted-in contacts
      recipients = await Customer.find({ belongsTo: orgId, emailStatus: 'active', allowBroadcast: true }).lean();
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
      organization: orgId,
      email:        c.email,
      status:       'queued',
    }));
    await SendLog.insertMany(logDocs, { ordered: false });

    // Send in background — respond immediately to client
    res.json({ success: true, message: `Sending to ${recipients.length} recipients…`, total: recipients.length });

    // Background batch send
    const results = await sendCampaignBatch({ orgId, campaign, recipients, htmlTemplate, subject });

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

// ── GET /api/campaigns/:id/stats ───────────────────────────────────────────
router.get('/:id/stats', async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id).lean();
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

    const [statusBreakdown] = await SendLog.aggregate([
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
function buildSegmentQuery(orgId, conditions = []) {
  const filter = { belongsTo: orgId };
  const attrConditions = conditions.filter(c => c.field === 'attribute');
  const coreConditions = conditions.filter(c => c.field !== 'attribute');

  for (const cond of coreConditions) {
    filter[cond.field] = applyOperator(cond.operator, cond.value);
  }

  if (attrConditions.length) {
    filter.$and = attrConditions.map(cond => {
      const valField = `attributes.v_${cond.valueType || 'str'}`;
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
  switch (op) {
    case 'eq':       return value;
    case 'neq':      return { $ne: value };
    case 'gt':       return { $gt: value };
    case 'lt':       return { $lt: value };
    case 'gte':      return { $gte: value };
    case 'lte':      return { $lte: value };
    case 'contains': return { $regex: value, $options: 'i' };
    case 'in':       return { $in: Array.isArray(value) ? value : [value] };
    default:         return value;
  }
}

export default router;
