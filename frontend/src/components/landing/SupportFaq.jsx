const faqs = [
  {
    question: 'What happens if an email fails to send?',
    answer:
      'Failed sends are surfaced right in the Email Sequences screen so you can see exactly which candidates were not reached. You can retry those deliveries directly, and your Hiring status is only ever updated for emails that were actually delivered.',
  },
  {
    question: 'Can I export my data if I cancel?',
    answer:
      'Yes. Before cancelling, export each job\u2019s submissions and any CVs you need from the submissions screen. Reach out to support and we will also help you download a full backup of your hiring data, including AI screening summaries, within 7 days of cancellation.',
  },
  {
    question: 'Where can I check system status?',
    answer:
      'The Billing page under your workspace lists your plan, limits and invoices. For live system status and scheduled maintenance updates, contact our support team at hello@hioring.site and we will point you to the latest health report.',
  },
  {
    question: 'Do you offer onboarding support?',
    answer:
      'Every plan includes guided onboarding. Create your first form from a template, connect a job, and send a test invite to a real address to see the pipeline end-to-end. If you get stuck, our team at hello@hioring.site is happy to walk through your setup with you.',
  },
];

function SupportFaq() {
  return (
    <section id="support-faq" className="bg-[#F2F0E8] py-20 lg:py-24">
      <div className="mx-auto max-w-site px-6 lg:px-8">
        <div className="text-center">
          <h2 className="font-sans text-4xl font-bold leading-tight tracking-tight text-plum sm:text-5xl">
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
              <h3 className="font-sans text-2xl font-bold leading-snug text-white">
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
