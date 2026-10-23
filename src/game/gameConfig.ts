import { DifficultyLevel } from './gameTypes';
import { SNAKE_SKIN_CATALOG } from './skinCatalog';

export const GAME_CONFIG = {
  DEFAULT_GRID_COLS: 25,
  DEFAULT_GRID_ROWS: 20,
  INITIAL_SNAKE_LENGTH: 3,
  INITIAL_SPEED_TPS: 6, // 6 ticks per second initial
  MAX_SPEED_TPS: 16, // Cap at 16 ticks per second
  SPEED_INCREMENT_TPS: 0.25, // +0.25 TPS per fruit eaten
  POINTS_PER_FRUIT: 10,
  CUT_PENALTY_POINTS: 5, // Small score penalty per self-cut segment
  STORAGE_KEY_HIGH_SCORE: 'ular_kadut_highscore_v2',
  STORAGE_KEY_DIFFICULTY: 'ular_kadut_difficulty_v2',
  STORAGE_KEY_MUTED: 'ular_kadut_muted_v2',
  STORAGE_KEY_SKIN: 'ular_kadut_skin_v2',
  STORAGE_KEY_ECONOMY: 'ular_kadut_economy_v3',
  HOURLY_BONUS_COINS: 100,
  HOURLY_COOLDOWN_MS: 60 * 60 * 1000, // 1 hour in ms
  DAILY_STREAK_REWARDS: [50, 75, 100, 150, 200, 250, 400],
} as const;

export const DIFFICULTY_INFO: Record<
  DifficultyLevel,
  { label: string; description: string; badgeColor: string; initialTPS: number }
> = {
  easy: {
    label: 'Mudah',
    description: '10 Level bertahap dengan ruang manuver luas & santai.',
    badgeColor: '#24A148',
    initialTPS: 5.5,
  },
  medium: {
    label: 'Sedang',
    description: '10 Level reruntuhan batu kuno yang menantang kelincahan.',
    badgeColor: '#FF8A24',
    initialTPS: 6.5,
  },
  hard: {
    label: 'Sulit',
    description: '10 Level benteng & labirin batu kuno untuk pemain pro!',
    badgeColor: '#D9364F',
    initialTPS: 7.5,
  },
};

export const SNAKE_SKINS = SNAKE_SKIN_CATALOG;
