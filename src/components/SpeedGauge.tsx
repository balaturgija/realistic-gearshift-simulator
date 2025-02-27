
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

  // Generate tick numbers
  const tickNumbers = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      // 0, 40, 80, 120, 160, 200, 220
      const value = i < 6 ? i * 40 : 220;
      
      // Calculate position
      const angle = -120 + (value / MAX_SPEED_MPH) * 240;
      const radians = (angle * Math.PI) / 180;
      
      // Position numbers at 80% of gauge radius
      const x = 50 + 40 * Math.cos(radians);
      const y = 50 + 40 * Math.sin(radians);
      
      return (
        <div 
          key={i}
          className="absolute text-xs font-medium text-dashboard-text"
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
        
        {/* Tick numbers */}
        <div className="gauge-numbers">
          {tickNumbers}
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
