const quickLinks = [
  { label: 'Create form', href: '#create-form' },
  { label: 'Applications', href: '#applications' },
  { label: 'Interview', href: '#interview' },
  { label: 'Support', href: '#support' },
];

const socials = [
  {
    label: 'Instagram',
    path: 'M7.8 2h8.4A5.8 5.8 0 0 1 22 7.8v8.4A5.8 5.8 0 0 1 16.2 22H7.8A5.8 5.8 0 0 1 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2zm-.2 2A3.6 3.6 0 0 0 4 7.6v8.8A3.6 3.6 0 0 0 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6A3.6 3.6 0 0 0 16.4 4H7.6zm9.65 1.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
  },
  {
    label: 'Facebook',
    path: 'M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.09 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.7 4.53-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.95.93-1.95 1.89v2.26h3.32l-.53 3.49h-2.79V24C19.61 23.09 24 18.1 24 12.07z',
  },
];

function Footer() {
  return (
    <footer id="contact" className="bg-plum-dark text-white">
      <div className="mx-auto max-w-site grid gap-12 px-6 py-16 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:px-8">
        <div>
          <a href="#top" className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold font-sans text-2xl font-bold text-plum">
              H
            </span>
            <span className="font-sans text-2xl font-bold">HiORing</span>
          </a>
          <p className="mt-5 max-w-xs text-justify text-sm leading-relaxed text-white/70">
            From job link to interview, in one thread &mdash; HiORing keeps your hiring pipeline
            moving while your team talks to people, not spreadsheets.
          </p>
          <div className="mt-6 flex gap-3">
            {socials.map((social) => (
              <a
                key={social.label}
                href="#top"
                aria-label={social.label}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition hover:bg-gold hover:text-plum"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                  <path d={social.path} />
                </svg>
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-bold uppercase tracking-widest text-gold">HR Hub</h4>
          <ul className="mt-5 space-y-3">
            {quickLinks.map((link) => (
              <li key={link.label}>
                <a href={link.href} className="text-sm text-white/80 transition hover:text-white">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-bold uppercase tracking-widest text-gold">Contact Us</h4>
          <ul className="mt-5 space-y-4 text-sm text-white/80">
            <li className="flex items-start gap-3">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 h-4 w-4 shrink-0 " aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h2l2 5-2 1a11 11 0 005 5l1-2 5 2v2a2 2 0 01-2 2A16 16 0 013 5z" />
              </svg>
              <span>017 805 111&nbsp;/&nbsp;012 74 49 34</span>
            </li>
            <li className="flex items-start gap-3">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 h-4 w-4 shrink-0 " aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l9 6 9-6M4 6h16a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V7a1 1 0 011-1z" />
              </svg>
              <a href="mailto:hello@hioring.site" className="transition hover:text-white">
                hello@hioring.site
              </a>
            </li>
            <li className="flex items-start gap-3">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 h-4 w-4 shrink-0 " aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s-7-5.1-7-11a7 7 0 1114 0c0 5.9-7 11-7 11z" />
                <circle cx="12" cy="10" r="2.5" />
              </svg>
              <span>St. 271, Phnom Penh, Cambodia</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-site flex-col items-center justify-between gap-3 px-6 py-6 text-xs text-white/60 sm:flex-row lg:px-8">
          <p>&copy; 2026 HiORing. All rights reserved.</p>
          <p>Crafted for HR teams that hate busywork.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
