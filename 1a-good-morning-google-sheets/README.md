# 1a — Good Morning · Google Sheets

First build in the series: a daily scheduled message logged to a Google Sheet.
Covers n8n install, interface orientation, and Google OAuth setup.

## Files

| File | Purpose |
|---|---|
| `workflow.json` | n8n workflow — sanitized (no real credentials/Sheet IDs). Replace the placeholders with your own before importing. |
| `sample-log.csv` *(rename from `GoodMorning - Sheet1.csv`)* | Example export showing the log format the workflow produces. Safe to publish — contains only generated message text and timestamps, no personal data. |

## Flow

`Schedule Trigger` (every 24h) → `Set Message` (builds text + timestamp) → `Google Sheets: Append row`

## sample-log.csv columns

| Column | Description |
|---|---|
| `Message` | The scheduled text sent, e.g. "👋 Good Morning! n8n is working perfectly." |
| `msgDate` | Timestamp of the run, format `yyyy-MM-dd HH:mm:ss` |

## Setup notes

- Requires a Google Sheets OAuth2 credential in n8n
- Target Sheet ID and tab name must be set in the `Append row in sheet` node after import
- Interval is set to every 24 hours by default — adjust in the `Schedule Trigger` node
