
import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { DocumentUploader } from '@/components/DocumentUploader';
import { DocumentList } from '@/components/DocumentList';
import { useDocuments } from '@/hooks/useDocuments';
import { AnimatedTransition } from '@/components/AnimatedTransition';
import { RagSettingsDialog } from '@/components/RagSettingsDialog';
import { Button } from '@/components/ui/button';
import { FileText, Settings } from 'lucide-react';

const DocumentPage = () => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const {
    documents,
    loading,
    uploading,
    uploadDocument,
    deleteDocument,
    toggleDocumentSelection,
  } = useDocuments();

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
