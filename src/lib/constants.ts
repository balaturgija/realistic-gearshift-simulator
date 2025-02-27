
// Engine Simulation Constants
export const ENGINE_MAX_RPM = 8000;
export const IDLE_RPM = 800;
export const REDLINE_RPM = 7000;
export const MAX_SPEED_MPH = 220;
export const GEAR_RATIOS = [0, 3.5, 2.5, 1.8, 1.3, 1.1, 0.8]; // Neutral + 6 gears

// Sound simulation
export const SOUND_FILES = {
  idle: '/sounds/v8-idle.mp3',       // Placeholder URLs
  revving: '/sounds/v8-revving.mp3', // These would be real audio files in production
  gearShift: '/sounds/gear-shift.mp3',
  engineStart: '/sounds/engine-start.mp3',
  engineOff: '/sounds/engine-off.mp3',
};

// Animation timing
export const NEEDLE_ANIMATION_MS = 75; // Needle movement smoothness

// Performance monitoring
export const FPS_UPDATE_INTERVAL_MS = 500;
export const FREQUENCY_BANDS = 16; // Number of frequency bars

// Key controls
export const KEY_BINDINGS = {
  THROTTLE: 'w',
  SHIFT_UP: 's',
  SHIFT_DOWN: 'd',
  ENGINE_START: 'p',
  ENGINE_STOP: 'f',
  NEUTRAL: 'n',
};
