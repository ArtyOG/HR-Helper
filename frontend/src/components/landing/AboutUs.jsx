import { useNavigation } from '../../context/NavigationContext';

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
  { value: '70%', label: 'less time screening' }
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
  const { goToLogin } = useNavigation();
  return (
    <section id="about" className="bg-white py-20 lg:py-24">
      <div className="mx-auto max-w-site px-6 lg:px-8">
        <div className="rounded-[59px] bg-[#F2F0E8] px-6 py-16 sm:px-12 lg:px-16">
          <Badge>ABOUT HiORing</Badge>
          <h2 className="mt-6 font-sans text-4xl font-bold leading-tight tracking-tight text-plum sm:text-5xl">
            We turned a messy hiring inbox into a calm, ranked pipeline.
          </h2>
          <p className="mt-6 text-justify text-lg leading-relaxed text-plum/80">
            HiORing started with a simple frustration: too many good candidates were
            getting lost in inboxes, and too many HR teams were spending their week on
            sorting instead of talking to people.
          </p>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-[59px] bg-plum px-6 py-10 text-center"
              >
                <p className="font-sans text-4xl font-bold text-gold sm:text-5xl">
                  {stat.value}
                </p>
                <p className="mx-auto mt-3 max-w-[10rem] text-sm font-medium leading-snug text-white/90">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-20">
          <p className="text-sm font-bold uppercase tracking-widest text-teal">Our Values</p>
          <h2 className="mt-4 font-sans text-4xl font-bold leading-tight tracking-tight text-plum sm:text-5xl">
            What we believe
          </h2>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {beliefs.map((belief, index) => (
              <article
                key={belief.title}
                className="flex h-full flex-col rounded-[28px] border border-plum/10 bg-[#F2F0E8] p-8 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-plum/10"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-plum font-sans text-lg font-bold text-white">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-6 font-sans text-2xl font-bold leading-snug text-plum">
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
          <h2 className="font-sans text-3xl font-bold leading-tight tracking-tight text-plum sm:text-4xl">
            Want to see HiORing on your own hiring pipeline?
          </h2>
          <p className="mt-4 text-lg text-plum/80">
            Start free &mdash; no credit card required.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button
              type="button"
              onClick={goToLogin}
              className="w-full rounded-xl bg-plum px-8 py-4 text-base font-semibold text-white transition hover:bg-plum-dark sm:w-auto"
            >
              Start free trial
            </button>
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

