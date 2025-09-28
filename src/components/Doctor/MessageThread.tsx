import React, { useState, useRef, useEffect } from 'react';
import { Send, Clock, User, AlertCircle, FileText } from 'lucide-react';
import { useMessages } from '../../contexts/MessageContext';
import { useAuth } from '../../contexts/AuthContext';
import { Message } from '../../types';


interface MessageThreadProps {
  patientId: string;
  patientName: string;
}

const MessageThread: React.FC<MessageThreadProps> = ({ patientId, patientName }) => {
  const { getMessagesForPatient, sendMessage, markAsRead } = useMessages();
  const { user } = useAuth();



  const [newMessage, setNewMessage] = useState('');
  const [loadingTldr, setLoadingTldr] = useState<string | null>(null);
  const [tldrResults, setTldrResults] = useState<{ [messageId: string]: string }>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  

  const messages = getMessagesForPatient(patientId);
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  };

  useEffect(() => {
    scrollToBottom();
    // Mark messages as read
    messages.forEach(msg => {
      if (!msg.read && msg.senderId === patientId) {
        markAsRead(msg.id);
      }
    });

    return () => clearTimeout(timer);
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

  const handleTldr = async (messageId: string, messageContent: string) => {
    setLoadingTldr(messageId);
    
    try {
      // TODO: Replace with actual API call to your backend
      // const response = await fetch('/api/tldr', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ messageId, content: messageContent })
      // });
      // const data = await response.json();
      
      // Mock TLDR - shows blank bubble for backend integration
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API delay
      
      setTldrResults(prev => ({
        ...prev,
        [messageId]: '' // Empty string for blank bubble
      }));
    } catch (error) {
      console.error('Error generating TLDR:', error);
      setTldrResults(prev => ({
        ...prev,
        [messageId]: 'Error generating summary. Please try again.'
      }));
    } finally {
      setLoadingTldr(null);
    }
  };


  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getUrgencyBadge = (message: Message) => {
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

  const getPatientInfo = (message: Message) => {
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
      <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ scrollBehavior: 'smooth' }}>
        {messages.map((message, index) => {
          const isDoctor = message.senderId === user?.id;
          const showPatientInfo = !isDoctor && message.patientDetails && 
            (index === 0 || messages[index - 1].senderId === user?.id);

          return (
            <div key={message.id}>
              {showPatientInfo && getPatientInfo(message)}
              
              <div className={`flex ${isDoctor ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md ${
                  isDoctor 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-900'
                } rounded-lg overflow-hidden`}>
                  <div className="px-4 py-2">
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
                  
                  {/* TLDR Button - only show for patient messages */}
                  {!isDoctor && (
                    <div className="px-4 pb-2">
                      <button
                        onClick={() => handleTldr(message.id, message.content)}
                        disabled={loadingTldr === message.id}
                        className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white text-xs font-medium py-1 px-2 rounded transition-colors duration-200 flex items-center justify-center"
                      >
                        <FileText className="h-3 w-3 mr-1" />
                        {loadingTldr === message.id ? 'Generating...' : 'TLDR'}
                      </button>
                      
                      {/* TLDR Result */}
                      {tldrResults[message.id] && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-800">
                          <div className="font-medium mb-1">Summary:</div>
                          {tldrResults[message.id]}
                        </div>
                      )}
                    </div>
                  )}
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