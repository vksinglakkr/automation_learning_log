# 10 — Bulk Email Broadcast

The simplest possible bulk-send pattern: read every row from a Sheet, and send one
personalized Gmail message per row, triggered manually whenever needed. No scheduling,
no filtering — just "run it and everyone in the sheet gets an email."

## Files

| File | Purpose |
|---|---|
| `workflow.json` | n8n workflow — sanitized (real Sheet ID replaced with a placeholder; credential IDs are internal references only, safe as-is). |

## Flow

`Manual Trigger (Run when needed)` → `Get 100 Users` (Google Sheets read) → `Send Email
(Gmail)` — one execution of the Gmail node per row returned by the Sheet, using each
row's `Name` and `Email` columns to personalize the message.

## What this build teaches

- **One node, many sends**: when a node further down the chain receives multiple items
  (one per Sheet row), n8n automatically runs that node once per item — so a single
  Gmail node here sends N separate emails, no loop or batching node required for a
  small list
- **Personalization via expressions**: `{{ $json.Name }}` and `{{ $json.Email }}` pull
  a different value on each of the N runs, since each run operates on its own row
- **Manual Trigger for controlled, on-demand sends** — appropriate for a broadcast that
  shouldn't fire automatically on a schedule

## ⚠️ Worth knowing before scaling this up

This is intentionally minimal, and that simplicity comes with real limits once the list
gets larger than a handful of names:

- **No rate limiting.** Gmail (and Google Workspace) accounts have daily and per-minute
  sending caps. Firing 100+ emails in one execution with no delay between them risks
  hitting a throttling error partway through, with no way to tell which recipients
  already got the email and which didn't.
- **No "already sent" tracking.** Running the workflow twice emails everyone twice —
  there's no status column being written back to the Sheet to mark who's been contacted,
  unlike the complaint-system or Good Morning projects which log status changes.
- **The node name promises more than the config delivers.** `Get 100 Users` doesn't
  actually cap the read at 100 rows — there's no limit/range set on the Google Sheets
  node, so it reads however many rows actually exist in `Sheet4`. Fine for a small test
  list, but worth an explicit limit (or a Sheet formatted to always contain exactly the
  intended batch) before relying on the name as documentation.

For a real production bulk-send, the next step up from this project would add: a
`Split In Batches` node with a `Wait` between chunks, and a status column write-back
after each send — both patterns already used elsewhere in this repo (see the
multi-website monitoring and complaint-system projects for batching and status-logging
examples respectively).

## Setup notes

- Requires a Gmail credential
- Requires a Google Sheets credential; expects a sheet with at least `Name` and `Email`
  columns
- Replace `REPLACE_WITH_GOOGLE_SHEET_ID` with your own Sheet ID

## Prerequisites

- Gmail credential
- Google Sheets credential with a list of names + emails to broadcast to
