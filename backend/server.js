import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { Country, State } from "country-state-city";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// Ensure .env is loaded from workspace root even if process started from backend/
dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config();

import { connectDB } from "./lib/db.js";
import { User, Organization, OrgEmailSettings, Customer, Unsubscribe, EmailTemplate, CustomField } from "./lib/models.js";
import { hashPassword, verifyPassword } from "./lib/hash.js";
import { sessionMiddleware, setSessionCookie, clearSessionCookie } from "./lib/session.js";
import { getDefaultTemplates } from "./lib/defaultTemplates.js";
import { startCampaignScheduler } from "./lib/scheduler.js";

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
import whatsappRoutes      from "./routes/whatsapp.js";


const app  = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));
app.use(cookieParser());
app.use(sessionMiddleware);
app.use(express.static(path.join(__dirname, "../frontend")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ── Auth guard ────────────────────────────────────────────────────────────────
// SECURITY NOTE: The ?bypass=true mechanism is strictly a development convenience
// and is completely disabled when NODE_ENV=production. Set NODE_ENV=production in
// your deployment environment to ensure this path is never reachable in production.
async function requireAuth(req, res, next) {
  if (req.session?.userId) {
    try {
      const orgExists = req.session.orgId ? await Organization.exists({ _id: req.session.orgId }) : null;
      if (orgExists) return next();

      // If orgId from session does not exist (e.g. server restarted and DB reseeded), auto-repair session to seeded default org/user
      const devUser = (await User.findOne({ email: req.session.email }).populate('organization')) || (await User.findOne().populate('organization'));
      if (devUser && devUser.organization) {
        const sessionData = {
          userId:   devUser._id.toString(),
          orgId:    devUser.organization._id.toString(),
          email:    devUser.email,
          role:     devUser.role,
          userName: devUser.name,
          orgName:  devUser.organization.name,
          orgIndustry: devUser.organization.industry || 'Other',
        };
        req.session = sessionData;
        setSessionCookie(res, sessionData);
        return next();
      }
    } catch (e) {
      // Fallthrough to standard logic
    }
  }

  // Dev-only auto-login: in development mode, automatically grant access as seeded dev user if unauthenticated
  if (process.env.NODE_ENV !== 'production') {
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
        orgIndustry: devUser.organization.industry || 'Other',
      } : {
        userId: '603dc5c9bd4b4f45a47197d1', orgId: '603dc5c9bd4b4f45a47197d0',
        email: 'aryan@stellarcommerce.in', role: 'OWNER', userName: 'Aryan Mehta', orgName: 'Stellar Commerce', orgIndustry: 'Technology',
      };

      req.session = sessionData;
      setSessionCookie(res, sessionData);
      return next();
    } catch (err) {
      const sessionData = {
        userId: '603dc5c9bd4b4f45a47197d1', orgId: '603dc5c9bd4b4f45a47197d0',
        email: 'aryan@stellarcommerce.in', role: 'OWNER', userName: 'Aryan Mehta', orgName: 'Stellar Commerce', orgIndustry: 'Technology',
      };
      req.session = sessionData;
      setSessionCookie(res, sessionData);
      return next();
    }
  }

  res.status(401).json({ error: 'Unauthorized' });
}

// ── Country and State API ──────────────────────────────────────────────────────
app.get("/api/countries", (req, res) => {
  try {
    const countries = Country.getAllCountries().map(c => ({
      code: c.isoCode,
      name: c.name,
      phonecode: c.phonecode
    }));
    res.json(countries);
  } catch (err) {
    res.status(500).json({ error: "Failed to load countries" });
  }
});

app.get("/api/states/:countryCode", (req, res) => {
  try {
    const { countryCode } = req.params;
    const states = State.getStatesOfCountry(countryCode).map(s => ({
      code: s.isoCode,
      name: s.name
    }));
    res.json(states);
  } catch (err) {
    res.status(500).json({ error: "Failed to load states" });
  }
});

