import { useState } from 'react'

/**
 * Small square podcast-logo badge. Uses /assets/images/logo.png if present and
 * hides itself if the file is not there yet (so nothing breaks before you add
 * the cover art).
 */
export default function LogoBadge({ className = '', size = 'h-9 w-9' }) {
  const [hide, setHide] = useState(false)
  if (hide) return null

  return (
    <img
      src="/assets/images/logo.png"
      alt="The Wellness Billion podcast"
      className={`${size} shrink-0 rounded-lg object-cover ring-1 ring-line ${className}`}
      onError={() => setHide(true)}
    />
  )
}
