// src/components/Doctor/DoctorDashboard.tsx
import React, { useEffect, useState } from "react";
import { AlertCircle, Phone, FileText, Stethoscope, Clock, User, AlertTriangle, CheckCircle, Filter, Search, Bell, MoreVertical } from "lucide-react";
import { httpClient } from "../../services/httpClient";

interface Message {
  idMessage: number;
  idPatient: number;
  messageContent: string;
  tldr: string | null;
  messageType: string;
  priority: string;
  status: string;
  createdAt: string;
  patient?: {
    name: string;
    phone: string;
  };
}

const DoctorDashboard: React.FC = () => {
  const [doctor, setDoctor] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [updatingMessages, setUpdatingMessages] = useState<number[]>([]);

  const markAsRead = async (messageId: number) => {
    try {
      setUpdatingMessages(prev => [...prev, messageId]);
      
      // Llamar a la API para marcar como leído
      const updatedMessage = await httpClient.put(`/messages/${messageId}/mark-read`);
      
      // Actualizar el estado local con la respuesta del servidor
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.idMessage === messageId 
            ? { ...msg, status: 'read', updatedAt: new Date().toISOString() }
            : msg
        )
      );
      
      console.log('Message marked as read:', updatedMessage);
    } catch (error) {
      console.error("Error marking message as read:", error);
      // Aquí podrías mostrar un toast o notificación de error
      alert('Error marking message as read. Please try again.');
    } finally {
      setUpdatingMessages(prev => prev.filter(id => id !== messageId));
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadMessages = messages.filter(msg => msg.status === 'unread');
      if (unreadMessages.length === 0) return;
      
      const messageIds = unreadMessages.map(msg => msg.idMessage);
      setUpdatingMessages(messageIds);
      
      // Llamar a la API para marcar todos como leídos
      const result = await httpClient.put(`/messages/doctor/${doctor.idDoctor}/mark-all-read`);
      
      // Actualizar el estado local
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.status === 'unread' 
            ? { ...msg, status: 'read', updatedAt: new Date().toISOString() }
            : msg
        )
      );
      
      console.log(`${result.updatedCount} messages marked as read`);
    } catch (error) {
      console.error("Error marking all messages as read:", error);
      alert('Error marking all messages as read. Please try again.');
    } finally {
      setUpdatingMessages([]);
    }
  };

  useEffect(() => {
    // Obtener el doctor logueado del localStorage
    const storedDoctor = localStorage.getItem("doctor");
    if (storedDoctor) {
      const parsedDoctor = JSON.parse(storedDoctor);
      setDoctor(parsedDoctor);

      // Traer mensajes asociados al doctor
      httpClient
        .get(`/messages/doctor/${parsedDoctor.idDoctor}`)
        .then((res) => setMessages(res))
        .catch((err) => console.error("Error fetching messages:", err))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const filteredMessages = messages.filter(msg => {
    const matchesSearch = msg.messageContent?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (msg.tldr && msg.tldr.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = filterStatus === "all" || msg.status?.toLowerCase() === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'bg-red-500/10 text-red-600 border-red-200';
      case 'medium':
        return 'bg-amber-500/10 text-amber-600 border-amber-200';
      case 'low':
        return 'bg-emerald-500/10 text-emerald-600 border-emerald-200';
      default:
        return 'bg-slate-500/10 text-slate-600 border-slate-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'read':
        return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      case 'unread':
        return <Clock className="h-4 w-4 text-amber-500" />;
      case 'urgent':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-slate-500" />;
    }
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="relative">
            <div className="mx-auto h-20 w-20 bg-white/80 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6 shadow-2xl">
              <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-600 rounded-full animate-ping"></div>
          </div>
          <p className="text-slate-600 font-medium text-lg">Loading your dashboard...</p>
          <div className="w-32 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mx-auto mt-4 animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
        <div className="text-center max-w-md">
          <div className="mx-auto h-24 w-24 bg-white/80 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-8 shadow-2xl">
            <AlertCircle className="h-12 w-12 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-3">Authentication Required</h2>
          <p className="text-slate-600 leading-relaxed">Please log in to access your medical dashboard and patient messages.</p>
          <div className="w-20 h-1 bg-gradient-to-r from-red-500 to-pink-500 rounded-full mx-auto mt-6"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Modern Header with Glass Effect */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"></div>
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative">
          <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="h-20 w-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-2xl">
                    <Stethoscope className="h-10 w-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full border-2 border-white shadow-lg"></div>
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white mb-2">
                    Welcome back, Dr. {doctor.name}
                  </h1>
                  <p className="text-blue-100 text-lg">
                    You have {filteredMessages.length} patient message{filteredMessages.length !== 1 ? 's' : ''} to review
                  </p>
                </div>
              </div>
              <div className="hidden md:flex items-center gap-4">
                <div className="relative">
                  <Bell className="h-6 w-6 text-white/80 hover:text-white cursor-pointer transition-colors" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full"></div>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-emerald-400/20 rounded-xl flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-emerald-300" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">{messages.filter(m => m.status === 'read').length}</div>
                    <div className="text-blue-100 text-sm">Read</div>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-amber-400/20 rounded-xl flex items-center justify-center">
                    <Clock className="h-6 w-6 text-amber-300" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">{messages.filter(m => m.status === 'unread').length}</div>
                    <div className="text-blue-100 text-sm">Unread</div>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-red-400/20 rounded-xl flex items-center justify-center">
                    <AlertTriangle className="h-6 w-6 text-red-300" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">{messages.filter(m => m.priority === 'high').length}</div>
                    <div className="text-blue-100 text-sm">High Priority</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 -mt-8 relative z-10">
        {/* Search and Filter Bar */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-8 shadow-xl border border-white/50">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-col md:flex-row gap-4 flex-1">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search messages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-3 bg-white/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                >
                  <option value="all">All Status</option>
                  <option value="unread">Unread</option>
                  <option value="read">Read</option>
                </select>
                <button className="px-4 py-3 bg-slate-100/50 border border-slate-200 rounded-xl hover:bg-slate-200/50 transition-colors">
                  <Filter className="h-5 w-5 text-slate-600" />
                </button>
              </div>
            </div>
            
            {/* Mark All as Read Button */}
            {messages.filter(m => m.status === 'unread').length > 0 && (
              <button
                onClick={markAllAsRead}
                disabled={updatingMessages.length > 0}
                className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl hover:from-emerald-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold text-sm shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none flex items-center gap-2"
              >
                {updatingMessages.length > 0 ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <CheckCircle className="h-4 w-4" />
                )}
                Mark All Read
              </button>
            )}
          </div>
        </div>

        {filteredMessages.length === 0 ? (
          <div className="text-center py-20">
            <div className="mx-auto h-32 w-32 bg-white/80 backdrop-blur-sm rounded-3xl flex items-center justify-center mb-8 shadow-2xl">
              <Phone className="h-16 w-16 text-slate-400" />
            </div>
            <h3 className="text-2xl font-bold text-slate-700 mb-4">No Messages Found</h3>
            <p className="text-slate-500 max-w-md mx-auto leading-relaxed">
              {searchTerm || filterStatus !== "all" 
                ? "Try adjusting your search or filter criteria." 
                : "Your patient calls will appear here. Check back later or contact support if you expect to see messages."
              }
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3 pb-12">
            {filteredMessages.map((msg) => (
              <div
                key={msg.idMessage}
                className={`group bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border transform hover:-translate-y-2 ${
                  msg.status === 'unread' 
                    ? 'border-blue-200 bg-blue-50/30' 
                    : 'border-white/50'
                }`}
              >
                {/* Card Header with Glass Effect */}
                <div className="relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-50 to-blue-50"></div>
                  <div className="relative px-6 py-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
                          <Phone className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-700 text-sm">
                            {msg.patient?.phone || "Unknown Number"}
                          </div>
                          <div className="text-xs text-slate-500">{getTimeAgo(msg.createdAt)}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`px-3 py-1.5 rounded-xl text-xs font-semibold border ${getPriorityColor(msg.priority)}`}>
                          {msg.priority}
                        </div>
                        {msg.status === 'unread' && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        )}
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {msg.status === 'unread' && (
                            <button
                              onClick={() => markAsRead(msg.idMessage)}
                              disabled={updatingMessages.includes(msg.idMessage)}
                              className="p-1.5 hover:bg-emerald-100 rounded-lg transition-colors text-emerald-600 disabled:opacity-50"
                              title="Mark as read"
                            >
                              {updatingMessages.includes(msg.idMessage) ? (
                                <div className="w-3 h-3 border border-emerald-600/30 border-t-emerald-600 rounded-full animate-spin"></div>
                              ) : (
                                <CheckCircle className="h-3 w-3" />
                              )}
                            </button>
                          )}
                          <button className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                            <MoreVertical className="h-3 w-3 text-slate-400" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-slate-400 flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      {new Date(msg.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Card Content */}
                <div className="px-6 py-6">
                  {/* Patient Info */}
                  {msg.patient && (
                    <div className="flex items-center gap-3 mb-5 p-4 bg-slate-50/50 rounded-xl border border-slate-100">
                      <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center text-white font-semibold text-sm">
                        {msg.patient.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-700">{msg.patient.name}</div>
                        <div className="text-xs text-slate-500">Patient ID: {msg.idPatient}</div>
                      </div>
                    </div>
                  )}

                  {/* Summary */}
                  <div className="mb-5">
                    <h3 className="font-bold text-slate-800 text-lg mb-2 leading-tight line-clamp-2">
                      {msg.tldr || "No summary available"}
                    </h3>
                  </div>

                  {/* Message Content */}
                  <div className="mb-6">
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                        <FileText className="h-4 w-4 text-slate-500" />
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed line-clamp-4">
                        {msg.messageContent}
                      </p>
                    </div>
                  </div>

                  {/* Status Footer */}
                  <div className="flex items-center justify-between pt-5 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(msg.status)}
                      <span className="text-sm font-semibold text-slate-600 capitalize">
                        {msg.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 bg-slate-300 rounded-full"></div>
                      <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">
                        {msg.messageType}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;