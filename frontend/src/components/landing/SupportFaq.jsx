const faqs = [
  {
    question: 'What happens if an email fails to send?',
    answer:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit id venenatis pretium risus euismod dictum egestas orci netus feugiat ut egestas ut sagittis tincidunt phasellus.',
  },
  {
    question: 'Can I export my data if I cancel?',
    answer:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit id venenatis pretium risus euismod dictum egestas orci netus feugiat ut egestas ut sagittis tincidunt phasellus.',
  },
  {
    question: 'Where can I check system status?',
    answer:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit id venenatis pretium risus euismod dictum egestas orci netus feugiat ut egestas ut sagittis tincidunt phasellus.',
  },
  {
    question: 'Do you offer onboarding support?',
    answer:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit id venenatis pretium risus euismod dictum egestas orci netus feugiat ut egestas ut sagittis tincidunt phasellus.',
  },
];

function SupportFaq() {
  return (
    <section id="support-faq" className="bg-[#F2F0E8] py-20 lg:py-24">
      <div className="mx-auto max-w-site px-6 lg:px-8">
        <div className="text-center">
          <h2 className="font-serif text-4xl font-bold leading-tight tracking-tight text-plum sm:text-5xl">
            Frequently asked questions
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-plum/80">
            Quick answers to the most common support questions.
          </p>
        </div>

        <div className="mt-14 grid gap-8 sm:grid-cols-2">
          {faqs.map((faq) => (
            <article
              key={faq.question}
              className="rounded-[34px] bg-plum p-8 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-plum/20"
            >
              <h3 className="font-serif text-2xl font-bold leading-snug text-white">
                {faq.question}
              </h3>
              <p className="mt-4 text-sm font-light leading-relaxed text-[#FFFEF9]">
                {faq.answer}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default SupportFaq;
