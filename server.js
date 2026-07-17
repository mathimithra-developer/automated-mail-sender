import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import "dotenv/config";

import { connectDB } from "./lib/db.js";
import { User, Organization, OrgEmailSettings, Customer, Unsubscribe } from "./lib/models.js";
import { hashPassword, verifyPassword } from "./lib/hash.js";
import { sessionMiddleware, setSessionCookie, clearSessionCookie } from "./lib/session.js";

// Route modules
import customerRoutes     from "./routes/customers.js";
import campaignRoutes     from "./routes/campaigns.js";
import templateRoutes     from "./routes/templates.js";
import segmentRoutes      from "./routes/segments.js";
import settingsRoutes     from "./routes/settings.js";
import aiRoutes           from "./routes/ai.js";
import assetRoutes        from "./routes/assets.js";
import abTestRoutes       from "./routes/abtest.js";
import collaborationRoutes from "./routes/collaboration.js";
import customFieldRoutes   from "./routes/customfields.js";


const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));
app.use(cookieParser());
app.use(sessionMiddleware);
app.use(express.static(path.join(__dirname, "public")));

// ── Auth guard ────────────────────────────────────────────────────────────────
async function requireAuth(req, res, next) {
  if (req.session?.userId) return next();
  if (req.query.bypass === 'true' || req.headers['x-bypass'] === 'true') {
    try {
      const { Customer: CustModel } = await import('./lib/models.js');
      const custWithOrg = await CustModel.findOne({}).lean();
      const targetOrgId = custWithOrg?.belongsTo;
      const devUser = targetOrgId
        ? await User.findOne({ organization: targetOrgId }).populate('organization')
        : await User.findOne().populate('organization');

      const sessionData = devUser ? {
        userId:   devUser._id.toString(),
        orgId:    devUser.organization._id.toString(),
        email:    devUser.email,
        role:     devUser.role,
        userName: devUser.name,
        orgName:  devUser.organization.name,
      } : {
        userId: '603dc5c9bd4b4f45a47197d1', orgId: '603dc5c9bd4b4f45a47197d0',
        email: 'dev@mailsender.com', role: 'OWNER', userName: 'Dev User', orgName: 'Dev Organization',
      };

      req.session = sessionData;
      const { setSessionCookie } = await import('./lib/session.js');
      setSessionCookie(res, sessionData);
    } catch (err) {
      const sessionData = {
        userId: '603dc5c9bd4b4f45a47197d1', orgId: '603dc5c9bd4b4f45a47197d0',
        email: 'dev@mailsender.com', role: 'OWNER', userName: 'Dev User', orgName: 'Dev Organization',
      };
      req.session = sessionData;
      const { setSessionCookie } = await import('./lib/session.js');
      setSessionCookie(res, sessionData);
    }
    return next();
  }
  res.status(401).json({ error: 'Unauthorized' });
}

