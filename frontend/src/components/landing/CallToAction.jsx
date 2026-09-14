function CallToAction() {
  return (
    <section id="signup" className="bg-white py-24 lg:py-32">
      <div className="mx-auto max-w-site px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-plum px-6 py-20 text-center shadow-2xl shadow-plum/30 sm:px-12 lg:py-24">
          <div
            className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-plum-light/60 blur-3xl"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -bottom-24 -right-16 h-80 w-80 rounded-full bg-teal/40 blur-3xl"
            aria-hidden="true"
          />

          <div className="relative mx-auto max-w-3xl">
            <h2 className="font-serif text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Stop sorting CVs by hand.
            </h2>
            <p className="mt-5 text-justify text-lg leading-relaxed text-ice/90">
              Set up your first role in under five minutes &mdash; HiORing takes it from there.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a
                href="#top"
                className="w-full rounded-xl border-2 border-white/70 px-8 py-4 text-base font-semibold text-white transition hover:bg-white hover:text-plum sm:w-auto"
              >
                Start free trial
              </a>
              <a
                href="#support"
                className="w-full rounded-xl bg-white px-8 py-4 text-base font-semibold text-plum shadow transition hover:bg-ice sm:w-auto"
              >
                Book a demo
              </a>
            </div>

            <p className="mt-6 text-sm text-ice/75">
              No credit card required &middot; Free for your first 25 CVs
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CallToAction;
