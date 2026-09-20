import { useLayoutEffect, useEffect, useRef, useState } from 'react';
import { useNavigation } from '../../context/NavigationContext';
import { useAuth } from '../../context/AuthContext';
import { listForms } from '../../services/api';
import { getFormStatus, getNextStatusTime } from '../../utils/forms';
import { useNow } from '../../hooks/useNow';

function Hero() {
  const { goToWorkspace } = useNavigation();
  const { user } = useAuth();
  const [authHovered, setAuthHovered] = useState('trial');
  const [authPill, setAuthPill] = useState({ x: 0, w: 0, ready: false });
  const [latestForm, setLatestForm] = useState(null);
  const trialRef = useRef(null);
  const viewRef = useRef(null);
  const now = useNow(getNextStatusTime(latestForm));
  const latestFormLive = getFormStatus(latestForm, now) === 'Live';

  useLayoutEffect(() => {
    moveAuthPill(trialRef);
    const remeasure = () => moveAuthPill(trialRef);
    window.addEventListener('resize', remeasure);
    return () => window.removeEventListener('resize', remeasure);
  }, []);

  useEffect(() => {
    if (!user) return;
    listForms()
      .then((forms) => {
        if (Array.isArray(forms) && forms.length > 0) setLatestForm(forms[0]);
      })
      .catch(() => {});
  }, [user]);

  const moveAuthPill = (ref) => {
    if (!ref.current) return;
    setAuthPill({ x: ref.current.offsetLeft, w: ref.current.offsetWidth, ready: true });
  };

  return (
    <section id="top" className="bg-[#fffef9] pt-32 md:pt-40">
      <div className="mx-auto max-w-site px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="flex flex-col items-start gap-5">
            <span className="inline-flex items-center rounded-full bg-plum px-5 py-2 text-xs font-semibold uppercase tracking-wide text-white">
              Hiring
            </span>
            <h1 className="mt-6 font-sans text-6xl font-bold leading-[1.05] tracking-tight text-plum sm:text-6xl lg:text-7xl">
              Every hiring <span className="text-[#588157]">form</span>,
              <br />
              in one place.
            </h1>
            <p className="mt-7 max-w-xl text-justify text-lg leading-relaxed text-plum/80">
              Start a new form from a template, pick up a recent one, or check the results &mdash;
              screening summaries included, the way you&rsquo;d expect from a form tool.
            </p>

            <div className="mt-9">
              <div
                className="relative inline-flex items-center gap-3"
                onMouseLeave={() => {
                  setAuthHovered('trial');
                  moveAuthPill(trialRef);
                }}
              >
                <span
                  aria-hidden="true"
                  style={{ transform: `translateX(${authPill.x}px)`, width: `${authPill.w}px` }}
                  className={`absolute inset-y-0 rounded-full bg-plum transition-[transform,width,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
                    authPill.ready ? 'opacity-100' : 'opacity-0'
                  }`}
                />
                <a
                  ref={trialRef}
                  href="#forms"
                  onMouseEnter={() => {
                    setAuthHovered('trial');
                    moveAuthPill(trialRef);
                  }}
                  className={`relative z-10 rounded-full px-8 py-4 text-base font-semibold transition-colors duration-200 ${
                    authHovered === 'trial' ? 'text-white' : 'text-plum'
                  }`}
                >
                  Start free trial
                </a>
                <a
                  ref={viewRef}
                  href="#view"
                  onClick={(e) => {
                    e.preventDefault();
                    goToWorkspace();
                  }}
                  onMouseEnter={() => {
                    setAuthHovered('view');
                    moveAuthPill(viewRef);
                  }}
                  className={`relative z-10 inline-flex items-center rounded-full border px-8 py-4 text-base font-semibold transition-colors duration-200 ${
                    authHovered === 'view' ? 'border-transparent' : 'border-black'
                  } ${
                    authHovered === 'trial' ? 'text-plum' : 'text-white'
                  }`}
                >
                  <span
                    className={`transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                      authHovered === 'view' ? '-translate-x-2' : 'translate-x-2'
                    }`}
                  >
                    View Workspace
                  </span>
                  <span
                    aria-hidden="true"
                    className={`ml-1 inline-flex h-4 w-4 shrink-0 items-center justify-center transition-opacity duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                      authHovered === 'view' ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 5l7 7-7 7" />
                    </svg>
                  </span>
                </a>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 rotate-3 rounded-[2rem] bg-plum/10" aria-hidden="true" />
            <div className="relative rounded-[2rem] border border-plum/10 bg-white p-6 shadow-2xl shadow-plum/20 sm:p-8">
              <p className="text-sm font-bold uppercase tracking-widest text-teal">Recent forms</p>
              <h3 className="mt-2 font-sans text-2xl font-bold text-plum">
                {!user
                  ? 'Sign in to see recent forms'
                  : latestForm
                    ? latestForm.title
                    : 'No form yet'}
              </h3>
              <p className="mt-1 text-lg font-semibold text-plum">
                {!user
                  ? 'Your forms and applicants will appear here'
                  : latestForm
                    ? `${latestForm.submissionCount ?? 0} applicants`
                    : 'Create your first form'}
              </p>
              <div className="mt-6 space-y-3">
                {['Blank Form', 'Standard form'].map((name) => (
                  <div key={name} className="flex items-center justify-between rounded-xl border border-plum/10 bg-[#f2f0e8] px-4 py-3">
                    <span className="text-sm font-semibold text-plum">{name}</span>
                    <span className="h-2 w-2 rounded-full bg-teal" aria-hidden="true" />
                  </div>
                ))}
              </div>
              <div className="mt-6 flex items-center justify-between rounded-xl bg-plum px-4 py-3">
                <span className="text-sm font-semibold text-white">
                  {!user
                    ? 'Sign in to view your workspace'
                    : latestForm
                      ? latestFormLive
                        ? 'Now accepting responses'
                        : 'Form closed'
                      : 'New form ready'}
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                    latestFormLive ? 'bg-[#a7eda7]/60 text-[#0d6921]' : 'bg-white/60 text-plum'
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${latestFormLive ? 'bg-[#0d6921]' : 'bg-plum'}`}
                  />
                  {latestForm ? (latestFormLive ? 'Live' : 'Closed') : 'Live'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
