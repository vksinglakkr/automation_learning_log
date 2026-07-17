# 3c — Database Health Checker · Registration Data Quality Auditor

Not a connectivity/uptime checker — this validates the **data quality** of a Google
Sheet acting as a registration database (built for the Gita Quiz, IGM 2025). Run on
demand, it checks every record's name/mobile/district formatting, flags duplicates by
a name+mobile fingerprint, splits records into Clean vs. Invalid, and sends a
Groq-generated bilingual (English + Hindi) quality report over WhatsApp.

## Files

| File | Purpose |
|---|---|
| `workflow.json` | n8n workflow — sanitized (real Sheet ID and personal WhatsApp number replaced with placeholders; credential IDs are internal references only, safe as-is). |

## Flow

`Manual Trigger` → `Fetch Registrations` (Google Sheets read) → `Validate All Records`
(Code: validates + aggregates every row into one summary) → **three parallel branches:**
`Prepare Clean Rows` → `Append to Clean DB`, `Prepare Error Rows` → `Log to Error Report`,
and `Groq (Llama 3)` → `Format Alert Message` → `Twilio WhatsApp Alert`

## What this build teaches

- **Manual Trigger for on-demand admin checks** — not scheduled, run deliberately when
  someone wants a data-quality snapshot
- **Run-once-for-all-items validation**: instead of processing row by row, `Validate All
  Records` loops over every input item in a single Code node execution and returns one
  aggregated summary object — simpler than per-item branching for this kind of batch audit
- **Fingerprint-based duplicate detection**: a composite key (`name|mobile`) catches
  duplicate registrations even if formatting differs slightly
- **Field normalization**: district name aliases (`kkr`, `thanesar`, `pehowa` all map to
  `Kurukshetra`), name capitalization, and mobile digit cleaning happen before validation
- **Three-way fan-out**: one validation step feeds clean-row logging, error-row logging,
  and an AI summary — all in parallel, not sequentially
- **AI report with a fixed structure**: the prompt requests English summary, Hindi
  summary, and a numbered action list in an exact format, making the output predictable
  enough to paste directly into a WhatsApp message

## Setup notes

- Requires a Google Sheet with a `Registrations` tab (source data) plus **pre-created**
  `Clean_DB` and `Error_Report` tabs
- `Append to Clean DB` and `Log to Error Report` use **auto-map-by-column-name** — the
  `Clean_DB` tab needs headers `Name, Mobile, District, Fingerprint, Checked_At` and
  `Error_Report` needs `Original_Name, Original_Mobile, Original_District, Status,
  Issues, Issue_Count, Checked_At`, matching exactly, or rows won't map correctly
- Requires a Groq API credential
- Requires a Twilio credential (WhatsApp)
- Replace `REPLACE_WITH_GOOGLE_SHEET_ID` (used in three nodes) and
  `REPLACE_WITH_YOUR_WHATSAPP_NUMBER` with your own values
- The `VALID_DISTRICTS` list in `Validate All Records` is specific to Haryana districts —
  update it if reusing this for a different state or a non-district-based event

## Prerequisites

- Google Sheet with Registrations, Clean_DB, and Error_Report tabs already set up
- Groq API credential
- Twilio credential with WhatsApp access
