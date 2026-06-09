import Reveal from './ui/Reveal'
import MediaPlaceholder from './ui/MediaPlaceholder'
import { featuredEpisode } from '../data/episodes'
import { youTubeThumb, youTubeThumbHq } from '../lib/youtube'

// Hero headline (primary). Alternates you may swap in:
//  - "The conversation about living well, far longer."
//  - "Wellness, without the obsession."

export default function Hero() {
  const watchUrl = featuredEpisode?.url

  return (
    <section id="show" className="section pb-12 pt-28 md:pb-20 md:pt-36">
      <div className="container-editorial grid items-center gap-12 md:grid-cols-12 md:gap-10">
        <div className="md:col-span-6 lg:col-span-6">
          <Reveal>
            <p className="eyebrow">The Wellness Billion · A Podcast</p>
            <h1 className="mt-5 font-display text-[2.6rem] font-semibold leading-[1.04] tracking-[-0.01em] text-ink sm:text-6xl lg:text-[4.1rem]">
              Come share your story on <span className="text-terracotta">The Wellness Billion.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-body">
              A podcast for the voices redefining wellness, without the obsession. We sit down with
              coaches, creators, and practitioners shaping how the world thinks about metabolic
              health, longevity, and living with purpose. If that sounds like you, we would love to
              have you on.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-4">
              <a href="#apply" className="btn-primary">
                Apply to be a guest
              </a>
              <a
                href={watchUrl || '#episodes'}
                target={watchUrl ? '_blank' : undefined}
                rel={watchUrl ? 'noopener noreferrer' : undefined}
                className="group inline-flex items-center gap-2 text-sm font-semibold text-ink"
              >
                <span className="border-b border-terracotta/50 pb-0.5 transition-colors group-hover:border-terracotta">
                  Watch a recent episode
                </span>
              </a>
            </div>
          </Reveal>
        </div>

        <div className="md:col-span-6 lg:col-span-6">
          <Reveal delay={120}>
            <figure className="relative isolate">
              {/* Soft warm glow behind the featured video. */}
              <span
                aria-hidden
                className="pointer-events-none absolute -inset-5 -z-10 rounded-[2.5rem] bg-gradient-to-tr from-terracotta/15 via-gold/10 to-transparent blur-3xl"
              />
              <a
                href={watchUrl || '#episodes'}
                target={watchUrl ? '_blank' : undefined}
                rel={watchUrl ? 'noopener noreferrer' : undefined}
                className="block rounded-card"
                aria-label="Watch the featured episode"
              >
                <MediaPlaceholder
                  src={featuredEpisode?.image}
                  fallbackSrc={[youTubeThumb(watchUrl), youTubeThumbHq(watchUrl)]}
                  alt="The Wellness Billion featured episode"
                  ratio="video"
                  play
                  className="shadow-lift ring-1 ring-line"
                />
              </a>
              <figcaption className="mt-3 text-sm text-body/80">Featured episode</figcaption>
            </figure>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
