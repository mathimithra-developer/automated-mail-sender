/** /api/ai — AI-powered email tools via Google Gemini */
import { Router } from 'express';
import * as AI from '../lib/ai.js';

const router = Router();

// POST /api/ai/generate — generate full email HTML from prompt
router.post('/generate', async (req, res) => {
  try {
    const { prompt, context } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Prompt is required' });
    const html = await AI.generateEmailContent(prompt, context || {});
    res.json({ success: true, html });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/ai/subject-lines — generate 5 subject line variants
router.post('/subject-lines', async (req, res) => {
  try {
    const { html, campaignName } = req.body;
    const lines = await AI.generateSubjectLines(html || '', campaignName || '');
    res.json({ success: true, lines });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/ai/analyze — spam score + readability
router.post('/analyze', async (req, res) => {
  try {
    const { html, subject } = req.body;
    if (!html) return res.status(400).json({ error: 'HTML is required' });
    const analysis = await AI.analyzeEmail(html, subject || '');
    res.json({ success: true, analysis });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/ai/accessibility — accessibility audit
router.post('/accessibility', async (req, res) => {
  try {
    const { html } = req.body;
    if (!html) return res.status(400).json({ error: 'HTML is required' });
    const result = await AI.checkAccessibility(html);
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/ai/rewrite — rewrite copy in a different tone
router.post('/rewrite', async (req, res) => {
  try {
    const { text, tone } = req.body;
    if (!text) return res.status(400).json({ error: 'Text is required' });
    const rewritten = await AI.rewriteContent(text, tone || 'professional');
    res.json({ success: true, text: rewritten });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/ai/ab-variant — generate an A/B subject variant
router.post('/ab-variant', async (req, res) => {
  try {
    const { subject } = req.body;
    if (!subject) return res.status(400).json({ error: 'Subject is required' });
    const variant = await AI.generateABVariant(subject);
    res.json({ success: true, variant });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
