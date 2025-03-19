
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, File, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { AnimatedTransition } from '@/components/AnimatedTransition';
import { cn } from '@/lib/utils';

interface DocumentUploaderProps {
  onUpload: (file: File) => Promise<any>;
  uploading: boolean;
  className?: string;
}

export const DocumentUploader: React.FC<DocumentUploaderProps> = ({
  onUpload,
  uploading,
  className,
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [expanded, setExpanded] = useState(true);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Simulate progress
  React.useEffect(() => {
    if (uploading) {
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          const next = prev + (100 - prev) * 0.1;
          return next >= 95 ? 95 : next;
        });
      }, 300);
      
      return () => {
        clearInterval(interval);
        setUploadProgress(0);
      };
    } else if (uploadProgress > 0) {
      setUploadProgress(100);
      const timeout = setTimeout(() => {
        setUploadProgress(0);
        setSelectedFile(null);
      }, 1000);
      
      return () => clearTimeout(timeout);
    }
  }, [uploading, uploadProgress]);
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };
  
  const handleUploadClick = () => {
    if (selectedFile) {
      onUpload(selectedFile);
    } else {
      fileInputRef.current?.click();
    }
  };
  
  const handleClearFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const toggleExpanded = () => {
    setExpanded(prev => !prev);
  };
  
  return (
    <div className={cn("rounded-lg border border-border/50 overflow-hidden", className)}>
      <div 
        className="p-4 flex items-center justify-between bg-secondary/40 cursor-pointer"
        onClick={toggleExpanded}
      >
        <div className="flex items-center font-medium">
          <Upload className="w-4 h-4 mr-2" />
          Upload Documents
        </div>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>
      
      {expanded && (
        <AnimatedTransition type="slide-up">
          <div 
            className={cn(
              "p-6 border-t border-border/50 flex flex-col items-center justify-center transition-all",
              dragOver ? "bg-secondary/40" : "bg-transparent"
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
              accept=".pdf,.docx,.doc,.txt,.md"
            />
            
            {!selectedFile && (
              <div className="text-center mb-4">
                <div className="w-12 h-12 rounded-full bg-secondary/60 flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-6 h-6 text-muted-foreground" />
                </div>
                <h3 className="font-medium mb-1">Upload a document</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Drag and drop a file here or click to browse
                </p>
                <p className="text-xs text-muted-foreground">
                  Supports PDF, DOCX, TXT, and MD files
                </p>
              </div>
            )}
            
            {selectedFile && (
              <div className="w-full mb-4">
                <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-md mb-3">
                  <div className="flex items-center">
                    <File className="w-5 h-5 mr-2 text-muted-foreground" />
                    <div className="truncate max-w-[200px]">
                      <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(selectedFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleClearFile}
                    disabled={uploading}
                    className="h-8 w-8"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                {uploadProgress > 0 && (
                  <div className="w-full space-y-1">
                    <Progress value={uploadProgress} className="h-2" />
                    <p className="text-xs text-right text-muted-foreground">
                      {uploadProgress >= 100 ? 'Complete!' : `${Math.round(uploadProgress)}%`}
                    </p>
                  </div>
                )}
              </div>
            )}
            
            <Button
              onClick={handleUploadClick}
              disabled={uploading}
              className="min-w-[120px]"
            >
              {uploading 
                ? "Uploading..." 
                : selectedFile 
                  ? "Upload File" 
                  : "Browse Files"
              }
            </Button>
          </div>
        </AnimatedTransition>
      )}
    </div>
  );
};
