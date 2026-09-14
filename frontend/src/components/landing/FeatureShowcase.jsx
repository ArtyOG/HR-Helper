function Badge({ children }) {
  return (
    <span className="inline-flex items-center rounded-full bg-plum px-5 py-2 text-xs font-semibold uppercase tracking-wide text-white">
      {children}
    </span>
  );
}

const features = [
  {
    number: '01',
    title: 'Form Link Generation',
    body:
      'Unique, secure application links per job listing. Candidates upload resumes as PDF or DOCX directly.',
  },
  {
    number: '02',
    title: 'AI Resume Screening & Ranking',
    body:
      'Resumes are parsed and matched against your JD, then automatically ranked from best-fit to least-fit.',
  },
  {
    number: '03',
    title: 'HR Dashboard & Review',
    body:
      'Preview candidate profiles and rankings, and review or edit automated email templates before they go out.',
  },
  {
    number: '04',
    title: 'Automated & Scheduled Email',
    body:
      'Status updates prevent ghosting automatically. Pick interview times and send customized invites directly.',
  },
];

function FeatureShowcase() {
  return (
    <section id="features" className="bg-white py-20 lg:py-24">
      <div className="mx-auto max-w-site px-6 lg:px-8">
        <Badge>CORE FEATURES</Badge>
        <h2 className="mt-6 max-w-3xl font-serif text-4xl font-bold leading-tight tracking-tight text-plum sm:text-5xl">
          Everything ghosting-proof, out of the box
        </h2>

        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <article
              key={feature.number}
              className="flex h-full flex-col rounded-[59px] border border-plum/10 bg-[#F2F0E8] p-8 transition hover:-translate-y-1 hover:bg-ice hover:shadow-xl hover:shadow-plum/10"
            >
              <span className="font-serif text-5xl font-bold text-plum">{feature.number}</span>
              <h3 className="mt-6 font-serif text-2xl font-bold leading-snug text-plum">
                {feature.title}
              </h3>
              <p className="mt-3 text-justify text-sm leading-relaxed text-stone-600">{feature.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeatureShowcase;
