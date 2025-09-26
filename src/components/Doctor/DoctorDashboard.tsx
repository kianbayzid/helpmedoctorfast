import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useMessages } from '../../contexts/MessageContext';
import Header from '../Layout/Header';
import CategoryTabs from './CategoryTabs';
import PatientList from './PatientList';
import MessageThread from './MessageThread';

const DoctorDashboard: React.FC = () => {
  const { user } = useAuth();
  const { getThreadsForDoctor } = useMessages();
  const [selectedCategory, setSelectedCategory] = useState('general');
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);

  const threads = getThreadsForDoctor(user?.id || '');
  const selectedThread = threads.find(t => t.patientId === selectedPatient);

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
            <h2 className="font-semibold text-gray-900 capitalize">
              {selectedCategory} Messages
            </h2>
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
    </div>
  );
};

export default DoctorDashboard;