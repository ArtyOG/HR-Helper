import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useNavigation } from '../../context/NavigationContext';
import ConfirmModal from '../common/ConfirmModal';

const DURATION = 450;

function Logo() {
  return (
    <div className="flex items-center gap-3">
      <span className="relative flex h-[68px] w-[68px] shrink-0 items-center justify-center rounded-2xl bg-[#344e41] ring-1 ring-white/10">
        <span className="font-serif text-[38px] font-bold leading-none text-gold">H</span>
        <span className="absolute bottom-2 left-2 flex items-end gap-1">
          <span className="h-1 w-3 rounded-full bg-teal" />
          <span className="h-1.5 w-4 rounded-full bg-gold" />
          <span className="h-1 w-2 rounded-full bg-white/25" />
        </span>
      </span>
      <span className="font-sans text-[26px] font-bold leading-none text-white">HiORing</span>
    </div>
  );
}

function DashboardIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 shrink-0" aria-hidden="true">
      <path d="M14,10V22H4a2,2,0,0,1-2-2V10Z" />
      <path d="M22,10V20a2,2,0,0,1-2,2H16V10Z" />
      <path d="M22,4V8H2V4A2,2,0,0,1,4,2H20A2,2,0,0,1,22,4Z" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5 shrink-0"
      aria-hidden="true"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5 shrink-0"
      aria-hidden="true"
    >
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function BriefcaseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5 shrink-0"
      aria-hidden="true"
    >
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5 shrink-0"
      aria-hidden="true"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function CardIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5 shrink-0"
      aria-hidden="true"
    >
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 shrink-0" aria-hidden="true">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M14.2788 2.15224C13.9085 2 13.439 2 12.5 2C11.561 2 11.0915 2 10.7212 2.15224C10.2274 2.35523 9.83509 2.74458 9.63056 3.23463C9.53719 3.45834 9.50065 3.7185 9.48635 4.09799C9.46534 4.65568 9.17716 5.17189 8.69017 5.45093C8.20318 5.72996 7.60864 5.71954 7.11149 5.45876C6.77318 5.2813 6.52789 5.18262 6.28599 5.15102C5.75609 5.08178 5.22018 5.22429 4.79616 5.5472C4.47814 5.78938 4.24339 6.1929 3.7739 6.99993C3.30441 7.80697 3.06967 8.21048 3.01735 8.60491C2.94758 9.1308 3.09118 9.66266 3.41655 10.0835C3.56506 10.2756 3.77377 10.437 4.0977 10.639C4.57391 10.936 4.88032 11.4419 4.88029 12C4.88026 12.5581 4.57386 13.0639 4.0977 13.3608C3.77372 13.5629 3.56497 13.7244 3.41645 13.9165C3.09108 14.3373 2.94749 14.8691 3.01725 15.395C3.06957 15.7894 3.30432 16.193 3.7738 17C4.24329 17.807 4.47804 18.2106 4.79606 18.4527C5.22008 18.7756 5.75599 18.9181 6.28589 18.8489C6.52778 18.8173 6.77305 18.7186 7.11133 18.5412C7.60852 18.2804 8.2031 18.27 8.69012 18.549C9.17714 18.8281 9.46533 19.3443 9.48635 19.9021C9.50065 20.2815 9.53719 20.5417 9.63056 20.7654C9.83509 21.2554 10.2274 21.6448 10.7212 21.8478C11.0915 22 11.561 22 12.5 22C13.439 22 13.9085 22 14.2788 21.8478C14.7726 21.6448 15.1649 21.2554 15.3694 20.7654C15.4628 20.5417 15.4994 20.2815 15.5137 19.902C15.5347 19.3443 15.8228 18.8281 16.3098 18.549C16.7968 18.2699 17.3914 18.2804 17.8886 18.5412C18.2269 18.7186 18.4721 18.8172 18.714 18.8488C19.2439 18.9181 19.7798 18.7756 20.2038 18.4527C20.5219 18.2105 20.7566 17.807 21.2261 16.9999C21.6956 16.1929 21.9303 15.7894 21.9827 15.395C22.0524 14.8691 21.9088 14.3372 21.5835 13.9164C21.4349 13.7243 21.2262 13.5628 20.9022 13.3608C20.4261 13.0639 20.1197 12.558 20.1197 11.9999C20.1197 11.4418 20.4261 10.9361 20.9022 10.6392C21.2263 10.4371 21.435 10.2757 21.5836 10.0835C21.9089 9.66273 22.0525 9.13087 21.9828 8.60497C21.9304 8.21055 21.6957 7.80703 21.2262 7C20.7567 6.19297 20.522 5.78945 20.2039 5.54727C19.7799 5.22436 19.244 5.08185 18.7141 5.15109C18.4722 5.18269 18.2269 5.28136 17.8887 5.4588C17.3915 5.71959 16.7969 5.73002 16.3099 5.45096C15.8229 5.17191 15.5347 4.65566 15.5136 4.09794C15.4993 3.71848 15.4628 3.45833 15.3694 3.23463C15.1649 2.74458 14.7726 2.35523 14.2788 2.15224ZM12.5 15C14.1695 15 15.5228 13.6569 15.5228 12C15.5228 10.3431 14.1695 9 12.5 9C10.8305 9 9.47716 10.3431 9.47716 12C9.47716 13.6569 10.8305 15 12.5 15Z"
      />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 shrink-0" aria-hidden="true">
      <path d="M17.2929 14.2929C16.9024 14.6834 16.9024 15.3166 17.2929 15.7071C17.6834 16.0976 18.3166 16.0976 18.7071 15.7071L21.6201 12.7941C21.6351 12.7791 21.6497 12.7637 21.6637 12.748C21.87 12.5648 22 12.2976 22 12C22 11.7024 21.87 11.4352 21.6637 11.252C21.6497 11.2363 21.6351 11.2209 21.6201 11.2059L18.7071 8.29289C18.3166 7.90237 17.6834 7.90237 17.2929 8.29289C16.9024 8.68342 16.9024 9.31658 17.2929 9.70711L18.5858 11H13C12.4477 11 12 11.4477 12 12C12 12.5523 12.4477 13 13 13H18.5858L17.2929 14.2929Z" />
      <path d="M5 2C3.34315 2 2 3.34315 2 5V19C2 20.6569 3.34315 22 5 22H14.5C15.8807 22 17 20.8807 17 19.5V16.7326C16.8519 16.647 16.7125 16.5409 16.5858 16.4142C15.9314 15.7598 15.8253 14.7649 16.2674 14H13C11.8954 14 11 13.1046 11 12C11 10.8954 11.8954 10 13 10H16.2674C15.8253 9.23514 15.9314 8.24015 16.5858 7.58579C16.7125 7.4591 16.8519 7.35296 17 7.26738V4.5C17 3.11929 15.8807 2 14.5 2H5Z" />
    </svg>
  );
}

