import { useEffect, useRef, useState } from 'react'

/**
 * Subtle scroll-reveal hook built on IntersectionObserver.
 * Returns a ref to attach to an element and a boolean that flips to true
 * once the element scrolls into view. Pair with the `reveal` / `reveal-in`
 * utility classes (see Reveal.jsx) for a gentle fade-up.
 */
export default function useReveal(options = {}) {
  const { threshold = 0.15, rootMargin = '0px 0px -10% 0px', once = true } = options
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    // If IntersectionObserver is unavailable, just show the content.
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          if (once) observer.unobserve(entry.target)
        } else if (!once) {
          setVisible(false)
        }
      },
      { threshold, rootMargin },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [threshold, rootMargin, once])

  return [ref, visible]
}
