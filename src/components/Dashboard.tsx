
import { useEngine } from '@/hooks/useEngine';
import { useSound } from '@/hooks/useSound';
import { RPMGauge } from './RPMGauge';
import { SpeedGauge } from './SpeedGauge';
import { Dynamometer } from './Dynamometer';
import { ENGINE_MAX_RPM } from '@/lib/constants';
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

  const { frequencies } = useSound({
    isEngineRunning: isRunning,
    rpm,
    maxRpm: ENGINE_MAX_RPM,
    gear,
    throttle
  });

  const [throttleEnabled, setThrottleEnabled] = useState(false);

  const toggleEngine = () => {
    if (isRunning) {
      stopEngine();
    } else {
      startEngine();
    }
  };

  const toggleThrottle = () => {
    setThrottleEnabled(prev => !prev);
    applyThrottle(throttleEnabled ? 0 : 0.8);
  };

  return (
    <div className="container mx-auto px-2 sm:px-4 py-6 pb-20">
      <h1 className="text-2xl sm:text-4xl font-bold text-center mb-1 animate-fade-in">V8 Engine Simulator</h1>
      <p className="text-center text-dashboard-muted mb-6 text-sm sm:text-base animate-fade-in">Chevrolet 454 V8 7.4L (454 CI) Engine Experience</p>
      
      {/* Merged dashboard-style gauges container */}
      <div className="dashboard-container relative mb-8 rounded-xl glass-panel p-4 sm:p-6 border-2 border-gray-800 shadow-lg">
        {/* Dashboard design elements */}
        <div className="absolute top-0 left-0 w-full h-6 bg-gray-800/50 rounded-t-xl border-b border-gray-700"></div>
        <div className="absolute bottom-0 left-0 w-full h-3 bg-gray-900/60 rounded-b-xl"></div>
        
        {/* Dashboard label */}
        <div className="relative z-10 flex justify-center mb-4">
          <div className="bg-gray-800 px-6 py-1 rounded-full border border-gray-700 shadow-inner">
            <span className="text-sm font-bold tracking-widest text-gray-300">ENGINE DASHBOARD</span>
          </div>
        </div>
        
        {/* Gauges container */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10 mt-6">
          <div className="dash-panel flex items-center justify-center border-t-2 border-t-dashboard-gauge-needle/20">
            <SpeedGauge speed={speed} gear={gear} isRunning={isRunning} />
          </div>
          <div className="dash-panel flex items-center justify-center border-t-2 border-t-dashboard-gauge-redline/20">
            <RPMGauge rpm={rpm} reachedRedline={reachedRedline} gear={gear} isRunning={isRunning} />
          </div>
        </div>
        
        {/* Indicator lights/warnings */}
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 mt-6 mb-2">
          <div className={`indicator-light ${isRunning ? 'bg-green-500/20' : 'bg-gray-700/30'} border ${isRunning ? 'border-green-500' : 'border-gray-600'}`}>
            <span className="text-xs">ENGINE</span>
            {isRunning && <div className="dot bg-green-500"></div>}
          </div>
          <div className={`indicator-light ${throttleEnabled ? 'bg-amber-500/20' : 'bg-gray-700/30'} border ${throttleEnabled ? 'border-amber-500' : 'border-gray-600'}`}>
            <span className="text-xs">THROTTLE</span>
            {throttleEnabled && <div className="dot bg-amber-500"></div>}
          </div>
          <div className={`indicator-light ${reachedRedline ? 'bg-red-500/20' : 'bg-gray-700/30'} border ${reachedRedline ? 'border-red-500' : 'border-gray-600'}`}>
            <span className="text-xs">REDLINE</span>
            {reachedRedline && <div className="dot bg-red-500"></div>}
          </div>
          <div className={`indicator-light ${isDynoEnabled ? 'bg-blue-500/20' : 'bg-gray-700/30'} border ${isDynoEnabled ? 'border-blue-500' : 'border-gray-600'}`}>
            <span className="text-xs">DYNO</span>
            {isDynoEnabled && <div className="dot bg-blue-500"></div>}
          </div>
          <div className="indicator-light bg-gray-700/30 border border-gray-600 sm:flex hidden">
            <span className="text-xs">SYSTEM</span>
            <div className="dot bg-teal-500"></div>
          </div>
        </div>
      </div>
      
      {isDynoEnabled && (
        <Dynamometer speed={speed} torque={torque} horsepower={horsepower} isRunning={isRunning} />
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <div className="dash-panel flex flex-col">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">Engine Controls</h2>
          
          <div className="engine-controls flex flex-col space-y-4">
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
                      <span className="text-white text-xs font-medium">{isRunning ? "ON" : "OFF"}</span>
                    </div>
                  </div>
                </div>
                <span className="ml-4 text-white font-semibold">Engine Power</span>
                {isRunning && (
                  <div className="ml-2 w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                )}
              </label>
            </div>
            
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
                      <span className="text-white text-xs font-medium">{throttleEnabled ? "ON" : "OFF"}</span>
                    </div>
                  </div>
                </div>
                <span className="ml-4 text-white font-semibold">Throttle</span>
              </label>
            </div>
            
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
                      <span className="text-white text-xs font-medium">{isDynoEnabled ? "ON" : "OFF"}</span>
                    </div>
                  </div>
                </div>
                <span className="ml-4 text-white font-semibold">Dynamometer</span>
              </label>
            </div>
          </div>
        </div>
        
        <div className="dash-panel col-span-1 md:col-span-2 flex items-center justify-center">
          <div className="w-full max-w-lg bg-gray-900/30 rounded-lg border border-gray-800 p-4">
            <h2 className="text-lg sm:text-xl font-semibold mb-3">Control Dashboard</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="stat-box p-3 bg-gray-900/50 rounded-lg border border-gray-800">
                <div className="text-sm text-gray-400">Current Gear</div>
                <div className="text-2xl font-bold">{gear === 0 ? 'N' : gear}</div>
              </div>
              <div className="stat-box p-3 bg-gray-900/50 rounded-lg border border-gray-800">
                <div className="text-sm text-gray-400">Throttle</div>
                <div className="text-2xl font-bold">{Math.round(throttle * 100)}%</div>
              </div>
              <div className="stat-box p-3 bg-gray-900/50 rounded-lg border border-gray-800">
                <div className="text-sm text-gray-400">Torque</div>
                <div className="text-2xl font-bold">{Math.round(torque)} Nm</div>
              </div>
              <div className="stat-box p-3 bg-gray-900/50 rounded-lg border border-gray-800">
                <div className="text-sm text-gray-400">Horsepower</div>
                <div className="text-2xl font-bold">{Math.round(horsepower)} HP</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Keyboard shortcut hints */}
      <div className="mt-8 text-center text-sm text-dashboard-muted">
        <p>Press <kbd className="px-2 py-1 bg-gray-800 rounded border border-gray-700 mx-1">L</kbd> to lock/unlock screen scrolling</p>
      </div>
    </div>
  );
}
