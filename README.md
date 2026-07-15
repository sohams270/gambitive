# Gambitive

Analysis-first tech and startup publication. Astro, statically generated, Markdown content in-repo.

## Commands

```sh
npm run dev       # dev server at localhost:4321
npm run build     # static build to dist/
npm run preview   # serve the production build locally
```

## Publishing an article

Add a Markdown file to `src/content/articles/`. The filename is the URL slug.

```yaml
---
title: "Headline"
dek: "One-line summary shown on cards and in search results."
section: latest | deep-dives | the-hard-part
author: "Name"
pubDate: 2026-07-13
featured: true   # optional: makes it the homepage lead
draft: true      # optional: excluded from build
tldr: |          # optional: article-page left rail, one point per line
  - First takeaway
  - Second takeaway
authorBio: "..."  # optional: end-of-article bio card (house bios used otherwise)
---
```

Everything else is automatic: URL (`/section/slug/`), RSS, sitemap, schema.org
markup, the social share card (`/og/slug.png`), and the mid-article newsletter
block (inserted after the 4th paragraph on pieces of 10+ paragraphs).

For the signature pull-quote card inside an article:

```html
<figure class="quote-card">
  <blockquote>The quote.</blockquote>
  <figcaption>Name, Company</figcaption>
</figure>
```

## CMS (/admin)

Authors publish from `/admin` — no terminal needed. Log in at `/admin/login`.

- **Content**: every post (live, featured, draft) with edit links.
- **New Post**: headline, dek, section, byline, TL;DR, feature image upload,
  Markdown body, featured/draft flags. Publishing writes the Markdown file and
  commits it: locally via git push, on Vercel via the GitHub API. Either way
  the deploy pipeline takes it live in about a minute.
- **Edit**: update or delete any post (delete requires typing the slug).
- **Authors** (super admin only): add authors who can publish and edit.

Users live in `src/data/users.json` (scrypt-hashed passwords — never commit a
plaintext password). Sessions are HMAC-signed cookies.

**Production env vars (Vercel → Settings → Environment Variables):**
`SESSION_SECRET` (any long random string) and `GITHUB_TOKEN` (fine-grained PAT,
Contents read/write on this repo only). See `.env.example`.

**Security note:** if this repo is public, password *hashes* in users.json are
public too. Make the repo private (GitHub → Settings → General → Danger Zone →
Change visibility) — Vercel keeps deploying private repos fine.

## Before going live — placeholders to replace

All in `src/lib/site.ts`:

- `url` — the real domain (also update `site` in `astro.config.mjs`)
- `newsletterAction` — real newsletter provider endpoint (Buttondown/ConvertKit/etc.)
- `pitchFormAction` — real form endpoint (Formspree or similar) for The Hard Part pitches
- `contactEmail` / `advertiseEmail`
- `plausibleDomain` — set to the production domain to enable analytics
- `niche` — currently "India's tech and startup ecosystem"

Also: the 7 articles in `src/content/articles/` are fictional sample content —
delete before launch. Privacy and Terms pages are templates; get them reviewed.

## Deploying

Push-to-deploy on Vercel, Netlify, or Cloudflare Pages: connect the repo,
framework preset "Astro", build command `npm run build`, output `dist/`.
No environment variables required.

## Design system

Single source of truth in `src/styles/tokens.css` — palette (accent
`#0e5741` forest green), type scale (Fraunces headlines / Inter body),
spacing. Never hardcode these values in components.

Deliberately not built at launch (per brief): search, dark mode, accounts,
paywall, comments, events, topic pages.
