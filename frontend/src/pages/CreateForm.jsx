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
    <div>
      <button
        type="button"
        onClick={backTo}
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-stone-500 transition hover:text-plum"
      >
        <span aria-hidden="true">&larr;</span> All hiring form
      </button>

      <FormBuilder template={template} />
    </div>
  );
}

export default CreateForm;