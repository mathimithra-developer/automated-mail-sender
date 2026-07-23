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

import { SESClient, SendRawEmailCommand } from '@aws-sdk/client-ses';
import nodemailer from 'nodemailer';
import { OrgEmailSettings } from './models.js';

const ZEPTO_API_URL = 'https://api.zeptomail.in/v1.1/email';

// ─────────────────────────────────────────────────────────────────────────────
// Transporter Helpers
// ─────────────────────────────────────────────────────────────────────────────

function getSesTransporter() {
  const sesAccessKeyId = process.env.AWS_SES_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID;
  const sesSecretAccessKey = process.env.AWS_SES_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY;
  const sesRegion = process.env.AWS_SES_REGION || process.env.AWS_REGION || 'us-east-1';

  if (!sesAccessKeyId || !sesSecretAccessKey) {
    throw new Error('AWS SES credentials are not configured in system environment variables.');
  }

  const sesClient = new SESClient({
    region: sesRegion,
    credentials: {
      accessKeyId: sesAccessKeyId,
      secretAccessKey: sesSecretAccessKey,
    },
  });

  return nodemailer.createTransport({
    SES: { ses: sesClient, aws: { SendRawEmailCommand } },
  });
}

function getSmtpTransporter(settings) {
  if (!settings.smtpHost || !settings.smtpPort) {
    throw new Error('SMTP host and port are not configured.');
  }

  return nodemailer.createTransport({
    host: settings.smtpHost,
    port: settings.smtpPort,
    secure: settings.smtpPort === 465,
    auth: settings.smtpUser ? {
      user: settings.smtpUser,
      pass: settings.smtpPass,
    } : undefined,
  });
}

