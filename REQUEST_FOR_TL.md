# Request for Infrastructure Credentials & Keys: Mail Sender Project

Hi [TL Name],

I have successfully completed scaffolding and integration testing for our automated HTML email sender application. The project is structured as a full-stack JavaScript application utilizing a **Node.js/Express.js backend** and a **Vanilla HTML/CSS/JS frontend** (with a premium, responsive dark-themed dashboard).

To run this in staging/production, we need database credentials, ESP keys, and AI configuration keys.

Could you please provide the following details?

---

## 1. MongoDB Connection String (Mongoose)
We transitioned the database layer from PostgreSQL to **MongoDB/Mongoose** to accommodate dynamic custom fields without wildcard schema indexing performance hits.
- **Requested:** MongoDB connection URL (Dev / Staging).
- **Indexing Pattern:** We have implemented the **Customer Attribute Pattern** to optimize queries and CPU overhead (using 3 targeted compound indexes instead of `$**` wildcard search).
- **Format example:** `mongodb://USER:PASSWORD@HOST:27017/mailsender?authSource=admin`

## 2. ZeptoMail API Sending Key & Domain Configuration
Our email dispatch engine uses **ZeptoMail by Zoho** to deliver campaigns.
- **Requested:** A Send Mail Token from ZeptoMail.
- **Where to locate:** ZeptoMail Dashboard → Mail Agents → Select Agent → Send Mail Token.
- **Verified Sending Domain:** (e.g. `stellarcommerce.in` or `yourdomain.com`).
- **Default From Address:** [e.g., `noreply@yourdomain.com`]
- **Default Reply-To Address:** [e.g., `support@yourdomain.com`]

## 3. Google Gemini API Key (AI Content Features)
The email builder features advanced AI tools (generating emails from prompts, spam analysis, subject line generation, and accessibility audits).
- **Requested:** An API Key for Google Gemini (e.g. Gemini 1.5 Flash).
- **Where to locate:** Google AI Studio (makersuite) Developer Key.

## 4. Compliance Physical Address (CAN-SPAM/GDPR compliance)
Every outgoing email footer must programmatically include our physical mailing address to comply with email delivery regulations.
- **Requested:** Corporate physical address to register in defaults.

---

## Technical Structure Summary (For Context)

Here is a quick overview of what is implemented and fully operational:
- **Database Collections:** `organizations`, `users`, `orgemailsettings`, `customfields`, `customers` (Attribute Pattern), `tags`, `segments`, `emailtemplates`, `versionhistories`, `comments` (thread-based template notes), `campaigns` (stats aggregation), `abtests` (open-rate comparison), `sendlogs`, `unsubscribes`.
- **Builder Engine:** Supports 20+ drag-and-drop elements including Headings, Social links, Raw HTML blocks, E-commerce Product Cards, Coupons, live Countdown timers, dynamic QR codes, and Rating Polls.
- **Autosave & History:** Supports local drafts, undo/redo states, global themes, and full version history snapshot restoring.
- **Webhook Webhook Tracking:** Built `routes/campaigns.js` webhook handler to listen to Zepto's delivery notifications and update campaign statistics in real-time (opens, clicks, bounces, unsubscribes).

Thank you! Let me know if you need any walkthrough of the codebase or setup.

Best regards,  
[Your Name]
