import mongoose from 'mongoose';
import { Campaign, Customer, SendLog, Segment } from './models.js';
import { sendCampaignBatch } from './mailer.js';

export function startCampaignScheduler() {
  console.log('⏰ Campaign background scheduler active');

  // Check every 20 seconds for scheduled campaigns
  setInterval(async () => {
    // Skip silently if DB is not connected — auto-reconnect handles recovery
    if (mongoose.connection.readyState !== 1) return;

    try {
      const now = new Date();
      const dueCampaigns = await Campaign.find({
        status: 'scheduled',
        scheduledAt: { $lte: now }
      }).populate('template');

      for (const campaign of dueCampaigns) {
        console.log(`⏰ Executing scheduled campaign: ${campaign.name} (${campaign._id})`);

        // Atomically claim campaign
        const updated = await Campaign.findOneAndUpdate(
          { _id: campaign._id, status: 'scheduled' },
          { status: 'sending', startedAt: new Date() },
          { new: true }
        );

        if (!updated) continue; // Already claimed

        const orgId = campaign.organization.toString();

        // Resolve recipients
        let recipients = [];
        if (campaign.audienceType === 'static') {
          recipients = await Customer.find({
            _id: { $in: campaign.staticList },
            emailStatus: 'active',
            allowBroadcast: true,
          }).lean();
        } else if (campaign.audienceType === 'segment' && campaign.segment) {
          const segment = await Segment.findById(campaign.segment);
          if (segment) {
            const query = buildQueryForScheduler(orgId, segment.conditions, segment.conditionGroups);
            recipients = await Customer.find({ ...query, emailStatus: 'active', allowBroadcast: true }).lean();
          }
        } else {
          recipients = await Customer.find({ belongsTo: orgId, emailStatus: 'active', allowBroadcast: true }).lean();
        }

        if (recipients.length === 0) {
          await Campaign.findByIdAndUpdate(campaign._id, { status: 'failed', completedAt: new Date() });
          console.log(`⚠️ Scheduled campaign ${campaign.name} has no eligible recipients.`);
          continue;
        }

        await Campaign.findByIdAndUpdate(campaign._id, { 'stats.total': recipients.length });

        const htmlTemplate = campaign.template?.htmlContent || '';
        const subject = campaign.subject;

        const logDocs = recipients.map(c => ({
          campaign: campaign._id,
          customer: c._id,
          organization: orgId,
          email: c.email,
          status: 'queued',
        }));
        await SendLog.insertMany(logDocs, { ordered: false });

        // Execute background send
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
          status: 'sent',
          completedAt: new Date(),
          'stats.sent': sent,
          'stats.failed': failed,
        });

        console.log(`✅ Scheduled campaign ${campaign.name} completed successfully. Sent: ${sent}, Failed: ${failed}`);
      }
    } catch (err) {
      console.error('Error in campaign scheduler:', err.message);
    }
  }, 20000);
}


function buildQueryForScheduler(orgId, conditions = [], conditionGroups = []) {
  const filter = { belongsTo: orgId };

  if (conditionGroups && conditionGroups.length > 0) {
    const groupFilters = [];
    for (const group of conditionGroups) {
      const condFilters = [];
      for (const c of group.conditions || []) {
        let condFilter = {};
        let val = c.value;
        if (c.valueType === 'num' && val !== undefined && val !== null && val !== '') val = Number(val);
        else if (c.valueType === 'date' && val) val = new Date(val);

        if (c.field === 'attribute') {
          const valField = `attributes.v_${c.valueType || 'str'}`;
          condFilter = {
            attributes: {
              $elemMatch: {
                k: c.attrKey,
                [valField]: applyOp(c.operator, val),
              },
            },
          };
        } else {
          condFilter[c.field] = applyOp(c.operator, val);
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
    let val = cond.value;
    if (cond.valueType === 'num' && val !== undefined && val !== null && val !== '') val = Number(val);
    else if (cond.valueType === 'date' && val) val = new Date(val);

    filter[cond.field] = applyOp(cond.operator, val);
  }

  if (attrConditions.length) {
    filter.$and = attrConditions.map(cond => {
      let val = cond.value;
      if (cond.valueType === 'num' && val !== undefined && val !== null && val !== '') val = Number(val);
      else if (cond.valueType === 'date' && val) val = new Date(val);

      const valField = `attributes.v_${cond.valueType || 'str'}`;
      return {
        attributes: {
          $elemMatch: {
            k: cond.attrKey,
            [valField]: applyOp(cond.operator, val),
          },
        },
      };
    });
  }

  return filter;
}

function applyOp(op, value) {
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
    default:
      return value;
  }
}
