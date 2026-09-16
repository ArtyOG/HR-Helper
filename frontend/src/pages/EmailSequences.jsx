import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { createInterviewSlots, listForms, listSubmissions, sendTemplateEmail } from '../services/api';
import { PlusIcon, SlotGeneratorForm } from '../components/common/SlotGenerator';

const INITIAL_TEMPLATES = [
  {
    id: 'interview',
    name: 'Interview Invitation',
    tag: 'Interview',
    tagColor: '#8d35ad',
    subject: 'Interview Invitation – {{role}} at Acme Corp',
    body: 'Dear [Candidate Name],\n\nCongratulations! 🎉 Your application for [Position Name] has been shortlisted for an interview.\nPlease select your preferred interview time here:\n[Interview Scheduling Link]\n\nThank you, and we look forward to meeting you.\n\nBest regards,\n[Company Name]\nHR Team',
  },
  {
    id: 'rejection',
    name: 'Rejection – After Review',
    tag: 'Reject',
    tagColor: '#ad3535',
    subject: 'Your application – {{role}} at Acme Corp',
    body: 'Hi [Candidate Name],\n\nThank you for applying for the UX Designer role at [Company Name]. After careful review, we\u2019ve decided to move forward with other candidates whose experience more closely matches what we\u2019re looking for right now. We really appreciate the time you put into your application and would welcome you to apply again in the future.\n\nWishing you the best in your search.\n\u2014 [Company Name] Hiring Team',
  },
];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const initialsFromEmail = (email = '') => {
  const local = (email || '').split('@')[0] || '';
  const parts = local.split(/[.\s_-]+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return local.slice(0, 2).toUpperCase();
};

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.7 21a2 2 0 0 1-3.4 0" />
    </svg>
  );
}

function MessageIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}

function Badge({ count }) {
  return (
    <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#F90808] px-1 text-[10px] font-bold leading-none text-white">
      {count}
    </span>
  );
}

function PencilIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-5 w-5" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

function TemplateRow({ template, active, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      className={`flex w-full items-center gap-4 px-6 py-4 text-left transition-colors duration-150 ${
        active ? 'bg-[#f2f1e9]' : 'bg-white hover:bg-[#f2f0e8]'
      }`}
    >
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] font-bold leading-tight text-[#282828]">
          {template.name}
        </span>
        <span className="mt-2 flex items-center justify-between gap-2">
          <span
            className="inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
            style={{ backgroundColor: `${template.tagColor}1a`, color: template.tagColor }}
          >
            {template.tag}
          </span>
          {active && <span className="text-[11px] font-semibold text-stone-400">Editing</span>}
        </span>
      </span>
    </button>
  );
}

