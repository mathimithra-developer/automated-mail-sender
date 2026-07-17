/** /api/abtests — A/B campaign testing */
import { Router } from 'express';
import { ABTest, Campaign } from '../lib/models.js';

const router = Router();

// GET /api/abtests
router.get('/', async (req, res) => {
  try {
    const orgId = req.session?.orgId;
    const tests = await ABTest.find({ organization: orgId })
      .populate('campaignA', 'name subject stats')
      .populate('campaignB', 'name subject stats')
      .populate('winnerCampaign', 'name')
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, data: tests });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/abtests/:id
router.get('/:id', async (req, res) => {
  try {
    const test = await ABTest.findById(req.params.id)
      .populate('campaignA')
      .populate('campaignB')
      .lean();
    if (!test) return res.status(404).json({ error: 'A/B test not found' });
    res.json({ success: true, data: test });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/abtests — create test from two campaigns
router.post('/', async (req, res) => {
  try {
    const orgId = req.session?.orgId;
    const { name, campaignA, campaignB, splitPercent = 50, winnerMetric = 'open_rate' } = req.body;

    if (!campaignA || !campaignB) return res.status(400).json({ error: 'Two campaign IDs required' });

    const test = await ABTest.create({
      name, organization: orgId,
      campaignA, campaignB,
      splitPercent, winnerMetric,
      createdBy: req.session?.userId,
    });

    // Mark both campaigns as A/B test participants
    await Campaign.updateMany(
      { _id: { $in: [campaignA, campaignB] } },
      { isABTest: true, abTestId: test._id }
    );

    res.status(201).json({ success: true, data: test });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/abtests/:id/stats — compare performance
router.get('/:id/stats', async (req, res) => {
  try {
    const test = await ABTest.findById(req.params.id)
      .populate('campaignA', 'name subject stats')
      .populate('campaignB', 'name subject stats')
      .lean();

    if (!test) return res.status(404).json({ error: 'Not found' });

    const calcRate = (campaign, metric) => {
      const { stats } = campaign;
      if (!stats || !stats.sent) return 0;
      if (metric === 'open_rate')  return ((stats.uniqueOpens  / stats.sent) * 100).toFixed(1);
      if (metric === 'click_rate') return ((stats.uniqueClicks / stats.sent) * 100).toFixed(1);
      return 0;
    };

    const rateA = calcRate(test.campaignA, test.winnerMetric);
    const rateB = calcRate(test.campaignB, test.winnerMetric);

    const comparison = {
      metricName: test.winnerMetric,
      variantA: { name: test.campaignA.name, subject: test.campaignA.subject, rate: rateA, stats: test.campaignA.stats },
      variantB: { name: test.campaignB.name, subject: test.campaignB.subject, rate: rateB, stats: test.campaignB.stats },
      leader: rateA > rateB ? 'A' : rateB > rateA ? 'B' : 'tie',
      difference: Math.abs(rateA - rateB).toFixed(1),
    };

    res.json({ success: true, comparison, test });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/abtests/:id/pick-winner — finalize test, promote winner
router.post('/:id/pick-winner', async (req, res) => {
  try {
    const { winner } = req.body; // 'A' | 'B'
    const test = await ABTest.findById(req.params.id).populate('campaignA campaignB');
    if (!test) return res.status(404).json({ error: 'Not found' });

    const winnerCampaign = winner === 'A' ? test.campaignA._id : test.campaignB._id;

    await test.updateOne({ winner, winnerCampaign, status: 'completed', decidedAt: new Date() });
    res.json({ success: true, winner, winnerCampaign });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/abtests/:id
router.delete('/:id', async (req, res) => {
  try {
    await ABTest.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
