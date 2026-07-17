# Modern Email Builder Architecture Specification

This document defines the architectural specifications, component properties, JSON model, and implementation roadmap for the **Mail Sender's Visual Email Builder**.

---

## 1. Structural Component Types

The builder follows a hierarchical layout structure:
`Email` ➔ `Sections` ➔ `Containers` ➔ `Columns` ➔ `Content Blocks`.

### A. Layout Blocks
- **Section (Highest-Level Container):**
  - *Hierarchy:* Email ➔ Section ➔ Container ➔ Background.
  - *Properties:* Background Color, Background Image, Padding, Margin, Width, Border, Border Radius, Responsive Visibility (Hide on Mobile/Desktop).
- **Container (Component Grouper):**
  - *Hierarchy:* Section ➔ Container ➔ Columns.
  - *Features:* Flex Layout, Content Alignment, Max Width, Responsive Stacking, Layout Gap.
- **Columns (Responsive Grid):**
  - *Grids:* 50%/50% | 33%/33%/33% | 25%/75% | etc.
  - *Responsiveness:* Stacks vertically on mobile devices (e.g., Desktop: Image | Text ➔ Mobile: Image on top of Text).

---

## 2. Content & Media Blocks

Core components draggable or insertable within columns:

- **Heading:**
  - *Properties:* Text content, Font Family, Font Size, Font Weight, Color, Alignment, Letter Spacing, Line Height, Tag Level (H1-H6).
  - *Personalization:* Supports merge tag interpolation (e.g., `Hello {{first_name}}`).
- **Text (Rich Text Editor):**
  - *Features:* Rich formatting (Bold, Italic, lists, links, emojis), AI Rewriter helper, and merge tags.
- **Button:**
  - *Properties:* Label, Target URL (supports `https://`, `mailto:`, `tel:`, `sms:`, `whatsapp:`, or mobile deep links), Analytics tracking parameters, Border Radius, Shadow, Hover states, Alignment.
- **Image:**
  - *Features:* Alt Text, Target Link, Rounded corners, Crop/Resize/Compression helpers, CDN delivery, and AI Banners generator.
- **Divider:**
  - *Properties:* Thickness, Padding, Styling (Solid, Dashed, or Gradient colors).
- **Spacer:**
  - *Properties:* Height (e.g. 20px, 40px, 60px).
- **Icons:** Custom SVGs or library icon insertion.
- **Social Links:** Presets for Facebook, Instagram, LinkedIn, YouTube, WhatsApp, Twitter, Telegram.
- **QR Code:** Dynamically generated image for links, payments, or WhatsApp actions.
- **Video Thumbnail:** Emulates video in email clients using a Thumbnail Image overlaid with a "Play (▶)" button that links out to a web video player.
- **HTML Block:** Raw HTML input for custom structures, charts, or tracking scripts.

---

## 3. Dynamic & Personalization Layer

Engineered to bind database queries and runtime customer properties to the email template:

- **Merge Tags:**
  - *Context:* Dynamic customer details (`{{customer.name}}`, `{{email}}`, `{{phone}}`) or transaction details (`{{order.id}}`, `{{invoice.total}}`). Includes editor autocompletion.
- **Conditional Block (IF/ELSE logic):**
  - *Logic:* `IF Country == India SHOW UPI_Button ELSE SHOW Credit_Card_Button`.
- **Repeat Block (FOR EACH loop):**
  - *Logic:* `FOR EACH Product IN Order CREATE Product_Card` (essential for transactional invoices/receipts).
- **AI Blocks:**
  - *Inputs:* Prompts to write copy, recommend layouts, optimize Subject/Preview lines, or auto-create email sections.
- **Dynamic Recommendations:**
  - *Queries:* Personalized grids displaying "Recommended Products", "Recently Viewed", or "Wishlists".

---

## 4. Commerce & Commerce Blocks

Specialized layout blocks for email transactions:

- **Product Card:** Product image, title, price, description, and direct purchase call-to-action button.
- **Product Grid:** Auto-responsive columns hosting 2, 3, or 4 Product Cards side-by-side.
- **Coupon:** Stylized discount banner (e.g. `20% OFF`) featuring a code (e.g. `SAVE20`) and a quick copy-to-clipboard action.
- **Order Summary / Invoice:** Grid summarizing item lists, quantities, taxes, shipping, and totals.

---

## 5. Advanced Interactive Components

- **Countdown Timer:** Live animated GIF generating dynamic timers (e.g. "3 Days Left") representing expiration intervals.
- **Rating:** Intersecting 5-star scales where each star represents a distinct feedback capture link.
- **Polls / Surveys:** Inline feedback capture (e.g. emoji scales: 😀, 😐, 😞) linking directly to tracking endpoints.
- **AMP Blocks:** Interactive components (Accordion, Carousel, forms) with strict standard HTML fallbacks.

---

## 6. Email Builder JSON Model

When saved or compiled, the entire template state is serialized as a structured JSON object:

```json
{
  "email": {
    "version": "1.0",
    "metadata": {
      "name": "Product Launch Campaign",
      "author": "Marketing Team",
      "description": "Visual newsletter template"
    },
    "globalTheme": {
      "fontFamily": "Inter, sans-serif",
      "backgroundColor": "#09090b",
      "textColor": "#fafafa",
      "linkColor": "#8b5cf6",
      "buttonStyle": {
        "backgroundColor": "#8b5cf6",
        "textColor": "#ffffff",
        "borderRadius": "8px"
      }
    },
    "variables": [
      { "name": "customer.name", "fallback": "there" },
      { "name": "discount.code", "fallback": "WELCOME10" }
    ],
    "sections": [
      {
        "id": "sec_1",
        "styles": {
          "padding": "24px",
          "backgroundColor": "#18181b"
        },
        "visibility": {
          "mobile": true,
          "desktop": true
        },
        "conditions": null,
        "columns": [
          {
            "id": "col_1_1",
            "width": "100%",
            "components": [
              {
                "type": "heading",
                "content": "Hello {{customer.name}}!",
                "styles": {
                  "fontSize": "24px",
                  "color": "#fafafa",
                  "textAlign": "center"
                }
              },
              {
                "type": "paragraph",
                "content": "Check out our latest collections. Use coupon code <strong>{{discount.code}}</strong> for a 10% discount.",
                "styles": {
                  "fontSize": "14px",
                  "color": "#a1a1aa",
                  "lineHeight": "1.6"
                }
              }
            ]
          }
        ]
      }
    ],
    "tracking": {
      "openTracking": true,
      "clickTracking": true,
      "utmParams": {
        "source": "newsletter",
        "medium": "email",
        "campaign": "product-launch"
      }
    },
    "assets": []
  }
}
```

---

## 7. Implementation Roadmap

### Phase 1: Core Layout & Content Blocks (Active Phase)
- Implement layout engines (Sections, Containers, Columns).
- Enable core content: Text, Heading, Image, Button, Divider, Spacer.
- Support standard variable replacements (`{{firstName}}`) in text nodes.
- Expose raw JSON download/upload and live responsive HTML export.

### Phase 2: Personalization & Commerce
- Add Product Cards, dynamic grids, and coupon codes.
- Add live count rules and dynamic repeat blocks.
- Incorporate interactive Countdown Timers, rating stars, and inline surveys.

### Phase 3: AI Co-Pilot & Compatibility
- Add generative prompts (writing copy, layout structure).
- Integrate spam checking, accessibility validations, and client previews (dark mode, mobile client views).
