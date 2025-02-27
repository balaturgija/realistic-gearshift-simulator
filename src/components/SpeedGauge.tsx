
import { useMemo } from 'react';
import { MAX_SPEED_MPH } from '@/lib/constants';

interface SpeedGaugeProps {
  speed: number;
}

export function SpeedGauge({ speed }: SpeedGaugeProps) {
  // Format speed for display
  const formattedSpeed = useMemo(() => {
    return Math.round(speed).toLocaleString();
  }, [speed]);

  return (
    <div className="flex flex-col items-center">
      <div className="gauge-container bg-white">
        {/* Value display styled like the reference image */}
        <div className="gauge-value">
          <span className="text-4xl sm:text-5xl font-bold text-black">{formattedSpeed}</span>
          <span className="text-xs text-gray-500 block mt-1">km/h</span>
        </div>
        
        {/* Arc at the left side */}
        <div className="absolute top-0 left-0 w-full h-full">
          <svg width="100%" height="100%" viewBox="0 0 100 100">
            <path
              d="M 20 50 A 30 30 0 0 1 50 20"
              fill="none"
              stroke="#10B981"
              strokeWidth="5"
              strokeLinecap="round"
            />
          </svg>
        </div>
        
        {/* D indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center">
          <span className="text-black font-bold">D</span>
        </div>
      </div>
    </div>
  );
}
