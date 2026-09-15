import { useState } from 'react';
import { DEFAULT_CLOSE_WINDOW_MS, toLocalInput } from '../../utils/forms';

export function DeleteFormModal({ title, error, deleting, onCancel, onConfirm }) {
  const [confirmText, setConfirmText] = useState('');
  const confirmed = confirmText.trim().toLowerCase().startsWith('remove');

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-plum-dark/50 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Delete form"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-[20px] bg-[#f2efe7] p-6 shadow-2xl ring-1 ring-plum/10"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-sans text-xl font-bold text-plum">Delete form?</h3>
        <p className="mt-2 text-sm text-stone-600">
          This will permanently delete{' '}
          <span className="font-semibold text-plum">{title}</span>.
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

export function CloseFormModal({ title, error, busy, onCancel, onConfirm }) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-plum-dark/50 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Close form"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-[20px] bg-[#f2efe7] p-6 shadow-2xl ring-1 ring-plum/10"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-sans text-xl font-bold text-plum">Close {title}?</h3>
        <p className="mt-2 text-sm text-stone-600">
          Applications will stop immediately. You can reopen it anytime by setting a new close time.
        </p>
        {error && <p className="mt-3 text-sm font-medium text-red-600">{error}</p>}
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="rounded-full border border-plum/30 px-4 py-2 text-sm font-semibold text-plum transition hover:bg-plum hover:text-white disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {busy ? 'Closing...' : 'Close form'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function OpenFormModal({
  title,
  error,
  busy,
  defaultCloseAt = new Date(Date.now() + DEFAULT_CLOSE_WINDOW_MS),
  onCancel,
  onConfirm,
}) {
  const [closeAtLocal, setCloseAtLocal] = useState(() => toLocalInput(defaultCloseAt));
  const closeAtISO = (() => {
    if (!closeAtLocal) return null;
    const d = new Date(closeAtLocal);
    return Number.isNaN(d.getTime()) ? null : d.toISOString();
  })();
  const valid = closeAtISO != null && new Date(closeAtISO) > new Date();
  const minLocal = toLocalInput(new Date());

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-plum-dark/50 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Set close time"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-[20px] bg-[#f2efe7] p-6 shadow-2xl ring-1 ring-plum/10"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-sans text-xl font-bold text-plum">Open &ldquo;{title}&rdquo;?</h3>
        <p className="mt-2 text-sm text-stone-600">
          The form opens immediately and closes automatically at the time below.
        </p>
        <label className="mb-2 mt-4 block text-sm font-bold text-plum">Close at</label>
        <input
          type="datetime-local"
          value={closeAtLocal}
          min={minLocal}
          onChange={(e) => setCloseAtLocal(e.target.value)}
          className="w-full rounded-[20px] bg-[#d9d9d9] px-4 py-3 text-sm text-stone-800 outline-none transition focus:bg-[#cfcfcf]"
        />
        {error && <p className="mt-3 text-sm font-medium text-red-600">{error}</p>}
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="rounded-full border border-plum/30 px-4 py-2 text-sm font-semibold text-plum transition hover:bg-plum hover:text-white disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(closeAtISO)}
            disabled={busy || !valid}
            className="rounded-full bg-plum px-4 py-2 text-sm font-semibold text-white transition hover:bg-plum-dark disabled:cursor-not-allowed disabled:opacity-40"
          >
            {busy ? 'Opening...' : 'Open form'}
          </button>
        </div>
      </div>
    </div>
  );
}