function Badge({ children }) {
  return (
    <span className="inline-flex items-center rounded-full bg-plum px-5 py-2 text-xs font-semibold uppercase tracking-wide text-white">
      {children}
    </span>
  );
}

const steps = [
  {
    number: '1',
    label: 'Step 1',
    title: 'Generate a secure application link',
    body:
      'Create a unique form for each job listing. Candidates fill in their details and upload a resume in PDF or DOCX \u2014 no account needed on their end.',
  },
  {
    number: '2',
    label: 'Step 2',
    title: 'AI screens and ranks every resume',
    body:
      'Our model reads each resume against your job description and requirements, then ranks candidates from best-fit to least-fit \u2014 automatically.',
  },
  {
    number: '3',
    label: 'Step 3',
    title: 'Review on your dashboard',
    body:
      'Preview ranked profiles, then check or edit the automated email templates for rejections, updates, and interview invitations before anything sends.',
  },
  {
    number: '4',
    label: 'Step 4',
    title: 'Schedule, send, done',
    body:
      'Pick an interview time and HiOring sends the customized invite directly \u2014 and every candidate gets an automatic status update, whatever the outcome.',
  },
];

function Steps() {
  return (
    <section id="how-it-works" className="bg-white py-20 lg:py-24">
      <div className="mx-auto max-w-site px-6 lg:px-8">
        <Badge>HOW IT WORKS</Badge>
        <h2 className="mt-6 max-w-3xl font-serif text-4xl font-bold leading-tight tracking-tight text-plum sm:text-5xl">
          From job link to interview, on one thread
        </h2>
        <p className="mt-5 max-w-3xl text-justify text-lg leading-relaxed text-stone-600">
          Every step logs a timestamp &mdash; the same read-receipt trail candidates see, so
          nothing gets lost between HR and the inbox.
        </p>

        <ol className="mt-16 max-w-3xl">
          {steps.map((step, index) => (
            <li key={step.number} className="relative flex gap-8 pb-12 last:pb-0">
              {index < steps.length - 1 && (
                <span
                  className="absolute left-[22px] top-14 h-[calc(100%-3rem)] w-px bg-plum/20"
                  aria-hidden="true"
                />
              )}
              <span className="relative mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-plum/25 bg-[#F2F0E8]">
                <span className="h-3 w-3 rounded-full bg-plum" aria-hidden="true" />
                <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-plum opacity-0">
                  {step.number}
                </span>
              </span>
              <div>
                <p className="text-sm font-bold uppercase tracking-widest text-teal">{step.label}</p>
                <h3 className="mt-1 font-serif text-2xl font-bold text-plum">{step.title}</h3>
                <p className="mt-3 max-w-2xl text-justify text-base leading-relaxed text-stone-600">
                  {step.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export default Steps;
