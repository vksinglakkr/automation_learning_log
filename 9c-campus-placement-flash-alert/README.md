# 9c — HTTP Node Series, Day 3 · Secure Campus Placement Flash-Alert Engine

Third build in the HTTP Request series. When the T&P cell logs a student's selection,
this workflow finds every un-published entry, wraps it in a JSON payload, authenticates
with that department's own Bearer token, and POSTs it to a central display board server
— then marks the row as published so it's never sent twice.

## Files

| File | Purpose |
|---|---|
| `workflow.json` | n8n workflow — built from placeholders throughout (Sheet ID, credential ID, display board URL, and all department tokens). Nothing to sanitize since no real values were ever in it, but every placeholder must be filled in before this will run. |
| `sample-data.csv` | Fictional sample rows — safe to publish as-is. |

## Flow

`Run Publish Job` (Manual Trigger) → `Get Pending Entries` (Google Sheets, filtered to
`Publish_Status = Pending`) → `Attach Department Token` (Code: looks up the right Bearer
token for that row's department, builds the JSON payload) → `Publish to Display Board`
(HTTP POST with JSON body + Authorization header) → `Mark as Published` (Google Sheets
update, matched by Entry_ID)

## What this build teaches

- **Becoming a publisher, not just a consumer.** Days 1 and 2 both called an API to
  *read* something (a GitHub profile, a weather forecast). Day 3 is the first build
  where the workflow *writes* — it creates a new record on someone else's server.
- **JSON body instead of a URL.** GitHub's data arrived via a simple GET with nothing to
  hide. Open-Meteo's input was visible query parameters. Here, the payload is real data
  about a specific student — it belongs in a POST body, not a URL anyone glancing at
  a browser history or server log could read.
- **Authorization headers.** This is the first project in the whole series that sends
  a Bearer token — the standard way a server proves "I am allowed to write here" rather
  than just "I am allowed to look."
- **Why the built-in credential picker isn't enough here.** Every credentialed node
  used so far (Gmail, Twilio, Groq) picks ONE static credential in the node's UI. But
  this workflow needs a *different* token depending on which department's row is being
  processed — the credential has to change per item, which n8n's node-level credential
  selector can't do. That's why the token lookup happens in a Code node instead, and
  gets passed into the HTTP Request node's header as an expression
  (`{{ $json.auth_header_value }}`) rather than through the credential UI.
- **Traceability and revocation.** Because each department has its own token, the
  display board server can tell *which* department published a given alert, and if one
  department's token is ever compromised, revoking it doesn't affect the other nine.

## Day 1 → Day 2 → Day 3 — the full arc

| | Day 1 (9a) | Day 2 (9b) | Day 3 (9c) |
|---|---|---|---|
| **Direction** | Read | Read | **Write** |
| **HTTP method** | GET | GET | **POST** |
| **How input reaches the API** | URL path parameter | Query parameters | **JSON request body** |
| **Auth** | None (public API) | None (public API) | **Bearer token, per department** |
| **Credential handling** | N/A | N/A | Token looked up dynamically — the static credential picker isn't enough |
| **What's new to learn** | Calling a live external API at all | Query params + nested JSON responses | Publishing data, hiding it in a body, and authenticating the write |

The throughline: Day 1 taught *"the internet has live facts you can pull."* Day 2 taught
*"you can shape how you ask for those facts, and the answers can be more complex than a
flat object."* Day 3 flips the direction entirely — *"you can also be the one putting
facts onto someone else's server, and when you do, you need to prove who you are."*
That's the real jump from a personal automation script to something that behaves like
enterprise software talking to another system.

## ⚠️ Before this actually runs

Every placeholder needs a real value — this file was authored directly for teaching, not
sanitized from a real export, so there's no working values to fall back on:

- `REPLACE_WITH_GOOGLE_SHEET_ID` (two nodes)
- `REPLACE_WITH_YOUR_CREDENTIAL_ID` (two Google Sheets nodes — set via n8n's credential
  picker as usual, this placeholder is just illustrative)
- `REPLACE_WITH_DISPLAY_BOARD_SERVER_URL` — the actual server your display board reads from
- All five `REPLACE_WITH_..._DEPT_TOKEN` values in `Attach Department Token` — and note
  the code comment: even these shouldn't be hardcoded in a real deployment; pull them
  from n8n environment variables or a secrets manager instead of typing them into a Code
  node directly

## Setup notes

- Requires a Google Sheets credential
- Requires a real endpoint on the display board server that accepts POST + Bearer auth
- Extend `TOKEN_MAP` in `Attach Department Token` to cover all of your actual departments
  (the lab example ships with 5; the real system is designed for up to 10)

## Prerequisites

- Completed 9a and 9b
- Google Sheets credential
- A display board server endpoint with per-department Bearer tokens issued
