import { Position, Obstacle, FruitItem, FruitType } from './gameTypes';
import { GAME_CONFIG } from './gameConfig';

/**
 * Fruit presets with varying sizes, points, coin values, and growth lengths.
 */
export const FRUIT_PRESETS: Record<FruitType, Omit<FruitItem, 'x' | 'y'>> = {
  regular: {
    type: 'regular',
    sizeScale: 1.0,
    points: 10,
    growth: 1, // standard +1 segment
    coinValue: 2,
    name: 'Apel Segar',
    color: '#D9364F',
  },
  golden: {
    type: 'golden',
    sizeScale: 1.35,
    points: 25,
    growth: 2, // +2 segments
    coinValue: 5,
    name: 'Mangga Emas',
    color: '#FFC928',
  },
  mega: {
    type: 'mega',
    sizeScale: 1.8,
    points: 50,
    growth: 3, // +3 segments!
    coinValue: 12,
    name: 'Semangka Raksasa',
    color: '#24A148',
  },
};

/**
 * Spawns fruit at a random empty grid cell not occupied by the snake or obstacles.
 * Determines fruit size and type probabilistically:
 * - 70% chance of Regular Apple (1x size, +1 growth, +2 coins)
 * - 20% chance of Golden Mango (1.35x size, +2 growth, +5 coins)
 * - 10% chance of Mega Watermelon (1.8x size, +3 growth, +12 coins)
 */
export function spawnFruit(
  snake: Position[],
  obstacles: Obstacle[] = [],
  cols: number = GAME_CONFIG.DEFAULT_GRID_COLS,
  rows: number = GAME_CONFIG.DEFAULT_GRID_ROWS
): FruitItem | null {
  const occupied = new Set<string>();

  for (const seg of snake) {
    occupied.add(`${seg.x},${seg.y}`);
  }

  for (const obs of obstacles) {
    occupied.add(`${obs.x},${obs.y}`);
  }

  const totalCells = cols * rows;
  if (occupied.size >= totalCells) {
    return null; // Grid is completely full
  }

  let selectedPos: Position | null = null;

  // Fast path sampling
  if (occupied.size < totalCells * 0.6) {
    for (let attempt = 0; attempt < 60; attempt++) {
      const rx = Math.floor(Math.random() * cols);
      const ry = Math.floor(Math.random() * rows);
      if (!occupied.has(`${rx},${ry}`)) {
        selectedPos = { x: rx, y: ry };
        break;
      }
    }
  }

  // Guaranteed fallback path
  if (!selectedPos) {
    const freeCells: Position[] = [];
    for (let x = 0; x < cols; x++) {
      for (let y = 0; y < rows; y++) {
        if (!occupied.has(`${x},${y}`)) {
          freeCells.push({ x, y });
        }
      }
    }

    if (freeCells.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * freeCells.length);
    selectedPos = freeCells[randomIndex];
  }

  // Roll fruit type probability
  const roll = Math.random();
  let type: FruitType = 'regular';
  if (roll < 0.1) {
    type = 'mega'; // 10% rare mega giant fruit!
  } else if (roll < 0.3) {
    type = 'golden'; // 20% golden bonus fruit
  } else {
    type = 'regular'; // 70% regular apple
  }

  const preset = FRUIT_PRESETS[type];

  return {
    x: selectedPos.x,
    y: selectedPos.y,
    ...preset,
  };
}
