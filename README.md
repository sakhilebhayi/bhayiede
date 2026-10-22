# sakhilebhayi.com

The personal site of Sakhile Bhayi, founder of Dot. It is a short signed letter that turns into an honest portfolio. It is positioned as a business-intelligence and operations founder ("From fragmented information to connected intelligence"). Mining operations are where he learned how operational information breaks, and the Dot platforms are the proof that he can build.

There is no build step, no framework and no package manager. There are five static pages that share one stylesheet (`site.css`) and one script (`site.js`). Each page carries its own JSON-LD.

- Copy, product context and the visual system (`PRODUCT.md`, `DESIGN.md`, `.impeccable/`) are kept locally and are not part of this repository.

## Pages

| URL | File | Bands, in order |
| --- | --- | --- |
| `/` | `index.html` | The letter (grey: headline, letter, two text links, signature line, Dot.Doc sheet) · Band A photo · The problem (white) · How I can help (grey) · Career (white) · What I've built (grey, stair drawing, four feature rows with a status line) · Investors and partners (white, quartz inset) · Band C photo · Close (thank-you, signature, form) |
| `/work/` | `work/index.html` | Intro and status key (grey) · Project notes (white) · Team tools and what Dot runs on (grey) · Dot and InfoDot (white) · In progress and planned (grey) · Close |
| `/approach/` | `approach/index.html` | Intro (grey) · What I believe (white) · How I approach a change (grey) · What I offer today (white) · Shown in my own platforms (grey) · Not taking on (white, compact) · How I build (grey) · Why work with me (white) · Close |
| `/about/` | `about/index.html` | Story (grey, quartz inset in place of a portrait) · Career (white) · Short and full bio (grey) · Close with Support the work |
| `/contact/` | `contact/index.html` | Write to me (night: who writes, form, what happens next) · FAQ (grey) |
| 404 | `404.html` | A single band with links to `/` and `/work/` |

Every page has the same nav (Work · Approach · About · Contact, with `aria-current="page"` on the current page; on phones the bottom dock also has a Home tab with a house icon between Approach and About, hidden on wide screens where the name in the top bar already links home) and the same footer. Every page except `/contact/` ends in the Close, which carries the full contact form. The header, the form and the footer are copied by hand into each page: if you change one, change all five and check that they still match.

Text links can choose the form subject: `/contact/?subject=connect|founder|ai|invest|dot|press|other`.

## Files

```text
.
├── index.html            home
├── work/index.html       /work/
├── approach/index.html   /approach/
├── about/index.html      /about/
├── contact/index.html    /contact/
├── 404.html              not-found page (served by .htaccess)
├── site.css              the one stylesheet
├── site.js               the one script (letter highlight, deferred Band A, form)
├── .htaccess             HTTPS/non-www redirect, folder-index redirects, 404s, caching, compression, MIME types
├── assets/               night-city photographs (night-*, photo-hero-*), logo (mark-*), platform logos for the map (map-*, 18 trimmed lockups; the rest in logos/), platform home-page screenshots (pf-*), signature, all AVIF + WebP; js/ holds GSAP and motion.js
├── logos/                each shown platform's own lockup, AVIF + WebP (masters are in design-options/logos/)
├── logo.png              full signature artwork (JSON-LD and sitemap image)
├── og-image.png          1200x630 social card (source: .workflow/og/og-card.html)
├── favicon-32.png, apple-touch-icon.png
├── sitemap.xml, robots.txt
├── README.md             (not deployed)
├── design-options/, design-research/, .final-shots/, .workflow/   (never deployed)
```

Fonts come from Google Fonts: Hanken Grotesk at 400 and 600, loaded without blocking render, behind a metric-matched Arial fallback (`Hanken Grotesk Fallback`). The 404 page loads it with `display=optional` so it never reflows. The only icons are inline SVG symbols in each page: out-arrow, next-arrow, error and ok.

## Preview locally

Serve the folder over HTTP. The pages use root-relative paths (`/site.css`, `/assets/…`), so opening a file directly with `file://` won't work.

```bash
cd ~/Dot/bhayiede
python3 -m http.server 8000
```

Then open <http://localhost:8000>. The contact form posts to Web3Forms from localhost too, so any test message you send is a real one. `python3 -m http.server` doesn't run `.htaccess`, so it won't show the 404 page or the redirects.

## Automatic deploy (GitHub Actions)

`.github/workflows/deploy.yml` runs on every pull request (site checks only) and on every push to `main`: checks, a backup of the live files into `~/site-backups/` on the server (the last ten are kept), an rsync over SSH into `public_html/`, then a smoke test of the live site (`scripts/smoke.sh`). Run it by hand from the Actions tab to redeploy, or type a backup name (or `latest`) in the **rollback** box to restore one.

It needs these repository secrets (Settings -> Secrets and variables -> Actions): `DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_PATH` (for example `/home/<cpanel-user>/public_html`), `DEPLOY_SSH_KEY` (private key), `DEPLOY_KNOWN_HOSTS`, and optionally `DEPLOY_PORT`. Without them the deploy job skips with a warning and changes nothing. The matching public key must be authorised in cPanel (SSH Access).

Run the same checks locally with `python3 scripts/check-site.py`. The manual steps below are the fallback.

## Deploy (cPanel / LiteSpeed)

The host is cPanel on LiteSpeed, and `.htaccess` uses Apache-compatible rules. Upload into `public_html/` at the root, keeping the folder structure.

Upload these:

- `index.html`
- `work/index.html`, `approach/index.html`, `about/index.html` and `contact/index.html`. Create the four folders, then put each `index.html` inside its folder.
- `site.css` and `site.js`
- `assets/`, the whole folder (images as both `.avif` and `.webp`, plus `js/`):
  - Signature: `signature-880`
