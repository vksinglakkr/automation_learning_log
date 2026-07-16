# 1c — Good Morning · Email (SMTP)

Third build in the series: same scheduled message pattern as 1a/1b, delivered via raw SMTP
instead of Gmail — useful when the sending account isn't Gmail-based, or when you want a
delivery method that doesn't depend on Google's OAuth flow.

## Files

| File | Purpose |
|---|---|
| `workflow.json` | n8n workflow — sanitized (no real credentials or SMTP password). Replace the placeholder credential before importing. |

## Flow

`Schedule Trigger` → `Set Message` (builds the text) → `Email` (SMTP send)

## What's different from 1a/1b

Only the delivery node changes — same Scheduler and Set/Code nodes as the earlier builds.
The Email node authenticates via SMTP host/port/username/password rather than OAuth, which
is the core concept this build teaches: **not every email delivery method needs an OAuth app**.

## Setup notes

- Requires **2-Step Verification enabled** on the sending email account
- Requires a **16-digit app password** generated for that account (not the account's normal
  login password — this is the most common setup mistake)
- SMTP host/port must match your provider (e.g. Gmail SMTP is `smtp.gmail.com`, port `465`
  for SSL or `587` for TLS) — using the wrong port for the wrong encryption type is a common
  connection failure

## Common errors hit

- Using the account's normal password instead of the 16-digit app password — this fails
  silently or with an unhelpful auth error, not an obvious "wrong password" message
- Wrong SMTP port for TLS vs. SSL — connection either times out or is rejected depending
  on the mismatch

## Prerequisites

- 2-Step Verification enabled on the sending account
- App password generated
