import Reveal from './ui/Reveal'
import MediaPlaceholder from './ui/MediaPlaceholder'
import { IconArrow } from './ui/icons'
import { episodes } from '../data/episodes'
import { youTubeThumb, youTubeThumbHq } from '../lib/youtube'

const isRealUrl = (url) => typeof url === 'string' && /^https?:\/\//i.test(url)

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
          {episodes.map((ep, i) => {
            const live = isRealUrl(ep.url)
            return (
              <Reveal as="li" key={ep.id} delay={(i % 3) * 90}>
                <article className="group flex h-full flex-col">
                  <a
                    href={live ? ep.url : undefined}
                    target={live ? '_blank' : undefined}
                    rel={live ? 'noopener noreferrer' : undefined}
                    className="block rounded-card transition-transform duration-300 group-hover:-translate-y-1.5"
                    aria-label={`Watch ${ep.title}`}
                    tabIndex={live ? undefined : -1}
                  >
                    <MediaPlaceholder
                      src={ep.image}
                      fallbackSrc={[youTubeThumb(ep.url), youTubeThumbHq(ep.url)]}
                      alt={ep.title}
                      ratio="video"
                      play
                      className="ring-1 ring-line transition-shadow duration-300 group-hover:shadow-lift"
                    />
                  </a>
                  <div className="mt-4 flex flex-1 flex-col">
                    <h3 className="text-lg font-semibold leading-snug text-ink">{ep.title}</h3>
                    <div className="mt-3 pt-1">
                      {live ? (
                        <a
                          href={ep.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-sm font-semibold text-terracotta transition-colors hover:text-terracotta-hover"
                        >
                          Watch
                          <IconArrow className="h-4 w-4" />
                          <span className="sr-only">{ep.title}</span>
                        </a>
                      ) : (
                        <span className="text-sm font-semibold text-body/45">Watch · coming soon</span>
                      )}
                    </div>
                  </div>
                </article>
              </Reveal>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
