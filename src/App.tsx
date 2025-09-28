import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { MessageProvider } from './contexts/MessageContext';
import LoginPage from './pages/LoginPage';
import PatientDashboard from './components/Patient/PatientDashboard';
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

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  if (user?.role === 'Patient') {
    return <PatientDashboard />;
  }

  if (user?.role === 'Doctor') {
    return <DoctorDashboard />;
  }

  // If user doesn't have a role, redirect to login to set one
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
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/doctor" element={<DoctorDashboard />} />
        <Route path="/patient" element={<PatientDashboard />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
};

function App() {
  return (
    <AuthProvider>
      <MessageProvider>
        <AppContent />
      </MessageProvider>
    </AuthProvider>
  );
}

export default App;