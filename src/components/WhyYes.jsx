import Reveal from './ui/Reveal'
import { IconReach, IconCompany, IconClips, IconMovement } from './ui/icons'

const values = [
  {
    icon: IconReach,
    title: 'Reach an engaged audience',
    body: 'A growing community that cares about health for the long run, not quick fixes.',
  },
  {
    icon: IconCompany,
    title: 'Be in good company',
    body: 'Sit alongside respected coaches, creators, and practitioners.',
  },
  {
    icon: IconClips,
    title: 'Clips made for your channels',
    body: 'We hand you polished short cuts to repost.',
  },
  {
    icon: IconMovement,
    title: 'Join a movement',
    body: 'A show backed by a team building the future of metabolic wellness.',
  },
]

export default function WhyYes() {
  return (
    <section className="section bg-sand">
      <div className="container-editorial">
        <Reveal>
          <p className="eyebrow">Why come on the show</p>
          <h2 className="mt-4 max-w-2xl text-4xl font-semibold leading-tight sm:text-5xl">
            Why creators say yes.
          </h2>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-body">
            This is a show for people who take health seriously, without turning it into an
            obsession.
          </p>
        </Reveal>

        <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((v, i) => {
            const Icon = v.icon
            return (
              <Reveal as="li" key={v.title} delay={(i % 4) * 80}>
                <div className="group relative flex h-full flex-col overflow-hidden rounded-card border border-line bg-paper p-7 shadow-soft transition-all duration-300 hover:-translate-y-1.5 hover:border-terracotta/40 hover:shadow-lift">
                  {/* Soft warm glow that surfaces on hover. */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-terracotta/15 blur-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  />
                  <div className="flex items-center justify-between">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-terracotta/15 to-gold/15 text-terracotta ring-1 ring-terracotta/10 transition-colors duration-300 group-hover:from-terracotta group-hover:to-terracotta-hover group-hover:text-paper group-hover:ring-terracotta">
                      <Icon className="h-6 w-6" />
                    </span>
                    <span className="font-display text-2xl font-semibold text-line transition-colors duration-300 group-hover:text-terracotta/40">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <h3 className="mt-6 text-xl font-semibold leading-snug text-ink">{v.title}</h3>
                  <p className="mt-2 text-[0.95rem] leading-relaxed text-body">{v.body}</p>
                </div>
              </Reveal>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
