
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
  MAX_POWER,
  THROTTLE_INCREASE_RATE,
  THROTTLE_DECAY_RATE
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
  const lastGearChangeTimeRef = useRef<number>(0);
  const smoothSpeedChangeRef = useRef<{
    inProgress: boolean;
    targetSpeed: number;
    startSpeed: number;
    startTime: number;
    duration: number;
  }>({
    inProgress: false,
    targetSpeed: 0,
    startSpeed: 0,
    startTime: 0,
    duration: 0
  });
  
  // Track if we're at redline to trigger bounce effect
  const redlineTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasReachedRedlineRef = useRef<boolean>(false);

  // Calculate speed based on RPM and current gear - more aggressive
  const calculateSpeed = useCallback((rpm: number, gear: number): number => {
    if (gear === 0) return 0; // Neutral
    const ratio = GEAR_RATIOS[gear];
    // More aggressive formula for V8 acceleration
    return Math.min(MAX_SPEED_MPH, (rpm / ratio) / 30);
  }, []);

  // Calculate torque based on RPM - V8 torque curve
  const calculateTorque = useCallback((rpm: number): number => {
    // Chevrolet 454 V8 torque curve simulation
    if (rpm < 500) return 0;
    
    // Torque builds up quickly from idle
    if (rpm < 2000) {
      return (MAX_TORQUE * rpm / 2000) * 0.7 + (MAX_TORQUE * 0.3);
    } 
    // Peak torque around 3000-4000 RPM (typical for big block V8)
    else if (rpm >= 2000 && rpm <= 4000) {
      // Slight curve with peak at ~3500 RPM
      const peakFactor = 1 - Math.abs((rpm - 3500) / 1500) * 0.15;
      return MAX_TORQUE * peakFactor;
    } 
    // Gradually decreasing torque after peak
    else {
      const torqueDropoff = Math.min(1, (ENGINE_MAX_RPM - rpm) / (ENGINE_MAX_RPM - 4000));
      return MAX_TORQUE * Math.max(0.65, torqueDropoff);
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

    // Clear any redline timeout when stopping
    if (redlineTimeoutRef.current) {
      clearTimeout(redlineTimeoutRef.current);
      redlineTimeoutRef.current = null;
    }
    
    hasReachedRedlineRef.current = false;

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

  // Toggle engine (for power button)
  const toggleEngine = useCallback(() => {
    if (engineState.isRunning) {
      stopEngine();
    } else {
      startEngine();
    }
  }, [engineState.isRunning, startEngine, stopEngine]);

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

  // Smooth change of speed for more realistic gear shifts
  const startSmoothSpeedChange = useCallback((targetSpeed: number, duration: number = 500) => {
    smoothSpeedChangeRef.current = {
      inProgress: true,
      targetSpeed,
      startSpeed: engineState.speed,
      startTime: Date.now(),
      duration
    };
  }, [engineState.speed]);

  // Shift to a specific gear
  const shiftToGear = useCallback((targetGear: number) => {
    if (!engineState.isRunning) return;
    if (targetGear < 0 || targetGear > 6) return;

    // Minimum time between gear shifts (ms)
    const minTimeBetweenShifts = 500;
    const now = Date.now();
    
    if (now - lastGearChangeTimeRef.current < minTimeBetweenShifts) {
      return; // Prevent too rapid shifting
    }
    
    lastGearChangeTimeRef.current = now;

    // If shifting from neutral to gear or vice versa, don't adjust RPM
    const isShiftingFromNeutral = engineState.gear === 0 && targetGear !== 0;
    const isShiftingToNeutral = engineState.gear !== 0 && targetGear === 0;

    setEngineState(prev => {
      // Calculate new RPM for gear shifts (not to/from neutral)
      let newRpm = prev.rpm;
      let newSpeed = prev.speed;
      
      if (!isShiftingFromNeutral && !isShiftingToNeutral && targetGear !== prev.gear) {
        if (targetGear > prev.gear) {
          // Shifting up: RPM drops more dramatically for V8
          newRpm = Math.max(IDLE_RPM, prev.rpm * 0.55);
        } else {
          // Shifting down: RPM increases more aggressively for V8
          newRpm = Math.min(ENGINE_MAX_RPM, prev.rpm * 1.4);
        }
        
        // Calculate target speed based on new RPM and gear
        const targetSpeed = calculateSpeed(newRpm, targetGear);
        
        // Start smooth speed transition
        startSmoothSpeedChange(targetSpeed);
        
        // Keep current speed initially, will be smoothly changed in the engine loop
        newSpeed = prev.speed;
      } else if (isShiftingToNeutral) {
        // When shifting to neutral, speed should gradually decrease
        startSmoothSpeedChange(0, 3000); // Slow coast to stop
      }

      // Calculate new torque and horsepower
      const newTorque = calculateTorque(newRpm);
      const newHorsepower = calculateHorsepower(newTorque, newRpm);
      
      return {
        ...prev,
        gear: targetGear,
        rpm: newRpm,
        speed: newSpeed,
        torque: newTorque,
        horsepower: newHorsepower,
      };
    });

    if (targetGear === 0) {
      toast.info("Shifted to neutral");
    } else {
      toast.info(`Shifted to gear ${targetGear}`);
    }
  }, [engineState.isRunning, engineState.gear, calculateSpeed, calculateTorque, calculateHorsepower, startSmoothSpeedChange]);

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
        let newSpeed = prev.speed;
        const inNeutral = prev.gear === 0;

        // Handle smooth speed changes during gear shifts
        if (smoothSpeedChangeRef.current.inProgress) {
          const { startSpeed, targetSpeed, startTime, duration } = smoothSpeedChangeRef.current;
          const elapsedTime = now - startTime;
          
          if (elapsedTime >= duration) {
            // Smooth change complete
            newSpeed = targetSpeed;
            smoothSpeedChangeRef.current.inProgress = false;
          } else {
            // Calculate intermediate speed using easing function
            const progress = elapsedTime / duration;
            const easedProgress = 1 - Math.pow(1 - progress, 3); // Cubic easing
            newSpeed = startSpeed + (targetSpeed - startSpeed) * easedProgress;
          }
        }

        // Calculate RPM changes based on throttle and current state
        if (throttleKeyPressedRef.current) {
          // V8 aggressive throttle response
          const baseIncrease = THROTTLE_INCREASE_RATE * deltaTime;
          
          // More dramatic RPM increase at lower RPMs
          let rpmIncrease = inNeutral 
            ? baseIncrease * 1.5 // Even faster in neutral
            : baseIncrease;
          
          // Add throttle influence
          rpmIncrease *= prev.throttle * (1 + (1 - newRpm / ENGINE_MAX_RPM) * 0.5);
          
          newRpm = Math.min(ENGINE_MAX_RPM, newRpm + rpmIncrease);
        } else {
          // Engine braking and natural RPM decay
          const baseDecrease = THROTTLE_DECAY_RATE * deltaTime;
          
          // Faster decay at higher RPMs
          const rpmDecrease = inNeutral
            ? baseDecrease * 0.8  // Slower decay in neutral
            : baseDecrease * (1 + (newRpm / ENGINE_MAX_RPM) * 0.5); // Faster at high RPM
          
          newRpm = Math.max(prev.isRunning ? IDLE_RPM : 0, newRpm - rpmDecrease);
        }

        // Calculate new torque and horsepower based on current RPM
        const newTorque = calculateTorque(newRpm);
        const newHorsepower = calculateHorsepower(newTorque, newRpm);
        
        // Calculate speed based on RPM and gear (if not in smooth transition)
        if (!smoothSpeedChangeRef.current.inProgress) {
          newSpeed = calculateSpeed(newRpm, prev.gear);
        }
        
        // Check if we're hitting the redline
        const hittingRedline = newRpm >= REDLINE_RPM;
        
        // Redline bounce effect logic
        let reachedRedline = false;
        if (hittingRedline) {
          if (!hasReachedRedlineRef.current) {
            hasReachedRedlineRef.current = true;
            reachedRedline = true;
            
            // Clear any existing timeout
            if (redlineTimeoutRef.current) {
              clearTimeout(redlineTimeoutRef.current);
            }
            
            // Set timeout to reset redline state after 1 second
            redlineTimeoutRef.current = setTimeout(() => {
              hasReachedRedlineRef.current = false;
            }, 1000);
          } else {
            reachedRedline = true;
          }
        }
        
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
      
      // Clear any redline timeout
      if (redlineTimeoutRef.current) {
        clearTimeout(redlineTimeoutRef.current);
        redlineTimeoutRef.current = null;
      }
    };
  }, [engineState.isRunning, calculateSpeed, calculateTorque, calculateHorsepower]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      
      // Prevent default for arrow keys to avoid page scrolling
      if (key === 'arrowup' || key === 'arrowdown') {
        e.preventDefault();
      }
      
      switch (key) {
        case KEY_BINDINGS.THROTTLE:
          throttleKeyPressedRef.current = true;
          applyThrottle(0.9); // Higher value for more aggressive V8 response
          break;
        case KEY_BINDINGS.SHIFT_UP.toLowerCase():
          shiftUp();
          break;
        case KEY_BINDINGS.SHIFT_DOWN.toLowerCase():
          shiftDown();
          break;
        case KEY_BINDINGS.ENGINE_START:
          toggleEngine();
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
  }, [applyThrottle, shiftUp, shiftDown, toggleEngine, shiftToGear, toggleDyno]);

  return {
    ...engineState,
    startEngine,
    stopEngine,
    toggleEngine,
    shiftToGear,
    shiftUp,
    shiftDown,
    applyThrottle,
    toggleDyno,
  };
}
