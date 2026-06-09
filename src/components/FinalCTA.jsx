import Reveal from './ui/Reveal'

export default function FinalCTA() {
  return (
    <section className="px-5 py-20 sm:px-8 md:py-24">
      <div className="container-editorial">
        <Reveal>
          <div className="overflow-hidden rounded-card bg-terracotta px-6 py-14 text-center shadow-lift sm:px-12 sm:py-20">
            <h2 className="mx-auto max-w-2xl text-4xl font-semibold leading-tight text-paper sm:text-5xl">
              Ready to share your story?
            </h2>
            <a
              href="#apply"
              className="mt-8 inline-flex items-center justify-center rounded-full bg-paper px-7 py-3.5 text-sm font-semibold text-terracotta shadow-soft transition-colors duration-200 hover:bg-sand"
            >
              Apply to be a guest
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
