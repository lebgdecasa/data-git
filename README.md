# The Wellness Billion — guest-invitation landing page

A single-page marketing site that invites wellness creators, coaches, and
practitioners to apply as guests on **The Wellness Billion**, a podcast from the
team at **EPI / Epineon**. The one conversion goal is a completed application
form; every section builds toward that submission.

Built with **Vite + React (JavaScript) + Tailwind CSS**.

## Run it

```bash
npm install
npm run dev      # start the dev server (Vite prints the local URL)
npm run build    # production build into dist/
npm run preview  # preview the production build
```

The page works out of the box with no configuration: the form is fully
previewable even before you add an endpoint or any images.

## Configure the form endpoint

The application form POSTs its JSON payload to the URL in
`VITE_FORM_ENDPOINT`.

1. Copy `.env.example` to `.env`.
2. Set `VITE_FORM_ENDPOINT` to your endpoint. A **Google Apps Script web-app
   URL** backed by a Google Sheet works well.

```bash
cp .env.example .env
# then edit .env:
# VITE_FORM_ENDPOINT=https://script.google.com/macros/s/XXXX/exec
```

- **Empty endpoint (default):** submissions are logged to the browser console
  and the success confirmation still shows, so you can preview the whole flow.
- **Payload:** every form field plus `qualified` (boolean), `tier`
  (`Macro` / `Micro/Mid` / `Below threshold`), and an ISO `timestamp`.
- The request is sent with `Content-Type: text/plain;charset=utf-8` (the body is
  still JSON). This avoids a CORS preflight that Google Apps Script does not
  answer. In your Apps Script, read the body with
  `JSON.parse(e.postData.contents)`.
- No secrets are hardcoded. `.env` is gitignored.

### Qualification (computed on submit, never shown to the applicant)

Everyone can submit and no one is blocked. Each entry is scored behind the
scenes by audience size only:

| Audience size        | `qualified` | `tier`          |
| -------------------- | ----------- | --------------- |
| Under 10,000         | `false`     | Below threshold |
| 10,000 to 50,000     | `true`      | Micro/Mid       |
| 50,000 to 500,000    | `true`      | Macro           |
| 500,000+             | `true`      | Macro           |

The other fields are captured as context for human review only.

### Optional fast-track (off by default)

In `src/components/ApplyForm.jsx`, `SHOW_FASTTRACK` is `false`. Set it to `true`
to show a "Grab a time now" button on success **only** to qualified applicants.
The scheduling link is `FASTTRACK_URL` in the same file. Leave it off unless you
specifically want self-booking.

## Drop in image assets

Place real images in `public/assets/images/` using the exact filenames listed in
[`public/assets/images/README.md`](public/assets/images/README.md). Until then,
warm placeholder blocks render at the correct aspect ratio (no broken images, no
layout shift).

Episode and hero thumbnails are pulled automatically from each YouTube `url`
in `src/data/episodes.js` (no episode image files needed). The remaining
expected files are `host-karim.jpg`, `host-yassine.jpg` (square), and optionally
`wordmark.svg` and `epi-logo.png`.

## Edit episode titles, hosts, and links

All editable content lives in `src/data/`:

- `src/data/episodes.js` — the six gallery cards and the hero featured episode
  (title, guest name, YouTube `url`). The thumbnail and "Watch" button are
  derived from the `url` automatically; an empty `guest` hides the guest line.
- `src/data/hosts.js` — host names, roles, bios, and social links. Confirm
  spelling and handles; leave bios as placeholders until provided.
- `src/data/pillars.js` — the four EPI technology pillars and their status tags
  (`Live today` / `In development` / `Roadmap`).

Fixed copy (hero, mission, value props, steps) lives directly in the relevant
component under `src/components/`.

## Project structure

```
.
├── index.html                 # Google Fonts (Fraunces + Hanken Grotesk), root div
├── tailwind.config.js         # color + font tokens, radii, shadows, animations
├── postcss.config.js
├── vite.config.js
├── .env.example               # VITE_FORM_ENDPOINT
├── public/
│   └── assets/images/         # drop real images here (+ filenames README)
└── src/
    ├── main.jsx
    ├── App.jsx                # composes all sections
    ├── index.css             # Tailwind layers, base type, paper-grain, focus
    ├── hooks/useReveal.js    # IntersectionObserver fade-up
    ├── data/                 # episodes, hosts, pillars (edit these)
    └── components/
        ├── Nav.jsx           # sticky, transparent over hero, mobile menu
        ├── Hero.jsx
        ├── Episodes.jsx
        ├── WhyYes.jsx
        ├── Hosts.jsx
        ├── Mission.jsx
        ├── Building.jsx
        ├── Expect.jsx
        ├── ApplyForm.jsx     # the conversion form + qualification logic
        ├── FinalCTA.jsx
        ├── Footer.jsx
        └── ui/               # Wordmark, Reveal, MediaPlaceholder, icons
```

## Design tokens

Centralized in `tailwind.config.js`. The palette is drawn from the podcast logo:
a dark navy theme with cream text and an electric-blue accent.

- Colors (token name = role): `paper` page background (deep navy `#0C1E38`),
  `sand` raised surfaces/cards (lighter navy), `navy` deepest band, `ink` /
  `cream` primary text (warm cream `#F4ECDB`), `body` secondary text (muted
  slate), `terracotta` (+`terracotta-hover`) the electric-blue accent
  (`#2F8FE2`), `gold` a light-azure secondary, `line` borders, sparing `teal`.
- Note: token names are kept as semantic roles even though the values are now
  cool (e.g. `terracotta` holds the brand blue).
- Fonts: `font-display` (Fraunces), `font-sans` (Hanken Grotesk).

## Accessibility & quality notes

- Semantic landmarks (`header`, `main`, `nav`, `footer`), real alt text, visible
  focus rings, a skip link, and a keyboard-usable menu and form.
- Reduced-motion users get no animations.
- All imagery reserves its aspect ratio to avoid layout shift.
- No invented testimonials, statistics, or follower counts anywhere.

---

> Note: this repository previously held a Le Wagon git warmup challenge. Those
> files (`today.py`, `tests/`, `Makefile`) are left in place and are unrelated
> to this site.