- `logos/`, the whole folder (34 files): `infodot-144`/`-288`, `dot-mines-240`/`-420`, `dot-central-240`/`-420`, `dot-doc-240`, and the `-1x`/`-2x` tiles for `dot-forms`, `dot-files`, `dot-engage`, `dot-press` and `dot-dopemine`, each as `.avif` and `.webp`
- `logo.png`, `og-image.png`, `favicon-32.png` and `apple-touch-icon.png`
- `sitemap.xml`, `robots.txt`, `llms.txt`, `404.html` and `.htaccess`

**Delete these from the server** if an earlier deploy uploaded them:

- every `logos/blupin-*` file, `logos/dot-charts-*`, `logos/dot-agents-*` and `logos/dot-memory-*`

The retired files are kept locally in `.workflow/deslop/retired/`.

Do **not** upload `design-options/`, `design-research/`, `.final-shots/`, `.workflow/`, `.impeccable/`, `.git/` or the `.md` files. `.htaccess` answers 404 for these if they are uploaded by mistake.

Notes:

- If cPanel's "Setup Node.js App" ever created an app on this domain, remove that app first. Its Passenger lines in `.htaccess` make every address answer 200.
- `.htaccess` redirects `/work/index.html` to `/work/` and `/work` to `/work/`.
- HTML, CSS, JS, XML and TXT files are served `no-cache`, which means "revalidate", so edits show at once. Images whose names end in a width are cached for a year as immutable, so give a replaced image a new filename.
- Text is compressed (`mod_deflate`). The performance budget is measured compressed.
- After a deploy, check that `/`, `/work/`, `/approach/`, `/about/` and `/contact/` all load, that `/nope` and `/work/nope` return the 404 page, and that `http://` and `www.` redirect to `https://sakhilebhayi.com/`.
- When content changes, update `<lastmod>` in `sitemap.xml` and `dateModified` in that page's JSON-LD.

## Contact form

The form posts JSON to `https://api.web3forms.com/submit`. The access key is in a hidden field, which is normal for a static site. Watch the submissions and rotate the key if the form gets abused.

- **Spam:** a honeypot checkbox (`botcheck`).
- **Validation:** client-side, covering name, email, subject and message. A polite live status says "{n} fields need attention."
- **Email subject:** `sakhilebhayi.com · {subject label} · {name}`.
- **Success:** the form is replaced by a thank-you line.
- **Failure:** a message appears above the button, and the form keeps what was typed.

Count enquiries per subject each month from the Web3Forms inbox. That is the site's only success measure.

## License

MIT. See [`LICENSE`](LICENSE).

## Logo, other pages' motion (2026-10-22)

- The opening on the home page shows the signature logo (`assets/mark-640|965`, trimmed from `logo.png`, transparency kept) where the Dot.Doc career page used to be. The old `dotdoc-career-*` images are gone.
- The scroll and reveal animation now runs on every page (`assets/js/motion.js`, GSAP + ScrollTrigger). Upload all of `assets/js/`.
- `og-image.png` is a 1200x630 card made from the hero photograph and the logo (source: `.workflow/og-card.html`, not uploaded).

## Photo credits

All photographs are from Unsplash, free under the [Unsplash License](https://unsplash.com/license), downloaded, cropped, given one shared colour grade and self-hosted (never hotlinked). They are credited in every page's footer.

| Where | Photograph | By | Unsplash |
| --- | --- | --- | --- |
| Home opening; `/work/` and `/contact/` bands use crops of the sprawl and hill photographs below | Aerial view of a modern city at night | [Jiwon Kang](https://unsplash.com/@jiwon_kang) | [photo](https://unsplash.com/photos/aerial-view-of-a-modern-cityscape-at-night-ZFD8PsZgoCQ) |
| Home skyline band; `/approach/` opening | City skyline at dusk | [Fahrul Razi](https://unsplash.com/@mfrazi) | [photo](https://unsplash.com/photos/a-city-skyline-at-night-UaHqk4Z53sQ) |
| Home investors band; `/about/` opening; `/contact/` | City at night from a hill | [Joydeep Sensarma](https://unsplash.com/@jsensarma) | [photo](https://unsplash.com/photos/a-view-of-a-city-at-night-from-the-top-of-a-hill-csPK2yuMH7w) |
| Home "How I can help" | Tall lit tower at night | [Rafael Garcin](https://unsplash.com/@nimbus_vulpis) | [photo](https://unsplash.com/photos/tall-skyscraper-illuminated-at-night-with-city-lights--Qy96U7EvF8) |
| Home closing band; `/work/` opening; `/about/` | Skyscrapers at dusk in a sprawling city | [Yilei (Jerry) Bao](https://unsplash.com/@yileijerrybao) | [photo](https://unsplash.com/photos/modern-skyscrapers-illuminated-at-dusk-in-a-sprawling-city-nqHc7nGSRAU) |

## Motion and licences

Scroll and parallax animation on every page uses GSAP 3.15 and its ScrollTrigger plugin (free under GreenSock's [standard licence](https://gsap.com/standard-license)), self-hosted in `assets/js/` with the site's own `assets/js/motion.js`. It runs only when the visitor has not asked for reduced motion; without it, or without script, every element is visible.

## Product screenshot

`assets/pf-<slug>-640|1280.*` are 1440x900 captures of each platform's public home page (never a logged-in screen), shown in a browser-style frame; regenerate them with `.workflow/capture-platforms.sh`. The old logged-in Dot.Agents dashboard crop was deleted.
