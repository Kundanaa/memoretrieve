
import React from 'react';
import { cn } from '@/lib/utils';
import { AnimatedTransition } from '@/components/AnimatedTransition';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className,
}) => {
  return (
    <AnimatedTransition type="fade" duration={0.5}>
      <div 
        className={cn(
          "flex flex-col items-center justify-center text-center p-8 rounded-lg border border-border/50 bg-secondary/20",
          "min-h-[300px] w-full max-w-md mx-auto",
          className
        )}
      >
        {icon && (
          <div className="mb-6 text-muted-foreground w-16 h-16 flex items-center justify-center">
            {icon}
          </div>
        )}
        <h3 className="text-xl font-medium mb-2">{title}</h3>
        {description && (
          <p className="text-muted-foreground max-w-xs mb-6">{description}</p>
        )}
        {action && <div className="mt-2">{action}</div>}
      </div>
    </AnimatedTransition>
  );
};
