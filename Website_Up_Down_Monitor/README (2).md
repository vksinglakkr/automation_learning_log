# 3d — Website Up/Down Monitor · AI Alerts (Groq)

A state-aware upgrade to the basic single-site checker (project 3a). Checks the target site
every 5 minutes, compares the result against the last logged row in Google Sheets, and fires
an alert only at the exact moment the site goes down or recovers — not on every single check.

## Files

| File | Purpose |
|---|---|
| `workflow.json` | n8n workflow — sanitized (real Sheet ID and alert email already replaced with placeholders; credential IDs are internal references only, safe as-is). |

## Flow

`Every 5 Minutes` → `Check Website` (HTTP Request) → `Build Log Record` → `Read Last Status`
(Google Sheets) → `Compare With Previous` (Code) → `Log Check to Sheet` → branches on
`just_went_down` / `just_recovered` → `Groq` (bilingual alert or recovery text) →
`Extract AI Summary` → `Send Email` (Gmail)

## Why the state comparison matters

Without it, a simple scheduled checker sends a new alert on *every* run while a site is down —
every 5 minutes, forever. This workflow reads the last logged status, compares it to the current
check, and only branches into the alert/recovery path on the exact transition. That's the core
lesson of this build: **compare against history, don't just react to the current value.**

## Setup notes

- Requires a Google Sheet with a `SiteLog` tab and columns: `site_name`, `checked_at`,
  `status_code`, `is_up`, `error_message`
- Requires a Groq API credential (model used: `llama-3.3-70b-versatile`)
- Requires a Gmail credential
- Replace `REPLACE_WITH_GOOGLE_SHEET_ID` and `REPLACE_WITH_ALERT_EMAIL@example.com` with your own
  before importing
- Target URL and check interval are set in the `Every 5 Minutes` and `Check Website` nodes —
  adjust both if monitoring a different site or frequency

## Common errors hit

- `Read Last Status` returning rows in the wrong order without a sort, breaking the
  "last row" comparison logic
- AI request failing silently if Groq's response shape changes — the Code node's fallback
  text catches this, but worth testing occasionally
- Repeated down-alerts if the transition flags aren't correctly reset between runs
