
import { useMemo } from 'react';
import { ENGINE_MAX_RPM, REDLINE_RPM } from '@/lib/constants';

interface RPMGaugeProps {
  rpm: number;
  reachedRedline?: boolean;
}

export function RPMGauge({ rpm, reachedRedline = false }: RPMGaugeProps) {
  // Calculate needle rotation angle
  const needleRotation = useMemo(() => {
    // Map RPM from 0-MAX_RPM to -120-120 degrees
    const angle = -120 + (rpm / ENGINE_MAX_RPM) * 240;
    return `rotate(${angle}deg)`;
  }, [rpm]);

  // Generate tick marks
  const ticks = useMemo(() => {
    return Array.from({ length: 17 }).map((_, i) => {
      const isLarge = i % 4 === 0;
      const angle = -120 + (i / 16) * 240;
      const isRedline = (i / 16) * ENGINE_MAX_RPM >= REDLINE_RPM;
      
      return (
        <div 
          key={i}
          className={`gauge-tick ${isLarge ? 'gauge-tick-large' : ''} ${isRedline ? 'gauge-tick-redline' : ''}`}
          style={{ transform: `rotate(${angle}deg)` }}
        />
      );
    });
  }, []);

  // Generate tick numbers
  const tickNumbers = useMemo(() => {
    return Array.from({ length: 9 }).map((_, i) => {
      // 0, 1, 2, 3, 4, 5, 6, 7, 8
      const value = i;
      
      // Calculate position
      const angle = -120 + (i / 8) * 240;
      const radians = (angle * Math.PI) / 180;
      
      // Position numbers at 80% of gauge radius
      const x = 50 + 40 * Math.cos(radians);
      const y = 50 + 40 * Math.sin(radians);
      
      const isRedline = value * 1000 >= REDLINE_RPM;
      
      return (
        <div 
          key={i}
          className={`absolute text-xs font-medium ${isRedline ? 'text-dashboard-gauge-redline' : 'text-dashboard-text'}`}
          style={{ 
            left: `${x}%`, 
            top: `${y}%`, 
            transform: 'translate(-50%, -50%)'
          }}
        >
          {value}
        </div>
      );
    });
  }, []);

  // Format RPM for display
  const formattedRPM = useMemo(() => {
    return Math.round(rpm).toLocaleString();
  }, [rpm]);

  return (
    <div className="flex flex-col items-center">
      <div className="gauge-container">
        {/* Tick marks */}
        <div className="gauge-ticks">
          {ticks}
        </div>
        
        {/* Tick numbers */}
        <div className="gauge-numbers">
          {tickNumbers}
        </div>
        
        {/* Value display */}
        <div className="gauge-value">
          <span className={reachedRedline ? 'text-dashboard-gauge-redline animate-pulse-subtle' : ''}>
            {formattedRPM}
          </span>
        </div>
        
        {/* Needle */}
        <div 
          className="gauge-needle"
          style={{ transform: needleRotation }}
        />
      </div>
      <div className="gauge-label">RPM x1000</div>
    </div>
  );
}
