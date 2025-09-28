import { apiClient } from './api';
import { ApiMessage, CreateMessageRequest, UpdateMessageRequest, MessageStats } from '../types';

class MessageService {
  private readonly basePath = '/messages';

  async create(data: CreateMessageRequest): Promise<ApiMessage> {
    return await apiClient.post<ApiMessage>(this.basePath, data);
  }

  async findAll(): Promise<ApiMessage[]> {
    return await apiClient.get<ApiMessage[]>(this.basePath);
  }

  async findOne(idMessage: number): Promise<ApiMessage> {
    return await apiClient.get<ApiMessage>(`${this.basePath}/${idMessage}`);
  }

  async update(idMessage: number, changes: UpdateMessageRequest): Promise<ApiMessage> {
    return await apiClient.put<ApiMessage>(`${this.basePath}/${idMessage}`, changes);
  }

  async delete(idMessage: number): Promise<{ idMessage: number }> {
    return await apiClient.delete<{ idMessage: number }>(`${this.basePath}/${idMessage}`);
  }

  // Doctor-specific messages
  async findByDoctor(idDoctor: number): Promise<ApiMessage[]> {
    return await apiClient.get<ApiMessage[]>(`${this.basePath}/doctor/${idDoctor}`);
  }

  // Patient-specific messages
  async findByPatient(idPatient: number): Promise<ApiMessage[]> {
    return await apiClient.get<ApiMessage[]>(`${this.basePath}/patient/${idPatient}`);
  }

  // TLDR operations
  async regenerateTLDR(idMessage: number): Promise<ApiMessage> {
    return await apiClient.post<ApiMessage>(`${this.basePath}/${idMessage}/regenerate-tldr`);
  }

  // Status operations
  async markAsRead(idMessage: number): Promise<ApiMessage> {
    return await this.update(idMessage, { status: 'read' });
  }

  async markAsResponded(idMessage: number): Promise<ApiMessage> {
    return await this.update(idMessage, { status: 'responded' });
  }

  // Statistics
  async getMessageStats(idDoctor: number): Promise<MessageStats> {
    return await apiClient.get<MessageStats>(`${this.basePath}/stats/doctor/${idDoctor}`);
  }

  // Filtering and sorting
  async findByStatus(status: 'unread' | 'read' | 'responded'): Promise<ApiMessage[]> {
    return await apiClient.get<ApiMessage[]>(`${this.basePath}`, { status });
  }

  async findByPriority(priority: 'low' | 'normal' | 'high' | 'urgent'): Promise<ApiMessage[]> {
    return await apiClient.get<ApiMessage[]>(`${this.basePath}`, { priority });
  }

  async findUrgentMessages(): Promise<ApiMessage[]> {
    return await this.findByPriority('urgent');
  }

  async findUnreadMessages(): Promise<ApiMessage[]> {
    return await this.findByStatus('unread');
  }

  // Bulk operations
  async markMultipleAsRead(messageIds: number[]): Promise<void> {
    await apiClient.post(`${this.basePath}/bulk/mark-read`, { messageIds });
  }

  async deleteMultiple(messageIds: number[]): Promise<void> {
    await apiClient.post(`${this.basePath}/bulk/delete`, { messageIds });
  }

  // Real-time updates helper
  async pollForNewMessages(lastMessageId?: number): Promise<ApiMessage[]> {
    const params = lastMessageId ? { since: lastMessageId } : {};
    return await apiClient.get<ApiMessage[]>(`${this.basePath}/new`, params);
  }
}

export const messageService = new MessageService();