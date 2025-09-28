import React, { useState, useRef, useEffect } from 'react';
import { Send, Clock, User, AlertCircle } from 'lucide-react';
import { useMessages } from '../../contexts/MessageContext';
import { useAuth } from '../../contexts/AuthContext';
import { UiMessage } from '../../types';

interface MessageThreadProps {
  patientId: string;
  patientName: string;
}

const MessageThread: React.FC<MessageThreadProps> = ({ patientId, patientName }) => {
  const { getMessagesForPatient, sendMessage, markAsRead } = useMessages();
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const messages = getMessagesForPatient(patientId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
    // Mark messages as read
    messages.forEach(msg => {
      if (!msg.read && msg.senderId === patientId) {
        markAsRead(msg.id);
      }
    });
  }, [messages, patientId, markAsRead]);

  const handleSendMessage = () => {
    if (newMessage.trim() && user) {
      sendMessage({
        senderId: user.id,
        receiverId: patientId,
        content: newMessage,
        category: 'general'
      });
      setNewMessage('');
    }
  };

  const formatTime = (dateLike: Date | string) => {
  const d = dateLike instanceof Date ? dateLike : new Date(dateLike);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getUrgencyBadge = (message: UiMessage) => {
    if (!message.patientDetails?.urgency) return null;
    
    const urgency = message.patientDetails.urgency;
    const colors = {
      high: 'bg-red-100 text-red-800 border-red-300',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      low: 'bg-green-100 text-green-800 border-green-300'
    };

    return (
      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border ${colors[urgency]}`}>
        {urgency === 'high' && <AlertCircle className="w-3 h-3 mr-1" />}
        {urgency.toUpperCase()}
      </span>
    );
  };

  const getPatientInfo = (message: UiMessage) => {
    if (!message.patientDetails) return null;

    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 text-sm">
        <h4 className="font-medium text-blue-900 mb-2">Patient Information</h4>
        <div className="space-y-1 text-blue-800">
          <p><span className="font-medium">DOB:</span> {message.patientDetails.dateOfBirth}</p>
          {message.patientDetails.insurance && (
            <p><span className="font-medium">Insurance:</span> {message.patientDetails.insurance}</p>
          )}
        </div>
      </div>
    );
  };

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No conversation yet</h3>
          <p className="text-gray-500">Messages with this patient will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
            <User className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">{patientName}</h2>
            <p className="text-sm text-gray-500">Patient Conversation</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => {
          const isDoctor = message.senderId === user?.id;
          const showPatientInfo = !isDoctor && message.patientDetails && 
            (index === 0 || messages[index - 1].senderId === user?.id);

          return (
            <div key={message.id}>
              {showPatientInfo && getPatientInfo(message)}
              
              <div className={`flex ${isDoctor ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  isDoctor 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-900'
                }`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">
                      {isDoctor ? 'You' : patientName}
                    </span>
                    {!isDoctor && getUrgencyBadge(message)}
                  </div>
                  <p className="text-sm">{message.content}</p>
                  <div className={`flex items-center justify-end mt-2 text-xs ${
                    isDoctor ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    <Clock className="h-3 w-3 mr-1" />
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Reply Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex space-x-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your response..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white p-2 rounded-md transition-colors duration-200"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageThread;