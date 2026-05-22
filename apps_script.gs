/**
 * FSOP Study Plan — signup capture endpoint
 *
 * Receives POST requests from the study plan site, appends the submission
 * to your Google Sheet, emails YOU an alert, and sends the signup a warm
 * confirmation email.
 *
 * SETUP — one-time:
 *   1. Open sheets.new (creates a new blank Google Sheet)
 *   2. Rename it "FSOP Signups" (or whatever you want)
 *   3. Extensions menu → Apps Script
 *   4. Delete the boilerplate code in Code.gs
 *   5. Paste ALL of this file's contents into Code.gs
 *   6. Save (Ctrl/Cmd+S)
 *   7. Click "Deploy" (top right) → "New deployment"
 *      - Type: Web app
 *      - Description: "FSOP signup capture"
 *      - Execute as: Me (your account)
 *      - Who has access: Anyone  ← important: lets the website POST
 *   8. Click "Deploy" → grant permissions when prompted (gmail send, sheet edit)
 *   9. Copy the Web App URL (ends in /exec)
 *  10. Paste that URL into index.html, replacing SIGNUP_ENDPOINT near the top
 *      of the <script> block
 *  11. Commit + push to GitHub Pages — submissions will flow into your sheet
 *      and trigger both emails
 *
 * To redeploy after changes:
 *   Deploy → Manage deployments → pencil/edit icon → Version: New version → Deploy
 *
 * Verify it's working:
 *   Paste the Web App URL into a browser — you should see "FSOP signup endpoint OK"
 */

// =====================
// CONFIG — edit these
// =====================
const NOTIFY_EMAIL = 'anthonybajj@gmail.com';   // alerts to you on every signup
const SHEET_NAME = 'Submissions';
const FROM_NAME = 'Anthony Bajjani';            // shown as sender on the auto-reply
const REPLY_TO = 'anthonybajj@gmail.com';       // where replies to the auto-reply go
const SITE_URL = 'https://onscript.com.au';     // used in the auto-reply

