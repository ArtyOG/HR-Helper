function SupportPolicy() {
  return (
    <section id="support-policy" className="bg-[#F2F0E8] py-20 lg:py-24">
      <div className="mx-auto flex max-w-site flex-col items-center px-6 text-center lg:px-8">
        <h2 className="font-serif text-4xl font-bold leading-tight tracking-tight text-plum sm:text-5xl">
          Didn&rsquo;t find what you needed?
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-plum/80">
          Our team is happy to help &mdash; reach out and we&rsquo;ll get back to you fast.
        </p>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
          <a
            href="#support"
            className="w-full rounded-full bg-plum px-8 py-4 text-base font-semibold text-[#F2F0E8] transition hover:bg-plum-dark sm:w-auto"
          >
            Contact to support
          </a>
          <a
            href="#support-faq"
            className="w-full rounded-full border-2 border-plum/30 bg-white px-8 py-4 text-base font-semibold text-plum transition hover:border-plum sm:w-auto"
          >
            Browse all articles
          </a>
        </div>
      </div>
    </section>
  );
}

export default SupportPolicy;
