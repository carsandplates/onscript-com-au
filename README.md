# FSOP Study Plan

A 30-day study companion for the UTS Graduate Certificate of Pharmacist Prescribing — Advanced Clinical Skills 1 (96136) + Prescribing Skills 1 (96138) — built around OSCE 1.

## What it is

A single-file static web page that walks you through OSCE-priority content in 30–60 minute daily sessions for the four weeks leading up to OSCE 1.

- Tickable daily action lists with progress saved locally
- Expandable "Learn more" content under each action — FPE narration scripts, condition algorithms, dose tables, sample OSCE cases
- All 7 OSCE station checklists and common pitfalls
- 40 high-yield flashcards (active recall)
- Quick reference: vitals, red flags, antibiotic doses, mnemonics, cranial nerves
- **Customisable** to your own OSCE / tutorship / residential dates — click "⚙ My dates" in the top right
- **Lead capture form** — optional signup modal that triggers after 3 ticked actions (submissions go to a Google Sheet you own)

## Run it locally

Open `fsop_study_plan.html` in any browser. No build step, no install. Progress is saved to your own browser's localStorage and never leaves your device.

## Deploy to GitHub Pages

1. Create a public GitHub repository
2. Upload `fsop_study_plan.html` (rename to `index.html` so it's the default page)
3. Upload `README.md` (this file)
4. Repo Settings → Pages → Source: `Deploy from a branch` → Branch: `main` / folder: `/ (root)` → Save
5. Wait ~1 minute. Your site will be at `https://<your-username>.github.io/<repo-name>/`
6. Share that URL

## Setting up the signup capture (Google Sheets backend)

The signup modal needs a backend to land data somewhere. The cheapest, most flexible option is a Google Sheet via Apps Script.

**One-time setup (5–10 min):**

1. Go to **sheets.new** — this creates a blank Google Sheet
2. Rename it "FSOP Signups" (or whatever)
3. **Extensions** menu → **Apps Script**
4. Delete the placeholder code in `Code.gs`
5. Open `apps_script.gs` from this repo, copy all contents, paste into `Code.gs`
6. (Optional) Edit `NOTIFY_EMAIL` at the top to your email for instant alerts
7. **Save** (Ctrl/Cmd+S)
8. Click **Deploy** (top right) → **New deployment**
   - Type: **Web app**
   - Description: `FSOP signup capture`
   - Execute as: **Me**
   - Who has access: **Anyone** ← critical
9. **Deploy** → grant permissions when prompted
10. **Copy the Web App URL** (ends in `/exec`)
11. Open `fsop_study_plan.html` → find this line near the top of the `<script>` block:
    ```js
    const SIGNUP_ENDPOINT = "https://script.google.com/macros/s/PASTE_YOUR_DEPLOYED_APPS_SCRIPT_URL_HERE/exec";
    ```
12. Replace the URL with the one you copied, save, commit + push to GitHub

**To verify it's working:** paste the Web App URL into a browser address bar — you should see "FSOP signup endpoint OK". Submit a test from your live site — a new row appears in the sheet within a second.

**Tune the signup behaviour** — top of the script:
```js
const SIGNUP_TRIGGER_AT_TICKS = 3;   // show modal after this many actions ticked
const SIGNUP_RETRY_AFTER_DAYS = 7;   // re-prompt after skip
```

## Privacy

- Personal study progress (tick-offs, your saved dates) is stored only in the user's own browser via localStorage. Nothing is sent anywhere.
- Signup submissions (first name, email, owner status, consent) go to YOUR Google Sheet via your Apps Script endpoint. Treat that data per Australian Privacy Principles — clear opt-in (built into the form), purpose limitation, secure storage, opt-out on request.

## Disclaimer

Unofficial study companion. Always verify drug doses, indications, and red flags against current eTG complete, NSW Pharmacy Scope of Practice authorities, and the Australian Immunisation Handbook before clinical or exam use. Guidelines change — content here is a starting point for revision, not definitive practice guidance. Educational use only.
