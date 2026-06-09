import Reveal from './ui/Reveal'
import MediaPlaceholder from './ui/MediaPlaceholder'
import { IconLinkedIn, IconInstagram } from './ui/icons'
import { hosts } from '../data/hosts'

const isRealUrl = (url) => typeof url === 'string' && /^https?:\/\//i.test(url)

const ICONS = {
  LinkedIn: IconLinkedIn,
  Instagram: IconInstagram,
}

function SocialLinks({ host }) {
  const links = (host.links || []).filter((l) => isRealUrl(l.href))
  if (links.length === 0) return null
  return (
    <ul className="mt-4 flex items-center justify-center gap-3 sm:justify-start">
      {links.map((link) => {
        const Icon = ICONS[link.label]
        return (
          <li key={link.label}>
            <a
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${host.name} on ${link.label}`}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-paper text-ink transition-colors duration-200 hover:border-terracotta hover:bg-terracotta hover:text-paper"
            >
              {Icon ? <Icon /> : <span className="text-xs font-semibold">{link.label[0]}</span>}
            </a>
          </li>
        )
      })}
    </ul>
  )
}

export default function Hosts() {
  return (
    <section id="hosts" className="section bg-paper">
      <div className="container-editorial">
        <Reveal>
          <p className="eyebrow">Meet the hosts</p>
          <h2 className="mt-4 max-w-2xl text-4xl font-semibold leading-tight sm:text-5xl">
            The voices behind the mic.
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-8 md:grid-cols-2">
          {hosts.map((host, i) => (
            <Reveal key={host.name} delay={i * 110}>
              <article className="flex h-full flex-col gap-6 rounded-card border border-line bg-sand/60 p-6 text-center sm:flex-row sm:p-7 sm:text-left">
                <div className="mx-auto w-28 shrink-0 sm:mx-0 sm:w-32">
                  <MediaPlaceholder
                    src={host.image}
                    alt={`${host.name}, host of The Wellness Billion`}
                    ratio="square"
                    className="rounded-full"
                  />
                  <SocialLinks host={host} />
                </div>
                <div className="flex flex-col">
                  <h3 className="text-2xl font-semibold text-ink">{host.name}</h3>
                  <p className="mt-1 text-sm font-medium uppercase tracking-[0.12em] text-terracotta">
                    {host.role}
                  </p>
                  <p className="mt-3 text-[0.95rem] leading-relaxed text-body">{host.bio}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
