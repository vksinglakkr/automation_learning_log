# 6b — Complaint System · Web Form

Citizens submit complaints through a public form (Pension, Aadhaar, PPP, Ration, Revenue,
CRED, or Other), with an AI-assist option to improve their complaint text before submitting.
On submission, Groq classifies the department/priority and rewrites the complaint formally,
the workflow logs it to Sheets, and sends **both email and WhatsApp** notifications to the
citizen (confirmation) and the officer (action-required) in parallel.

## Files

| File | Purpose |
|---|---|
| `workflow.json` | n8n workflow — sanitized (personal routing emails and WhatsApp number replaced with placeholders; one field genuinely fixed, see below). |

## Flow

`Citizen Complaint Form` → `AI Improve Complaint` (Groq: rewrites formally, extracts
department/priority/summary) → `Process & Route` (Code: parses AI output, maps to officer
contact info, builds reference number) → `Log to Google Sheets` → **parallel:**
`Email to Citizen` → `WhatsApp to Citizen` **and** `Email to Officer` → `WhatsApp Alert
to Officer`

## What this build teaches

- **AI-assisted text improvement before submission**: the form has an "AI Assist" step
  the citizen can trigger to see a formalized version of their complaint before submitting
- **Single AI call extracting multiple structured fields**: one Groq response returns the
  rewritten text *and* department/priority/summary in a labeled format, parsed by regex
- **Two independent notification channels per recipient**: each of citizen and officer
  gets both an email and a WhatsApp message, sent sequentially within their own branch
  (not depending on the other channel succeeding)
- **Reference number generation** from the citizen's name initials + a timestamp slice

## ⚠️ Note: one field was fixed during sanitization, not just anonymized

The original `WhatsApp Alert to Officer` node had a **single phone number hardcoded** as
the destination for every department's alert — meaning every complaint's WhatsApp alert
went to the same phone regardless of category, even though `Process & Route` already
computes a distinct `officerWhatsApp` value per department. Since the hardcoded number
was personal data, a placeholder string alone wouldn't have made this node functional —
so the sanitized version points it at `{{ $json.officerWhatsApp }}` instead, actually
using the per-department value that was already being computed but ignored.
**Before importing**: fill in each department's real WhatsApp number in `Process &
Route`'s `routingMap` (the `whatsapp` field), and confirm the Twilio sandbox has each of
those numbers joined if still in sandbox mode.

## Setup notes

- Requires a Groq API credential
- Requires a Google Sheets credential — replace `REPLACE_WITH_GOOGLE_SHEET_ID` with your
  Sheet ID; expects a `Complaints` tab
- Requires a Gmail credential
- Requires a Twilio credential (HTTP Basic Auth) for both WhatsApp nodes — replace
  `YOUR_TWILIO_ACCOUNT_SID` in both node URLs
- Replace all seven placeholder officer emails and WhatsApp numbers in `Process & Route`'s
  `routingMap` with your real department contacts
- If still using the Twilio WhatsApp Sandbox (see project 1d's README for the full
  walkthrough), every recipient number — citizen and officer — must have joined the
  sandbox via the join code, or their messages will silently fail to deliver

## Prerequisites

- Groq API credential
- Google Sheets credential with a Complaints tab
- Gmail credential
- Twilio credential with WhatsApp Sandbox (or approved Business API) access
