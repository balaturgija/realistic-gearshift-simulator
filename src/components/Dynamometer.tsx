
import { useMemo } from 'react';
import { MAX_TORQUE, MAX_POWER } from '@/lib/constants';

interface DynamometerProps {
  speed: number;
  torque: number;
  horsepower: number;
}

export function Dynamometer({ speed, torque, horsepower }: DynamometerProps) {
  // Calculate torque gauge rotation angle
  const torqueRotation = useMemo(() => {
    const angle = -120 + (torque / MAX_TORQUE) * 240;
    return `rotate(${angle}deg)`;
  }, [torque]);

  // Calculate horsepower gauge rotation angle
  const powerRotation = useMemo(() => {
    const angle = -120 + (horsepower / MAX_POWER) * 240;
    return `rotate(${angle}deg)`;
  }, [horsepower]);

  // Format values for display
  const formattedTorque = useMemo(() => Math.round(torque).toLocaleString(), [torque]);
  const formattedPower = useMemo(() => Math.round(horsepower).toLocaleString(), [horsepower]);
  const formattedSpeed = useMemo(() => Math.round(speed).toLocaleString(), [speed]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 w-full">
      <div className="dash-panel flex items-center justify-center">
        <div className="flex flex-col items-center w-full max-w-md">
          <div className="gauge-container relative w-40 h-40 rounded-full bg-gray-900/50 backdrop-blur-sm border border-gray-700 flex items-center justify-center">
            {/* Value display */}
            <div className="gauge-value text-center z-10">
              <span className="text-3xl font-bold text-white">{formattedSpeed}</span>
              <span className="text-xs text-gray-400 block mt-1">km/h</span>
            </div>
            
            {/* Arc at the top */}
            <div className="absolute top-0 left-0 w-full h-full">
              <svg width="100%" height="100%" viewBox="0 0 100 100">
                <path
                  d="M 20 50 A 30 30 0 0 1 80 50"
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            
            {/* D indicator */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-gray-800 rounded-full w-6 h-6 flex items-center justify-center border border-gray-700">
              <span className="text-white font-bold text-xs">D</span>
            </div>
          </div>
          <div className="text-sm font-medium text-gray-300 mt-2">Dyno Speed</div>
        </div>
      </div>
      
      <div className="dash-panel flex items-center justify-center">
        <div className="flex flex-col items-center w-full max-w-md">
          <div className="gauge-container relative w-40 h-40 rounded-full bg-gray-900/50 backdrop-blur-sm border border-gray-700 flex items-center justify-center">
            {/* Value display */}
            <div className="gauge-value text-center z-10">
              <span className="text-3xl font-bold text-white">{formattedTorque}</span>
              <span className="text-xs text-gray-400 block mt-1">Nm</span>
            </div>
            
            {/* Arc at the top */}
            <div className="absolute top-0 left-0 w-full h-full">
              <svg width="100%" height="100%" viewBox="0 0 100 100">
                <path
                  d="M 20 50 A 30 30 0 0 1 80 50"
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            
            {/* D indicator */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-gray-800 rounded-full w-6 h-6 flex items-center justify-center border border-gray-700">
              <span className="text-white font-bold text-xs">D</span>
            </div>
          </div>
          <div className="text-sm font-medium text-gray-300 mt-2">Torque</div>
        </div>
      </div>
      
      <div className="dash-panel flex items-center justify-center">
        <div className="flex flex-col items-center w-full max-w-md">
          <div className="gauge-container relative w-40 h-40 rounded-full bg-gray-900/50 backdrop-blur-sm border border-gray-700 flex items-center justify-center">
            {/* Value display */}
            <div className="gauge-value text-center z-10">
              <span className="text-3xl font-bold text-white">{formattedPower}</span>
              <span className="text-xs text-gray-400 block mt-1">HP</span>
            </div>
            
            {/* Arc at the top */}
            <div className="absolute top-0 left-0 w-full h-full">
              <svg width="100%" height="100%" viewBox="0 0 100 100">
                <path
                  d="M 20 50 A 30 30 0 0 1 80 50"
                  fill="none"
                  stroke="#EF4444"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            
            {/* D indicator */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-gray-800 rounded-full w-6 h-6 flex items-center justify-center border border-gray-700">
              <span className="text-white font-bold text-xs">D</span>
            </div>
          </div>
          <div className="text-sm font-medium text-gray-300 mt-2">Horsepower</div>
        </div>
      </div>
    </div>
  );
}