const mainNav = [
  { label: 'Dashboards', icon: DashboardIcon, navigate: 'workspace' },
  { label: 'Email Sequences', icon: MailIcon, soon: true },
  { label: 'Job List', icon: BriefcaseIcon, navigate: 'job-listings' },
];


const accountNav = [
  { label: 'Profile', icon: UserIcon, soon: true },
  { label: 'Billing', icon: CardIcon, soon: true },
  { label: 'Integration', icon: SettingsIcon, soon: true },
];

const otherNav = [{ label: 'Exit', icon: LogoutIcon }];

function GroupLabel({ children }) {
  return (
    <p className="mb-2 px-2 pt-2 text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">
      {children}
    </p>
  );
}

function NavItem({ label, icon: Icon, active, soon, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex w-full items-center gap-4 rounded-full p-4 font-semibold transition-all ease-linear ${
        active
          ? 'bg-[#588157] text-white shadow-md'
          : 'bg-cover text-gray-700 hover:bg-[#DAD7CD] hover:shadow-inner'
      }`}
    >
      <span
        className={`shrink-0 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          active
            ? 'ml-0 opacity-100'
            : '-ml-6 opacity-0 group-hover:ml-0 group-hover:opacity-100'
        }`}
      >
        <Icon />
      </span>
      <span className="truncate whitespace-nowrap text-left">{label}</span>
      {soon && (
        <span
          className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
            active ? 'bg-white/20 text-white' : 'bg-stone-200 text-stone-500'
          }`}
        >
          Soon
        </span>
      )}
    </button>
  );
}

