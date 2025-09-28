import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { MessageProvider } from './contexts/MessageContext';
import LoginPage from './pages/LoginPage';
import NoRolePage from './pages/NoRolePage';
//import PatientDashboard from './components/Patient/PatientDashboard';
import DoctorDashboard from './components/Doctor/DoctorDashboard';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const { isLoading: auth0Loading } = useAuth0();

  if (isLoading || auth0Loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const DoctorProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading, hasRolePermission, user } = useAuth();
  const { isLoading: auth0Loading } = useAuth0();

  console.log('DoctorProtectedRoute: State check', {
    isLoading,
    auth0Loading,
    isAuthenticated,
    hasUser: !!user,
    userRole: user?.role
  });

  if (isLoading || auth0Loading) {
    console.log('DoctorProtectedRoute: Still loading...');
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('DoctorProtectedRoute: Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // Wait for user data to load
  if (!user) {
    console.log('DoctorProtectedRoute: No user data yet, showing loading...');
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user data...</p>
        </div>
      </div>
    );
  }

  const hasDoctorPermission = hasRolePermission('Doctor');
  console.log('DoctorProtectedRoute: Permission check', {
    userRole: user?.role,
    hasDoctorPermission,
    user: user
  });

  if (!hasDoctorPermission) {
    console.log('DoctorProtectedRoute: No doctor permission, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  console.log('DoctorProtectedRoute: Access granted, showing DoctorDashboard');
  return <>{children}</>;
};

/*
const PatientProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading, hasRolePermission, user } = useAuth();
  const { isLoading: auth0Loading } = useAuth0();

  if (isLoading || auth0Loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user data...</p>
        </div>
      </div>
    );
  }

  const hasPatientPermission = hasRolePermission('Patient');

  if (!hasPatientPermission) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
*/
const Dashboard: React.FC = () => {
  const { user, isLoading } = useAuth();

  // Show loading while user data is being fetched
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  /*
  if (user?.role === 'Patient') {
    console.log('Dashboard: Showing PatientDashboard for user:', user.role);
    return <PatientDashboard />;
  }
  */

  // Always show DoctorDashboard now (Patient portal removed)
  if (user?.role === 'Doctor') {
    console.log('Dashboard: Showing DoctorDashboard for user:', user.role);
    return <DoctorDashboard />;
  }

  // If user doesn't have doctor role, redirect to login to set one
  console.log('Dashboard: User does not have Doctor role, redirecting to login. User:', user);
  return <Navigate to="/login" replace />;
};

const AppContent: React.FC = () => {
  const { isLoading, error } = useAuth0();

  // Handle Auth0 loading and error states
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    console.error('Auth0 Error:', error);
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center max-w-lg">
          <p className="text-red-600 mb-4">Authentication error: {error.message}</p>
          <details className="mb-4 text-left">
            <summary className="cursor-pointer text-sm text-gray-600">Show Details</summary>
            <pre className="text-xs mt-2 p-2 bg-gray-100 rounded overflow-auto">
              {JSON.stringify(error, null, 2)}
            </pre>
          </details>
          <button
            onClick={() => {
              // Clear any stored auth state and redirect
              sessionStorage.clear();
              localStorage.clear();
              window.location.href = '/login';
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/debug" element={<NoRolePage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor"
          element={
            <DoctorProtectedRoute>
              <DoctorDashboard />
            </DoctorProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
};

/* 
        <Route
          path="/patient"
          element={
            <PatientProtectedRoute>
              <PatientDashboard />
            </PatientProtectedRoute>
          }
        />
*/

function App() {
  return (
    <AuthProvider>
      <MessageProvider>
        <AppContent />
      </MessageProvider>
    </AuthProvider>
  );
};

export default App;
