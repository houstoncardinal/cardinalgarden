import { useCallback, useRef, useEffect, useState } from 'react';

const AudioCtx = typeof window !== 'undefined' ? (window.AudioContext || (window as any).webkitAudioContext) : null;

function playTone(ctx: AudioContext, freq: number, duration: number, type: OscillatorType = 'sine', volume = 0.15) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime);
  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + duration);
}

export function useSound() {
  const ctxRef = useRef<AudioContext | null>(null);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const musicNodesRef = useRef<{ oscs: OscillatorNode[]; gain: GainNode } | null>(null);
  const [muted, setMuted] = useState(false);

  const getCtx = useCallback(() => {
    if (!ctxRef.current && AudioCtx) {
      ctxRef.current = new AudioCtx();
    }
    return ctxRef.current;
  }, []);

  const playPick = useCallback(() => {
    if (muted) return;
    const ctx = getCtx();
    if (!ctx) return;
    playTone(ctx, 880, 0.15, 'sine', 0.12);
    setTimeout(() => playTone(ctx, 1100, 0.1, 'sine', 0.08), 80);
    setTimeout(() => playTone(ctx, 1320, 0.12, 'sine', 0.06), 150);
  }, [getCtx, muted]);

  const playWater = useCallback(() => {
    if (muted) return;
    const ctx = getCtx();
    if (!ctx) return;
    // Bubbling water sound
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        playTone(ctx, 300 + Math.random() * 400, 0.15, 'sine', 0.06);
      }, i * 60);
    }
  }, [getCtx, muted]);

  const playPlant = useCallback(() => {
    if (muted) return;
    const ctx = getCtx();
    if (!ctx) return;
    playTone(ctx, 220, 0.2, 'triangle', 0.1);
    setTimeout(() => playTone(ctx, 330, 0.2, 'triangle', 0.08), 100);
    setTimeout(() => playTone(ctx, 440, 0.3, 'triangle', 0.06), 200);
  }, [getCtx, muted]);

  const playCoin = useCallback(() => {
    if (muted) return;
    const ctx = getCtx();
    if (!ctx) return;
    playTone(ctx, 1047, 0.08, 'square', 0.06);
    setTimeout(() => playTone(ctx, 1319, 0.12, 'square', 0.05), 70);
  }, [getCtx, muted]);

  const playError = useCallback(() => {
    if (muted) return;
    const ctx = getCtx();
    if (!ctx) return;
    playTone(ctx, 200, 0.3, 'sawtooth', 0.06);
  }, [getCtx, muted]);

  const startMusic = useCallback(() => {
    if (musicPlaying) return;
    const ctx = getCtx();
    if (!ctx) return;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(muted ? 0 : 0.04, ctx.currentTime);
    gain.connect(ctx.destination);

    // Simple ambient chord: C major 7
    const freqs = [130.81, 164.81, 196.00, 246.94];
    const oscs = freqs.map(f => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, ctx.currentTime);
      // Slow detune for dreamy effect
      osc.detune.setValueAtTime(Math.random() * 10 - 5, ctx.currentTime);
      osc.connect(gain);
      osc.start();
      return osc;
    });

    musicNodesRef.current = { oscs, gain };
    setMusicPlaying(true);
  }, [getCtx, musicPlaying, muted]);

  const stopMusic = useCallback(() => {
    if (musicNodesRef.current) {
      musicNodesRef.current.oscs.forEach(o => { try { o.stop(); } catch {} });
      musicNodesRef.current = null;
    }
    setMusicPlaying(false);
  }, []);

  const toggleMute = useCallback(() => {
    setMuted(prev => {
      const next = !prev;
      if (musicNodesRef.current) {
        musicNodesRef.current.gain.gain.setValueAtTime(next ? 0 : 0.04, ctxRef.current?.currentTime ?? 0);
      }
      return next;
    });
  }, []);

  useEffect(() => {
    return () => { stopMusic(); };
  }, [stopMusic]);

  return { playPick, playWater, playPlant, playCoin, playError, startMusic, stopMusic, toggleMute, musicPlaying, muted };
}
