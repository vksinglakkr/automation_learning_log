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

## Twilio WhatsApp setup — full requirements

1. **Create a Twilio account** at twilio.com — a free trial account is enough for this
   sandbox-based build.
2. **Get your Account SID and Auth Token** from the Twilio Console dashboard — these are
   what n8n's Twilio credential needs.
3. **Activate the WhatsApp Sandbox**: Console → Messaging → Try it out → Send a WhatsApp
   message. Twilio gives you a sandbox number (`+1 415 523 8886` — the same for every
   developer, not account-specific) and a join code like `join <two-words>`.
4. **Join the sandbox from your own WhatsApp**: send that join code as a WhatsApp message
   to the sandbox number from the phone you want to receive the story on. Sandbox sessions
   expire after a period of inactivity (commonly 72 hours), so this step needs repeating
   if messages stop arriving.
5. **Set the `from` field** in the Twilio node to the sandbox number (`+14155238886`) and
   the `to` field to your own WhatsApp number in E.164 format (e.g. `+91XXXXXXXXXX`).
6. **Create the Twilio credential in n8n**: paste your Account SID and Auth Token from
   step 2.

### Sandbox vs. production

The sandbox is free and fine for learning/testing, but only numbers that have joined via
the join code can receive messages, and sessions expire. A real production alert system
would need WhatsApp Business API approval through Meta — a separate, longer process with
its own verification requirements, outside the scope of this learning build.

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
