import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import AuthPanel from './AuthPanel';
import GoogleButton from './GoogleButton';

function AuthContent({ onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const mode = params.get('mode') === 'signup' ? 'signup' : 'login';

  return (
    <div className="relative flex max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-3xl bg-[#fffdf8] shadow-2xl lg:rounded-[2.5rem]">
      <AuthPanel />

      <div className="relative flex flex-1 overflow-y-auto px-5 py-10 sm:px-8 lg:px-16 lg:py-12">
        <button
          onClick={onClose || (() => navigate('/'))}
          aria-label="Back to home"
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-[#d9d9d9] text-stone-600 transition hover:bg-plum hover:text-white"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
            <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>

        <div className="m-auto w-full max-w-md">
          <h1 className="font-sans text-3xl font-bold tracking-tight text-plum sm:text-4xl">
            {mode === 'login' ? 'Login your account' : 'Create your account'}
          </h1>
          <p className="mt-2 text-base text-stone-600">
            Set up <span className="text-[#CC9a1C]">HiORing</span> in a couple minutes
          </p>

          <p className="mt-6 text-sm text-stone-500">
            {mode === 'login'
              ? 'You can login to your account with your Google account.'
              : 'Sign up today with your Google account.'}
          </p>

          <div className="mt-4">
            <GoogleButton
              label={mode === 'login' ? 'Continue with Google' : 'Sign up with Google'}
            />
          </div>

          <p className="mt-10 border-t border-stone-100 pt-6 text-center text-sm text-stone-600">
            {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              type="button"
              onClick={() => navigate(mode === 'login' ? '/login?mode=signup' : '/login', { state: location.state })}
              className="font-semibold text-[#CC9a1C] hover:underline"
            >
              {mode === 'login' ? 'Create one' : 'Log In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default AuthContent;