function SendModal({ template, draft, candidate, preloadedCandidates = [], onSelectCandidate, onClose }) {
  const [recipient, setRecipient] = useState(candidate?.email ?? '');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [manual, setManual] = useState(false);
  const [browsing, setBrowsing] = useState(!candidate);
  const [forms, setForms] = useState([]);
  const [formsLoading, setFormsLoading] = useState(true);
  const [selectedFormId, setSelectedFormId] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [candidatesLoading, setCandidatesLoading] = useState(false);
  const [candidatesError, setCandidatesError] = useState('');
  const [slotGenOpen, setSlotGenOpen] = useState(false);
  const [createdSlotCount, setCreatedSlotCount] = useState(0);
  const inputRef = useRef(null);

  const isInterview = template?.id === 'interview';
  const preloaded = preloadedCandidates.length > 0 ? preloadedCandidates : candidate ? [candidate] : [];
  const multi = preloaded.length > 1;

  useEffect(() => {
    let cancelled = false;
    listForms()
      .then((data) => {
        if (!cancelled) setForms(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) setCandidatesError('Could not load jobs. Please try again.');
      })
      .finally(() => {
        if (!cancelled) setFormsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (manual) inputRef.current?.focus();
  }, [manual]);

  useEffect(() => {
    if (sending) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [sending, onClose]);

  useEffect(() => {
    if (!selectedFormId) {
      setCandidates([]);
      return undefined;
    }
    let cancelled = false;
    setCandidatesLoading(true);
    setCandidatesError('');
    listSubmissions(selectedFormId)
      .then((data) => {
        if (!cancelled) setCandidates(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) setCandidatesError('Could not load candidates. Please try again.');
      })
      .finally(() => {
        if (!cancelled) setCandidatesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedFormId]);

  const selectedForm = forms.find((f) => f.id === selectedFormId) ?? null;

  const slotGenFormId = selectedFormId || preloaded[0]?.formId || null;
  const slotGenFormTitle = selectedForm?.title || preloaded[0]?.jobTitle || '';

  const handleToggleSlotGen = () => setSlotGenOpen((open) => !open);

  const handleSlotsCreated = async (slots) => {
    await createInterviewSlots(slotGenFormId, slots);
    setCreatedSlotCount(slots.length);
  };

  const rankedCandidates = [...candidates]
    .filter((s) => s.email)
    .sort((a, b) => {
      const sa = Number(a.cvEvaluation?.score) || -1;
      const sb = Number(b.cvEvaluation?.score) || -1;
      return sb - sa;
    });

  const handlePickForm = (id) => {
    setSelectedFormId(id);
    setCandidatesError('');
  };

  const handlePickCandidate = (sub) => {
    setRecipient(sub.email);
    onSelectCandidate({
      email: sub.email,
      submissionId: sub.id,
      formId: selectedFormId,
      jobTitle: selectedForm?.title ?? null,
    });
    setManual(false);
    setBrowsing(false);
  };

  const handleSend = async (event) => {
    if (event?.preventDefault) event.preventDefault();

    if (preloaded.length > 0) {
      const invalid = preloaded.filter((c) => !EMAIL_PATTERN.test((c.email || '').trim()));
      if (invalid.length) {
        setError('Some selected candidates have invalid email addresses.');
        return;
      }
      setError('');
      setSending(true);
      try {
        for (const c of preloaded) {
          const form = forms.find((f) => f.id === c.formId);
          const title = c.jobTitle || form?.title || '';
          await sendTemplateEmail({
            to: c.email,
            subject: draft.subject,
            templateName: template.id,
            context: {
              candidateName: (c.email || '').split('@')[0],
              jobTitle: title,
              companyName: 'HiOring',
              scheduleLink: c.formId && c.submissionId
                ? `${window.location.origin}/schedule/${c.formId}/${c.submissionId}`
                : '',
            },
          });
        }
        setSent(true);
      } catch (err) {
        setError(err?.message || 'Failed to send the emails. Please try again.');
      } finally {
        setSending(false);
      }
      return;
    }

    const trimmed = recipient.trim();
    if (!trimmed) {
      setError('Select a candidate or enter a recipient email address.');
      return;
    }
    if (!EMAIL_PATTERN.test(trimmed)) {
      setError('That doesn\u2019t look like a valid email address.');
      return;
    }
    setError('');
    setSending(true);
    try {
      await sendTemplateEmail({
        to: trimmed,
        subject: draft.subject,
        templateName: template.id,
        context: {},
      });
      setSent(true);
    } catch (err) {
      setError(err?.message || 'Failed to send the email. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const renderCandidateList = (subs) => (
    <ul className="mt-2 max-h-[260px] divide-y divide-plum/10 overflow-y-auto rounded-xl bg-white ring-1 ring-plum/10">
      {subs.map((sub) => {
        const score = Number(sub.cvEvaluation?.score);
        return (
          <li key={sub.id}>
            <button
              type="button"
              onClick={() => handlePickCandidate(sub)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-[#f2f0e8]"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal text-xs font-bold uppercase text-white">
                {initialsFromEmail(sub.email)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-[#344e41]">{sub.email}</span>
                {sub.createdAt && (
                  <span className="mt-0.5 block text-[11px] text-stone-400">
                    Submitted {new Date(sub.createdAt).toLocaleDateString()}
                  </span>
                )}
              </span>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                  Number.isNaN(score) ? 'bg-stone-200 text-stone-500' : 'bg-gold/25 text-plum'
                }`}
              >
                {Number.isNaN(score) ? 'No score' : `${score}/100`}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Send ${template.name} email`}
      className="fixed inset-0 z-[110] overflow-y-auto bg-plum-dark/50 px-6 py-6 backdrop-blur-sm"
      onClick={isInterview || sending ? undefined : onClose}
    >
      <div className="flex min-h-full items-center justify-center">
        <div
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md rounded-[20px] bg-[#f2efe7] p-7 shadow-2xl ring-1 ring-plum/10"
        >
          <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="text-xl font-bold text-plum">Send &ldquo;{template.name}&rdquo;</h3>
            <p className="mt-1 text-sm text-stone-500">
              Delivered from your connected Gmail account.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isInterview ? false : sending}
            aria-label="Close send dialog"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-stone-500 ring-1 ring-plum/10 transition hover:bg-plum hover:text-white disabled:cursor-not-allowed"
          >
            <CloseIcon />
          </button>
        </div>

        {sent ? (
          <div className="mt-6">
            <div className="flex items-start gap-3 rounded-xl bg-[#a7eda7]/40 px-4 py-3 text-sm font-semibold text-[#0d6921]">
              <CheckIcon />
              <span role="status">
              {multi
                ? `Email sent to ${preloaded.length} candidates.`
                : preloaded.length === 1
                ? `Email sent to ${preloaded[0].email}.`
                : `Email sent to ${recipient.trim()}.`}
            </span>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="rounded-full bg-plum px-6 py-2.5 text-sm font-bold text-white transition hover:bg-plum-dark"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <div>
            <label className="mt-5 block">
              <span className="text-xs font-bold uppercase tracking-wider text-plum">
                Subject preview
              </span>
              <span className="mt-2 block truncate rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-stone-700 ring-1 ring-plum/10">
                {draft.subject || '(no subject)'}
              </span>
            </label>

            {preloaded.length > 0 ? (
              <div className="mt-5">
                <span className="text-xs font-bold uppercase tracking-wider text-plum">
                  {multi ? `Recipients (${preloaded.length})` : 'Recipient'}
                </span>
                <ul className="mt-2 max-h-[220px] divide-y divide-plum/10 overflow-y-auto rounded-xl bg-white ring-1 ring-plum/10">
                  {preloaded.map((c) => (
                    <li key={c.submissionId || c.email} className="flex items-center gap-3 px-4 py-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal text-xs font-bold uppercase text-white">
                        {initialsFromEmail(c.email)}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-sm font-semibold text-[#344e41]">
                        {c.email}
                      </span>
                      {c.jobTitle && (
                        <span className="shrink-0 rounded-full bg-plum/10 px-2 py-0.5 text-[11px] font-bold text-plum">
                          {c.jobTitle}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-xs text-stone-500">
                  An interview invitation with a personal scheduling link will be sent to each
                  candidate.
                </p>
              </div>
            ) : manual ? (
              <>
                <label className="mt-5 block">
                  <span className="text-xs font-bold uppercase tracking-wider text-plum">
                    Recipient email
                  </span>
                  <input
                    ref={inputRef}
                    type="email"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSend(e);
                      }
                    }}
                    placeholder="candidate@example.com"
                    className="mt-2 h-12 w-full rounded-xl border border-plum/10 bg-white px-4 text-sm text-stone-800 shadow-sm outline-none transition placeholder:text-stone-400 focus:border-teal focus:ring-2 focus:ring-teal/20"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setManual(false);
                    setBrowsing(true);
                  }}
                  className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-plum transition hover:text-plum-dark"
                >
                  <span aria-hidden="true">&larr;</span> Pick a candidate instead
                </button>
              </>
            ) : browsing ? (
              <div className="mt-5">
                <span className="text-xs font-bold uppercase tracking-wider text-plum">
                  Recipient
                </span>

                {!selectedFormId ? (
                  <>
                    <p className="mt-2 text-xs text-stone-500">
                      Choose a job below to pick one of its candidates.
                    </p>
                    {formsLoading ? (
                      <p className="mt-3 rounded-xl bg-white px-4 py-6 text-center text-sm text-stone-500 ring-1 ring-plum/10">
                        Loading jobs&hellip;
                      </p>
                    ) : forms.length === 0 ? (
                      <p className="mt-3 rounded-xl bg-white px-4 py-6 text-center text-sm text-stone-500 ring-1 ring-plum/10">
                        No jobs available yet. Create one to pick candidates.
                      </p>
                    ) : (
                      <ul className="mt-2 max-h-[260px] divide-y divide-plum/10 overflow-y-auto rounded-xl bg-white ring-1 ring-plum/10">
                        {forms.map((form) => {
                          const count = Number(form.submissionCount) || 0;
                          return (
                            <li key={form.id}>
                              <button
                                type="button"
                                onClick={() => handlePickForm(form.id)}
                                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-[#f2f0e8]"
                              >
                                <span className="truncate text-sm font-semibold text-[#344e41]">
                                  {form.title}
                                </span>
                                <span className="shrink-0 rounded-full bg-plum/10 px-2 py-0.5 text-[11px] font-bold text-plum">
                                  {count} {count === 1 ? 'candidate' : 'candidates'}
                                </span>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFormId(null);
                        setCandidates([]);
                      }}
                      className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 transition hover:text-plum"
                    >
                      <span aria-hidden="true">&larr;</span>{' '}
                      {selectedForm?.title ?? 'All jobs'}
                    </button>

                    {candidatesLoading ? (
                      <p className="mt-3 rounded-xl bg-white px-4 py-6 text-center text-sm text-stone-500 ring-1 ring-plum/10">
                        Loading candidates&hellip;
                      </p>
                    ) : candidatesError ? (
                      <p className="mt-3 rounded-xl bg-red-100 px-4 py-3 text-sm font-semibold text-red-600">
                        {candidatesError}
                      </p>
                    ) : rankedCandidates.length === 0 ? (
                      <p className="mt-3 rounded-xl bg-white px-4 py-6 text-center text-sm text-stone-500 ring-1 ring-plum/10">
                        No candidates on this job yet.
                      </p>
                    ) : (
                      renderCandidateList(rankedCandidates)
                    )}
                  </>
                )}

                <button
                  type="button"
                  onClick={() => setManual(true)}
                  className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-plum transition hover:text-plum-dark"
                >
                  Enter an email manually
                </button>
              </div>
            ) : (
              <div className="mt-5">
                <span className="text-xs font-bold uppercase tracking-wider text-plum">
                  Recipient
                </span>
                <div className="mt-2 flex items-center gap-3 rounded-xl bg-white px-4 py-3 ring-1 ring-plum/10">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal text-xs font-bold uppercase text-white">
                    {initialsFromEmail(candidate?.email)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-[#344e41]">
                      {candidate?.email}
                    </span>
                    {candidate?.jobTitle && (
                      <span className="mt-0.5 block truncate text-xs text-stone-500">
                        {candidate.jobTitle}
                      </span>
                    )}
                  </span>
                  <button
                    type="button"
                    onClick={() => setBrowsing(true)}
                    className="shrink-0 rounded-full border border-plum/20 px-3 py-1.5 text-xs font-semibold text-plum transition hover:bg-plum hover:text-white"
                  >
                    Change
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setManual(true)}
                  className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-plum transition hover:text-plum-dark"
                >
                  Enter an email manually
                </button>
              </div>
            )}

            {slotGenFormId && (
              <div className="mt-4">
                <button
                  type="button"
                  onClick={handleToggleSlotGen}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-bold transition ${
                    slotGenOpen
                      ? 'border-plum bg-plum text-white'
                      : 'border-plum/20 text-plum hover:bg-plum hover:text-white'
                  }`}
                >
                  {slotGenOpen ? <CloseIcon /> : <PlusIcon />}
                  {slotGenOpen ? 'Close slot generator' : 'Create interview slots for this job'}
                  {createdSlotCount > 0 && (
                    <span className="ml-1 rounded-full bg-gold px-2 py-0.5 text-[10px] font-bold text-plum">
                      {createdSlotCount} created
                    </span>
                  )}
                </button>

                <div
                  className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
                    slotGenOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                  }`}
                >
                  <div className="min-h-0 overflow-hidden">
                    <div className="mt-4 rounded-2xl bg-white/60 p-5 ring-1 ring-plum/10">
                      <SlotGeneratorForm formTitle={slotGenFormTitle} onCreated={handleSlotsCreated} />
                    </div>
                    {createdSlotCount > 0 && (
                      <div className="mt-4 flex items-start gap-3 rounded-xl bg-[#a7eda7]/40 px-4 py-3 text-sm font-semibold text-[#0d6921]">
                        <CheckIcon />
                        <span>
                          {createdSlotCount} interview slot{createdSlotCount === 1 ? '' : 's'} created
                          {slotGenFormTitle ? ` for ${slotGenFormTitle}` : ''}. Candidates can pick
                          one of these times once you share your scheduling link.
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {error && (
              <p className="mt-3 rounded-lg bg-red-100 px-3 py-2 text-sm font-semibold text-red-600" role="alert">
                {error}
              </p>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={sending}
                className="rounded-full border border-plum/30 px-5 py-2.5 text-sm font-semibold text-plum transition hover:bg-plum hover:text-white disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSend}
                disabled={sending}
                className="flex items-center gap-2 rounded-full bg-plum px-6 py-2.5 text-sm font-bold text-white transition hover:bg-plum-dark disabled:cursor-not-allowed disabled:opacity-60"
              >
                {sending ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Sending…
                  </>
                ) : (
                  <>
                    <SendIcon />
                    {multi ? `Send ${preloaded.length} invitations` : 'Send email'}
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}

function EmailSequences() {
  const location = useLocation();
  const templates = useMemo(() => INITIAL_TEMPLATES, []);
  const [selectedId, setSelectedId] = useState('interview');
  const [editing, setEditing] = useState(false);
  const [drafts, setDrafts] = useState(() =>
    Object.fromEntries(INITIAL_TEMPLATES.map((t) => [t.id, { subject: t.subject, body: t.body }]))
  );
  const [sendTarget, setSendTarget] = useState(null);
  const [candidate, setCandidate] = useState(null);
  const [autoOpened, setAutoOpened] = useState(false);

  const selected = templates.find((t) => t.id === selectedId);
  const draft = drafts[selectedId];

  const incomingCandidates = useMemo(() => {
    const raw = location.state?.candidates;
    return Array.isArray(raw) ? raw.filter((c) => c?.email) : [];
  }, [location.state]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (incomingCandidates.length === 0 || autoOpened) return;
    setAutoOpened(true);
    setSelectedId('interview');
    const interviewTemplate = templates.find((t) => t.id === 'interview');
    if (interviewTemplate) setSendTarget(interviewTemplate);
  }, [incomingCandidates, autoOpened, templates]);

  const selectTemplate = (id) => {
    setSelectedId(id);
    setEditing(false);
  };

  const updateDraft = (field, value) => {
    setDrafts((prev) => ({
      ...prev,
      [selectedId]: { ...prev[selectedId], [field]: value },
    }));
  };

  const toggleEdit = () => {
    setEditing((prev) => !prev);
  };

  const inputBase = 'mt-2 w-full rounded-xl bg-white text-base text-stone-800 outline-none transition placeholder:text-stone-400';
  const inputState = editing
    ? 'cursor-text border border-plum/15 shadow-sm focus:border-teal focus:ring-2 focus:ring-teal/20'
    : 'cursor-not-allowed border border-transparent bg-[#f3f1e9] text-stone-600';

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
        <div>
          <h1 className="font-sans text-[26px] font-bold leading-none tracking-tight text-[#344e41]">
            Email Sequences
          </h1>
          <p className="mt-2 text-sm font-medium text-stone-500">
            Manage email templates and send personalized updates to candidates
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            aria-label="Notifications"
            className="relative flex h-[51px] w-[51px] items-center justify-center rounded-2xl bg-white text-plum shadow-sm ring-1 ring-plum/10 transition hover:text-teal"
          >
            <BellIcon />
            <Badge count="2" />
          </button>
          <button
            type="button"
            aria-label="Messages"
            className="relative flex h-[51px] w-[51px] items-center justify-center rounded-2xl bg-white text-plum shadow-sm ring-1 ring-plum/10 transition hover:text-teal"
          >
            <MessageIcon />
            <Badge count="2" />
          </button>
          <span className="flex h-[43px] w-[43px] items-center justify-center rounded-full bg-teal text-sm font-bold uppercase text-white shadow-sm">
            DS
          </span>
        </div>
      </div>

      <div className="mt-6 flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-plum/10 md:flex-row">
        <aside className="flex w-full shrink-0 flex-col border-b border-plum/10 md:w-[338px] md:border-b-0 md:border-r">
          <div className="flex items-center justify-between px-6 pb-3 pt-6">
            <h2 className="font-sans text-lg font-bold text-plum">Templates</h2>
            <span className="rounded-full bg-plum/10 px-3 py-1 text-xs font-bold text-plum">
              {templates.length}
            </span>
          </div>
          <div className="flex flex-1 flex-col divide-y divide-plum/5">
            {templates.map((template) => (
              <TemplateRow
                key={template.id}
                template={template}
                active={template.id === selectedId}
                onSelect={() => selectTemplate(template.id)}
              />
            ))}
          </div>
        </aside>

        <section className="min-w-0 flex-1 bg-[#fffef9] p-5 sm:p-8">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-[#344e41]">{selected.name}</h1>
            <span
              className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide"
              style={{ backgroundColor: `${selected.tagColor}1a`, color: selected.tagColor }}
            >
              {selected.tag}
            </span>
          </div>

          <div className="mt-7 space-y-6">
            <div>
              <label htmlFor="email-subject" className="block text-xs font-bold uppercase tracking-wider text-plum">
                Subject <span className="font-medium normal-case text-stone-400">(Optional)</span>
              </label>
              <input
                id="email-subject"
                type="text"
                value={draft.subject}
                onChange={(e) => updateDraft('subject', e.target.value)}
                disabled={!editing}
                placeholder="Subject line"
                className={`${inputBase} ${inputState} h-12 px-4`}
              />
            </div>

            <div>
              <label htmlFor="email-body" className="block text-xs font-bold uppercase tracking-wider text-plum">
                Body
              </label>
              <textarea
                id="email-body"
                value={draft.body}
                onChange={(e) => updateDraft('body', e.target.value)}
                disabled={!editing}
                rows={12}
                placeholder="Write your email body here…"
                className={`${inputBase} ${inputState} min-h-[240px] resize-y px-4 py-3 leading-relaxed`}
              />
            </div>
          </div>

          <p className="mt-3 text-xs leading-relaxed text-stone-400">
            Tip: <code className="rounded bg-plum/5 px-1.5 py-0.5 font-mono text-[11px] text-plum">[Candidate Name]</code>{' '}
            placeholders and{' '}
            <code className="rounded bg-plum/5 px-1.5 py-0.5 font-mono text-[11px] text-plum">{'{{role}}'}</code>{' '}
            variables are replaced automatically when you send.
          </p>

          <hr className="my-7 border-plum/10" />

          {incomingCandidates.length > 0 && (
            <div className="mb-5 rounded-xl bg-[#f2f0e8] px-4 py-3">
              <p className="text-[11px] font-bold uppercase tracking-wider text-plum">
                {incomingCandidates.length} candidate
                {incomingCandidates.length === 1 ? '' : 's'} ready to send
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {incomingCandidates.map((c) => (
                  <span
                    key={c.submissionId || c.email}
                    className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#344e41] ring-1 ring-plum/10"
                  >
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal text-[9px] font-bold uppercase text-white">
                      {initialsFromEmail(c.email)}
                    </span>
                    {c.email}
                  </span>
                ))}
              </div>
              <p className="mt-2 text-xs text-stone-500">
                Click Send to open the interview form, set up time slots, and invite these
                candidates.
              </p>
            </div>
          )}

          {candidate && (
            <div className="mb-5 flex flex-wrap items-center gap-3 rounded-xl bg-[#f2f0e8] px-4 py-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal text-xs font-bold uppercase text-white">
                {initialsFromEmail(candidate.email)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-[#344e41]">{candidate.email}</p>
                {candidate.jobTitle && (
                  <p className="truncate text-xs text-stone-500">{candidate.jobTitle}</p>
                )}
              </div>
              <span className="shrink-0 rounded-full bg-plum/10 px-2.5 py-1 text-[11px] font-bold text-plum">
                Will receive your emails
              </span>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={toggleEdit}
              className={`inline-flex h-11 items-center gap-2 rounded-full border px-5 text-sm font-semibold transition ${
                editing
                  ? 'border-transparent bg-plum text-white shadow-sm hover:bg-plum-dark'
                  : 'border-plum/20 bg-white text-plum hover:bg-plum hover:text-white'
              }`}
            >
              {editing ? <CheckIcon /> : <PencilIcon />}
              {editing ? 'Done' : 'Edit'}
            </button>
            <button
              type="button"
              onClick={() => setSendTarget(selected)}
              className="inline-flex h-11 items-center gap-2 rounded-full bg-plum px-6 text-sm font-bold text-white shadow-sm shadow-plum/20 transition hover:bg-plum-dark"
            >
              <SendIcon />
              Send
            </button>
          </div>
        </section>
      </div>

      {sendTarget && (
        <SendModal
          template={sendTarget}
          draft={drafts[sendTarget.id]}
          candidate={candidate}
          preloadedCandidates={incomingCandidates}
          onSelectCandidate={setCandidate}
          onClose={() => setSendTarget(null)}
        />
      )}
    </div>
  );
}

export default EmailSequences;