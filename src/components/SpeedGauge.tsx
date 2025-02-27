
import { useMemo } from 'react';
import { MAX_SPEED_MPH } from '@/lib/constants';

interface SpeedGaugeProps {
  speed: number;
}

export function SpeedGauge({ speed }: SpeedGaugeProps) {
  // Calculate needle rotation angle
  const needleRotation = useMemo(() => {
    // Map speed from 0-MAX_SPEED to -120-120 degrees
    const angle = -120 + (speed / MAX_SPEED_MPH) * 240;
    return `rotate(${angle}deg)`;
  }, [speed]);

  // Generate tick marks
  const ticks = useMemo(() => {
    return Array.from({ length: 13 }).map((_, i) => {
      const isLarge = i % 2 === 0;
      const angle = -120 + (i / 12) * 240;
      
      return (
        <div 
          key={i}
          className={`gauge-tick ${isLarge ? 'gauge-tick-large' : ''}`}
          style={{ transform: `rotate(${angle}deg)` }}
        />
      );
    });
  }, []);

  // Format speed for display
  const formattedSpeed = useMemo(() => {
    return Math.round(speed).toLocaleString();
  }, [speed]);

  return (
    <div className="flex flex-col items-center">
      <div className="gauge-container">
        {/* Tick marks */}
        <div className="gauge-ticks">
          {ticks}
        </div>
        
        {/* Value display */}
        <div className="gauge-value">
          <span>{formattedSpeed}</span>
        </div>
        
        {/* Needle */}
        <div 
          className="gauge-needle"
          style={{ transform: needleRotation }}
        />
      </div>
      <div className="gauge-label">MPH</div>
    </div>
  );
}
