
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AnimatedTransition } from '@/components/AnimatedTransition';
import { 
  FileText, 
  MessageSquare, 
  Menu, 
  X
} from 'lucide-react';

interface HeaderProps {
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({ className }) => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(prev => !prev);
  };
  
  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/documents', label: 'Documents', icon: <FileText className="w-4 h-4 mr-2" /> },
    { path: '/chat', label: 'RAG Chat', icon: <MessageSquare className="w-4 h-4 mr-2" /> },
  ];
  
  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header 
      className={cn(
        "z-40 fixed top-0 left-0 right-0 backdrop-blur-md h-16 glass-bg border-b border-border/50",
        "flex items-center justify-between px-6 transition-all duration-300 ease-in-out",
        className
      )}
    >
      {/* Logo */}
      <div className="flex items-center">
        <Link to="/" className="flex items-center">
          <span className="sr-only">MemoRetrieve</span>
          <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center text-white text-lg font-semibold mr-3">
            M
          </div>
          <span className="text-xl font-semibold hidden sm:inline-block">MemoRetrieve</span>
        </Link>
      </div>
      
      {/* Desktop Navigation */}
      <nav className="hidden md:flex space-x-1 items-center">
        {navItems.map(item => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "px-4 py-2 rounded-md text-sm flex items-center transition-all",
              "hover:bg-secondary",
              isActive(item.path) 
                ? "font-medium text-primary bg-primary/5"
                : "text-muted-foreground"
            )}
          >
            {item.icon && item.icon}
            {item.label}
          </Link>
        ))}
      </nav>
      
      {/* Mobile Menu Button */}
      <div className="md:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleMobileMenu}
          aria-expanded={mobileMenuOpen}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
      </div>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <AnimatedTransition
          type="slide-down"
          className="absolute top-16 left-0 right-0 glass-bg border-b border-border/50 md:hidden"
        >
          <div className="p-4 flex flex-col space-y-2">
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "px-4 py-3 rounded-md text-sm flex items-center",
                  "hover:bg-secondary",
                  isActive(item.path) 
                    ? "font-medium text-primary bg-primary/5"
                    : "text-muted-foreground"
                )}
              >
                {item.icon && item.icon}
                {item.label}
              </Link>
            ))}
          </div>
        </AnimatedTransition>
      )}
    </header>
  );
};
