import Reveal from './ui/Reveal'
import { pillars } from '../data/pillars'

function StatusTag({ status }) {
  const styles = {
    'Live today': 'bg-teal/15 text-[#0E8A8C] ring-1 ring-teal/30',
    'In development': 'bg-gold/20 text-[#8A6712] ring-1 ring-gold/40',
    Roadmap: 'bg-line/60 text-body ring-1 ring-line',
  }
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.08em] ${
        styles[status] || styles.Roadmap
      }`}
    >
      {status}
    </span>
  )
}

export default function Building() {
  return (
    <section className="section bg-paper">
      <div className="container-editorial">
        <Reveal>
          <p className="eyebrow">What we are building</p>
          <h2 className="mt-4 max-w-2xl text-3xl font-semibold leading-tight sm:text-4xl">
            Backed by what we are building at EPI.
          </h2>
        </Reveal>

        <ul className="mt-10 grid gap-5 sm:grid-cols-2">
          {pillars.map((pillar, i) => (
            <Reveal as="li" key={pillar.title} delay={(i % 2) * 90}>
              <div className="group flex h-full flex-col rounded-card border border-line bg-sand/50 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-terracotta/30 hover:shadow-soft">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-lg font-semibold text-ink">{pillar.title}</h3>
                  <StatusTag status={pillar.status} />
                </div>
                <p className="mt-3 text-sm leading-relaxed text-body">{pillar.body}</p>
              </div>
            </Reveal>
          ))}
        </ul>

        <Reveal>
          <p className="mt-8 max-w-3xl text-xs leading-relaxed text-body/70">
            EPI Nutrition, the scoring app, is live today. The multi-sensor hardware, the peer app,
            and the digital twin are in development or planned. The Wellness Billion is a wellness
            and longevity conversation, not medical advice.
          </p>
        </Reveal>
      </div>
    </section>
  )
}
