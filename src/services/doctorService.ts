import { apiClient } from './api';
import { Doctor, CreateDoctorRequest, UpdateDoctorRequest } from '../types';

class DoctorService {
  private readonly basePath = '/doctors';

  async create(data: CreateDoctorRequest): Promise<Doctor> {
    return await apiClient.post<Doctor>(this.basePath, data);
  }

  async findAll(): Promise<Doctor[]> {
    return await apiClient.get<Doctor[]>(this.basePath);
  }

  async findOne(id: number): Promise<Doctor> {
    return await apiClient.get<Doctor>(`${this.basePath}/${id}`);
  }

  async update(id: number, changes: UpdateDoctorRequest): Promise<Doctor> {
    return await apiClient.put<Doctor>(`${this.basePath}/${id}`, changes);
  }

  async delete(id: number): Promise<{ id: number }> {
    return await apiClient.delete<{ id: number }>(`${this.basePath}/${id}`);
  }

  // Additional utility methods
  async findBySpecialty(specialty: string): Promise<Doctor[]> {
    return await apiClient.get<Doctor[]>(`${this.basePath}`, { specialty });
  }

  async search(query: string): Promise<Doctor[]> {
    return await apiClient.get<Doctor[]>(`${this.basePath}/search`, { q: query });
  }
}

export const doctorService = new DoctorService();