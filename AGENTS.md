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

Live domain: `khorgosirantruck.com` (GitHub Pages, CNAME in repo). `www` CNAME → `karmakong.github.io` and 301s to apex. Apex A records are the four GitHub Pages IPv4 addresses. NS stays at GoDaddy (`ns63`/`ns64.domaincontrol.com`). Mail MX/SPF remain on the apex.

Checked 2026-09-26:

- HTTP homepage bytes match `dist/index.html` (108-page build).
- HTTPS is broken: GitHub has not issued a Pages certificate (`https_certificate` is null, crt.sh has none). Browsers see `*.github.io`. Do not set Enforce HTTPS until the cert exists.
- This GH token cannot PATCH Pages settings (403). Certificate retry is: GitHub → repo Settings → Pages → remove custom domain, save, add `khorgosirantruck.com` again. Apex has no AAAA records; add the four GitHub Pages IPv6 addresses if cert stays stuck.
