import React, { useEffect, useState } from 'react';
import { Plus, AlertCircle, Phone, FileText } from 'lucide-react';
import { httpClient } from '../../services/httpClient';
import NewPatientForm from './NewPatientForm';

// Combined interface for messages from 'main' branch
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
  // State management from 'main' branch
  const [doctor, setDoctor] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  // State management from 'Form+Button' branch for UI control
  const [showNewPatientForm, setShowNewPatientForm] = useState(false);

  // useEffect from 'main' branch to fetch data
  useEffect(() => {
    const storedDoctor = localStorage.getItem("doctor");
    if (storedDoctor) {
      const parsedDoctor = JSON.parse(storedDoctor);
      setDoctor(parsedDoctor);

      httpClient
        .get(`/messages/doctor/${parsedDoctor.idDoctor}`)
        .then((res) => setMessages(res))
        .catch((err) => console.error("Error fetching messages:",