function SidebarContent({ active, setActive, onNavigate, onRequestLeave }) {
  const { goToWorkspace, goToHR, goToJobListings } = useNavigation();

  const select = (label, item) => {
    setActive(label);
    onNavigate?.(label);
    if (item?.navigate === 'workspace') goToWorkspace();
    if (item?.navigate === 'hr') goToHR();
    if (item?.navigate === 'job-listings') goToJobListings();
  };



  return (
    <div className="flex h-full w-full flex-col bg-[#344e41] py-6">
      <div className="px-6 pb-6">
        <Logo />
      </div>

      <nav className="flex-1 overflow-y-auto px-4">
        <div className="w-full rounded-md bg-[#fffef9] p-5 shadow-md shadow-purple-200/50">
          <GroupLabel><span className="text-[#588157]">WORKSPACE</span></GroupLabel>
          <ul className="flex w-full flex-col gap-2">
            {mainNav.map((item) => (
              <li key={item.label} className="w-full whitespace-nowrap">
                <NavItem
                  label={item.label}
                  icon={item.icon}
                  active={active === item.label}
                  soon={item.soon}
                  onClick={() => select(item.label, item)}
                />
              </li>
            ))}
          </ul>

          <GroupLabel><span className="text-[#588157]">ACCOUNT</span></GroupLabel>
          <ul className="mt-1 flex w-full flex-col gap-2">
            {accountNav.map((item) => (
              <li key={item.label} className="w-full whitespace-nowrap">
                <NavItem
                  label={item.label}
                  icon={item.icon}
                  active={active === item.label}
                  soon={item.soon}
                  onClick={() => select(item.label, item)}
                />
              </li>
            ))}
          </ul>

          <GroupLabel><span className="text-[#588157]">OTHER</span></GroupLabel>
          <ul className="mt-1 flex w-full flex-col gap-2">
            {otherNav.map((item) => (
              <li key={item.label} className="w-full whitespace-nowrap">
                <NavItem
                  label={item.label}
                  icon={item.icon}
                  active={false}
                  onClick={() => {
                    onNavigate?.();
                    onRequestLeave?.();
                  }}
                />
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </div>
  );
}

function Navbar() {
  const [open, setOpen] = useState(false);
  const [rendered, setRendered] = useState(false);
  const [visible, setVisible] = useState(false);
  const [active, setActive] = useState('Dashboards');
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const location = useLocation();
  const { goToHR } = useNavigation();

  useEffect(() => {
    if (location.pathname.startsWith('/workspace/jobs') || location.pathname.includes('/forms')) {
      setActive('Job List');
    } else if (location.pathname.startsWith('/workspace')) {
      setActive('Dashboards');
    }
  }, [location.pathname]);



  const requestLeave = () => {
    setOpen(false);
    setShowLeaveConfirm(true);
  };

  const confirmLeave = () => {
    setShowLeaveConfirm(false);
    goToHR();
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
    const timeout = setTimeout(() => setRendered(false), DURATION);
    return () => clearTimeout(timeout);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleScroll = () => setOpen(false);
    const handleTouch = () => setOpen(false);
    window.addEventListener('scroll', handleScroll, { passive: true, capture: true });
    document.addEventListener('scroll', handleScroll, { passive: true, capture: true });
    window.addEventListener('touchmove', handleTouch, { passive: true, capture: true });
    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      document.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('touchmove', handleTouch, true);
    };
  }, [open]);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between bg-[#344e41] px-4 lg:hidden">
        <div className="scale-90 origin-left">
          <Logo />
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open navigation menu"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-[#DFFFFD]"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-5 w-5">
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>
      </header>

      {rendered && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-500 ease-out ${
              visible ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={() => setOpen(false)}
          />
          <aside
            aria-hidden={!visible}
            className={`absolute inset-y-0 left-0 w-[297px] max-w-[85vw] shadow-2xl transition-transform duration-450 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              visible ? 'translate-x-0 scale-x-100' : '-translate-x-full scale-x-[0.97]'
            }`}
          >
            <SidebarContent
              active={active}
              setActive={setActive}
              onNavigate={() => setOpen(false)}
              onRequestLeave={requestLeave}
            />
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close navigation menu"
              className="absolute right-3 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-[#DFFFFD]"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-5 w-5">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </aside>
        </div>
      )}

      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[297px] lg:block">
        <SidebarContent active={active} setActive={setActive} onRequestLeave={requestLeave} />
      </aside>

      <ConfirmModal
        open={showLeaveConfirm}
        onClose={() => setShowLeaveConfirm(false)}
        onConfirm={confirmLeave}
        title="Leave workspace"
        message="Do you want to leave your workspace?"
        confirmLabel="Yes, leave"
      />
    </>
  );
}

export default Navbar;