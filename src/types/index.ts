
export interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  selected: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'system' | 'assistant';
  content: string;
  timestamp: number;
  sources?: DocumentSource[];
}

export interface DocumentSource {
  documentId: string;
  documentName: string;
  excerpts: string[];
  relevanceScore: number;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

export interface RagSettings {
  chunk_size: number;
  chunk_overlap: number;
  retrieval_k: number;
  temperature: number;
  model: string;
}

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};
