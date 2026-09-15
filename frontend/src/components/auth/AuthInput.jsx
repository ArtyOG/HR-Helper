import { useState } from 'react';

function EyeIcon({ off }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
      aria-hidden="true"
    >
      {off ? (
        <>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.73 5.08A10.4 10.4 0 0 1 12 5c7 0 10 7 10 7a13.2 13.2 0 0 1-1.67 2.68" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.61 6.61A13.5 13.5 0 0 0 2 12s3 7 10 7a9.7 9.7 0 0 0 5.39-1.61" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
        </>
      ) : (
        <>
          <path strokeLinecap="round" strokeLinejoin="round" d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
          <circle cx="12" cy="12" r="3" />
        </>
      )}
    </svg>
  );
}

export default function AuthInput({ label, type = 'text', id, required = true }) {
  const isPassword = type === 'password';
  const [showPassword, setShowPassword] = useState(false);
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : 'text';

  return (
    <div className="group relative w-full">
      <input
        id={id}
        type={inputType}
        required={required}
        placeholder=" "
        className={`peer w-full border-b-2 border-neutral-300 bg-transparent pb-1.5 pt-5 text-base text-neutral-900 outline-none transition-colors duration-300 ${
          isPassword ? 'pr-9' : ''
        }`}
      />
      <label
        htmlFor={id}
        className="pointer-events-none absolute left-0 top-5 text-base text-neutral-400 transition-all duration-300 ease-out group-hover:text-neutral-600 peer-focus:-translate-y-6 peer-focus:text-sm peer-focus:text-neutral-900 peer-[:not(:placeholder-shown)]:-translate-y-6 peer-[:not(:placeholder-shown)]:text-sm peer-[:not(:placeholder-shown)]:text-neutral-900"
      >
        {label}
      </label>
      <span className="absolute bottom-0 left-0 h-[2px] w-full scale-x-0 bg-neutral-900 transition-transform duration-300 ease-out group-hover:scale-x-100 peer-focus:scale-x-100 peer-[:not(:placeholder-shown)]:scale-x-100" />
      {isPassword && (
        <button
          type="button"
          onClick={() => setShowPassword((v) => !v)}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          className="absolute bottom-1 right-0 flex items-center text-neutral-500 transition hover:text-neutral-900"
        >
          <EyeIcon off={showPassword} />
        </button>
      )}
    </div>
  );
}
