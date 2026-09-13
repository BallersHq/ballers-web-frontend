# ballershq-web

The BallersHQ pre-launch landing page: a single static page that explains the product to players and arena owners and collects waitlist sign-ups.

- **No build step, no dependencies.** Plain HTML, CSS and JS.
- **Design source:** `ballers-backend/docs/design/landing-page/` (desktop, mobile and hero option B) and the canvas at https://claude.ai/code/artifact/46914e89-53fc-4e54-9049-37bb0c5143e4. This site implements hero option A.
- **Brand:** Pitch Electric (dark, `#00E676` primary, Plus Jakarta Sans + Space Grotesk).

## Structure

```
index.html            the page (sections: hero/#waitlist, #how-it-works, #players, #chip-in, #claim, #arenas, #faq)
404.html              not-found page
assets/css/styles.css all styles (tokens at the top, responsive rules at the bottom)
assets/js/config.js   runtime config (API base URL)
assets/js/main.js     mobile menu + waitlist forms
assets/img/           logo.svg, favicon.svg (og-image.png still to add)
robots.txt, sitemap.xml
vercel.json, netlify.toml   security + cache headers
```

## Local preview

```bash
cd ballershq-web
python3 -m http.server 5173
# open http://localhost:5173
```

To test sign-ups against a local backend, set `apiBase` in `assets/js/config.js` to `http://localhost:8080/api`. Also start the backend with `BALLERS_CORS_ALLOWED_ORIGINS=http://localhost:5173` (comma-separated; patterns like `https://ballershq-web-*.vercel.app` work).

## Configuration

`assets/js/config.js`:

```js
window.BALLERS_CONFIG = { apiBase: "https://api.ballershq.com/api" };
```

Both forms POST JSON to `${apiBase}/v1/landing/notify`:

```json
{ "email": "you@example.com", "phone": "+234…" | null, "userType": "BALLER" | "CLIENT" }
```

- **Hero form:** a Baller / Arena owner toggle, email, and an optional WhatsApp number.
- **Final call-to-action form:** email only, and always signs up as `BALLER`.
- **"List your arena" button:** scrolls to the hero form and pre-selects Arena owner.
- **Success:** the form is replaced with a confirmation that shows the API's `message`.
- **4xx errors** (for example, an email that's already on the list returns `400 {status:"fail", message}`): the API message is shown under the form.
- **5xx or network failure:** a friendly retry message is shown.
- The email address is checked in the browser before anything is sent.

If you change the API host, update `connect-src` in the CSP in `vercel.json` and `netlify.toml` as well.

## Deploy

**Vercel:** import the folder as a project. Framework preset: Other, no build command, output directory `.`. `vercel.json` sets the headers.

**Netlify:** publish directory `.`. `netlify.toml` sets the headers. Netlify serves `404.html` automatically.

Point `ballershq.com` (and `www`) at the host through DNS in cPanel.

## Before going live

### Backend (ballers-backend)
- [x] **CORS:** origins are now configurable via `BALLERS_CORS_ALLOWED_ORIGINS` (default `https://ballershq.com,https://www.ballershq.com`). Add preview domains there when deploying previews. (BUG-090)
- [x] **Security:** `GET /api/v1/landing` is now ADMIN-only. (BUG-089)
- [ ] **Group funding:** the "Squad chip-in" section presents it as live. Turn on `BALLERS_FEATURE_GROUP_FUNDING` and make the fund screens reachable in the app. Paying for more than one spot is shown as live (my share / N spots / cover the rest, backend commit 75c8452).
- [ ] **Peer ratings:** shown as a feature, but the app has no rating screens yet.

### Content placeholders still in the page
- [x] Launch date: 1 October 2026, Abuja (hero countdown + final CTA + FAQ; target `2026-10-01T00:00:00+01:00` in `data-launch`)
- [ ] `[ARENA LOGO]` ×5 (founding arenas strip)
- [ ] `[REFERRAL REWARD]` (₦500 is seeded in the backend; confirm who receives it)
- [ ] `[EARLY-ACCESS PERK]` (final call to action)
- [ ] `[WHATSAPP NUMBER]` (footer)
- [ ] `[ARENA PRICING]` (FAQ; commission not decided)
- [ ] `[CANCELLATION TIERS — confirm]` (FAQ; `application.yml` says 2h/50%, while code defaults and docs say 12h/70%)
- [ ] Legal pages: Terms and Privacy link to the existing `terms-and-conditions.html` / `privacy.html`; Refund policy is still `#`

### Assets
- [ ] `assets/img/og-image.png`: create a 1200×630 social preview image. The meta tags already point to it.
- [ ] Optional: a PNG `apple-touch-icon` (180×180).
