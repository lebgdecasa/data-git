// Recent episodes shown in the gallery.
// EDIT HERE: each entry just needs the YouTube `url`. The card thumbnail and
// the "Watch" button are derived from it automatically. No titles or guest
// names are shown.

export const episodes = [
  { id: 1, url: 'https://www.youtube.com/watch?v=JKb4zgG2ijw' },
  { id: 2, url: 'https://www.youtube.com/watch?v=gWmcexUQl08' },
  { id: 3, url: 'https://www.youtube.com/watch?v=U2Hapz7XWr8' },
  { id: 4, url: 'https://www.youtube.com/watch?v=LjCwaYpkU1g' },
  { id: 5, url: 'https://www.youtube.com/watch?v=IOhvff5v2Lo' },
  { id: 6, url: 'https://www.youtube.com/watch?v=qkicL_uYSK4' },
]

// The hero features the first episode by default. Point this at any episode.
export const featuredEpisode = episodes[0]
