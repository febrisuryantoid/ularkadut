import { DifficultyLevel, FruitType } from '../game/gameTypes';

const BGM_TRACKS: Record<DifficultyLevel, string> = {
  easy: '/assets/aistudio/bgm-ularkadut_a4170b72.mp3',
  medium: '/assets/aistudio/bgm-ularkadut-2_aed6e757.mp3',
  hard: '/assets/aistudio/bgm-ularkadut-3_de5d246a.mp3',
};

class SoundManager {
  private ctx: AudioContext | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private isMuted: boolean = false;
  private bgmAudio: HTMLAudioElement | null = null;
  private bgmVolume: number = 0.45;
  private currentDifficulty: DifficultyLevel = 'easy';
  private hasInteracted: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const storedVol = localStorage.getItem('ular_kadut_bgm_vol');
        if (storedVol !== null) {
          const parsed = parseFloat(storedVol);
          if (!isNaN(parsed) && parsed > 0 && parsed <= 1) {
            this.bgmVolume = parsed;
          }
        }
      } catch {
        // Local storage inaccessible
      }

      // Pre-initialize BGM element
      try {
        this.bgmAudio = new Audio(BGM_TRACKS[this.currentDifficulty]);
        this.bgmAudio.loop = true;
        this.bgmAudio.volume = this.bgmVolume;
      } catch {
        // Audio element creation failed
      }

      // Attach user interaction listener to start BGM smoothly upon first touch/click
      const triggerInteraction = () => {
        if (!this.hasInteracted) {
          this.hasInteracted = true;
          this.initContext();
          if (!this.isMuted) {
            this.playBGM();
          }
        }
      };

      window.addEventListener('click', triggerInteraction, { once: true });
      window.addEventListener('keydown', triggerInteraction, { once: true });
      window.addEventListener('touchstart', triggerInteraction, { once: true });
    }
  }

  public setDifficultyBGM(difficulty: DifficultyLevel) {
    if (this.currentDifficulty === difficulty) return;
    this.currentDifficulty = difficulty;
    if (!this.bgmAudio) return;

    const targetSrc = BGM_TRACKS[difficulty] || BGM_TRACKS.easy;
    try {
      const wasPlaying = !this.bgmAudio.paused;
      this.bgmAudio.pause();
      this.bgmAudio.src = targetSrc;
      this.bgmAudio.loop = true;
      this.bgmAudio.volume = this.bgmVolume;
      this.bgmAudio.load();
      if (!this.isMuted && (wasPlaying || this.hasInteracted)) {
        this.playBGM();
      }
    } catch {
      // Ignore audio switch error
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.bgmAudio) {
      if (muted) {
        this.bgmAudio.pause();
      } else {
        this.playBGM();
      }
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public getBGMVolume(): number {
    return this.bgmVolume;
  }

  public setBGMVolume(volume: number) {
    const clamped = Math.max(0, Math.min(1, volume));
    this.bgmVolume = clamped;
    if (this.bgmAudio) {
      this.bgmAudio.volume = clamped;
    }
    try {
      localStorage.setItem('ular_kadut_bgm_vol', clamped.toString());
    } catch {
      // Ignore
    }
  }

  public playBGM() {
    if (this.isMuted || !this.bgmAudio) return;
    try {
      this.bgmAudio.volume = this.bgmVolume;
      const playPromise = this.bgmAudio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Auto-play was prevented; will retry upon next interaction
        });
      }
    } catch {
      // Audio playback failed
    }
  }

  public pauseBGM() {
    if (this.bgmAudio) {
      try {
        this.bgmAudio.pause();
      } catch {
        // Audio pause failed
      }
    }
  }

  private initContext(): AudioContext | null {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    if (this.ctx && !this.noiseBuffer) {
      this.createNoiseBuffer(this.ctx);
    }
    return this.ctx;
  }

  private createNoiseBuffer(ctx: AudioContext) {
    try {
      const sampleRate = ctx.sampleRate;
      const length = Math.floor(sampleRate * 0.4); // 400ms reusable retro noise buffer
      const buffer = ctx.createBuffer(1, length, sampleRate);
      const data = buffer.getChannelData(0);
      // Step-quantized white noise for authentic 8-bit arcade crunch
      let lastSample = 0;
      for (let i = 0; i < length; i++) {
        if (i % 3 === 0) {
          lastSample = Math.random() * 2 - 1;
        }
        data[i] = lastSample;
      }
      this.noiseBuffer = buffer;
    } catch {
      // Ignore buffer creation errors
    }
  }

  private playTone(
    freq: number,
    type: OscillatorType,
    startTime: number,
    duration: number,
    volume: number,
    endFreq?: number
  ) {
    const ctx = this.ctx;
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);
    if (endFreq && endFreq > 0) {
      osc.frequency.exponentialRampToValueAtTime(endFreq, startTime + duration);
    }

    const attack = Math.min(0.008, duration * 0.2);
    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.linearRampToValueAtTime(volume, startTime + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.01);
  }

  private playNoiseBurst(
    startTime: number,
    duration: number,
    volume: number,
    filterFreq: number,
    filterType: BiquadFilterType = 'bandpass'
  ) {
    const ctx = this.ctx;
    if (!ctx || !this.noiseBuffer) return;

    const source = ctx.createBufferSource();
    source.buffer = this.noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = filterType;
    filter.frequency.setValueAtTime(filterFreq, startTime);
    filter.frequency.exponentialRampToValueAtTime(
      Math.max(80, filterFreq * 0.25),
      startTime + duration
    );

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume, startTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    source.start(startTime);
    source.stop(startTime + duration);
  }

  /**
   * Plays retro-arcade pickup sound when eating fruit (regular, golden, or mega).
   */
  public playEat(type: FruitType = 'regular') {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      if (type === 'mega') {
        // 8-bit 1-UP style triumphant arpeggio for Mega Fruit (+30, +3 segments)
        const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51];
        notes.forEach((freq, idx) => {
          const start = now + idx * 0.045;
          this.playTone(freq, 'square', start, 0.11, 0.12);
          this.playTone(freq * 0.5, 'triangle', start, 0.12, 0.16);
        });
      } else if (type === 'golden') {
        // Retro coin/sparkle double-chime for Golden Fruit (+20, +2 segments)
        this.playTone(659.25, 'square', now, 0.06, 0.12);
        this.playTone(987.77, 'square', now + 0.05, 0.14, 0.14, 1318.51);
        this.playTone(1318.51, 'triangle', now + 0.09, 0.14, 0.16);
      } else {
        // Snappy dual-step arcade bleep for Regular Apple (+10)
        this.playTone(523.25, 'square', now, 0.055, 0.11, 659.25);
        this.playTone(783.99, 'triangle', now + 0.045, 0.085, 0.18, 987.77);
      }
    } catch {
      // Audio playback failed silently
    }
  }

  /**
   * Plays a sharp retro slice + crunch when the snake bites and cuts its own body.
   */
  public playCut() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      this.playNoiseBurst(now, 0.14, 0.22, 1800, 'bandpass');
      this.playTone(760, 'sawtooth', now, 0.16, 0.2, 140);
      this.playTone(380, 'square', now + 0.03, 0.14, 0.14, 95);
    } catch {
      // Audio playback failed silently
    }
  }

  /**
   * Unified retro crash sound effect for wall or obstacle collisions.
   */
  public playCrash(kind: 'wall' | 'obstacle' = 'wall') {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      if (kind === 'obstacle') {
        // Heavy rock shatter: crunchy noise burst + dual low-frequency rumble
        this.playNoiseBurst(now, 0.28, 0.3, 950, 'lowpass');
        this.playTone(150, 'sawtooth', now, 0.26, 0.26, 28);
        this.playTone(95, 'square', now + 0.04, 0.26, 0.22, 22);
      } else {
        // Stone border wall impact: punchy square thud + short noise burst
        this.playNoiseBurst(now, 0.22, 0.25, 1200, 'lowpass');
        this.playTone(190, 'square', now, 0.24, 0.25, 34);
        this.playTone(110, 'sawtooth', now + 0.02, 0.22, 0.18, 30);
      }
    } catch {
      // Audio playback failed silently
    }
  }

  public playWall() {
    this.playCrash('wall');
  }

  public playObstacleCrash() {
    this.playCrash('obstacle');
  }

  /**
   * Subtle 8-bit directional tick on snake turn.
   */
  public playTurn() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      this.playTone(540, 'triangle', now, 0.028, 0.055, 680);
    } catch {
      // Audio playback failed silently
    }
  }

  /**
   * Classic 4-note descending arcade Game Over melody.
   */
  public playGameOver() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const notes = [392.0, 349.23, 329.63, 261.63]; // G4 -> F4 -> E4 -> C4
      const noteDuration = 0.11;
      // Offset slightly so the initial crash impact punches through first
      const baseTime = ctx.currentTime + 0.12;

      notes.forEach((freq, idx) => {
        const startTime = baseTime + idx * noteDuration;
        const isLast = idx === notes.length - 1;
        const dur = isLast ? 0.26 : noteDuration * 0.92;
        const endFreq = isLast ? freq * 0.82 : freq * 0.96;

        this.playTone(freq, 'sawtooth', startTime, dur, 0.15, endFreq);
        this.playTone(freq * 0.5, 'square', startTime, dur, 0.1, endFreq * 0.5);
      });
    } catch {
      // Audio playback failed silently
    }
  }

  /**
   * Snappy retro UI button click for menus, modals, and toggles.
   */
  public playMenuClick() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      this.playTone(680, 'square', now, 0.035, 0.09, 920);
    } catch {
      // Audio playback failed silently
    }
  }

  /**
   * Rising two-note arcade chime when switching difficulty levels.
   */
  public playMenuSelect() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      this.playTone(587.33, 'square', now, 0.045, 0.09);
      this.playTone(880, 'triangle', now + 0.04, 0.075, 0.13);
    } catch {
      // Audio playback failed silently
    }
  }

  /**
   * Energetic retro-arcade start fanfare when launching or restarting a game.
   */
  public playGameStart() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const notes = [440, 554.37, 659.25, 880]; // A4 major triad rising
      notes.forEach((freq, idx) => {
        const start = now + idx * 0.045;
        const dur = idx === notes.length - 1 ? 0.14 : 0.06;
        this.playTone(freq, 'square', start, dur, 0.1);
        this.playTone(freq, 'triangle', start, dur, 0.12);
      });
    } catch {
      // Audio playback failed silently
    }
  }

  /**
   * Classic arcade pause double-tone (high -> low).
   */
  public playPause() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      this.playTone(659.25, 'square', now, 0.055, 0.1);
      this.playTone(523.25, 'square', now + 0.055, 0.08, 0.1);
    } catch {
      // Audio playback failed silently
    }
  }

  /**
   * Classic arcade resume double-tone (low -> high).
   */
  public playResume() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      this.playTone(523.25, 'square', now, 0.055, 0.1);
      this.playTone(659.25, 'square', now + 0.055, 0.08, 0.1);
    } catch {
      // Audio playback failed silently
    }
  }

  /**
   * Celebratory chime when achieving a new high score.
   */
  public playHighScore() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const notes = [587.33, 739.99, 880, 1174.66]; // D5 major fanfare
      notes.forEach((freq, idx) => {
        const start = now + idx * 0.055;
        this.playTone(freq, 'triangle', start, 0.12, 0.15);
        this.playTone(freq * 0.5, 'square', start, 0.1, 0.08);
      });
    } catch {
      // Audio playback failed silently
    }
  }

  /**
   * Crisp arcade coin ding when claiming rewards or purchasing skins.
   */
  public playCoinReward() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      this.playTone(987.77, 'square', now, 0.06, 0.11); // B5
      this.playTone(1318.51, 'triangle', now + 0.055, 0.18, 0.16); // E6
    } catch {
      // Audio playback failed silently
    }
  }

  /**
   * Triumphant 5-note arcade victory fanfare when clearing a level.
   */
  public playLevelComplete() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51];
      notes.forEach((freq, idx) => {
        const start = now + idx * 0.065;
        const dur = idx === notes.length - 1 ? 0.28 : 0.1;
        this.playTone(freq, 'triangle', start, dur, 0.16);
        this.playTone(freq * 0.5, 'square', start, dur, 0.09);
      });
    } catch {
      // Audio playback failed silently
    }
  }
}

export const soundManager = new SoundManager();


