import { useState } from 'react';
import { getFileDownloadUrl } from '../../services/api';
import { useNavigation } from '../../context/NavigationContext';
import Checkbox from '../common/Checkbox';

function ReviewCvIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
      <path d="M14 2v6h6" />
      <path d="M10 13H8" />
      <path d="M16 17H8" />
      <path d="M16 13h-2" />
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

const initialsFromEmail = (email = '') => {
  const local = email.split('@')[0] || email;
  const parts = local.split(/[.\s_-]+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return local.slice(0, 2).toUpperCase();
};

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex items-center gap-4 py-3">
          <div className="h-[30px] w-[30px] animate-pulse rounded-lg bg-plum/10" />
          <div className="h-[43px] w-[43px] animate-pulse rounded-full bg-plum/10" />
          <div className="flex-1">
            <div className="h-3 w-1/2 animate-pulse rounded-full bg-plum/10" />
            <div className="mt-2 h-1.5 w-2/3 animate-pulse rounded-full bg-plum/10" />
          </div>
        </div>
      ))}
    </div>
  );
}

function TopRankedCandidates({ submissions = [], formsById = new Map(), loading = false }) {
  const { goToEmailSequencesWs } = useNavigation();
  const [downloadingId, setDownloadingId] = useState(null);
  const [selectedIds, setSelectedIds] = useState(() => new Set());

  const candidates = [...submissions]
    .filter((s) => s.cvEvaluation?.score != null && s.email)
    .sort((a, b) => Number(b.cvEvaluation?.score) - Number(a.cvEvaluation?.score))
    .slice(0, 5)
    .map((s) => ({
      id: s.id,
      formId: s.formId,
      email: s.email,
      initials: initialsFromEmail(s.email),
      jobTitle: formsById.get(s.formId)?.title,
      status: s.status,
      score: Number(s.cvEvaluation?.score),
      cvFile: s.cvEvaluation?.file || null,
    }));

  const toggle = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    setSelectedIds((prev) =>
      prev.size === candidates.length ? new Set() : new Set(candidates.map((c) => c.id))
    );
  };

  const selected = candidates.filter((c) => selectedIds.has(c.id));

  const handleSendInvites = () => {
    goToEmailSequencesWs({
      candidates: selected.map((c) => ({
        email: c.email,
        submissionId: c.id,
        formId: c.formId,
        jobTitle: c.jobTitle ?? null,
      })),
    });
  };

  const handleReviewCv = async (candidate) => {
    if (!candidate.cvFile?.id) return;
    setDownloadingId(candidate.id);
    try {
      const data = await getFileDownloadUrl(candidate.cvFile.id);
      if (data?.url) window.open(data.url, '_blank');
    } catch {
      // silent — presigned URL may have expired or file missing
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-plum/10">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-sans text-lg font-bold text-plum">Top Ranked Candidates</h2>
        {candidates.length > 0 && (
          <Checkbox
            checked={candidates.length > 0 && selectedIds.size === candidates.length}
            onChange={toggleAll}
            ariaLabel="Select all top ranked candidates"
            className="text-xs"
          />
        )}
      </div>

      {loading ? (
        <div className="mt-2">
          <LoadingSkeleton />
        </div>
      ) : candidates.length > 0 ? (
        <>
          <ul className="mt-2 divide-y divide-plum/10">
            {candidates.map((candidate) => {
              const checked = selectedIds.has(candidate.id);
              return (
                <li
                  key={candidate.id}
                  className={`flex items-center gap-3 py-4 transition ${
                    checked ? 'bg-plum/[0.03]' : ''
                  }`}
                >
                  <Checkbox
                    checked={checked}
                    onChange={() => toggle(candidate.id)}
                    ariaLabel={`Select ${candidate.email}`}
                  />
                  <span className="flex h-[43px] w-[43px] shrink-0 items-center justify-center rounded-full bg-teal text-sm font-bold uppercase text-white">
                    {candidate.initials}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[#344e41]">{candidate.email}</p>
                    {candidate.jobTitle && (
                      <p className="mt-0.5 truncate text-xs text-stone-500">{candidate.jobTitle}</p>
                    )}
                  </div>

                  {Number.isFinite(candidate.score) && (
                    <span className="shrink-0 rounded-md bg-gold/25 px-2 py-1 text-[11px] font-bold text-plum">
                      {Math.round(candidate.score)}%
                    </span>
                  )}

                  <button
                    type="button"
                    disabled={!candidate.cvFile?.id || downloadingId === candidate.id}
                    onClick={() => handleReviewCv(candidate)}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-black bg-white px-3 py-1.5 text-xs font-semibold text-stone-800 transition hover:border-[#588157] hover:bg-[#588157] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                    title="Review CV"
                  >
                    <ReviewCvIcon />
                    {downloadingId === candidate.id ? 'Loading…' : 'Review CV'}
                  </button>
                </li>
              );
            })}
          </ul>

          {selected.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-plum/10 pt-3">
              <span className="text-xs font-semibold text-stone-500">
                {selected.length} of {candidates.length} selected
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedIds(new Set())}
                  className="rounded-full border border-plum/20 px-4 py-2 text-xs font-semibold text-plum transition hover:bg-plum hover:text-white"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={handleSendInvites}
                  className="inline-flex items-center gap-1.5 rounded-full bg-plum px-4 py-2 text-xs font-bold text-white shadow-sm shadow-plum/20 transition hover:bg-plum-dark"
                >
                  <SendIcon />
                  Send interview invitation
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <p className="mt-4 text-sm text-stone-500">
          No scored submissions yet. Applications will appear here once received.
        </p>
      )}
    </section>
  );
}

export default TopRankedCandidates;