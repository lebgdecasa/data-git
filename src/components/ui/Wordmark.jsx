import { useState } from 'react'

/**
 * Wordmark. Uses /assets/images/wordmark.svg if it is present, otherwise falls
 * back to the styled text wordmark (the brief says text is fine).
 */
export default function Wordmark({ className = '', textClassName = '', invert = false }) {
  const [useText, setUseText] = useState(false)

  if (useText) {
    return (
      <span
        className={`font-display text-lg font-semibold tracking-tight ${
          invert ? 'text-paper' : 'text-ink'
        } ${textClassName}`}
      >
        The Wellness Billion
      </span>
    )
  }

  return (
    <img
      src="/assets/images/wordmark.svg"
      alt="The Wellness Billion"
      className={`h-7 w-auto ${invert ? 'brightness-0 invert' : ''} ${className}`}
      onError={() => setUseText(true)}
    />
  )
}
