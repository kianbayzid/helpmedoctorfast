import React, { useEffect, useState } from "react";
import { AlertCircle, Phone, FileText } from "lucide-react";
import { httpClient } from "../../services/httpClient";

interface Message {
  idMessage: number;
  messageContent: string;
  tldr: string | null;
  messageType: string;
  priority: string;
  status: string;
  createdAt: string;
  patient?: {
    idPatient: number;
    name: string;
  };
}

const DoctorDashboard: React.FC = () => {
  const [doctor, setDoctor] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <p>Loading messages...</p>;

  if (!doctor) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-gray-700">
        <AlertCircle className="h-8 w-8 text-red-500 mb-2" />
        <p>No doctor logged in.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-6">
      <h1 className="text-2xl font-bold mb-6">Welcome, Dr. {doctor.name}</h1>
      <p className="mb-4 text-gray-600">Here are your recent calls:</p>

      {messages.length === 0 ? (
        <p className="text-gray-500">No calls registered yet.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {messages.map((msg) => (
            <div
              key={msg.idMessage}
              className="bg-white shadow rounded-lg p-4 border border-gray-200"
            >
              <div className="flex items-center space-x-2 mb-2">
                <Phone className="h-5 w-5 text-blue-500" />
                <span className="text-sm text-gray-600">
                  {new Date(msg.createdAt).toLocaleString()}
                </span>
              </div>

              <div className="mb-2 font-semibold text-lg text-gray-900">
                {msg.tldr || "No summary available"}
              </div>

              <div className="mb-2 flex items-center space-x-2">
                <FileText className="h-5 w-5 text-gray-500" />
                <p className="text-sm text-gray-700">{msg.messageContent}</p>
              </div>

              <div className="mt-2 text-xs text-gray-400">
                Status: {msg.status} | Priority: {msg.priority}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;