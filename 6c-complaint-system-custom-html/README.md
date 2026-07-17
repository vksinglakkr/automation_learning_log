# 6c — Complaint System · Custom HTML + Webhook

Third complaint-system variant. Unlike 6b (which uses n8n's built-in Form Trigger), this
one exposes two raw `Webhook` endpoints meant to sit behind a fully custom HTML page you
build and host yourself — one for final submission, one dedicated to the "AI Assist"
preview button so a citizen can see the improved text *before* submitting, without that
preview call touching the Sheet or sending any notifications.

## Files

| File | Purpose |
|---|---|
| `workflow.json` | n8n workflow — sanitized. **The original export included a full real test submission in `pinData`** (your actual email, phone, IP address, and self-hosted n8n domain) — entirely stripped. Also replaced a real (non-placeholder) Twilio Account SID and hardcoded personal WhatsApp number with placeholders. |

## Flow

Two independent entry points:

- **Preview**: `AI Preview Webhook` → `AI Preview (for HTML form button)` (Groq, rewrite
  only, no classification) → `Return AI Preview` (JSON back to the page, nothing saved)
- **Submit**: `Receive Complaint (Webhook)` → `Map & Prepare Data` (Code: normalizes form
  fields, formats phone for WhatsApp) → `AI Improve & Classify` (Groq: rewrite + extract
  DEPARTMENT/PRIORITY/SUMMARY) → `Extract & Route` (Code: parses AI output, maps to
  officer) → **parallel:** `Log to Google Sheets` + `Respond to HTML Form` (immediate
  JSON response) → **parallel:** `Email to Officer` → `WhatsApp Alert to Officer` **and**
  `Email to Citizen` → `WhatsApp to Citizen`

## What this build teaches

- **Two-webhook pattern for a preview feature**: the AI-improve button on the page calls
  a separate, lightweight endpoint that only rewrites text and returns it — it never
  touches the Sheet, never sends notifications, and never runs the full classification
  prompt. Keeps the "let me preview my complaint" interaction cheap and fast.
- **Deferred re-classification**: the main submission endpoint always re-runs the AI
  step on `useText` (the already-improved text if the citizen used the preview, otherwise
  the raw text) — because the preview endpoint intentionally doesn't extract
  department/priority/summary, only the submission endpoint does that.
- **Immediate response, deferred side effects**: `Respond to HTML Form` fires in parallel
  with `Log to Google Sheets`, so the citizen's browser gets a fast success response
  without waiting on the email/WhatsApp sends that follow.
- **Explicit node references** (`$('Map & Prepare Data').item.json`) instead of relying
  on implicit `$json` after an AI call — makes the data flow easier to follow across
  multiple hops.

## ⚠️ Known issues — review before relying on this

1. **No per-department WhatsApp routing exists at all.** Unlike 6b, `Extract & Route`'s
   `routingMap` only stores an email and label per department — there's no WhatsApp
   number field. `WhatsApp Alert to Officer` sends every alert to a single hardcoded
   number regardless of department. If you want per-department WhatsApp routing, you'll
   need to add a `whatsapp` field to each department's entry in `routingMap` (same
   pattern as 6b) and reference it dynamically in the `To` field.
2. **The WhatsApp nodes' credential is named "Cloudinary."** Both Twilio WhatsApp nodes
   use an `httpBasicAuth` credential literally named "Cloudinary" — worth checking in n8n
   whether this is a relabeled credential that actually holds your Twilio SID/Auth Token,
   or whether it's genuinely the wrong credential attached (which would fail
   authentication against Twilio's API). Renaming it to something like "Twilio Basic
   Auth" would avoid this confusion going forward.

## Setup notes

- Requires a Groq API credential
- Requires a Google Sheets credential — replace `REPLACE_WITH_GOOGLE_SHEET_ID`; expects
  a `Complaints Log` tab
- Requires a Gmail credential
- Requires a Twilio credential (HTTP Basic Auth) — replace `YOUR_TWILIO_ACCOUNT_SID` in
  both WhatsApp node URLs, and verify the attached credential is correct (see known issue
  #2 above)
- Replace all seven placeholder officer emails in `Extract & Route`'s `routingMap`
- Your custom HTML page needs to call `/webhook/ai-improve-only` for the preview button
  and `/webhook/citizen-complaint-kkr` for final submission — both paths are set in the
  respective Webhook nodes' `path` parameter

## Prerequisites

- Groq API credential
- Google Sheets credential with a Complaints Log tab
- Gmail credential
- Twilio credential with WhatsApp access
- A custom HTML page calling both webhook endpoints
