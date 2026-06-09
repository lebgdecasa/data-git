import Reveal from './ui/Reveal'

const steps = [
  {
    n: '01',
    title: 'Apply',
    body: 'A couple of minutes, the form below.',
  },
  {
    n: '02',
    title: 'We reach out',
    body: "Within a few days if it's a fit.",
  },
  {
    n: '03',
    title: 'Record',
    body: 'A relaxed 45 to 60 minute conversation, remote or in studio. Light prep, we send talking points ahead.',
  },
  {
    n: '04',
    title: 'Go live',
    body: 'Full episode on YouTube and audio platforms, plus short clips for you to share.',
  },
]

export default function Expect() {
  return (
    <section className="section bg-sand">
      <div className="container-editorial">
        <Reveal>
          <p className="eyebrow">What to expect as a guest</p>
          <h2 className="mt-4 max-w-2xl text-4xl font-semibold leading-tight sm:text-5xl">
            What being a guest looks like.
          </h2>
        </Reveal>

        <ol className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <Reveal as="li" key={step.n} delay={(i % 4) * 80}>
              <div className="relative flex h-full flex-col">
                <span className="font-display text-3xl font-semibold text-terracotta/80">
                  {step.n}
                </span>
                <div className="rule mt-4" />
                <h3 className="mt-4 text-xl font-semibold text-ink">{step.title}</h3>
                <p className="mt-2 text-[0.95rem] leading-relaxed text-body">{step.body}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  )
}
