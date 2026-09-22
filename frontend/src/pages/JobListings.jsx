import { useEffect, useRef, useState } from 'react';
import { useNavigation } from '../context/NavigationContext';
import { formatDateTime, getFormStatus, getNextFormsStatusTime } from '../utils/forms';
import { useNow } from '../hooks/useNow';
import { useFormActions } from '../hooks/useFormActions';
import { useForms } from '../hooks/useWorkspaceData';
import { DeleteFormModal, CloseFormModal, OpenFormModal } from '../components/forms/FormModals';
import SearchBar from '../components/common/SearchBar';
import UserMenu from '../components/common/UserMenu';

function StatusPill({ status }) {
  const styles = {
    Live: 'bg-teal/10 text-teal',
    Closed: 'bg-stone-100 text-stone-500',
    Scheduled: 'bg-gold/20 text-plum',
  };
  return (
    <span className={`inline-flex h-8 items-center rounded-lg px-2.5 text-[11px] font-semibold leading-none ${styles[status] ?? styles.Closed}`}>
      {status}
    </span>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="h-4 w-4">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-plum/10">
      <div className="flex items-center justify-between">
        <div className="h-5 w-16 animate-pulse rounded-full bg-plum/10" />
        <div className="h-4 w-14 animate-pulse rounded-full bg-plum/10" />
      </div>
      <div className="mt-4 h-4 w-2/3 animate-pulse rounded-full bg-plum/10" />
      <div className="mt-2 h-3 w-full animate-pulse rounded-full bg-plum/5" />
      <div className="mt-1 h-3 w-4/5 animate-pulse rounded-full bg-plum/5" />
      <div className="mt-6 flex items-center justify-between">
        <div className="h-3 w-24 animate-pulse rounded-full bg-plum/5" />
        <div className="h-8 w-28 animate-pulse rounded-lg bg-plum/10" />
      </div>
    </div>
  );
}