// =====================
// MAIN HANDLER
// =====================
function doPost(e) {
  try {
    const sheet = getOrCreateSheet_();
    const p = (e && e.parameter) ? e.parameter : {};

    sheet.appendRow([
      new Date(),                                  // Received at (server)
      p.timestamp || '',                           // Client timestamp
      p.firstName || '',
      p.email || '',
      p.ownerStatus || '',
      p.marketingConsent || '',
      p.userAgent || '',
      p.referrer || ''
    ]);

    // Internal alert to you
    if (NOTIFY_EMAIL) {
      try {
        MailApp.sendEmail({
          to: NOTIFY_EMAIL,
          subject: 'New FSOP signup: ' + (p.firstName || '?') + (p.ownerStatus === 'Yes' ? ' (Owner)' : ''),
          body: 'New signup from the FSOP study site:\n\n'
              + 'Name: ' + (p.firstName || '') + '\n'
              + 'Email: ' + (p.email || '') + '\n'
              + 'Pharmacy owner: ' + (p.ownerStatus || '') + '\n'
              + 'Marketing consent: ' + (p.marketingConsent || '') + '\n'
              + 'Time: ' + (p.timestamp || '') + '\n'
        });
      } catch (mailErr) { /* don't fail the request if mail fails */ }
    }

    // Warm auto-reply to the signup
    if (p.email && isLikelyEmail_(p.email)) {
      try {
        sendAutoReply_(p.firstName || '', p.email, p.ownerStatus === 'Yes');
      } catch (replyErr) { /* don't fail the request if the auto-reply fails */ }
    }

    return jsonResponse_({ ok: true });
  } catch (err) {
    return jsonResponse_({ ok: false, error: String(err) });
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput('FSOP signup endpoint OK')
    .setMimeType(ContentService.MimeType.TEXT);
}

// =====================
// AUTO-REPLY EMAIL
// =====================
function sendAutoReply_(firstName, toEmail, isOwner) {
  const name = (firstName || '').trim();
  const greeting = name ? ('Hi ' + name + ',') : 'Hi,';

  const subject = 'Welcome — FSOP study companion';

  const plain =
    greeting + '\n\n'
    + "Thanks for signing up — really appreciate you trusting me with your email.\n\n"
    + "You've now got full access to the FSOP study companion at " + SITE_URL + ". "
    + "Your progress saves to your own browser, so just bookmark the link and pick up wherever you left off each day.\n\n"
    + "A bit about why I built this: I'm a pharmacist working through FSOP myself, and I kept finding the curriculum scattered across "
    + "different course shells. So I pulled it into one place — daily 30–60 min sessions, OSCE station checklists, flashcards, quick-reference "
    + "tables — all aimed at OSCE 1.\n\n"
    + "Outside of FSOP, I work on AI automation for community pharmacies — the kind of admin / dispensing / Webster / claims drudgery "
    + "that eats your week. " + (isOwner
        ? "Since you mentioned you're an owner, I'd love to compare notes on what's slowing your team down — happy to share what's working in other pharmacies. Just hit reply.\n\n"
        : "If that's ever interesting to you (or someone at your pharmacy), reply and I'll send through what we're seeing work elsewhere.\n\n")
    + "Good luck with the prep — you've got this.\n\n"
    + "— " + FROM_NAME + "\n"
    + SITE_URL + "\n\n"
    + "—\n"
    + "You're getting this email because you signed up at " + SITE_URL + ". "
    + "Reply 'unsubscribe' any time and I'll remove you immediately.";

  const html =
    '<div style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;font-size:15px;line-height:1.55;color:#1a1a1a;max-width:560px;">'
    + '<p>' + escapeHtml_(greeting) + '</p>'
    + '<p>Thanks for signing up — really appreciate you trusting me with your email.</p>'
    + '<p>You\'ve now got full access to the <strong>FSOP study companion</strong> at '
    + '<a href="' + SITE_URL + '" style="color:#7a5a2b;">' + SITE_URL + '</a>. '
    + 'Your progress saves to your own browser, so just bookmark the link and pick up wherever you left off each day.</p>'
    + '<p>A bit about why I built this: I\'m a pharmacist working through FSOP myself, and I kept finding the curriculum scattered across '
    + 'different course shells. So I pulled it into one place — daily 30–60 min sessions, OSCE station checklists, flashcards, '
    + 'quick-reference tables — all aimed at OSCE&nbsp;1.</p>'
    + '<p>Outside of FSOP, I work on <strong>AI automation for community pharmacies</strong> — the kind of admin / dispensing / Webster / '
    + 'claims drudgery that eats your week. '
    + (isOwner
        ? 'Since you mentioned you\'re an owner, I\'d love to compare notes on what\'s slowing your team down — happy to share what\'s working in other pharmacies. Just hit reply.'
        : 'If that\'s ever interesting to you (or someone at your pharmacy), reply and I\'ll send through what we\'re seeing work elsewhere.')
    + '</p>'
    + '<p>Good luck with the prep — you\'ve got this.</p>'
    + '<p style="margin-top:24px;">— ' + escapeHtml_(FROM_NAME) + '<br>'
    + '<a href="' + SITE_URL + '" style="color:#7a5a2b;">' + SITE_URL + '</a></p>'
    + '<hr style="border:none;border-top:1px solid #e5e0d4;margin:24px 0 12px;">'
    + '<p style="font-size:12px;color:#777;">You\'re getting this email because you signed up at '
    + '<a href="' + SITE_URL + '" style="color:#777;">' + SITE_URL + '</a>. '
    + 'Reply <em>unsubscribe</em> any time and I\'ll remove you immediately.</p>'
    + '</div>';

  MailApp.sendEmail({
    to: toEmail,
    subject: subject,
    body: plain,
    htmlBody: html,
    name: FROM_NAME,
    replyTo: REPLY_TO
  });
}

// =====================
// HELPERS
// =====================
function getOrCreateSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      'Received (server)',
      'Submitted (client)',
      'First name',
      'Email',
      'Pharmacy owner',
      'Marketing consent',
      'User agent',
      'Referrer'
    ]);
    sheet.setFrozenRows(1);
    sheet.getRange('A1:H1').setFontWeight('bold').setBackground('#f5f0e6');
    sheet.setColumnWidths(1, 8, 160);
  }
  return sheet;
}

function jsonResponse_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function isLikelyEmail_(s) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s || '').trim());
}

function escapeHtml_(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
