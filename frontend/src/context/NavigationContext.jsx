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
      goToHR: () => navigate('/home'),
      goToWorkspace: () => navigate('/workspace/dashboard'),
      goToJobListings: () => navigate('/workspace/jobs'),
      goToLanding: () => navigate('/'),
      goToCreateForm: (template) => navigate('/workspace/forms/new', { state: { template } }),
      goToEditForm: (formId) => navigate(`/workspace/forms/${formId}/edit`),
      goToFormView: (formId) => navigate(`/workspace/forms/${formId}`),
      goToSubmissions: (formId) => navigate(`/workspace/forms/${formId}/submissions`),
      goToInterviews: (formId) => navigate(`/workspace/forms/${formId}/interviews`),
      goToCreateFormWs: (template) => navigate('/workspace/forms/new', { state: { template } }),
      goToEditFormWs: (formId) => navigate(`/workspace/forms/${formId}/edit`),
      goToFormViewWs: (formId) => navigate(`/workspace/forms/${formId}`),
      goToSubmissionsWs: (formId) => navigate(`/workspace/forms/${formId}/submissions`),
      goToInterviewsWs: (formId) => navigate(`/workspace/forms/${formId}/interviews`),
      goToEmailSequencesWs: (state) => navigate('/workspace/email-sequences', { state }),
      goToInterviewSlotsWs: () => navigate('/workspace/interview-slots'),
    }),
    [navigate, location]
  );

  return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>;
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}