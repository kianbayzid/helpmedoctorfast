// src/services/doctorService.ts
import { httpClient } from './httpClient';

export const doctorService = {
  async create(data: { name: string; email: string; password: string; phone: string; specialization?: string }) {
    const response = await httpClient.post('/auth/register', data);
    // backend devuelve { doctor: {...} }
    return response.doctor;
  },

  async login(data: { email: string; password: string }) {
    const response = await httpClient.post('/auth/login', data);
    // backend devuelve { doctor: {...} }
    return response.doctor;
  },

  async getAll() {
    return httpClient.get('/doctors');
  },

  async getById(id: number) {
    return httpClient.get(`/doctors/${id}`);
  },

  async update(id: number, data: any) {
    return httpClient.patch(`/doctors/${id}`, data);
  },

  async remove(id: number) {
    return httpClient.delete(`/doctors/${id}`);
  },
};