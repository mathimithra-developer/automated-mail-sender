/**
 * AI Service — Google Gemini (gemini-1.5-flash)
 * Set GEMINI_API_KEY in .env
 * Docs: https://ai.google.dev/api/generate-content
 */

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

async function callGemini(prompt, systemInstruction = '') {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY not set in .env');

  const body = {
    system_instruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined,
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
  };

  const res = await fetch(`${GEMINI_URL}?key=${key}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Gemini error ${res.status}: ${err?.error?.message || JSON.stringify(err)}`);
  }

  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

// ─────────────────────────────────────────────────────────────────────────────
// Generate full email HTML from a prompt
// ─────────────────────────────────────────────────────────────────────────────
export async function generateEmailContent(prompt, context = {}) {
  const system = `You are an expert HTML email designer. 
Generate clean, responsive, table-based HTML email code. 
Rules:
- Use inline CSS only (no <style> blocks — most email clients strip them)
- Max width 600px, centered in a wrapper table
- Mobile-friendly: single column on small screens
- Use web-safe fonts (Arial, Georgia, Helvetica, sans-serif)
- Return ONLY the HTML inside <body> — no <!DOCTYPE>, <html>, <head>, or <body> tags
- Include real, compelling copy based on the prompt
- Use #8b5cf6 as the primary accent color
Context: ${JSON.stringify(context)}`;

  const text = await callGemini(prompt, system);
  // Strip markdown code fences if model wraps in ```html
  return text.replace(/^```(?:html)?\n?/i, '').replace(/\n?```$/i, '').trim();
}

// ─────────────────────────────────────────────────────────────────────────────
// Generate 5 subject line variations
// ─────────────────────────────────────────────────────────────────────────────
export async function generateSubjectLines(emailContent, campaignName = '') {
  const prompt = `Generate exactly 5 compelling email subject lines for this campaign.
Campaign name: ${campaignName}
Email content preview: ${emailContent.slice(0, 500)}

Rules:
- Mix different styles: curiosity, urgency, personalization, benefit-led, question
- Keep under 60 characters each
- Do NOT use clickbait or spam words
- Return as a JSON array of strings like: ["line1","line2","line3","line4","line5"]
- Return ONLY the JSON array, nothing else`;

  const text = await callGemini(prompt);
  try {
    const clean = text.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim();
    return JSON.parse(clean);
  } catch {
    // Fallback: extract lines
    return text.split('\n').filter(l => l.trim().length > 5).slice(0, 5).map(l => l.replace(/^\d+\.\s*"?/, '').replace(/"$/, '').trim());
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Analyze spam score and readability
// ─────────────────────────────────────────────────────────────────────────────
export async function analyzeEmail(html, subject = '') {
  const prompt = `Analyze this HTML email for spam indicators and readability.
Subject: "${subject}"
HTML: ${html.slice(0, 3000)}

Return a JSON object with EXACTLY this structure:
{
  "spamScore": 3,
  "spamLevel": "low",
  "issues": ["issue1", "issue2"],
  "suggestions": ["suggestion1", "suggestion2"],
  "readabilityScore": 78,
  "wordCount": 120,
  "estimatedReadTime": "45 seconds",
  "previewText": "first 90 chars of visible text"
}

spamScore: 0-10 (0=clean, 10=definite spam)
spamLevel: "low" | "medium" | "high"
Return ONLY the JSON object, nothing else.`;

  const text = await callGemini(prompt);
  try {
    const clean = text.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim();
    return JSON.parse(clean);
  } catch {
    return { spamScore: 0, spamLevel: 'low', issues: [], suggestions: ['Enable GEMINI_API_KEY for full analysis'], readabilityScore: 75, wordCount: 0, estimatedReadTime: 'N/A', previewText: '' };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Check accessibility
// ─────────────────────────────────────────────────────────────────────────────
export async function checkAccessibility(html) {
  const prompt = `Audit this HTML email for accessibility issues.
HTML: ${html.slice(0, 3000)}

Return a JSON object with EXACTLY this structure:
{
  "score": 85,
  "grade": "B",
  "issues": [
    { "severity": "error", "rule": "missing-alt", "description": "Image missing alt text", "element": "<img src=...>" },
    { "severity": "warning", "rule": "low-contrast", "description": "Text contrast ratio below 4.5:1", "element": "<p style=color:#ccc>" }
  ],
  "passed": ["Has heading structure", "Links have descriptive text"]
}

severity: "error" | "warning" | "info"
score: 0-100
grade: "A" | "B" | "C" | "D" | "F"
Return ONLY the JSON object.`;

  const text = await callGemini(prompt);
  try {
    const clean = text.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim();
    return JSON.parse(clean);
  } catch {
    return { score: 100, grade: 'A', issues: [], passed: ['Set GEMINI_API_KEY for real analysis'] };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Rewrite / improve existing email copy
// ─────────────────────────────────────────────────────────────────────────────
export async function rewriteContent(text, tone = 'professional') {
  const prompt = `Rewrite this email copy in a ${tone} tone. 
Keep the same HTML structure and tags. Only change the text content.
Return ONLY the rewritten HTML, nothing else.
Original: ${text}`;
  return callGemini(prompt);
}

// ─────────────────────────────────────────────────────────────────────────────
// Suggest A/B test subject line variants
// ─────────────────────────────────────────────────────────────────────────────
export async function generateABVariant(subject) {
  const prompt = `Create one alternative subject line for A/B testing.
Original: "${subject}"
Make it meaningfully different (different angle/style) but for the same campaign.
Return ONLY the subject line string, nothing else.`;
  const text = await callGemini(prompt);
  return text.replace(/^["']|["']$/g, '').trim();
}