async function sendNodemailer(transporter, { fromEmail, fromName, to, toName, subject, htmlBody, textBody, replyToAddr, headers = {} }) {
  const mailOptions = {
    from: fromName ? `"${fromName}" <${fromEmail}>` : fromEmail,
    to: toName ? `"${toName}" <${to}>` : to,
    subject,
    html: htmlBody,
    text: textBody,
    replyTo: replyToAddr,
    headers,
  };

  return await transporter.sendMail(mailOptions);
}

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

  return data;
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
// Send a single transactional email
// ─────────────────────────────────────────────────────────────────────────────
export async function sendEmail({ orgId, to, toName, subject, htmlBody, textBody, replyTo, headers = {} }) {
  const settings = await getOrgSettings(orgId);
  const provider = settings.provider || 'ses';

  const finalHtml = rewriteHtmlUrls(htmlBody);
  const finalValText = textBody ? rewriteHtmlUrls(textBody) : stripHtml(finalHtml);

  if (provider === 'ses') {
    const fromEmail = settings.senderEmail || process.env.AWS_SES_SENDER_EMAIL || process.env.ZEPTO_SENDER_EMAIL;
    const fromName  = settings.senderName  || process.env.AWS_SES_SENDER_NAME  || process.env.ZEPTO_SENDER_NAME || 'Mail Sender';
    const replyToAddr = replyTo || settings.replyTo || fromEmail;

    if (!fromEmail) throw new Error('SES sender email not configured.');

    const transporter = getSesTransporter();
    const info = await sendNodemailer(transporter, {
      fromEmail,
      fromName,
      to,
      toName,
      subject,
      htmlBody: finalHtml,
      textBody: finalValText,
      replyToAddr,
      headers,
    });
    return { messageId: info.messageId, data: info };

  } else if (provider === 'smtp') {
    const fromEmail = settings.senderEmail || settings.smtpUser;
    const fromName  = settings.senderName  || 'Mail Sender';
    const replyToAddr = replyTo || settings.replyTo || fromEmail;

    if (!fromEmail) throw new Error('SMTP sender email not configured.');

    const transporter = getSmtpTransporter(settings);
    const info = await sendNodemailer(transporter, {
      fromEmail,
      fromName,
      to,
      toName,
      subject,
      htmlBody: finalHtml,
      textBody: finalValText,
      replyToAddr,
      headers,
    });
    return { messageId: info.messageId, data: info };

  } else {
    // Default to Zepto
    const hasCustomKey = !!settings.apiKey;
    const rawToken    = settings.apiKey       || process.env.ZEPTO_API_KEY;
    const token       = rawToken ? (rawToken.startsWith('Zoho-enczapikey ') ? rawToken.substring(16) : rawToken) : '';
    const fromEmail   = hasCustomKey ? (settings.senderEmail || process.env.ZEPTO_SENDER_EMAIL) : process.env.ZEPTO_SENDER_EMAIL;
    const fromName    = hasCustomKey ? (settings.senderName || process.env.ZEPTO_SENDER_NAME || 'Mail Sender') : (process.env.ZEPTO_SENDER_NAME || 'Mail Sender');
    const replyToAddr = replyTo || settings.replyTo || fromEmail;

    if (!token)     throw new Error('ZEPTO_API_KEY not set. Add it in Settings → Email Settings.');
    if (!fromEmail) throw new Error('Sender email not configured.');

    const payload = {
      from:          { address: fromEmail, name: fromName },
      to:            [{ email_address: { address: to, name: toName || to } }],
      reply_to:      { address: replyToAddr },
      subject,
      htmlbody:      finalHtml,
      textbody:      finalValText,
      mime_headers:  headers,
    };

    return callZepto(token, payload);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Send a campaign batch
// ─────────────────────────────────────────────────────────────────────────────
export async function sendCampaignBatch({ orgId, campaign, recipients, htmlTemplate, subject }) {
  const settings = await getOrgSettings(orgId);
  const provider = settings.provider || 'ses';

  const results = [];
  const baseAppUrl = (process.env.APP_URL || 'http://localhost:3000').replace(/\/$/, '');

  let transporter;
  let fromEmail;
  let fromName;
  let token;

  if (provider === 'ses') {
    fromEmail = settings.senderEmail || process.env.AWS_SES_SENDER_EMAIL || process.env.ZEPTO_SENDER_EMAIL;
    fromName  = settings.senderName  || process.env.AWS_SES_SENDER_NAME  || process.env.ZEPTO_SENDER_NAME || 'Mail Sender';
    if (!fromEmail) throw new Error('SES sender email not configured.');
    transporter = getSesTransporter();
  } else if (provider === 'smtp') {
    fromEmail = settings.senderEmail || settings.smtpUser;
    fromName  = settings.senderName  || 'Mail Sender';
    if (!fromEmail) throw new Error('SMTP sender email not configured.');
    transporter = getSmtpTransporter(settings);
  } else {
    // Zepto settings setup
    const hasCustomKey = !!settings.apiKey;
    const rawToken  = settings.apiKey      || process.env.ZEPTO_API_KEY;
    token     = rawToken ? (rawToken.startsWith('Zoho-enczapikey ') ? rawToken.substring(16) : rawToken) : '';
    fromEmail = hasCustomKey ? (settings.senderEmail || process.env.ZEPTO_SENDER_EMAIL) : process.env.ZEPTO_SENDER_EMAIL;
    fromName  = hasCustomKey ? (settings.senderName  || process.env.ZEPTO_SENDER_NAME || 'Mail Sender') : (process.env.ZEPTO_SENDER_NAME || 'Mail Sender');

    if (!token)     throw new Error('ZEPTO_API_KEY not configured');
    if (!fromEmail) throw new Error('Sender email not configured');
  }

  for (const customer of recipients) {
    const toEmail = customer.email;
    if (!toEmail) {
      results.push({ customerId: customer._id, email: null, error: 'No email address' });
      continue;
    }

    const personalised = replaceMergeTags(htmlTemplate, customer);
    const finalHtml = rewriteHtmlUrls(personalised);
    const unsubUrl = `${baseAppUrl}/unsubscribe?email=${encodeURIComponent(toEmail)}&org=${orgId}&campaign=${campaign._id}`;

    const headers = {
      'List-Unsubscribe':      `<${unsubUrl}>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      'X-Campaign-ID':         campaign._id.toString(),
    };

    try {
      if (provider === 'ses' || provider === 'smtp') {
        const info = await sendNodemailer(transporter, {
          fromEmail,
          fromName,
          to: toEmail,
          toName: customer.name || toEmail,
          subject: replaceMergeTags(subject, customer),
          htmlBody: finalHtml,
          textBody: stripHtml(finalHtml),
          replyToAddr: settings.replyTo || fromEmail,
          headers,
        });
        results.push({ customerId: customer._id, email: toEmail, messageId: info.messageId, error: null });
      } else {
        const payload = {
          from:         { address: fromEmail, name: fromName },
          to:           [{ email_address: { address: toEmail, name: customer.name || toEmail } }],
          reply_to:     { address: settings.replyTo || fromEmail },
          subject:      replaceMergeTags(subject, customer),
          htmlbody:     finalHtml,
          textbody:     stripHtml(finalHtml),
          mime_headers: headers,
        };

        const res    = await callZepto(token, payload);
        const msgId  = res?.data?.[0]?.message_id || res?.request_id || null;
        results.push({ customerId: customer._id, email: toEmail, messageId: msgId, error: null });
      }
    } catch (err) {
      results.push({ customerId: customer._id, email: toEmail, messageId: null, error: err.message });
    }

    await sleep(provider === 'zepto' ? 120 : 50);
  }

  return results;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

export function replaceMergeTags(template, customer) {
  if (!template) return '';

  let out = template
    .replaceAll('{{customer.name}}',      customer.name   || '')
    .replaceAll('{{customer.firstName}}', (customer.name || '').split(' ')[0] || '')
    .replaceAll('{{customer.email}}',     customer.email  || '')
    .replaceAll('{{customer.phone}}',     customer.phoneNo|| '');

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

export function rewriteHtmlUrls(text) {
  if (!text) return '';
  const appUrl = (process.env.APP_URL || 'http://localhost:3000').replace(/\/$/, '');
  let out = text.replace(/https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?/g, appUrl);
  out = out.replace(/(src|href)="(\/(?:api\/assets\/img|uploads)\/[^"]+)"/g,
    (_, attr, path) => `${attr}="${appUrl}${path}"`);
  return out;
}
