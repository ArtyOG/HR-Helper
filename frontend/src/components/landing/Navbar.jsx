import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useNavigation } from '../../context/NavigationContext';
import Logo from '../common/Logo';

const links = [
  { label: 'Home', href: '#top' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Features', href: '#features' },
  { label: 'Support', href: '#support' },
];

function Navbar() {
  const { goToLogin, goToSignup } = useNavigation();
  const [open, setOpen] = useState(false);
  const [rendered, setRendered] = useState(false);
  const [visible, setVisible] = useState(false);
  const [pill, setPill] = useState({ x: 0, w: 0, visible: false });
  const [authHovered, setAuthHovered] = useState(null);
  const [authPill, setAuthPill] = useState({ x: 0, w: 0, ready: false });
  const loginRef = useRef(null);
  const signupRef = useRef(null);

  useEffect(() => {
    if (open) {
      setRendered(true);
      const id = requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true));
      });
      return () => cancelAnimationFrame(id);
    }
    setVisible(false);
    const timeout = setTimeout(() => setRendered(false), 300);
    return () => clearTimeout(timeout);
  }, [open]);

  const moveAuthPill = (ref) => {
    if (!ref.current) return;
    setAuthPill({ x: ref.current.offsetLeft, w: ref.current.offsetWidth, ready: true });
  };

  useLayoutEffect(() => {
    moveAuthPill(signupRef);
    const remeasure = () => moveAuthPill(signupRef);
    window.addEventListener('resize', remeasure);
    return () => window.removeEventListener('resize', remeasure);
  }, []);

  useEffect(() => {
    const hidePill = () => setPill((p) => ({ ...p, x: 0, w: 0, visible: false }));
    const handleScroll = () => setOpen(false);
    window.addEventListener('resize', hidePill);
    window.addEventListener('scroll', handleScroll, { passive: true, capture: true });
    document.addEventListener('scroll', handleScroll, { passive: true, capture: true });
    return () => {
      window.removeEventListener('resize', hidePill);
      window.removeEventListener('scroll', handleScroll, true);
      document.removeEventListener('scroll', handleScroll, true);
    };
  }, []);

  const handleLinkEnter = (event) => {
    setPill({
      x: event.currentTarget.offsetLeft,
      w: event.currentTarget.offsetWidth,
      visible: true,
    });
  };

  return (
    <div className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4">
      <header className="flex w-full max-w-site items-center justify-between rounded-full border border-plum/10 bg-white/80 px-2 py-2 shadow-lg shadow-plum/5 backdrop-blur-md">
        <div className="pl-3">
          <Logo />
        </div>

        <div
          className="relative hidden items-center lg:flex"
          onMouseLeave={() => setPill((p) => ({ ...p, visible: false }))}
        >
          <span
            aria-hidden="true"
            style={{ transform: `translateX(${pill.x}px)`, width: `${pill.w}px` }}
            className={`absolute inset-y-0 rounded-full bg-[#DAD7CD] transition-[transform,width,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
              pill.visible ? 'opacity-100' : 'opacity-0'
            }`}
          />
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onMouseEnter={handleLinkEnter}
              className="relative z-10 rounded-full px-4 py-2 text-sm font-medium text-stone-700 transition-colors duration-200 hover:text-plum"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-2 lg:flex">
          <div
            className="relative flex items-center gap-1"
            onMouseLeave={() => {
              setAuthHovered(null);
              moveAuthPill(signupRef);
            }}
          >
            <span
              aria-hidden="true"
              style={{ transform: `translateX(${authPill.x}px)`, width: `${authPill.w}px` }}
              className={`absolute inset-y-0 rounded-full bg-plum transition-[transform,width,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
                authPill.ready ? 'opacity-100' : 'opacity-0'
              }`}
            />
            <button
              ref={loginRef}
              type="button"
              onClick={goToLogin}
              onMouseEnter={() => {
                setAuthHovered('login');
                moveAuthPill(loginRef);
              }}
              className={`relative z-10 rounded-full px-5 py-2 text-sm font-semibold transition-colors duration-200 ${
                authHovered === 'login' ? 'text-white' : 'text-plum'
              }`}
            >
              Login
            </button>
            <button
              ref={signupRef}
              type="button"
              onClick={goToSignup}
              onMouseEnter={() => {
                setAuthHovered('signup');
                moveAuthPill(signupRef);
              }}
              className={`relative z-10 rounded-full px-5 py-2 text-sm font-semibold transition-colors duration-200 ${
                authHovered === 'login' ? 'text-plum' : 'text-white'
              }`}
            >
              Sign Up
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-plum text-white lg:hidden"
          aria-label="Toggle navigation menu"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
            {open ? (
              <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
            ) : (
              <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
      </header>

      {rendered && (
        <div
          className={`absolute left-4 right-4 top-full z-40 mt-3 overflow-hidden rounded-3xl border border-plum/10 bg-white/95 px-6 pb-6 pt-4 shadow-xl backdrop-blur-md transition-all duration-500 ease-out lg:hidden ${
            visible ? 'translate-y-0 opacity-100' : '-translate-y-8 opacity-0'
          }`}
        >
          <div className="flex flex-col">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setOpen(false)}
                className="border-b border-stone-100 py-3 text-sm font-medium text-stone-700"
              >
                {link.label}
              </a>
            ))}
          </div>
          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                goToLogin();
              }}
              className="flex-1 rounded-full border border-plum/30 px-4 py-2.5 text-center text-sm font-semibold text-plum"
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                goToSignup();
              }}
              className="flex-1 rounded-full bg-plum px-4 py-2.5 text-center text-sm font-semibold text-white"
            >
              Sign Up
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Navbar;
