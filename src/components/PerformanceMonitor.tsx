
import { useMemo } from 'react';
import { FREQUENCY_BANDS } from '@/lib/constants';

interface PerformanceMonitorProps {
  frequencies: number[];
  fps: number;
}

export function PerformanceMonitor({ frequencies, fps }: PerformanceMonitorProps) {
  // Normalize frequencies for display
  const normalizedFreqs = useMemo(() => {
    return frequencies.map(f => Math.max(0.05, f));
  }, [frequencies]);

  return (
    <div className="flex flex-col p-2 sm:p-4 rounded-lg glass-panel">
      <div className="flex justify-between items-center mb-1 sm:mb-2">
        <h3 className="text-base sm:text-lg font-medium">Exhaust Flow</h3>
        <div className="text-dashboard-muted font-mono text-xs sm:text-sm">{fps} FPS</div>
      </div>
      
      <div className="flex h-20 sm:h-32 items-end justify-between gap-px sm:gap-1 mt-1 sm:mt-2">
        {normalizedFreqs.map((freq, i) => (
          <div key={i} className="relative flex-1 h-full flex items-end">
            <div 
              className="freq-bar" 
              style={{ height: `${Math.max(3, freq * 100)}%` }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
