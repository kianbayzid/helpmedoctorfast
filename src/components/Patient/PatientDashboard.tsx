import React, { useState } from 'react';
import { Send, Calendar, Shield, AlertCircle, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useMessages } from '../../contexts/MessageContext';
import Header from '../Layout/Header';

const PatientDashboard: React.FC = () => {
  const { user } = useAuth();
  const { sendMessage, getMessagesForPatient } = useMessages();
  const [newMessage, setNewMessage] = useState('');
  const [urgency, setUrgency] = useState<'low' | 'medium' | 'high'>('medium');
  const [showNewMessage, setShowNewMessage] = useState(false);

  const patientMessages = getMessagesForPatient(user?.id || '');

  const handleSendMessage = () => {
    if (newMessage.trim() && user) {
      sendMessage({
        senderId: user.id,
        receiverId: '1', // Default doctor ID
        content: newMessage,
        patientDetails: {
          name: user.name,
          dateOfBirth: user.dateOfBirth || '',
          insurance: user.insurance,
          urgency: urgency
        },
        category: 'general'
      });
      setNewMessage('');
      setShowNewMessage(false);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name?.split(' ')[0]}
          </h1>
          <p className="text-gray-600">Manage your healthcare communications</p>
        </div>

        {/* Patient Info Card */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Information</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-blue-600 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Date of Birth</p>
                <p className="font-medium">{user?.dateOfBirth || 'Not provided'}</p>
              </div>
            </div>
            <div className="flex items-center">
              <Shield className="h-5 w-5 text-green-600 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Insurance</p>
                <p className="font-medium">{user?.insurance || 'Not provided'}</p>
              </div>
            </div>
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-purple-600 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className="font-medium text-green-600">Active</p>
              </div>
            </div>
          </div>
        </div>

        {/* New Message Button */}
        <div className="mb-8">
          <button
            onClick={() => setShowNewMessage(!showNewMessage)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center"
          >
            <Send className="h-4 w-4 mr-2" />
            {showNewMessage ? 'Cancel Message' : 'New Message to Doctor'}
          </button>
        </div>

        {/* New Message Form */}
        {showNewMessage && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Send New Message</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Urgency Level
              </label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as 'low' | 'medium' | 'high')}
                className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Low - Routine inquiry</option>
                <option value="medium">Medium - Needs attention</option>
                <option value="high">High - Urgent medical concern</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message
              </label>
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Describe your concern or question in detail..."
                rows={4}
                className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleSendMessage}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
              >
                Send Message
              </button>
              <button
                onClick={() => setShowNewMessage(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Messages History */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Message History</h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {patientMessages.length > 0 ? (
              patientMessages.map((message) => (
                <div key={message.id} className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-3 ${
                        message.senderId === user?.id ? 'bg-blue-500' : 'bg-green-500'
                      }`}></div>
                      <span className="font-medium text-gray-900">
                        {message.senderId === user?.id ? 'You' : 'Dr. Sarah Johnson'}
                      </span>
                      {message.patientDetails?.urgency && (
                        <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
                          getUrgencyColor(message.patientDetails.urgency)
                        }`}>
                          {message.patientDetails.urgency.toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      {formatDate(message.timestamp)}
                    </div>
                  </div>
                  <p className="text-gray-700 ml-6">{message.content}</p>
                </div>
              ))
            ) : (
              <div className="p-12 text-center">
                <div className="text-gray-400 mb-4">
                  <Send className="h-12 w-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h3>
                <p className="text-gray-500">Start a conversation with your healthcare provider</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;