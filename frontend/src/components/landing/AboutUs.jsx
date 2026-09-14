function Badge({ children }) {
  return (
    <span className="inline-flex items-center rounded-full bg-plum px-5 py-2 text-xs font-semibold uppercase tracking-wide text-white">
      {children}
    </span>
  );
}

const stats = [
  { value: '200+', label: 'HR team onboard' },
  { value: '1.2M', label: 'CVs sorted to date' },
  { value: '70%', label: 'less time screening' },
  { value: '2022', label: 'founded' },
];

const timeline = [
  {
    year: '2022',
    label: 'HiORing founded',
    body:
      'Two co-founders leave their startups, tired of losing strong candidates to silent inboxes, and start building the first version.',
  },
  {
    year: '2023',
    label: 'Scheduled Email launches',
    body:
      'The automated status-update engine goes live \u2014 every candidate now gets an answer, no more guessing where things stand.',
  },
  {
    year: '2024',
    label: '100 HR teams onboard',
    body:
      'A hundred teams across the region run their hiring on HiORing, cutting resume sorting time by a third on average.',
  },
  {
    year: '2026',
    label: '1.2M CVs sorted',
    body:
      'Over a million resumes ranked and responded to. What started as an internal tool is now the system behind a global hiring movement.',
  },
];

const beliefs = [
  {
    title: 'Automate the repetitive, not the human parts',
    body: 'Sorting and scheduling should run themselves. The judgment calls stay with your team.',
  },
  {
    title: 'Every candidate deserves an answer',
    body: 'Silence is the most expensive hiring mistake. We keep everyone in the loop automatically.',
  },
  {
    title: 'Small teams, unfair advantage',
    body: 'You should not need an army of recruiters to hire well. One dashboard does the heavy lifting.',
  },
];

function AboutUs() {
  return (
    <section id="about" className="bg-white py-20 lg:py-24">
      <div className="mx-auto max-w-site px-6 lg:px-8">
        <div className="rounded-[59px] bg-[#F2F0E8] px-6 py-16 sm:px-12 lg:px-16">
          <Badge>ABOUT HiORing</Badge>
          <h2 className="mt-6 font-serif text-4xl font-bold leading-tight tracking-tight text-plum sm:text-5xl">
            We turned a messy hiring inbox into a calm, ranked pipeline.
          </h2>
          <p className="mt-6 text-justify text-lg leading-relaxed text-plum/80">
            HiORing started with a simple frustration: too many good candidates were
            getting lost in inboxes, and too many HR teams were spending their week on
            sorting instead of talking to people.
          </p>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-[59px] bg-plum px-6 py-10 text-center"
              >
                <p className="font-serif text-4xl font-bold text-gold sm:text-5xl">
                  {stat.value}
                </p>
                <p className="mx-auto mt-3 max-w-[10rem] text-sm font-medium leading-snug text-ice/90">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-20 grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-teal">Our Story</p>
            <h2 className="mt-4 font-serif text-3xl font-bold leading-tight tracking-tight text-plum sm:text-4xl">
              Built by people who were tired of the pile
            </h2>
            <p className="mt-5 text-justify text-base leading-relaxed text-stone-600">
              Before HiORing, our founding team ran talent operations at fast-growing startups
              &mdash; and watched the same problem repeat everywhere. Open roles brought in
              hundreds of CVs, but only a handful of hours to review them. Strong candidates
              went quiet because a follow-up email never got sent.
            </p>
            <p className="mt-4 text-justify text-base leading-relaxed text-stone-600">
              We built HiORing to fix both halves of that problem at once: rank every CV the
              moment it lands, and keep every candidate in the loop automatically. What started
              as an internal tool for our own hiring is now the system behind hiring teams at
              over 200 companies.
            </p>
          </div>

          <div className="flex flex-col justify-center rounded-[59px] bg-plum p-8 text-white sm:p-12">
            <div className="flex items-center gap-5">
              <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gold font-serif text-2xl font-bold text-plum">
                K
              </span>
              <div>
                <p className="font-serif text-xl font-bold text-white">Co-founder</p>
                <p className="text-sm text-ice/70">HiORing</p>
              </div>
            </div>
            <blockquote className="mt-6 border-l-4 border-gold pl-5 font-serif text-xl font-medium leading-relaxed text-ice sm:text-2xl">
              &ldquo;We&rsquo;re not trying to replace recruiters. We&rsquo;re trying to give
              them their week back.&rdquo;
            </blockquote>
          </div>
        </div>

        <div className="mt-20">
          <p className="text-sm font-bold uppercase tracking-widest text-teal">The Journey</p>
          <h2 className="mt-4 font-serif text-4xl font-bold leading-tight tracking-tight text-plum sm:text-5xl">
            How we got there
          </h2>

          <div className="relative mt-16">
            <span
              className="absolute left-0 right-0 top-5 hidden h-px bg-plum/20 lg:block"
              aria-hidden="true"
            />
            <ol className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
              {timeline.map((item) => (
                <li key={item.year} className="relative">
                  <span className="relative z-10 flex h-11 w-11 items-center justify-center rounded-full border-2 border-plum/25 bg-white">
                    <span className="h-3 w-3 rounded-full bg-plum" aria-hidden="true" />
                  </span>
                  <p className="mt-6 text-sm font-bold uppercase tracking-widest text-teal">
                    {item.year}
                  </p>
                  <h3 className="mt-1 min-h-[2.5em] font-serif text-2xl font-bold leading-tight text-plum">
                    {item.label}
                  </h3>
                  <p className="mt-3 max-w-xs text-justify text-base leading-relaxed text-stone-600">
                    {item.body}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="mt-20">
          <p className="text-sm font-bold uppercase tracking-widest text-teal">Our Values</p>
          <h2 className="mt-4 font-serif text-4xl font-bold leading-tight tracking-tight text-plum sm:text-5xl">
            What we believe
          </h2>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {beliefs.map((belief, index) => (
              <article
                key={belief.title}
                className="flex h-full flex-col rounded-[28px] border border-plum/10 bg-[#F2F0E8] p-8 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-plum/10"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-plum font-serif text-lg font-bold text-ice">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-6 font-serif text-2xl font-bold leading-snug text-plum">
                  {belief.title}
                </h3>
                <p className="mt-3 text-justify text-base leading-relaxed text-stone-600">
                  {belief.body}
                </p>
              </article>
            ))}
          </div>
        </div>

        <div className="mt-20 rounded-[59px] bg-[#F2F0E8] px-6 py-16 text-center sm:px-12">
          <h2 className="font-serif text-3xl font-bold leading-tight tracking-tight text-plum sm:text-4xl">
            Want to see HiORing on your own hiring pipeline?
          </h2>
          <p className="mt-4 text-lg text-plum/80">
            Start free &mdash; no credit card required.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="#signup"
              className="w-full rounded-xl bg-plum px-8 py-4 text-base font-semibold text-white transition hover:bg-plum-dark sm:w-auto"
            >
              Start free trial
            </a>
            <a
              href="#support"
              className="w-full rounded-xl border-2 border-plum/30 bg-white px-8 py-4 text-base font-semibold text-plum transition hover:border-plum sm:w-auto"
            >
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AboutUs;

