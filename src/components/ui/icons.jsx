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
