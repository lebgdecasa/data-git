import { useState } from 'react'
import Wordmark from './ui/Wordmark'

const navLinks = [
  { label: 'The Show', href: '#show' },
  { label: 'Episodes', href: '#episodes' },
  { label: 'Hosts', href: '#hosts' },
  { label: 'Mission', href: '#mission' },
  { label: 'Apply', href: '#apply' },
]

// EDIT HERE: replace placeholder hrefs once the real social links exist.
const socialLinks = [
  { label: 'YouTube', href: '[LINK]' },
  { label: 'Instagram', href: '[LINK]' },
  { label: 'TikTok', href: '[LINK]' },
]

const isRealUrl = (url) => typeof url === 'string' && /^https?:\/\//i.test(url)

function EpiLogo() {
  const [hide, setHide] = useState(false)
  if (hide) return null
  return (
    <img
      src="/assets/images/epi-logo.png"
      alt="EPI / Epineon"
      className="h-7 w-auto opacity-80"
      onError={() => setHide(true)}
    />
  )
}

export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="border-t border-line bg-sand">
      <div className="container-editorial px-5 py-14 sm:px-8">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <Wordmark />
            <p className="mt-3 text-sm text-body/80">A podcast from EPI / Epineon.</p>
            <div className="mt-5">
              <EpiLogo />
            </div>
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 gap-x-12 gap-y-2 sm:gap-x-16">
            <ul className="space-y-2">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm font-medium text-body transition-colors hover:text-ink"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
            <ul className="space-y-2">
              {socialLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={isRealUrl(link.href) ? link.href : undefined}
                    target={isRealUrl(link.href) ? '_blank' : undefined}
                    rel={isRealUrl(link.href) ? 'noopener noreferrer' : undefined}
                    className={`text-sm font-medium transition-colors ${
                      isRealUrl(link.href)
                        ? 'text-body hover:text-ink'
                        : 'cursor-default text-body/45'
                    }`}
                    tabIndex={isRealUrl(link.href) ? undefined : -1}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="rule mt-12" />
        <div className="mt-6 flex flex-col gap-2 text-xs text-body/60 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} The Wellness Billion. A podcast from EPI / Epineon.</p>
          <p>A wellness and longevity conversation, not medical advice.</p>
        </div>
      </div>
    </footer>
  )
}
