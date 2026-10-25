# Chemistry Explorer – promo website

Vite + React + TypeScript, deployed to GitHub Pages by GitHub Actions. No server needed.

## 1. Assets (already included in `public/assets/`)
`logo.png`, `screenshot1.jpg` … `screenshot7.jpg`, `widget.jpg`, `vid tutorial.mp4`, `vid-poster.jpg` (a frame from the video), `chem-exp.apk`, `qr.jpg`.
To add more screenshots, drop `screenshot8.jpg`, `screenshot9.jpg`, … (sequential, no gaps). The build counts them automatically. Screenshots are cropped of the Android status/navigation bars and sized 800×1224.

## 2. Run locally
```
npm install     # creates package-lock.json: commit it
npm run dev     # or: npm run build && npm run preview
```
`scripts/apk-meta.mjs` runs before dev/build, reads the real APK size and screenshot count and writes `public/asset-meta.json` (git-ignored). Sizes are shown in decimal MB. The build fails if a file is over GitHub's 100 MB limit.

## 3. Deploy
1. Push to `main` in a GitHub repo.
2. Settings → Pages → Build and deployment → Source: **GitHub Actions**.
3. The workflow builds and deploys. The base path is taken automatically from `GITHUB_REPOSITORY` (works at `user.github.io/repo/`). For a custom domain, set repo variable `VITE_BASE=/`.

## APK notes and limits
- GitHub blocks files over 100 MB; the build fails with a message if the APK is bigger. Then host it on GitHub Releases and change the two APK links in `src/App.tsx` (size is then unknown unless you edit it).
- Download is a plain `<a download>` link. Browsers (especially Android Chrome) may warn about APKs from unknown sources; GitHub Pages cannot change that. Users must allow installs from their browser.

## Feedback form (EmailJS)
Static sites cannot send email on their own. Without setup, **Submit opens an email draft** to aditya1729maurya@gmail.com (images must be attached manually).
To send automatically:
1. Create a free account at emailjs.com, add an Email Service (e.g. Gmail), and create a template with variables `{{message}}`, `{{reply_to}}`, `{{note}}`, `{{to_email}}`; set the template's recipient to your address.
2. Copy Service ID, Template ID, Public Key.
3. In GitHub: Settings → Secrets and variables → Actions → **Variables**, add `VITE_EMAILJS_SERVICE_ID`, `VITE_EMAILJS_TEMPLATE_ID`, `VITE_EMAILJS_PUBLIC_KEY`. (Locally: copy `.env.example` to `.env`.) These are public identifiers by design; never add private keys.
4. Images: EmailJS only attaches files on plans that support variable attachments, with small size limits. If yours does, add attachments in the template named `image_1`, `image_2`, `image_3` (type: variable, data URL) and set `VITE_EMAILJS_ATTACH=true`. Otherwise leave it `false`; the form then tells visitors images aren't sent. Max 3 images, JPG/PNG/WEBP, `VITE_MAX_IMAGE_MB` each (default 1.5).
5. Restrict the allowed domain in EmailJS to your Pages domain to reduce abuse. Send a real test before relying on it.

## What is verified
Feature cards come from your real screenshots (home, games list, flashcards, Mole Factory, Hindi UI, widget, splash). "HD Graph & Lab" and "Chapter Formula Vault" are described only as the home-screen cards word them, because those screens weren't supplied. The package ID `com.adityamaurya.chemexplorer` was read from the APK manifest. Version, minimum Android and internet requirement show "To be confirmed" (set `VITE_APP_VERSION` or edit `src/App.tsx`).
- `app-debug.apk` is a **debug-signed** build; Android may show extra warnings. A signed release APK is better for public distribution.
- Two screenshots were left out on purpose: the Hindi home (Spider-Man widget background) and your phone home screen (Spider-Man wallpaper), as Marvel artwork on a public site. Add the Hindi home as `screenshot8.jpg` if you accept that.
- `qr.jpg` is cropped from your poster screenshot. I could not decode it automatically; scan it with a phone before publishing, and if it fails, export the QR directly from your payment app.

## Test checklist
- [ ] All assets load (no placeholders)  - [ ] Splash ~3 s then fades  - [ ] 3 screenshots, then single slideshow after ~5 s, wraps 25 → 1
- [ ] Pause / prev / next work; tab hidden pauses  - [ ] Video plays only on press  - [ ] APK downloads, size is right
- [ ] Feedback validation, draft fallback, EmailJS delivery  - [ ] No horizontal scroll at 360 px

## Zip upload route (no git needed)
Upload this zip to the repo root in the browser (max 25 MB per file) together with `.github/workflows/unzip-and-deploy.yml`. The workflow extracts the zip into the repo root, removes the zip, builds and deploys. In this zip the tutorial video is a web-compressed copy (about 9 MB) of your original. To use the original, push it with git to `public/assets/vid tutorial.mp4`.
The workflow never overwrites `.github/`, so `deploy.yml` inside this zip is ignored on that route; do not use both routes at once.
