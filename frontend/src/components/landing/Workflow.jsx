function Badge({ children }) {
  return (
    <span className="inline-flex items-center rounded-full bg-plum px-5 py-2 text-xs font-semibold uppercase tracking-wide text-white">
      {children}
    </span>
  );
}

const workflows = [
  {
    tag: 'While resumes come in',
    title: 'Stop sorting. Start deciding.',
    body:
      'Post a role, set your requirements, and let HiOring bring the strongest candidates to the top of your dashboard automatically.',
    points: [
      'Generate a job link in under two minutes',
      'See every candidate ranked against your JD',
      'Preview full profiles without opening a single PDF by hand',
    ],
    cta: 'Create a hiring form',
    href: '#signup',
  },
  {
    tag: "Once you've shortlisted",
    title: 'Send invites in one click, not one by one.',
    body:
      'Review and edit the auto-generated email templates, pick your interview slots, and let HiOring handle the sending and status updates.',
    points: [
      'Edit rejection, update, and invite templates before they go out',
      'Select interview times and send customized invites directly',
      'Every candidate gets an automatic status update \u2014 no more silence',
    ],
    cta: 'See the dashboard',
    href: '#features',
    spacedCta: true,
  },
];

function Workflow() {
  return (
    <section className="bg-white py-20 lg:py-24">
      <div className="mx-auto max-w-site px-6 lg:px-8">
        <Badge>BUILT FOR YOUR WORKFLOW</Badge>
        <h2 className="mt-6 max-w-3xl font-serif text-4xl font-bold leading-tight tracking-tight text-plum sm:text-5xl">
          From the first resume to the signed interview slot
        </h2>
        <p className="mt-5 max-w-3xl text-justify text-lg leading-relaxed text-stone-600">
          Everything below happens on your dashboard. Candidates only ever see the secure link
          you send them.
        </p>

        <div className="mt-14 grid items-stretch gap-8 lg:grid-cols-2">
          {workflows.map((wf) => (
            <article key={wf.title} className="flex flex-col rounded-[20px] bg-plum p-8 text-white sm:p-10">
              <h3 className="text-base font-bold text-ice/80">{wf.tag}</h3>
              <p className="mt-2 font-serif text-3xl font-bold leading-tight text-white">
                {wf.title}
              </p>
              <p className="mt-4 text-justify text-base leading-relaxed text-ice/85">{wf.body}</p>

              <div className="mt-7 border-t border-white/15 pt-7">
                <ul className="space-y-3.5">
                  {wf.points.map((point) => (
                    <li key={point} className="flex items-start gap-3 text-sm leading-relaxed text-ice/90">
                      <span className="mt-0.5 shrink-0 font-mono text-base leading-none text-gold" aria-hidden="true">
                        &rarr;
                      </span>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>

              <a
                href={wf.href}
                className={`inline-block self-start rounded-full bg-white px-7 py-3 text-sm font-semibold text-plum transition hover:bg-ice ${
                  wf.spacedCta ? 'mt-12' : 'mt-auto'
                }`}
              >
                {wf.cta}
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Workflow;
