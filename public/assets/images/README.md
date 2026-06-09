# Image assets

Drop the real image files in this folder using the exact filenames below. Until
you do, the site renders warm placeholder blocks at the correct aspect ratio, so
there is never a broken image and never any layout shift.

| File              | Purpose                                    | Aspect / size                 |
| ----------------- | ------------------------------------------ | ----------------------------- |
| `host-karim.jpg`  | Host card — Karim Amor                     | square, ~640×640              |
| `host-yassine.jpg`| Host card — Yassine Amor (MambahFit)       | square, ~640×640              |
| `wordmark.svg`    | Optional logo wordmark (nav + footer)      | SVG, ~28px tall when rendered |
| `epi-logo.png`    | Optional small EPI / Epineon logo (footer) | PNG, ~28px tall, transparent  |

## Episode thumbnails

Episode card and hero thumbnails are pulled automatically from each YouTube
video (a hotlink, derived from the `url` in `src/data/episodes.js`). You do not
need to add episode image files. If you would rather host your own stills, swap
the thumbnail logic in `src/components/Episodes.jsx` / `Hero.jsx` and drop
`episode-*.jpg` files here instead.

Notes:

- `wordmark.svg` and `epi-logo.png` are optional. If absent, the nav and footer
  fall back to the styled text wordmark and the EPI logo is simply hidden.
- JPGs should be reasonably compressed (aim under ~300 KB each).
- Alt text is generated from the episode/host data, so keep titles and guest
  names up to date in `src/data/`.
