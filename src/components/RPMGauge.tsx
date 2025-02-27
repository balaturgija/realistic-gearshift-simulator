
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
