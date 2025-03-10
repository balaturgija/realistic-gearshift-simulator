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
  const [volume, setVolume] = useState<number>(0.7);
  
  // Audio context refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const idleSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const revSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  
  // Animation frame ref
  const animationFrameRef = useRef<number | null>(null);
  
  // Track previous gear for sound effects
  const prevGearRef = useRef<number>(0);

  // Load and decode sound - ONLY engine sounds are retained
  const loadSound = useCallback(async (url: string): Promise<AudioBuffer | null> => {
    try {
      if (!audioContextRef.current) return null;
      
      const buffer = audioContextRef.current.createBuffer(
        2,
        audioContextRef.current.sampleRate * 2,
        audioContextRef.current.sampleRate
      );
      
      for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
        const data = buffer.getChannelData(channel);
        
        if (url.includes('idle')) {
          for (let i = 0; i < data.length; i++) {
            const t = i / audioContextRef.current.sampleRate;
            data[i] = Math.sin(i * 0.01) * 0.1 + 
                      Math.sin(i * 0.02) * 0.05 +
                      Math.sin(i * 0.04) * 0.025 * Math.sin(t * 4) +
                      (Math.random() * 0.01 - 0.005); // Reduced noise
          }
        } else if (url.includes('revving')) {
          for (let i = 0; i < data.length; i++) {
            const t = i / audioContextRef.current.sampleRate;
            data[i] = Math.sin(i * 0.03) * 0.2 + 
                      Math.sin(i * 0.06) * 0.1 +
                      Math.sin(i * 0.12) * 0.05 * Math.sin(t * 8) +
                      Math.sin(i * 0.09) * 0.08 * Math.sin(t * 2) +
                      (Math.random() * 0.02 - 0.01); // Reduced noise
          }
        } else if (url.includes('start')) {
          for (let i = 0; i < data.length; i++) {
            const t = i / audioContextRef.current.sampleRate;
            if (t < 0.3) {
              // Starter motor - smoother, less high frequency
              data[i] = Math.sin(50 * 2 * Math.PI * t) * 0.25 * 
                        (1 - Math.random() * 0.03);
            } else if (t < 0.6) {
              // Ignition - reduced high frequencies
              data[i] = Math.sin(35 * 2 * Math.PI * t) * 0.35 * 
                        Math.sin(80 * t) +
                        (Math.random() * 0.15 - 0.075);
            } else {
              // Engine catches - smoother transition, lower frequencies
              const fade = Math.min(1, (t - 0.6) * 3);
              // Reduced the max frequency rise to be more natural
              const baseFreq = 40 + (t - 0.6) * 80; 
              data[i] = Math.sin(baseFreq * 2 * Math.PI * t) * 0.3 * fade +
                        Math.sin(baseFreq * 1.5 * 2 * Math.PI * t) * 0.2 * fade +
                        Math.sin(baseFreq * 2.5 * 2 * Math.PI * t) * 0.08 * fade +
                        (Math.random() * 0.04 - 0.02) * fade;
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
        }
      }
      
      return buffer;
    } catch (error) {
      console.error('Error loading sound:', error);
      return null;
    }
  }, []);

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

  // Play a one-shot sound effect - ONLY engine start/stop sounds are retained
  const playSoundEffect = useCallback(async (type: 'start' | 'off') => {
    if (!audioContextRef.current) return;
    
    let soundUrl;
    switch (type) {
      case 'start':
        soundUrl = SOUND_FILES.engineStart;
        break;
      case 'off':
        soundUrl = SOUND_FILES.engineOff;
        break;
      default:
        return; // Only process engine sounds
    }
    
    const buffer = await loadSound(soundUrl);
    if (buffer) {
      const source = audioContextRef.current.createBufferSource();
      source.buffer = buffer;
      
      // Create a gain node to control volume
      const effectGain = audioContextRef.current.createGain();
      effectGain.gain.value = 0.7;
      
      source.connect(effectGain);
      effectGain.connect(audioContextRef.current.destination);
      source.start();
    }
  }, [loadSound]);

  // Update the frequency visualization
  const updateVisualizer = useCallback(() => {
    if (!analyserRef.current) return;
    
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    
    const newFrequencies = Array(FREQUENCY_BANDS).fill(0);
    const binSize = Math.floor(dataArray.length / FREQUENCY_BANDS);
    
    for (let i = 0; i < FREQUENCY_BANDS; i++) {
      let sum = 0;
      for (let j = 0; j < binSize; j++) {
        sum += dataArray[i * binSize + j];
      }
      newFrequencies[i] = sum / binSize / 256;
    }
    
    setFrequencies(newFrequencies);
    animationFrameRef.current = requestAnimationFrame(updateVisualizer);
  }, []);

  // Initialize audio
  useEffect(() => {
    setupAudio();
    return () => {
      if (idleSourceRef.current) idleSourceRef.current.stop();
      if (revSourceRef.current) revSourceRef.current.stop();
      if (audioContextRef.current) audioContextRef.current.close();
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [setupAudio]);

  // Handle engine state changes
  useEffect(() => {
    if (isEngineRunning && !animationFrameRef.current) {
      playSoundEffect('start');
      setTimeout(() => {
        if (gainNodeRef.current && audioContextRef.current) {
          gainNodeRef.current.gain.setValueAtTime(0.3, audioContextRef.current.currentTime);
          gainNodeRef.current.gain.linearRampToValueAtTime(
            volume,
            audioContextRef.current.currentTime + 0.5
          );
        }
      }, 300);
      animationFrameRef.current = requestAnimationFrame(updateVisualizer);
    } else if (!isEngineRunning && animationFrameRef.current) {
      playSoundEffect('off');
      if (gainNodeRef.current && audioContextRef.current) {
        gainNodeRef.current.gain.setValueAtTime(
          gainNodeRef.current.gain.value,
          audioContextRef.current.currentTime
        );
        gainNodeRef.current.gain.linearRampToValueAtTime(
          0,
          audioContextRef.current.currentTime + 0.5
        );
      }
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
      setFrequencies(new Array(FREQUENCY_BANDS).fill(0));
    }
  }, [isEngineRunning, updateVisualizer, playSoundEffect, volume]);

  // Modulate engine sound
  useEffect(() => {
    if (!isEngineRunning || !idleSourceRef.current || !revSourceRef.current || !gainNodeRef.current) return;
    
    const rpmRatio = rpm / maxRpm;
    idleSourceRef.current.playbackRate.value = 0.8 + rpmRatio * 0.6;
    revSourceRef.current.playbackRate.value = 0.8 + rpmRatio * 0.8;
    
    const now = audioContextRef.current!.currentTime;
    gainNodeRef.current.gain.setTargetAtTime(
      0.3 + (throttle * 0.7),
      now,
      0.1
    );
    
    if (gear > 0) {
      const randomVariation = 0.05 * (Math.random() - 0.5);
      gainNodeRef.current.gain.linearRampToValueAtTime(
        gainNodeRef.current.gain.value + randomVariation,
        now + 0.1
      );
    }
  }, [isEngineRunning, rpm, maxRpm, gear, throttle]);

  // Handle gear changes - Completely removed the gear shift sound effect
  useEffect(() => {
    if (isEngineRunning && gear !== prevGearRef.current) {
      prevGearRef.current = gear;
    }
  }, [gear, isEngineRunning]);

  return { frequencies };
}
