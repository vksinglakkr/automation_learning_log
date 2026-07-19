# 9b — HTTP Node Series, Day 2 · Interview Travel Weather-Risk Checker

Second build in the HTTP Request node series. A Training & Placement cell runs a batch
check across every student with an upcoming interview: it looks up the destination
city's live weather forecast for the interview date, and automatically clears the trip
(hotel + travel pass) or defers it and notifies both the student and the company's HR
team — depending on nothing but a real-time API response.

## Files

| File | Purpose |
|---|---|
| `workflow.json` | n8n workflow — sanitized (real Google Sheet ID replaced with a placeholder; credential IDs are internal references only, safe as-is). |
| `sample-data.csv` | Fully fictional example rows (fake student names, `@student.edu` addresses, fictional companies) — safe to publish as-is, no sanitization needed. |

## Flow

`Admin Manual Run` → `Read Batch Data` (Google Sheets) → `Check Chances < 3` (IF: skip
students who've already been rescheduled 3 times) → `Live Forecaster` (HTTP Request to
Open-Meteo) → `Max Temp > 40°C` (IF) → **branches:**
- **TRUE (dangerous):** `Update: High Risk` (Sheet: status = Deferred) → `Gmail: Student Risk` → `Gmail: HR Risk`
- **FALSE (safe):** `Update: Success` (Sheet: status = Cleared, pass issued, hotel confirmed) → `Gmail: Student Success`

---

## 📖 The story to narrate to students

*Use this as the framing when introducing Day 2 — read it before opening n8n.*

> "Yesterday, on Day 1, we built a system that looks at a **static profile** — a
> GitHub username — and makes a decision based on something that doesn't change from
> minute to minute. A student's repo count is roughly the same today as it will be
> tomorrow.
>
> Today, we're building something that reacts to the **real world, right now**. A
> student is booked to fly to Phoenix for an interview. What if a heatwave hits the
> day before? Nobody in the T&P office is going to sit and manually check the weather
> for every single student, every single city, every single day. That's exactly the
> kind of repetitive, easy-to-forget task automation exists for.
>
> So today's mission: build a system that reads a whole batch of upcoming interviews
> from a spreadsheet, calls a **live weather forecasting API** for each student's exact
> travel coordinates and travel date, and — based purely on what that API says *right
> now* — either clears the trip and confirms the hotel, or pulls the plug and emails
> both the student and the company's HR team to reschedule. No human has to remember
> to check anything. The weather decides, and the system acts."

### Why Open-Meteo specifically

- **No API key required.** Day 1 already introduced calling an external REST API
  (GitHub). Day 2 deliberately keeps that same "just call a URL" simplicity so the
  *new* concept — query parameters — is the only thing students have to focus on,
  not credential setup.
- **Query parameters, not a URL path.** GitHub's API took the username as part of the
  URL path (`/users/{username}`). Open-Meteo takes `latitude`, `longitude`, `start_date`,
  and `end_date` as separate query parameters — a genuinely different, very common way
  APIs accept input, and worth teaching as its own pattern.
- **A nested response worth digging into.** The forecast comes back as
  `{ daily: { temperature_2m_max: [value] } }` — an object containing an array. Day 1's
  GitHub response was flat (`public_repos` sat right at the top level). Day 2 makes
  students reach one level deeper (`$json.daily.temperature_2m_max[0]`), a small but
  real step up in comfort with JSON.
- **It's free and has no signup friction** — ideal for a classroom where 20+ students
  might be hitting the same API within the same hour.

### Day 1 vs. Day 2 — what actually changed

| | Day 1 (9a) | Day 2 (9b) |
|---|---|---|
| **API called** | GitHub (`/users/{username}`) | Open-Meteo (`/v1/forecast`) |
| **How input reaches the API** | URL path parameter | Multiple query parameters |
| **Response shape** | Flat object | Nested object containing an array |
| **Workflow structure** | Two separate workflows (live ingestion + admin batch) | One workflow, run manually as a batch |
| **Decision logic** | Single IF (repo count threshold) | Two chained IFs (reschedule limit, then temperature threshold) |
| **Consequence of the decision** | One Sheet update + one email | Sheet update + **two different emails to two different people** (student and company HR), with entirely different content depending on which branch fires |
| **What it teaches beyond Day 1** | Baseline: calling a live external API and acting on the result | Query parameter construction, deeper JSON parsing, multi-branch consequences, and coordinating a decision that affects more than one recipient |

The throughline for students: **Day 1 taught "call an API, get a fact, make one
decision." Day 2 teaches "call an API, get a fact, and fan that single decision out
into different actions for different people."** That fan-out — one decision point,
multiple stakeholders affected differently — is the shape of almost every real
administrative automation from here on.

---

## Setup notes

- Requires a Google Sheets credential; expects a sheet with the columns shown in
  `sample-data.csv`
- No credential needed for the Open-Meteo call itself — it's a public, keyless API
- Requires a Gmail credential
- Replace `REPLACE_WITH_GOOGLE_SHEET_ID` (used in three nodes) with your own Sheet ID
- The `Check Chances < 3` IF node prevents endlessly re-deferring the same student —
  worth explaining as a safeguard against infinite rescheduling, not just a random check

## Prerequisites

- Completed 9a (comfort with the HTTP Request node and calling an external API)
- Google Sheets credential
- Gmail credential
