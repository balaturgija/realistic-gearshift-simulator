
import { useMemo } from 'react';

interface GearShifterProps {
  currentGear: number;
  isEngineRunning: boolean;
  onShift: (gear: number) => void;
}

export function GearShifter({ currentGear, isEngineRunning, onShift }: GearShifterProps) {
  // Generate gear slots in a pattern
  const gearSlots = useMemo(() => {
    // Create a 2D array representation of the gear layout
    // [1][3][5]
    // [2][4][6]
    // [ ][N][ ]
    const layout = [
      [1, 3, 5],
      [2, 4, 6],
      [null, 0, null]
    ];
    
    return layout.map((row, rowIndex) => (
      <div key={`row-${rowIndex}`} className="flex">
        {row.map((gear, colIndex) => (
          <div key={`col-${colIndex}`} className="relative">
            {gear !== null && (
              <button
                className={`gear-slot ${currentGear === gear ? 'gear-slot-active' : 'gear-slot-inactive'} ${!isEngineRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => isEngineRunning && onShift(gear)}
                disabled={!isEngineRunning}
              >
                {gear === 0 ? 'N' : gear}
              </button>
            )}
          </div>
        ))}
      </div>
    ));
  }, [currentGear, isEngineRunning, onShift]);

  return (
    <div className="gear-shifter h-full">
      <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-4">Gear Shifter</h2>
      <div className="relative flex justify-center items-center">
        {gearSlots}
      </div>
    </div>
  );
}
