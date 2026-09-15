import { useState } from 'react';
import { useNavigation } from '../../context/NavigationContext';
import ConfirmModal from '../common/ConfirmModal';

function ViewCta() {
  const { goToWorkspace } = useNavigation();
  const [hovered, setHovered] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <section id="view" className="bg-[#fffef9] pb-24 lg:pb-32">
      <div className="mx-auto max-w-site px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-10 rounded-[2.5rem] bg-plum-dark px-8 py-12 shadow-2xl shadow-plum/30 sm:px-12 lg:flex-row lg:items-center lg:py-16">
          <div className="max-w-xl">
            <h2 className="font-sans text-3xl font-bold tracking-tight text-[#f2f0e8] sm:text-4xl">
              Ready to see who applied?
            </h2>
            <p className="mt-5 text-justify text-base leading-relaxed text-[#f2f0e8]/85">
              Once candidates start applying, their ranked profiles <br /> 
              show up on View Application &mdash; 
              screening summaries included.
            </p>
          </div>
          <div className="shrink-0">
            <a
              href="#top"
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
              onClick={(e) => {
                e.preventDefault();
                setShowConfirm(true);
              }}
              className={`inline-flex items-center rounded-[20px] px-8 py-4 text-base font-semibold text-plum transition-colors duration-200 ${
                hovered ? 'border border-transparent' : 'border border-black'
              } bg-[#f2f0e8]`}
            >
              <span
                className={`transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  hovered ? '-translate-x-2' : 'translate-x-2'
                }`}
              >
                View Dashboard
              </span>
              <span
                aria-hidden="true"
                className={`ml-1 inline-flex h-4 w-4 shrink-0 items-center justify-center transition-opacity duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  hovered ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 5l7 7-7 7" />
                </svg>
              </span>
            </a>
          </div>
        </div>
      </div>

      <ConfirmModal
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={() => {
          setShowConfirm(false);
          goToWorkspace();
        }}
        title="Enter Workspace"
        message="This is linked to Workspace, would you like to to enter?"
        confirmLabel="Yes, enter"
      />
    </section>
  );
}

export default ViewCta;
