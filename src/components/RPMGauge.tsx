
import { useMemo, useState, useEffect } from 'react';
import { ENGINE_MAX_RPM, REDLINE_RPM } from '@/lib/constants';

interface RPMGaugeProps {
  rpm: number;
  reachedRedline?: boolean;
  gear?: number;
  isRunning: boolean;
}

export function RPMGauge({ rpm, reachedRedline = false, gear = 0, isRunning = false }: RPMGaugeProps) {
  // State for bounce effect
  const [bounceOffset, setBounceOffset] = useState(0);

  // Format RPM for display
  const formattedRPM = useMemo(() => {
    return Math.round(rpm).toLocaleString();
  }, [rpm]);

  // Calculate percentage for the gauge animation
  const gaugePercentage = useMemo(() => {
    // Apply bounce effect at redline
    let adjustedPercentage = (rpm / ENGINE_MAX_RPM) * 100;
    
    // Add bounce effect if at redline
    if (reachedRedline) {
      adjustedPercentage += bounceOffset;
    }
    
    return Math.min(100, Math.max(0, adjustedPercentage));
  }, [rpm, reachedRedline, bounceOffset]);

  // Handle bounce effect at redline
  useEffect(() => {
    if (reachedRedline) {
      let bounceDirection = -1;
      let bounceStrength = 3;
      
      const bounceInterval = setInterval(() => {
        setBounceOffset(prev => {
          // Calculate new bounce value
          const newValue = prev + (bounceDirection * bounceStrength);
          
          // Reduce bounce strength over time
          bounceStrength *= 0.9;
          
          // Change direction when limits are reached
          if (newValue <= -4 || newValue >= 4) {
            bounceDirection *= -1;
          }
          
          // Stop the bounce effect when it gets small enough
          if (Math.abs(bounceStrength) < 0.1) {
            clearInterval(bounceInterval);
            return 0;
          }
          
          return newValue;
        });
      }, 50);
      
      return () => clearInterval(bounceInterval);
    } else {
      setBounceOffset(0);
    }
  }, [reachedRedline]);

  return (
    <div className="flex flex-col items-center w-full max-w-md">
      <div className="gauge-container relative w-60 h-60 rounded-full bg-gray-900/50 backdrop-blur-sm border border-gray-700 flex items-center justify-center overflow-hidden">
        {/* Value display styled like the reference image */}
        <div className="gauge-value text-center z-10">
          <span className={`text-4xl sm:text-5xl font-bold ${reachedRedline ? 'text-red-500' : 'text-white'}`}>
            {formattedRPM}
          </span>
          <span className="text-xs text-gray-400 block mt-1">RPM</span>
        </div>
        
        {/* Show redline marker */}
        {reachedRedline && (
          <div className="absolute top-3 right-3">
            <div className="w-6 h-6 rounded-full border border-red-500 flex items-center justify-center">
              <span className="text-xs text-red-500">90</span>
            </div>
          </div>
        )}
        
        {/* Arc at the right side (now direction right-to-left) */}
        <div className="absolute top-0 right-0 w-full h-full">
          <svg width="100%" height="100%" viewBox="0 0 100 100">
            <path
              d="M 80 50 A 30 30 0 0 0 50 20"
              fill="none"
              stroke="#EF4444"
              strokeWidth="5"
              strokeLinecap="round"
              style={{
                strokeDasharray: '47.1',
                strokeDashoffset: `${47.1 - (gaugePercentage / 100) * 47.1}`,
              }}
            />
          </svg>
        </div>
        
        {/* Gear indicator in place of D */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-gray-800 rounded-full w-8 h-8 flex items-center justify-center border border-gray-700">
          {isRunning && (
            <span className="text-white font-bold">
              {gear === 0 ? 'N' : gear}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
