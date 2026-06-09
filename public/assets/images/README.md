# Image assets

Drop the real image files in this folder using the exact filenames below. Until
you do, the site renders warm placeholder blocks at the correct aspect ratio, so
there is never a broken image and never any layout shift.

| File              | Purpose                                    | Aspect / size                 |
| ----------------- | ------------------------------------------ | ----------------------------- |
| `logo.png`        | Podcast cover logo (favicon + nav/footer badge) | square, ~512×512         |
| `host-karim.jpg`  | Host card — Karim Amor                     | square, ~640×640              |
| `host-yassine.jpg`| Host card — Yassine Amor (MambahFit)       | square, ~640×640              |
| `wordmark.svg`    | Optional logo wordmark (nav + footer)      | SVG, ~28px tall when rendered |
| `epi-logo.png`    | Optional small EPI / Epineon logo (footer) | PNG, ~28px tall, transparent  |

`logo.png` is the square Wellness Billion cover art. It is used as the browser
favicon and as a small rounded badge next to the wordmark in the nav and footer.
If the file is missing, the favicon falls back to the browser default and the
badge simply hides itself.

## Episode thumbnails

Each episode card uses a **local file if present, otherwise the YouTube
thumbnail** (hotlinked from the `url` in `src/data/episodes.js`). So you have two
options:

- **Do nothing** — the YouTube thumbnail shows automatically in any browser.
- **Host them yourself** (recommended if the hotlink is blocked or a video is
  private) — save the stills here as `episode-01.jpg` … `episode-06.jpg`
  (16:9, ~1280×720). They take priority and the page no longer depends on
  YouTube. To grab each one, open its thumbnail URL and "Save image as":

  | File             | Thumbnail URL                                            |
  | ---------------- | -------------------------------------------------------- |
  | `episode-01.jpg` | https://i.ytimg.com/vi/JKb4zgG2ijw/maxresdefault.jpg     |
  | `episode-02.jpg` | https://i.ytimg.com/vi/gWmcexUQl08/maxresdefault.jpg     |
  | `episode-03.jpg` | https://i.ytimg.com/vi/U2Hapz7XWr8/maxresdefault.jpg     |
  | `episode-04.jpg` | https://i.ytimg.com/vi/LjCwaYpkU1g/maxresdefault.jpg     |
  | `episode-05.jpg` | https://i.ytimg.com/vi/IOhvff5v2Lo/maxresdefault.jpg     |
  | `episode-06.jpg` | https://i.ytimg.com/vi/qkicL_uYSK4/maxresdefault.jpg     |

  (`episode-01.jpg` is also the hero's featured thumbnail.)

Notes:

- `wordmark.svg` and `epi-logo.png` are optional. If absent, the nav and footer
  fall back to the styled text wordmark and the EPI logo is simply hidden.
- JPGs should be reasonably compressed (aim under ~300 KB each).
- Alt text is generated from the episode/host data, so keep titles and guest
  names up to date in `src/data/`.
