import mongoose from 'mongoose';
const { Schema } = mongoose;

// ══════════════════════════════════════════════════════════════════════════════
// ORGANIZATION
// ══════════════════════════════════════════════════════════════════════════════
const organizationSchema = new Schema({
  name:    { type: String, required: true, trim: true },
  website: { type: String },
  logo:    { type: String },
  plan:    { type: String, enum: ['free', 'starter', 'pro', 'enterprise'], default: 'free' },
}, { timestamps: true });
export const Organization = mongoose.model('Organization', organizationSchema);

// ══════════════════════════════════════════════════════════════════════════════
// USER
// ══════════════════════════════════════════════════════════════════════════════
const userSchema = new Schema({
  name:         { type: String, required: true, trim: true },
  email:        { type: String, required: true, unique: true, trim: true, lowercase: true },
  password:     { type: String, required: true },
  role:         { type: String, enum: ['OWNER', 'ADMIN', 'MEMBER'], default: 'MEMBER' },
  organization: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  avatar:       { type: String },
  isActive:     { type: Boolean, default: true },
}, { timestamps: true });
export const User = mongoose.model('User', userSchema);

// ══════════════════════════════════════════════════════════════════════════════
// ORG EMAIL SETTINGS
// ══════════════════════════════════════════════════════════════════════════════
const orgEmailSettingsSchema = new Schema({
  organization: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  provider:     { type: String, enum: ['smtp', 'zepto', 'resend', 'postmark', 'sendgrid', 'mailgun'], default: 'zepto' },
  senderName:   { type: String, trim: true },
  senderEmail:  { type: String, trim: true, lowercase: true },
  replyTo:      { type: String, trim: true, lowercase: true },
  smtpHost: { type: String }, smtpPort: { type: Number },
  smtpUser: { type: String }, smtpPass: { type: String },
  apiKey:      { type: String },
  apiEndpoint: { type: String },
  webhookSecret: { type: String },
}, { timestamps: true });
export const OrgEmailSettings = mongoose.model('OrgEmailSettings', orgEmailSettingsSchema);

// ══════════════════════════════════════════════════════════════════════════════
// TAG
// ══════════════════════════════════════════════════════════════════════════════
const tagSchema = new Schema({
  name:         { type: String, required: true, trim: true },
  color:        { type: String, default: '#8b5cf6' },
  organization: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
}, { timestamps: true });
tagSchema.index({ organization: 1, name: 1 }, { unique: true });
export const Tag = mongoose.model('Tag', tagSchema);

// ══════════════════════════════════════════════════════════════════════════════
// CUSTOM FIELD DEFINITION
// ══════════════════════════════════════════════════════════════════════════════
const customFieldSchema = new Schema({
  name:           { type: String },
  hint:           { type: String },
  label:          { type: String, required: true },
  dataType:       { type: String, required: true, enum: ['text', 'email', 'phone-number', 'number', 'date', 'tags', 'select', 'multi-select', 'textarea', 'switch'] },
  isSystem:       { type: Boolean, default: false },
  isActive:       { type: Boolean, default: true },
  isMandatory:    { type: Boolean },
  acceptedValues: [{ type: String }],
  isIndexed:      { type: Boolean, default: false },
  belongsTo:      { type: Schema.Types.ObjectId, ref: 'Organization' },
  outletId:       { type: Schema.Types.ObjectId, ref: 'Outlet' },
  defaultValue:   { type: Schema.Types.Mixed },
  options:        [{ type: String }],
  createdAt:      { type: Date, default: Date.now },
  userDefine:     { type: Boolean, default: true },
});
customFieldSchema.index({ belongsTo: 1, name: 1 }, { unique: true });
export const CustomField = mongoose.model('CustomField', customFieldSchema);

