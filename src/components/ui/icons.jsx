// Small inline line icons. Decorative by default (aria-hidden); the surrounding
// text carries the meaning. Stroke inherits currentColor.

const base = {
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
}

export function IconReach(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 19a5.5 5.5 0 0 1 11 0" />
      <path d="M16 7.5a3 3 0 0 1 0 6" />
      <path d="M16.5 13.5A5.5 5.5 0 0 1 20.5 19" />
    </svg>
  )
}

export function IconCompany(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 14c-3.3 0-6 1.9-6 4.3V20h12v-1.7c0-2.4-2.7-4.3-6-4.3Z" />
      <circle cx="12" cy="8" r="3.2" />
      <path d="M5 11.5a2.4 2.4 0 0 1 0-4.6" />
      <path d="M19 11.5a2.4 2.4 0 0 0 0-4.6" />
    </svg>
  )
}

export function IconClips(props) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="M3 9h18" />
      <path d="M7 5v4M12 5v4M17 5v4" />
      <path d="m10.5 12.5 3 1.8-3 1.8z" />
    </svg>
  )
}

export function IconMovement(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="m15.5 8.5-2 5-5 2 2-5 5-2Z" />
    </svg>
  )
}

export function IconPlay(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden width={24} height={24} {...props}>
      <path d="M9 7.5v9a.6.6 0 0 0 .92.5l7-4.5a.6.6 0 0 0 0-1l-7-4.5A.6.6 0 0 0 9 7.5Z" />
    </svg>
  )
}

export function IconArrow(props) {
  return (
    <svg {...base} {...props}>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  )
}

export function IconCheck(props) {
  return (
    <svg {...base} {...props}>
      <path d="m5 12.5 4 4 10-10" />
    </svg>
  )
}

// Brand glyphs (filled, currentColor). aria-hidden; the link's label carries
// the accessible name.
export function IconLinkedIn(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden width={20} height={20} {...props}>
      <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3V9Zm6 0h3.8v1.64h.05c.53-.95 1.83-1.95 3.76-1.95C20.6 8.69 22 10.5 22 13.6V21h-4v-6.4c0-1.53-.03-3.5-2.13-3.5-2.13 0-2.46 1.66-2.46 3.38V21H9V9Z" />
    </svg>
  )
}

export function IconInstagram(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden width={20} height={20} {...props}>
      <path d="M12 2.2c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.21 15.58 2.2 15.2 2.2 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.21 8.8 2.2 12 2.2Zm0 1.8c-3.15 0-3.5.01-4.74.07-.99.05-1.53.21-1.88.35-.47.18-.81.4-1.16.76-.36.35-.58.69-.76 1.16-.14.35-.3.89-.35 1.88C3.01 8.5 3 8.85 3 12s.01 3.5.07 4.74c.05.99.21 1.53.35 1.88.18.47.4.81.76 1.16.35.36.69.58 1.16.76.35.14.89.3 1.88.35 1.24.06 1.59.07 4.74.07s3.5-.01 4.74-.07c.99-.05 1.53-.21 1.88-.35.47-.18.81-.4 1.16-.76.36-.35.58-.69.76-1.16.14-.35.3-.89.35-1.88.06-1.24.07-1.59.07-4.74s-.01-3.5-.07-4.74c-.05-.99-.21-1.53-.35-1.88a3.1 3.1 0 0 0-.76-1.16 3.1 3.1 0 0 0-1.16-.76c-.35-.14-.89-.3-1.88-.35C15.5 4.01 15.15 4 12 4Zm0 3.05A4.95 4.95 0 1 1 12 17a4.95 4.95 0 0 1 0-9.9Zm0 1.8a3.15 3.15 0 1 0 0 6.3 3.15 3.15 0 0 0 0-6.3Zm5.15-.9a1.15 1.15 0 1 1 0 2.3 1.15 1.15 0 0 1 0-2.3Z" />
    </svg>
  )
}
