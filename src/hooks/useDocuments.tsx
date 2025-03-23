
import { useState, useEffect, useCallback } from 'react';
import { Document, ApiResponse } from '@/types';
import { api } from '@/utils/api';
import { useToast } from '@/hooks/use-toast';

export function useDocuments() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.getDocuments();
      if (response.success && response.data) {
        setDocuments(response.data);
      } else {
        setError(response.error || "Unknown error");
        toast({
          title: "Error loading documents",
          description: response.error || "An unknown error occurred",
          variant: "destructive",
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);
      toast({
        title: "Error loading documents",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const uploadDocument = useCallback(async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      const response = await api.uploadDocument(file);
      if (response.success && response.data) {
        setDocuments(prev => [...prev, response.data]);
        toast({
          title: "Document uploaded",
          description: "Your document is being processed and will be available shortly.",
        });
        return response.data;
      } else {
        setError(response.error || "Unknown error");
        toast({
          title: "Error uploading document",
          description: response.error || "An unknown error occurred",
          variant: "destructive",
        });
        return null;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);
      toast({
        title: "Error uploading document",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    } finally {
      setUploading(false);
    }
  }, [toast]);

  const deleteDocument = useCallback(async (id: string) => {
    setError(null);
    try {
      const response = await api.deleteDocument(id);
      if (response.success) {
        setDocuments(prev => prev.filter(doc => doc.id !== id));
        toast({
          title: "Document deleted",
          description: "The document has been removed successfully.",
        });
      } else {
        setError(response.error || "Unknown error");
        toast({
          title: "Error deleting document",
          description: response.error || "An unknown error occurred",
          variant: "destructive",
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);
      toast({
        title: "Error deleting document",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [toast]);

  const toggleDocumentSelection = useCallback(async (id: string) => {
    const doc = documents.find(d => d.id === id);
    if (!doc) return;
    
    setError(null);
    try {
      const response = await api.updateDocumentSelection(id, !doc.selected);
      if (response.success && response.data) {
        setDocuments(prev => 
          prev.map(d => d.id === id ? { ...d, selected: !d.selected } : d)
        );
      } else {
        setError(response.error || "Unknown error");
        toast({
          title: "Error updating document",
          description: response.error || "An unknown error occurred",
          variant: "destructive",
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);
      toast({
        title: "Error updating document",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [documents, toast]);

  return {
    documents,
    loading,
    uploading,
    error,
    fetchDocuments,
    uploadDocument,
    deleteDocument,
    toggleDocumentSelection,
  };
}
