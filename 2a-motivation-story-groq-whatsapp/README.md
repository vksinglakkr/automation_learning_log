# 2a — Motivation Story · Groq AI + Twilio WhatsApp

First AI-generated content build in the series. A scheduled workflow asks Groq's
`llama-3.3-70b-versatile` model to write a short motivational story with a one-line
lesson and a bilingual (English + Hindi) Good Morning wish, then delivers the whole
thing via Twilio WhatsApp — reusing the delivery node from project 1d.

## Files

| File | Purpose |
|---|---|
| `workflow.json` | n8n workflow — sanitized (real personal WhatsApp number replaced with a placeholder; credential IDs are internal references only, safe as-is). |

## Flow

`Schedule Trigger` → `Set Message` → `Groq (Llama 3)` (HTTP Request to Groq's chat
completions API) → `Twilio: Send WhatsApp`

## What's new compared to 1a–1d

This is the first build to chain an AI response into a delivery node instead of sending
a static message. The prompt asks for four distinct sections in a single response
(story, lesson, English wish, Hindi wish) — the core lesson here is **structured prompt
design**: getting a language model to reliably return multiple labeled parts you can
use directly, rather than one block of free-form text.

## Setup notes

- Requires a Groq API credential (model used: `llama-3.3-70b-versatile`)
- Requires the same Twilio WhatsApp Sandbox setup as project 1d — see that project's
  README for the full Twilio account/sandbox/join-code walkthrough if not already done
- The AI's raw response is read via `$json.choices[0].message.content` in the Twilio
  node's message field — if you change the Groq model or prompt structure, this path
  may need adjusting to match the new response shape

## Common errors hit

- Malformed JSON from multiline prompt strings — keep prompt text on a single logical
  line or properly escape newlines in the JSON body
- Token limit exceeded on longer stories — the `max_tokens` value may need raising if
  responses get cut off
- WhatsApp sandbox session expired mid-test (same issue as project 1d) — rejoin via
  the Twilio join code if messages stop arriving

## Prerequisites

- Groq API key
- Completed project 1d (Twilio WhatsApp delivery already set up and working)
