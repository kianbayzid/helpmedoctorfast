import React from 'react';
import { Users, Stethoscope, ArrowRight } from 'lucide-react';

interface PortalSelectionProps {
  onSelectPortal: (portal: 'patient' | 'doctor') => void;
}

const PortalSelection: React.FC<PortalSelectionProps> = ({ onSelectPortal }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <Stethoscope className="h-16 w-16 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            MedConnect Portal
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Secure communication platform connecting patients and healthcare providers. 
            Choose your portal below to get started.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Patient Portal */}
          <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 border border-gray-100">
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Patient Portal
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Access your health records, communicate with your healthcare team, 
                and manage your medical information securely.
              </p>
              <ul className="text-left space-y-3 mb-8 text-gray-600">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  Send messages to your doctors
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  View message history
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  Secure patient information
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  Priority messaging system
                </li>
              </ul>
              <button
                onClick={() => onSelectPortal('patient')}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
              >
                Access Patient Portal
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
              <p className="text-center text-sm text-gray-500 mt-3">
                New patient? You can create an account after selecting this portal.
              </p>
            </div>
          </div>

          {/* Doctor Portal */}
          <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 border border-gray-100">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Stethoscope className="h-8 w-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Doctor Portal
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Manage patient communications, organize messages by category, 
                and streamline your healthcare workflow efficiently.
              </p>
              <ul className="text-left space-y-3 mb-8 text-gray-600">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  Categorize patient messages
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  Thread-based conversations
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  Custom workflow management
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  Priority patient notifications
                </li>
              </ul>
              <button
                onClick={() => onSelectPortal('doctor')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
              >
                Access Doctor Portal
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
              <p className="text-center text-sm text-gray-500 mt-3">
                New doctor? You can create an account after selecting this portal.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center mt-16">
          <div className="bg-white rounded-lg p-6 inline-block shadow-lg">
            <p className="text-sm text-gray-600 mb-2">Need help accessing your portal?</p>
            <p className="text-sm font-medium text-blue-600">Contact Support: (555) 123-4567</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortalSelection;