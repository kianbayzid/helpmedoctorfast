import { apiClient } from './api';
import { Patient, CreatePatientRequest, UpdatePatientRequest } from '../types';

class PatientService {
  private readonly basePath = '/patients';

  async create(data: CreatePatientRequest): Promise<Patient> {
    return await apiClient.post<Patient>(this.basePath, data);
  }

  async findAll(): Promise<Patient[]> {
    return await apiClient.get<Patient[]>(this.basePath);
  }

  async findOne(id: number): Promise<Patient> {
    return await apiClient.get<Patient>(`${this.basePath}/${id}`);
  }

  async update(id: number, changes: UpdatePatientRequest): Promise<Patient> {
    return await apiClient.put<Patient>(`${this.basePath}/${id}`, changes);
  }

  async delete(id: number): Promise<{ id: number }> {
    return await apiClient.delete<{ id: number }>(`${this.basePath}/${id}`);
  }

  // Additional utility methods
  async search(query: string): Promise<Patient[]> {
    return await apiClient.get<Patient[]>(`${this.basePath}/search`, { q: query });
  }

  async findByPhone(phone: string): Promise<Patient | null> {
    try {
      return await apiClient.get<Patient>(`${this.basePath}/phone/${phone}`);
    } catch (error: any) {
      if (error.status === 404) {
        return null;
      }
      throw error;
    }
  }
}

export const patientService = new PatientService();