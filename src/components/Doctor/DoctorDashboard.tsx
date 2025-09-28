import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useMessages } from '../../contexts/MessageContext';
import Header from '../Layout/Header';
import CategoryTabs from './CategoryTabs';
import PatientList from './PatientList';
import MessageThread from './MessageThread';
import NewPatientForm from './NewPatientForm';

const DoctorDashboard: React.FC = () => {
  const { user } = useAuth();
  const { getThreadsForDoctor } = useMessages();
  const [selectedCategory, setSelectedCategory] = useState('general');
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [showNewPatientForm, setShowNewPatientForm] = useState(false);

  const threads = getThreadsForDoctor(user?.id || '');
  const selectedThread = threads.find(t => t.patientId === selectedPatient);

  const handlePatientCreated = () => {
    // Refresh patient list or perform any necessary updates
    console.log('New patient created successfully');
    // You could add logic here to refresh patient data if needed
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <CategoryTabs 
        selectedCategory={selectedCategory}
        onCategorySelect={setSelectedCategory}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Patient List Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold text-gray-900 capitalize">
                {selectedCategory} Messages
              </h2>
              <button
                onClick={() => setShowNewPatientForm(true)}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <Plus className="h-4 w-4 mr-1" />
                New Patient
              </button>
            </div>
            <p className="text-sm text-gray-500">
              {threads.filter(t => t.category === selectedCategory).length} conversations
            </p>
          </div>
          
          <PatientList
            threads={threads}
            selectedPatient={selectedPatient}
            onPatientSelect={setSelectedPatient}
            selectedCategory={selectedCategory}
          />
        </div>

        {/* Message Thread Area */}
        <div className="flex-1 flex flex-col">
          {selectedPatient && selectedThread ? (
            <MessageThread
              patientId={selectedThread.patientId}
              patientName={selectedThread.patientName}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">💬</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Select a patient to view conversation
                </h3>
                <p className="text-gray-500">
                  Choose a patient from the sidebar to start or continue the conversation
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Patient Form Modal */}
      {showNewPatientForm && (
        <NewPatientForm
          onClose={() => setShowNewPatientForm(false)}
          onPatientCreated={handlePatientCreated}
        />
      )}
    </div>
  );
};

export default DoctorDashboard;