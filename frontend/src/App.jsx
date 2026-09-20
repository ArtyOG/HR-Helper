import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import HRPage from './pages/HRPage';
import Authentication from './pages/Authentication';
import AuthModal from './components/auth/AuthModal';
import { NavigationProvider } from './context/NavigationContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import User_Workspace from './pages/User_Workspace';
import JobListingsPage from './pages/JobListings';
import CreateForm from './pages/CreateForm';
import EditForm from './pages/EditForm';
import FormView from './pages/FormView';
import ApplyForm from './pages/ApplyForm';
import SubmissionsView from './pages/SubmissionsView';
import InterviewScheduling from './pages/InterviewScheduling';
import WorkspaceShell from './components/workspace/WorkspaceShell';
import CandidateSchedule from './pages/CandidateSchedule';
import { Toaster } from 'sonner';


// Live hot-reload verified with polling
function RequireAuth({ children }) {
  const { user, loading, authError } = useAuth();

  if (loading) return null;
  if (authError && !user) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="w-full max-w-md rounded-[20px] bg-white p-8 text-center ring-1 ring-plum/10">
          <p className="text-sm font-semibold text-red-600">Unable to verify your session.</p>
          <p className="mt-2 text-sm text-stone-500">{authError}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-5 rounded-full bg-plum px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-plum-dark"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function App() {

  const location = useLocation();
  const background = location.state && location.state.background;

  return (
    <AuthProvider>
      <NavigationProvider>
        <Routes location={background || location}>
          <Route path="/" element={<LandingPage />} />
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
          <Route
            path="/hr"
            element={
              <RequireAuth>
                <HRPage />
              </RequireAuth>
            }
          />
          <Route
            path="/hr/forms/new"
            element={
              <RequireAuth>
                <CreateForm />
              </RequireAuth>
            }
          />
          <Route
            path="/hr/forms/:formId/edit"
            element={
              <RequireAuth>
                <EditForm />
              </RequireAuth>
            }
          />
          <Route
            path="/hr/forms/:formId"
            element={
              <RequireAuth>
                <FormView />
              </RequireAuth>
            }
          />
          <Route
            path="/hr/forms/:formId/submissions"
            element={
              <RequireAuth>
                <SubmissionsView />
              </RequireAuth>
            }
          />
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
                <User_Workspace />
              </RequireAuth>
            }
          />
          <Route
            path="/workspace/jobs"
            element={
              <RequireAuth>
                <JobListingsPage />
              </RequireAuth>
            }
          />



          <Route

            path="/workspace/forms/new"
            element={
              <RequireAuth>
                <WorkspaceShell>
                  <CreateForm />
                </WorkspaceShell>
              </RequireAuth>
            }
          />
          <Route
            path="/workspace/forms/:formId/edit"
            element={
              <RequireAuth>
                <WorkspaceShell>
                  <EditForm />
                </WorkspaceShell>
              </RequireAuth>
            }
          />
          <Route
            path="/workspace/forms/:formId"
            element={
              <RequireAuth>
                <WorkspaceShell>
                  <FormView />
                </WorkspaceShell>
              </RequireAuth>
            }
          />
          <Route
            path="/workspace/forms/:formId/submissions"
            element={
              <RequireAuth>
                <WorkspaceShell>
                  <SubmissionsView />
                </WorkspaceShell>
              </RequireAuth>
            }
          />
          <Route
            path="/workspace/forms/:formId/interviews"
            element={
              <RequireAuth>
                <WorkspaceShell>
                  <InterviewScheduling />
                </WorkspaceShell>
              </RequireAuth>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
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