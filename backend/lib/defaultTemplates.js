/**
 * lib/defaultTemplates.js — pre-defined professional email templates for organizations
 * Built with the Blue & White design palette matching the brand theme.
 */

export function getDefaultTemplates(orgId, orgName, userId) {
  return [
    {
      name: 'Welcome Onboarding Email',
      subject: `Welcome to ${orgName || 'our organization'}! 🎉`,
      preheader: "Let's get you set up and started.",
      category: 'transactional',
      organization: orgId,
      createdBy: userId,
      jsonData: {
        name: "Welcome Onboarding Email",
        version: "2.0",
        globalTheme: { fontFamily: "Inter, sans-serif", backgroundColor: "#f0f4f8", textColor: "#1e293b", linkColor: "#2563eb", buttonColor: "#2563eb" },
        variables: [
          { name: "customer.firstName", fallback: "there" },
          { name: "org.name", fallback: orgName || "our organization" },
          { name: "unsubscribe_link", fallback: "#" }
        ],
        sections: [
          {
            background: { color: "#ffffff" },
            padding: { top: 30, right: 30, bottom: 20, left: 30 },
            columns: [
              {
                styles: { padding: "0px" },
                components: [
                  { id: "wel_logo", type: "heading", content: orgName || "MailFlow", tag: "h3", fontSize: "20", fontWeight: "800", color: "#2563eb", align: "left" },
                  { id: "wel_div1", type: "divider", style: "solid", thickness: "1", color: "#e2e8f0", paddingTop: "15", paddingBottom: "15" },
                  { id: "wel_head", type: "heading", content: "Welcome aboard! 👋", tag: "h1", fontSize: "32", fontWeight: "800", color: "#1e293b", align: "left" },
                  { id: "wel_text", type: "paragraph", content: "Hi {{customer.firstName}},<br><br>We are thrilled to welcome you to our organization. Our mission is to help you streamline your communication and launch successful campaigns seamlessly. To help you get started, we have outlined a few quick steps below.", fontSize: "15", color: "#475569", align: "left", lineHeight: "1.7" }
                ]
              }
            ]
          },
          {
            background: { color: "#f8fafc" },
            padding: { top: 20, right: 30, bottom: 20, left: 30 },
            columns: [
              {
                styles: { padding: "10px" },
                components: [
                  { id: "step_title", type: "heading", content: "Your Quickstart Steps", tag: "h3", fontSize: "16", fontWeight: "700", color: "#2563eb", align: "left" },
                  { id: "step_1", type: "paragraph", content: "<b>1. Set up your profile</b> — Configure your sender settings and details.<br><b>2. Import your audience</b> — Upload a CSV file or add your contacts manually.<br><b>3. Build your segment</b> — Create dynamic rules to target the right audience.", fontSize: "14", color: "#475569", align: "left", lineHeight: "1.8" }
                ]
              }
            ]
          },
          {
            background: { color: "#ffffff" },
            padding: { top: 20, right: 30, bottom: 30, left: 30 },
            columns: [
              {
                styles: { padding: "0px" },
                components: [
                  { id: "wel_btn", type: "button", label: "Go to Dashboard", url: "/dashboard", bgColor: "#2563eb", textColor: "#ffffff", borderRadius: "6", align: "left", width: "auto", paddingX: "24", paddingY: "12" },
                  { id: "wel_div2", type: "divider", style: "solid", thickness: "1", color: "#e2e8f0", paddingTop: "20", paddingBottom: "20" },
                  { id: "wel_footer", type: "paragraph", content: "If you have any questions, feel free to reply directly to this email. We're here to help!<br><br>Best regards,<br>The team", fontSize: "13", color: "#94a3b8", align: "left", lineHeight: "1.6" }
                ]
              }
            ]
          }
        ]
      },
      htmlContent: `
        <div style="background-color: #f0f4f8; padding: 20px; font-family: sans-serif; color: #1e293b;">
          <table align="center" width="600" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0; border-collapse: collapse;">
            <tr>
              <td style="padding: 30px;">
                <h3 style="color: #2563eb; margin: 0 0 15px 0; font-size: 20px; font-weight: 800;">${orgName || 'MailFlow'}</h3>
                <hr style="border: 0; border-top: 1px solid #e2e8f0; margin-bottom: 20px;">
                <h1 style="color: #1e293b; font-size: 28px; font-weight: 800; margin: 0 0 15px 0;">Welcome aboard! 👋</h1>
                <p style="font-size: 15px; line-height: 1.7; color: #475569;">Hi {{customer.firstName}},<br><br>We are thrilled to welcome you to our organization. Our mission is to help you streamline your communication and launch successful campaigns seamlessly. To help you get started, we have outlined a few quick steps below.</p>
              </td>
            </tr>
            <tr style="background-color: #f8fafc;">
              <td style="padding: 20px 30px;">
                <h4 style="color: #2563eb; margin: 0 0 10px 0; font-size: 15px; font-weight: 700;">Your Quickstart Steps</h4>
                <p style="font-size: 14px; line-height: 1.8; color: #475569; margin: 0;">
                  <strong>1. Set up your profile</strong> — Configure your sender settings and details.<br>
                  <strong>2. Import your audience</strong> — Upload a CSV file or add your contacts manually.<br>
                  <strong>3. Build your segment</strong> — Create dynamic rules to target the right audience.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding: 30px;">
                <a href="${process.env.APP_URL || 'http://localhost:3000'}/dashboard" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 700; font-size: 14px; display: inline-block;">Go to Dashboard</a>
                <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 25px 0 20px 0;">
                <p style="font-size: 13px; line-height: 1.6; color: #94a3b8; margin: 0;">If you have any questions, feel free to reply directly to this email. We're here to help!<br><br>Best regards,<br>The team</p>
              </td>
            </tr>
          </table>
        </div>
      `
    },
    {
      name: 'Organization Monthly Newsletter',
      subject: `Monthly Highlights from ${orgName || 'our team'} 📰`,
      preheader: "Catch up on what's new this month.",
      category: 'newsletter',
      organization: orgId,
      createdBy: userId,
      jsonData: {
        name: "Organization Monthly Newsletter",
        version: "2.0",
        globalTheme: { fontFamily: "Inter, sans-serif", backgroundColor: "#f8fafc", textColor: "#1e293b", linkColor: "#2563eb", buttonColor: "#2563eb" },
        variables: [
          { name: "customer.firstName", fallback: "there" },
          { name: "org.name", fallback: orgName || "our team" },
          { name: "unsubscribe_link", fallback: "#" }
        ],
        sections: [
          {
            background: { color: "#2563eb" },
            padding: { top: 25, right: 30, bottom: 25, left: 30 },
            columns: [
              {
                styles: { padding: "0px" },
                components: [
                  { id: "news_logo", type: "heading", content: orgName || "MailFlow", tag: "h3", fontSize: "18", fontWeight: "800", color: "#ffffff", align: "center" },
                  { id: "news_title", type: "heading", content: "MONTHLY HIGHLIGHTS", tag: "h1", fontSize: "28", fontWeight: "800", color: "#ffffff", align: "center", letterSpacing: "1" }
                ]
              }
            ]
          },
          {
            background: { color: "#ffffff" },
            padding: { top: 30, right: 30, bottom: 30, left: 30 },
            columns: [
              {
                styles: { padding: "0px" },
                components: [
                  { id: "news_greet", type: "heading", content: "Hello {{customer.firstName}},", tag: "h3", fontSize: "16", fontWeight: "700", color: "#1e293b", align: "left" },
                  { id: "news_intro", type: "paragraph", content: "Welcome to this month's newsletter. We've been working hard on several updates, launches, and customer stories. Here are the top highlights you shouldn't miss.", fontSize: "15", color: "#475569", align: "left", lineHeight: "1.7" }
                ]
              }
            ]
          },
          {
            background: { color: "#f1f5f9" },
            padding: { top: 20, right: 30, bottom: 20, left: 30 },
            columns: [
              {
                styles: { padding: "10px" },
                components: [
                  { id: "up_logo", type: "heading", content: "🚀 Product Updates", tag: "h3", fontSize: "15", fontWeight: "700", color: "#2563eb", align: "left" },
                  { id: "up_text", type: "paragraph", content: "We recently rolled out our core analytics features. You can now monitor delivery statistics and open rates in real-time.", fontSize: "13.5", color: "#475569", align: "left", lineHeight: "1.6" }
                ]
              },
              {
                styles: { padding: "10px" },
                components: [
                  { id: "event_logo", type: "heading", content: "📅 Upcoming Events", tag: "h3", fontSize: "15", fontWeight: "700", color: "#2563eb", align: "left" },
                  { id: "event_text", type: "paragraph", content: "Join our town hall webinar next Thursday to meet the founding team and view the roadmap for the upcoming quarter.", fontSize: "13.5", color: "#475569", align: "left", lineHeight: "1.6" }
                ]
              }
            ]
          },
          {
            background: { color: "#ffffff" },
            padding: { top: 25, right: 30, bottom: 25, left: 30 },
            columns: [
              {
                styles: { padding: "0px" },
                components: [
                  { id: "news_footer", type: "paragraph", content: "Thank you for being part of our journey!<br><br>All rights reserved @ {{org.name}}.<br><a href='{{unsubscribe_link}}' style='color:#2563eb; text-decoration:none;'>Unsubscribe</a>", fontSize: "12", color: "#94a3b8", align: "center", lineHeight: "1.6" }
                ]
              }
            ]
          }
        ]
      },
      htmlContent: `
        <div style="background-color: #f8fafc; padding: 20px; font-family: sans-serif; color: #1e293b;">
          <table align="center" width="600" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0; border-collapse: collapse;">
            <tr style="background-color: #2563eb;">
              <td style="padding: 25px 30px; text-align: center; color: white;">
                <h3 style="margin: 0; font-size: 18px; font-weight: 800;">${orgName || 'MailFlow'}</h3>
                <h1 style="margin: 5px 0 0 0; font-size: 24px; font-weight: 800; letter-spacing: 1px;">MONTHLY HIGHLIGHTS</h1>
              </td>
            </tr>
            <tr>
              <td style="padding: 30px;">
                <h3 style="color: #1e293b; margin: 0 0 10px 0; font-size: 16px;">Hello {{customer.firstName}},</h3>
                <p style="font-size: 15px; line-height: 1.7; color: #475569; margin: 0;">Welcome to this month's newsletter. We've been working hard on several updates, launches, and customer stories. Here are the top highlights you shouldn't miss.</p>
              </td>
            </tr>
            <tr>
              <td style="padding: 0 20px 20px 20px;">
                <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                  <tr>
                    <td width="50%" valign="top" style="padding: 10px; background-color: #f1f5f9; border-radius: 6px; border-right: 10px solid #ffffff;">
                      <h4 style="color: #2563eb; margin: 0 0 8px 0; font-size: 15px;">🚀 Product Updates</h4>
                      <p style="font-size: 13.5px; line-height: 1.6; color: #475569; margin: 0;">We recently rolled out our core analytics features. You can now monitor delivery statistics and open rates in real-time.</p>
                    </td>
                    <td width="50%" valign="top" style="padding: 10px; background-color: #f1f5f9; border-radius: 6px; border-left: 10px solid #ffffff;">
                      <h4 style="color: #2563eb; margin: 0 0 8px 0; font-size: 15px;">📅 Upcoming Events</h4>
                      <p style="font-size: 13.5px; line-height: 1.6; color: #475569; margin: 0;">Join our town hall webinar next Thursday to meet the founding team and view the roadmap for the upcoming quarter.</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding: 25px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                <p style="font-size: 12px; line-height: 1.6; color: #94a3b8; margin: 0;">
                  Thank you for being part of our journey!<br>
                  All rights reserved @ ${orgName || 'MailFlow'}.<br>
                  <a href="{{unsubscribe_link}}" style="color: #2563eb; text-decoration: none;">Unsubscribe</a>
                </p>
              </td>
            </tr>
          </table>
        </div>
      `
    },
    {
      name: 'Product Launch Announcement',
      subject: `Introducing our newest release at ${orgName || 'MailFlow'}! 🚀`,
      preheader: "Be the first to see our exciting update.",
      category: 'marketing',
      organization: orgId,
      createdBy: userId,
      jsonData: {
        name: "Product Launch Announcement",
        version: "2.0",
        globalTheme: { fontFamily: "Inter, sans-serif", backgroundColor: "#f0f4f8", textColor: "#1e293b", linkColor: "#2563eb", buttonColor: "#2563eb" },
        variables: [
          { name: "customer.firstName", fallback: "there" },
          { name: "org.name", fallback: orgName || "MailFlow" },
          { name: "unsubscribe_link", fallback: "#" }
        ],
        sections: [
          {
            background: { color: "#ffffff" },
            padding: { top: 30, right: 30, bottom: 30, left: 30 },
            columns: [
              {
                styles: { padding: "0px" },
                components: [
                  { id: "pl_logo", type: "heading", content: orgName || "MailFlow", tag: "h3", fontSize: "18", fontWeight: "800", color: "#2563eb", align: "left" },
                  { id: "pl_div1", type: "divider", style: "solid", thickness: "1", color: "#e2e8f0", paddingTop: "15", paddingBottom: "20" },
                  { id: "pl_head", type: "heading", content: "It's finally here. 🚀", tag: "h1", fontSize: "32", fontWeight: "800", color: "#1e293b", align: "left" },
                  { id: "pl_tagline", type: "heading", content: "Transforming how you build and deliver emails.", tag: "h2", fontSize: "20", fontWeight: "600", color: "#475569", align: "left" },
                  { id: "pl_text", type: "paragraph", content: "Dear {{customer.firstName}},<br><br>We are thrilled to present our brand new workspace and design engine. We have completely rewritten our designer to provide pixel-perfect rendering, lightning-fast response, and drag-and-drop flexibility.", fontSize: "15", color: "#475569", align: "left", lineHeight: "1.7" },
                  { id: "pl_btn", type: "button", label: "Discover Features", url: "/dashboard", bgColor: "#2563eb", textColor: "#ffffff", borderRadius: "6", align: "left", width: "auto", paddingX: "24", paddingY: "12" }
                ]
              }
            ]
          },
          {
            background: { color: "#2563eb" },
            padding: { top: 25, right: 30, bottom: 25, left: 30 },
            columns: [
              {
                styles: { padding: "0px" },
                components: [
                  { id: "pl_highlight", type: "heading", content: "Exclusive launch offer for you!", tag: "h2", fontSize: "20", fontWeight: "800", color: "#ffffff", align: "center" },
                  { id: "pl_highlight_sub", type: "paragraph", content: "Sign in and try the new template builder today. Reply with feedback to get three months of premium free.", fontSize: "14", color: "#bfdbfe", align: "center", lineHeight: "1.6" }
                ]
              }
            ]
          },
          {
            background: { color: "#ffffff" },
            padding: { top: 20, right: 30, bottom: 25, left: 30 },
            columns: [
              {
                styles: { padding: "0px" },
                components: [
                  { id: "pl_footer", type: "paragraph", content: "All rights reserved @ {{org.name}}.<br><a href='{{unsubscribe_link}}' style='color:#2563eb; text-decoration:none;'>Unsubscribe</a>", fontSize: "11", color: "#94a3b8", align: "center", lineHeight: "1.6" }
                ]
              }
            ]
          }
        ]
      },
      htmlContent: `
        <div style="background-color: #f0f4f8; padding: 20px; font-family: sans-serif; color: #1e293b;">
          <table align="center" width="600" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0; border-collapse: collapse;">
            <tr>
              <td style="padding: 30px;">
                <h3 style="color: #2563eb; margin: 0 0 15px 0; font-size: 18px; font-weight: 800;">${orgName || 'MailFlow'}</h3>
                <hr style="border: 0; border-top: 1px solid #e2e8f0; margin-bottom: 20px;">
                <h1 style="color: #1e293b; font-size: 28px; font-weight: 800; margin: 0 0 8px 0;">It's finally here. 🚀</h1>
                <h2 style="color: #475569; font-size: 18px; font-weight: 600; margin: 0 0 20px 0;">Transforming how you build and deliver emails.</h2>
                <p style="font-size: 15px; line-height: 1.7; color: #475569; margin-bottom: 24px;">Dear {{customer.firstName}},<br><br>We are thrilled to present our brand new workspace and design engine. We have completely rewritten our designer to provide pixel-perfect rendering, lightning-fast response, and drag-and-drop flexibility.</p>
                <a href="${process.env.APP_URL || 'http://localhost:3000'}/dashboard" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 700; font-size: 14px; display: inline-block;">Discover Features</a>
              </td>
            </tr>
            <tr style="background-color: #2563eb;">
              <td style="padding: 30px; text-align: center; color: white;">
                <h2 style="margin: 0 0 10px 0; font-size: 20px; font-weight: 800;">Exclusive launch offer for you!</h2>
                <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #bfdbfe;">Sign in and try the new template builder today. Reply with feedback to get three months of premium free.</p>
              </td>
            </tr>
            <tr>
              <td style="padding: 25px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                <p style="font-size: 11px; line-height: 1.6; color: #94a3b8; margin: 0;">
                  All rights reserved @ ${orgName || 'MailFlow'}.<br>
                  <a href="{{unsubscribe_link}}" style="color: #2563eb; text-decoration: none;">Unsubscribe</a>
                </p>
              </td>
            </tr>
          </table>
        </div>
      `
    },
    {
      name: 'Customer Feedback Survey',
      subject: `Help us improve ${orgName || 'MailFlow'}! 💬`,
      preheader: 'We value your opinion.',
      category: 'marketing',
      organization: orgId,
      createdBy: userId,
      jsonData: {
        name: "Customer Feedback Survey",
        version: "2.0",
        globalTheme: { fontFamily: "Inter, sans-serif", backgroundColor: "#f8fafc", textColor: "#1e293b", linkColor: "#2563eb", buttonColor: "#2563eb" },
        variables: [
          { name: "customer.firstName", fallback: "there" },
          { name: "org.name", fallback: orgName || "MailFlow" },
          { name: "unsubscribe_link", fallback: "#" }
        ],
        sections: [
          {
            background: { color: "#ffffff" },
            padding: { top: 30, right: 30, bottom: 25, left: 30 },
            columns: [
              {
                styles: { padding: "0px" },
                components: [
                  { id: "sv_logo", type: "heading", content: orgName || "MailFlow", tag: "h3", fontSize: "18", fontWeight: "800", color: "#2563eb", align: "center" },
                  { id: "sv_div1", type: "divider", style: "solid", thickness: "1", color: "#e2e8f0", paddingTop: "15", paddingBottom: "20" },
                  { id: "sv_head", type: "heading", content: "How did we do? 💬", tag: "h1", fontSize: "30", fontWeight: "800", color: "#1e293b", align: "center" },
                  { id: "sv_text", type: "paragraph", content: "Hi {{customer.firstName}},<br><br>We want to make sure you have the absolute best experience with our organization. Could you take 1 minute to let us know how satisfied you are with our service?", fontSize: "15", color: "#475569", align: "center", lineHeight: "1.7" }
                ]
              }
            ]
          },
          {
            background: { color: "#f8fafc" },
            padding: { top: 20, right: 30, bottom: 20, left: 30 },
            columns: [
              {
                styles: { padding: "10px" },
                components: [
                  { id: "sv_rating", type: "rating", stars: 5, filled: 5, baseUrl: "/feedback", color: "#f59e0b", size: "36", align: "center" },
                  { id: "sv_rating_label", type: "paragraph", content: "Click on a star to rate us. Your feedback directly impacts our future improvements.", fontSize: "12", color: "#94a3b8", align: "center", lineHeight: "1.5" }
                ]
              }
            ]
          },
          {
            background: { color: "#ffffff" },
            padding: { top: 20, right: 30, bottom: 25, left: 30 },
            columns: [
              {
                styles: { padding: "0px" },
                components: [
                  { id: "sv_footer", type: "paragraph", content: "Thank you for your time!<br><br>All rights reserved @ {{org.name}}.<br><a href='{{unsubscribe_link}}' style='color:#2563eb; text-decoration:none;'>Unsubscribe</a>", fontSize: "11", color: "#94a3b8", align: "center", lineHeight: "1.6" }
                ]
              }
            ]
          }
        ]
      },
      htmlContent: `
        <div style="background-color: #f8fafc; padding: 20px; font-family: sans-serif; color: #1e293b;">
          <table align="center" width="600" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0; border-collapse: collapse;">
            <tr>
              <td style="padding: 30px; text-align: center;">
                <h3 style="color: #2563eb; margin: 0 0 15px 0; font-size: 18px; font-weight: 800;">${orgName || 'MailFlow'}</h3>
                <hr style="border: 0; border-top: 1px solid #e2e8f0; margin-bottom: 20px;">
                <h1 style="color: #1e293b; font-size: 26px; font-weight: 800; margin: 0 0 15px 0;">How did we do? 💬</h1>
                <p style="font-size: 15px; line-height: 1.7; color: #475569; margin: 0 0 20px 0;">Hi {{customer.firstName}},<br><br>We want to make sure you have the absolute best experience with our organization. Could you take 1 minute to let us know how satisfied you are with our service?</p>
              </td>
            </tr>
            <tr style="background-color: #f8fafc;">
              <td style="padding: 30px; text-align: center;">
                <div style="font-size: 32px; margin-bottom: 10px; color: #f59e0b;">⭐ ⭐ ⭐ ⭐ ⭐</div>
                <p style="font-size: 12px; line-height: 1.5; color: #94a3b8; margin: 0;">Click on a star to rate us. Your feedback directly impacts our future improvements.</p>
              </td>
            </tr>
            <tr>
              <td style="padding: 25px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                <p style="font-size: 11px; line-height: 1.6; color: #94a3b8; margin: 0;">
                  Thank you for your time!<br>
                  All rights reserved @ ${orgName || 'MailFlow'}.<br>
                  <a href="{{unsubscribe_link}}" style="color: #2563eb; text-decoration: none;">Unsubscribe</a>
                </p>
              </td>
            </tr>
          </table>
        </div>
      `
    }
  ];
}
