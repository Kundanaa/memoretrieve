
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AnimatedTransitionProps {
  children: React.ReactNode;
  className?: string;
  type?: 'fade' | 'slide-up' | 'slide-down' | 'zoom';
  duration?: number;
}

const variants = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  },
  'slide-up': {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 }
  },
  'slide-down': {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  },
  zoom: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 }
  }
};

export const AnimatedTransition: React.FC<AnimatedTransitionProps> = ({ 
  children, 
  className, 
  type = 'fade',
  duration = 0.3
}) => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        className={cn(className)}
        initial={variants[type].initial}
        animate={variants[type].animate}
        exit={variants[type].exit}
        transition={{ duration, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};