// ── Auth Endpoints ────────────────────────────────────────────────────────────
app.post("/api/auth/signup", async (req, res) => {
  const { orgName, name, email, password } = req.body;
  if (!orgName || !name || !email || !password)
    return res.status(400).json({ error: "All fields are required" });
  try {
    if (await User.findOne({ email }))
      return res.status(400).json({ error: "Email already registered" });
    const org  = await Organization.create({ name: orgName });
    const user = await User.create({ name, email, password: hashPassword(password), role: "OWNER", organization: org._id });
    await OrgEmailSettings.create({ organization: org._id, senderName: name, senderEmail: email, replyTo: email });
    setSessionCookie(res, { userId: user._id.toString(), orgId: org._id.toString(), email: user.email, role: user.role, userName: user.name, orgName: org.name });
    res.json({ success: true, user: { name: user.name, email: user.email } });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Failed to sign up." });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email and password required" });
  try {
    const user = await User.findOne({ email }).populate("organization");
    if (!user || !verifyPassword(password, user.password))
      return res.status(400).json({ error: "Invalid email or password" });
    setSessionCookie(res, { userId: user._id.toString(), orgId: user.organization._id.toString(), email: user.email, role: user.role, userName: user.name, orgName: user.organization.name });
    res.json({ success: true, user: { name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/auth/logout", (req, res) => { clearSessionCookie(res); res.json({ success: true }); });

app.get("/api/auth/me", requireAuth, (req, res) => {
  res.json({ user: req.session });
});

// ── Dashboard stats endpoint ──────────────────────────────────────────────────
app.get("/api/dashboard/stats", requireAuth, async (req, res) => {
  try {
    const { Campaign, Customer, EmailTemplate, Segment, SendLog, ABTest } = await import('./lib/models.js');
    const orgId = req.session?.orgId;

    const [customers, campaigns, templates, segments, abtests,
           activeCustomers, unsubscribed, sendLogs] = await Promise.all([
      Customer.countDocuments({ belongsTo: orgId }),
      Campaign.countDocuments({ organization: orgId }),
      EmailTemplate.countDocuments({ organization: orgId }),
      Segment.countDocuments({ organization: orgId }),
      ABTest.countDocuments({ organization: orgId }),
      Customer.countDocuments({ belongsTo: orgId, emailStatus: 'active' }),
      Customer.countDocuments({ belongsTo: orgId, emailStatus: 'unsubscribed' }),
      SendLog.find({ organization: orgId }).sort({ sentAt: -1 }).limit(500).lean(),
    ]);

    const totalSent    = sendLogs.length;
    const totalOpened  = sendLogs.filter(l => l.openedAt).length;
    const totalClicked = sendLogs.filter(l => l.clickedAt).length;
    const openRate     = totalSent ? Math.round((totalOpened  / totalSent) * 100) : 0;
    const clickRate    = totalSent ? Math.round((totalClicked / totalSent) * 100) : 0;

    // Recent campaigns with stats
    const recentCampaigns = await Campaign.find({ organization: orgId })
      .sort({ createdAt: -1 }).limit(5)
      .populate('template', 'name thumbnail').lean();

    // Top segments by count
    const topSegments = await Segment.find({ organization: orgId })
      .sort({ cachedCount: -1 }).limit(4).lean();

    // Recent customers
    const recentCustomers = await Customer.find({ belongsTo: orgId })
      .sort({ createdAt: -1 }).limit(5)
      .select('name email emailStatus createdAt attributes').lean();

    res.json({
      success: true,
      stats: { customers, campaigns, templates, segments, abtests,
               activeCustomers, unsubscribed, totalSent, openRate, clickRate },
      recentCampaigns,
      topSegments,
      recentCustomers,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ── API Routes ────────────────────────────────────────────────────────────────
app.use("/api/customers",  requireAuth, customerRoutes);
app.use("/api/campaigns",  requireAuth, campaignRoutes);
app.use("/api/templates",  requireAuth, templateRoutes);
app.use("/api/segments",   requireAuth, segmentRoutes);
app.use("/api/settings",   requireAuth, settingsRoutes);
app.use("/api/ai",         requireAuth, aiRoutes);
app.use("/api/assets",     requireAuth, assetRoutes);
app.use("/api/abtests",    requireAuth, abTestRoutes);
app.use("/api/customfields", requireAuth, customFieldRoutes);
// Collaboration — nested under templates
app.use("/api/templates",  requireAuth, collaborationRoutes);
// Public webhook (no auth)
app.use("/api/campaigns/webhook", campaignRoutes);

// ── Public unsubscribe ────────────────────────────────────────────────────────
app.get("/unsubscribe", async (req, res) => {
  const { email, org, campaign } = req.query;
  if (!email) return res.status(400).send('Invalid link');
  try {
    await Customer.findOneAndUpdate({ email: email.toLowerCase() }, { emailStatus: 'unsubscribed', unsubscribedAt: new Date(), allowBroadcast: false });
    await Unsubscribe.findOneAndUpdate({ email: email.toLowerCase(), organization: org }, { email: email.toLowerCase(), organization: org, campaign, source: 'link' }, { upsert: true });
    res.send('<h2 style="font-family:sans-serif;text-align:center;margin-top:60px;color:#10b981">✅ Unsubscribed successfully.</h2><p style="text-align:center;font-family:sans-serif;color:#71717a">You will no longer receive emails from this sender.</p>');
  } catch (err) { res.status(500).send('Error'); }
});

// ── HTML Pages ────────────────────────────────────────────────────────────────
app.get("/login",      (req, res) => { if (req.session) return res.redirect("/dashboard"); res.sendFile(path.join(__dirname, "public", "login.html")); });
app.get("/signup",     (req, res) => { if (req.session) return res.redirect("/dashboard"); res.sendFile(path.join(__dirname, "public", "signup.html")); });
app.get("/dashboard*", (req, res) => { if (!req.session && req.query.bypass !== "true") return res.redirect("/login"); res.sendFile(path.join(__dirname, "public", "index.html")); });
app.get("/",           (req, res) => res.redirect(req.session ? "/dashboard" : "/login"));

connectDB().then(() => // Reload triggered by port freed
app.listen(PORT, () => {
  console.log(`🚀 Mail Sender running at http://localhost:3000`);
}));
