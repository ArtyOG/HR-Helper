import { useNavigation } from '../../context/NavigationContext';
import AuthInput from './AuthInput';
import GoogleButton from './GoogleButton';

function SignUp({ onSwitch }) {
  const { goToHR } = useNavigation();

  return (
    <div className="flex w-full max-w-md flex-col">
      <h1 className="font-sans text-4xl font-bold tracking-tight text-plum">Create your account</h1>
      <p className="mt-2 text-base text-stone-600">Set up <span className="text-[#CC9a1C]">HiORing</span> in a couple minutes</p>

      <div className="mt-6">
        <GoogleButton label="Sign up with Google" />
      </div>

      <div className="my-6 flex items-center gap-4">
        <span className="h-px flex-1 bg-stone-200" />
        <span className="text-xs font-medium text-stone-400">or</span>
        <span className="h-px flex-1 bg-stone-200" />
      </div>

      <form
        className="mt-8 space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          goToHR();
        }}
      >
        <div className="grid grid-cols-2 gap-4">
          <AuthInput label="First name" id="first-name" />
          <AuthInput label="Last name" id="last-name" />
        </div>
        <AuthInput label="Company name" id="company-name" />
        <AuthInput label="Email address" type="email" id="email" />
        <AuthInput label="Password" type="password" id="password" />

        <label className="flex items-center gap-1.5 whitespace-nowrap text-xs text-stone-700 sm:text-[13px]">
          <input type="checkbox" className="h-4 w-4 shrink-0 rounded accent-plum" />
          <span>I agree to the</span>
          <span className="text-[#3A5A40] font-bold">Terms of Service</span>
          <span>and</span>
          <span className="text-[#3A5A40] font-bold">Privacy Policy</span>
        </label>

        <button
          type="submit"
          className="w-full rounded-[20px] bg-plum py-4 font-sans text-base font-semibold text-white transition hover:bg-plum-dark"
        >
          Create Account
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-stone-600">
        Already have an account?{' '}
        <button
          type="button"
          onClick={onSwitch}
          className="font-semibold text-[#CC9a1C] hover:underline"
        >
          Log In
        </button>
      </p>
    </div>
  );
}

export default SignUp;
