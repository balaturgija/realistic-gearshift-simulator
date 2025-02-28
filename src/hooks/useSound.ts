
import { useEffect, useState, useRef, useCallback } from 'react';
import { SOUND_FILES, FREQUENCY_BANDS } from '@/lib/constants';

interface UseSoundProps {
  isEngineRunning: boolean;
  rpm: number;
  maxRpm: number;
  gear: number;
  throttle: number;
}

export function useSound({ isEngineRunning, rpm, maxRpm, gear, throttle }: UseSoundProps) {
  const [frequencies, setFrequencies] = useState<number[]>(new Array(FREQUENCY_BANDS).fill(0));
  const [fps, setFps] = useState<number>(0);
  
  // Audio context refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const idleSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const revSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  
  // Animation frame ref
  const animationFrameRef = useRef<number | null>(null);
  
  // FPS calculation
  const framesRef = useRef<number>(0);
  const lastFpsUpdateRef = useRef<number>(Date.now());
  
  // Track previous gear to prevent multiple sound effects
  const prevGearRef = useRef<number>(0);

  // Audio simulation parameters
  const [volume, setVolume] = useState<number>(0.7);
  const [convolutionLevel, setConvolutionLevel] = useState<number>(0.5);
  const [highFreqGain, setHighFreqGain] = useState<number>(0.6);
  const [lowFreqNoise, setLowFreqNoise] = useState<number>(0.4);
  const [highFreqNoise, setHighFreqNoise] = useState<number>(0.3);
  const [simulationFreq, setSimulationFreq] = useState<number>(60);

  // Load a sound file and decode it
  const loadSound = useCallback(async (url: string): Promise<AudioBuffer | null> => {
    try {
      // In a real app, we'd load from the URL. For demo purposes, let's create a buffer
      if (!audioContextRef.current) return null;
      
      // This would normally be a fetch request:
      // const response = await fetch(url);
      // const arrayBuffer = await response.arrayBuffer();
      // return await audioContextRef.current.decodeAudioData(arrayBuffer);
      
      // For the demo, we'll synthesize a basic sound
      const buffer = audioContextRef.current.createBuffer(
        2, // stereo
        audioContextRef.current.sampleRate * 2, // 2 seconds of audio
        audioContextRef.current.sampleRate
      );
      
      // Fill with sinusoidal data for demo
      for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
        const data = buffer.getChannelData(channel);
        
        // Different waveforms based on sound type
        if (url.includes('idle')) {
          // V8 idle simulation - deeper, more complex sound
          for (let i = 0; i < data.length; i++) {
            const t = i / audioContextRef.current.sampleRate;
            // Add more harmonics for richer V8 sound
            data[i] = Math.sin(i * 0.01) * 0.1 + 
                      Math.sin(i * 0.02) * 0.05 +
                      Math.sin(i * 0.04) * 0.025 * Math.sin(t * 4) + // Pulsing
                      (Math.random() * 0.02 - 0.01) * lowFreqNoise; // Low freq noise
          }
        } else if (url.includes('revving')) {
          // V8 revving - aggressive, powerful sound
          for (let i = 0; i < data.length; i++) {
            const t = i / audioContextRef.current.sampleRate;
            // Add more harmonics and distortion for aggressive V8 sound
            data[i] = Math.sin(i * 0.03) * 0.2 + 
                      Math.sin(i * 0.06) * 0.1 +
                      Math.sin(i * 0.12) * 0.05 * Math.sin(t * 8) + // Fast pulsing
                      Math.sin(i * 0.09) * 0.08 * Math.sin(t * 2) + // Slower pulsing
                      (Math.random() * 0.04 - 0.02) * highFreqNoise; // High freq noise
          }
        } else if (url.includes('start')) {
          // Engine start sound - more dramatic for a V8
          for (let i = 0; i < data.length; i++) {
            const t = i / audioContextRef.current.sampleRate;
            // Simulate starter motor followed by ignition
            if (t < 0.3) {
              // Starter motor
              data[i] = Math.sin(80 * 2 * Math.PI * t) * 0.3 * 
                        (1 - Math.random() * 0.1) + 
                        (Math.random() * 0.1 - 0.05);
            } else if (t < 0.6) {
              // Ignition attempt
              data[i] = Math.sin(40 * 2 * Math.PI * t) * 0.5 * 
                        Math.sin(120 * t) +
                        (Math.random() * 0.4 - 0.2);
            } else {
              // Engine catches and roars to life
              const fade = Math.min(1, (t - 0.6) * 4);
              const baseFreq = 60 + (t - 0.6) * 200;
              data[i] = Math.sin(baseFreq * 2 * Math.PI * t) * 0.3 * fade +
                        Math.sin(baseFreq * 2 * 2 * Math.PI * t) * 0.2 * fade +
                        Math.sin(baseFreq * 4 * 2 * Math.PI * t) * 0.1 * fade +
                        (Math.random() * 0.1 - 0.05) * fade;
            }
          }
        } else if (url.includes('off')) {
          // Engine off sound - with afterfire effect for a V8
          for (let i = 0; i < data.length; i++) {
            const t = i / audioContextRef.current.sampleRate;
            if (t < 0.1) {
              // Initial cut
              data[i] = Math.sin(120 * 2 * Math.PI * t) * 
                        Math.exp(-t * 10) * 0.5;
            } else if (t < 0.2) {
              // Brief silence
              data[i] = Math.random() * 0.01;
            } else if (t < 0.3) {
              // Afterfire pop
              data[i] = (Math.random() * 0.5 - 0.25) * Math.exp(-(t - 0.25) * 40);
            } else {
              // Final decay
              data[i] = Math.random() * 0.02 * Math.exp(-(t - 0.3) * 5);
            }
          }
        } else if (url.includes('shift')) {
          // Gear shift sound - with transmission whine and clutch engagement
          for (let i = 0; i < data.length; i++) {
            const t = i / audioContextRef.current.sampleRate;
            if (t < 0.05) {
              // Clutch disengage
              data[i] = Math.sin(800 * 2 * Math.PI * t) * 0.1 * (1 - t/0.05);
            } else if (t < 0.1) {
              // Gear engagement
              data[i] = Math.sin(400 * 2 * Math.PI * t) * 0.15 + 
                        (Math.random() * 0.1 - 0.05);
            } else {
              // Clutch reengagement
              data[i] = Math.sin(600 * 2 * Math.PI * t) * 0.1 * Math.exp(-(t - 0.1) * 20);
            }
          }
        }
      }
      
      return buffer;
    } catch (error) {
      console.error('Error loading sound:', error);
      return null;
    }
  }, [lowFreqNoise, highFreqNoise]);

  // Create and configure audio nodes
  const setupAudio = useCallback(async () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    // Create gain node for volume control
    gainNodeRef.current = audioContextRef.current.createGain();
    gainNodeRef.current.gain.value = 0;
    
    // Create analyzer node for frequency visualization
    analyserRef.current = audioContextRef.current.createAnalyser();
    analyserRef.current.fftSize = 256;
    
    // Connect gain to analyzer and analyzer to destination
    gainNodeRef.current.connect(analyserRef.current);
    analyserRef.current.connect(audioContextRef.current.destination);
    
    // Load idle and revving sounds
    const idleBuffer = await loadSound(SOUND_FILES.idle);
    const revBuffer = await loadSound(SOUND_FILES.revving);
    
    if (idleBuffer && revBuffer) {
      // Setup idle sound (loops continuously)
      idleSourceRef.current = audioContextRef.current.createBufferSource();
      idleSourceRef.current.buffer = idleBuffer;
      idleSourceRef.current.loop = true;
      idleSourceRef.current.connect(gainNodeRef.current);
      
      // Setup revving sound (loops continuously)
      revSourceRef.current = audioContextRef.current.createBufferSource();
      revSourceRef.current.buffer = revBuffer;
      revSourceRef.current.loop = true;
      revSourceRef.current.connect(gainNodeRef.current);
      
      // Start both sounds (they'll be controlled by the gain node)
      idleSourceRef.current.start();
      revSourceRef.current.start();
    }
  }, [loadSound]);

  // Play a one-shot sound effect
  const playSoundEffect = useCallback(async (type: 'start' | 'off' | 'shift') => {
    if (!audioContextRef.current) return;
    
    let soundUrl;
    switch (type) {
      case 'start':
        soundUrl = SOUND_FILES.engineStart;
        break;
      case 'off':
        soundUrl = SOUND_FILES.engineOff;
        break;
      case 'shift':
        soundUrl = SOUND_FILES.gearShift;
        break;
    }
    
    const buffer = await loadSound(soundUrl);
    if (buffer) {
      const source = audioContextRef.current.createBufferSource();
      source.buffer = buffer;
      
      // Create a gain node to control volume
      const effectGain = audioContextRef.current.createGain();
      effectGain.gain.value = type === 'shift' ? 0.2 : 0.7; // Lower volume for shift sounds
      
      source.connect(effectGain);
      effectGain.connect(audioContextRef.current.destination);
      source.start();
    }
  }, [loadSound]);

  // Update the frequency visualization and FPS counter
  const updateVisualizer = useCallback(() => {
    if (!analyserRef.current) return;
    
    // Get frequency data
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    
    // Average the frequency data into our visualization bands
    const newFrequencies = Array(FREQUENCY_BANDS).fill(0);
    const binSize = Math.floor(dataArray.length / FREQUENCY_BANDS);
    
    for (let i = 0; i < FREQUENCY_BANDS; i++) {
      let sum = 0;
      for (let j = 0; j < binSize; j++) {
        sum += dataArray[i * binSize + j];
      }
      newFrequencies[i] = sum / binSize / 256; // Normalize to 0-1
    }
    
    setFrequencies(newFrequencies);
    
    // Calculate FPS
    framesRef.current++;
    const now = Date.now();
    const elapsed = now - lastFpsUpdateRef.current;
    
    if (elapsed >= 1000) { // Update FPS every second
      setFps(Math.round((framesRef.current * 1000) / elapsed));
      framesRef.current = 0;
      lastFpsUpdateRef.current = now;
    }
    
    // Continue animation loop
    animationFrameRef.current = requestAnimationFrame(updateVisualizer);
  }, []);

  // Initialize audio when component mounts
  useEffect(() => {
    setupAudio();
    
    return () => {
      // Cleanup audio resources
      if (idleSourceRef.current) {
        idleSourceRef.current.stop();
      }
      if (revSourceRef.current) {
        revSourceRef.current.stop();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [setupAudio]);

  // Start/stop the engine sound
  useEffect(() => {
    if (isEngineRunning && !animationFrameRef.current) {
      playSoundEffect('start');
      setTimeout(() => {
        if (gainNodeRef.current) {
          gainNodeRef.current.gain.setValueAtTime(0.3, audioContextRef.current!.currentTime);
          gainNodeRef.current.gain.linearRampToValueAtTime(
            volume, 
            audioContextRef.current!.currentTime + 0.5
          );
        }
      }, 300);
      animationFrameRef.current = requestAnimationFrame(updateVisualizer);
    } else if (!isEngineRunning && animationFrameRef.current) {
      playSoundEffect('off');
      if (gainNodeRef.current) {
        gainNodeRef.current.gain.setValueAtTime(
          gainNodeRef.current.gain.value, 
          audioContextRef.current!.currentTime
        );
        gainNodeRef.current.gain.linearRampToValueAtTime(
          0, 
          audioContextRef.current!.currentTime + 0.5
        );
      }
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
      setFrequencies(new Array(FREQUENCY_BANDS).fill(0));
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isEngineRunning, updateVisualizer, playSoundEffect, volume]);

  // Modulate engine sound based on RPM and throttle
  useEffect(() => {
    if (!isEngineRunning || !idleSourceRef.current || !revSourceRef.current || !gainNodeRef.current) return;
    
    const rpmRatio = rpm / maxRpm;
    
    // Adjust playback rate based on RPM (higher RPM = higher pitch)
    // More aggressive for V8 behavior
    idleSourceRef.current.playbackRate.value = 0.8 + rpmRatio * 0.6;
    revSourceRef.current.playbackRate.value = 0.8 + rpmRatio * 0.8;
    
    // Adjust the balance between idle and rev sounds
    const now = audioContextRef.current!.currentTime;
    
    // Adjust volume based on throttle and RPM - FIXED: Apply throttle value even when 0
    gainNodeRef.current.gain.setTargetAtTime(
      0.3 + (throttle * 0.7), // More pronounced throttle boost for V8
      now,
      0.1 // Time constant
    );
    
    // Add a bit of variance when shifting gears
    if (gear > 0) {
      // Random slight volume variations
      const randomVariation = 0.05 * (Math.random() - 0.5);
      gainNodeRef.current.gain.linearRampToValueAtTime(
        gainNodeRef.current.gain.value + randomVariation,
        now + 0.1
      );
    }
  }, [isEngineRunning, rpm, maxRpm, gear, throttle]);

  // Play gear shift sound when gear changes
  useEffect(() => {
    if (isEngineRunning && gear > 0 && gear !== prevGearRef.current) {
      // Only play gear shift sound for actual gear changes (not during initialization)
      if (prevGearRef.current > 0) {
        playSoundEffect('shift');
      }
      prevGearRef.current = gear;
    }
  }, [gear, isEngineRunning, playSoundEffect]);

  // Handle keyboard + scroll events for audio adjustments
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Store the key being pressed
      const key = e.key.toLowerCase();
      
      // Don't handle if control keys are pressed
      if (e.ctrlKey || e.altKey || e.metaKey) return;
      
      // Handle wheel events when specific keys are pressed
      const handleWheel = (event: WheelEvent) => {
        event.preventDefault();
        
        // Determine adjustment direction and amount
        const direction = event.deltaY > 0 ? -1 : 1;
        const adjustment = 0.05 * direction;
        
        switch (key) {
          case 'z':
            setVolume(prev => Math.max(0, Math.min(1, prev + adjustment)));
            break;
          case 'x':
            setConvolutionLevel(prev => Math.max(0, Math.min(1, prev + adjustment)));
            break;
          case 'c':
            setHighFreqGain(prev => Math.max(0, Math.min(1, prev + adjustment)));
            break;
          case 'v':
            setLowFreqNoise(prev => Math.max(0, Math.min(1, prev + adjustment)));
            break;
          case 'b':
            setHighFreqNoise(prev => Math.max(0, Math.min(1, prev + adjustment)));
            break;
          case 'n':
            setSimulationFreq(prev => Math.max(20, Math.min(120, prev + adjustment * 40)));
            break;
        }
      };
      
      if (['z', 'x', 'c', 'v', 'b', 'n'].includes(key)) {
        window.addEventListener('wheel', handleWheel, { passive: false });
        
        // Remove event listener when key is released
        const handleKeyUp = () => {
          window.removeEventListener('wheel', handleWheel);
          window.removeEventListener('keyup', handleKeyUp);
        };
        
        window.addEventListener('keyup', handleKeyUp);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      // In case the component unmounts while a key is being held
      window.removeEventListener('wheel', () => {});
    };
  }, []);

  // Apply volume changes to the audio output
  useEffect(() => {
    if (!gainNodeRef.current || !isEngineRunning) return;
    
    const baseVolume = volume;
    gainNodeRef.current.gain.setTargetAtTime(
      baseVolume + (throttle * 0.3), 
      audioContextRef.current!.currentTime,
      0.1
    );
  }, [volume, isEngineRunning, throttle]);

  return { 
    frequencies, 
    fps,
    audioParams: {
      volume,
      convolutionLevel,
      highFreqGain,
      lowFreqNoise,
      highFreqNoise,
      simulationFreq
    }
  };
}
