
import { useMemo } from 'react';
import { ENGINE_MAX_RPM, REDLINE_RPM } from '@/lib/constants';

interface RPMGaugeProps {
  rpm: number;
  reachedRedline?: boolean;
}

export function RPMGauge({ rpm, reachedRedline = false }: RPMGaugeProps) {
  // Format RPM for display
  const formattedRPM = useMemo(() => {
    return Math.round(rpm).toLocaleString();
  }, [rpm]);

  // Calculate the position of the red mark (90% point)
  const redlinePercentage = useMemo(() => {
    return (REDLINE_RPM / ENGINE_MAX_RPM) * 100;
  }, []);

  return (
    <div className="flex flex-col items-center">
      <div className="gauge-container bg-white">
        {/* Value display styled like the reference image */}
        <div className="gauge-value">
          <span className={`text-4xl sm:text-5xl font-bold text-black ${reachedRedline ? 'text-dashboard-gauge-redline' : ''}`}>
            {formattedRPM}
          </span>
          <span className="text-xs text-gray-500 block mt-1">RPM</span>
        </div>
        
        {/* Show redline marker */}
        {reachedRedline && (
          <div className="absolute top-3 right-3">
            <div className="w-6 h-6 rounded-full border border-dashboard-gauge-redline flex items-center justify-center">
              <span className="text-xs text-dashboard-gauge-redline">90</span>
            </div>
          </div>
        )}
        
        {/* Arc at the right side */}
        <div className="absolute top-0 right-0 w-full h-full">
          <svg width="100%" height="100%" viewBox="0 0 100 100">
            <path
              d="M 50 20 A 30 30 0 0 1 80 50"
              fill="none"
              stroke="#EF4444"
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
