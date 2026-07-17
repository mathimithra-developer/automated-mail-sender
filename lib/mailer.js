/**
 * Zepto Mail (ZeptoMail) — Email Service
 * API Docs: https://www.zoho.com/zeptomail/help/api/email-sending.html
 *
 * Get your Send Mail token from:
 * ZeptoMail Dashboard → Mail Agents → <your agent> → Send Mail Token
 *
 * Set in .env:
 *   ZEPTO_API_KEY=<your send mail token>
 *   ZEPTO_SENDER_EMAIL=noreply@yourdomain.com
 *   ZEPTO_SENDER_NAME=Mail Sender
 */

import { OrgEmailSettings } from './models.js';

const ZEPTO_API_URL = 'https://api.zeptomail.in/v1.1/email';

// ─────────────────────────────────────────────────────────────────────────────
// Low-level Zepto API call
// ─────────────────────────────────────────────────────────────────────────────
async function callZepto(token, payload) {
  const res = await fetch(ZEPTO_API_URL, {
    method:  'POST',
    headers: {
      'Accept':        'application/json',
      'Content-Type':  'application/json',
      'Authorization': `Zoho-enczapikey ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({ error: 'Invalid JSON response' }));

  if (!res.ok) {
    const msg = data?.error?.details?.[0]?.message || data?.message || JSON.stringify(data);
    throw new Error(`Zepto error ${res.status}: ${msg}`);
  }

  return data;  // { request_id, data: [{ code, message }] }
}

// ─────────────────────────────────────────────────────────────────────────────
// Get org email settings (cached per request is fine — small app)
// ─────────────────────────────────────────────────────────────────────────────
async function getOrgSettings(orgId) {
  const settings = await OrgEmailSettings.findOne({ organization: orgId });
  if (!settings) throw new Error('Email settings not configured for this organisation');
  return settings;
}

// ─────────────────────────────────────────────────────────────────────────────
// Send a single transactional email via Zepto
// ─────────────────────────────────────────────────────────────────────────────
export async function sendEmail({ orgId, to, toName, subject, htmlBody, textBody, replyTo, headers = {} }) {
  const settings = await getOrgSettings(orgId);

  // Fall back to global env vars if no apiKey stored yet
  const rawToken    = settings.apiKey       || process.env.ZEPTO_API_KEY;
  const token       = rawToken ? (rawToken.startsWith('Zoho-enczapikey ') ? rawToken.substring(16) : rawToken) : '';
  const fromEmail   = settings.senderEmail  || process.env.ZEPTO_SENDER_EMAIL;
  const fromName    = settings.senderName   || process.env.ZEPTO_SENDER_NAME || 'Mail Sender';
  const replyToAddr = replyTo || settings.replyTo || fromEmail;

  if (!token)     throw new Error('ZEPTO_API_KEY not set. Add it in Settings → Email Settings.');
  if (!fromEmail) throw new Error('Sender email not configured.');

  const payload = {
    from:          { address: fromEmail, name: fromName },
    to:            [{ email_address: { address: to, name: toName || to } }],
    reply_to:      { address: replyToAddr },
    subject,
    htmlbody:      htmlBody,
    textbody:      textBody || stripHtml(htmlBody),
    mime_headers:  headers,
  };

  return callZepto(token, payload);
}

// ─────────────────────────────────────────────────────────────────────────────
// Send a campaign batch  (loop — Zepto free tier: 1 req/s)
// Returns array of { customerId, email, messageId, error }
// ─────────────────────────────────────────────────────────────────────────────
export async function sendCampaignBatch({ orgId, campaign, recipients, htmlTemplate, subject }) {
  const settings = await getOrgSettings(orgId);
  const rawToken  = settings.apiKey      || process.env.ZEPTO_API_KEY;
  const token     = rawToken ? (rawToken.startsWith('Zoho-enczapikey ') ? rawToken.substring(16) : rawToken) : '';
  const fromEmail = settings.senderEmail || process.env.ZEPTO_SENDER_EMAIL;
  const fromName  = settings.senderName  || process.env.ZEPTO_SENDER_NAME || 'Mail Sender';

  if (!token)     throw new Error('ZEPTO_API_KEY not configured');
  if (!fromEmail) throw new Error('Sender email not configured');

  const results = [];

  for (const customer of recipients) {
    const toEmail = customer.email;
    if (!toEmail) {
      results.push({ customerId: customer._id, email: null, error: 'No email address' });
      continue;
    }

    // Personalise HTML — replace merge tags
    const personalised = replaceMergeTags(htmlTemplate, customer);

    // List-Unsubscribe header
    const unsubUrl = `${process.env.APP_URL || 'http://localhost:3000'}/unsubscribe?email=${encodeURIComponent(toEmail)}&org=${orgId}&campaign=${campaign._id}`;

    const payload = {
      from:         { address: fromEmail, name: fromName },
      to:           [{ email_address: { address: toEmail, name: customer.name || toEmail } }],
      reply_to:     { address: settings.replyTo || fromEmail },
      subject:      replaceMergeTags(subject, customer),
      htmlbody:     personalised,
      textbody:     stripHtml(personalised),
      mime_headers: {
        'List-Unsubscribe':      `<${unsubUrl}>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
        'X-Campaign-ID':         campaign._id.toString(),
      },
    };

    try {
      const res    = await callZepto(token, payload);
      const msgId  = res?.data?.[0]?.message_id || res?.request_id || null;
      results.push({ customerId: customer._id, email: toEmail, messageId: msgId, error: null });
    } catch (err) {
      results.push({ customerId: customer._id, email: toEmail, messageId: null, error: err.message });
    }

    // Zepto rate-limit: 1 req / 100 ms (free tier), adjust if on paid plan
    await sleep(120);
  }

  return results;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Replace {{customer.name}}, {{customer.email}}, {{attributes.city}}, etc.
 */
export function replaceMergeTags(template, customer) {
  if (!template) return '';

  // Core fields
  let out = template
    .replaceAll('{{customer.name}}',      customer.name   || '')
    .replaceAll('{{customer.firstName}}', (customer.name || '').split(' ')[0] || '')
    .replaceAll('{{customer.email}}',     customer.email  || '')
    .replaceAll('{{customer.phone}}',     customer.phoneNo|| '');

  // Dynamic attributes — {{attr.city}}, {{attr.lead_score}}, etc.
  if (customer.attributes?.length) {
    for (const attr of customer.attributes) {
      const val = attr.v_str ?? attr.v_num ?? (attr.v_date ? attr.v_date.toISOString().slice(0,10) : '');
      out = out.replaceAll(`{{attr.${attr.k}}}`, val ?? '');
    }
  }

  return out;
}

function stripHtml(html = '') {
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}
