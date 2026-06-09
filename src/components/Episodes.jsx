import Reveal from './ui/Reveal'
import MediaPlaceholder from './ui/MediaPlaceholder'
import { IconArrow } from './ui/icons'
import { episodes } from '../data/episodes'

const isRealUrl = (url) => typeof url === 'string' && /^https?:\/\//i.test(url)

function WatchLink({ url, title }) {
  if (isRealUrl(url)) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-terracotta transition-colors hover:text-terracotta-hover"
      >
        Watch
        <IconArrow className="h-4 w-4" />
        <span className="sr-only">{title}</span>
      </a>
    )
  }
  // No live URL yet, show a quiet non-link so the layout stays complete.
  return <span className="text-sm font-semibold text-body/45">Watch · coming soon</span>
}

export default function Episodes() {
  return (
    <section id="episodes" className="section bg-paper">
      <div className="container-editorial">
        <Reveal>
          <p className="eyebrow">Recent conversations</p>
          <h2 className="mt-4 max-w-2xl text-4xl font-semibold leading-tight sm:text-5xl">
            Recent conversations.
          </h2>
        </Reveal>

        <ul className="mt-12 grid gap-x-7 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {episodes.map((ep, i) => (
            <Reveal as="li" key={ep.id} delay={(i % 3) * 90}>
              <article className="group flex h-full flex-col">
                <a
                  href={isRealUrl(ep.url) ? ep.url : undefined}
                  target={isRealUrl(ep.url) ? '_blank' : undefined}
                  rel={isRealUrl(ep.url) ? 'noopener noreferrer' : undefined}
                  className="block rounded-card transition-transform duration-300 group-hover:-translate-y-1.5"
                  aria-label={`Watch ${ep.title} with ${ep.guest}`}
                  tabIndex={isRealUrl(ep.url) ? undefined : -1}
                >
                  <MediaPlaceholder
                    src={ep.image}
                    alt={`The Wellness Billion episode with ${ep.guest}`}
                    ratio="video"
                    play
                    className="ring-1 ring-line transition-shadow duration-300 group-hover:shadow-lift"
                  />
                </a>
                <div className="mt-4 flex flex-1 flex-col">
                  <h3 className="text-xl font-semibold leading-snug text-ink">{ep.title}</h3>
                  <p className="mt-1 text-sm text-body/80">{ep.guest}</p>
                  <div className="mt-4 pt-1">
                    <WatchLink url={ep.url} title={`${ep.title} with ${ep.guest}`} />
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}
