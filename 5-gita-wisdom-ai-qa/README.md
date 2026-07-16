# 5 — Gita Wisdom · AI Q&A

A visitor submits a question about the Bhagavad Gita, along with a language choice
(English/Hindi) and a tone style (simple/reflective/scholarly). The workflow builds a
style-specific system prompt, asks Groq, then extracts a clean answer and — if the model
included one — a single verse citation (e.g. `BG 2.47`), returning structured JSON for
the front end to render.

## Files

| File | Purpose |
|---|---|
| `workflow.json` | n8n workflow — sanitized (no real credentials; credential ID is an internal reference only, safe as-is). |

## Flow

`Webhook` (POST `/gita-wisdom`) → `Build Prompt` (constructs a style-specific system
prompt) → `Ask Groq` → `Extract Answer` (parses the response, pulls out a trailing verse
citation via regex) → `Respond` (JSON, with CORS headers for a public front end)

## Request format

The webhook expects a JSON body:

```json
{
  "question": "What does the Gita say about Ahimsa?",
  "language": "english",
  "style": "simple"
}
```

- `language`: `"english"` (default) or `"hindi"` — replies entirely in the chosen language
- `style`: `"simple"` (default, 3-5 sentences, plain language), `"reflective"` (contemplative
  tone, ends with a reflective question), or `"scholarly"` (6-10 sentences, philosophical
  context — Karma Yoga, Sankhya, Bhakti)

## Response format

```json
{
  "answer": "...",
  "citation": "BG 2.47",
  "model": "openai/gpt-oss-120b"
}
```

`citation` is `null` if the model didn't cite a specific verse — the prompt explicitly
instructs it not to fabricate one when no verse fits cleanly.

## What this build teaches

- **Prompt-level guardrails**: the system prompt explicitly tells the model to ground
  answers in the source text, never claim something the Gita doesn't teach, and omit a
  citation rather than invent one — a real example of steering model behavior through
  instructions rather than post-processing
- **Dynamic prompt construction**: the system prompt changes shape based on user-selected
  `style`, built from a lookup object rather than hardcoded text
- **Extracting structured data from free text**: the citation is pulled out of the AI's
  prose response with a regex (`BG\s?(\d{1,2})\.(\d{1,3})\s*$`) rather than requesting
  JSON output directly
- **CORS for a public webhook**: `Access-Control-Allow-Origin: *` is set explicitly so a
  front end hosted elsewhere can call this webhook directly from the browser

## Setup notes

- Requires a Groq API credential
- Model used: `openai/gpt-oss-120b`
- Webhook path: `/gita-wisdom` (POST) — must be in **Production** mode, not Test, for a
  live front end to call it reliably

## Common errors hit

- Webhook left in Test mode instead of Production, breaking the live page
- Citation regex not matching if the model formats the citation with extra punctuation
  or doesn't place it on the final line
- No question provided — the `Build Prompt` Code node throws explicitly in this case,
  so the front end needs to handle a non-200 response, not just parse JSON blindly

## Prerequisites

- Groq API key
- A front-end form posting JSON (`question`, `language`, `style`) to the webhook URL
