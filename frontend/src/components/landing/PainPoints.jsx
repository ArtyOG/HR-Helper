function Badge({ children }) {
  return (
    <span className="inline-flex items-center rounded-full bg-plum px-5 py-2 text-xs font-semibold uppercase tracking-wide text-white">
      {children}
    </span>
  );
}

const withoutPoints = [
  'Resumes open one by one, compared by eye against the JD',
  'Strong candidates get buried under volume',
  'Interview invites sent one email at a time',
  'Candidates wait days or weeks with no update',
];

const withPoints = [
  'Every resume parsed and scored against your requirements',
  'Best-fit candidates surfaced to the top automatically',
  'Interview invites sent the moment a candidate is shortlisted',
  'Every candidate always knows where they stand',
];

function PainPoints() {
  return (
    <section id="problem" className="bg-white py-20 lg:py-24">
      <div className="mx-auto max-w-site px-6 lg:px-8">
        <Badge>The problem</Badge>
        <h2 className="mt-6 max-w-3xl font-serif text-4xl font-bold leading-tight tracking-tight text-plum sm:text-5xl">
          Hiring goes quiet. Candidates stop waiting &mdash; and start assuming the worst.
        </h2>
        <p className="mt-5 max-w-3xl text-justify text-lg leading-relaxed text-stone-600">
          Most small teams don't ghost candidates on purpose. It just happens when 80 resumes sit
          in one inbox and every reply has to be typed by hand.
        </p>

        <div className="mt-14 grid gap-8 lg:grid-cols-2">
          <div className="rounded-[20px] bg-[#F2F0E8] p-8 sm:p-10">
            <p className="font-serif text-2xl font-bold text-stone-500">Without HiORing</p>
            <p className="mt-4 font-serif text-xl font-bold text-stone-700">The manual pile</p>
            <ul className="mt-6 space-y-4">
              {withoutPoints.map((point) => (
                <li key={point} className="flex items-start gap-3 text-base text-stone-600">
                  <span className="mt-[0.65em] flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-stone-300 text-stone-500">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-2.5 w-2.5">
                      <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
                    </svg>
                  </span>
                  {point}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-[20px] bg-plum p-8 text-white sm:p-10">
            <p className="font-serif text-2xl font-bold text-gold">With HiORing</p>
            <p className="mt-4 font-serif text-xl font-bold text-white">The ranked queue</p>
            <ul className="mt-6 space-y-4">
              {withPoints.map((point) => (
                <li key={point} className="flex items-start gap-3 text-base text-ice/90">
                  <span className="mt-[0.65em] flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-teal text-white">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-2.5 w-2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

export default PainPoints;
