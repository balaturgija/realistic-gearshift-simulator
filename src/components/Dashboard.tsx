
import { useEngine } from '@/hooks/useEngine';
import { useSound } from '@/hooks/useSound';
import { RPMGauge } from './RPMGauge';
import { SpeedGauge } from './SpeedGauge';
import { PerformanceMonitor } from './PerformanceMonitor';
import { Dynamometer } from './Dynamometer';
import { ENGINE_MAX_RPM, KEY_BINDINGS } from '@/lib/constants';
import { useState } from 'react';

export function Dashboard() {
  const {
    isRunning,
    rpm,
    speed,
    gear,
    throttle,
    reachedRedline,
    torque,
    horsepower,
    isDynoEnabled,
    startEngine,
    stopEngine,
    shiftToGear,
    applyThrottle,
    toggleDyno
  } = useEngine();

  const { frequencies, fps, audioParams } = useSound({
    isEngineRunning: isRunning,
    rpm,
    maxRpm: ENGINE_MAX_RPM,
    gear,
    throttle
  });

  // State for throttle button
  const [throttleEnabled, setThrottleEnabled] = useState(false);

  // Handle engine toggle
  const toggleEngine = () => {
    if (isRunning) {
      stopEngine();
    } else {
      startEngine();
    }
  };

  // Handle throttle toggle
  const toggleThrottle = () => {
    setThrottleEnabled(prev => !prev);
    applyThrottle(throttleEnabled ? 0 : 0.8);
  };

  return (
    <div className="container mx-auto h-screen flex flex-col px-2 sm:px-4 py-4">
      <h1 className="text-2xl sm:text-4xl font-bold text-center mb-1 animate-fade-in">V8 Engine Simulator</h1>
      <p className="text-center text-dashboard-muted mb-4 text-sm sm:text-base animate-fade-in">Chevrolet 454 V8 7.4L (454 CI) Engine Experience</p>
      
      {/* Dashboard - Main content takes most of the space */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 flex-grow">
        <div className="dash-panel flex items-center justify-center">
          <SpeedGauge speed={speed} gear={gear} isRunning={isRunning} />
        </div>
        <div className="dash-panel flex items-center justify-center">
          <RPMGauge rpm={rpm} reachedRedline={reachedRedline} gear={gear} isRunning={isRunning} />
        </div>
      </div>
      
      {/* Dynamometer - Only shown when enabled */}
      {isDynoEnabled && (
        <Dynamometer speed={speed} torque={torque} horsepower={horsepower} isRunning={isRunning} />
      )}
      
      {/* Controls section - Taking less space */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="dash-panel flex flex-col">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">Engine Controls</h2>
          
          <div className="engine-controls flex flex-col space-y-4">
            {/* Start/Stop Toggle Button */}
            <div className="toggle-button-container">
              <label className="flex items-center cursor-pointer">
                <div className="relative">
                  <input 
                    type="checkbox" 
                    className="sr-only" 
                    checked={isRunning}
                    onChange={toggleEngine}
                  />
                  <div className={`flex h-12 w-28 items-center rounded-full p-1 transition duration-300 ${isRunning ? 'bg-green-900' : 'bg-gray-700'}`}>
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full transition duration-300 transform ${isRunning ? 'translate-x-16 bg-green-500' : 'bg-gray-900'}`}>
                      <span className="text-white text-lg">{isRunning ? "ON" : "OFF"}</span>
                    </div>
                  </div>
                </div>
                <span className="ml-4 text-white font-semibold">Engine Power</span>
                {/* Green light indicator */}
                {isRunning && (
                  <div className="ml-2 w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                )}
              </label>
            </div>
            
            {/* Throttle Toggle Button */}
            <div className="toggle-button-container">
              <label className="flex items-center cursor-pointer">
                <div className="relative">
                  <input 
                    type="checkbox" 
                    className="sr-only" 
                    checked={throttleEnabled}
                    onChange={toggleThrottle}
                    disabled={!isRunning}
                  />
                  <div className={`flex h-12 w-28 items-center rounded-full p-1 transition duration-300 ${throttleEnabled ? 'bg-amber-900' : 'bg-gray-700'} ${!isRunning ? 'opacity-50' : ''}`}>
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full transition duration-300 transform ${throttleEnabled ? 'translate-x-16 bg-amber-500' : 'bg-gray-900'}`}>
                      <span className="text-white text-lg">{throttleEnabled ? "ON" : "OFF"}</span>
                    </div>
                  </div>
                </div>
                <span className="ml-4 text-white font-semibold">Throttle</span>
              </label>
            </div>
            
            {/* Dyno Toggle Button */}
            <div className="toggle-button-container">
              <label className="flex items-center cursor-pointer">
                <div className="relative">
                  <input 
                    type="checkbox" 
                    className="sr-only" 
                    checked={isDynoEnabled}
                    onChange={toggleDyno}
                  />
                  <div className={`flex h-12 w-28 items-center rounded-full p-1 transition duration-300 ${isDynoEnabled ? 'bg-blue-900' : 'bg-gray-700'}`}>
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full transition duration-300 transform ${isDynoEnabled ? 'translate-x-16 bg-blue-500' : 'bg-gray-900'}`}>
                      <span className="text-white text-lg">{isDynoEnabled ? "ON" : "OFF"}</span>
                    </div>
                  </div>
                </div>
                <span className="ml-4 text-white font-semibold">Dynamometer</span>
              </label>
            </div>
          </div>
        </div>
        
        <div className="dash-panel col-span-1 md:col-span-2">
          <h2 className="text-lg sm:text-xl font-semibold mb-2">Audio Parameters</h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="audio-param">
              <span className="text-sm text-dashboard-muted">Volume</span>
              <div className="bg-gray-800 rounded-lg h-3 mt-1">
                <div 
                  className="bg-green-500 h-full rounded-lg" 
                  style={{ width: `${audioParams?.volume * 100}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span>Z+Scroll</span>
                <span>{Math.round((audioParams?.volume || 0) * 100)}%</span>
              </div>
            </div>
            
            <div className="audio-param">
              <span className="text-sm text-dashboard-muted">Convolution</span>
              <div className="bg-gray-800 rounded-lg h-3 mt-1">
                <div 
                  className="bg-blue-500 h-full rounded-lg" 
                  style={{ width: `${audioParams?.convolutionLevel * 100}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span>X+Scroll</span>
                <span>{Math.round((audioParams?.convolutionLevel || 0) * 100)}%</span>
              </div>
            </div>
            
            <div className="audio-param">
              <span className="text-sm text-dashboard-muted">High Freq. Gain</span>
              <div className="bg-gray-800 rounded-lg h-3 mt-1">
                <div 
                  className="bg-purple-500 h-full rounded-lg" 
                  style={{ width: `${audioParams?.highFreqGain * 100}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span>C+Scroll</span>
                <span>{Math.round((audioParams?.highFreqGain || 0) * 100)}%</span>
              </div>
            </div>
            
            <div className="audio-param">
              <span className="text-sm text-dashboard-muted">Low Freq. Noise</span>
              <div className="bg-gray-800 rounded-lg h-3 mt-1">
                <div 
                  className="bg-amber-500 h-full rounded-lg" 
                  style={{ width: `${audioParams?.lowFreqNoise * 100}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span>V+Scroll</span>
                <span>{Math.round((audioParams?.lowFreqNoise || 0) * 100)}%</span>
              </div>
            </div>
            
            <div className="audio-param">
              <span className="text-sm text-dashboard-muted">High Freq. Noise</span>
              <div className="bg-gray-800 rounded-lg h-3 mt-1">
                <div 
                  className="bg-red-500 h-full rounded-lg" 
                  style={{ width: `${audioParams?.highFreqNoise * 100}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span>B+Scroll</span>
                <span>{Math.round((audioParams?.highFreqNoise || 0) * 100)}%</span>
              </div>
            </div>
            
            <div className="audio-param">
              <span className="text-sm text-dashboard-muted">Sim. Frequency</span>
              <div className="bg-gray-800 rounded-lg h-3 mt-1">
                <div 
                  className="bg-teal-500 h-full rounded-lg" 
                  style={{ width: `${(audioParams?.simulationFreq || 0) / 120 * 100}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span>N+Scroll</span>
                <span>{Math.round(audioParams?.simulationFreq || 0)}Hz</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Performance Monitor */}
      <div className="mb-4 animate-slide-in">
        <PerformanceMonitor 
          frequencies={frequencies}
          fps={fps}
        />
      </div>
      
      {/* Keyboard controls guide */}
      <div className="controls-hint animate-fade-in text-xs sm:text-sm p-3 bg-gray-900/50 rounded-lg border border-gray-800">
        <h3 className="font-medium mb-2">Keyboard Controls:</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="flex items-center">
            <span className="key-command">{KEY_BINDINGS.THROTTLE.toUpperCase()}</span>
            <span className="ml-2">Increase gas</span>
          </div>
          <div className="flex items-center">
            <span className="key-command">↑</span>
            <span className="ml-2">Shift gear up</span>
          </div>
          <div className="flex items-center">
            <span className="key-command">↓</span>
            <span className="ml-2">Shift gear down</span>
          </div>
          <div className="flex items-center">
            <span className="key-command">{KEY_BINDINGS.ENGINE_START.toUpperCase()}</span>
            <span className="ml-2">Start/Stop engine</span>
          </div>
          <div className="flex items-center">
            <span className="key-command">{KEY_BINDINGS.NEUTRAL.toUpperCase()}</span>
            <span className="ml-2">Shift to neutral</span>
          </div>
          <div className="flex items-center">
            <span className="key-command">{KEY_BINDINGS.TOGGLE_DYNO.toUpperCase()}</span>
            <span className="ml-2">Toggle dyno</span>
          </div>
          <div className="flex items-center">
            <span className="key-command">Z-N+Scroll</span>
            <span className="ml-2">Audio adjustments</span>
          </div>
        </div>
      </div>
    </div>
  );
}
