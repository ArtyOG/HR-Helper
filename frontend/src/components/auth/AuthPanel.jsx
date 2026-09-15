function Logo() {
  return (
    <a href="#top" className="flex items-center gap-3">
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold font-sans text-2xl font-bold text-plum shadow-sm">
        H
      </span>
      <span className="flex flex-col">
        <span className="font-sans text-2xl font-bold leading-none text-[#f2f0e8]">HiOring</span>
        <span className="mt-1 h-[3px] w-10 rounded-full bg-teal" />
      </span>
    </a>
  );
}

const bullets = [
  'Unlimited candidates on every plan',
  'AI resume screening & ranking included',
  'Automated status updates',
];

function AuthPanel() {
  return (
    <div className="hidden flex-col bg-plum px-10 py-8 text-[#f2f0e8] lg:flex lg:w-[44%]">
      <Logo />
      <div className="flex flex-1 flex-col justify-center">
        <p className="font-sans text-2xl font-semibold leading-snug md:text-[26px]">
          Set up your hiring workflow in minutes.
        </p>
        <p className="mt-4 max-w-md text-[15px] leading-relaxed text-[#f2f0e8]/80">
          Create your account and generate your first job link today &mdash; free while you are
          getting started.
        </p>
        <ul className="mt-8 space-y-3">
          {bullets.map((b) => (
            <li key={b} className="flex items-center gap-3 text-[15px]">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#cb9a1c]" />
              {b}
            </li>
          ))}
        </ul>
      </div>
      <div className="border-t border-[#f2f0e8]/20 pt-6">
        <p className="font-sans text-xl font-bold">Stop sorting. Start deciding.</p>
        <p className="mt-2 text-sm text-[#f2f0e8]/70">
          While resumes come in &nbsp;&middot;&nbsp; Once you&rsquo;ve shortlisted
        </p>
        <p className="mt-4 text-sm font-semibold">Start free trial &rarr;</p>
      </div>
    </div>
  );
}

export default AuthPanel;
