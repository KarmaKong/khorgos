# Khorgos / khorgosirantruck.com

This Amp project is the working copy of the live site. Preview here; production deploys from GitHub Pages on KarmaKong/khorgos.

## Remotes

- `origin` — Amp-hosted repo (this project)
- `github` — KarmaKong/khorgos (GitHub Pages source)

Pushing `main` to `github` runs `.github/workflows/pages.yml` and publishes the live domain.

## Commands

```sh
npm ci
npm run build    # writes dist/
npm run check    # required before production
```

Preview is declared in `.amp/services.yaml`. Run `amp orb services ensure` and use the printed portal URL. Do not tell anyone to open localhost.

Canonical origin is the live khorgosirantruck.com domain (`SITE_ORIGIN`). Do not change it unless the live domain changes.

## Edit the site

- Pages and copy: `source/` (fa `/`, en `/en/`, zh `/zh.html`)
- Layout, nav, quote form: `scripts/redesign.mjs`
- Build, routes, SEO: `scripts/build.mjs`
- Checks: `scripts/check.mjs`
- CSS / brand: `assets/`

Do not hand-edit `dist/`. After content or script changes, rebuild and run `npm run check`.

## Production

Ship commits, verifies `npm run build` and `npm run check`, pushes `origin/main`, then pushes the same commit to `github` `main`. Never force-push either remote. If `github/main` has diverged, stop and ask.
