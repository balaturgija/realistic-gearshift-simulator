
import { useMemo } from 'react';
import { MAX_SPEED_MPH } from '@/lib/constants';

interface SpeedGaugeProps {
  speed: number;
  gear?: number;
  isRunning: boolean;
}

export function SpeedGauge({ speed, gear = 0, isRunning = false }: SpeedGaugeProps) {
  // Format speed for display
  const formattedSpeed = useMemo(() => {
    return Math.round(speed).toLocaleString();
  }, [speed]);

  // Calculate percentage of max speed for the gauge
  const gaugePercentage = useMemo(() => {
    return (speed / MAX_SPEED_MPH) * 100;
  }, [speed]);

  return (
    <div className="flex flex-col items-center w-full max-w-md">
      <div className="gauge-container relative w-60 h-60 rounded-full bg-gray-900/50 backdrop-blur-sm border border-gray-700 flex items-center justify-center overflow-hidden">
        {/* Value display styled like the reference image */}
        <div className="gauge-value text-center z-10">
          <span className="text-4xl sm:text-5xl font-bold text-white">{formattedSpeed}</span>
          <span className="text-xs text-gray-400 block mt-1">km/h</span>
        </div>
        
        {/* Arc at the left side (left-to-right, as before) */}
        <div className="absolute top-0 left-0 w-full h-full">
          <svg width="100%" height="100%" viewBox="0 0 100 100">
            <path
              d="M 20 50 A 30 30 0 0 1 50 20"
              fill="none"
              stroke="#10B981"
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
