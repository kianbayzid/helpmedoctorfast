// src/App.tsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { MessageProvider } from "./contexts/MessageContext";
import PortalSelection from "./components/Auth/PortalSelection";
import LoginForm from "./components/Auth/LoginForm";
import RegisterForm from "./components/Auth/RegisterForm";
import DoctorDashboard from "./components/Doctor/DoctorDashboard";

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

function App() {
  return (
    <AuthProvider>
      <MessageProvider>
        <Router>
          <Routes>
            <Route path="/" element={<PortalSelection />} />
            <Route path="/login" element={<LoginForm onBack={() => {}} onSwitchToRegister={() => {}} />} />
            <Route path="/register" element={<RegisterForm role="doctor" onBack={() => {}} onSwitchToLogin={() => {}} />} />
            <Route
              path="/doctor"
              element={
                <ProtectedRoute>
                  <DoctorDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </MessageProvider>
    </AuthProvider>
  );
}

export default App;