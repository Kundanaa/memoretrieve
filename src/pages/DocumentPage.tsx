
import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { DocumentUploader } from '@/components/DocumentUploader';
import { DocumentList } from '@/components/DocumentList';
import { useDocuments } from '@/hooks/useDocuments';
import { AnimatedTransition } from '@/components/AnimatedTransition';
import { RagSettingsDialog } from '@/components/RagSettingsDialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { FileText, Settings, AlertTriangle, ServerOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const DocumentPage = () => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [backendError, setBackendError] = useState(false);
  const { toast } = useToast();
  
  const {
    documents,
    loading,
    uploading,
    uploadDocument,
    deleteDocument,
    toggleDocumentSelection,
    error
  } = useDocuments();
  
  // Show a toast when there's a backend connection error
  useEffect(() => {
    if (error) {
      setBackendError(true);
      toast({
        title: "Backend Connection Issue",
        description: "Using mock data. Start the backend server or check connection settings.",
        variant: "destructive",
        duration: 5000,
      });
    } else {
      setBackendError(false);
    }
  }, [error, toast]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 mt-16 pt-10 pb-12 px-4 sm:px-6 md:px-8 max-w-6xl mx-auto w-full">
        <AnimatedTransition type="slide-up" className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <FileText className="w-5 h-5 mr-2 text-primary" />
              <h1 className="text-2xl font-semibold">Document Management</h1>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1" 
              onClick={() => setSettingsOpen(true)}
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">RAG Settings</span>
            </Button>
          </div>
          <p className="text-muted-foreground">
            Upload and manage your documents for RAG-based question answering.
          </p>
        </AnimatedTransition>
        
        {backendError && (
          <AnimatedTransition type="slide-up" className="mb-6">
            <Alert variant="destructive" className="mb-6">
              <ServerOff className="h-4 w-4 mr-2" />
              <AlertTitle>Backend Server Unavailable</AlertTitle>
              <AlertDescription>
                Currently using mock data. To use real functionality, make sure the backend server is running 
                and properly configured in the environment variables.
              </AlertDescription>
            </Alert>
          </AnimatedTransition>
        )}
        
        <AnimatedTransition type="slide-up" className="mb-8 mt-8">
          <DocumentUploader onUpload={uploadDocument} uploading={uploading} />
        </AnimatedTransition>
        
        <AnimatedTransition type="slide-up" className="mb-6 mt-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-medium">Your Documents</h2>
            <div className="text-sm text-muted-foreground">
              {documents.filter(d => d.selected).length} of {documents.length} selected for RAG
            </div>
          </div>
          
          <DocumentList
            documents={documents}
            loading={loading}
            onDelete={deleteDocument}
            onToggleSelect={toggleDocumentSelection}
          />
        </AnimatedTransition>
        
        <RagSettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
      </main>
    </div>
  );
};

export default DocumentPage;
