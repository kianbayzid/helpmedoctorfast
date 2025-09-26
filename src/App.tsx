import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { MessageProvider } from './contexts/MessageContext';
import PortalSelection from './components/Auth/PortalSelection';
import LoginForm from './components/Auth/LoginForm';
import RegisterForm from './components/Auth/RegisterForm';
import PatientDashboard from './components/Patient/PatientDashboard';
import DoctorDashboard from './components/Doctor/DoctorDashboard';

const AppContent: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [selectedPortal, setSelectedPortal] = useState<'patient' | 'doctor' | null>(null);
  const [showRegister, setShowRegister] = useState(false);

  if (!isAuthenticated) {
    if (!selectedPortal) {
      return <PortalSelection onSelectPortal={setSelectedPortal} />;
    }
    
    if (showRegister) {
      return (
        <RegisterForm 
          role={selectedPortal} 
          onBack={() => setSelectedPortal(null)}
          onSwitchToLogin={() => setShowRegister(false)}
        />
      );
    }
    
    return (
      <LoginForm 
        role={selectedPortal} 
        onBack={() => setSelectedPortal(null)} 
        onSwitchToRegister={() => setShowRegister(true)}
      />
    );
  }

  if (user?.role === 'patient') {
    return <PatientDashboard />;
  }

  if (user?.role === 'doctor') {
    return <DoctorDashboard />;
  }

  return null;
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