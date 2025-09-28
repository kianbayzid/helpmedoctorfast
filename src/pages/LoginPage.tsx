import React, { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Lock, Heart, Stethoscope, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const LoginPage: React.FC = () => {
  const { isLoading: auth0Loading } = useAuth0();
  const { login } = useAuth();
  const [selectedRole, setSelectedRole] = useState<'Patient' | 'Doctor' | null>(null);

  const handleLogin = async (role: 'Patient' | 'Doctor') => {
    await login(role);
  };

  const handleBackToSelection = () => {
    setSelectedRole(null);
  };

  if (selectedRole) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <button
              onClick={handleBackToSelection}
              className="text-blue-600 hover:text-blue-500 font-medium text-sm mb-6 flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Portal Selection
            </button>

            <div className="text-center">
              <div className="mx-auto h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                {selectedRole === 'Doctor' ? (
                  <Stethoscope className="h-8 w-8 text-blue-600" />
                ) : (
                  <Heart className="h-8 w-8 text-blue-600" />
                )}
              </div>
              <h2 className="text-3xl font-bold text-gray-900">
                {selectedRole === 'Doctor' ? 'Doctor' : 'Patient'} Login
              </h2>
              <p className="mt-2 text-gray-600">
                Secure authentication powered by Auth0
              </p>
            </div>
          </div>

          <div className="bg-white py-8 px-6 shadow-lg rounded-lg">
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-4">
                  Click below to securely sign in with Auth0
                </p>
                <button
                  onClick={() => handleLogin(selectedRole)}
                  disabled={auth0Loading}
                  className="group relative w-full flex justify-center items-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  <Lock className="h-5 w-5 mr-2" />
                  {auth0Loading ? 'Redirecting...' : 'Sign In with Auth0'}
                </button>
              </div>

              <div className="text-center">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Benefits of Auth0</span>
                  </div>
                </div>

                <div className="mt-4 text-xs text-gray-500 space-y-1">
                  <p>• Enterprise-grade security</p>
                  <p>• Single Sign-On (SSO) support</p>
                  <p>• Multi-factor authentication</p>
                  <p>• Social login options</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            HelpMeDoctorFast
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Choose your portal to get started
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Patient Portal */}
          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
            <div className="text-center">
              <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Heart className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Patient Portal</h3>
              <p className="text-gray-600 mb-6">
                Access your medical information, communicate with doctors, and manage your healthcare.
              </p>
              <button
                onClick={() => setSelectedRole('Patient')}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium"
              >
                Continue as Patient
              </button>
            </div>
          </div>

          {/* Doctor Portal */}
          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
            <div className="text-center">
              <div className="mx-auto h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Stethoscope className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Doctor Portal</h3>
              <p className="text-gray-600 mb-6">
                Manage patient communications, review cases, and provide medical consultations.
              </p>
              <button
                onClick={() => setSelectedRole('Doctor')}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
              >
                Continue as Doctor
              </button>
            </div>
          </div>
        </div>

        <div className="text-center text-sm text-gray-500">
          <p>Secure authentication powered by Auth0</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
