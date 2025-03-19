
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { FileText, MessageSquare, Database, ArrowRight } from 'lucide-react';
import { AnimatedTransition } from '@/components/AnimatedTransition';
import { Header } from '@/components/Header';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 mt-16 pt-6 pb-12 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto w-full">
        <section className="py-12 sm:py-20 md:py-28">
          <AnimatedTransition type="slide-up" className="text-center max-w-4xl mx-auto px-4">
            <div className="inline-flex items-center px-3 py-1 mb-6 text-sm rounded-full bg-primary/10 text-primary">
              <span>Document Intelligence</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight mb-6">
              Unlock insights from your documents with AI
            </h1>
            
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-12">
              MemoRetrieve uses advanced Retrieval-Augmented Generation (RAG) technology to help
              you extract knowledge and get precise answers from your documents.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" asChild className="min-w-[180px]">
                <Link to="/documents">
                  <FileText className="mr-2 h-5 w-5" />
                  Upload Documents
                </Link>
              </Button>
              
              <Button variant="outline" size="lg" asChild className="min-w-[180px]">
                <Link to="/chat">
                  <MessageSquare className="mr-2 h-5 w-5" />
                  Start Chatting
                </Link>
              </Button>
            </div>
          </AnimatedTransition>
        </section>
        
        <section className="py-16">
          <div className="max-w-5xl mx-auto px-4">
            <AnimatedTransition type="slide-up" className="text-center mb-16">
              <h2 className="text-3xl font-semibold mb-3">How It Works</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                MemoRetrieve processes your documents and uses AI to answer your questions with precision.
              </p>
            </AnimatedTransition>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <AnimatedTransition type="slide-up" className="delay-[100ms]">
                <div className="bg-card/30 border border-border/50 p-6 rounded-xl">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-medium mb-2">Upload Documents</h3>
                  <p className="text-muted-foreground">
                    Upload PDF, DOCX, TXT files and let our system process them for retrieval.
                  </p>
                </div>
              </AnimatedTransition>
              
              <AnimatedTransition type="slide-up" className="delay-[200ms]">
                <div className="bg-card/30 border border-border/50 p-6 rounded-xl">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Database className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-medium mb-2">Intelligent Indexing</h3>
                  <p className="text-muted-foreground">
                    We use advanced embedding techniques to understand and index your document content.
                  </p>
                </div>
              </AnimatedTransition>
              
              <AnimatedTransition type="slide-up" className="delay-[300ms]">
                <div className="bg-card/30 border border-border/50 p-6 rounded-xl">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <MessageSquare className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-medium mb-2">Ask Questions</h3>
                  <p className="text-muted-foreground">
                    Chat naturally with our AI to get accurate answers based on your document content.
                  </p>
                </div>
              </AnimatedTransition>
            </div>
          </div>
        </section>
        
        <section className="py-16 bg-secondary/30 rounded-2xl">
          <div className="max-w-5xl mx-auto px-4 text-center">
            <AnimatedTransition type="slide-up">
              <h2 className="text-3xl font-semibold mb-6">Ready to extract value from your documents?</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
                Start by uploading your documents and let MemoRetrieve help you find the information you need.
              </p>
              
              <Button size="lg" asChild>
                <Link to="/documents">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </AnimatedTransition>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;
