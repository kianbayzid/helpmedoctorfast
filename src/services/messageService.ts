// src/services/messageService.ts
import { httpClient } from "./httpClient";

export const messageService = {
  async getByDoctorId(doctorId: number) {
    return httpClient.get(`/messages/doctor/${doctorId}`);
  },
};