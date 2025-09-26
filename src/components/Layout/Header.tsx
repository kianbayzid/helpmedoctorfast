import React from 'react';
import { LogOut, Stethoscope } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Header: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Stethoscope className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-xl font-semibold text-gray-900">
              MedConnect Portal
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">
                {user?.role} {user?.specialization && `• ${user.specialization}`}
              </p>
            </div>
            
            <button
              onClick={logout}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors duration-200"
            >
              <LogOut className="h-4 w-4 mr-1" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;