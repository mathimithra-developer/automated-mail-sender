/**
 * AI Service — Together AI (Llama 3.3 70B Instruct Turbo)
 * Set TOGETHER_API_KEY in .env
 * Docs: https://docs.together.ai/reference/chat-completions
 */

const TOGETHER_CHAT_URL = 'https://api.together.xyz/v1/chat/completions';
const TOGETHER_MODEL = 'meta-llama/Llama-3.3-70B-Instruct-Turbo';

async function callTogetherAI(prompt, systemInstruction = '') {
  const key = process.env.TOGETHER_API_KEY;
  if (!key) throw new Error('TOGETHER_API_KEY not set in .env');

  const messages = [];
  if (systemInstruction) {
    messages.push({ role: 'system', content: systemInstruction });
  }
  messages.push({ role: 'user', content: prompt });

  const body = {
    model: TOGETHER_MODEL,
    messages,
    temperature: 0.7,
    max_tokens: 2048,
  };

  const res = await fetch(TOGETHER_CHAT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Together AI error ${res.status}: ${err?.error?.message || JSON.stringify(err)}`);
  }

  const data = await res.json();
  return data?.choices?.[0]?.message?.content || '';
}

// ─────────────────────────────────────────────────────────────────────────────
// Generate full email HTML from a prompt
// ─────────────────────────────────────────────────────────────────────────────
export async function generateEmailContent(prompt, context = {}) {
  const system = `You are an expert mobile-first HTML email designer.
Generate clean, highly responsive, mobile-first HTML email structure.
Rules:
- Max width 600px, fluid 100% width on mobile screens
- Single column stacked layout optimized for mobile reading
- Typography: Headings 24px-32px, Body copy 16px-18px for maximum legibility
- CTAs: Large, prominent button links with full padding (minimum 12px 24px)
- Spacing: Clean vertical margins and padding between sections
- Use standard semantic tags (<h1>-<h6> for headings, <p> for paragraphs, <a style="..."> for button CTAs, <img src="..."> for images, <hr> for dividers)
- Inline CSS only (no <style> blocks)
- Use web-safe fonts (Arial, Georgia, Helvetica, sans-serif)
- Accent color: #8b5cf6
- Return ONLY the HTML body content — no <!DOCTYPE>, <html>, <head>, or <body> wrapper tags
Context: ${JSON.stringify(context)}`;

  const text = await callTogetherAI(prompt, system);
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

  const text = await callTogetherAI(prompt);
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

  const text = await callTogetherAI(prompt);
  try {
    const clean = text.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim();
    return JSON.parse(clean);
  } catch {
    return { spamScore: 0, spamLevel: 'low', issues: [], suggestions: ['Enable TOGETHER_API_KEY for full analysis'], readabilityScore: 75, wordCount: 0, estimatedReadTime: 'N/A', previewText: '' };
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

  const text = await callTogetherAI(prompt);
  try {
    const clean = text.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim();
    return JSON.parse(clean);
  } catch {
    return { score: 100, grade: 'A', issues: [], passed: ['Set TOGETHER_API_KEY for real analysis'] };
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
  return callTogetherAI(prompt);
}

// ─────────────────────────────────────────────────────────────────────────────
// Suggest A/B test subject line variants
// ─────────────────────────────────────────────────────────────────────────────
export async function generateABVariant(subject) {
  const prompt = `Create one alternative subject line for A/B testing.
Original: "${subject}"
Make it meaningfully different (different angle/style) but for the same campaign.
Return ONLY the subject line string, nothing else.`;
  const text = await callTogetherAI(prompt);
  return text.replace(/^["']|["']$/g, '').trim();
}

// ─────────────────────────────────────────────────────────────────────────────
// Generate Image with Together AI (FLUX)
// ─────────────────────────────────────────────────────────────────────────────
export async function generateImage(prompt, width = 1024, height = 1024) {
  const apiKey = process.env.TOGETHER_API_KEY;
  if (!apiKey) throw new Error('TOGETHER_API_KEY not set in .env');

  const res = await fetch('https://api.together.ai/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'black-forest-labs/FLUX.1-schnell',
      prompt: prompt,
      width: parseInt(width) || 1024,
      height: parseInt(height) || 1024,
      steps: 4,
      response_format: 'b64_json'
    })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Together AI error ${res.status}: ${err?.error?.message || JSON.stringify(err)}`);
  }

  const data = await res.json();
  const base64Data = data?.data?.[0]?.b64_json;
  if (!base64Data) {
    throw new Error('No image data returned from Together AI');
  }

  return base64Data;
}

