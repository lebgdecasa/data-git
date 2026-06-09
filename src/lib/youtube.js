// Helpers for turning a YouTube watch URL into a video id and thumbnail URLs.
// Thumbnails are loaded by the visitor's browser (a hotlink), so they work even
// though our build environment cannot reach YouTube directly.

export function getYouTubeId(url) {
  if (typeof url !== 'string') return null
  const match = url.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([A-Za-z0-9_-]{11})/)
  return match ? match[1] : null
}

// 1280x720 (16:9). Best quality, but not generated for every video.
export function youTubeThumb(url) {
  const id = getYouTubeId(url)
  return id ? `https://i.ytimg.com/vi/${id}/maxresdefault.jpg` : null
}

// 480x360 fallback that always exists. object-cover crops it to fill 16:9.
export function youTubeThumbHq(url) {
  const id = getYouTubeId(url)
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null
}
