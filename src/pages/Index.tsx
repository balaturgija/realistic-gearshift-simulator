
import { useEffect, useState } from "react";
import { Dashboard } from "@/components/Dashboard";
import { toast } from "@/components/ui/use-toast";

const Index = () => {
  const [isScrollLocked, setIsScrollLocked] = useState(false);
  
  // Set dark theme and initial styling
  useEffect(() => {
    document.documentElement.classList.add('dark');
    document.body.style.minHeight = '100vh';
    document.body.style.backgroundImage = 'radial-gradient(circle at 50% 0%, #292D3E 0%, #1A1F2C 70%)';
    
    // Handle keyboard events for scroll locking
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'l') {
        setIsScrollLocked(prev => {
          const newState = !prev;
          if (newState) {
            document.body.style.overflow = 'hidden';
            toast({
              title: "Screen Locked",
              description: "Press 'L' again to unlock scrolling",
              duration: 2000,
            });
          } else {
            document.body.style.overflow = 'auto';
            toast({
              title: "Screen Unlocked",
              description: "You can now scroll freely",
              duration: 2000,
            });
          }
          return newState;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.documentElement.classList.remove('dark');
      document.body.style.minHeight = '';
      document.body.style.backgroundImage = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className="min-h-screen">
      <Dashboard />
      
      {isScrollLocked && (
        <div className="fixed bottom-4 right-4 bg-dashboard-panel px-3 py-2 rounded-lg border border-gray-700 shadow-lg z-50">
          <span className="text-sm font-medium flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            Screen Locked • Press L to unlock
          </span>
        </div>
      )}
    </div>
  );
};

export default Index;
