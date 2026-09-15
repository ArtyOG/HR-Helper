import heroImage from '../../assets/2-ppl-working.svg';

function Hero() {
  return (
    <section id="top" className="relative overflow-hidden bg-[#F2F0E8]">
      <div>
        <div className="mx-auto grid max-w-site items-center gap-14 px-6 pt-28 md:pt-32 lg:grid-cols-2 lg:gap-12 lg:px-8 lg:pb-10">
          <div>
            <span className="inline-flex items-center rounded-full bg-plum px-5 py-2 text-xs font-semibold uppercase tracking-wide text-white">
              Built for hiring team in Cambodia
            </span>
            <h1 className="mt-6 font-serif text-5xl font-bold leading-[1.05] tracking-tight text-plum sm:text-6xl lg:text-7xl">
              Never leave a
              <br />
              candidate
              <br />
              on read
            </h1>
            <p className="mt-7 max-w-xl text-justify text-lg leading-relaxed text-plum/80">
              HiOring screens and ranks every resume against your job requirements, then keeps
              every candidate updated automatically <span className="text-plum">&mdash;</span> so
              nothing sits in a pile, and no one gets ghosted.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <a
                href="#signup"
                className="rounded-[20px] bg-plum px-8 py-4 text-base font-semibold text-white shadow-lg shadow-plum/20 transition hover:bg-plum-dark"
              >
                Create hiring form
              </a>
              <a
                href="#how-it-works"
                className="group inline-flex items-center gap-2 rounded-[20px] border border-plum/20 bg-white px-8 py-4 text-base font-semibold text-plum transition hover:border-plum"
              >
                see how it works
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 transition group-hover:translate-x-0.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 rotate-3 rounded-[2rem] bg-plum/10" aria-hidden="true" />
            <img
              src={heroImage}
              alt="HiOring AI resume screening and ranking dashboard"
              className="relative w-full rounded-[2rem] border border-plum/10 object-cover shadow-2xl shadow-plum/20"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
