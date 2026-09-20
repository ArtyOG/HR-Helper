import { useEffect, useRef, useState } from 'react';
import { listForms } from '../../services/api';
import { formatDateTime, getFormStatus, getNextFormsStatusTime } from '../../utils/forms';
import { useNow } from '../../hooks/useNow';
import { useFormActions } from '../../hooks/useFormActions';
import { DeleteFormModal, CloseFormModal, OpenFormModal } from './FormModals';

const templates = [
  { name: 'New Form', icon: true },
  { name: 'Standard form', icon: false },
];

const statusStyles = {
  Live: 'bg-[#a7eda7] text-[#0d6921]',
  Closed: 'bg-white text-[#757575]',
  Scheduled: 'bg-gold text-plum',
};

const statusDots = {
  Live: 'bg-[#0d6921]',
  Closed: 'bg-[#757575]',
  Scheduled: 'bg-plum',
};

function TemplateCard({ template, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-[10rem] cursor-pointer flex-col overflow-hidden rounded-[20px] border-2 border-plum text-left transition-transform duration-300 ease-out hover:scale-[1.05] ${
        template.icon ? 'bg-[#d9d9d9]' : 'bg-plum'
      }`}
    >
      <div className="flex flex-1 items-center justify-center px-6 py-10">
        {template.icon ? (
          <span className="text-5xl font-bold leading-none text-plum">+</span>
        ) : (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="h-12 w-12 text-[#f2f0e8]"
            aria-hidden="true"
          >
            <rect x="3" y="4" width="18" height="16" rx="3" />
            <path strokeLinecap="round" d="M8 9h8M8 13h8M8 17h5" />
          </svg>
        )}
      </div>
      <div className="rounded-b-[18px] border-t-2 border-plum bg-[#f2f0e8] px-4 py-3.5">
        <p className="text-center text-base font-semibold text-plum">{template.name}</p>
      </div>
    </button>
  );
}

function RecentCard({ form, now, onView, onEdit, onDelete, onDuplicate, onCopyLink, onCloseNow, onOpen }) {
  const applicants = form.applicants ?? form.submissionCount ?? 0;
  const score = Math.min(Number(applicants) || 0, 100);
  const status = getFormStatus(form, now);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onPointerDown = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen]);

  return (
    <article
      role={onCopyLink ? 'button' : undefined}
      tabIndex={onCopyLink ? 0 : undefined}
      onClick={onCopyLink}
      onKeyDown={(e) => {
        if (onCopyLink && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onCopyLink();
        }
      }}
      title={onCopyLink ? 'Click to copy application link' : undefined}
      className={`flex h-full w-[250px] shrink-0 flex-col rounded-[18px] bg-plum p-5 transition-transform duration-300 ease-out hover:scale-[1.05] ${
        onCopyLink ? 'cursor-pointer' : ''
      }`}
    >
      <div className="flex items-center justify-end">
        {(onView || onEdit || onDelete || onCopyLink) && (
          <div
            ref={menuRef}
            className={`popup ${menuOpen ? 'open' : ''}`}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              aria-label="Form actions"
              aria-haspopup="true"
              aria-expanded={menuOpen}
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen((prev) => !prev);
              }}
              className="burger cursor-pointer"
            >
              <span />
              <span />
              <span />
            </button>

            <nav className="popup-window" aria-label="Form actions" onClick={() => setMenuOpen(false)}>
              <legend>Form actions</legend>
              <ul>
                {onView && (
                  <li>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onView();
                      }}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
                        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                      View form
                    </button>
                  </li>
                )}
                {(onCloseNow || onOpen) && <hr />}
                {onCloseNow && (
                  <li>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onCloseNow();
                      }}
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
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpen();
                      }}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
                        <rect x="3" y="4" width="18" height="18" rx="2" />
                        <path d="M16 2v4M8 2v4M3 10h18" />
                      </svg>
                      Set close time
                    </button>
                  </li>
                )}
                {onView && onEdit && <hr />}
                {onEdit && (
                  <li>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit();
                      }}
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
                      onClick={(e) => {
                        e.stopPropagation();
                        onDuplicate();
                      }}
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
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                      }}
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
        )}
      </div>

      <h3 className="mt-6 font-sans text-[17px] font-black leading-tight text-[#F2F0E8]">
        {form.title}
      </h3>

      <p className="mt-1.5 text-[13px] text-[#F2F0E8]">{applicants} applicants</p>

      <div className="mt-auto flex items-center justify-between gap-2 pt-10">
        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10.5px] font-semibold ${statusStyles[status] ?? statusStyles.Live}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${statusDots[status] ?? statusDots.Live}`} />
          {status}
        </span>
      </div>

      {form.closeAt && (
        <p className="mt-2 text-[11px] font-medium text-[#F2F0E8]/75">
          Close at: {formatDateTime(form.closeAt)}
        </p>
      )}

      {status === 'Scheduled' && form.openAt && (
        <p className="mt-1 text-[11px] font-medium text-[#F2F0E8]/75">
          Opens at: {formatDateTime(form.openAt)}
        </p>
      )}

      <div className="mt-3">
        <progress
          value={score}
          max="100"
          className="h-1 w-full appearance-none overflow-hidden rounded-full [&::-webkit-progress-bar]:rounded-full [&::-webkit-progress-bar]:bg-black/20 [&::-webkit-progress-value]:rounded-full [&::-webkit-progress-value]:bg-[#F2F0E8] [&::-moz-progress-bar]:rounded-full [&::-moz-progress-bar]:bg-[#F2F0E8]"
        />
      </div>
    </article>
  );
}

