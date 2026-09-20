import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { NavigationProvider } from './context/NavigationContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthModal from './components/auth/AuthModal';
import WorkspaceShell from './components/workspace/WorkspaceShell';
import PageLoader from './components/common/LoadingSpinner';
import { Toaster } from 'sonner';

// Lazy-loaded pages for granular route-level code splitting
const LandingPage = lazy(() => import('./pages/LandingPage'));
const HRPage = lazy(() => import('./pages/HRPage'));
const Authentication = lazy(() => import('./pages/Authentication'));
const User_Workspace = lazy(() => import('./pages/User_Workspace'));
const JobListingsPage = lazy(() => import('./pages/JobListings'));
const CreateForm = lazy(() => import('./pages/CreateForm'));
const EditForm = lazy(() => import('./pages/EditForm'));
const FormView = lazy(() => import('./pages/FormView'));
const ApplyForm = lazy(() => import('./pages/ApplyForm'));
const SlotBooking = lazy(() => import('./pages/SlotBooking'));
const SubmissionsView = lazy(() => import('./pages/SubmissionsView'));
const InterviewScheduling = lazy(() => import('./pages/InterviewScheduling'));
const CandidateSchedule = lazy(() => import('./pages/CandidateSchedule'));
const EmailSequences = lazy(() => import('./pages/EmailSequences'));
const InterviewSlots = lazy(() => import('./pages/InterviewSlots'));
const Billing = lazy(() => import('./pages/Billing'));

function RequireAuth({ children }) {
  const { user, loading, authError } = useAuth();

  if (loading) return <PageLoader full />;
  if (authError && !user) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="w-full max-w-md rounded-[20px] bg-white p-8 text-center ring-1 ring-plum/10">
          <p className="text-sm font-semibold text-red-600">Unable to verify your session.</p>
          <p className="mt-2 text-sm text-stone-500">{authError}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-4 inline-flex items-center justify-center rounded-xl bg-plum px-4 py-2 text-sm font-medium text-white transition hover:bg-plum/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function RootRoute() {
  const { user, loading } = useAuth();

  if (loading) return <PageLoader full />;
  if (user) return <Navigate to="/home" replace />;
  return <LandingPage />;
}

function RedirectToWorkspaceForm() {
  const { pathname } = useLocation();
  const suffix = pathname.replace(/^\/hr\/forms/, '');
  return <Navigate to={`/workspace/forms${suffix}`} replace />;
}

function App() {
  const location = useLocation();
  const background = location.state && location.state.background;

  return (
    <AuthProvider>
      <NavigationProvider>
        <Suspense fallback={<PageLoader full />}>
          <Routes location={background || location}>
            <Route path="/" element={<RootRoute />} />
            <Route path="/login" element={<Authentication />} />
            <Route path="/apply/:formId" element={<ApplyForm />} />
            <Route path="/schedule/:formId/:submissionId" element={<CandidateSchedule />} />
            <Route
              path="/home"
              element={
                <RequireAuth>
                  <HRPage />
                </RequireAuth>
              }
            />
            <Route path="/hr" element={<Navigate to="/home" replace />} />
            <Route path="/hr/forms/*" element={<RedirectToWorkspaceForm />} />
            <Route
              path="/hr/forms/:formId/interviews"
              element={
                <RequireAuth>
                  <InterviewScheduling />
                </RequireAuth>
              }
            />

            <Route
              path="/workspace"
              element={
                <RequireAuth>
                  <WorkspaceShell />
                </RequireAuth>
              }
            >
              <Route index element={<Navigate to="/workspace/dashboard" replace />} />
              <Route path="dashboard" element={<User_Workspace />} />
              <Route path="jobs" element={<JobListingsPage />} />
              <Route path="email-sequences" element={<EmailSequences />} />
              <Route path="interview-slots" element={<InterviewSlots />} />
              <Route path="billing" element={<Billing />} />
              <Route path="forms/new" element={<CreateForm />} />
              <Route path="forms/:formId/edit" element={<EditForm />} />
              <Route path="forms/:formId" element={<FormView />} />
              <Route path="forms/:formId/submissions" element={<SubmissionsView />} />
              <Route path="forms/:formId/interviews" element={<InterviewScheduling />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
        {background && (
          <Routes>
            <Route path="/login" element={<AuthModal />} />
          </Routes>
        )}
        <Toaster position="bottom-right" richColors closeButton />
      </NavigationProvider>
    </AuthProvider>
  );
}

export default App;