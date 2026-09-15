function Badge({ children }) {
  return (
    <span className="inline-flex items-center rounded-full bg-plum px-5 py-2 text-xs font-semibold uppercase tracking-wide text-white">
      {children}
    </span>
  );
}

const contactDetails = [
  {
    label: 'Phone number',
    value: '017 805 111 / 012 74 49 34',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5 shrink-0 text-ice" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.6 10.8a15.1 15.1 0 006.6 6.6l2.2-2.2a1 1 0 011.1-.2 11.6 11.6 0 003.7.7 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1 11.6 11.6 0 00.7 3.7 1 1 0 01-.2 1.1l-2.4 2z" />
      </svg>
    ),
  },
  {
    label: 'Email address',
    value: 'hello@hireflow.site',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5 shrink-0 text-ice" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l9 6 9-6M4 6h16a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V7a1 1 0 011-1z" />
      </svg>
    ),
  },
];

const socials = [
  { label: 'Facebook', path: 'M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.09 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.7 4.53-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.95.93-1.95 1.89v2.26h3.32l-.53 3.49h-2.79V24C19.61 23.09 24 18.1 24 12.07z' },
  { label: 'Instagram', path: 'M7.8 2h8.4A5.8 5.8 0 0 1 22 7.8v8.4A5.8 5.8 0 0 1 16.2 22H7.8A5.8 5.8 0 0 1 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2zm-.2 2A3.6 3.6 0 0 0 4 7.6v8.8A3.6 3.6 0 0 0 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6A3.6 3.6 0 0 0 16.4 4H7.6zm9.65 1.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6z' },
  { label: 'Telegram', path: 'M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.63 8.21c.17 4.93-.5 8.42-2.28 10.1-1.9 1.79-3.77 1.44-5.36.86-1.58-.59-3.54-1.17-6.19-4.86a.54.54 0 0 1 .13-.77.54.54 0 0 1 .77.13c2.27 3.28 3.82 3.83 5.25 4.36 1.44.53 2.47.34 3.7-1.09 1.52-1.77 2.17-5.05 2.02-9.9a1.8 1.8 0 0 1 2.97-1.45c.69.19 1.9.9 2.33 1.43.47.59-.29.77-.38 1.15z' },
];

const inputFields = [
  { label: 'Name', placeholder: 'Jennifer Vin', type: 'text' },
  { label: 'Email', placeholder: 'email@example.com', type: 'email' },
  { label: 'Subject', placeholder: 'ex : service', type: 'text' },
  { label: 'Phone Number', placeholder: '097 92 72 956', type: 'tel' },
];

function Support() {
  return (
    <section id="support" className="bg-white py-20 lg:py-24">
      <div className="mx-auto max-w-site px-6 lg:px-8">
        <Badge>SUPPORT</Badge>
        <h2 className="mt-6 font-serif text-4xl font-bold leading-tight tracking-tight text-plum sm:text-5xl">
          Write us a message!
        </h2>

        <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_1.6fr]">
          <div className="flex flex-col justify-between rounded-[59px] bg-plum p-10">
            <div>
              <h3 className="font-serif text-4xl font-bold text-[#F2F0E8]">Contact us</h3>
              <p className="mt-4 text-sm font-light leading-relaxed text-[#F2F0E8]/90">
                Our team is happy to help &mdash; reach out and we&rsquo;ll get back to you fast.
              </p>

              <div className="mt-10 space-y-6">
                {contactDetails.map((detail) => (
                  <div key={detail.label} className="flex items-center gap-4">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/10">
                      {detail.icon}
                    </span>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-[#F2F0E8]/70">
                        {detail.label}
                      </p>
                      <p className="mt-1 text-lg font-medium text-[#F2F0E8]">{detail.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-[#F2F0E8]/70">
                Follow us
              </p>
              <div className="mt-4 flex gap-3">
                {socials.map((social) => (
                  <a
                    key={social.label}
                    href="#support"
                    aria-label={social.label}
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-[#F2F0E8] transition hover:bg-gold hover:text-plum"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                      <path d={social.path} />
                    </svg>
                  </a>
                ))}
              </div>
            </div>
          </div>

          <form
            className="grid gap-6 rounded-[59px] bg-[#F2F0E8] p-10 sm:grid-cols-2"
            onSubmit={(event) => event.preventDefault()}
          >
            {inputFields.map((field) => (
              <label key={field.label} className="flex flex-col gap-2">
                <span className="text-base font-semibold text-plum">{field.label}</span>
                <input
                  type={field.type}
                  placeholder={field.placeholder}
                  className="rounded-2xl border border-transparent bg-white px-5 py-4 text-base text-plum placeholder:text-stone-400 focus:border-plum/40 focus:outline-none"
                />
              </label>
            ))}
            <label className="flex flex-col gap-2 sm:col-span-2">
              <span className="text-base font-semibold text-plum">Message</span>
              <textarea
                rows="5"
                placeholder="Please type your message here ......"
                className="w-full resize-none rounded-2xl border border-transparent bg-white px-5 py-4 text-base text-plum placeholder:text-stone-400 focus:border-plum/40 focus:outline-none"
              />
            </label>
            <button
              type="submit"
              className="rounded-2xl bg-plum px-8 py-4 text-base font-semibold text-white transition hover:bg-plum-dark sm:col-span-2"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

export default Support;
