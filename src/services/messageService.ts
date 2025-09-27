import { apiClient } from './api';
import { Message, CreateMessageRequest, UpdateMessageRequest, MessageStats } from '../types';

class MessageService {
  private readonly basePath = '/messages';

  async create(data: CreateMessageRequest): Promise<Message> {
    return await apiClient.post<Message>(this.basePath, data);
  }

  async findAll(): Promise<Message[]> {
    return await apiClient.get<Message[]>(this.basePath);
  }

  async findOne(idMessage: number): Promise<Message> {
    return await apiClient.get<Message>(`${this.basePath}/${idMessage}`);
  }

  async update(idMessage: number, changes: UpdateMessageRequest): Promise<Message> {
    return await apiClient.put<Message>(`${this.basePath}/${idMessage}`, changes);
  }

  async delete(idMessage: number): Promise<{ idMessage: number }> {
    return await apiClient.delete<{ idMessage: number }>(`${this.basePath}/${idMessage}`);
  }

  // Doctor-specific messages
  async findByDoctor(idDoctor: number): Promise<Message[]> {
    return await apiClient.get<Message[]>(`${this.basePath}/doctor/${idDoctor}`);
  }

  // Patient-specific messages
  async findByPatient(idPatient: number): Promise<Message[]> {
    return await apiClient.get<Message[]>(`${this.basePath}/patient/${idPatient}`);
  }

  // TLDR operations
  async regenerateTLDR(idMessage: number): Promise<Message> {
    return await apiClient.post<Message>(`${this.basePath}/${idMessage}/regenerate-tldr`);
  }

  // Status operations
  async markAsRead(idMessage: number): Promise<Message> {
    return await this.update(idMessage, { status: 'read' });
  }

  async markAsResponded(idMessage: number): Promise<Message> {
    return await this.update(idMessage, { status: 'responded' });
  }

  // Statistics
  async getMessageStats(idDoctor: number): Promise<MessageStats> {
    return await apiClient.get<MessageStats>(`${this.basePath}/stats/doctor/${idDoctor}`);
  }

  // Filtering and sorting
  async findByStatus(status: 'unread' | 'read' | 'responded'): Promise<Message[]> {
    return await apiClient.get<Message[]>(`${this.basePath}`, { status });
  }

  async findByPriority(priority: 'low' | 'normal' | 'high' | 'urgent'): Promise<Message[]> {
    return await apiClient.get<Message[]>(`${this.basePath}`, { priority });
  }

  async findUrgentMessages(): Promise<Message[]> {
    return await this.findByPriority('urgent');
  }

  async findUnreadMessages(): Promise<Message[]> {
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
  async pollForNewMessages(lastMessageId?: number): Promise<Message[]> {
    const params = lastMessageId ? { since: lastMessageId } : {};
    return await apiClient.get<Message[]>(`${this.basePath}/new`, params);
  }
}

export const messageService = new MessageService();