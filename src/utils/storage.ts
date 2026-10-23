import { DifficultyLevel, SnakeSkinId } from '../game/gameTypes';
import { GAME_CONFIG } from '../game/gameConfig';
import { SNAKE_SKIN_CATALOG } from '../game/skinCatalog';

export function loadHighScore(): number {
  try {
    const raw = localStorage.getItem(GAME_CONFIG.STORAGE_KEY_HIGH_SCORE);
    if (!raw) return 0;
    const parsed = parseInt(raw, 10);
    return Number.isNaN(parsed) || parsed < 0 ? 0 : parsed;
  } catch {
    return 0;
  }
}

export function saveHighScore(score: number): void {
  try {
    const current = loadHighScore();
    if (score > current) {
      localStorage.setItem(GAME_CONFIG.STORAGE_KEY_HIGH_SCORE, String(score));
    }
  } catch {
    // Ignore localStorage quota/privacy errors
  }
}

export function loadDifficulty(): DifficultyLevel {
  try {
    const raw = localStorage.getItem(GAME_CONFIG.STORAGE_KEY_DIFFICULTY);
    if (raw === 'easy' || raw === 'medium' || raw === 'hard') {
      return raw;
    }
    return 'easy';
  } catch {
    return 'easy';
  }
}

export function saveDifficulty(difficulty: DifficultyLevel): void {
  try {
    localStorage.setItem(GAME_CONFIG.STORAGE_KEY_DIFFICULTY, difficulty);
  } catch {
    // Ignore
  }
}

export function loadSnakeSkin(): SnakeSkinId {
  try {
    const raw = localStorage.getItem(GAME_CONFIG.STORAGE_KEY_SKIN);
    if (raw && raw in SNAKE_SKIN_CATALOG) {
      return raw as SnakeSkinId;
    }
    return 'classic';
  } catch {
    return 'classic';
  }
}

export function saveSnakeSkin(skin: SnakeSkinId): void {
  try {
    localStorage.setItem(GAME_CONFIG.STORAGE_KEY_SKIN, skin);
  } catch {
    // Ignore
  }
}

export function loadMutedState(): boolean {
  try {
    const raw = localStorage.getItem(GAME_CONFIG.STORAGE_KEY_MUTED);
    return raw === 'true';
  } catch {
    return false;
  }
}

export function saveMutedState(muted: boolean): void {
  try {
    localStorage.setItem(GAME_CONFIG.STORAGE_KEY_MUTED, String(muted));
  } catch {
    // Ignore
  }
}
