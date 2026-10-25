# Verification — 25 October 2026

- Eight static pages: home, reconciliation, profitability, how it works, FAQs, contact/about, privacy, website terms.
- Browser: desktop homepage and calculator visually inspected; mobile homepage and profitability visually inspected at a 390px override (375px document client width).
- All eight pages had scrollWidth equal to clientWidth on mobile; no horizontal overflow.
- Dashboard switches between profitability and settlements.
- Keyboard slider change £40 to £41 updates contribution to £15 and margin to 36.6%.
- Negative example £20 - £35 - £8 - £20 yields -£43 and -215%.
- Mobile navigation opens and navigates correctly; FAQ expands.
- Valid dummy enquiry prepares mailto draft, shows not-sent state and focuses draft link. No email sent.
- All local page/asset links and anchors resolve; unique IDs and one H1 on every page.
- node --check app.js passed. Browser error log empty.
- Sample settlement totals £9,000; dashboard contribution £17,000, consistent with product rows.
- Screenshot: review/home-desktop.png.

## Publication notes

Working brand and email reused from the existing Packbench project. Confirm legal operator, brand/domain and contact mailbox before a public Amazon submission. Current deployment is owner-private by default. API integrations remain planned; no data is connected. Enquiry is email-based, not a mailing-list backend. Privacy/terms describe the preview only and need business-specific details for public launch. No Amazon approval guarantee is made.
