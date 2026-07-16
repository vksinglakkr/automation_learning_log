# 1b — Good Morning · Gmail

Second build in the series: same scheduled message pattern as 1a, swapped to send via Gmail
instead of logging to a Sheet. Isolates the difference between a data-source node and a
delivery-channel node — same trigger and message logic, different destination.

## Files

| File | Purpose |
|---|---|
| `workflow.json` | n8n workflow — sanitized (no real credentials). Replace the placeholder credential before importing. |

## Flow

`Schedule Trigger` → `Set Message` (builds the text) → `Gmail: Send`

## What's different from 1a

Only the last node changes — 1a appends to a Sheet, 1b sends an email. The Scheduler and
Code/Set nodes are reused as-is. This is intentional: the project is designed to show that
swapping a *destination* node doesn't require touching the trigger or message-building logic.

## Setup notes

- Requires a Gmail OAuth2 credential in n8n
- **Gmail API must be explicitly enabled** in Google Cloud Console for the project tied to
  your OAuth credential — this is the most common blocker on this build
- Recipient address is set directly in the Gmail node's "To" field after import

## Common errors hit

- Gmail API not enabled on the Google Cloud project — shows as a permissions/API error on
  first run, not at credential-setup time
- OAuth token expiry requiring re-authentication after a period of inactivity

## Prerequisites

- Completed project 1a (same base pattern)
- Gmail API enabled in Google Cloud Console
