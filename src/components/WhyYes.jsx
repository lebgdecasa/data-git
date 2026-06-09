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
                <div className="flex h-full flex-col rounded-card border border-line bg-paper p-6 shadow-soft">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-terracotta/10 text-terracotta">
                    <Icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-5 text-xl font-semibold leading-snug text-ink">{v.title}</h3>
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
