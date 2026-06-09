# Image assets

Drop the real image files in this folder using the exact filenames below. Until
you do, the site renders warm placeholder blocks at the correct aspect ratio, so
there is never a broken image and never any layout shift.

Do not hotlink third-party (for example YouTube) image URLs. Export a still and
save it here instead.

| File                  | Purpose                                  | Aspect / size                  |
| --------------------- | ---------------------------------------- | ------------------------------ |
| `episode-featured.jpg`| Hero featured-episode still              | 16:9, ~1600×900                 |
| `episode-01.jpg`      | Episodes gallery card 1                  | 16:9, ~1280×720                 |
| `episode-02.jpg`      | Episodes gallery card 2                  | 16:9, ~1280×720                 |
| `episode-03.jpg`      | Episodes gallery card 3                  | 16:9, ~1280×720                 |
| `episode-04.jpg`      | Episodes gallery card 4                  | 16:9, ~1280×720                 |
| `episode-05.jpg`      | Episodes gallery card 5                  | 16:9, ~1280×720                 |
| `episode-06.jpg`      | Episodes gallery card 6                  | 16:9, ~1280×720                 |
| `host-karim.jpg`      | Host card — Karim Amor                   | square, ~640×640                |
| `host-yassin.jpg`     | Host card — Yassin Amor                  | square, ~640×640                |
| `wordmark.svg`        | Optional logo wordmark (nav + footer)    | SVG, ~28px tall when rendered   |
| `epi-logo.png`        | Optional small EPI / Epineon logo (footer)| PNG, ~28px tall, transparent   |

Notes:

- `wordmark.svg` and `epi-logo.png` are optional. If absent, the nav and footer
  fall back to the styled text wordmark and the EPI logo is simply hidden.
- JPGs should be reasonably compressed (aim under ~300 KB each).
- Alt text is generated from the episode/host data, so keep titles and guest
  names up to date in `src/data/`.
