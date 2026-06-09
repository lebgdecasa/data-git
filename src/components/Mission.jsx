import Reveal from './ui/Reveal'

export default function Mission() {
  return (
    <section id="mission" className="section bg-sand">
      <div className="container-editorial max-w-4xl">
        <Reveal>
          <p className="eyebrow">The mission</p>
          <h2 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">
            Why this show exists.
          </h2>
        </Reveal>

        <Reveal delay={80}>
          <p className="dropcap mt-10 font-display text-3xl font-medium leading-[1.25] text-ink sm:text-[2.6rem] sm:leading-[1.2]">
            Steward humans and organizations to be resilient for their sovereignty and their
            longevity.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-10 sm:grid-cols-2">
          <Reveal delay={120}>
            <div>
              <p className="eyebrow text-gold">The moonshot</p>
              <p className="mt-3 text-lg leading-relaxed text-body">
                Take on the most widespread and fastest-growing health challenge of our time,
                metabolic disease, and the way it compounds as we age.
              </p>
            </div>
          </Reveal>
          <Reveal delay={180}>
            <div>
              <p className="eyebrow text-gold">The solution</p>
              <p className="mt-3 text-lg leading-relaxed text-body">
                We steward you with ultra-personalized nutrition, targeted nutrients, and great
                daily habits, so the decades from your forties to a hundred and beyond are lived
                feeling healthy, with a purposeful life from day one.
              </p>
            </div>
          </Reveal>
        </div>

        <Reveal delay={120}>
          <div className="rule mt-14" />
          <p className="mt-8 font-display text-2xl font-medium leading-snug text-ink sm:text-3xl">
            The Wellness Billion is where we have that conversation, in public, with the people
            shaping it.
          </p>
        </Reveal>
      </div>
    </section>
  )
}
