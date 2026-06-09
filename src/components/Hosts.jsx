import Reveal from './ui/Reveal'
import MediaPlaceholder from './ui/MediaPlaceholder'
import { hosts } from '../data/hosts'

const isRealUrl = (url) => typeof url === 'string' && /^https?:\/\//i.test(url)

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
              <article className="flex h-full flex-col gap-6 rounded-card border border-line bg-sand/60 p-6 sm:flex-row sm:p-7">
                <div className="w-28 shrink-0 sm:w-32">
                  <MediaPlaceholder
                    src={host.image}
                    alt={`${host.name}, host of The Wellness Billion`}
                    ratio="square"
                    className="rounded-full"
                  />
                </div>
                <div className="flex flex-col">
                  <h3 className="text-2xl font-semibold text-ink">{host.name}</h3>
                  <p className="mt-1 text-sm font-medium uppercase tracking-[0.12em] text-terracotta">
                    {host.role}
                  </p>
                  <p className="mt-3 text-[0.95rem] leading-relaxed text-body">{host.bio}</p>
                  {host.links?.length > 0 && (
                    <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
                      {host.links.map((link) => (
                        <li key={link.label}>
                          <a
                            href={isRealUrl(link.href) ? link.href : undefined}
                            target={isRealUrl(link.href) ? '_blank' : undefined}
                            rel={isRealUrl(link.href) ? 'noopener noreferrer' : undefined}
                            className={`text-sm font-semibold ${
                              isRealUrl(link.href)
                                ? 'text-ink underline decoration-terracotta/40 underline-offset-4 hover:decoration-terracotta'
                                : 'cursor-default text-body/45'
                            }`}
                            tabIndex={isRealUrl(link.href) ? undefined : -1}
                          >
                            {link.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
