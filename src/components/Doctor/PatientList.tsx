import React from 'react';
import { Clock, AlertCircle, User } from 'lucide-react';
import { MessageThread } from '../../types';

interface PatientListProps {
  threads: MessageThread[];
  selectedPatient: string | null;
  onPatientSelect: (patientId: string) => void;
  selectedCategory: string;
}

const PatientList: React.FC<PatientListProps> = ({ 
  threads, 
  selectedPatient, 
  onPatientSelect,
  selectedCategory 
}) => {
  const filteredThreads = threads.filter(thread => 
    thread.category === selectedCategory
  );

  const getUrgencyColor = (messages: any[]) => {
    const patientMessages = messages.filter(msg => msg.patientDetails);
    if (patientMessages.length === 0) return 'bg-gray-100';
    
    const latestMessage = patientMessages[patientMessages.length - 1];
    const urgency = latestMessage.patientDetails?.urgency;
    
    switch (urgency) {
      case 'high': return 'bg-red-100 border-red-300';
      case 'medium': return 'bg-yellow-100 border-yellow-300';
      case 'low': return 'bg-green-100 border-green-300';
      default: return 'bg-gray-100 border-gray-300';
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (filteredThreads.length === 0) {
    return (
      <div className="p-8 text-center">
        <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No patients in {selectedCategory}
        </h3>
        <p className="text-gray-500">
          Patient messages will appear here when they're categorized under this section.
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200">
      {filteredThreads.map((thread) => (
        <button
          key={thread.patientId}
          onClick={() => onPatientSelect(thread.patientId)}
          className={`w-full p-4 text-left hover:bg-gray-50 transition-colors duration-200 ${
            selectedPatient === thread.patientId ? 'bg-blue-50 border-r-4 border-blue-500' : ''
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center mb-2">
                <h3 className="text-sm font-semibold text-gray-900 truncate">
                  {thread.patientName}
                </h3>
                {thread.unreadCount > 0 && (
                  <span className="ml-2 bg-blue-600 text-white text-xs font-medium px-2 py-1 rounded-full">
                    {thread.unreadCount}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                {thread.messages[thread.messages.length - 1]?.content}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center text-xs text-gray-500">
                  <Clock className="h-3 w-3 mr-1" />
                  {formatTime(thread.lastMessage)}
                </div>
              </div>
            </div>
            <div className={`w-4 h-4 rounded-full border-2 ml-3 flex-shrink-0 ${getUrgencyColor(thread.messages)}`}>
              {thread.messages.some(msg => msg.patientDetails?.urgency === 'high') && (
                <AlertCircle className="h-3 w-3 text-red-600 mx-auto" />
              )}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
};

export default PatientList;