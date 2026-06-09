// Recent episodes shown in the gallery.
// EDIT HERE: replace each placeholder `title` and `guest` with the real ones.
// `url` is the YouTube link; the card thumbnail and "Watch" button are derived
// from it automatically. Leave `guest` as an empty string to hide the guest
// line until you have the name.

export const episodes = [
  {
    id: 1,
    title: 'Episode 1',
    guest: '',
    url: 'https://www.youtube.com/watch?v=JKb4zgG2ijw',
  },
  {
    id: 2,
    title: 'Episode 2',
    guest: '',
    url: 'https://www.youtube.com/watch?v=gWmcexUQl08',
  },
  {
    id: 3,
    title: 'Episode 3',
    guest: '',
    url: 'https://www.youtube.com/watch?v=U2Hapz7XWr8',
  },
  {
    id: 4,
    title: 'Episode 4',
    guest: '',
    url: 'https://www.youtube.com/watch?v=LjCwaYpkU1g',
  },
  {
    id: 5,
    title: 'Episode 5',
    guest: '',
    url: 'https://www.youtube.com/watch?v=IOhvff5v2Lo',
  },
  {
    id: 6,
    title: 'Episode 6',
    guest: '',
    url: 'https://www.youtube.com/watch?v=qkicL_uYSK4',
  },
]

// The hero features the first episode by default. Point this at any episode.
export const featuredEpisode = episodes[0]
