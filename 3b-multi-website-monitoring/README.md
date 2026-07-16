# 3b — Multi-Website Monitoring

Extends the single-site checker (3a) to a list of government sites, checking each one on
a schedule, branching per-item into UP/DOWN status, and sending an AI-drafted alert email
only when a site is down.

## Files

| File | Purpose |
|---|---|
| `workflow.json` | n8n workflow — sanitized (real personal email replaced with a placeholder; see **Known issues** below before relying on this in production). |

## Flow

`Schedule Trigger` → `Set Sites List` (hardcoded array of `{name, url}`) → `Split Into Sites`
→ `HTTP Request` (per site) → `IF: Site Up?` → `Set: Status UP` / `Set: Status DOWN` →
`Merge UP and DOWN` → `IF: Status is DOWN?` → `AI_Statistics_Generator2` (Groq, drafts an
alert) → `Gmail: Send Alert`

## What this build teaches

- **Iterating over a list**: `Split Into Sites` turns one array into N separate items,
  each processed independently through the same check
- **Per-item branching**: each site independently takes the UP or DOWN path based on its
  own HTTP response
- **Recombining branches**: `Merge` brings the UP and DOWN paths back into one stream
  before filtering for alerts
- **Conditional AI generation**: Groq is only called for sites that are actually down,
  not on every check — avoiding unnecessary API calls

## ⚠️ Known issues — review before relying on this

This workflow runs, but has real bugs worth fixing in n8n before treating it as a
production monitor:

1. **The alert email always names the first site in the list**, not the one that's
   actually down. `Gmail: Send Alert` pulls the site name/URL from
   `$('Set Sites List').item.json.sites[0]` — always index 0 — instead of
   `$('Set: Status DOWN').item.json.site_name` / `.url`, which correctly carries the
   site that triggered the alert. **Fix**: repoint the subject/message expressions to
   `Set: Status DOWN`'s output.
2. **The Groq-generated alert text is discarded.** `AI_Statistics_Generator2` writes a
   full alert message, but `Gmail: Send Alert` sends its own separate static text
   instead of referencing `{{ $json.choices[0].message.content }}`. As written, the AI
   step has no effect on the actual email sent.
3. **Neither the Groq node nor the Gmail node has a credential attached** in this export
   — both need one selected in n8n or the workflow fails immediately on run.
4. **Merge node uses "Combine All" mode**, which cross-joins items rather than simply
   concatenating them. Since each site independently ends up in either the UP or DOWN
   branch, "Append" mode is normally what's intended here — "Combine All" can produce
   duplicate or mismatched rows if more than one site is UP and more than one is DOWN
   in the same run.
5. `Time:` in the email references `$('Schedule Trigger').item.json.timestamp`, which
   Schedule Trigger doesn't actually output — this field will likely render blank.

## Setup notes

- Edit the site list directly in the `Set Sites List` node's array — add/remove
  `{name, url}` entries as needed
- Requires a Groq API credential (model used: `llama-3.3-70b-versatile`)
- Requires a Gmail credential
- Replace `REPLACE_WITH_ALERT_EMAIL@example.com` with your real alert recipient after
  importing

## Prerequisites

- Completed project 3a (single-site checker)
- Groq API credential
- Gmail credential
