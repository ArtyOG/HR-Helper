import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useFormsBackNav } from '../hooks/useFormsBackNav';
import { getForm } from '../services/api';
import { formatDateTime, getFormStatus, getNextStatusTime } from '../utils/forms';
import { useNow } from '../hooks/useNow';
import StatusBadge from '../components/common/StatusBadge';

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
    <div>
      <button
        type="button"
        onClick={backTo}
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-stone-500 transition hover:text-plum"
      >
        <span aria-hidden="true">&larr;</span> Back to dashboard
      </button>

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
                <StatusBadge preset="form" status={status} />
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

              <div className="mt-6 rounded-[20px] bg-white/70 p-5 ring-1 ring-plum/10">
                <p className="text-sm font-semibold text-stone-800">
                  Upload your CV <span className="text-red-500">*</span>
                </p>
                <p className="mt-1 text-xs text-stone-400">PDF only, max 10MB</p>
                <div className="mt-3 flex cursor-not-allowed flex-col items-center justify-center gap-2 rounded-[16px] border-2 border-dashed border-plum/20 bg-[#efede5] py-8 opacity-70">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-stone-400">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
                    <path d="M14 2v6h6" />
                  </svg>
                  <span className="text-sm font-medium text-stone-600">Click or drop your CV here</span>
                  <span className="text-xs text-stone-400">PDF, max 10MB</span>
                </div>
              </div>
            </div>
          )}
        </div>
  );
}

export default FormView;