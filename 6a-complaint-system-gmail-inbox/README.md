# 6 — Complaint System · Aadhar, Ration, PPP, Pension, Certificates

Citizens email complaints directly to a monitored inbox — no web form. A Gmail Trigger
polls every minute for new mail matching a broad complaint-related keyword filter
(English + Hindi). Each email is deduplicated, AI-classified as genuine or not, routed
to the correct department, logged with a reference number, and answered with two
parallel emails: an acknowledgement to the citizen and a forward-for-action to the
concerned officer.

## Files

| File | Purpose |
|---|---|
| `workflow.json` | n8n workflow — sanitized (real Sheet ID, personal routing email addresses, and Gmail label ID all replaced with placeholders; credential IDs are internal references only, safe as-is). |

## Flow

`New Complaint Email` (Gmail Trigger, polls every minute) → `Check Already Processed`
(Sheets lookup by Gmail message ID) → `Check Result` (Code, safely handles "no match
found") → `Is New Email?` → `AI Summary` (Groq classifies genuine vs. not, extracts
department/priority/summary) → `Is Genuine Complaint?` → `Department Router` (Code,
keyword-to-department mapping) → `Log to Google Sheets` → **parallel:** `Forward to
Officer` + `Acknowledge to Citizen` → `Label — Forwarded for Action` → `Mark Email as Read`

## What this build teaches

- **Polling-based email triggers**: Gmail Trigger with a broad multilingual `q` filter
  (English + Hindi keywords) catches complaints regardless of exact subject wording
- **Dedup-before-processing pattern**: looking up the incoming email's ID in the log
  *before* doing any expensive work (AI call, routing), using `alwaysOutputData` +
  `continueOnFail` so a "not found" result doesn't break the workflow
- **AI as a gatekeeper, not just a summarizer**: the Groq call first decides whether an
  email is a genuine complaint at all (filtering out newsletters, OTPs, auto-replies)
  before any routing happens
- **Rule-based routing from AI-extracted structure**: the AI returns a labeled
  `DEPARTMENT:` field in plain text, which a Code node parses with a regex and maps to
  an officer email + label
- **Fan-out from one node**: `Log to Google Sheets` triggers two independent email sends
  in parallel (citizen ack + officer forward), not sequentially

## ⚠️ Known issues — review before relying on this

1. **`Is New Email?` uses OR instead of AND.** The three conditions — (not a duplicate),
   (subject contains "Complaint"), (snippet contains "Complaint") — are combined with
   `OR`, meaning only one needs to be true. An email that **is** a duplicate (already
   logged) but whose subject happens to contain the word "Complaint" will still pass
   through and get reprocessed, since the OR logic doesn't require the non-duplicate
   condition specifically. **Fix**: change the combinator to `AND` so it requires
   "not a duplicate" **and** a matching subject/snippet.
2. **Case-sensitive field mismatch in `Forward to Officer`.** The Subject row in that
   email references `$('New Complaint Email').item.json.subject` (lowercase `s`), while
   every other reference in the workflow correctly uses `.Subject` (capital `S`). This
   field will likely render blank in the officer's forwarded email.
3. **The "Complaint" keyword check is narrower than the trigger's own filter.** The Gmail
   Trigger's search matches many keywords beyond the literal word "complaint" — pension,
   ration, aadhaar, shikayat, etc. — but `Is New Email?` only checks for the literal
   substring "Complaint" (English only). In practice this barely matters today because
   of issue #1's OR logic, but if that's fixed to AND, this narrower check would start
   rejecting many legitimately trigger-matched emails. Worth widening to match the
   trigger's own keyword list, or removing this check and trusting the Gmail Trigger's
   filter plus the AI classification step instead.

## Setup notes

- Requires a Gmail account credential with trigger + send + label permissions
- Requires a Groq API credential
- Requires a Google Sheets credential with a `Complaints` tab — columns: `Email ID`,
  `Timestamp`, `From`, `Subject`, `Department`, `Routed To`, `AI Summary`, `Reference`,
  `Status`
- Replace `REPLACE_WITH_GOOGLE_SHEET_ID` with your own Sheet ID (used in two nodes)
- Replace the department routing emails in the `Department Router` Code node's
  `routingMap` with your real officer addresses
- Create a Gmail label for "forwarded for action" and replace
  `REPLACE_WITH_YOUR_GMAIL_LABEL_ID` with its real label ID

## Prerequisites

- Gmail account receiving citizen complaint emails
- Groq API credential
- Google Sheets credential with a Complaints tab already set up
- Gmail labels created for post-processing
