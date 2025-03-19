
import React, { useState } from 'react';
import { DocumentSource } from '@/types';
import { cn } from '@/lib/utils';
import { FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AnimatedTransition } from '@/components/AnimatedTransition';

interface SourceViewerProps {
  sources: DocumentSource[];
  className?: string;
}

export const SourceViewer: React.FC<SourceViewerProps> = ({
  sources,
  className,
}) => {
  const [expanded, setExpanded] = useState(true);
  
  const toggleExpanded = () => {
    setExpanded(prev => !prev);
  };
  
  if (!sources.length) return null;
  
  return (
    <div className={cn("rounded-lg border border-border/50 overflow-hidden", className)}>
      <div 
        className="p-4 flex items-center justify-between bg-secondary/40 cursor-pointer"
        onClick={toggleExpanded}
      >
        <div className="flex items-center font-medium">
          <FileText className="w-4 h-4 mr-2" />
          Sources ({sources.length})
        </div>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>
      
      {expanded && (
        <AnimatedTransition type="slide-up">
          <div className="p-4 max-h-[300px] overflow-y-auto">
            <div className="space-y-4">
              {sources.map((source, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FileText className="w-4 h-4 mr-2 text-muted-foreground" />
                      <h3 className="font-medium text-sm">{source.documentName}</h3>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Relevance: {(source.relevanceScore * 100).toFixed(0)}%
                    </div>
                  </div>
                  
                  <div className="pl-6 border-l-2 border-border/50 space-y-2">
                    {source.excerpts.map((excerpt, i) => (
                      <div key={i} className="text-sm p-2 bg-secondary/20 rounded">
                        "{excerpt}"
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </AnimatedTransition>
      )}
    </div>
  );
};
