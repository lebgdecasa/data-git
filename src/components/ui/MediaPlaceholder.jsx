import { useState } from 'react'
import { IconPlay } from './icons'

/**
 * Image holder that reserves its aspect ratio (no layout shift) and falls back
 * to a warm placeholder block instead of a broken image when no source loads.
 * Optionally overlays a circular play button.
 *
 * Props:
 *  - src, alt: the image (alt is always required for real content).
 *  - fallbackSrc: tried if `src` fails (e.g. YouTube maxres -> hq thumbnail).
 *  - ratio: 'video' (16:9) or 'square'.
 *  - play: show the circular play overlay.
 *  - className: extra classes for the outer frame.
 */
export default function MediaPlaceholder({
  src,
  fallbackSrc,
  alt = '',
  ratio = 'video',
  play = false,
  className = '',
}) {
  const sources = [src, fallbackSrc].filter(Boolean)
  const [idx, setIdx] = useState(0)
  const [loaded, setLoaded] = useState(false)

  const current = sources[idx]
  const showImage = Boolean(current)

  const ratioClass = ratio === 'square' ? 'aspect-square' : 'aspect-video'

  return (
    <div
      className={`group relative overflow-hidden rounded-card bg-sand ${ratioClass} ${className}`}
    >
      {/* Warm placeholder layer, always present beneath the image. */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-sand via-paper to-line"
        aria-hidden={showImage && loaded ? true : undefined}
      >
        {(!showImage || !loaded) && (
          <div className="absolute inset-0 flex items-center justify-center p-6">
            <span className="text-center text-xs font-medium uppercase tracking-[0.18em] text-body/60">
              {alt || 'The Wellness Billion'}
            </span>
          </div>
        )}
      </div>

      {showImage && (
        <img
          key={current}
          src={current}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => {
            setLoaded(false)
            setIdx((i) => i + 1) // advance to next source, or none -> placeholder
          }}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
            loaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}

      {play && (
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-paper/90 text-terracotta shadow-lift backdrop-blur-sm transition-transform duration-300 group-hover:scale-110">
            <IconPlay className="ml-0.5 h-7 w-7" />
          </span>
        </span>
      )}
    </div>
  )
}
