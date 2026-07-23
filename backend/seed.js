/**
 * Seed Script — fills MongoDB with realistic demo data using the Attribute Pattern
 *
 * Run: node seed.js
 */

import 'dotenv/config';
import mongoose from 'mongoose';
import {
  Organization, User, OrgEmailSettings,
  Tag, Customer, CustomField,
  EmailTemplate, Campaign, Segment,
} from './lib/models.js';
import { hashPassword } from './lib/hash.js';

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mailsender';

// ─────────────────────────────────────────────────────────────────────────────
// Helper
// ─────────────────────────────────────────────────────────────────────────────
function attr(k, value) {
  if (value instanceof Date)          return { k, v_date: value };
  if (typeof value === 'number')      return { k, v_num: value };
  return                                     { k, v_str: String(value) };
}

const daysAgo = (n) => new Date(Date.now() - n * 86_400_000);

// ─────────────────────────────────────────────────────────────────────────────
async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB');

  // ── Wipe existing demo data ───────────────────────────────────────────────
  await Promise.all([
    Organization.deleteMany({}), User.deleteMany({}),
    OrgEmailSettings.deleteMany({}), Tag.deleteMany({}),
    Customer.deleteMany({}), CustomField.deleteMany({}),
    EmailTemplate.deleteMany({}), Campaign.deleteMany({}),
    Segment.deleteMany({}),
  ]);
  console.log('🗑️  Cleared collections');

  // ── Organization ──────────────────────────────────────────────────────────
  const org = await Organization.create({
    name: 'Stellar Commerce',
    website: 'https://stellarcommerce.in',
    plan: 'pro',
  });

  // ── Users ─────────────────────────────────────────────────────────────────
  const owner = await User.create({
    name: 'Aryan Mehta',
    email: 'aryan@stellarcommerce.in',
    password: hashPassword('Admin@1234'),
    role: 'OWNER',
    organization: org._id,
  });

  const agent = await User.create({
    name: 'Priya Shah',
    email: 'priya@stellarcommerce.in',
    password: hashPassword('Agent@5678'),
    role: 'MEMBER',
    organization: org._id,
  });

  // ── Email Settings (SES) ───────────────────────────────────────────────────
  await OrgEmailSettings.create({
    organization: org._id,
    provider:     'ses',
    senderName:   'Stellar Commerce',
    senderEmail:  'noreply@stellarcommerce.in',
    replyTo:      'support@stellarcommerce.in',
  });

  // ── Custom Field Definitions ───────────────────────────────────────────────
  await CustomField.insertMany([
    { belongsTo: org._id, name: 'city',           label: 'City',           dataType: 'text',          userDefine: true },
    { belongsTo: org._id, name: 'state',          label: 'State',          dataType: 'text',          userDefine: true },
    { belongsTo: org._id, name: 'plan',           label: 'Plan',           dataType: 'select',        options: ['free', 'starter', 'pro', 'enterprise'], userDefine: true },
    { belongsTo: org._id, name: 'lead_score',     label: 'Lead Score',     dataType: 'number',        userDefine: true },
    { belongsTo: org._id, name: 'loyalty_points', label: 'Loyalty Points', dataType: 'number',        userDefine: true },
    { belongsTo: org._id, name: 'last_purchase',  label: 'Last Purchase',  dataType: 'date',          userDefine: true },
    { belongsTo: org._id, name: 'signup_date',    label: 'Signup Date',    dataType: 'date',          userDefine: true },
    { belongsTo: org._id, name: 'industry',       label: 'Industry',       dataType: 'select',        options: ['retail', 'saas', 'healthcare', 'finance', 'education'], userDefine: true },
    { belongsTo: org._id, name: 'company',        label: 'Company',        dataType: 'text',          userDefine: true },
    { belongsTo: org._id, name: 'designation',    label: 'Designation',    dataType: 'text',          userDefine: true },
  ]);
  console.log('✅ Custom field definitions created');

  // ── Tags ──────────────────────────────────────────────────────────────────
  const [tagVIP, tagLead, tagWin, tagRisk, tagNewsletter] = await Tag.insertMany([
    { name: 'VIP',          color: '#f59e0b', organization: org._id },
    { name: 'Hot Lead',     color: '#ef4444', organization: org._id },
    { name: 'Win Back',     color: '#8b5cf6', organization: org._id },
    { name: 'At Risk',      color: '#f97316', organization: org._id },
    { name: 'Newsletter',   color: '#10b981', organization: org._id },
  ]);

  // ── Customers (Attribute Pattern — 20 realistic records) ─────────────────
  const customers = await Customer.insertMany([
    {
      name: 'Priya Nair', phoneNo: '+91-9876543210', email: 'priya.nair@gmail.com',
      belongsTo: org._id, inboxStatus: 'open', allowBroadcast: true,
      tags: [tagVIP._id, tagNewsletter._id], leadSource: 'website',
      followUp: daysAgo(-2), emailStatus: 'active',
      contactOwner: owner._id, createdBy: owner._id,
      attributes: [
        attr('city', 'Mumbai'), attr('state', 'Maharashtra'),
        attr('plan', 'pro'), attr('lead_score', 92),
        attr('loyalty_points', 3400), attr('last_purchase', daysAgo(5)),
        attr('signup_date', daysAgo(180)), attr('company', 'Nair Retail'),
        attr('industry', 'retail'), attr('designation', 'Owner'),
      ],
    },
    {
      name: 'Rohit Sharma', phoneNo: '+91-9123456780', email: 'rohit.sharma@outlook.com',
      belongsTo: org._id, inboxStatus: 'closed', allowBroadcast: true,
      tags: [tagLead._id], leadSource: 'referral',
      emailStatus: 'active', contactOwner: agent._id, createdBy: owner._id,
      attributes: [
        attr('city', 'Delhi'), attr('state', 'Delhi'),
        attr('plan', 'starter'), attr('lead_score', 74),
        attr('loyalty_points', 800), attr('last_purchase', daysAgo(20)),
        attr('signup_date', daysAgo(90)), attr('company', 'Sharma Pharma'),
        attr('industry', 'healthcare'), attr('designation', 'Manager'),
      ],
    },
    {
      name: 'Ananya Krishnan', phoneNo: '+91-9345671234', email: 'ananya.k@techwave.io',
      belongsTo: org._id, inboxStatus: 'in progress', allowBroadcast: true,
      tags: [tagNewsletter._id], leadSource: 'google_ads',
      emailStatus: 'active', contactOwner: owner._id, createdBy: owner._id,
      attributes: [
        attr('city', 'Bangalore'), attr('state', 'Karnataka'),
        attr('plan', 'enterprise'), attr('lead_score', 88),
        attr('loyalty_points', 5200), attr('last_purchase', daysAgo(2)),
        attr('signup_date', daysAgo(300)), attr('company', 'TechWave Solutions'),
        attr('industry', 'saas'), attr('designation', 'VP Engineering'),
      ],
    },
    {
      name: 'Vikram Patel', phoneNo: '+91-9087654321', email: 'vikram.patel@gmail.com',
      belongsTo: org._id, inboxStatus: 'closed', allowBroadcast: true,
      tags: [tagRisk._id, tagWin._id], leadSource: 'cold_outreach',
      emailStatus: 'active', followUp: daysAgo(-1),
      contactOwner: agent._id, createdBy: agent._id,
      attributes: [
        attr('city', 'Ahmedabad'), attr('state', 'Gujarat'),
        attr('plan', 'free'), attr('lead_score', 41),
        attr('loyalty_points', 120), attr('last_purchase', daysAgo(65)),
        attr('signup_date', daysAgo(120)), attr('company', 'Patel Traders'),
        attr('industry', 'retail'), attr('designation', 'Proprietor'),
      ],
    },
    {
      name: 'Sneha Reddy', phoneNo: '+91-9900112233', email: 'sneha.reddy@finserv.co',
      belongsTo: org._id, inboxStatus: 'open', allowBroadcast: true,
      tags: [tagVIP._id], leadSource: 'event',
      emailStatus: 'active', contactOwner: owner._id, createdBy: owner._id,
      attributes: [
        attr('city', 'Hyderabad'), attr('state', 'Telangana'),
        attr('plan', 'pro'), attr('lead_score', 85),
        attr('loyalty_points', 2100), attr('last_purchase', daysAgo(8)),
        attr('signup_date', daysAgo(200)), attr('company', 'FinServ Capital'),
        attr('industry', 'finance'), attr('designation', 'CFO'),
      ],
    },
    {
      name: 'Amit Joshi', phoneNo: '+91-9812345670', email: 'amit.joshi@edutrust.in',
      belongsTo: org._id, inboxStatus: 'closed', allowBroadcast: true,
      tags: [tagNewsletter._id, tagLead._id], leadSource: 'webinar',
      emailStatus: 'active', contactOwner: agent._id, createdBy: owner._id,
      attributes: [
        attr('city', 'Pune'), attr('state', 'Maharashtra'),
        attr('plan', 'starter'), attr('lead_score', 67),
        attr('loyalty_points', 450), attr('last_purchase', daysAgo(35)),
        attr('signup_date', daysAgo(60)), attr('company', 'EduTrust Academy'),
        attr('industry', 'education'), attr('designation', 'Director'),
      ],
    },
    {
      name: 'Kavya Menon', phoneNo: '+91-9654321098', email: 'kavya.menon@gmail.com',
      belongsTo: org._id, inboxStatus: 'closed', allowBroadcast: true,
      tags: [tagWin._id, tagRisk._id], leadSource: 'instagram',
      emailStatus: 'active', contactOwner: owner._id, createdBy: owner._id,
      attributes: [
        attr('city', 'Kochi'), attr('state', 'Kerala'),
        attr('plan', 'free'), attr('lead_score', 28),
        attr('loyalty_points', 50), attr('last_purchase', daysAgo(90)),
        attr('signup_date', daysAgo(150)), attr('company', 'Freelance'),
        attr('industry', 'retail'), attr('designation', 'Consultant'),
      ],
    },
    {
      name: 'Suresh Kumar', phoneNo: '+91-9741852963', email: 'suresh.k@globaltech.com',
      belongsTo: org._id, inboxStatus: 'open', allowBroadcast: true,
      tags: [tagVIP._id, tagLead._id], leadSource: 'linkedin',
      emailStatus: 'active', contactOwner: owner._id, createdBy: owner._id,
      attributes: [
        attr('city', 'Chennai'), attr('state', 'Tamil Nadu'),
        attr('plan', 'enterprise'), attr('lead_score', 95),
        attr('loyalty_points', 7800), attr('last_purchase', daysAgo(1)),
        attr('signup_date', daysAgo(400)), attr('company', 'GlobalTech Systems'),
        attr('industry', 'saas'), attr('designation', 'CTO'),
      ],
    },
    {
      name: 'Pooja Singhania', phoneNo: '+91-9321456789', email: 'pooja.s@medhub.in',
      belongsTo: org._id, inboxStatus: 'closed', allowBroadcast: true,
      tags: [tagNewsletter._id], leadSource: 'referral',
      emailStatus: 'active', contactOwner: agent._id, createdBy: agent._id,
      attributes: [
        attr('city', 'Jaipur'), attr('state', 'Rajasthan'),
        attr('plan', 'pro'), attr('lead_score', 73),
        attr('loyalty_points', 1600), attr('last_purchase', daysAgo(12)),
        attr('signup_date', daysAgo(220)), attr('company', 'MedHub Clinic'),
        attr('industry', 'healthcare'), attr('designation', 'Practice Manager'),
      ],
    },
    {
      name: 'Nikhil Agarwal', phoneNo: '+91-9876001234', email: 'nikhil.ag@startup.io',
      belongsTo: org._id, inboxStatus: 'in progress', allowBroadcast: true,
      tags: [tagLead._id], leadSource: 'google_ads',
      emailStatus: 'active', contactOwner: owner._id, createdBy: owner._id,
      attributes: [
        attr('city', 'Noida'), attr('state', 'Uttar Pradesh'),
        attr('plan', 'starter'), attr('lead_score', 59),
        attr('loyalty_points', 290), attr('last_purchase', daysAgo(28)),
        attr('signup_date', daysAgo(45)), attr('company', 'QuickLaunch Startup'),
        attr('industry', 'saas'), attr('designation', 'Founder'),
      ],
    },
    {
      name: 'Deepa Rao', phoneNo: '+91-9555000111', email: 'deepa.rao@brightlearn.edu',
      belongsTo: org._id, inboxStatus: 'closed', allowBroadcast: true,
      tags: [tagNewsletter._id, tagVIP._id], leadSource: 'partnership',
      emailStatus: 'active', contactOwner: agent._id, createdBy: owner._id,
      attributes: [
        attr('city', 'Mysore'), attr('state', 'Karnataka'),
        attr('plan', 'pro'), attr('lead_score', 81),
        attr('loyalty_points', 2900), attr('last_purchase', daysAgo(7)),
        attr('signup_date', daysAgo(260)), attr('company', 'BrightLearn Institute'),
        attr('industry', 'education'), attr('designation', 'Principal'),
      ],
    },
    // Unsubscribed / bounced examples
    {
      name: 'Raj Malhotra', phoneNo: '+91-9000000001', email: 'raj.m@example.com',
      belongsTo: org._id, inboxStatus: 'closed', allowBroadcast: false,
      tags: [], leadSource: 'cold_outreach',
      emailStatus: 'unsubscribed', unsubscribedAt: daysAgo(10),
      contactOwner: agent._id, createdBy: agent._id,
      attributes: [
        attr('city', 'Lucknow'), attr('state', 'Uttar Pradesh'),
        attr('plan', 'free'), attr('lead_score', 15),
      ],
    },
    {
      name: 'Meena Iyer', phoneNo: '+91-9000000002', email: 'meena.iyer@example.com',
      belongsTo: org._id, inboxStatus: 'closed', allowBroadcast: false,
      tags: [], leadSource: 'website',
      emailStatus: 'bounced', contactOwner: owner._id, createdBy: owner._id,
      attributes: [
        attr('city', 'Coimbatore'), attr('state', 'Tamil Nadu'),
        attr('plan', 'free'), attr('lead_score', 5),
      ],
    },
  ]);
  console.log(`✅ ${customers.length} customers seeded with attributes`);

  // ── Segments ──────────────────────────────────────────────────────────────
  const [segPro, segLead, segWinBack] = await Segment.insertMany([
    {
      name: 'Pro Plan Customers',
      organization: org._id,
      description: 'All customers on the Pro plan',
      conditions: [
        { field: 'attribute', operator: 'eq', attrKey: 'plan', valueType: 'str', value: 'pro' },
      ],
      cachedCount: 3,
      lastEvaluatedAt: new Date(),
      createdBy: owner._id,
    },
    {
      name: 'High Lead Score (>70)',
      organization: org._id,
      description: 'Leads with score above 70 — hot prospects',
      conditions: [
        { field: 'attribute', operator: 'gt', attrKey: 'lead_score', valueType: 'num', value: 70 },
      ],
      cachedCount: 6,
      lastEvaluatedAt: new Date(),
      createdBy: owner._id,
    },
    {
      name: 'Win-Back — Inactive 30+ Days',
      organization: org._id,
      description: 'Customers who haven\'t purchased in over 30 days',
      conditions: [
        { field: 'attribute', operator: 'lt', attrKey: 'last_purchase', valueType: 'date', value: daysAgo(30) },
      ],
      cachedCount: 4,
      lastEvaluatedAt: new Date(),
      createdBy: owner._id,
    },
  ]);

  // ── Email Templates ────────────────────────────────────────────────────────
  const [tWelcome, tWinBack, tPromo] = await EmailTemplate.insertMany([
    {
      name: 'Welcome Email',
      subject: 'Welcome to Stellar Commerce, {{customer.firstName}}! 🎉',
      preheader: 'Your journey starts here',
      category: 'transactional',
      organization: org._id,
      htmlContent: `<h1>Welcome, {{customer.firstName}}!</h1><p>We're glad you're here at {{org.name}}.</p>`,
      createdBy: owner._id,
      usedInCount: 1,
    },
    {
      name: 'Win-Back Campaign',
      subject: 'We miss you, {{customer.firstName}}! Here\'s 15% off',
      preheader: 'It\'s been a while — come back!',
      category: 'marketing',
      organization: org._id,
      htmlContent: `<h1>Hi {{customer.firstName}},</h1><p>It's been over 30 days since your last purchase from {{attr.company}}. Use code WINBACK15 for 15% off.</p>`,
      createdBy: owner._id,
      usedInCount: 1,
    },
    {
      name: 'Monthly Newsletter',
      subject: 'Stellar Commerce Monthly — {{attr.plan}} Plan Updates',
      preheader: 'Your monthly digest',
      category: 'newsletter',
      organization: org._id,
      htmlContent: `<h1>Monthly Update</h1><p>Hi {{customer.name}}, here's what's new at Stellar Commerce this month.</p>`,
      createdBy: owner._id,
      usedInCount: 1,
    },
  ]);

  // ── Campaigns ─────────────────────────────────────────────────────────────
  await Campaign.insertMany([
    {
      name: 'July Win-Back Campaign',
      organization: org._id,
      template: tWinBack._id,
      subject: 'We miss you! 15% off just for you',
      audienceType: 'segment',
      segment: segWinBack._id,
      status: 'sent',
      completedAt: daysAgo(3),
      stats: { total: 4, sent: 4, delivered: 4, opened: 2, uniqueOpens: 2, clicked: 1, uniqueClicks: 1, bounced: 0, failed: 0 },
      fromName: 'Stellar Commerce',
      fromEmail: 'noreply@stellarcommerce.in',
      utm: { source: 'email', medium: 'campaign', campaign: 'july-winback' },
      createdBy: owner._id,
    },
    {
      name: 'Pro Plan Newsletter — July 2025',
      organization: org._id,
      template: tPromo._id,
      subject: 'Your Pro Plan Monthly Update',
      audienceType: 'segment',
      segment: segPro._id,
      status: 'draft',
      stats: { total: 0, sent: 0, delivered: 0, opened: 0, uniqueOpens: 0, clicked: 0, uniqueClicks: 0, bounced: 0, failed: 0 },
      fromName: 'Stellar Commerce',
      fromEmail: 'noreply@stellarcommerce.in',
      utm: { source: 'email', medium: 'newsletter', campaign: 'pro-july-2025' },
      createdBy: owner._id,
    },
    {
      name: 'Hot Leads Outreach',
      organization: org._id,
      template: tWelcome._id,
      subject: 'Exclusive offer for our top prospects',
      audienceType: 'segment',
      segment: segLead._id,
      status: 'scheduled',
      scheduledAt: daysAgo(-2),  // 2 days in future
      stats: { total: 6, sent: 0, delivered: 0, opened: 0, uniqueOpens: 0, clicked: 0, uniqueClicks: 0, bounced: 0, failed: 0 },
      fromName: 'Aryan from Stellar Commerce',
      fromEmail: 'aryan@stellarcommerce.in',
      utm: { source: 'email', medium: 'outreach', campaign: 'hot-leads-q3' },
      createdBy: owner._id,
    },
  ]);

  console.log('✅ Templates, segments, campaigns seeded');
  console.log('\n═══════════════════════════════════════════════════');
  console.log('  Seed complete!');
  console.log('  Login: aryan@stellarcommerce.in / Admin@1234');
  console.log('  DB:   ', MONGO_URI);
  console.log('═══════════════════════════════════════════════════\n');

  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('❌ Seed failed:', err);
  mongoose.disconnect();
  process.exit(1);
});
