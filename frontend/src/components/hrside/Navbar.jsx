import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNavigation } from '../../context/NavigationContext';
import { useAuth } from '../../context/AuthContext';
import Logo from '../common/Logo';

const links = [
  { label: 'Home', href: '#top' },
  { label: 'Forms', href: '#forms' },
  { label: 'Workspace', href: '#workspace' }
];

function Navbar() {
  const { goToWorkspace, goToLogin } = useNavigation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [rendered, setRendered] = useState(false);
  const [visible, setVisible] = useState(false);
  const [pill, setPill] = useState({ x: 0, w: 0, visible: false });
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
    navigate('/');
  };

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

  useLayoutEffect(() => {
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
              onClick={(e) => {
                if (link.label === 'Workspace') {
                  e.preventDefault();
                  goToWorkspace();
                }
              }}
              className="relative z-10 rounded-full px-4 py-2 text-sm font-medium text-stone-700 transition-colors duration-200 hover:text-plum"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-2 pr-1 lg:flex">
          {user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                className="flex cursor-pointer items-center gap-2 rounded-full px-3 py-2 transition-colors duration-200 hover:bg-[#DAD7CD]"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-plum text-sm font-bold uppercase text-white">
                  {user.name? user.name[0] : 'U'}
                </span>
                <span className="max-w-[15rem] truncate text-sm font-semibold text-plum">
                  {user.name? user.name : user.email}
                </span>
              </button>

              {menuOpen && (
                <div
                  ref={menuRef}
                  className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-2xl border border-plum/10 bg-white py-1 shadow-lg shadow-plum/10"
                >
                  <div className="border-b border-stone-100 px-4 py-3">
                    <p className="truncate text-sm font-semibold text-plum">
                      {user.name || 'HiORing user'}
                    </p>
                    <p className="truncate text-xs text-stone-500">{user.email || user.name}</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-sm font-semibold text-stone-700 transition hover:bg-red-50 hover:text-red-600"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <path d="m16 17 5-5-5-5" />
                      <path d="M21 12H9" />
                    </svg>
                    Log out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={goToLogin}
              className="rounded-full bg-plum px-4 py-2 text-sm font-semibold text-white transition hover:bg-plum-dark"
            >
              Sign in
            </button>
          )}
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
                onClick={(e) => {
                  if (link.label === 'Workspace') {
                    e.preventDefault();
                    setOpen(false);
                    goToWorkspace();
                  } else {
                    setOpen(false);
                  }
                }}
                className="border-b border-stone-100 py-3 text-sm font-medium text-stone-700"
              >
                {link.label}
              </a>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-2 rounded-full px-3 py-2">
            {user ? (
              <>
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-plum text-sm font-bold uppercase text-white">
                  {user.name?.[0] || user.email?.[0] || 'U'}
                </span>
                <span className="max-w-[15rem] truncate text-sm font-semibold text-plum">
                  {user.name || user.email}
                </span>
              </>
            ) : (
              <button
                type="button"
                onClick={goToLogin}
                className="ml-auto rounded-full bg-plum px-4 py-2 text-sm font-semibold text-white transition hover:bg-plum-dark"
              >
                Sign in
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Navbar;
