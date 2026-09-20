import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useNavigation } from '../../context/NavigationContext';
import ConfirmModal from '../common/ConfirmModal';
import Logo from '../common/Logo';

const DURATION = 450;

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
  { label: 'Candidates Interview', icon: UsersIcon, navigate: 'interview-slots' },
  { label: 'Email Sequences', icon: MailIcon, navigate: 'email-sequences' },
  { label: 'Job List', icon: BriefcaseIcon, navigate: 'job-listings' },
];


const accountNav = [
  { label: 'Billing', icon: CardIcon, navigate: 'billing' },
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
  const {
    goToWorkspace,
    goToHR,
    goToJobListings,
    goToEmailSequencesWs,
    goToInterviewSlotsWs,
    goToBillingWs,
  } = useNavigation();

  const select = (label, item) => {
    setActive(label);
    onNavigate?.(label);
    if (item?.navigate === 'workspace') goToWorkspace();
    if (item?.navigate === 'hr') goToHR();
    if (item?.navigate === 'job-listings') goToJobListings();
    if (item?.navigate === 'email-sequences') goToEmailSequencesWs();
    if (item?.navigate === 'interview-slots') goToInterviewSlotsWs();
    if (item?.navigate === 'billing') goToBillingWs();
  };



  return (
    <div className="flex h-full w-full flex-col bg-[#344e41] py-6">
      <div className="flex items-center justify-center px-6 pb-6">
        <Logo light className="block h-16 w-auto" />
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
    } else if (location.pathname.startsWith('/workspace/email-sequences')) {
      setActive('Email Sequences');
    } else if (location.pathname.startsWith('/workspace/interview-slots')) {
      setActive('Candidates Interview');
    } else if (location.pathname.startsWith('/workspace/billing')) {
      setActive('Billing');
    } else if (location.pathname.startsWith('/workspace/dashboard') || location.pathname === '/workspace') {
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
        <div className="flex items-center justify-center">
          <Logo light className="block h-11 w-auto" />
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