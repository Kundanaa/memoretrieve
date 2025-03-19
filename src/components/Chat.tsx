
import React, { useState, useRef, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ChatMessage, DocumentSource } from '@/types';
import { cn } from '@/lib/utils';
import { AnimatedTransition } from '@/components/AnimatedTransition';
import { SourceViewer } from '@/components/SourceViewer';
import { api } from '@/utils/api';
import { SendHorizonal, Bot, User, RefreshCcw, ThumbsUp, ThumbsDown } from 'lucide-react';

interface ChatProps {
  className?: string;
}

export const Chat: React.FC<ChatProps> = ({ className }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    
    try {
      const response = await api.sendChatMessage(input);
      
      if (response.success && response.data) {
        setMessages(prev => [...prev, response.data]);
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to get a response",
          variant: "destructive",
        });
        
        // Add error message
        setMessages(prev => [
          ...prev,
          {
            id: Date.now().toString(),
            role: 'system',
            content: "I'm sorry, there was an error processing your request. Please try again.",
            timestamp: Date.now(),
          }
        ]);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
      
      // Add error message
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'system',
          content: "I'm sorry, there was an error processing your request. Please try again.",
          timestamp: Date.now(),
        }
      ]);
    } finally {
      setLoading(false);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };
  
  const clearChat = () => {
    setMessages([]);
  };
  
  // Initialize with welcome message if needed
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: '0',
          role: 'system',
          content: "Hello! I'm your document assistant. Ask me questions about your uploaded documents, and I'll use RAG technology to provide relevant answers.",
          timestamp: Date.now(),
        }
      ]);
    }
  }, [messages.length]);
  
  return (
    <div className={cn("flex flex-col h-full", className)}>
      <div className="flex-1 overflow-y-auto pb-4">
        <div className="space-y-6 px-4">
          {messages.map((message, index) => (
            <MessageItem key={message.id} message={message} />
          ))}
          
          {loading && (
            <div className="flex justify-center">
              <div className="animate-pulse flex space-x-2 items-center">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <div className="w-2 h-2 bg-primary rounded-full"></div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      <div className="border-t border-border/50 p-4 glass-bg">
        <form onSubmit={handleSendMessage} className="flex flex-col space-y-4">
          <Textarea
            placeholder="Ask a question about your documents..."
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            disabled={loading}
            className="min-h-[80px] resize-none focus-visible:ring-1"
            autoFocus
          />
          
          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={clearChat}
              disabled={messages.length <= 1 || loading}
              className="text-xs"
            >
              <RefreshCcw className="w-3 h-3 mr-1" />
              Clear Chat
            </Button>
            
            <Button
              type="submit"
              disabled={!input.trim() || loading}
              className="min-w-[100px]"
            >
              {loading ? (
                "Thinking..."
              ) : (
                <>
                  <span>Send</span>
                  <SendHorizonal className="ml-2 w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface MessageItemProps {
  message: ChatMessage;
}

const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState<'up' | 'down' | null>(null);
  
  const handleMouseEnter = () => {
    if (message.role === 'assistant' && !feedbackGiven) {
      setShowFeedback(true);
    }
  };
  
  const handleMouseLeave = () => {
    if (!feedbackGiven) {
      setShowFeedback(false);
    }
  };
  
  const giveFeedback = (type: 'up' | 'down') => {
    setFeedbackGiven(type);
    setShowFeedback(false);
    
    // Here you would typically send this feedback to your backend
    console.log(`Feedback for message ${message.id}: ${type}`);
  };
  
  const isAssistant = message.role === 'assistant';
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';
  
  return (
    <AnimatedTransition 
      type={isUser ? "slide-up" : "slide-down"}
      className={cn(
        "flex w-full",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div 
        className={cn(
          "relative rounded-lg p-4 max-w-[85%]",
          isAssistant && "bg-secondary/50 border border-border/50 rounded-tl-sm",
          isUser && "bg-primary text-primary-foreground rounded-tr-sm",
          isSystem && "bg-muted/50 border border-border/50 text-muted-foreground rounded-tl-sm w-full max-w-full text-center italic text-sm"
        )}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="flex items-start">
          {(isAssistant || isSystem) && (
            <div className={cn(
              "mt-1 mr-3 rounded-full w-6 h-6 flex items-center justify-center",
              isAssistant ? "bg-primary/10 text-primary" : "bg-muted-foreground/10 text-muted-foreground"
            )}>
              {isAssistant ? (
                <Bot className="w-3.5 h-3.5" />
              ) : (
                <Bot className="w-3.5 h-3.5" />
              )}
            </div>
          )}
          
          <div className="space-y-2 flex-1">
            <div className={cn(
              "prose prose-sm max-w-none",
              isUser && "text-primary-foreground",
              isSystem && "text-muted-foreground"
            )}>
              {message.content.split('\n').map((line, index) => (
                <React.Fragment key={index}>
                  {line}
                  {index < message.content.split('\n').length - 1 && <br />}
                </React.Fragment>
              ))}
            </div>
            
            {message.sources && message.sources.length > 0 && (
              <SourceViewer sources={message.sources} className="mt-4" />
            )}
          </div>
          
          {isUser && (
            <div className="mt-1 ml-3 rounded-full w-6 h-6 bg-background text-foreground flex items-center justify-center">
              <User className="w-3.5 h-3.5" />
            </div>
          )}
        </div>
        
        {isAssistant && (showFeedback || feedbackGiven) && (
          <div className={cn(
            "absolute -bottom-4 left-10 flex space-x-2 items-center",
            feedbackGiven ? "opacity-50" : "opacity-90"
          )}>
            <Button 
              variant="outline" 
              size="icon" 
              className={cn(
                "h-7 w-7 rounded-full bg-background",
                feedbackGiven === 'up' && "text-primary"
              )}
              onClick={() => giveFeedback('up')}
              disabled={feedbackGiven !== null}
            >
              <ThumbsUp className="h-3 w-3" />
            </Button>
            
            <Button 
              variant="outline" 
              size="icon" 
              className={cn(
                "h-7 w-7 rounded-full bg-background",
                feedbackGiven === 'down' && "text-destructive"
              )}
              onClick={() => giveFeedback('down')}
              disabled={feedbackGiven !== null}
            >
              <ThumbsDown className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>
    </AnimatedTransition>
  );
};
