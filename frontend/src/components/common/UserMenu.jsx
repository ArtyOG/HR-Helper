import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function UserMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    const handleEscape = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  const handleLogout = async () => {
    setOpen(false);
    await logout();
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Open your account profile"
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex h-[43px] w-[43px] cursor-pointer items-center justify-center rounded-full bg-teal text-sm font-bold uppercase text-white shadow-sm transition hover:ring-2 hover:ring-teal/40"
      >
        {user?.name?.[0] || user?.email?.[0] || 'U'}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-2xl border border-plum/10 bg-white shadow-xl shadow-plum/10"
        >
          <div className="border-b border-stone-100 px-5 py-4">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-teal text-base font-bold uppercase text-white">
                {user?.name?.[0] || user?.email?.[0] || 'U'}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-plum">
                  {user?.name || 'HiORing user'}
                </p>
                <p className="mt-0.5 truncate text-xs text-stone-500">
                  {user?.email || 'Signed in with Google'}
                </p>
              </div>
            </div>
          </div>

          <div className="px-5 py-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
              Account
            </p>
            <dl className="mt-2 space-y-2 text-sm">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-stone-500">Role</dt>
                <dd className="font-semibold text-[#344e41]">HR Admin</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-stone-500">Session</dt>
                <dd className="font-semibold text-[#344e41]">
                  {user?.authenticated ? 'Active' : 'Unknown'}
                </dd>
              </div>
            </dl>
          </div>

          <div className="border-t border-stone-100 p-2">
            <button
              type="button"
              onClick={handleLogout}
              role="menuitem"
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-stone-700 transition hover:bg-red-50 hover:text-red-600"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <path d="m16 17 5-5-5-5" />
                <path d="M21 12H9" />
              </svg>
              Log out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserMenu;