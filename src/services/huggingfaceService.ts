import { apiClient } from './api';

interface TLDRResponse {
  summary: string;
  originalLength: number;
  summaryLength: number;
}

interface TLDRRequest {
  text: string;
  maxLength?: number;
  minLength?: number;
}

class HuggingFaceService {
  private readonly basePath = '/ai';

  async generateTLDR(text: string, options?: { maxLength?: number; minLength?: number }): Promise<string> {
    const request: TLDRRequest = {
      text,
      maxLength: options?.maxLength || 100,
      minLength: options?.minLength || 20,
    };

    const response = await apiClient.post<TLDRResponse>(`${this.basePath}/tldr`, request);
    return response.summary;
  }

  // Batch TLDR generation for multiple texts
  async generateMultipleTLDR(texts: string[]): Promise<string[]> {
    const response = await apiClient.post<{ summaries: string[] }>(`${this.basePath}/tldr/batch`, {
      texts,
    });
    return response.summaries;
  }

  // Check if AI service is available
  async checkServiceHealth(): Promise<{ status: 'healthy' | 'unhealthy'; message: string }> {
    return await apiClient.get<{ status: 'healthy' | 'unhealthy'; message: string }>(`${this.basePath}/health`);
  }

  // Get supported models
  async getSupportedModels(): Promise<string[]> {
    return await apiClient.get<string[]>(`${this.basePath}/models`);
  }
}

export const huggingfaceService = new HuggingFaceService();