// src/services/api.ts
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export interface Transcript {
  id: string;
  content: string;
  uploadedAt: string;
}

export interface Summary {
  id: string;
  transcriptId: string;
  content: string;
  originalPrompt: string;
  generatedAt: string;
  lastEditedAt?: string;
}

export interface EmailResponse {
  success: boolean;
  message: string;
}

// Transcript API
export const transcriptAPI = {
  uploadText: async (content: string): Promise<Transcript> => {
    const response = await api.post('/transcripts', { content });
    return response.data;
  },

  uploadFile: async (file: File): Promise<Transcript> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/transcripts/upload-file', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getAll: async (): Promise<Transcript[]> => {
    const response = await api.get('/transcripts');
    return response.data;
  },

  getById: async (id: string): Promise<Transcript> => {
    const response = await api.get(`/transcripts/${id}`);
    return response.data;
  },

  delete: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/transcripts/${id}`);
    return response.data;
  },
};

// Summary API
export const summaryAPI = {
  generate: async (transcriptId: string, customPrompt: string): Promise<Summary> => {
    const response = await api.post('/summaries/generate', {
      transcriptId,
      customPrompt,
    });
    return response.data;
  },

  getAll: async (): Promise<Summary[]> => {
    const response = await api.get('/summaries');
    return response.data;
  },

  getById: async (id: string): Promise<Summary> => {
    const response = await api.get(`/summaries/${id}`);
    return response.data;
  },

  getByTranscript: async (transcriptId: string): Promise<Summary[]> => {
    const response = await api.get(`/summaries/transcript/${transcriptId}`);
    return response.data;
  },

  update: async (id: string, content: string): Promise<Summary> => {
    const response = await api.put(`/summaries/${id}`, { content });
    return response.data;
  },

  delete: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/summaries/${id}`);
    return response.data;
  },
};

// Email API
export const emailAPI = {
  sendSummary: async (
    summaryId: string,
    recipients: string[],
    subject: string
  ): Promise<EmailResponse> => {
    const response = await api.post('/email/send', {
      summaryId,
      recipients,
      subject,
    });
    return response.data;
  },

  testConnection: async (): Promise<EmailResponse> => {
    const response = await api.get('/email/test');
    return response.data;
  },
};