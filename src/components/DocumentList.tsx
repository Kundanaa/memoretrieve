
import React from 'react';
import { 
  File, 
  Trash2, 
  Check, 
  AlertCircle,
  Clock,
  FileText,
  FileSpreadsheet,
  FileCode,
  MoreVertical
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Document } from '@/types';
import { AnimatedTransition } from '@/components/AnimatedTransition';
import { EmptyState } from '@/components/EmptyState';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface DocumentListProps {
  documents: Document[];
  loading: boolean;
  onDelete: (id: string) => void;
  onToggleSelect: (id: string) => void;
  className?: string;
}

export const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  loading,
  onDelete,
  onToggleSelect,
  className,
}) => {
  // Helper function to get the appropriate icon based on file type
  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) {
      return <FileText className="w-5 h-5" />;
    } else if (type.includes('spreadsheet') || type.includes('excel')) {
      return <FileSpreadsheet className="w-5 h-5" />;
    } else if (type.includes('code') || type.includes('json')) {
      return <FileCode className="w-5 h-5" />;
    } else {
      return <File className="w-5 h-5" />;
    }
  };
  
  // Helper function to format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) {
      return `${bytes} B`;
    } else if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    } else {
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }
  };
  
  // Helper function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };
  
  // Get status icon and color
  const getStatusInfo = (status: Document['status']) => {
    switch (status) {
      case 'completed':
        return { icon: <Check className="w-4 h-4" />, color: 'text-green-500' };
      case 'processing':
        return { icon: <Clock className="w-4 h-4" />, color: 'text-amber-500' };
      case 'error':
        return { icon: <AlertCircle className="w-4 h-4" />, color: 'text-red-500' };
      default:
        return { icon: <Clock className="w-4 h-4" />, color: 'text-muted-foreground' };
    }
  };
  
  if (loading) {
    return (
      <div className={cn("space-y-3", className)}>
        {Array.from({ length: 3 }).map((_, index) => (
          <div 
            key={index} 
            className="animate-pulse p-4 rounded-lg border border-border/50 bg-card/30"
          >
            <div className="flex items-center">
              <div className="w-5 h-5 bg-muted rounded mr-3"></div>
              <div className="flex-1">
                <div className="h-5 bg-muted rounded w-1/3 mb-2"></div>
                <div className="h-4 bg-muted rounded w-1/4"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  if (documents.length === 0) {
    return (
      <AnimatedTransition type="fade" className={className}>
        <EmptyState
          icon={<FileText className="w-10 h-10 opacity-70" />}
          title="No documents uploaded"
          description="Upload your first document to get started with RAG-based Q&A."
        />
      </AnimatedTransition>
    );
  }
  
  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between px-2 text-sm text-muted-foreground">
        <div className="flex-1">Document</div>
        <div className="w-20 text-right">Size</div>
        <div className="w-28 text-right">Uploaded</div>
        <div className="w-24 text-center">Status</div>
        <div className="w-20 text-center">Include</div>
        <div className="w-10"></div>
      </div>
      
      {documents.map(doc => {
        const statusInfo = getStatusInfo(doc.status);
        
        return (
          <AnimatedTransition 
            key={doc.id} 
            type="slide-up"
            className={cn(
              "p-4 rounded-lg border border-border/50 bg-card/30",
              "hover:bg-card/50 transition-colors",
              doc.selected && "ring-1 ring-primary/20"
            )}
          >
            <div className="flex items-center">
              <div className="text-muted-foreground mr-3">
                {getFileIcon(doc.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{doc.name}</p>
                <p className="text-xs text-muted-foreground">
                  {doc.type.split('/')[1]}
                </p>
              </div>
              
              <div className="w-20 text-sm text-right">
                {formatFileSize(doc.size)}
              </div>
              
              <div className="w-28 text-sm text-right text-muted-foreground">
                {formatDate(doc.uploadedAt)}
              </div>
              
              <div className="w-24 text-center">
                <div className={cn("inline-flex items-center px-2 py-1 rounded-full text-xs", statusInfo.color)}>
                  {statusInfo.icon}
                  <span className="ml-1 capitalize">{doc.status}</span>
                </div>
              </div>
              
              <div className="w-20 text-center">
                <Checkbox 
                  checked={doc.selected}
                  disabled={doc.status !== 'completed'}
                  onCheckedChange={() => onToggleSelect(doc.id)}
                  className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                />
              </div>
              
              <div className="w-10 flex justify-end">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                      <span className="sr-only">More options</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => onDelete(doc.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </AnimatedTransition>
        );
      })}
    </div>
  );
};
