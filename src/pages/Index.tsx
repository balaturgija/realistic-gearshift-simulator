
import { useEffect } from "react";
import { Dashboard } from "@/components/Dashboard";

const Index = () => {
  // Set dark theme and full height
  useEffect(() => {
    document.documentElement.classList.add('dark');
    document.body.style.minHeight = '100vh';
    document.body.style.height = '100vh';
    document.body.style.overflow = 'hidden';
    document.body.style.backgroundImage = 'radial-gradient(circle at 50% 0%, #292D3E 0%, #1A1F2C 70%)';
    
    return () => {
      document.documentElement.classList.remove('dark');
      document.body.style.minHeight = '';
      document.body.style.height = '';
      document.body.style.overflow = '';
      document.body.style.backgroundImage = '';
    };
  }, []);

  return (
    <div className="h-screen overflow-hidden">
      <Dashboard />
    </div>
  );
};

export default Index;
