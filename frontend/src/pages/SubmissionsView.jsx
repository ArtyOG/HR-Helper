import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useFormsBackNav } from '../hooks/useFormsBackNav';
import { useNavigation } from '../context/NavigationContext';

import Checkbox from '../components/common/Checkbox';
import {
  getForm,
  listSubmissions,
  getSubmission,
  deleteSubmission,
  updateSubmissionStatus,
  bulkUpdateSubmissionStatus,
  rescoreSubmission,
} from '../services/api';

const STATUS_META = {
  PENDING: { label: 'Pending', className: 'bg-gold text-plum', dot: 'bg-plum' },
  APPROVED: { label: 'Approved', className: 'bg-[#a7eda7] text-[#0d6921]', dot: 'bg-[#0d6921]' },
  REJECTED: { label: 'Rejected', className: 'bg-red-100 text-red-700', dot: 'bg-red-600' },
};

const AI_TERMINAL_STATES = ['COMPLETED', 'FAILED', 'SKIPPED'];
const AI_POLL_INTERVAL_MS = 3000;
const AI_POLL_TIMEOUT_MS = 90000;

const formatDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

function StatusBadge({ status }) {
  const meta = STATUS_META[status] ?? STATUS_META.PENDING;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold ${meta.className}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  );
}

function ScoreBar({ score }) {
  const value = Math.min(Number(score) || 0, 100);
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-plum/10">
        <div className="h-full rounded-full bg-gold" style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs font-bold text-[#344e41]">
        {score != null ? `${score}/100` : '—'}
      </span>
    </div>
  );
}

