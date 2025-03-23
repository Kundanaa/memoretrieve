import { Document, ChatMessage, ApiResponse, DocumentSource } from '@/types';

// API base URL - update this to your actual backend URL
const API_BASE_URL = 'http://localhost:8000';

// Helper function for API requests
const apiRequest = async <T>(
  endpoint: string, 
  method: string = 'GET', 
  body?: any
): Promise<ApiResponse<T>> => {
  try {
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (body) {
      if (body instanceof FormData) {
        // Remove Content-Type header for FormData to allow browser to set it with boundary
        delete (options.headers as Record<string, string>)['Content-Type'];
        options.body = body;
      } else {
        options.body = JSON.stringify(body);
      }
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    const data = await response.json();

    return {
      success: response.ok && data.success,
      data: data.data,
      error: !response.ok || !data.success ? data.error || 'An unknown error occurred' : undefined,
    };
  } catch (error) {
    console.error('API request failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred',
    };
  }
};

// API client for real backend
export const api = {
  // Document management
  getDocuments: async (): Promise<ApiResponse<Document[]>> => {
    return apiRequest<Document[]>('/documents');
  },
  
  uploadDocument: async (file: File): Promise<ApiResponse<Document>> => {
    const formData = new FormData();
    formData.append('file', file);
    
    return apiRequest<Document>('/documents', 'POST', formData);
  },
  
  deleteDocument: async (id: string): Promise<ApiResponse<void>> => {
    return apiRequest<void>(`/documents/${id}`, 'DELETE');
  },
  
  updateDocumentSelection: async (id: string, selected: boolean): Promise<ApiResponse<Document>> => {
    return apiRequest<Document>(`/documents/${id}/selection`, 'PUT', { selected });
  },
  
  // Chat functionality
  sendChatMessage: async (message: string): Promise<ApiResponse<ChatMessage>> => {
    return apiRequest<ChatMessage>('/chat', 'POST', { message });
  }
};

// Fallback to mock implementation if needed
const useMockAPI = false; // Set to true to use mock implementation

// Mock data for development
const MOCK_DOCUMENTS: Document[] = [
  {
    id: '1',
    name: 'Annual Report 2023.pdf',
    type: 'application/pdf',
    size: 1250000,
    uploadedAt: new Date().toISOString(),
    status: 'completed',
    selected: true
  },
  {
    id: '2',
    name: 'Project Proposal.docx',
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    size: 520000,
    uploadedAt: new Date(Date.now() - 86400000).toISOString(),
    status: 'completed',
    selected: true
  },
  {
    id: '3',
    name: 'Meeting Notes.txt',
    type: 'text/plain',
    size: 15000,
    uploadedAt: new Date(Date.now() - 172800000).toISOString(),
    status: 'completed',
    selected: false
  }
];

const MOCK_SOURCES: Record<string, DocumentSource[]> = {
  '1': [
    {
      documentId: '1',
      documentName: 'Annual Report 2023.pdf',
      excerpts: [
        "According to our financial results, revenue increased by 12% in 2023 compared to the previous year.",
        "The board approved a plan to expand operations into European markets by Q2 2024."
      ],
      relevanceScore: 0.92
    },
    {
      documentId: '2',
      documentName: 'Project Proposal.docx',
      excerpts: [
        "The project timeline estimates completion within 8 months from approval."
      ],
      relevanceScore: 0.75
    }
  ]
};

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API client
const mockApi = {
  // Document management
  getDocuments: async (): Promise<ApiResponse<Document[]>> => {
    await delay(800);
    return { success: true, data: MOCK_DOCUMENTS };
  },
  
  uploadDocument: async (file: File): Promise<ApiResponse<Document>> => {
    await delay(1500);
    const newDoc: Document = {
      id: Math.random().toString(36).substring(2, 9),
      name: file.name,
      type: file.type,
      size: file.size,
      uploadedAt: new Date().toISOString(),
      status: 'processing',
      selected: false
    };
    
    // Simulate processing
    setTimeout(() => {
      const index = MOCK_DOCUMENTS.findIndex(d => d.id === newDoc.id);
      if (index !== -1) {
        MOCK_DOCUMENTS[index].status = 'completed';
      } else {
        newDoc.status = 'completed';
        MOCK_DOCUMENTS.push(newDoc);
      }
    }, 3000);
    
    MOCK_DOCUMENTS.push(newDoc);
    return { success: true, data: newDoc };
  },
  
  deleteDocument: async (id: string): Promise<ApiResponse<void>> => {
    await delay(600);
    const index = MOCK_DOCUMENTS.findIndex(d => d.id === id);
    if (index !== -1) {
      MOCK_DOCUMENTS.splice(index, 1);
      return { success: true };
    }
    return { success: false, error: 'Document not found' };
  },
  
  updateDocumentSelection: async (id: string, selected: boolean): Promise<ApiResponse<Document>> => {
    await delay(300);
    const doc = MOCK_DOCUMENTS.find(d => d.id === id);
    if (doc) {
      doc.selected = selected;
      return { success: true, data: doc };
    }
    return { success: false, error: 'Document not found' };
  },
  
  // Chat functionality
  sendChatMessage: async (message: string): Promise<ApiResponse<ChatMessage>> => {
    await delay(1000);
    
    // Generate a deterministic response based on the message
    let responseText = '';
    let sources: DocumentSource[] | undefined = undefined;
    
    if (message.toLowerCase().includes('revenue') || message.toLowerCase().includes('financial')) {
      responseText = "Based on the documents, revenue increased by 12% in 2023 compared to the previous year. The company is financially stable and planning expansion into European markets.";
      sources = MOCK_SOURCES['1'];
    } 
    else if (message.toLowerCase().includes('project') || message.toLowerCase().includes('timeline')) {
      responseText = "According to the Project Proposal document, the project timeline estimates completion within 8 months from approval.";
      sources = [MOCK_SOURCES['1'][1]];
    }
    else {
      responseText = "I couldn't find specific information about that in the uploaded documents. Could you please rephrase your question or upload more relevant documents?";
    }
    
    const response: ChatMessage = {
      id: Math.random().toString(36).substring(2, 9),
      role: 'assistant',
      content: responseText,
      timestamp: Date.now(),
      sources
    };
    
    return { success: true, data: response };
  }
};

// Export either real or mock API
export default useMockAPI ? mockApi : api;
