# Reconcile Ready website

Marketing and pre-API-review website for Reconcile Ready, a planned financial reporting platform for ecommerce sellers.

## Repository structure

- `dist/` contains the deployable HTML, CSS, JavaScript, PHP and static assets.
- `tests/` contains the site regression checks.
- `.hostinger/site.json` records the production website target without storing credentials.

## Branches and deployment

- `main` is the maintained source-of-truth branch.
- `production` contains only the contents of `dist/`, placed at the branch root for hosting.
- Hostinger watches the `production` branch and automatically deploys each push to [reconcileready.app](https://reconcileready.app).

To publish a verified `main` commit, create a deploy commit from `dist/` with `git subtree split --prefix=dist`, then push that commit to the `production` branch.

## Local verification

```sh
node --test tests/*.test.mjs
node --check dist/app.js
npx prettier --check "dist/*.html" dist/app.js
```
