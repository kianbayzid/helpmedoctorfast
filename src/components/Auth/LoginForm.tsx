import React, { useState } from 'react';
import { User, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface LoginFormProps {
  isPatient: boolean;
  isDoctor: boolean;
  onBack: () => void;
  onSwitchToRegister: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ isPatient, isDoctor, onBack, onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(isDoctor ? 'Doctor' : 'Patient');
    } catch (error) {
      setError('Authentication failed. Please try again.');
      setIsLoading(false);
    }
  };

  // Demo credentials helper
  const fillDemoCredentials = () => {
    if (isDoctor) {
      setEmail('sarah.johnson@medicalcenter.com');
      setPassword('demo123');
    } else if (isPatient){
      setEmail('john.smith@email.com');
      setPassword('demo123');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <button
            onClick={onBack}
            className="text-blue-600 hover:text-blue-500 font-medium text-sm mb-6"
          >
            ← Back to Portal Selection
          </button>
          
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              {isDoctor ? 'Doctor' : 'Patient'} Login
            </h2>
            <p className="mt-2 text-gray-600">
              Access your secure portal
            </p>
          </div>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400 mr-3" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1 relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 pl-10 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your email"
                />
                <User className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 pl-10 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your password"
                />
                <Lock className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={fillDemoCredentials}
              className="text-sm text-blue-600 hover:text-blue-500 underline"
            >
              Fill demo credentials
            </button>
            <span className="mx-2 text-gray-400">•</span>
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="text-sm text-blue-600 hover:text-blue-500 underline"
            >
              Create new account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;