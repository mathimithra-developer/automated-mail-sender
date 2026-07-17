# Mail Sender — Enterprise Email Marketing & Automation Platform

An enterprise-grade, multi-tenant email campaign and automation application. Built with a high-performance **Node.js/Express** backend, a **MongoDB** data store using optimized indexing patterns, and a premium **Vanilla JavaScript/CSS** dashboard containing a drag-and-drop HTML email builder.

---

## 🏗️ Architecture & Technology Stack

### 1. Backend Core
- **Node.js & Express.js**: Handles API routes, session management, and auth filters.
- **Mongoose & MongoDB**: Database layer representing multi-tenant collections.
- **ZeptoMail Integration**: Integrated with Zoho's ZeptoMail service for high-volume, low-latency transactional and marketing dispatches.
- **Session Management**: Secure, cookie-based session management (`cookie-parser`) with bypass support for development sandboxing.

### 2. High-Performance Database Design (Mongoose)
To avoid standard MongoDB wildcard (`$**`) indexing bottlenecks and CPU spikes when querying dynamic user attributes (e.g. custom user fields like `lead_score`, `plan`, `city`), we implemented the **Customer Attribute Pattern**:
- Instead of adding arbitrary top-level fields to the Customer schema (which prevents indexed queries), dynamic fields are stored in an array:
  ```json
  "attributes": [
    { "k": "city", "v_str": "Mumbai" },
    { "k": "lead_score", "v_num": 92 }
  ]
  ```
- Three targeted compound indexes are used to cover all search criteria:
  - `belongsTo` + `attributes.k` + `attributes.v_str` (idx_attr_str)
  - `belongsTo` + `attributes.k` + `attributes.v_num` (idx_attr_num)
  - `belongsTo` + `attributes.k` + `attributes.v_date` (idx_attr_date)

### 3. Frontend Core
- **Single Page Application (SPA)**: Pure Vanilla JS (`app.js`, `pages.js`) and pure CSS (`style.css`), avoiding complex framework overhead.
- **Modern Responsive Layout**: Glassmorphism dark-theme with clean grid-based dashboard metrics.
- **Mail Builder Engine (`builder.js`)**: An advanced, responsive drag-and-drop editor allowing:
  - **Grid Layouts**: 1-column, 2-column, and 3-column wrappers.
  - **20+ Content Elements**: Headings, paragraphs, images, buttons, dividers, spacers, menus, tables, icons, ratings, videos.
  - **E-commerce Widgets**: Dynamic Product Cards, Coupons, live Countdown timers, dynamic QR codes, and interactive Emoji feedback polls.
  - **Enterprise Tools**: Direct AI generation, live spam checks, accessibility audits, version snapshot recovery, and inline comments.

---

## 🗄️ Database Schemas (MongoDB Collections)

1. **Organization**: Tenants on different tiers (`free`, `starter`, `pro`, `enterprise`).
2. **User**: Authentication profiles with roles (`OWNER`, `ADMIN`, `MEMBER`).
3. **OrgEmailSettings**: Scoped configurations containing SMTP or ESP details (e.g. Zepto API key).
4. **CustomField**: Definitions of tenant-level custom properties (key, label, type, options).
5. **Customer**: High-performance contact store using the *Attribute Pattern* + status states.
6. **Tag**: Scoped labels (e.g. "VIP", "At Risk") with color indicators.
7. **Segment**: Dynamic audience groups configured by logical rules matching attributes.
8. **EmailTemplate**: Holds the visual builder JSON structure along with compiled HTML output.
9. **VersionHistory**: Snapshots of template templates to allow easy recovery/rollback.
10. **Comment**: Collaboration comments pinned to specific canvas elements.
11. **Campaign**: Holds dispatches status (`draft`, `scheduled`, `sending`, `sent`), UTM details, and metrics logs.
12. **ABTest**: Compares Campaign A vs Campaign B split-performance metrics to declare a winner.
13. **SendLog**: Individual trace elements logging email delivery, opens, clicks, and bounces.
14. **Unsubscribe**: Globally recorded unsubscribes linking email, campaign, and source.

---

## 🚀 Key Integrations & APIs

### 📧 Zoho ZeptoMail Sending Engine
The sending mechanism handles high throughput by mapping merge tags (`{{customer.name}}`, `{{attr.city}}`) dynamically:
- Outbound campaigns are processed in chunked loops using a `120ms` delay to enforce rate limit friendliness.
- Custom headers are appended for compliance:
  - `List-Unsubscribe`: Points to the public unsubscription route `/unsubscribe?email=...&org=...`
  - Webhook mapping to trace individual message statuses (delivered, opened, clicked, bounced).

### 🤖 Google Gemini AI Engine
Integrates with Google Gemini APIs for:
1. **Email Layout Prompts**: Auto-generate complete table-based responsive HTML code directly on the builder canvas from a text prompt.
2. **Subject Line Ideas**: Analyzes builder HTML code to output 5 click-worthy variations.
3. **Spam Assessment**: Runs lexical checks to flag high-risk words and outputs an overall spam rating.
4. **Accessibility Audit**: Scans contrast issues, heading orders, and alt-tag presence.

---

## ⚙️ How It Is Implemented

1. **Routing**: `server.js` serves index pages, sets up protected Express API route modules, and handles the public unsubscription endpoint.
2. **Dynamic Dashboard Binding**: `pages.js` queries backend endpoints (`/api/customers`, `/api/campaigns`, `/api/abtests`, etc.) to fill metrics, search lists, and render UI cards.
3. **Visual Builder Render**: `builder.js` controls the builder workspace, manages structural JSON nodes (`sections[]` containing `columns[]` containing `components[]`), and supports live rendering, custom block savings, undo/redo states, and code exporters.
