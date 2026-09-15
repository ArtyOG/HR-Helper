import { useNavigation } from '../../context/NavigationContext';
import AuthInput from './AuthInput';
import GoogleButton from './GoogleButton';

function Login({ onSwitch }) {
  const { goToHR } = useNavigation();

  return (
    <div className="flex w-full max-w-md flex-col">
      <h1 className="font-sans text-3xl font-bold tracking-tight text-plum sm:text-4xl">
        Login your account
      </h1>
      <p className="mt-2 text-base text-stone-600">Set up <span className="text-[#CC9A1C]">HiORing</span> in a couple minutes</p>

      <div className="mt-6">
        <GoogleButton />
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
        <AuthInput label="Email address" type="email" id="email" />

        <AuthInput label="Password" type="password" id="password" />

        <div className="flex items-center justify-between pt-2 text-xs">
          <a href="#forgot" className="font-semibold text-[#f90808] hover:underline">
            Forgot password?
          </a>
        </div>


        <button
          type="submit"
          className="w-full rounded-[20px] bg-plum py-4 font-sans text-base font-semibold text-white transition hover:bg-plum-dark"
        >
          Login
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-stone-600">
        Already have an account?{' '}
        <button
          type="button"
          onClick={onSwitch}
          className="font-semibold text-[#CC9a1C] hover:underline"
        >
          Sign Up
        </button>
      </p>
    </div>
  );
}

export default Login;