// ── Auth Endpoints ────────────────────────────────────────────────────────────
app.post("/api/auth/signup", async (req, res) => {
  const { name, email, password, orgName, logo, location, website, industry, branches } = req.body;
  if (!orgName || !name || !email || !password)
    return res.status(400).json({ error: "Name, email, password and organization name are required" });
  try {
    if (await User.findOne({ email }))
      return res.status(400).json({ error: "Email already registered" });

    const org = await Organization.create({
      name: orgName,
      logo:     logo     || '',
      website:  website  || '',
      industry: industry || '',
      location: location || {},
      branches: Array.isArray(branches) ? branches : [],
    });

    const user = await User.create({
      name, email,
      password: hashPassword(password),
      role: "OWNER",
      organization: org._id,
    });

    await OrgEmailSettings.create({
      organization: org._id,
      senderName: name,
      senderEmail: email,
      replyTo: email,
    });

    // Preload professional organization-related templates
    try {
      const templates = getDefaultTemplates(org._id, org.name, user._id);
      await EmailTemplate.insertMany(templates);
    } catch (tplErr) {
      console.error("Failed to seed default templates on signup:", tplErr);
      // Non-blocking error, allow signup to complete
    }

    // Seed default custom fields for new organization
    try {
      const defaultFields = [
        { belongsTo: org._id, name: 'city',        label: 'City',        dataType: 'text',    userDefine: true },
        { belongsTo: org._id, name: 'plan',        label: 'Plan',        dataType: 'text',    userDefine: true },
        { belongsTo: org._id, name: 'lead_score',  label: 'Lead Score',  dataType: 'number',  userDefine: true },
        { belongsTo: org._id, name: 'company',     label: 'Company',     dataType: 'text',    userDefine: true },
        { belongsTo: org._id, name: 'industry',    label: 'Industry',    dataType: 'text',    userDefine: true },
        { belongsTo: org._id, name: 'signup_date', label: 'Signup Date', dataType: 'date',    userDefine: true },
        { belongsTo: org._id, name: 'tags',        label: 'Tags',        dataType: 'text',    userDefine: true },
      ];
      await CustomField.insertMany(defaultFields);
    } catch (cfErr) {
      console.error("Failed to seed default custom fields on signup:", cfErr);
    }

    setSessionCookie(res, {
      userId:   user._id.toString(),
      orgId:    org._id.toString(),
      email:    user.email,
      role:     user.role,
      userName: user.name,
      orgName:  org.name,
      orgIndustry: org.industry || 'Other',
    });

    res.json({ success: true, user: { name: user.name, email: user.email } });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Failed to sign up. " + err.message });
  }
});


