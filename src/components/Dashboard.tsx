
import { useEngine } from '@/hooks/useEngine';
import { useSound } from '@/hooks/useSound';
import { RPMGauge } from './RPMGauge';
import { SpeedGauge } from './SpeedGauge';
import { GearShifter } from './GearShifter';
import { PerformanceMonitor } from './PerformanceMonitor';
import { ENGINE_MAX_RPM, KEY_BINDINGS } from '@/lib/constants';

export function Dashboard() {
  const {
    isRunning,
    rpm,
    speed,
    gear,
    throttle,
    reachedRedline,
    startEngine,
    stopEngine,
    shiftToGear,
    applyThrottle
  } = useEngine();

  const { frequencies, fps } = useSound({
    isEngineRunning: isRunning,
    rpm,
    maxRpm: ENGINE_MAX_RPM,
    gear,
    throttle
  });

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col">
      <h1 className="text-4xl font-bold text-center mb-2 animate-fade-in">V8 Engine Simulator</h1>
      <p className="text-center text-dashboard-muted mb-8 animate-fade-in">Experience the power and sound of a high-performance V8 engine</p>
      
      {/* Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="dash-panel">
          <RPMGauge rpm={rpm} reachedRedline={reachedRedline} />
        </div>
        <div className="dash-panel">
          <SpeedGauge speed={speed} />
        </div>
      </div>
      
      {/* Controls & Gear shifter */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <div className="dash-panel flex flex-col">
          <h2 className="text-xl font-semibold mb-4">Engine Controls</h2>
          
          <div className="engine-controls">
            <button 
              className="engine-button start-button"
              onClick={startEngine}
              disabled={isRunning}
            >
              Start Engine
            </button>
            <button 
              className="engine-button stop-button"
              onClick={stopEngine}
              disabled={!isRunning}
            >
              Stop Engine
            </button>
          </div>
          
          <div className="mt-6">
            <button 
              className="w-full py-4 px-6 flex items-center justify-center bg-dashboard-accent/20 border border-dashboard-accent rounded-lg hover:bg-dashboard-accent/30 transition-colors duration-200"
              onClick={() => applyThrottle(0.3)}
              disabled={!isRunning}
            >
              <span className="text-lg font-semibold">Apply Throttle</span>
            </button>
          </div>
        </div>
        
        <div className="md:col-span-2">
          <GearShifter 
            currentGear={gear} 
            isEngineRunning={isRunning}
            onShift={shiftToGear}
          />
        </div>
      </div>
      
      {/* Performance Monitor */}
      <div className="mb-8 animate-slide-in">
        <PerformanceMonitor 
          frequencies={frequencies}
          fps={fps}
        />
      </div>
      
      {/* Keyboard controls guide */}
      <div className="controls-hint animate-fade-in">
        <h3 className="font-medium mb-2">Keyboard Controls:</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="flex items-center">
            <span className="key-command">{KEY_BINDINGS.THROTTLE.toUpperCase()}</span>
            <span className="ml-2">Increase gas</span>
          </div>
          <div className="flex items-center">
            <span className="key-command">{KEY_BINDINGS.SHIFT_UP.toUpperCase()}</span>
            <span className="ml-2">Shift gear up</span>
          </div>
          <div className="flex items-center">
            <span className="key-command">{KEY_BINDINGS.SHIFT_DOWN.toUpperCase()}</span>
            <span className="ml-2">Shift gear down</span>
          </div>
          <div className="flex items-center">
            <span className="key-command">{KEY_BINDINGS.ENGINE_START.toUpperCase()}</span>
            <span className="ml-2">Start engine</span>
          </div>
          <div className="flex items-center">
            <span className="key-command">{KEY_BINDINGS.ENGINE_STOP.toUpperCase()}</span>
            <span className="ml-2">Stop engine</span>
          </div>
          <div className="flex items-center">
            <span className="key-command">{KEY_BINDINGS.NEUTRAL.toUpperCase()}</span>
            <span className="ml-2">Shift to neutral</span>
          </div>
        </div>
      </div>
    </div>
  );
}
