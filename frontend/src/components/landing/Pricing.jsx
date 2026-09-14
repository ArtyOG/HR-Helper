const plans = [
  {
    name: 'Starter',
    price: '$0',
    period: 'forever',
    blurb: 'For trying HiORing on your next role.',
    features: ['25 CVs per month', 'Manual email scheduling', 'Basic CV scoring'],
    cta: 'Start free',
    featured: false,
  },
  {
    name: 'Pro',
    price: '$29',
    period: 'per month',
    blurb: 'For teams hiring every week.',
    features: ['Unlimited CVs', 'Automated email sequences', 'Priority support'],
    cta: 'Start free trial',
    featured: true,
    badge: 'Most popular',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: null,
    blurb: 'For high-volume hiring at scale.',
    features: [
      'Unlimited CVs',
      'Custom scoring models',
      'Dedicated account manager',
      'SSO and audit logs',
    ],
    cta: 'Talk to sales',
    featured: false,
  },
];

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      className="mt-0.5 h-4 w-4 shrink-0 text-teal"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function Pricing() {
  return (
    <section id="pricing" className="bg-white py-24 lg:py-32">
      <div className="mx-auto max-w-site px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-serif text-4xl font-bold tracking-tight text-plum sm:text-5xl">
            Simple pricing, no per-CV surprises
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-stone-600">
            Every plan includes CV sorting and scheduled email. Upgrade as your hiring volume grows.
          </p>
        </div>

        <div className="mt-16 grid items-stretch gap-8 lg:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className={`relative flex flex-col rounded-[2rem] bg-ice p-8 shadow-sm ${
                plan.featured ? 'ring-2 ring-plum lg:-my-4 lg:py-12' : ''
              }`}
            >
              {plan.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-plum px-4 py-1 text-xs font-bold uppercase tracking-wide text-white shadow">
                  {plan.badge}
                </span>
              )}

              <h3 className="text-sm font-bold uppercase tracking-widest text-teal">{plan.name}</h3>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="font-serif text-5xl font-bold text-plum">{plan.price}</span>
                {plan.period && (
                  <span className="text-sm font-medium text-stone-500">/ {plan.period}</span>
                )}
              </div>
              <p className="mt-3 text-sm text-stone-600">{plan.blurb}</p>

              <ul className="mt-7 space-y-3 border-t border-plum/10 pt-7">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm text-stone-700">
                    <CheckIcon />
                    {feature}
                  </li>
                ))}
              </ul>

              <a
                href="#signup"
                className={`mt-auto inline-block rounded-xl px-6 py-3.5 text-center text-sm font-semibold transition ${
                  plan.featured
                    ? 'bg-plum text-white hover:bg-plum-dark'
                    : 'border border-plum/30 bg-white text-plum hover:bg-plum hover:text-white'
                }`}
              >
                {plan.cta}
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Pricing;
