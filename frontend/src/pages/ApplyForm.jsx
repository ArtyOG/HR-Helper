import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getForm, submitFormAnswers, getPresignedUploadUrl, uploadCvToS3, createFileRecord } from '../services/api';
import { formatDateTime, getNextStatusTime, isFormAcceptingResponses } from '../utils/forms';
import { useNow } from '../hooks/useNow';

const sortByOrder = (items) =>
  [...items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

const isEmailField = (f) => (f.label || '').trim().toLowerCase() === 'email';

function FieldRow({ field, value, onChange, showErrors }) {
  const error = showErrors && field.required && !String(value ?? '').trim();

  const inputClass = 'mt-3 h-10 w-full rounded-[12px] bg-[#efede5] px-4 text-sm text-stone-800 outline-none transition placeholder:text-stone-400 focus:bg-white focus:ring-2 focus:ring-plum/40';
  const errorText = () =>
    error ? <p className="mt-1 text-[11px] font-semibold text-red-500">This question is required.</p> : null;

  const renderInput = () => {
    switch (field.type) {
      case 'NUMBER':
        return (
          <input
            type="number"
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Number answer"
            className={inputClass}
          />
        );
      case 'DATE':
        return (
          <input
            type="date"
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            className={inputClass}
          />
        );
      case 'CHECKBOX':
        return (
          <div className="mt-3 space-y-2">
            {sortByOrder(field.options || []).map((opt, idx) => {
              const selected = (value || '').split(', ').filter(Boolean);
              const isChecked = selected.includes(opt.value);
              return (
                <label
                  key={`${field.id}-${opt.id ?? idx}`}
                  className="flex w-fit cursor-pointer items-center gap-2 text-sm text-stone-700"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => {
                      const next = e.target.checked
                        ? [...selected, opt.value]
                        : selected.filter((v) => v !== opt.value);
                      onChange(next.join(', '));
                    }}
                    className="h-4 w-4 accent-plum"
                  />
                  {opt.value}
                </label>
              );
            })}
          </div>
        );
      case 'RADIO':
        return (
          <div className="mt-3 space-y-2">
            {sortByOrder(field.options || []).map((opt, idx) => (
              <label
                key={`${field.id}-${opt.id ?? idx}`}
                className="flex w-fit cursor-pointer items-center gap-2 text-sm text-stone-700"
              >
                <input
                  type="radio"
                  name={`field-${field.id}`}
                  checked={value === opt.value}
                  onChange={() => onChange(opt.value)}
                  className="accent-plum"
                />
                {opt.value}
              </label>
            ))}
          </div>
        );
      case 'SELECT':
        return (
          <select
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            className={inputClass}
          >
            <option value="" disabled>
              Select an option...
            </option>
            {sortByOrder(field.options || []).map((opt, idx) => (
              <option key={`${field.id}-${opt.id ?? idx}`} value={opt.value}>
                {opt.value}
              </option>
            ))}
          </select>
        );
      default:
        return (
          <input
            type="text"
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Short answer text"
            className={inputClass}
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
      {renderInput()}
      {errorText()}
    </div>
  );
}

function ApplyForm() {
  const { formId } = useParams();
  const [form, setForm] = useState(null);
  const [error, setError] = useState(null);
  const [missing, setMissing] = useState(false);
  const [answers, setAnswers] = useState({});
  const [showErrors, setShowErrors] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const now = useNow(getNextStatusTime(form));
  const accepting = isFormAcceptingResponses(form, now);
  const notOpenYet = form?.openAt != null && now < new Date(form.openAt).getTime();
  const ended = form?.closeAt != null && now > new Date(form.closeAt).getTime();

  useEffect(() => {
    if (!formId) return;
    setMissing(false);
    setForm(null);
    setError(null);
    getForm(formId)
      .then((data) => setForm(data))
      .catch((err) => {
        if (err.status === 404) {
          setMissing(true);
        } else {
          setError(err.message || 'Failed to load the form.');
        }
      });
  }, [formId]);

  const [cvFile, setCvFile] = useState(null);
  const [cvFileId, setCvFileId] = useState(0);
  const [cvUploadState, setCvUploadState] = useState('idle'); // idle | uploading | done | error
  const [cvError, setCvError] = useState(null);
  const [cvDragging, setCvDragging] = useState(false);
  const cvInputRef = useRef(null);

  const CV_ACCEPT = '.pdf';
  const CV_MAX_MB = 10;

  const handleCvUpload = async (file) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setCvError('Only PDF files are allowed.');
      setCvUploadState('error');
      return;
    }
    if (file.size > CV_MAX_MB * 1024 * 1024) {
      setCvError(`File exceeds the ${CV_MAX_MB}MB limit.`);
      setCvUploadState('error');
      return;
    }

    setCvFile(file);
    setCvFileId(0);
    setCvUploadState('uploading');
    setCvError(null);

    try {
      const { uploadUrl, key } = await getPresignedUploadUrl(file.name, file.size);
      await uploadCvToS3(uploadUrl, file);
      const { id: fileId } = await createFileRecord(key);
      setCvFileId(fileId);
      setCvUploadState('done');
    } catch (err) {
      setCvError(err.message || 'Failed to upload CV. Please try again.');
      setCvUploadState('error');
    }
  };

  const removeCv = () => {
    setCvFile(null);
    setCvFileId(0);
    setCvUploadState('idle');
    setCvError(null);
    if (cvInputRef.current) cvInputRef.current.value = '';
  };

  const requiredEmpty = (form?.fields || []).some(
    (f) => f.required && !String(answers[f.id] ?? '').trim()
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form) return;
    if (requiredEmpty || !cvFileId) {
      setShowErrors(true);
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const allAnswers = (form.fields || [])
        .map((f) => ({ fieldId: f.id, value: answers[f.id] ?? '' }))
        .filter((a) => a.value !== '');
      const email = allAnswers.find((a) =>
        isEmailField(form.fields.find((f) => f.id === a.fieldId))
      )?.value;
      const payload = {
        cvFileId,
        email: email || '',
        answers: allAnswers,
      };
      await submitFormAnswers(form.id, payload);
      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'Failed to submit the application.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#f2efe7] font-sans text-stone-800 antialiased">
      <header className="sticky top-0 z-50 border-b border-plum/10 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-3 lg:px-8">
          <span className="flex items-center gap-2.5">
            <span className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-teal">
              <span className="font-serif text-xl font-bold text-white">H</span>
              <span className="absolute -bottom-1 -left-1 h-2 w-2 rounded-sm bg-gold" />
            </span>
            <span className="text-xl font-bold tracking-tight text-plum">HiOring</span>
          </span>
          <span className="text-xs font-semibold uppercase tracking-wide text-stone-400">
            Job application
          </span>
        </div>
      </header>

      <main className="flex-grow">
        <div className="mx-auto w-full max-w-3xl px-5 py-8 lg:px-8">
          {submitted ? (
            <div className="rounded-[20px] bg-white/70 p-8 text-center ring-1 ring-plum/10">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-teal/15 text-teal">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </span>
              <p className="mt-4 text-xl font-bold text-plum">Application submitted!</p>
              <p className="mt-2 text-sm text-stone-600">Thank you for applying. We will review your application shortly.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              {error && (
                <div className="mb-5 rounded-[20px] bg-red-100 px-5 py-4 text-sm font-semibold text-red-600">
                  {error}
                </div>
              )}

              {!form && !error && !missing && (
                <div className="rounded-[20px] bg-white/60 px-5 py-6 text-sm text-stone-500 ring-1 ring-plum/10">
                  Loading form...
                </div>
              )}

              {missing && (
                <div className="rounded-[20px] bg-[#f2efe7] p-5 ring-1 ring-plum/10 sm:p-8">
                  <div className="rounded-[20px] bg-white/70 p-8 text-center ring-1 ring-plum/10">
                    <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gold/15 text-gold">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
                        <circle cx="11" cy="11" r="8" />
                        <path d="m21 21-4.35-4.35" />
                      </svg>
                    </span>
                    <p className="mt-4 text-xl font-bold text-plum">Form not found</p>
                    <p className="mt-2 text-sm text-stone-600">
                      The form you are looking for does not exist or the link is incorrect.
                    </p>
                  </div>
                </div>
              )}

              {form && !accepting && !missing && (
                <div className="rounded-[20px] bg-[#f2efe7] p-5 ring-1 ring-plum/10 sm:p-8">
                  <div className="rounded-[20px] bg-white/70 p-8 text-center ring-1 ring-plum/10">
                    <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gold/15 text-gold">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
                        <rect x="4" y="10" width="16" height="11" rx="2" />
                        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                      </svg>
                    </span>
                    <p className="mt-4 text-xl font-bold text-plum">
                      {notOpenYet ? 'Applications are not open yet' : 'This form is closed'}
                    </p>
                    <p className="mt-2 text-sm text-stone-600">
                      {notOpenYet
                        ? `Applications open on ${formatDateTime(form.openAt)}.`
                        : ended
                          ? `Applications closed on ${formatDateTime(form.closeAt)}.`
                          : 'This position is no longer accepting applications.'}
                    </p>
                  </div>
                </div>
              )}

              {form && accepting && (
                <div className="rounded-[20px] bg-[#f2efe7] p-5 ring-1 ring-plum/10 sm:p-8">
                  <p className="text-xl font-bold tracking-tight text-plum">{form.title}</p>
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
                        {form.fields?.length ?? 0} question{(form.fields?.length ?? 0) === 1 ? '' : 's'}
                      </span>
                    </div>
                    <div className="mt-4 space-y-3">
                      {sortByOrder(form.fields || []).map((field) => (
                        <FieldRow
                          key={field.id}
                          field={field}
                          value={answers[field.id]}
                          onChange={(val) => setAnswers((prev) => ({ ...prev, [field.id]: val }))}
                          showErrors={showErrors}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 rounded-[20px] bg-white/70 p-5 ring-1 ring-plum/10">
                    <p className="text-sm font-semibold text-stone-800">
                      Upload your CV <span className="text-red-500">*</span>
                    </p>
                    <p className="mt-1 text-xs text-stone-400">PDF only, max {CV_MAX_MB}MB</p>

                    {cvUploadState === 'idle' && (
                      <div
                        onDragOver={(e) => { e.preventDefault(); setCvDragging(true); }}
                        onDragLeave={() => setCvDragging(false)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setCvDragging(false);
                          const file = e.dataTransfer.files?.[0];
                          if (file) handleCvUpload(file);
                        }}
                        onClick={() => cvInputRef.current?.click()}
                        className={`mt-3 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-[16px] border-2 border-dashed py-8 transition ${
                          cvDragging ? 'border-plum bg-plum/5' : 'border-plum/20 bg-[#efede5] hover:border-plum/40'
                        }`}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-stone-400">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
                          <path d="M14 2v6h6" />
                        </svg>
                        <span className="text-sm font-medium text-stone-600">Click or drop your CV here</span>
                        <span className="text-xs text-stone-400">PDF, max {CV_MAX_MB}MB</span>
                        <input
                          ref={cvInputRef}
                          type="file"
                          accept={CV_ACCEPT}
                          className="hidden"
                          onChange={(e) => handleCvUpload(e.target.files?.[0])}
                        />
                      </div>
                    )}

                    {cvUploadState === 'uploading' && (
                      <div className="mt-3 flex items-center gap-3 rounded-[12px] bg-[#efede5] px-4 py-3">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 animate-pulse text-plum">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="17 8 12 3 7 8" />
                          <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-stone-800">{cvFile?.name}</p>
                          <p className="text-xs text-stone-400">Uploading...</p>
                        </div>
                      </div>
                    )}

                    {cvUploadState === 'done' && (
                      <div className="mt-3 flex items-center gap-3 rounded-[12px] bg-[#efede5] px-4 py-3">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-teal">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                          <polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-stone-800">{cvFile?.name}</p>
                          <p className="text-xs text-stone-400">{(cvFile?.size / 1024 / 1024).toFixed(1)}MB</p>
                        </div>
                        <button
                          type="button"
                          onClick={removeCv}
                          className="rounded-full p-1 text-stone-400 transition hover:bg-red-50 hover:text-red-500"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                      </div>
                    )}

                    {cvUploadState === 'error' && (
                      <div className="mt-3">
                        <div className="flex items-center gap-3 rounded-[12px] bg-red-50 px-4 py-3">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 shrink-0 text-red-500">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="15" y1="9" x2="9" y2="15" />
                            <line x1="9" y1="9" x2="15" y2="15" />
                          </svg>
                          <p className="min-w-0 flex-1 text-sm text-red-600">{cvError}</p>
                        </div>
                        <button
                          type="button"
                          onClick={removeCv}
                          className="mt-2 text-xs font-medium text-plum underline underline-offset-2 transition hover:text-plum-dark"
                        >
                          Try again
                        </button>
                      </div>
                    )}

                    {showErrors && !cvFileId && (
                      <p className="mt-2 text-[11px] font-semibold text-red-500">CV is required.</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="mt-6 w-full rounded-full bg-plum py-3 text-sm font-semibold text-white transition hover:bg-plum-dark disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-10"
                  >
                    {submitting ? 'Submitting...' : 'Submit'}
                  </button>
                </div>
              )}
            </form>
          )}
        </div>
      </main>
    </div>
  );
}

export default ApplyForm;