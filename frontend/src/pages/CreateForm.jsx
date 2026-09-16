import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useFormsBackNav } from '../hooks/useFormsBackNav';
import FormBuilder from '../components/form-builder/FormBuilder';

function CreateForm() {
  const backTo = useFormsBackNav();
  const location = useLocation();
  const template = location.state?.template === 'standard' ? 'standard' : 'blank';

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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

          <FormBuilder template={template} />
        </div>
      </main>
    </div>
  );
}

export default CreateForm;