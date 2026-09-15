import { useLocation, useNavigate } from 'react-router-dom';
import AuthContent from './AuthContent';

function AuthModal() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const close = () => navigate(state && state.background ? state.background : -1);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={close}
      />
      <AuthContent onClose={close} />
    </div>
  );
}

export default AuthModal;