function ConfirmDeleteModal({ email, deleting, error, onCancel, onConfirm }) {
  const [confirmText, setConfirmText] = useState('');
  const confirmed = confirmText.trim().toLowerCase().startsWith('remove');

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-plum-dark/50 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Delete submission"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-[20px] bg-[#f2efe7] p-6 shadow-2xl ring-1 ring-plum/10"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-sans text-xl font-bold text-plum">Delete submission?</h3>
        <p className="mt-2 text-sm text-stone-600">
          This will permanently remove the application from{' '}
          <span className="font-semibold text-plum">{email}</span>.
        </p>
        <p className="mt-3 text-sm font-semibold text-red-600">
          Type "Remove" to confirm deletion.
        </p>
        <input
          type="text"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder="Type 'Remove' to confirm"
          autoFocus
          className="mt-3 w-full rounded-[12px] border border-red-300 bg-white px-3 py-2 text-sm text-stone-800 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-200"
        />
        {error && <p className="mt-3 text-sm font-medium text-red-600">{error}</p>}
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={deleting}
            className="rounded-full border border-plum/30 px-4 py-2 text-sm font-semibold text-plum transition hover:bg-plum hover:text-white disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={!confirmed || deleting}
            className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailModal({ detail, onClose }) {
  const answers = detail?.answers ?? [];
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-plum-dark/50 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Submission detail"
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-[20px] bg-[#f2efe7] p-6 shadow-2xl ring-1 ring-plum/10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="text-xl font-bold text-plum">Application detail</h3>
            <p className="mt-1 text-sm text-stone-500">{detail?.email}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close detail"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-stone-500 ring-1 ring-plum/10 transition hover:bg-plum hover:text-white"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
              <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <StatusBadge status={detail?.status} />
          {detail?.createdAt && (
            <span className="text-xs text-stone-500">{formatDate(detail.createdAt)}</span>
          )}
        </div>
        {detail?.cvEvaluation?.error && (
          <p className="mt-3 rounded-[12px] bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
            {detail.cvEvaluation.error}
          </p>
        )}

        <div className="mt-5 space-y-3">
          {answers.map((answer) => {
            const value = answer.option?.value ?? answer.value;
            if (!value) return null;
            return (
              <div key={answer.id} className="rounded-[16px] bg-white/70 p-4 ring-1 ring-plum/10">
                <p className="text-xs font-bold uppercase tracking-wide text-plum">
                  {answer.field?.label ?? `Question #${answer.fieldId}`}
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-stone-700">{value}</p>
              </div>
            );
          })}
          {answers.length === 0 && (
            <p className="text-sm text-stone-500">No answers recorded for this submission.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function SubmissionsView() {
  const { formId } = useParams();
  const location = useLocation();
  const backTo = useFormsBackNav();
  const { goToInterviews, goToInterviewsWs } = useNavigation();
  const [form, setForm] = useState(null);

  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(new Set());
  const [busy, setBusy] = useState(false);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [rescoring, setRescoring] = useState(false);
  const [rescoreNote, setRescoreNote] = useState(null);
  const [rescoreTimedOut, setRescoreTimedOut] = useState(false);
  const rescoreTimerRef = useRef(null);
  const rescoreTargetRef = useRef(null);

  const load = async () => {
    if (!formId) return;
    setLoading(true);
    setError(null);
    try {
      const [formData, submissionsData] = await Promise.all([
        getForm(formId),
        listSubmissions(formId),
      ]);
      setForm(formData);
      setSubmissions(Array.isArray(submissionsData) ? submissionsData : []);
    } catch (err) {
      setError(err.message || 'Failed to load submissions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [formId]);

  useEffect(() => {
    return () => {
      if (rescoreTimerRef.current) clearTimeout(rescoreTimerRef.current);
    };
  }, []);

  const counts = useMemo(() => {
    const stats = { total: submissions.length, PENDING: 0, APPROVED: 0, REJECTED: 0 };
    for (const s of submissions) stats[s.status] = (stats[s.status] ?? 0) + 1;
    return stats;
  }, [submissions]);

  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    setSelected((prev) =>
      prev.size === submissions.length ? new Set() : new Set(submissions.map((s) => s.id))
    );
  };

  const openDetail = async (id) => {
    if (!formId) return;
    setDetailLoading(true);
    setDetail(null);
    try {
      const data = await getSubmission(formId, id);
      setDetail(data);
    } catch (err) {
      setError(err.message || 'Failed to load submission detail.');
      setDetail(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const changeStatus = async (ids, status) => {
    if (!formId || busy || ids.length === 0) return;
    setBusy(true);
    setError(null);
    try {
      if (ids.length === 1) {
        await updateSubmissionStatus(formId, ids[0], status);
      } else {
        await bulkUpdateSubmissionStatus(formId, ids, status);
      }
      setSubmissions((prev) =>
        prev.map((s) => (ids.includes(s.id) ? { ...s, status } : s))
      );
      if (detail && ids.includes(detail.id)) setDetail({ ...detail, status });
      setSelected(new Set());
    } catch (err) {
      setError(err.message || 'Failed to update status.');
    } finally {
      setBusy(false);
    }
  };

  const confirmDelete = async () => {
    if (!formId || !deleteTarget || deleting) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteSubmission(formId, deleteTarget.id);
      setSubmissions((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      setSelected((prev) => {
        const next = new Set(prev);
        next.delete(deleteTarget.id);
        return next;
      });
      setDeleteTarget(null);
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete the submission.');
    } finally {
      setDeleting(false);
    }
  };

  const doRescore = async (submission) => {
    if (!formId || rescoring || submission.cvEvaluation?.status === 'PROCESSING') return;
    rescoreTargetRef.current = { id: submission.id, email: submission.email, startedAt: Date.now() };
    setRescoring(true);
    setRescoreTimedOut(false);
    setError(null);
    setRescoreNote(`Rescoring ${submission.email}...`);
    try {
      await rescoreSubmission(formId, submission.id);
      rescoreTimerRef.current = window.setTimeout(
        () => tickRescore(rescoreTargetRef.current),
        AI_POLL_INTERVAL_MS
      );
    } catch (err) {
      setRescoring(false);
      setRescoreNote(null);
      setError(err.message || 'Failed to start rescore.');
    }
  };

  const tickRescore = async (target) => {
    if (!formId || !target) return;
    let current;
    try {
      current = await getSubmission(formId, target.id);
    } catch (err) {
      if (Date.now() - target.startedAt > AI_POLL_TIMEOUT_MS) {
        setRescoring(false);
        setRescoreTimedOut(true);
        setRescoreNote(`Rescore for ${target.email} is taking longer than expected.`);
        return;
      }
      rescoreTimerRef.current = window.setTimeout(
        () => tickRescore(target),
        AI_POLL_INTERVAL_MS
      );
      return;
    }

    const aiStatus = current?.cvEvaluation?.status;
    if (current && AI_TERMINAL_STATES.includes(aiStatus)) {
      try {
        await load();
      } catch {
        // load() already surfaces its own error
      }
      setRescoring(false);
      if (aiStatus === 'COMPLETED') {
        setRescoreNote(`Rescore complete for ${target.email}.`);
      } else if (aiStatus === 'SKIPPED') {
        setRescoreNote(`Rescore skipped for ${target.email}: ${current.cvEvaluation?.error ?? 'no job requirements or CV on file'}.`);
      } else {
        setRescoreNote(
          current.cvEvaluation?.error
            ? `Rescore failed for ${target.email}: ${current.cvEvaluation.error}`
            : `Rescore failed for ${target.email}.`
        );
      }
      return;
    }

    if (Date.now() - target.startedAt > AI_POLL_TIMEOUT_MS) {
      if (rescoreTimerRef.current) {
        clearTimeout(rescoreTimerRef.current);
        rescoreTimerRef.current = null;
      }
      setRescoring(false);
      setRescoreTimedOut(true);
      setRescoreNote(`Rescore for ${target.email} is taking longer than expected.`);
      return;
    }
    rescoreTimerRef.current = window.setTimeout(() => tickRescore(target), AI_POLL_INTERVAL_MS);
  };

  const recheckRescore = () => {
    const target = rescoreTargetRef.current;
    if (!formId || !target || rescoring) return;
    setRescoring(true);
    setRescoreTimedOut(false);
    setRescoreNote(`Checking ${target.email}...`);
    rescoreTargetRef.current = { ...target, startedAt: Date.now() };
    rescoreTimerRef.current = window.setTimeout(
      () => tickRescore(rescoreTargetRef.current),
      AI_POLL_INTERVAL_MS
    );
  };

  const selectedIds = [...selected];

  return (
    <div className="flex min-h-screen flex-col bg-[#f2efe7] font-sans text-stone-800 antialiased">
      <header className="sticky top-0 z-50 border-b border-plum/10 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-3 lg:px-8">
          <a href="!#" onClick={(e) => { e.preventDefault(); backTo(); }} className="flex items-center gap-2.5">
            <span className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-teal">
              <span className="font-serif text-xl font-bold text-white">H</span>
              <span className="absolute -bottom-1 -left-1 h-2 w-2 rounded-sm bg-gold" />
            </span>
            <span className="text-xl font-bold tracking-tight text-plum">HiOring</span>
          </a>
          <nav className="hidden items-center gap-6 text-sm font-medium text-stone-600 md:flex">
            <button
              type="button"
              onClick={backTo}
              className="rounded-full bg-plum px-5 py-2 text-sm font-semibold text-white transition hover:bg-plum-dark"
            >
              Back to dashboard
            </button>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-grow px-5 py-8 lg:px-8">
        <button
          type="button"
          onClick={backTo}
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-stone-500 transition hover:text-plum"
        >
          <span aria-hidden="true">&larr;</span> All hiring form
        </button>

        {error && (
          <div className="mb-5 rounded-[20px] bg-red-100 px-5 py-4 text-sm font-semibold text-red-600">
            {error}
          </div>
        )}

        {rescoreNote && (
          <div className="mb-5 flex items-start justify-between gap-4 rounded-[20px] bg-gold/40 px-5 py-4 text-sm font-semibold text-plum">
            <span>{rescoreNote}</span>
            <span className="flex shrink-0 items-center gap-2">
              {rescoreTimedOut && !rescoring && (
                <button
                  type="button"
                  onClick={recheckRescore}
                  className="rounded-full bg-plum px-3 py-1 text-[11px] font-bold text-white transition hover:bg-plum-dark"
                >
                  Check status
                </button>
              )}
              {!rescoring && (
                <button
                  type="button"
                  onClick={() => setRescoreNote(null)}
                  aria-label="Dismiss rescore notice"
                  className="rounded-full p-1 text-plum/60 transition hover:bg-plum/10 hover:text-plum"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-4 w-4">
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              )}
            </span>
          </div>
        )}

        {loading && (
          <div className="rounded-[20px] bg-white/60 px-5 py-6 text-sm text-stone-500 ring-1 ring-plum/10">
            Loading submissions...
          </div>
        )}

        {!loading && form && (
          <div className="rounded-[20px] bg-[#f2efe7] p-5 ring-1 ring-plum/10 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-2xl font-bold tracking-tight text-plum">{form.title}</p>
                <p className="mt-1 text-sm text-stone-500">
                  {counts.total} submission{counts.total === 1 ? '' : 's'}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {(['PENDING', 'APPROVED', 'REJECTED']).map((s) => (
                  <span
                    key={s}
                    className="hidden rounded-full bg-white/70 px-3 py-1 text-[11px] font-semibold text-stone-500 ring-1 ring-plum/10 sm:inline-flex"
                  >
                    {STATUS_META[s].label}: {counts[s] ?? 0}
                  </span>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    location.pathname.startsWith('/workspace')
                      ? goToInterviewsWs(formId)
                      : goToInterviews(formId)
                  }
                  className="rounded-full border border-plum/20 bg-white px-3.5 py-1 text-[11px] font-bold text-plum shadow-sm transition hover:bg-plum hover:text-white"
                >
                  Interview Slots &rarr;
                </button>
              </div>
            </div>


            {selectedIds.length > 0 && (
              <div className="mt-5 flex flex-wrap items-center gap-3 rounded-[18px] bg-plum px-4 py-3 text-white">
                <span className="text-sm font-semibold">
                  {selectedIds.length} selected
                </span>
                <div className="ml-auto flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => changeStatus(selectedIds, 'APPROVED')}
                    className="rounded-full bg-[#a7eda7] px-4 py-1.5 text-xs font-bold text-[#0d6921] transition hover:brightness-95 disabled:opacity-50"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => changeStatus(selectedIds, 'REJECTED')}
                    className="rounded-full bg-red-500 px-4 py-1.5 text-xs font-bold text-white transition hover:brightness-95 disabled:opacity-50"
                  >
                    Reject
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => setSelected(new Set())}
                    className="rounded-full bg-white/15 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-white/25 disabled:opacity-50"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}

            {counts.total === 0 ? (
              <p className="mt-8 rounded-[18px] bg-white/60 px-5 py-8 text-center text-sm text-stone-500 ring-1 ring-plum/10">
                No applicants yet. Share this form&apos;s live link to start receiving submissions.
              </p>
            ) : (
              <div className="mt-6 overflow-x-auto rounded-[18px] bg-white/70 ring-1 ring-plum/10">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-plum/10 text-[11px] uppercase tracking-wide text-stone-400">
                      <th className="px-4 py-3">
                        <Checkbox
                          checked={submissions.length > 0 && selected.size === submissions.length}
                          onChange={toggleSelectAll}
                          ariaLabel="Select all submissions"
                        />
                      </th>
                      <th className="px-4 py-3">Applicant</th>
                      <th className="px-4 py-3">CV score</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Submitted</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-plum/5">
                    {submissions.map((submission) => (
                      <tr key={submission.id} className="transition hover:bg-white">
                        <td className="px-4 py-3.5">
                          <Checkbox
                            checked={selected.has(submission.id)}
                            onChange={() => toggleSelect(submission.id)}
                            ariaLabel={`Select submission from ${submission.email}`}
                          />
                        </td>
                        <td className="px-4 py-3.5">
                          <button
                            type="button"
                            onClick={() => openDetail(submission.id)}
                            className="font-semibold text-[#344e41] transition hover:text-plum"
                          >
                            {submission.email}
                          </button>
                        </td>
                        <td className="px-4 py-3.5">
                          <ScoreBar score={submission.cvEvaluation?.score} />
                        </td>
                        <td className="px-4 py-3.5">
                          <StatusBadge status={submission.status} />
                        </td>
                        <td className="px-4 py-3.5 text-xs text-stone-500">
                          {formatDate(submission.createdAt)}
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center justify-end gap-1.5">
                            {submission.status !== 'APPROVED' && (
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() => changeStatus([submission.id], 'APPROVED')}
                                className="rounded-full border border-[#0d6921]/30 px-3 py-1 text-[11px] font-bold text-[#0d6921] transition hover:bg-[#a7eda7] disabled:opacity-50"
                              >
                                Approve
                              </button>
                            )}
                            {submission.status !== 'REJECTED' && (
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() => changeStatus([submission.id], 'REJECTED')}
                                className="rounded-full border border-red-300 px-3 py-1 text-[11px] font-bold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                              >
                                Reject
                              </button>
                            )}
                            <button
                              type="button"
                              disabled={busy || rescoring || submission.cvEvaluation?.status === 'PROCESSING'}
                              onClick={() => doRescore(submission)}
                              aria-label={`Rescore submission from ${submission.email}`}
                              title={
                                submission.cvEvaluation?.status === 'PROCESSING'
                                  ? 'AI rescore already in progress'
                                  : 'Rescore AI score'
                              }
                              className="flex h-7 w-7 items-center justify-center rounded-full text-stone-400 transition hover:bg-gold/40 hover:text-plum disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M20 9a8 8 0 00-14-3.5M4 15a8 8 0 0014 3.5" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(submission)}
                              aria-label={`Delete submission from ${submission.email}`}
                              className="flex h-7 w-7 items-center justify-center rounded-full text-stone-400 transition hover:bg-red-100 hover:text-red-600"
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                                <path strokeLinecap="round" d="M3 6h18M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      {detailLoading && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-plum-dark/30 backdrop-blur-sm">
          <span className="text-sm font-semibold text-plum">Loading detail...</span>
        </div>
      )}

      {detail && <DetailModal detail={detail} onClose={() => setDetail(null)} />}

      {deleteTarget && (
        <ConfirmDeleteModal
          email={deleteTarget.email}
          error={deleteError}
          deleting={deleting}
          onCancel={() => { setDeleteTarget(null); setDeleteError(null); }}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}

export default SubmissionsView;