import { createContext, useContext, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const NavigationContext = createContext(null);

export function NavigationProvider({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const value = useMemo(
    () => ({
      goToLogin: () => navigate('/login', { state: { background: location } }),
      goToSignup: () => navigate('/login?mode=signup', { state: { background: location } }),
      closeAuth: () => navigate('/'),
      goToHR: () => navigate('/hr'),
      goToWorkspace: () => navigate('/workspace'),
      goToJobListings: () => navigate('/workspace/jobs'),
      goToLanding: () => navigate('/'),
      goToCreateForm: (template) => navigate('/hr/forms/new', { state: { template } }),
      goToEditForm: (formId) => navigate(`/hr/forms/${formId}/edit`),
      goToFormView: (formId) => navigate(`/hr/forms/${formId}`),
      goToSubmissions: (formId) => navigate(`/hr/forms/${formId}/submissions`),
      goToCreateFormWs: (template) => navigate('/workspace/forms/new', { state: { template } }),
      goToEditFormWs: (formId) => navigate(`/workspace/forms/${formId}/edit`),
      goToFormViewWs: (formId) => navigate(`/workspace/forms/${formId}`),
      goToSubmissionsWs: (formId) => navigate(`/workspace/forms/${formId}/submissions`),
    }),
    [navigate, location]
  );

  return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>;
}

export function useNavigation() {
  return useContext(NavigationContext);
}