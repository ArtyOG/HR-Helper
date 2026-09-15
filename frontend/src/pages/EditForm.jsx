import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigation } from '../context/NavigationContext';
import { useFormsBackNav } from '../hooks/useFormsBackNav';
import { getForm, copyForm } from '../services/api';
import FormBuilder from '../components/form-builder/FormBuilder';

function EditForm() {
  const { formId } = useParams();
  const { goToEditForm } = useNavigation();
  const backTo = useFormsBackNav();
  const [form, setForm] = useState(null);
  const [error, setError] = useState(null);
  const [copying, setCopying] = useState(false);
  const [copyError, setCopyError] = useState(null);

  useEffect(() => {
    if (!formId) return;
    setCopyError(null);
    getForm(formId)
      .then((data) => setForm(data))
      .catch((err) => setError(err.message || 'Failed to load the form.'));
  }, [formId]);

  const locked = form && (form.submissionCount ?? 0) > 0;

  const handleDuplicate = async () => {
    if (!formId || copying) return;
    setCopying(true);
    setCopyError(null);
    try {
      const copied = await copyForm(formId);
      goToEditForm(copied.id);
    } catch (err) {
      setCopyError(err.message || 'Failed to copy the form.');
    } finally {
      setCopying(false);
    }
  };

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
        </div>
      </header>

      <main className="flex-grow">
        <div className="mx-auto w-full max-w-6xl px-5 py-8 lg:px-8">
          <button
            type="button"
            onClick={backTo}
            className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-stone-500 transition hover:text-plum"
          >
            <span aria-hidden="true">&larr;</span> All hiring form
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

          {form && !locked && <FormBuilder initialForm={form} />}

          {form && locked && (
            <div className="rounded-[20px] bg-white/70 px-6 py-10 text-center ring-1 ring-plum/10">
              <p className="text-xl font-bold text-plum">This form is locked for editing</p>
              <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-stone-500">
                <span className="font-semibold text-stone-700">{form.title}</span> has received{' '}
                {form.submissionCount} submission{form.submissionCount === 1 ? '' : 's'}. Forms with
                submissions can't be edited — duplicate it to reuse the template and republish.
              </p>
              {copyError && <p className="mt-3 text-sm font-semibold text-red-600">{copyError}</p>}
              <div className="mt-6 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={backTo}
                  className="rounded-full bg-plum px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-plum-dark"
                >
                  Back to dashboard
                </button>
                <button
                  type="button"
                  onClick={handleDuplicate}
                  disabled={copying}
                  className="rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-plum transition hover:opacity-90 disabled:opacity-50"
                >
                  {copying ? 'Duplicating...' : 'Duplicate this form'}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default EditForm;