
// Engine Simulation Constants
export const ENGINE_MAX_RPM = 8500;
export const IDLE_RPM = 850;
export const REDLINE_RPM = 7500;
export const MAX_SPEED_MPH = 240;
export const GEAR_RATIOS = [0, 3.2, 2.3, 1.6, 1.2, 1.0, 0.8]; // Neutral + 6 gears (more aggressive)

// Dynamometer Constants
export const MAX_TORQUE = 550; // Nm - for Chevrolet 454 V8
export const MAX_POWER = 500; // HP - for Chevrolet 454 V8

// Sound simulation - engine sounds only
export const SOUND_FILES = {
  idle: '/sounds/v8-idle.mp3',
  revving: '/sounds/v8-revving.mp3',
  engineStart: '/sounds/engine-start.mp3',
  engineOff: '/sounds/engine-off.mp3',
};

// Animation timing
export const NEEDLE_ANIMATION_MS = 50; // Faster needle movement for more responsiveness

// Performance monitoring
export const FPS_UPDATE_INTERVAL_MS = 500;
export const FREQUENCY_BANDS = 16; // Number of frequency bands

// Key controls
export const KEY_BINDINGS = {
  THROTTLE: 'w',
  SHIFT_UP: 'ArrowUp',
  SHIFT_DOWN: 'ArrowDown',
  ENGINE_START: 'p',
  ENGINE_STOP: 'p', // Same key for toggle
  NEUTRAL: 'n',
  TOGGLE_DYNO: 'k',
};

// Throttle settings
export const THROTTLE_INCREASE_RATE = 3500; // More aggressive throttle response
export const THROTTLE_DECAY_RATE = 2400;     // Much faster RPM drop (increased from 800)
export const MAX_THROTTLE_VALUE = 1.0;      // Maximum throttle value
