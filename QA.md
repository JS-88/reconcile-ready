# Verification — 18 November 2026

- Fourteen public static pages plus a branded 404 page: home, platform hub, Amazon, eBay, Shopify, channels to Xero, profitability, how it works, FAQs, contact/about, security, Amazon data use, privacy and website terms.
- Desktop layouts visually inspected at 1440px, including the homepage reporting bridge and platform hub.
- The profitability hero was visually inspected at 1030px after the cache-version update.
- Amazon, eBay and Shopify detail pages were inspected at 320px and 375px. Navigation collapses to the mobile menu, content becomes single-column and no text or cards clip at the viewport edge.
- Shared header and footer structure is regression-tested across every public page. Product, Platforms and Resources dropdowns retain stable `aria-controls` identities.
- Clean Apache routes return 200 for `/platforms`, `/amazon`, `/ebay`, `/shopify`, `/profitability` and `/reconciliation`; an unknown route returns the branded 404.
- All local page links and fragments resolve to shipped content. Internal navigation uses extensionless URLs.
- Every HTML page loads a versioned stylesheet so refreshed markup cannot be paired with a stale CSS file.
- Multi-platform copy is regression-tested on the shared pages. Generic payout examples do not contain platform-specific fee labels.
- Interactive JavaScript passes `node --check`; all Node regression tests pass; formatting and `git diff --check` pass.
- API integrations remain clearly described as planned or in development. No connected-account data is presented as live.

## Publication notes

Reconcile Ready is a standalone J5 Ltd product at `reconcileready.app`. Public enquiries are sent to `hello@reconcileready.app`. The initial planned data sources are Amazon, eBay and Shopify; Xero is the first planned accounting destination. API access remains subject to each provider's approval, permissions, scopes, retention rules and availability. Product previews use illustrative data and make no API approval guarantee.

## Production workflow

The source of truth is the GitHub repository `JS-88/reconcile-ready`. Work is committed on a feature branch, reviewed and fast-forwarded into `main`. The deployable `dist/` directory is published to the `production` branch for Hostinger.
