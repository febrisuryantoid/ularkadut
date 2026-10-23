import {
  Direction,
  Position,
  GameEngineState,
  DifficultyLevel,
  FruitItem,
} from './gameTypes';
import { GAME_CONFIG } from './gameConfig';
import { spawnFruit } from './fruitSpawner';
import { generateObstacles, detectObstacleCollision } from './obstacleGenerator';
import { getLevelConfig, MAX_LEVELS_PER_DIFFICULTY } from './levelProgression';

export function isOppositeDirection(current: Direction, next: Direction): boolean {
  if (current === 'UP' && next === 'DOWN') return true;
  if (current === 'DOWN' && next === 'UP') return true;
  if (current === 'LEFT' && next === 'RIGHT') return true;
  if (current === 'RIGHT' && next === 'LEFT') return true;
  return false;
}

export function getNextHeadPosition(head: Position, direction: Direction): Position {
  switch (direction) {
    case 'UP':
      return { x: head.x, y: head.y - 1 };
    case 'DOWN':
      return { x: head.x, y: head.y + 1 };
    case 'LEFT':
      return { x: head.x - 1, y: head.y };
    case 'RIGHT':
      return { x: head.x + 1, y: head.y };
  }
}

export function detectWallCollision(
  pos: Position,
  cols: number = GAME_CONFIG.DEFAULT_GRID_COLS,
  rows: number = GAME_CONFIG.DEFAULT_GRID_ROWS
): boolean {
  return pos.x < 0 || pos.x >= cols || pos.y < 0 || pos.y >= rows;
}

/**
 * Returns the index in the body where the head collided, or -1 if no self-collision.
 * When self-collision occurs, the snake DOES NOT DIE — instead it cuts off the body from that index!
 */
export function findSelfCollisionIndex(head: Position, bodyWithoutHead: Position[]): number {
  for (let i = 0; i < bodyWithoutHead.length; i++) {
    if (bodyWithoutHead[i].x === head.x && bodyWithoutHead[i].y === head.y) {
      return i;
    }
  }
  return -1;
}

export function calculateSpeedTPS(
  fruitsEaten: number,
  difficulty: DifficultyLevel = 'easy',
  levelNumber: number = 1
): number {
  const levelCfg = getLevelConfig(difficulty, levelNumber);
  const nextSpeed = levelCfg.initialTPS + fruitsEaten * levelCfg.speedIncrement;
  return Number(Math.min(levelCfg.maxTPS, nextSpeed).toFixed(2));
}

export function createInitialSnake(
  cols: number = GAME_CONFIG.DEFAULT_GRID_COLS,
  rows: number = GAME_CONFIG.DEFAULT_GRID_ROWS
): Position[] {
  const startX = Math.floor(cols / 2);
  const startY = Math.floor(rows / 2);
  const snake: Position[] = [];

  for (let i = 0; i < GAME_CONFIG.INITIAL_SNAKE_LENGTH; i++) {
    snake.push({ x: startX - i, y: startY });
  }
  return snake;
}

export function createInitialEngineState(
  highScore: number,
  difficulty: DifficultyLevel = 'easy',
  cols: number = GAME_CONFIG.DEFAULT_GRID_COLS,
  rows: number = GAME_CONFIG.DEFAULT_GRID_ROWS,
  levelNumber: number = 1
): GameEngineState {
  const clampedLevel = Math.max(1, Math.min(MAX_LEVELS_PER_DIFFICULTY, levelNumber));
  const levelCfg = getLevelConfig(difficulty, clampedLevel);
  const snake = createInitialSnake(cols, rows);
  const obstacles = generateObstacles(cols, rows, difficulty, snake[0], clampedLevel);
  const fruit: FruitItem = spawnFruit(snake, obstacles, cols, rows) ?? {
    x: 2,
    y: 2,
    type: 'regular',
    sizeScale: 1.0,
    points: 10,
    growth: 1,
    coinValue: 2,
    name: 'Apel Segar',
    color: '#D9364F',
  };

  return {
    snake,
    direction: 'RIGHT',
    fruit,
    obstacles,
    score: 0,
    highScore,
    state: 'menu',
    speedTPS: levelCfg.initialTPS,
    difficulty,
    currentLevel: clampedLevel,
    targetScore: levelCfg.targetScore,
    sessionCoinsEarned: 0,
    levelCompletionReward: 0,
    earnedStars: 0,
    gridCols: cols,
    gridRows: rows,
    cutSegments: [],
    cutEffectTimestamp: null,
    gameOverReason: null,
  };
}

export { detectObstacleCollision };