// ══════════════════════════════════════════════════════════════════════════════
// CUSTOMER  (Attribute Pattern)
// ══════════════════════════════════════════════════════════════════════════════
const customerSchema = new Schema({
  name:    { type: String, required: [true, 'Name is required'], trim: true },
  phoneNo: { type: String, required: [true, 'Phone number is required'], trim: true },
  email:   { type: String, trim: true, lowercase: true },
  belongsTo: { type: Schema.Types.ObjectId, ref: 'Organization', required: [true, 'Organization is required'] },
  inboxStatus:    { type: String, default: 'closed', enum: ['open', 'closed', 'in progress'] },
  allowBroadcast: { type: Boolean, default: false },
  tags:           [{ type: Schema.Types.ObjectId, ref: 'Tag' }],
  responsive:     { type: Schema.Types.ObjectId, ref: 'User' },
  contactOwner:   { type: Schema.Types.ObjectId, ref: 'User' },
  leadSource:     { type: String },
  followUp:       { type: Date },
  emailStatus:    { type: String, enum: ['active', 'unsubscribed', 'bounced', 'complained'], default: 'active' },
  unsubscribedAt: { type: Date },
  attributes: [{
    _id:    false,
    k:      { type: String, required: true },
    v_str:  { type: String },
    v_num:  { type: Number },
    v_date: { type: Date },
  }],
  createdBy:     { type: Schema.Types.ObjectId, ref: 'User' },
  lastUpdatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, { strict: true, timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

customerSchema.index({ belongsTo: 1, inboxStatus: 1, updatedAt: -1 });
customerSchema.index({ phoneNo: 1 });
customerSchema.index({ belongsTo: 1, createdAt: -1 });
customerSchema.index({ belongsTo: 1, tags: 1 });
customerSchema.index({ belongsTo: 1, followUp: 1 });
customerSchema.index({ belongsTo: 1, responsive: 1, inboxStatus: 1 });
customerSchema.index({ belongsTo: 1, emailStatus: 1 });
customerSchema.index({ belongsTo: 1, 'attributes.k': 1, 'attributes.v_str': 1 }, { name: 'idx_attr_str' });
customerSchema.index({ belongsTo: 1, 'attributes.k': 1, 'attributes.v_num': 1 }, { name: 'idx_attr_num' });
customerSchema.index({ belongsTo: 1, 'attributes.k': 1, 'attributes.v_date': 1 }, { name: 'idx_attr_date' });
export const Customer = mongoose.model('Customer', customerSchema);

// ══════════════════════════════════════════════════════════════════════════════
// SEGMENT
// ══════════════════════════════════════════════════════════════════════════════
const segmentSchema = new Schema({
  name:         { type: String, required: true, trim: true },
  organization: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  description:  { type: String },
  conditions: [{
    _id:       false,
    field:     { type: String, required: true },
    operator:  { type: String, required: true },
    value:     { type: Schema.Types.Mixed },
    valueType: { type: String, enum: ['str', 'num', 'date'] },
    attrKey:   { type: String },
  }],
  cachedCount:     { type: Number, default: 0 },
  lastEvaluatedAt: { type: Date },
  createdBy:       { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });
segmentSchema.index({ organization: 1, createdAt: -1 });
export const Segment = mongoose.model('Segment', segmentSchema);

// ══════════════════════════════════════════════════════════════════════════════
// ASSET  (uploaded images, files)
// ══════════════════════════════════════════════════════════════════════════════
const assetSchema = new Schema({
  organization: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  filename:     { type: String, required: true },
  originalName: { type: String },
  url:          { type: String, required: true },
  mimeType:     { type: String },
  size:         { type: Number },
  uploadedBy:   { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });
assetSchema.index({ organization: 1, createdAt: -1 });
export const Asset = mongoose.model('Asset', assetSchema);

// ══════════════════════════════════════════════════════════════════════════════
// EMAIL TEMPLATE
// ══════════════════════════════════════════════════════════════════════════════
const emailTemplateSchema = new Schema({
  name:          { type: String, required: true, trim: true },
  subject:       { type: String },
  preheader:     { type: String },
  category:      { type: String, enum: ['marketing', 'transactional', 'newsletter', 'other'], default: 'marketing' },
  organization:  { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  jsonData:      { type: Schema.Types.Mixed },
  htmlContent:   { type: String },
  thumbnail:     { type: String },
  isPublic:      { type: Boolean, default: false },
  usedInCount:   { type: Number, default: 0 },
  aiPrompt:      { type: String },       // original prompt if AI-generated
  spamScore:     { type: Number },
  accessibilityScore: { type: Number },
  createdBy:     { type: Schema.Types.ObjectId, ref: 'User' },
  lastUpdatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });
emailTemplateSchema.index({ organization: 1, category: 1, createdAt: -1 });
export const EmailTemplate = mongoose.model('EmailTemplate', emailTemplateSchema);

// ══════════════════════════════════════════════════════════════════════════════
// VERSION HISTORY  (template snapshots)
// ══════════════════════════════════════════════════════════════════════════════
const versionHistorySchema = new Schema({
  template:     { type: Schema.Types.ObjectId, ref: 'EmailTemplate', required: true },
  organization: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  label:        { type: String, default: 'Auto-save' },
  snapshot:     { type: Schema.Types.Mixed, required: true },  // full jsonData snapshot
  htmlSnapshot: { type: String },
  createdBy:    { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });
versionHistorySchema.index({ template: 1, createdAt: -1 });
export const VersionHistory = mongoose.model('VersionHistory', versionHistorySchema);

// ══════════════════════════════════════════════════════════════════════════════
// COMMENT  (template collaboration comments)
// ══════════════════════════════════════════════════════════════════════════════
const commentSchema = new Schema({
  template:     { type: Schema.Types.ObjectId, ref: 'EmailTemplate', required: true },
  organization: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  author:       { type: Schema.Types.ObjectId, ref: 'User', required: true },
  text:         { type: String, required: true },
  resolved:     { type: Boolean, default: false },
  resolvedBy:   { type: Schema.Types.ObjectId, ref: 'User' },
  sectionId:    { type: String },  // which canvas element this comment refers to
  replies: [{
    _id:    false,
    author: { type: Schema.Types.ObjectId, ref: 'User' },
    text:   { type: String },
    createdAt: { type: Date, default: Date.now },
  }],
}, { timestamps: true });
commentSchema.index({ template: 1, resolved: 1, createdAt: -1 });
export const Comment = mongoose.model('Comment', commentSchema);

// ══════════════════════════════════════════════════════════════════════════════
// CAMPAIGN
// ══════════════════════════════════════════════════════════════════════════════
const campaignSchema = new Schema({
  name:         { type: String, required: true, trim: true },
  organization: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  template:     { type: Schema.Types.ObjectId, ref: 'EmailTemplate' },
  subject:      { type: String, required: true },
  preheader:    { type: String },
  fromName:     { type: String },
  fromEmail:    { type: String },
  replyTo:      { type: String },
  audienceType: { type: String, enum: ['segment', 'static', 'all'], default: 'segment' },
  segment:      { type: Schema.Types.ObjectId, ref: 'Segment' },
  staticList:   [{ type: Schema.Types.ObjectId, ref: 'Customer' }],
  status: { type: String, enum: ['draft', 'scheduled', 'sending', 'sent', 'paused', 'failed', 'cancelled'], default: 'draft' },
  scheduledAt:  { type: Date },
  startedAt:    { type: Date },
  completedAt:  { type: Date },
  isABTest:     { type: Boolean, default: false },
  abTestId:     { type: Schema.Types.ObjectId, ref: 'ABTest' },
  utm: {
    source:   { type: String, default: 'email' },
    medium:   { type: String, default: 'campaign' },
    campaign: { type: String },
  },
  stats: {
    total: { type: Number, default: 0 }, sent: { type: Number, default: 0 },
    delivered: { type: Number, default: 0 }, opened: { type: Number, default: 0 },
    uniqueOpens: { type: Number, default: 0 }, clicked: { type: Number, default: 0 },
    uniqueClicks: { type: Number, default: 0 }, bounced: { type: Number, default: 0 },
    complained: { type: Number, default: 0 }, unsubscribed: { type: Number, default: 0 },
    failed: { type: Number, default: 0 },
  },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });
campaignSchema.index({ organization: 1, status: 1, createdAt: -1 });
campaignSchema.index({ organization: 1, scheduledAt: 1 });
export const Campaign = mongoose.model('Campaign', campaignSchema);

// ══════════════════════════════════════════════════════════════════════════════
// A/B TEST
// ══════════════════════════════════════════════════════════════════════════════
const abTestSchema = new Schema({
  name:         { type: String, required: true, trim: true },
  organization: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  campaignA:    { type: Schema.Types.ObjectId, ref: 'Campaign', required: true },
  campaignB:    { type: Schema.Types.ObjectId, ref: 'Campaign', required: true },
  splitPercent: { type: Number, default: 50 },  // % going to variant A
  winnerMetric: { type: String, enum: ['open_rate', 'click_rate', 'revenue'], default: 'open_rate' },
  status:       { type: String, enum: ['running', 'completed', 'cancelled'], default: 'running' },
  winner:       { type: String, enum: ['A', 'B', 'tie'] },
  winnerCampaign: { type: Schema.Types.ObjectId, ref: 'Campaign' },
  decidedAt:    { type: Date },
  createdBy:    { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });
abTestSchema.index({ organization: 1, createdAt: -1 });
export const ABTest = mongoose.model('ABTest', abTestSchema);

// ══════════════════════════════════════════════════════════════════════════════
// SEND LOG
// ══════════════════════════════════════════════════════════════════════════════
const sendLogSchema = new Schema({
  campaign:      { type: Schema.Types.ObjectId, ref: 'Campaign', required: true },
  customer:      { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
  organization:  { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  email:         { type: String, required: true },
  messageId:     { type: String },
  status: { type: String, enum: ['queued','sent','delivered','opened','clicked','bounced','complained','failed','unsubscribed'], default: 'queued' },
  sentAt:        { type: Date },
  deliveredAt:   { type: Date },
  firstOpenedAt: { type: Date },
  lastOpenedAt:  { type: Date },
  openCount:     { type: Number, default: 0 },
  firstClickedAt:{ type: Date },
  clickCount:    { type: Number, default: 0 },
  bouncedAt:     { type: Date },
  bounceType:    { type: String, enum: ['hard', 'soft'] },
  complaintAt:   { type: Date },
  failureReason: { type: String },
  clicks: [{ _id: false, url: String, clickedAt: Date }],
}, { timestamps: true });
sendLogSchema.index({ campaign: 1, status: 1 });
sendLogSchema.index({ customer: 1, campaign: 1 });
sendLogSchema.index({ messageId: 1 });
sendLogSchema.index({ organization: 1, sentAt: -1 });
export const SendLog = mongoose.model('SendLog', sendLogSchema);

// ══════════════════════════════════════════════════════════════════════════════
// AUTOMATION
// ══════════════════════════════════════════════════════════════════════════════
const automationSchema = new Schema({
  name:         { type: String, required: true, trim: true },
  organization: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  isActive:     { type: Boolean, default: false },
  trigger: {
    type:    { type: String, enum: ['signup', 'tag_added', 'segment_entered', 'date_attribute', 'manual'] },
    tagId:   { type: Schema.Types.ObjectId, ref: 'Tag' },
    attrKey: { type: String },
  },
  steps: [{
    _id: false, order: { type: Number, required: true },
    stepType:  { type: String, enum: ['email', 'wait', 'tag', 'condition'], required: true },
    delayDays: { type: Number, default: 0 },
    template:  { type: Schema.Types.ObjectId, ref: 'EmailTemplate' },
    subject:   { type: String },
    tagAction: { type: String, enum: ['add', 'remove'] },
    tagId:     { type: Schema.Types.ObjectId, ref: 'Tag' },
    condition: { type: Schema.Types.Mixed },
  }],
  stats: { enrolled: { type: Number, default: 0 }, completed: { type: Number, default: 0 }, active: { type: Number, default: 0 } },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });
export const Automation = mongoose.model('Automation', automationSchema);

// ══════════════════════════════════════════════════════════════════════════════
// UNSUBSCRIBE
// ══════════════════════════════════════════════════════════════════════════════
const unsubscribeSchema = new Schema({
  email:        { type: String, required: true, lowercase: true, trim: true },
  organization: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  customer:     { type: Schema.Types.ObjectId, ref: 'Customer' },
  campaign:     { type: Schema.Types.ObjectId, ref: 'Campaign' },
  reason:       { type: String },
  source:       { type: String, enum: ['link', 'complaint', 'manual', 'bounce'], default: 'link' },
}, { timestamps: true });
unsubscribeSchema.index({ organization: 1, email: 1 }, { unique: true });
export const Unsubscribe = mongoose.model('Unsubscribe', unsubscribeSchema);
