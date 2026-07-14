# automation_learning_log

A working record of n8n automations built for NIC Kurukshetra, District Administration Haryana —
kept as a teaching path for MCA/BTech interns learning automation from first install onward.

**Live site:** `index.html` (deploy via GitHub Pages — see below)

## Structure

```
automation_learning_log/
├── index.html                                  ← the hub itself (self-contained HTML/CSS/JS)
├── README.md
├── .gitignore
├── 1a-good-morning-google-sheets/
│   ├── workflow.json
│   ├── good-morning-log.csv        ← sample log export, no personal data
│   └── README.md
├── 1b-good-morning-gmail/
│   └── workflow.json
├── 1c-good-morning-email-smtp/
│   └── workflow.json
├── 1d-good-morning-twilio/
│   └── workflow.json
├── 2-motivation-story-groq/
│   └── workflow.json
├── 3a-website-status-checker/
│   └── workflow.json
├── 3b-multi-website-monitoring/
│   └── workflow.json
├── 3c-database-health-checker/
│   └── workflow.json
├── 4-leave-application/
│   └── workflow.json
├── 5-gita-wisdom-ai-qa/
│   ├── workflow.json
│   └── demo.html
├── 6-complaint-system/
│   ├── workflow.json
│   ├── demo.html
│   ├── sample-data.csv        ← fabricated rows only, never real applicant data
│   └── README.md
├── 7-whatsapp-vip-alert/
│   └── workflow.json
└── 8-hackathon-management-practice/
    └── workflow.json
```

Each project folder uses generic filenames (`workflow.json`, `demo.html`) since the folder name
already identifies the project — no need to repeat the slug inside the folder.

## Before publishing any workflow.json

- [ ] Real Google Sheet IDs / edit URLs replaced with placeholders
- [ ] Credential IDs replaced with `REPLACE_WITH_YOUR_CREDENTIAL_ID`
- [ ] `meta.instanceId` removed
- [ ] No API keys, tokens, or passwords typed directly into node parameters
      (quick check: `grep -iE "apikey|password|token|secret" workflow.json`)

## Deploying via GitHub Pages

1. Push this repo to GitHub as `automation_learning_log`.
2. Repo Settings → Pages → Deploy from branch → `main` → `/ (root)`.
3. Site goes live at `https://vksinglakkr.github.io/automation_learning_log/`.

## Projects

| # | Folder | Title | Category |
|---|--------|-------|----------|
| 1a | `1a-good-morning-google-sheets` | Good Morning — Google Sheets | Notifications |
| 1b | `1b-good-morning-gmail` | Good Morning — Gmail | Notifications |
| 1c | `1c-good-morning-email-smtp` | Good Morning — Email (SMTP) | Notifications |
| 1d | `1d-good-morning-twilio` | Good Morning — Twilio | Notifications |
| 2 | `2-motivation-story-groq` | Motivation Story — Groq AI | AI |
| 3a | `3a-website-status-checker` | Single Website Status Checker | Monitoring |
| 3b | `3b-multi-website-monitoring` | Multi-Website Monitoring | Monitoring |
| 3c | `3c-database-health-checker` | Database Health Checker | Database |
| 4 | `4-leave-application` | Leave Application Automation | Business |
| 5 | `5-gita-wisdom-ai-qa` | Gita Wisdom — AI Q&A | AI |
| 6 | `6-complaint-system` | Complaint System | Business |
| 7 | `7-whatsapp-vip-alert` | WhatsApp VIP Alert | Monitoring |
| 8 | `8-hackathon-management-practice` | Hackathon Management System (Practice) | Enterprise |
