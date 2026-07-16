# 1d — Good Morning · Twilio (WhatsApp)

Fourth build in the series: same scheduled message pattern as 1a/1b/1c, delivered via
WhatsApp using Twilio's API instead of email — introduces a paid third-party service and
its credential model, plus WhatsApp's sandbox-testing constraints.

## Files

| File | Purpose |
|---|---|
| `workflow.json` | n8n workflow — sanitized (real personal WhatsApp number replaced with a placeholder; credential ID is an internal reference only, safe as-is). |

## Flow

`Schedule Trigger` → `Set Message` (builds the text) → `Twilio: Send WhatsApp`

## Twilio setup — full requirements

This is the first build in the series using a paid external API, so the setup has more
steps than the earlier email-based ones:

1. **Create a Twilio account** at twilio.com — a free trial account is enough for this
   sandbox-based build.
2. **Get your Account SID and Auth Token** from the Twilio Console dashboard — these are
   what n8n's Twilio credential needs.
3. **Activate the WhatsApp Sandbox**: Console → Messaging → Try it out → Send a WhatsApp
   message. Twilio gives you a sandbox number (`+1 415 523 8886` — this is the same for
   every developer, not account-specific) and a join code like `join <two-words>`.
4. **Join the sandbox from your own WhatsApp**: send that join code as a WhatsApp message
   to the sandbox number from the phone you want to receive alerts on. This step must be
   repeated periodically — Twilio sandbox sessions expire after a period of inactivity
   (commonly 72 hours), after which you'll need to rejoin.
5. **Set the `from` field** in the Twilio node to the sandbox number (`+14155238886`) and
   the `to` field to your own WhatsApp number in E.164 format (e.g. `+91XXXXXXXXXX`).
6. **Create the Twilio credential in n8n**: paste your Account SID and Auth Token from
   step 2.

## Sandbox vs. production

The sandbox is free and fine for learning/testing, but has real limits: only numbers that
have joined via the join code can receive messages, and sessions expire. For a real
production alert system (not just this learning build), Twilio requires WhatsApp Business
API approval through Meta, which is a separate, longer process with its own verification
requirements.

## Common errors hit

- Recipient number not verified/joined in the Twilio sandbox — messages silently fail to
  deliver rather than throwing an obvious error
- Sandbox session expired (no message sent in 72+ hours) — requires rejoining via the
  join code before messages will deliver again
- Country code formatting mismatch — numbers must be in full E.164 format
  (`+91...`, not `091...` or a bare 10-digit number)

## Prerequisites

- Twilio trial account
- Verified/joined sandbox number on the recipient's WhatsApp
