import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useAuth } from '../contexts/AuthContext';
import { AlertTriangle, RefreshCw, LogOut, User } from 'lucide-react';

const NoRolePage: React.FC = () => {
  const { user: auth0User, isAuthenticated, isLoading, logout } = useAuth0();
  const { user, login } = useAuth();

  const handleRoleSelection = async (role: 'Patient' | 'Doctor') => {
    // Store the role and try to re-authenticate
    sessionStorage.setItem('selectedRole', role);
    await login(role);
  };

  const addRolePermission = (role: 'Patient' | 'Doctor') => {
    if (!user) {
      alert('No user loaded - cannot add role permission');
      return;
    }

    // Check if user already has this role
    if (user.role === role) {
      alert(`User already has ${role} permissions`);
      return;
    }

    // Handle dual role scenario
    if (user.role && user.role !== role) {
      const confirmDualRole = window.confirm(
        `User currently has ${user.role} permissions. Adding ${role} permissions will create a dual-role user.\n\n` +
        `This means:\n` +
        `• User can access both /doctor and /patient routes\n` +
        `• User will have combined permissions\n` +
        `• This might cause confusion in the UI\n\n` +
        `Do you want to proceed?`
      );

      if (!confirmDualRole) {
        return;
      }

      // Create dual role indicator
      const dualRole = `${user.role}+${role}` as any;

      // Store the dual role temporarily
      const dualRoleData = {
        primaryRole: user.role,
        secondaryRole: role,
        isDualRole: true,
        timestamp: Date.now()
      };

      localStorage.setItem('dualRoleData', JSON.stringify(dualRoleData));
      sessionStorage.setItem('selectedRole', dualRole);

      alert(`Dual role assigned: ${user.role} + ${role}\n\nNote: The app will prioritize ${user.role} for dashboard routing, but user can access both portals directly.`);
    } else {
      // Simple role assignment
      sessionStorage.setItem('selectedRole', role);

      const roleData = {
        role: role,
        timestamp: Date.now(),
        userId: user.id,
        manuallyAssigned: true
      };

      localStorage.setItem('pendingUserRole', JSON.stringify(roleData));
      alert(`${role} permissions added! Refresh the page to see changes.`);
    }
  };

  const handleLogout = () => {
    logout({ logoutParams: { returnTo: window.location.origin } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="h-8 w-8 text-orange-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Role Assignment Needed
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Debug information for authentication and role assignment
          </p>
        </div>

        {/* Debug Information */}
        <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Debug Information</h2>

          <div className="grid gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Auth0 Status</h3>
              <div className="text-sm space-y-1">
                <p><span className="font-medium">Is Authenticated:</span> {isAuthenticated ? '✅ Yes' : '❌ No'}</p>
                <p><span className="font-medium">Is Loading:</span> {isLoading ? '⏳ Yes' : '✅ No'}</p>
                <p><span className="font-medium">Auth0 User ID:</span> {auth0User?.sub || '❌ None'}</p>
                <p><span className="font-medium">Auth0 Email:</span> {auth0User?.email || '❌ None'}</p>
                <p><span className="font-medium">Auth0 Name:</span> {auth0User?.name || '❌ None'}</p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">App User Status</h3>
              <div className="text-sm space-y-1">
                <p><span className="font-medium">App User:</span> {user ? '✅ Loaded' : '❌ Not loaded'}</p>
                <p><span className="font-medium">User Role:</span> {user?.role || '❌ No role assigned'}</p>
                <p><span className="font-medium">User Name:</span> {user?.name || '❌ None'}</p>
                <p><span className="font-medium">User Email:</span> {user?.email || '❌ None'}</p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Storage Status</h3>
              <div className="text-sm space-y-1">
                <p><span className="font-medium">Session Role:</span> {sessionStorage.getItem('selectedRole') || '❌ None'}</p>
                <p><span className="font-medium">Pending Role:</span> {
                  (() => {
                    const pendingData = localStorage.getItem('pendingUserRole');
                    if (pendingData) {
                      try {
                        const parsed = JSON.parse(pendingData);
                        return `✅ ${parsed.role} (${new Date(parsed.timestamp).toLocaleTimeString()})`;
                      } catch {
                        return '❌ Invalid data';
                      }
                    }
                    return '❌ None';
                  })()
                }</p>
                <p><span className="font-medium">Dual Role:</span> {
                  (() => {
                    const dualRoleData = localStorage.getItem('dualRoleData');
                    if (dualRoleData) {
                      try {
                        const parsed = JSON.parse(dualRoleData);
                        return `✅ ${parsed.primaryRole} + ${parsed.secondaryRole}`;
                      } catch {
                        return '❌ Invalid data';
                      }
                    }
                    return '❌ None';
                  })()
                }</p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Auth0 User Object (Full)</h3>
              <details className="text-xs">
                <summary className="cursor-pointer font-medium mb-2">Click to expand Auth0 user data</summary>
                <pre className="bg-white p-2 rounded border overflow-auto max-h-40">
                  {JSON.stringify(auth0User, null, 2)}
                </pre>
              </details>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Actions</h2>

          {/* Re-authentication Section */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Re-authentication (Full Login)</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <button
                onClick={() => handleRoleSelection('Doctor')}
                className="flex items-center justify-center py-3 px-4 border border-blue-300 text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200"
              >
                <User className="h-5 w-5 mr-2" />
                Re-authenticate as Doctor
              </button>

              <button
                onClick={() => handleRoleSelection('Patient')}
                className="flex items-center justify-center py-3 px-4 border border-green-300 text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition-colors duration-200"
              >
                <User className="h-5 w-5 mr-2" />
                Re-authenticate as Patient
              </button>
            </div>
          </div>

          {/* Role Permission Assignment */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Manual Role Assignment</h3>
            <p className="text-sm text-gray-600 mb-4">
              Add role permissions to the current user without re-authentication
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <button
                onClick={() => addRolePermission('Doctor')}
                disabled={!user}
                className="flex items-center justify-center py-3 px-4 border border-purple-300 text-purple-700 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <User className="h-5 w-5 mr-2" />
                Add Doctor Permissions
              </button>

              <button
                onClick={() => addRolePermission('Patient')}
                disabled={!user}
                className="flex items-center justify-center py-3 px-4 border border-pink-300 text-pink-700 bg-pink-50 rounded-lg hover:bg-pink-100 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <User className="h-5 w-5 mr-2" />
                Add Patient Permissions
              </button>
            </div>
            {!user && (
              <p className="text-xs text-red-600 mt-2">
                ⚠️ No user loaded - permission assignment disabled
              </p>
            )}
          </div>

          <div className="flex justify-center space-x-4">
            <button
              onClick={() => window.location.reload()}
              className="flex items-center py-2 px-4 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Page
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center py-2 px-4 border border-red-300 text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors duration-200"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout & Start Over
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="text-center">
          <div className="text-sm text-gray-500 space-x-4">
            <a href="/login" className="hover:text-gray-700">Go to Login</a>
            <span>•</span>
            <a href="/" className="hover:text-gray-700">Go to Home</a>
            <span>•</span>
            <a href="/doctor" className="hover:text-gray-700">Try Doctor Dashboard</a>
            <span>•</span>
            <a href="/patient" className="hover:text-gray-700">Try Patient Dashboard</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoRolePage;