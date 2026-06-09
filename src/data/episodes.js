// Recent episodes shown in the gallery.
// EDIT HERE: each entry has a YouTube `url` and a `title`. The card thumbnail
// is taken from a local file (`image`) if present, otherwise it falls back to
// the YouTube thumbnail derived from the url. The "Watch" button uses the url.

export const episodes = [
  {
    id: 1,
    title: 'Eating Once a Day? How Binge Eating Disrupts Metabolism',
    url: 'https://www.youtube.com/watch?v=JKb4zgG2ijw',
    image: '/assets/images/episode-01.jpg',
  },
  {
    id: 2,
    title: 'Design a Life You Love',
    url: 'https://www.youtube.com/watch?v=gWmcexUQl08',
    image: '/assets/images/episode-02.jpg',
  },
  {
    id: 3,
    title: "How Lifestyle Choices Shape Future Generations' Health",
    url: 'https://www.youtube.com/watch?v=U2Hapz7XWr8',
    image: '/assets/images/episode-03.jpg',
  },
  {
    id: 4,
    title: 'From Soccer Injury to Multimillionaire',
    url: 'https://www.youtube.com/watch?v=LjCwaYpkU1g',
    image: '/assets/images/episode-04.jpg',
  },
  {
    id: 5,
    title: 'How to Turn Meditation into a Way of Life',
    url: 'https://www.youtube.com/watch?v=IOhvff5v2Lo',
    image: '/assets/images/episode-05.jpg',
  },
  {
    id: 6,
    title: 'Empowering Women Through Plant-Based Living',
    url: 'https://www.youtube.com/watch?v=qkicL_uYSK4',
    image: '/assets/images/episode-06.jpg',
  },
]

// The hero features the first episode by default. Point this at any episode.
export const featuredEpisode = episodes[0]
