
import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from "sonner";
import { 
  ENGINE_MAX_RPM, 
  IDLE_RPM, 
  REDLINE_RPM, 
  MAX_SPEED_MPH, 
  GEAR_RATIOS, 
  KEY_BINDINGS,
  MAX_TORQUE,
  MAX_POWER
} from '@/lib/constants';

interface EngineState {
  isRunning: boolean;
  rpm: number;
  speed: number;
  gear: number;
  throttle: number;
  reachedRedline: boolean;
  torque: number;
  horsepower: number;
  isDynoEnabled: boolean;
}

export function useEngine() {
  const [engineState, setEngineState] = useState<EngineState>({
    isRunning: false,
    rpm: 0,
    speed: 0,
    gear: 0, // 0 = neutral, 1-6 = gears
    throttle: 0,
    reachedRedline: false,
    torque: 0,
    horsepower: 0,
    isDynoEnabled: false,
  });

  const engineLoopRef = useRef<number | null>(null);
  const lastUpdateTimeRef = useRef<number>(Date.now());
  const throttleKeyPressedRef = useRef<boolean>(false);

  // Calculate speed based on RPM and current gear
  const calculateSpeed = useCallback((rpm: number, gear: number): number => {
    if (gear === 0) return 0; // Neutral
    const ratio = GEAR_RATIOS[gear];
    // Simple formula to convert RPM to speed based on gear ratio
    return Math.min(MAX_SPEED_MPH, (rpm / ratio) / 35);
  }, []);

  // Calculate torque based on RPM
  const calculateTorque = useCallback((rpm: number): number => {
    // Simulated torque curve: Peak at ~3500-4000 RPM, tapering off at high RPM
    if (rpm < 500) return 0;
    
    // Torque builds up quickly from idle to ~3500 RPM
    if (rpm < 3500) {
      return (MAX_TORQUE * rpm / 3500) * 0.8 + (MAX_TORQUE * 0.2);
    } 
    // Peak torque around 3500-4000 RPM
    else if (rpm >= 3500 && rpm <= 4000) {
      return MAX_TORQUE;
    } 
    // Gradually decreasing torque after peak
    else {
      const torqueDropoff = Math.min(1, (ENGINE_MAX_RPM - rpm) / (ENGINE_MAX_RPM - 4000));
      return MAX_TORQUE * Math.max(0.7, torqueDropoff);
    }
  }, []);

  // Calculate horsepower based on torque and RPM
  const calculateHorsepower = useCallback((torque: number, rpm: number): number => {
    // HP = (Torque × RPM) / 5252
    if (rpm < 500) return 0;
    return (torque * rpm) / 5252;
  }, []);

  // Start the engine
  const startEngine = useCallback(() => {
    if (engineState.isRunning) return;

    setEngineState(prev => ({
      ...prev,
      isRunning: true,
      rpm: IDLE_RPM,
    }));

    toast.success("Engine started");
  }, [engineState.isRunning]);

  // Stop the engine
  const stopEngine = useCallback(() => {
    if (!engineState.isRunning) return;

    setEngineState(prev => ({
      ...prev,
      isRunning: false,
      rpm: 0,
      speed: 0,
      throttle: 0,
      reachedRedline: false,
      torque: 0,
      horsepower: 0,
    }));

    toast.success("Engine stopped");
  }, [engineState.isRunning]);

  // Toggle dynamometer
  const toggleDyno = useCallback(() => {
    setEngineState(prev => {
      const newState = { ...prev, isDynoEnabled: !prev.isDynoEnabled };
      
      if (newState.isDynoEnabled) {
        toast.success("Dynamometer enabled");
      } else {
        toast.info("Dynamometer disabled");
      }
      
      return newState;
    });
  }, []);

  // Shift to a specific gear
  const shiftToGear = useCallback((targetGear: number) => {
    if (!engineState.isRunning) return;
    if (targetGear < 0 || targetGear > 6) return;

    // If shifting from neutral to gear or vice versa, don't adjust RPM
    const isShiftingFromNeutral = engineState.gear === 0 && targetGear !== 0;
    const isShiftingToNeutral = engineState.gear !== 0 && targetGear === 0;

    setEngineState(prev => {
      // Calculate new RPM for gear shifts (not to/from neutral)
      let newRpm = prev.rpm;
      if (!isShiftingFromNeutral && !isShiftingToNeutral && targetGear !== prev.gear) {
        // Simulate RPM drop when shifting gears
        if (targetGear > prev.gear) {
          // Shifting up drops RPM
          newRpm = Math.max(IDLE_RPM, prev.rpm * 0.6);
        } else {
          // Shifting down increases RPM
          newRpm = Math.min(ENGINE_MAX_RPM, prev.rpm * 1.3);
        }
      }

      // Calculate new torque and horsepower
      const newTorque = calculateTorque(newRpm);
      const newHorsepower = calculateHorsepower(newTorque, newRpm);
      
      const newState = {
        ...prev,
        gear: targetGear,
        rpm: newRpm,
        torque: newTorque,
        horsepower: newHorsepower,
      };
      
      // Recalculate speed with new RPM and gear
      newState.speed = calculateSpeed(newState.rpm, newState.gear);
      
      return newState;
    });

    if (targetGear === 0) {
      toast.info("Shifted to neutral");
    } else {
      toast.info(`Shifted to gear ${targetGear}`);
    }
  }, [engineState.isRunning, engineState.gear, calculateSpeed, calculateTorque, calculateHorsepower]);

  // Shift up one gear
  const shiftUp = useCallback(() => {
    if (engineState.gear < 6) {
      shiftToGear(engineState.gear + 1);
    }
  }, [engineState.gear, shiftToGear]);

  // Shift down one gear
  const shiftDown = useCallback(() => {
    if (engineState.gear > 0) {
      shiftToGear(engineState.gear - 1);
    }
  }, [engineState.gear, shiftToGear]);

  // Apply throttle (0-1 value)
  const applyThrottle = useCallback((amount: number) => {
    if (!engineState.isRunning) return;
    
    setEngineState(prev => ({
      ...prev,
      throttle: Math.min(1, amount),
    }));
  }, [engineState.isRunning]);

  // Main engine simulation loop
  useEffect(() => {
    if (!engineState.isRunning) {
      if (engineLoopRef.current) {
        window.cancelAnimationFrame(engineLoopRef.current);
        engineLoopRef.current = null;
      }
      return;
    }

    const updateEngine = () => {
      const now = Date.now();
      const deltaTime = (now - lastUpdateTimeRef.current) / 1000; // in seconds
      lastUpdateTimeRef.current = now;

      setEngineState(prev => {
        // Don't update if engine is off
        if (!prev.isRunning) return prev;

        let newRpm = prev.rpm;
        const inNeutral = prev.gear === 0;

        // Calculate RPM changes based on throttle and current state
        if (throttleKeyPressedRef.current) {
          // RPM rises faster in neutral
          const rpmIncrease = inNeutral 
            ? prev.throttle * 1500 * deltaTime
            : prev.throttle * 800 * deltaTime;
          
          newRpm = Math.min(ENGINE_MAX_RPM, newRpm + rpmIncrease);
        } else {
          // Engine braking and natural RPM decay
          const rpmDecrease = inNeutral
            ? 300 * deltaTime  // Slower decay in neutral
            : 500 * deltaTime; // Faster decay in gear
          
          newRpm = Math.max(prev.isRunning ? IDLE_RPM : 0, newRpm - rpmDecrease);
        }

        // Calculate new torque and horsepower
        const newTorque = calculateTorque(newRpm);
        const newHorsepower = calculateHorsepower(newTorque, newRpm);
        
        // Calculate speed based on RPM and gear
        const newSpeed = calculateSpeed(newRpm, prev.gear);
        
        // Check if we're hitting the redline
        const reachedRedline = newRpm >= REDLINE_RPM;
        
        return {
          ...prev,
          rpm: newRpm,
          speed: newSpeed,
          reachedRedline,
          torque: newTorque,
          horsepower: newHorsepower,
        };
      });

      engineLoopRef.current = window.requestAnimationFrame(updateEngine);
    };

    engineLoopRef.current = window.requestAnimationFrame(updateEngine);

    return () => {
      if (engineLoopRef.current) {
        window.cancelAnimationFrame(engineLoopRef.current);
      }
    };
  }, [engineState.isRunning, calculateSpeed, calculateTorque, calculateHorsepower]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      
      switch (key) {
        case KEY_BINDINGS.THROTTLE:
          throttleKeyPressedRef.current = true;
          applyThrottle(0.8); // Higher value for keyboard control
          break;
        case KEY_BINDINGS.SHIFT_UP:
          shiftUp();
          break;
        case KEY_BINDINGS.SHIFT_DOWN:
          shiftDown();
          break;
        case KEY_BINDINGS.ENGINE_START:
          startEngine();
          break;
        case KEY_BINDINGS.ENGINE_STOP:
          stopEngine();
          break;
        case KEY_BINDINGS.NEUTRAL:
          shiftToGear(0);
          break;
        case KEY_BINDINGS.TOGGLE_DYNO:
          toggleDyno();
          break;
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      
      if (key === KEY_BINDINGS.THROTTLE) {
        throttleKeyPressedRef.current = false;
        applyThrottle(0); // Release throttle when key is released
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [applyThrottle, shiftUp, shiftDown, startEngine, stopEngine, shiftToGear, toggleDyno]);

  return {
    ...engineState,
    startEngine,
    stopEngine,
    shiftToGear,
    shiftUp,
    shiftDown,
    applyThrottle,
    toggleDyno,
  };
}
