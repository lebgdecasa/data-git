import { useEffect, useState } from 'react'
import Wordmark from './ui/Wordmark'

const links = [
  { label: 'The Show', href: '#show' },
  { label: 'Episodes', href: '#episodes' },
  { label: 'Hosts', href: '#hosts' },
  { label: 'Mission', href: '#mission' },
]

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close the mobile menu on Escape.
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const solid = scrolled || open

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        solid ? 'border-b border-line bg-paper/90 backdrop-blur-md' : 'border-b border-transparent'
      }`}
    >
      <nav
        aria-label="Primary"
        className="container-editorial flex items-center justify-between px-5 py-3 sm:px-8"
      >
        <a href="#top" className="flex flex-col leading-none" aria-label="The Wellness Billion, home">
          <Wordmark />
          <span className="mt-1 text-[0.65rem] font-medium uppercase tracking-[0.18em] text-body/70">
            from the team at EPI
          </span>
        </a>

        {/* Desktop links */}
        <div className="hidden items-center gap-8 md:flex">
          <ul className="flex items-center gap-7">
            {links.map((link) => (
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
          <a href="#apply" className="btn-primary">
            Apply to be a guest
          </a>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line text-ink md:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="relative block h-3.5 w-5" aria-hidden>
            <span
              className={`absolute left-0 top-0 h-0.5 w-5 bg-current transition-transform duration-300 ${
                open ? 'translate-y-1.5 rotate-45' : ''
              }`}
            />
            <span
              className={`absolute bottom-0 left-0 h-0.5 w-5 bg-current transition-transform duration-300 ${
                open ? '-translate-y-1.5 -rotate-45' : ''
              }`}
            />
          </span>
        </button>
      </nav>

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        className={`overflow-hidden border-t border-line bg-paper md:hidden ${
          open ? 'max-h-96' : 'max-h-0'
        } transition-[max-height] duration-300 ease-out`}
      >
        <ul className="container-editorial flex flex-col gap-1 px-5 py-3 sm:px-8">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                onClick={() => setOpen(false)}
                className="block rounded-xl px-2 py-3 text-base font-medium text-body hover:bg-sand hover:text-ink"
              >
                {link.label}
              </a>
            </li>
          ))}
          <li className="pb-2 pt-1">
            <a href="#apply" onClick={() => setOpen(false)} className="btn-primary w-full">
              Apply to be a guest
            </a>
          </li>
        </ul>
      </div>
    </header>
  )
}
