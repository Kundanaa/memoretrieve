
import React from 'react';
import { Header } from '@/components/Header';
import { Chat } from '@/components/Chat';
import { AnimatedTransition } from '@/components/AnimatedTransition';
import { MessageSquare } from 'lucide-react';

const ChatPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 mt-16 pt-10 pb-12 px-4 sm:px-6 md:px-8 max-w-6xl mx-auto w-full flex flex-col">
        <AnimatedTransition type="slide-up" className="mb-6">
          <div className="flex items-center mb-2">
            <MessageSquare className="w-5 h-5 mr-2 text-primary" />
            <h1 className="text-2xl font-semibold">RAG-based Chat</h1>
          </div>
          <p className="text-muted-foreground">
            Ask questions about your documents and get AI-powered answers with source references.
          </p>
        </AnimatedTransition>
        
        <div className="flex-1 bg-card/30 border border-border/50 rounded-lg overflow-hidden flex flex-col">
          <Chat className="flex-1" />
        </div>
      </main>
    </div>
  );
};

export default ChatPage;
