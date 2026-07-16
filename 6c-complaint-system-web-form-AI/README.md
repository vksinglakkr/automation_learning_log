Here is a complete, professional `README.md` file designed for your citizen complaint routing and preview workflows. It clearly explains the architecture, setup requirements, and data flow.

---

```markdown
# Citizen Complaint Automation Workflows (n8n)

An automated, AI-powered citizen grievance routing system built in n8n. This system ingests citizen complaints via webhooks, processes and improves the text using LLMs (Groq/Llama-3.3), classifies the appropriate government department, logs the case in a central tracking ledger (Google Sheets), and dispatches alerts via Email (Gmail) and WhatsApp (Twilio) to both the assigned handling officer and the citizen.

The system consists of two primary operational workflows:
1. **Core Processing & Routing Workflow:** Handles the backend intake, classification, database logging, and multi-channel notifications.
2. **AI Preview Workflow:** Provides an instantaneous, low-latency formatting preview back to the frontend form before final submission.

---

## System Architecture & Data Flow

### 1. Main Complaint Processing & Routing Workflow

```

[HTML Form Webhook] ➔ [Map & Prepare Data] ➔ [AI Improve & Classify (Groq)]
│
[Extract & Route Code]
│
┌──────────────────────────────┴──────────────────────────────┐
[Log to Google Sheets]                                       [Respond to HTML Form (200 OK)]
│
┌─────────────┴─────────────┐
[Email to Officer]          [Email to Citizen]
│                           │
[WhatsApp Alert to Officer] [WhatsApp to Citizen]

```

### 2. Live AI Preview Workflow

```

[Form Preview Button] ➔ [AI Preview Webhook] ➔ [LLM Optimization (Groq)] ➔ [Return Clean Text to Form]

```

---

## Component Breakdowns

### Workflow 1: Core Processing & Routing
* **Receive Complaint (Webhook):** Exposes a secure POST endpoint (`/webhook/citizen-complaint-kkr`) to capture incoming form submissions.
* **Map & Prepare Data (Code node):** Normalizes user fields, sanitizes phone formatting into E.164 standards, and generates a unique tracking reference string (`#REFXXXXXX`).
* **AI Improve & Classify (HTTP Request):** Utilizes Groq’s `llama-3.3-70b-versatile` model to rewrite conversational or unstructured text into a formal administrative petition. It concurrently maps the issue to a structural category, assigns a priority level, and drafts a one-line executive summary.
* **Extract & Route (Code node):** Uses regular expressions to parse out the structured metrics returned by the LLM and runs a hardcoded mapping matrix to automatically bind the issue to the relevant department's official operational email inbox and profile label.
* **Log to Google Sheets:** Records an immutable audit log row containing comprehensive metadata, original submission text, and optimized text fields.
* **Notification Layer:** Spreads concurrent citizen confirmations and official operational directives across custom HTML Gmail templates and structured Twilio WhatsApp API calls.

### Workflow 2: Frontend AI Preview
* **AI Preview Webhook:** Collects instantaneous state updates from the user's browser client before final record validation.
* **AI Preview Node:** Fast-tracks context directly to the LLM backend with structural instructions to skip administrative classification tags and return purely the polished formal transcript.
* **Return AI Preview:** Delivers a clean JSON object containing the optimized text to be rendered inline on the UI input card.

---

## Hardcoded Routing Matrix

The system dynamically filters incoming payload attributes inside the `Extract & Route` engine against these designated systemic departments:

| Department Identifier | Target Agency / Label |
| :--- | :--- |
| `PENSION` | DSWO (Pension) |
| `AADHAAR` | ADC (Aadhaar) |
| `PPP` | ADC (PPP) |
| `RATION` | DFSC (Ration) |
| `REVENUE` | DRO (Revenue) |
| `CRED` | ADC (CRED) |
| `OTHERS` | General Office (Fallback) |

---

## Installation & Configuration Setup

### Prerequisites
* A running **n8n** instance (Self-hosted or Cloud).
* A **Groq Cloud** Account API Key.
* A **Google Workspace / Cloud Console** project with the Google Sheets API enabled.
* A verified **Twilio** account with the WhatsApp Sandbox (or a production business profile) activated.

### Deployment Steps

1. **Import the JSON Assets:**
   * Create a new workflow canvas within your n8n dashboard.
   * Copy the sanitized JSON structure provided for the main processing pipeline, click the options menu inside n8n, select **Import from JSON**, and paste the contents.
   * Repeat the step for the isolated AI Preview workflow asset.

2. **Configure Variables & Credentials:**
   * Open the **AI Improve & Classify** and **AI Preview** nodes, click the credentials drop-down selection, select *Create New Credential*, and input your Groq API secret token.
   * Authenticate your Google OAuth2 credentials inside the **Log to Google Sheets** node and update the `documentId` property with the unique ID of your operational ledger spreadsheet.
   * Update the environment string placeholders (`YOUR_TWILIO_ACCOUNT_SID`, `YOUR_TWILIO_WHATSAPP_NUMBER`) present inside the properties configuration parameters of the respective HTTP Request notification nodes.

3. **Database Ledger Structure:**
   Ensure your target Google Sheet features a sheet tab named precisely `Complaints Log` with the matching column header schema:
   `Timestamp` | `Ref Number` | `Name` | `Phone` | `Email` | `Address` | `Category` | `Department` | `Priority` | `Summary` | `Original Text` | `Improved Text` | `Officer` | `Status`

4. **Activate Workflows:**
   Toggle both workflows from **Inactive** to **Active** via the canvas headers to open the public intake gateways.

```
