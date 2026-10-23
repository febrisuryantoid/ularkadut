export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export type GameState = 'menu' | 'playing' | 'paused' | 'gameover' | 'levelcomplete';

export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export type SkinRarity = 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';

export type SnakeSkinId =
  | 'classic'
  | 'capybara'
  | 'boba'
  | 'oyen'
  | 'matcha'
  | 'cyber_sigma'
  | 'glitch_meme'
  | 'sakura'
  | 'gold'
  | 'mecha_dragon'
  | 'cosmic_galaxy'
  | 'raja_pelangi'
  | 'custom_sultan';

export type SkinPatternType =
  | 'smooth'
  | 'stripes'
  | 'spots'
  | 'cyber'
  | 'metallic'
  | 'cosmic'
  | 'rainbow';

export type CustomSkinWingType = 'none' | 'angel' | 'dragon' | 'fairy';

export type CustomSkinHeadgearType = 'none' | 'crown' | 'halo' | 'horns';

export type CustomSkinTailType = 'normal' | 'blade' | 'flame' | 'star';

export interface CustomSkinConfig {
  customName: string;
  headColor: string;
  bodyPrimary: string;
  bodySecondary: string;
  bellyColor: string;
  eyeColor: string;
  pupilColor: string;
  glowColor: string;
  sparkleColor: string;
  pattern: SkinPatternType;
  wings: CustomSkinWingType;
  headgear: CustomSkinHeadgearType;
  tail: CustomSkinTailType;
  particleType: 'sparkle' | 'ember' | 'stardust' | 'neon';
}

export interface SkinTierVFX {
  auraIntensity: number; // 0 to 1
  particleType: 'none' | 'sparkle' | 'ember' | 'stardust' | 'neon';
  trailLength: number; // 0 to 8
  shimmerRate: number;
}

export interface SnakeSkinConfig {
  id: SnakeSkinId;
  name: string;
  tagline: string;
  categoryLabel: string;
  rarity: SkinRarity;
  price: number;
  headColor: string;
  bodyPrimary: string;
  bodySecondary: string;
  bellyColor: string;
  glowColor: string;
  eyeColor: string;
  pupilColor: string;
  pattern: SkinPatternType;
  hasCrown?: boolean;
  sparkleColor?: string;
  tierVFX?: SkinTierVFX;
  wings?: CustomSkinWingType;
  headgear?: CustomSkinHeadgearType;
  tail?: CustomSkinTailType;
  isCustom?: boolean;
}

export type FruitType = 'regular' | 'golden' | 'mega';

export interface Position {
  x: number;
  y: number;
}

export interface FruitItem extends Position {
  type: FruitType;
  sizeScale: number;
  points: number;
  growth: number;
  coinValue: number;
  name: string;
  color: string;
}

export interface Obstacle extends Position {
  type: 'rock' | 'pillar';
  variant: number;
}

export interface LevelConfig {
  id: string;
  difficulty: DifficultyLevel;
  levelNumber: number; // 1 to 10
  name: string;
  subtitle: string;
  targetScore: number;
  initialTPS: number;
  maxTPS: number;
  speedIncrement: number;
  firstClearCoins: number;
  replayCoins: number;
  obstaclePattern: string;
}

export interface MissionProgress {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  rewardCoins: number;
  claimed: boolean;
  type: 'eat_total' | 'eat_golden' | 'clear_levels' | 'reach_length';
}

export interface AchievementProgress {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  rewardCoins: number;
  claimed: boolean;
}

export interface DailyStreakState {
  currentStreak: number; // 1 to 7
  lastClaimDate: string | null; // YYYY-MM-DD
  canClaimToday: boolean;
}

export interface PlayerEconomyState {
  coins: number;
  ownedSkins: SnakeSkinId[];
  equippedSkin: SnakeSkinId;
  customSkin?: CustomSkinConfig;
  unlockedLevels: Record<DifficultyLevel, number>; // highest unlocked level 1..10
  completedLevels: Record<string, { stars: number; bestScore: number }>; // key: `${difficulty}-${level}`
  lastHourlyClaimAt: number; // timestamp ms
  dailyStreak: {
    streakCount: number;
    lastClaimDate: string | null;
  };
  stats: {
    totalFruitsEaten: number;
    goldenFruitsEaten: number;
    levelsClearedCount: number;
    maxSnakeLength: number;
    highestSingleScore: number;
  };
  claimedMissions: string[];
  claimedAchievements: string[];
  missionResetDate: string;
}

export interface GameStats {
  score: number;
  highScore: number;
  speedTPS: number;
}

export interface GameEngineState {
  snake: Position[];
  direction: Direction;
  fruit: FruitItem;
  obstacles: Obstacle[];
  score: number;
  highScore: number;
  state: GameState;
  speedTPS: number;
  difficulty: DifficultyLevel;
  currentLevel: number; // 1..10
  targetScore: number;
  sessionCoinsEarned: number;
  levelCompletionReward: number;
  earnedStars: number;
  gridCols: number;
  gridRows: number;
  cutSegments: Position[];
  cutEffectTimestamp: number | null;
  gameOverReason?: 'wall' | 'obstacle' | null;
}
