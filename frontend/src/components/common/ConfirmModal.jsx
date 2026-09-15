function ConfirmModal({ title, message, confirmLabel = 'Yes, enter', open, onClose, onConfirm }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-[auth-backdrop-in_0.3s_ease-out]"
        onClick={onClose}
      />
      <div className="relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl animate-[auth-card-in_0.45s_cubic-bezier(0.16,1,0.3,1)]">
        <h3 className="font-sans text-lg font-bold text-plum">{title}</h3>
        <p className="mt-2 text-sm text-stone-600">{message}</p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-full border border-plum/30 px-4 py-2.5 text-center text-sm font-semibold text-plum transition hover:bg-plum/5"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 rounded-full bg-plum px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-plum-dark"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;