function ActionIconRow({ items }) {
  const rowRef = useRef(null);
  const btnRefs = useRef([]);
  const [active, setActive] = useState(-1);
  const [pillGeom, setPillGeom] = useState({ left: 0, width: 0 });

  const showFor = (i) => {
    const btn = btnRefs.current[i];
    const row = rowRef.current;
    if (!btn || !row) return;
    const b = btn.getBoundingClientRect();
    const r = row.getBoundingClientRect();
    setPillGeom({ left: b.left - r.left, width: b.width });
    setActive(i);
  };

  const hide = () => setActive(-1);

  return (
    <div
      ref={rowRef}
      onMouseLeave={hide}
      className="relative hidden shrink-0 items-center md:flex"
    >
      <span
        aria-hidden="true"
        style={{ left: pillGeom.left, width: pillGeom.width }}
        className={`pointer-events-none absolute top-0 h-8 rounded-full bg-[#DAD7CD] transition-[left,width,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
          active === -1 ? 'opacity-0' : 'opacity-100'
        }`}
      />

      {items.map((item, i) => (
        <button
          key={item.label}
          ref={(el) => {
            btnRefs.current[i] = el;
          }}
          type="button"
          aria-label={item.label}
          onMouseEnter={() => showFor(i)}
          onFocus={() => showFor(i)}
          onBlur={hide}
          onClick={(e) => {
            e.stopPropagation();
            item.onClick();
          }}
          className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full transition-colors duration-200 ${
            item.danger
              ? 'text-red-500/80 hover:text-red-600'
              : 'text-plum/70 hover:text-plum'
          }`}
        >
          {item.icon}
          {active === i && (
            <span
              role="tooltip"
              className="pointer-events-none absolute -top-9 left-1/2 z-30 -translate-x-1/2"
            >
              <span className="relative block whitespace-nowrap rounded-full bg-[#344e41] px-2.5 py-1 text-[10px] font-semibold text-white shadow-lg animate-[tooltip-pop_0.18s_ease-out]">
                {item.label}
                <span className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 rounded-[1px] bg-[#344e41]" />
              </span>
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

function IconLink() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

function IconPencil() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

function IconCopy() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function IconClose() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path strokeLinecap="round" d="M9 9l6 6M15 9l-6 6" />
    </svg>
  );
}

function IconCalendar() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}

function IconTrash() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden="true">
      <path strokeLinecap="round" d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
    </svg>
  );
}

function JobCard({ job, onApplicants, onEdit, onDelete, onDuplicate, onCopyLink, onCloseNow, onOpen, onSubmissions, onPreview, onInterviews }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const popupRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const close = () => setMenuOpen(false);
    const opts = { passive: true, capture: true };
    window.addEventListener('scroll', close, opts);
    document.addEventListener('scroll', close, opts);
    window.addEventListener('touchmove', close, opts);
    const handlePointerDown = (event) => {
      if (!popupRef.current?.contains(event.target)) setMenuOpen(false);
    };
    document.addEventListener('pointerdown', handlePointerDown, true);
    return () => {
      window.removeEventListener('scroll', close, opts);
      document.removeEventListener('scroll', close, opts);
      window.removeEventListener('touchmove', close, opts);
      document.removeEventListener('pointerdown', handlePointerDown, true);
    };
  }, [menuOpen]);

  const toggleMenu = (e) => {
    e.stopPropagation();
    if (menuOpen) e.currentTarget.blur();
    setMenuOpen((v) => !v);
  };

  const runItem = (action) => (event) => {
    event.stopPropagation();
    event.currentTarget.blur();
    action();
    setMenuOpen(false);
  };
  return (
    <article
      role="button"
      tabIndex={0}
      aria-label="Copy application link"
      onClick={onCopyLink}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onCopyLink();
        }
      }}
      className="group relative flex cursor-pointer flex-col rounded-2xl border border-plum/10 bg-white p-5 shadow-sm transition hover:shadow-md"
    >
      <div className="flex items-center justify-between gap-2">
        <StatusPill status={job.status} />

        <ActionIconRow
          items={[
            ...(onCopyLink ? [{ label: 'Copy link', onClick: onCopyLink, icon: <IconLink /> }] : []),
            ...(onInterviews ? [{ label: 'Interview slots', onClick: onInterviews, icon: <IconCalendar /> }] : []),
            ...(onApplicants ? [{ label: 'Applicants', onClick: onApplicants, icon: <UsersIcon /> }] : []),
            ...(onEdit ? [{ label: 'Edit form', onClick: onEdit, icon: <IconPencil /> }] : []),
            ...(onDuplicate ? [{ label: 'Duplicate form', onClick: onDuplicate, icon: <IconCopy /> }] : []),
            ...(onCloseNow ? [{ label: 'Close form', onClick: onCloseNow, icon: <IconClose /> }] : []),
            ...(onOpen ? [{ label: 'Set close time', onClick: onOpen, icon: <IconCalendar /> }] : []),
            ...(onDelete ? [{ label: 'Delete form', danger: true, onClick: onDelete, icon: <IconTrash /> }] : []),
          ]}
        />


        <div
          ref={popupRef}
          className={`popup popup--desktop-hidden md:hidden ${menuOpen ? 'open' : ''}`}
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            aria-label="Form actions"
            aria-haspopup="true"
            aria-expanded={menuOpen}
            onClick={toggleMenu}
            className="burger cursor-pointer"
          >
            <span />
            <span />
            <span />
          </button>

          <nav className="popup-window" aria-label="Form actions">
            <legend>Form actions</legend>
            <ul>
              {onCopyLink && (
                <li>
                  <button
                    type="button"
                    onClick={runItem(onCopyLink)}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                    </svg>
                    Copy link
                  </button>
                </li>
              )}
              {onApplicants && (
                <li>
                  <button
                    type="button"
                    onClick={runItem(onApplicants)}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                    Applicants
                  </button>
                </li>
              )}
              {onInterviews && (
                <li>
                  <button
                    type="button"
                    onClick={runItem(onInterviews)}
                  >
                    <IconCalendar />
                    Interview slots
                  </button>
                </li>
              )}
              {(onCloseNow || onOpen) && <hr />}

              {onCloseNow && (
                <li>
                  <button
                    type="button"
                    onClick={runItem(onCloseNow)}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
                      <circle cx="12" cy="12" r="9" />
                      <path strokeLinecap="round" d="M9 9l6 6M15 9l-6 6" />
                    </svg>
                    Close form
                  </button>
                </li>
              )}
              {onOpen && (
                <li>
                  <button
                    type="button"
                    onClick={runItem(onOpen)}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
                      <rect x="3" y="4" width="18" height="18" rx="2" />
                      <path d="M16 2v4M8 2v4M3 10h18" />
                    </svg>
                    Set close time
                  </button>
                </li>
              )}
              {onApplicants && onEdit && <hr />}
              {onEdit && (
                <li>
                  <button
                    type="button"
                    onClick={runItem(onEdit)}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
                      <path d="M12 20h9" />
                      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                    </svg>
                    Edit form
                  </button>
                </li>
              )}
              {onDuplicate && <hr />}
              {onDuplicate && (
                <li>
                  <button
                    type="button"
                    onClick={runItem(onDuplicate)}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
                      <rect x="9" y="9" width="13" height="13" rx="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                    Duplicate form
                  </button>
                </li>
              )}
              {onDelete && <hr />}
              {onDelete && (
                <li>
                  <button
                    type="button"
                    className="popup-danger"
                    onClick={runItem(onDelete)}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden="true">
                      <path strokeLinecap="round" d="M3 6h18M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6" />
                    </svg>
                    Delete form
                  </button>
                </li>
              )}
            </ul>
          </nav>
        </div>
      </div>

      <div className="mt-3 min-w-0">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSubmissions();
          }}
          className="block w-full truncate text-left text-base font-bold text-[#344e41] transition hover:text-plum"
          title={`View applicants for ${job.title}`}
        >
          {job.title}
        </button>
        <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-stone-500">{job.meta}</p>
      </div>

      <div className="mt-auto flex items-center justify-between gap-3 pt-6">
        <div className="flex min-w-0 items-center gap-1.5 text-xs">
          <span className="flex shrink-0 items-center gap-1.5 font-semibold text-stone-500">
            <UsersIcon />
            {job.applicants}
          </span>
          <span aria-hidden="true" className="text-stone-300">•</span>
          <span className="truncate text-stone-400">
            {job.closeAt ? `Closes ${formatDateTime(job.closeAt)}` : 'No close time'}
          </span>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onPreview();
          }}
          className="flex shrink-0 items-center gap-2 rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-[#282828] transition hover:bg-stone-50"
        >
          <EyeIcon />
          Preview Form
        </button>
      </div>
    </article>
  );
}

function JobListingsPage() {
  const {
    goToSubmissionsWs,
    goToFormViewWs,
    goToEditFormWs,
    goToCreateFormWs,
    goToInterviewsWs,
  } = useNavigation();
  const { forms, loading, setForms } = useForms();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState(null);
  const now = useNow(getNextFormsStatusTime(forms));

  const {
    deleteTarget,
    deleteError,
    deleting,
    confirmDelete,
    cancelDelete,
    copiedLink,
    copyLink,
    dupNotice,
    duplicating,
    handleDuplicate,
    closeTarget,
    openTarget,
    scheduleBusy,
    scheduleError,
    applySchedule,
    closeFormNow,
    cancelSchedule,
    setDeleteTarget,
    setCloseTarget,
    setOpenTarget,
  } = useFormActions({
    onDeleted: (id) => setForms((prev) => prev.filter((f) => f.id !== id)),
    onDuplicated: (dup) => setForms((prev) => [dup, ...prev]),
    onScheduled: (formId, updated) =>
      setForms((prev) =>
        prev.map((f) =>
          f.id === formId
            ? { ...f, ...updated, submissionCount: f.submissionCount ?? updated.submissionCount }
            : f
        )
      ),
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const jobs = (Array.isArray(forms) ? forms : [])
    .map((form) => ({
      form,
      id: form.id,
      title: form.title,
      meta:
        (form.description && form.description.slice(0, 90)) ||
        (form.requirements && form.requirements.slice(0, 90)) ||
        'No description',
      status: getFormStatus(form, now),
      applicants: form.submissionCount ?? 0,
      closeAt: form.closeAt,
      live: getFormStatus(form, now) === 'Live',
    }))
    .sort((a, b) => Number(b.live) - Number(a.live));

  const q = searchQuery.trim().toLowerCase();
  const filteredJobs = q
    ? jobs.filter(
        (job) => job.title.toLowerCase().includes(q) || job.meta.toLowerCase().includes(q)
      )
    : jobs;

  const activeJobs = filteredJobs.filter(
    (job) => job.status === 'Live' || job.status === 'Scheduled'
  );
  const closedJobs = filteredJobs.filter((job) => job.status === 'Closed');

  const showActive = statusFilter === null || statusFilter === 'active';
  const showClosed = statusFilter === null || statusFilter === 'closed';
  const toggleFilter = (key) => setStatusFilter((prev) => (prev === key ? null : key));
  const visibleHasJobs = (showActive && activeJobs.length > 0) || (showClosed && closedJobs.length > 0);

  const jobProps = (job) => ({
    key: job.id,
    job,
    onApplicants: () => goToSubmissionsWs(job.id),
    onEdit: () => goToEditFormWs(job.id),
    onDelete: () => setDeleteTarget(job.form),
    onDuplicate: () => handleDuplicate(job.form),
    onCopyLink: () => copyLink(job.form),
    onCloseNow:
      job.status === 'Live' || job.status === 'Scheduled'
        ? () => setCloseTarget(job.form)
        : undefined,
    onOpen: job.status === 'Closed' ? () => setOpenTarget(job.form) : undefined,
    onSubmissions: () => goToSubmissionsWs(job.id),
    onPreview: () => goToFormViewWs(job.id),
    onInterviews: () => goToInterviewsWs(job.id),
  });

  const renderJobsGrid = (list) => (
    <div className="mt-4 max-h-[540px] overflow-y-auto pb-2 pr-4 pl-1 pt-4 [scrollbar-gutter:stable] [scrollbar-width:thin]">
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {list.map((job) => <JobCard {...jobProps(job)} />)}
      </div>
    </div>
  );

  return (
    <div>
      <div className="mx-auto max-w-site">
          <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
            <div>
              <h1 className="font-sans text-[26px] font-bold leading-none tracking-tight text-[#344e41]">
                Job Listings
              </h1>
              <p className="mt-2 text-sm font-medium text-stone-500">
                Manage open roles and generate application links
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <UserMenu />
            </div>
          </div>

          <div className="mt-5 flex justify-end">
            <button
              type="button"
              onClick={() => goToCreateFormWs('blank')}
              className="flex h-[53px] items-center gap-2 rounded-[14px] bg-[#344e41] px-6 text-base font-bold text-[#f2f0e8] shadow-sm transition hover:bg-plum-dark"
            >
              <PlusIcon />
              New Job
            </button>
          </div>

          <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-plum/10">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  aria-pressed={statusFilter === null}
                  onClick={() => setStatusFilter(null)}
                  className={`rounded-full px-3 py-1 text-xs font-bold transition ${
                    statusFilter === null
                      ? 'bg-plum text-white shadow-sm'
                      : 'bg-plum/10 text-plum hover:bg-plum/20'
                  }`}
                >
                  All roles
                </button>
                <button
                  type="button"
                  aria-pressed={statusFilter === 'active'}
                  onClick={() => toggleFilter('active')}
                  className={`rounded-full px-3 py-1 text-xs font-bold transition ${
                    statusFilter === 'active'
                      ? 'bg-teal text-white shadow-sm'
                      : 'bg-teal/10 text-teal hover:bg-teal/20'
                  }`}
                >
                  active
                </button>
                <button
                  type="button"
                  aria-pressed={statusFilter === 'closed'}
                  onClick={() => toggleFilter('closed')}
                  className={`rounded-full px-3 py-1 text-xs font-bold transition ${
                    statusFilter === 'closed'
                      ? 'bg-stone-500 text-white shadow-sm'
                      : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                  }`}
                >
                  closed
                </button>
              </div>

              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search forms"
                fluid
              />
            </div>

            <div className="mt-2">
              {loading ? (
                <div className="mt-4 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
                </div>
              ) : jobs.length > 0 ? (
                filteredJobs.length > 0 && visibleHasJobs ? (
                  <div className="mt-6 space-y-10">
                    {showActive && activeJobs.length > 0 && (
                      <section>
                        <div className="flex items-center gap-3">
                          <h3 className="font-sans text-sm font-bold uppercase tracking-wide text-teal">
                            Active
                          </h3>
                          <span className="rounded-full bg-teal/10 px-3 py-1 text-xs font-bold text-teal">
                            {activeJobs.length} {activeJobs.length === 1 ? 'role' : 'roles'}
                          </span>
                        </div>
                        {renderJobsGrid(activeJobs)}
                      </section>
                    )}

                    {showClosed && closedJobs.length > 0 && (
                      <section>
                        <div className="flex items-center gap-3">
                          <h3 className="font-sans text-sm font-bold uppercase tracking-wide text-stone-500">
                            Closed
                          </h3>
                          <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-bold text-stone-500">
                            {closedJobs.length} {closedJobs.length === 1 ? 'role' : 'roles'}
                          </span>
                        </div>
                        {renderJobsGrid(closedJobs)}
                      </section>
                    )}
                  </div>
                ) : (
                  <div className="py-14 text-center">
                    <p className="text-sm font-semibold text-stone-600">
                      {statusFilter
                        ? `No ${statusFilter === 'active' ? 'active' : 'closed'} roles${
                            q ? ' match your search' : ' right now'
                          }`
                        : `No forms match &ldquo;${searchQuery}&rdquo;`}
                    </p>
                    <p className="mt-1 text-sm text-stone-500">
                      {statusFilter
                        ? 'Clear the filter or try a different search term.'
                        : 'Try a different search term.'}
                    </p>
                  </div>
                )
              ) : (
                <div className="py-14 text-center">
                  <p className="text-sm font-semibold text-stone-600">No job listings yet</p>
                  <p className="mt-1 text-sm text-stone-500">
                    Create your first hiring form to start collecting applications.
                  </p>
                  <button
                    type="button"
                    onClick={() => goToCreateFormWs('blank')}
                    className="mt-5 inline-flex items-center gap-2 rounded-full bg-plum px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-plum-dark"
                  >
                    <PlusIcon />
                    New Job
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      {deleteTarget && (
        <DeleteFormModal
          title={deleteTarget.title}
          error={deleteError}
          deleting={deleting}
          onCancel={cancelDelete}
          onConfirm={confirmDelete}
        />
      )}

      {closeTarget && (
        <CloseFormModal
          title={closeTarget.title}
          error={scheduleError}
          busy={scheduleBusy}
          onCancel={cancelSchedule}
          onConfirm={closeFormNow}
        />
      )}

      {openTarget && (
        <OpenFormModal
          title={openTarget.title}
          error={scheduleError}
          busy={scheduleBusy}
          onCancel={cancelSchedule}
          onConfirm={(closeAtISO) => applySchedule(openTarget, closeAtISO)}
        />
      )}

      {copiedLink && (
        <div className="fixed bottom-6 right-6 z-[120] flex items-center gap-2 rounded-full bg-plum py-3 pl-5 pr-6 text-sm font-semibold text-white shadow-2xl shadow-plum/30">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-gold">
            <path d="M20 6L9 17l-5-5" />
          </svg>
          Link copied! Share &ldquo;{copiedLink}&rdquo; with applicants.
        </div>
      )}

      {dupNotice && (
        <div className="fixed bottom-6 right-6 z-[120] flex items-center gap-2 rounded-full bg-plum py-3 pl-5 pr-6 text-sm font-semibold text-white shadow-2xl shadow-plum/30">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-gold">
            <path d="M20 6L9 17l-5-5" />
          </svg>
          Duplicated &ldquo;{dupNotice}&rdquo;.
        </div>
      )}
    </div>
  );
}

export default JobListingsPage;