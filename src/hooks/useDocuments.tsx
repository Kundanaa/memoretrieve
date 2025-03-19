
import { useState, useEffect, useCallback } from 'react';
import { Document, ApiResponse } from '@/types';
import { api } from '@/utils/api';
import { useToast } from '@/components/ui/use-toast';

export function useDocuments() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.getDocuments();
      if (response.success && response.data) {
        setDocuments(response.data);
      } else {
        toast({
          title: "Error loading documents",
          description: response.error || "An unknown error occurred",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error loading documents",
        description: error instanceof Error ? error.message : "An unknown error occurred",
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
        toast({
          title: "Error uploading document",
          description: response.error || "An unknown error occurred",
          variant: "destructive",
        });
        return null;
      }
    } catch (error) {
      toast({
        title: "Error uploading document",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
      return null;
    } finally {
      setUploading(false);
    }
  }, [toast]);

  const deleteDocument = useCallback(async (id: string) => {
    try {
      const response = await api.deleteDocument(id);
      if (response.success) {
        setDocuments(prev => prev.filter(doc => doc.id !== id));
        toast({
          title: "Document deleted",
          description: "The document has been removed successfully.",
        });
      } else {
        toast({
          title: "Error deleting document",
          description: response.error || "An unknown error occurred",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error deleting document",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  }, [toast]);

  const toggleDocumentSelection = useCallback(async (id: string) => {
    const doc = documents.find(d => d.id === id);
    if (!doc) return;
    
    try {
      const response = await api.updateDocumentSelection(id, !doc.selected);
      if (response.success && response.data) {
        setDocuments(prev => 
          prev.map(d => d.id === id ? { ...d, selected: !d.selected } : d)
        );
      } else {
        toast({
          title: "Error updating document",
          description: response.error || "An unknown error occurred",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error updating document",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  }, [documents, toast]);

  return {
    documents,
    loading,
    uploading,
    fetchDocuments,
    uploadDocument,
    deleteDocument,
    toggleDocumentSelection,
  };
}