app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email and password required" });
  try {
    const user = await User.findOne({ email }).populate("organization");
    if (!user || !verifyPassword(password, user.password))
      return res.status(400).json({ error: "Invalid email or password" });
    setSessionCookie(res, { userId: user._id.toString(), orgId: user.organization._id.toString(), email: user.email, role: user.role, userName: user.name, orgName: user.organization.name, orgIndustry: user.organization.industry || 'Other' });
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

    const [
      customers,
      campaigns,
      templates,
      segments,
      abtests,
      activeCustomers,
      unsubscribed,
      totalSent,
      totalOpened,
      totalClicked
    ] = await Promise.all([
      Customer.countDocuments({ belongsTo: orgId }),
      Campaign.countDocuments({ organization: orgId }),
      EmailTemplate.countDocuments({ organization: orgId }),
      Segment.countDocuments({ organization: orgId }),
      ABTest.countDocuments({ organization: orgId }),
      Customer.countDocuments({ belongsTo: orgId, emailStatus: { $ne: 'unsubscribed' } }),
      Customer.countDocuments({ belongsTo: orgId, emailStatus: 'unsubscribed' }),
      SendLog.countDocuments({ organization: orgId }),
      SendLog.countDocuments({ organization: orgId, openedAt: { $ne: null } }),
      SendLog.countDocuments({ organization: orgId, clickedAt: { $ne: null } }),
    ]);

    const openRate  = totalSent ? Math.round((totalOpened  / totalSent) * 100) : 0;
    const clickRate = totalSent ? Math.round((totalClicked / totalSent) * 100) : 0;

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
      stats: {
        customers,
        campaigns,
        templates,
        segments,
        abtests,
        activeCustomers,
        unsubscribed,
        totalSent,
        totalOpened,
        totalClicked,
        openRate,
        clickRate
      },
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
app.use("/api/whatsapp",     requireAuth, whatsappRoutes);
app.use("/apis/v1",          requireAuth, whatsappRoutes);
// Collaboration — nested under templates
app.use("/api/templates",  requireAuth, collaborationRoutes);
// Public webhook (no auth)
app.use("/api/campaigns/webhook", campaignRoutes);

// ── Public unsubscribe ────────────────────────────────────────────────────────
// Org-scoped: only updates the customer record belonging to the org that sent
// the campaign, preventing cross-tenant unsubscribes when the same email exists
// in multiple organizations.
app.get("/unsubscribe", async (req, res) => {
  const { email, org, campaign } = req.query;
  if (!email || !org) return res.status(400).send('Invalid link');
  try {
    await Customer.findOneAndUpdate(
      { email: email.toLowerCase(), belongsTo: org },
      { emailStatus: 'unsubscribed', unsubscribedAt: new Date(), allowBroadcast: false }
    );
    await Unsubscribe.findOneAndUpdate(
      { email: email.toLowerCase(), organization: org },
      { email: email.toLowerCase(), organization: org, campaign, source: 'link' },
      { upsert: true }
    );
    res.send('<h2 style="font-family:sans-serif;text-align:center;margin-top:60px;color:#10b981">✅ Unsubscribed successfully.</h2><p style="text-align:center;font-family:sans-serif;color:#71717a">You will no longer receive emails from this sender.</p>');
  } catch (err) { res.status(500).send('Error'); }
});

// ── HTML Pages ────────────────────────────────────────────────────────────────
app.get("/login",      (req, res) => { if (req.session) return res.redirect("/dashboard"); res.sendFile(path.join(__dirname, "../frontend", "login.html")); });
app.get("/signup",     (req, res) => { if (req.session) return res.redirect("/dashboard"); res.sendFile(path.join(__dirname, "../frontend", "signup.html")); });
// Dev-only: allow ?bypass=true to serve the dashboard HTML without a session cookie
// (the API requireAuth still blocks in production). In production the bypass check
// below never passes because the condition mirrors requireAuth's guard.
app.get("/dashboard*", (req, res) => {
  const bypassAllowed = process.env.NODE_ENV !== 'production' && req.query.bypass === 'true';
  if (!req.session && !bypassAllowed) return res.redirect("/login");
  res.sendFile(path.join(__dirname, "../frontend", "index.html"));
});
app.get("/",           (req, res) => res.redirect(req.session ? "/dashboard" : "/login"));

async function runAsyncCustomerMigration() {
  try {
    const { Customer } = await import('./lib/models.js');
    const placeholderCustomers = await Customer.find({
      $or: [
        { name: 'Unknown' },
        { phoneNo: '0000000000' },
        { email: { $in: [null, ''] } }
      ]
    }).select('_id name phoneNo email attributes').lean();

    if (!placeholderCustomers || placeholderCustomers.length === 0) return;

    const bulkOps = [];
    for (const c of placeholderCustomers) {
      const attrName = c.attributes?.find(a => a.k.toLowerCase() === 'customername' || a.k.toLowerCase() === 'name')?.v_str;
      const attrPhone = c.attributes?.find(a => a.k.toLowerCase() === 'customerphone' || a.k.toLowerCase() === 'phone')?.v_num ||
                        c.attributes?.find(a => a.k.toLowerCase() === 'customerphone' || a.k.toLowerCase() === 'phone')?.v_str;
      const attrEmail = c.attributes?.find(a => a.k.toLowerCase() === 'customeremail' || a.k.toLowerCase() === 'email')?.v_str;

      const updateFields = {};
      if (attrName && c.name === 'Unknown') updateFields.name = attrName.trim();
      if (attrPhone && c.phoneNo === '0000000000') updateFields.phoneNo = String(attrPhone).trim();
      if (attrEmail && (!c.email || c.email === '')) updateFields.email = attrEmail.trim().toLowerCase();

      if (Object.keys(updateFields).length > 0) {
        bulkOps.push({
          updateOne: {
            filter: { _id: c._id },
            update: { $set: updateFields }
          }
        });
      }
    }

    if (bulkOps.length > 0) {
      const chunkSize = 500;
      for (let i = 0; i < bulkOps.length; i += chunkSize) {
        const chunk = bulkOps.slice(i, i + chunkSize);
        await Customer.bulkWrite(chunk, { ordered: false });
      }
      console.log(`✅ Restored fields for ${bulkOps.length} customers via fast bulkWrite`);
    }
  } catch (migErr) {
    console.error('Migration notice:', migErr.message);
  }
}

connectDB().then(() => {
  startCampaignScheduler();

  const server = app.listen(PORT, () => {
    console.log(`🚀 Mail Sender running at http://localhost:${PORT}`);
    setTimeout(runAsyncCustomerMigration, 100);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`\n❌ PORT ${PORT} IS ALREADY IN USE!`);
      console.error(`👉 Another process is running on port ${PORT}. Run 'Stop-Process -Name node -Force' to kill it.\n`);
      process.exit(1);
    } else {
      console.error('Server error:', err);
    }
  });
});

