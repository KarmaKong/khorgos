# KHORGOS Iran Truck

Static multilingual website for khorgosirantruck.com. Persian `/` (RTL), English `/en/`, Chinese `/zh.html`. Built with Node.js 22+, linkedom and native CSS.

## Build

```sh
npm ci
npm run build
npm run check
npm run preview
```

The generated website is in `dist/`. Preview uses Python 3 at http://127.0.0.1:4174/.

## Cloudflare Pages

Connect this GitHub repository in Workers & Pages → Create application → Pages → Import an existing Git repository.

- Production branch: `main`
- Framework preset: None
- Build command: `npm run build && npm run check`
- Build output directory: `dist`
- Root directory: repository root
- Environment variable: `NODE_VERSION=22`
- Canonical origin defaults to `https://khorgosirantruck.com`; override with `SITE_ORIGIN` if required.

After the first successful deployment, add `khorgosirantruck.com` and `www.khorgosirantruck.com` under Custom domains. For the apex domain, add the zone to the same Cloudflare account and use the exact Cloudflare nameservers assigned to that zone in GoDaddy. Review existing DNS records, including mail records, before switching nameservers. Keep domain registration and renewals at GoDaddy.

[Cloudflare Git integration](https://developers.cloudflare.com/pages/get-started/git-integration/) · [Custom domains](https://developers.cloudflare.com/pages/configuration/custom-domains/)

## Structure

- `source/`: original public content snapshot and source assets.
- `scripts/build.mjs`: page generation, route and SEO handling.
- `scripts/redesign.mjs`: multilingual layout, service cards and homepage quote form.
- `scripts/check.mjs`: content, link, SEO, form and asset checks.
- `assets/khorgos/`: production brand illustrations and SVGs.
- `assets/khorgos-sha256.json`: reference checksums for production brand assets.
- `assets/site.css`: responsive styles.
- `assets/quote-form.js`: opens the visitor's email app; it does not send or store messages.

No sibling directories or design handoff files are needed to build. Generated files, local dependencies, design references and archive ZIPs are excluded from Git.

## Contact

WhatsApp: +86 15876207182  
Email: sales@khorgosirantruck.com  
Telegram: [@Kannchung](https://t.me/Kannchung)

The content retains the original operational terms and locale routes. Illustrative artwork is not an official geographic map or documentary fleet photography. Historical shipment photographs are retained separately in their original records. Font license: `assets/Vazirmatn-OFL.txt`.
