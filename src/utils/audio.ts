let soundEffectsEnabled = true;

export const setSoundEffectsEnabled = (enabled: boolean) => {
  soundEffectsEnabled = enabled;
};

// Global audio context helper with automatic resume handling
let globalAudioCtx: AudioContext | null = null;

const getAudioContext = (): AudioContext | null => {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return null;
    if (!globalAudioCtx || globalAudioCtx.state === 'closed') {
      globalAudioCtx = new AudioCtx();
    }
    if (globalAudioCtx.state === 'suspended') {
      globalAudioCtx.resume().catch(() => {});
    }
    return globalAudioCtx;
  } catch (e) {
    console.debug('AudioContext initialization error', e);
    return null;
  }
};

// Unlock audio context on user interaction (e.g. initial click/tap)
if (typeof window !== 'undefined') {
  const unlock = () => {
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
  };
  window.addEventListener('click', unlock, { once: true });
  window.addEventListener('touchstart', unlock, { once: true });
  window.addEventListener('keydown', unlock, { once: true });
}

export const playTaskCompleteSound = (enabled = soundEffectsEnabled) => {
  if (!enabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    // Smooth pleasant chime chord: C5 -> E5 -> G5
    const notes = [523.25, 659.25, 783.99];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);

      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.setValueAtTime(0.18, ctx.currentTime + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + idx * 0.08 + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + idx * 0.08);
      osc.stop(ctx.currentTime + idx * 0.08 + 0.4);
    });
  } catch (e) {
    console.debug('Audio playback suppressed', e);
  }
};

export const playLevelUpSound = (enabled = soundEffectsEnabled) => {
  if (!enabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    // Motivating celebratory fanfare: C5 -> E5 -> G5 -> C6 -> E6 (High sparkle)
    const melody = [
      { freq: 523.25, time: 0, dur: 0.12 },
      { freq: 659.25, time: 0.1, dur: 0.12 },
      { freq: 783.99, time: 0.2, dur: 0.16 },
      { freq: 1046.5, time: 0.34, dur: 0.5 },
      { freq: 1318.51, time: 0.44, dur: 0.45 },
    ];

    melody.forEach(({ freq, time, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + time);

      gain.gain.setValueAtTime(0, ctx.currentTime + time);
      gain.gain.linearRampToValueAtTime(0.22, ctx.currentTime + time + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + time + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + time);
      osc.stop(ctx.currentTime + time + dur + 0.05);
    });
  } catch (e) {
    console.debug('Level up audio error', e);
  }
};

export const playAlarmSound = (enabled = soundEffectsEnabled) => {
  if (!enabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    // Rich, unmistakable resonant 2-round chime bell alert (A5 -> C#6 -> E6 -> A6)
    // Round 1
    const round1 = [
      { freq: 880, time: 0, dur: 0.25 },
      { freq: 1108.73, time: 0.14, dur: 0.25 },
      { freq: 1318.51, time: 0.28, dur: 0.35 },
      { freq: 1760.0, time: 0.42, dur: 0.5 },
    ];
    // Round 2 (repeat burst)
    const round2 = [
      { freq: 880, time: 0.75, dur: 0.25 },
      { freq: 1108.73, time: 0.89, dur: 0.25 },
      { freq: 1318.51, time: 1.03, dur: 0.35 },
      { freq: 1760.0, time: 1.17, dur: 0.6 },
    ];

    [...round1, ...round2].forEach(({ freq, time, dur }) => {
      // Fundamental tone
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + time);

      gain.gain.setValueAtTime(0, ctx.currentTime + time);
      gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + time + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + time + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + time);
      osc.stop(ctx.currentTime + time + dur + 0.05);

      // Shimmer harmonic overtone for marimba/bell clarity
      const oscHarmonic = ctx.createOscillator();
      const gainHarmonic = ctx.createGain();

      oscHarmonic.type = 'triangle';
      oscHarmonic.frequency.setValueAtTime(freq * 2, ctx.currentTime + time);

      gainHarmonic.gain.setValueAtTime(0, ctx.currentTime + time);
      gainHarmonic.gain.linearRampToValueAtTime(0.08, ctx.currentTime + time + 0.01);
      gainHarmonic.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + time + (dur * 0.5));

      oscHarmonic.connect(gainHarmonic);
      gainHarmonic.connect(ctx.destination);

      oscHarmonic.start(ctx.currentTime + time);
      oscHarmonic.stop(ctx.currentTime + time + (dur * 0.5) + 0.02);
    });
  } catch (e) {
    console.debug('Alarm audio error', e);
  }
};