function FormManager({ onCreate, onView, onEdit, onUnauthorized }) {
  const [recentForms, setRecentForms] = useState([]);
  const now = useNow(getNextFormsStatusTime(recentForms));

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
    setCloseTarget,
    setOpenTarget,
  } = useFormActions({
    onUnauthorized,
    onDeleted: (id) => setRecentForms((prev) => prev.filter((f) => f.id !== id)),
    onDuplicated: (dup) => setRecentForms((prev) => [dup, ...prev]),
    onScheduled: (formId, updated) =>
      setRecentForms((prev) =>
        prev.map((f) =>
          f.id === formId
            ? { ...f, ...updated, submissionCount: f.submissionCount ?? updated.submissionCount }
            : f
        )
      ),
  });

  useEffect(() => {
    listForms()
      .then((forms) => {
        if (Array.isArray(forms)) setRecentForms(forms);
      })
      .catch((err) => {
        if (err.status === 401) onUnauthorized?.();
      });
  }, []);

  const handleNewForm = (template) => {
    onCreate?.(template);
  };

  return (
    <section id="forms" className="bg-[#fffef9] py-16 lg:py-24">
      <div className="mx-auto max-w-site px-6 lg:px-8">
        <div className="rounded-[20px] bg-[#f2f0e8] p-6 sm:p-10 lg:p-14">
          <p className="font-sans text-2xl font-semibold text-plum">HiOring Forms</p>
          <h2 className="mt-4 font-sans text-3xl font-bold tracking-tight text-plum sm:text-4xl">
            What role are you hiring for today?
          </h2>
          <p className="mt-3 text-base font-semibold text-plum">Start a new form or view the existing ones</p>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {templates.map((t) => (
              <TemplateCard
                key={t.name}
                template={t}
                onClick={() => handleNewForm(t.icon ? 'blank' : 'standard')}
              />
            ))}
          </div>

          <div className="mt-14">
            <div className="flex items-center justify-between">
              <h3 className="font-sans text-2xl font-bold text-plum">Recent forms</h3>
              <span className="rounded-full bg-plum px-3 py-1 text-xs font-bold text-white">
                {recentForms.length} total
              </span>
            </div>
            {recentForms.length > 0 ? (
              <div className="mt-6 flex gap-6 overflow-x-auto px-3 pb-4 pt-2">
                {recentForms.map((form) => (
                  <div key={form.id} className="w-[250px] shrink-0">
                    <RecentCard
                      form={form}
                      now={now}
                      onView={() => onView?.(form.id)}
                      onEdit={() => onEdit?.(form.id)}
                      onDelete={() => setDeleteTarget(form)}
                      onDuplicate={() => handleDuplicate(form)}
                      onCopyLink={() => copyLink(form)}
                      onCloseNow={
                        getFormStatus(form, now) === 'Live' || getFormStatus(form, now) === 'Scheduled'
                          ? () => setCloseTarget(form)
                          : undefined
                      }
                      onOpen={
                        getFormStatus(form, now) === 'Closed'
                          ? () => setOpenTarget(form)
                          : undefined
                      }
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-6 text-sm text-stone-500">No forms yet. Create your first form to get started.</p>
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
    </section>
  );
}

export default FormManager;