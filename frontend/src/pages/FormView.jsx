import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useFormsBackNav } from '../hooks/useFormsBackNav';
import { getForm } from '../services/api';
import { formatDateTime, getFormStatus, getNextStatusTime } from '../utils/forms';
import { useNow } from '../hooks/useNow';

const sortByOrder = (items) =>
  [...items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

function PreviewFieldRow({ field }) {
  const controlClass =
    'mt-3 h-10 w-full rounded-[12px] bg-[#efede5] px-4 text-sm text-stone-500 outline-none disabled:cursor-not-allowed disabled:opacity-80';

  const renderPreview = () => {
    switch (field.type) {
      case 'NUMBER':
        return (
          <input
            type="number"
            disabled
            placeholder="Number answer"
            className={controlClass}
          />
        );
      case 'DATE':
        return (
          <input type="date" disabled className={controlClass} />
        );
      case 'CHECKBOX':
        return (
          <div className="mt-3 space-y-2">
            {sortByOrder(field.options || []).map((opt, idx) => (
              <label
                key={opt.id ?? idx}
                className="pointer-events-none flex w-fit items-center gap-2 text-sm text-stone-500"
              >
                <input type="checkbox" disabled className="h-4 w-4 accent-plum" />
                {opt.value || `Option ${idx + 1}`}
              </label>
            ))}
            {(field.options || []).length === 0 && (
              <p className="text-sm text-stone-400">No options configured</p>
            )}
          </div>
        );
      case 'RADIO':
        return (
          <div className="mt-3 space-y-2">
            {sortByOrder(field.options || []).map((opt, idx) => (
              <label
                key={opt.id ?? idx}
                className="pointer-events-none flex w-fit items-center gap-2 text-sm text-stone-500"
              >
                <input
                  type="radio"
                  name={`preview-field-${field.id}`}
                  disabled
                  className="accent-plum"
                />
                {opt.value || `Option ${idx + 1}`}
              </label>
            ))}
            {(field.options || []).length === 0 && (
              <p className="text-sm text-stone-400">No options configured</p>
            )}
          </div>
        );
      case 'SELECT':
        return (
          <select disabled className={controlClass}>
            <option value="" disabled>
              Select an option...
            </option>
            {sortByOrder(field.options || []).map((opt, idx) => (
              <option key={opt.id ?? idx} value={opt.id ?? idx}>
                {opt.value || `Option ${idx + 1}`}
              </option>
            ))}
          </select>
        );
      default:
        return (
          <input
            type="text"
            disabled
            placeholder="Short answer text"
            className={controlClass}
          />
        );
    }
  };

  return (
    <div className="rounded-[20px] bg-white/70 p-5 ring-1 ring-plum/10">
      <p className="text-sm font-semibold text-stone-800">
        {field.label}
        {field.required && <span className="ml-1 text-red-500">*</span>}
      </p>
      {renderPreview()}
    </div>
  );
}

function FormView() {
  const { formId } = useParams();
  const backTo = useFormsBackNav();
  const [form, setForm] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!formId) return;
    getForm(formId)
      .then((data) => setForm(data))
      .catch((err) => setError(err.message || 'Failed to load the form.'));
  }, [formId]);

  const fieldCount = form?.fields?.length ?? 0;
  const now = useNow(getNextStatusTime(form));
  const status = getFormStatus(form, now);

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

      <main className="flex-grow">
        <div className="mx-auto w-full max-w-3xl px-5 py-8 lg:px-8">
          {error && (
            <div className="rounded-[20px] bg-red-100 px-5 py-4 text-sm font-semibold text-red-600">
              {error}
            </div>
          )}

          {!form && !error && (
            <div className="rounded-[20px] bg-white/60 px-5 py-6 text-sm text-stone-500 ring-1 ring-plum/10">
              Loading form...
            </div>
          )}

          {form && (
            <div className="rounded-[20px] bg-[#f2efe7] p-5 ring-1 ring-plum/10 sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xl font-bold tracking-tight text-plum">{form.title}</p>
                  {form.id && (
                    <p className="mt-1 text-xs text-stone-400">Live link: /apply/{form.id}</p>
                  )}
                </div>
                <span className="shrink-0 rounded-full bg-plum px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                  Preview
                </span>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-semibold text-stone-500">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 ${
                    status === 'Live'
                      ? 'bg-[#a7eda7] text-[#0d6921]'
                      : status === 'Scheduled'
                        ? 'bg-gold text-plum'
                        : 'bg-white text-[#757575] ring-1 ring-plum/10'
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      status === 'Live'
                        ? 'bg-[#0d6921]'
                        : status === 'Scheduled'
                          ? 'bg-plum'
                          : 'bg-[#757575]'
                    }`}
                  />
                  {status}
                </span>
                {form.closeAt && <span>Close at: {formatDateTime(form.closeAt)}</span>}
                {status === 'Scheduled' && form.openAt && (
                  <span>Opens at: {formatDateTime(form.openAt)}</span>
                )}
              </div>
              {form.description && (
                <p className="mt-3 text-sm leading-relaxed text-stone-600">{form.description}</p>
              )}
              {form.requirements && (
                <div className="mt-4 rounded-[16px] bg-white/70 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-plum">Requirements</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-stone-600">{form.requirements}</p>
                </div>
              )}

              <div className="mt-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-plum">Questions</h3>
                  <span className="text-xs font-medium text-stone-400">
                    {fieldCount} question{fieldCount === 1 ? '' : 's'}
                  </span>
                </div>
                <div className="mt-4 space-y-3">
                  {sortByOrder(form.fields || []).map((field) => (
                    <PreviewFieldRow key={field.id} field={field} />
                  ))}
                  {fieldCount === 0 && (
                    <p className="text-sm text-stone-500">No questions yet.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default FormView;