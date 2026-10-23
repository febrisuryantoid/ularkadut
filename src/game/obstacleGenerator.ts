import { Position, Obstacle, DifficultyLevel } from './gameTypes';
import { getLevelConfig } from './levelProgression';

/**
 * Generates obstacle layout based on difficulty level, level number (1..10), and grid dimensions.
 * Guarantees:
 * 1. A wide safe spawn corridor around the snake's starting center position.
 * 2. At least a 2-cell open ring around the outer fatal walls so the perimeter is always solvable.
 * 3. Open, symmetric, non-trapping formations suitable for all screen aspect ratios.
 */
export function generateObstacles(
  cols: number,
  rows: number,
  difficulty: DifficultyLevel,
  snakeStart: Position = { x: Math.floor(cols / 2), y: Math.floor(rows / 2) },
  levelNumber: number = 1
): Obstacle[] {
  const levelCfg = getLevelConfig(difficulty, levelNumber);
  const pattern = levelCfg.obstaclePattern;

  if (pattern === 'easy_open') {
    return [];
  }

  const obstacles: Obstacle[] = [];
  const occupied = new Set<string>();

  // Wide safe zone around snake start (horizontal corridor + vertical breathing room)
  const isSafeZone = (x: number, y: number) => {
    return Math.abs(x - snakeStart.x) <= 4 && Math.abs(y - snakeStart.y) <= 3;
  };

  // Keep obstacles at least 2 cells away from outer fatal walls so perimeter is 100% passable
  const isValidPosition = (x: number, y: number) => {
    if (x < 2 || x > cols - 3 || y < 2 || y > rows - 3) return false;
    if (isSafeZone(x, y)) return false;
    return !occupied.has(`${x},${y}`);
  };

  const addObstacle = (x: number, y: number, variant?: number) => {
    const rx = Math.round(x);
    const ry = Math.round(y);
    if (isValidPosition(rx, ry)) {
      occupied.add(`${rx},${ry}`);
      const v = variant !== undefined ? variant : (rx + ry) % 3;
      obstacles.push({ x: rx, y: ry, type: 'pillar', variant: v });
    }
  };

  const midX = Math.floor(cols / 2);
  const midY = Math.floor(rows / 2);
  const qx1 = Math.max(3, Math.floor(cols * 0.24));
  const qx2 = Math.min(cols - 4, Math.floor(cols * 0.76));
  const qy1 = Math.max(3, Math.floor(rows * 0.24));
  const qy2 = Math.min(rows - 4, Math.floor(rows * 0.76));

  const ix1 = Math.max(4, Math.floor(cols * 0.34));
  const ix2 = Math.min(cols - 5, Math.floor(cols * 0.66));
  const iy1 = Math.max(4, Math.floor(rows * 0.34));
  const iy2 = Math.min(rows - 5, Math.floor(rows * 0.66));

  switch (pattern) {
    // ================= EASY (MUDAH 1-10) =================
    case 'easy_twin_dots': {
      addObstacle(qx1, midY, 0);
      addObstacle(qx2, midY, 1);
      break;
    }
    case 'easy_four_corners': {
      addObstacle(qx1, qy1, 0);
      addObstacle(qx2, qy1, 1);
      addObstacle(qx1, qy2, 2);
      addObstacle(qx2, qy2, 0);
      break;
    }
    case 'easy_north_south_gates': {
      addObstacle(midX, qy1, 0);
      addObstacle(midX, qy2, 1);
      addObstacle(qx1, qy1, 2);
      addObstacle(qx2, qy2, 0);
      break;
    }
    case 'easy_wide_diamond': {
      addObstacle(midX, qy1, 0);
      addObstacle(midX, qy2, 1);
      addObstacle(qx1, midY, 2);
      addObstacle(qx2, midY, 0);
      break;
    }
    case 'easy_parallel_stones': {
      addObstacle(qx1, qy1, 0);
      addObstacle(midX, qy1, 1);
      addObstacle(qx2, qy1, 2);
      addObstacle(qx1, qy2, 2);
      addObstacle(midX, qy2, 1);
      addObstacle(qx2, qy2, 0);
      break;
    }
    case 'easy_sun_ring': {
      addObstacle(qx1, qy1, 0);
      addObstacle(qx2, qy1, 1);
      addObstacle(qx1, qy2, 2);
      addObstacle(qx2, qy2, 0);
      addObstacle(midX, qy1, 1);
      addObstacle(midX, qy2, 2);
      addObstacle(qx1, midY, 0);
      addObstacle(qx2, midY, 1);
      break;
    }
    case 'easy_emerald_valley': {
      addObstacle(qx1, qy1, 0);
      addObstacle(qx1 + 1, qy1, 1);
      addObstacle(qx2, qy1, 1);
      addObstacle(qx2 - 1, qy1, 0);
      addObstacle(qx1, qy2, 2);
      addObstacle(qx1 + 1, qy2, 0);
      addObstacle(qx2, qy2, 0);
      addObstacle(qx2 - 1, qy2, 2);
      break;
    }
    case 'easy_star_crown': {
      addObstacle(qx1, qy1, 0);
      addObstacle(qx2, qy1, 1);
      addObstacle(qx1, qy2, 2);
      addObstacle(qx2, qy2, 0);
      addObstacle(ix1, iy1, 1);
      addObstacle(ix2, iy1, 2);
      addObstacle(ix1, iy2, 0);
      addObstacle(ix2, iy2, 1);
      addObstacle(midX, qy1, 2);
      addObstacle(midX, qy2, 0);
      break;
    }
    case 'easy_twin_arch': {
      addObstacle(qx1, qy1, 0);
      addObstacle(qx1, qy1 + 1, 1);
      addObstacle(qx1, qy2, 2);
      addObstacle(qx1, qy2 - 1, 0);
      addObstacle(qx2, qy1, 1);
      addObstacle(qx2, qy1 + 1, 2);
      addObstacle(qx2, qy2, 0);
      addObstacle(qx2, qy2 - 1, 1);
      break;
    }
    case 'easy_garden_cross': {
      addObstacle(midX, qy1, 0);
      addObstacle(midX, qy2, 1);
      addObstacle(qx1, midY, 2);
      addObstacle(qx2, midY, 0);
      addObstacle(qx1, qy1, 1);
      addObstacle(qx2, qy2, 2);
      break;
    }
    case 'easy_lotus_pond': {
      addObstacle(ix1, qy1, 0);
      addObstacle(ix2, qy1, 1);
      addObstacle(ix1, qy2, 2);
      addObstacle(ix2, qy2, 0);
      addObstacle(qx1, midY, 1);
      addObstacle(qx2, midY, 2);
      break;
    }
    case 'easy_bamboo_grove': {
      addObstacle(qx1, qy1, 0);
      addObstacle(qx1, midY, 1);
      addObstacle(qx1, qy2, 2);
      addObstacle(qx2, qy1, 2);
      addObstacle(qx2, midY, 1);
      addObstacle(qx2, qy2, 0);
      break;
    }
    case 'easy_crystal_pillars': {
      addObstacle(qx1, qy1, 0);
      addObstacle(midX, qy1, 1);
      addObstacle(qx2, qy1, 2);
      addObstacle(qx1, qy2, 1);
      addObstacle(midX, qy2, 2);
      addObstacle(qx2, qy2, 0);
      addObstacle(ix1, iy1, 0);
      addObstacle(ix2, iy2, 1);
      break;
    }
    case 'easy_jade_sanctuary': {
      addObstacle(qx1, qy1, 0);
      addObstacle(qx1 + 1, qy1, 1);
      addObstacle(qx2, qy1, 2);
      addObstacle(qx2 - 1, qy1, 0);
      addObstacle(qx1, qy2, 1);
      addObstacle(qx1 + 1, qy2, 2);
      addObstacle(qx2, qy2, 0);
      addObstacle(qx2 - 1, qy2, 1);
      addObstacle(midX, qy1, 2);
      addObstacle(midX, qy2, 0);
      break;
    }
    case 'easy_golden_meadow': {
      addObstacle(qx1, qy1, 0);
      addObstacle(qx2, qy1, 1);
      addObstacle(qx1, qy2, 2);
      addObstacle(qx2, qy2, 0);
      addObstacle(ix1, iy1, 1);
      addObstacle(ix2, iy1, 2);
      addObstacle(ix1, iy2, 0);
      addObstacle(ix2, iy2, 1);
      break;
    }
    case 'easy_royal_courtyard': {
      addObstacle(qx1, qy1, 0);
      addObstacle(ix1, qy1, 1);
      addObstacle(ix2, qy1, 2);
      addObstacle(qx2, qy1, 0);
      addObstacle(qx1, qy2, 1);
      addObstacle(ix1, qy2, 2);
      addObstacle(ix2, qy2, 0);
      addObstacle(qx2, qy2, 1);
      addObstacle(qx1, midY, 2);
      addObstacle(qx2, midY, 0);
      break;
    }
    case 'easy_sky_citadel': {
      addObstacle(qx1, qy1, 0);
      addObstacle(qx1 + 1, qy1, 1);
      addObstacle(qx2, qy1, 2);
      addObstacle(qx2 - 1, qy1, 0);
      addObstacle(qx1, qy2, 1);
      addObstacle(qx1 + 1, qy2, 2);
      addObstacle(qx2, qy2, 0);
      addObstacle(qx2 - 1, qy2, 1);
      addObstacle(ix1, iy1, 2);
      addObstacle(ix2, iy2, 0);
      break;
    }
    case 'easy_forest_emperor': {
      addObstacle(qx1, qy1, 0);
      addObstacle(midX, qy1, 1);
      addObstacle(qx2, qy1, 2);
      addObstacle(qx1, midY, 1);
      addObstacle(qx2, midY, 2);
      addObstacle(qx1, qy2, 2);
      addObstacle(midX, qy2, 1);
      addObstacle(qx2, qy2, 0);
      addObstacle(ix1, iy1, 0);
      addObstacle(ix2, iy1, 1);
      addObstacle(ix1, iy2, 2);
      addObstacle(ix2, iy2, 0);
      break;
    }

    // ================= MEDIUM (SEDANG 1-20) =================
    case 'med_quad_pillars': {
      addObstacle(qx1, qy1, 0);
      addObstacle(qx1 + 1, qy1, 1);
      addObstacle(qx2, qy1, 1);
      addObstacle(qx2 - 1, qy1, 0);
      addObstacle(qx1, qy2, 2);
      addObstacle(qx1 + 1, qy2, 0);
      addObstacle(qx2, qy2, 0);
      addObstacle(qx2 - 1, qy2, 2);
      break;
    }
    case 'med_twin_lanes': {
      for (let d = -2; d <= 2; d++) {
        if (d !== 0) {
          addObstacle(midX + d, qy1, 0);
          addObstacle(midX + d, qy2, 1);
        }
      }
      addObstacle(qx1, midY, 2);
      addObstacle(qx2, midY, 2);
      break;
    }
    case 'med_corner_l': {
      // Top-left L
      addObstacle(qx1, qy1, 0);
      addObstacle(qx1 + 1, qy1, 1);
      addObstacle(qx1, qy1 + 1, 2);
      // Top-right L
      addObstacle(qx2, qy1, 0);
      addObstacle(qx2 - 1, qy1, 1);
      addObstacle(qx2, qy1 + 1, 2);
      // Bottom-left L
      addObstacle(qx1, qy2, 0);
      addObstacle(qx1 + 1, qy2, 1);
      addObstacle(qx1, qy2 - 1, 2);
      // Bottom-right L
      addObstacle(qx2, qy2, 0);
      addObstacle(qx2 - 1, qy2, 1);
      addObstacle(qx2, qy2 - 1, 2);
      break;
    }
    case 'med_compass': {
      addObstacle(midX, qy1, 0);
      addObstacle(midX, qy1 + 1, 1);
      addObstacle(midX, qy2, 0);
      addObstacle(midX, qy2 - 1, 1);
      addObstacle(qx1, midY, 2);
      addObstacle(qx1 + 1, midY, 0);
      addObstacle(qx2, midY, 2);
      addObstacle(qx2 - 1, midY, 0);
      addObstacle(qx1, qy1, 1);
      addObstacle(qx2, qy1, 1);
      addObstacle(qx1, qy2, 1);
      addObstacle(qx2, qy2, 1);
      break;
    }
    case 'med_river_bridges': {
      addObstacle(ix1, qy1, 0);
      addObstacle(ix1, qy1 + 1, 1);
      addObstacle(ix1, qy2, 2);
      addObstacle(ix1, qy2 - 1, 0);
      addObstacle(ix2, qy1, 1);
      addObstacle(ix2, qy1 + 1, 2);
      addObstacle(ix2, qy2, 0);
      addObstacle(ix2, qy2 - 1, 1);
      addObstacle(qx1, midY, 2);
      addObstacle(qx2, midY, 2);
      break;
    }
    case 'med_temple_yard': {
      addObstacle(qx1, qy1, 0);
      addObstacle(qx1 + 1, qy1, 1);
      addObstacle(qx2, qy1, 1);
      addObstacle(qx2 - 1, qy1, 0);
      addObstacle(qx1, qy2, 2);
      addObstacle(qx1 + 1, qy2, 0);
      addObstacle(qx2, qy2, 0);
      addObstacle(qx2 - 1, qy2, 2);
      addObstacle(midX, qy1, 1);
      addObstacle(midX, qy2, 1);
      addObstacle(qx1, midY, 2);
      addObstacle(qx2, midY, 2);
      break;
    }
    case 'med_zigzag': {
      addObstacle(qx1, qy1, 0);
      addObstacle(ix1, iy1, 1);
      addObstacle(ix2, iy1, 2);
      addObstacle(qx2, qy1, 0);
      addObstacle(qx1, qy2, 1);
      addObstacle(ix1, iy2, 2);
      addObstacle(ix2, iy2, 0);
      addObstacle(qx2, qy2, 1);
      addObstacle(qx1, midY, 2);
      addObstacle(qx2, midY, 0);
      break;
    }
    case 'med_guardian_ring': {
      addObstacle(qx1, qy1, 0);
      addObstacle(ix1, qy1, 1);
      addObstacle(ix2, qy1, 2);
      addObstacle(qx2, qy1, 0);
      addObstacle(qx1, qy2, 0);
      addObstacle(ix1, qy2, 1);
      addObstacle(ix2, qy2, 2);
      addObstacle(qx2, qy2, 0);
      addObstacle(qx1, iy1, 1);
      addObstacle(qx1, iy2, 2);
      addObstacle(qx2, iy1, 1);
      addObstacle(qx2, iy2, 2);
      break;
    }
    case 'med_six_clusters': {
      const points = [
        { x: qx1, y: qy1 },
        { x: midX, y: qy1 },
        { x: qx2, y: qy1 },
        { x: qx1, y: qy2 },
        { x: midX, y: qy2 },
        { x: qx2, y: qy2 },
      ];
      points.forEach((p, idx) => {
        addObstacle(p.x, p.y, idx % 3);
        addObstacle(p.x + (idx % 2 === 0 ? 1 : -1), p.y, (idx + 1) % 3);
      });
      addObstacle(qx1, midY, 1);
      addObstacle(qx2, midY, 2);
      break;
    }
    case 'med_colosseum': {
      [
        { cx: qx1, cy: qy1, dx: 1, dy: 1 },
        { cx: qx2, cy: qy1, dx: -1, dy: 1 },
        { cx: qx1, cy: qy2, dx: 1, dy: -1 },
        { cx: qx2, cy: qy2, dx: -1, dy: -1 },
      ].forEach(({ cx, cy, dx, dy }, i) => {
        addObstacle(cx, cy, i % 3);
        addObstacle(cx + dx, cy, (i + 1) % 3);
        addObstacle(cx, cy + dy, (i + 2) % 3);
      });
      addObstacle(midX, qy1, 0);
      addObstacle(midX, qy2, 1);
      addObstacle(qx1, midY, 2);
      addObstacle(qx2, midY, 0);
      break;
    }
    case 'med_twin_bastion': {
      addObstacle(qx1, qy1, 0);
      addObstacle(qx1 + 1, qy1, 1);
      addObstacle(qx1 + 2, qy1, 2);
      addObstacle(qx2, qy1, 0);
      addObstacle(qx2 - 1, qy1, 1);
      addObstacle(qx2 - 2, qy1, 2);
      addObstacle(qx1, qy2, 2);
      addObstacle(qx1 + 1, qy2, 1);
      addObstacle(qx1 + 2, qy2, 0);
      addObstacle(qx2, qy2, 2);
      addObstacle(qx2 - 1, qy2, 1);
      addObstacle(qx2 - 2, qy2, 0);
      addObstacle(qx1, midY, 1);
      addObstacle(qx2, midY, 1);
      break;
    }
    case 'med_canyon_gates': {
      addObstacle(ix1, qy1, 0);
      addObstacle(ix1, iy1, 1);
      addObstacle(ix2, qy1, 2);
      addObstacle(ix2, iy1, 0);
      addObstacle(ix1, qy2, 1);
      addObstacle(ix1, iy2, 2);
      addObstacle(ix2, qy2, 0);
      addObstacle(ix2, iy2, 1);
      addObstacle(qx1, qy1, 2);
      addObstacle(qx2, qy1, 0);
      addObstacle(qx1, qy2, 0);
      addObstacle(qx2, qy2, 2);
      break;
    }
    case 'med_amber_pillars': {
      [qx1, ix1, ix2, qx2].forEach((x, idx) => {
        addObstacle(x, qy1, idx % 3);
        addObstacle(x, qy2, (idx + 1) % 3);
      });
      addObstacle(qx1, iy1, 0);
      addObstacle(qx2, iy1, 1);
      addObstacle(qx1, iy2, 2);
      addObstacle(qx2, iy2, 0);
      break;
    }
    case 'med_sun_altar': {
      addObstacle(midX - 1, qy1, 0);
      addObstacle(midX + 1, qy1, 1);
      addObstacle(midX - 1, qy2, 1);
      addObstacle(midX + 1, qy2, 0);
      addObstacle(qx1, midY - 1, 2);
      addObstacle(qx1, midY + 1, 0);
      addObstacle(qx2, midY - 1, 0);
      addObstacle(qx2, midY + 1, 2);
      addObstacle(qx1, qy1, 1);
      addObstacle(qx2, qy1, 2);
      addObstacle(qx1, qy2, 2);
      addObstacle(qx2, qy2, 1);
      break;
    }
    case 'med_ancient_arena': {
      [
        { cx: qx1, cy: qy1, dx: 1, dy: 1 },
        { cx: qx2, cy: qy1, dx: -1, dy: 1 },
        { cx: qx1, cy: qy2, dx: 1, dy: -1 },
        { cx: qx2, cy: qy2, dx: -1, dy: -1 },
      ].forEach(({ cx, cy, dx, dy }, i) => {
        addObstacle(cx, cy, i % 3);
        addObstacle(cx + dx, cy, (i + 1) % 3);
        addObstacle(cx, cy + dy, (i + 2) % 3);
      });
      addObstacle(ix1, iy1, 0);
      addObstacle(ix2, iy1, 1);
      addObstacle(ix1, iy2, 2);
      addObstacle(ix2, iy2, 0);
      break;
    }
    case 'med_phoenix_wings': {
      addObstacle(qx1, qy1, 0);
      addObstacle(qx1 + 1, qy1 + 1, 1);
      addObstacle(ix1, iy1, 2);
      addObstacle(qx2, qy1, 0);
      addObstacle(qx2 - 1, qy1 + 1, 1);
      addObstacle(ix2, iy1, 2);
      addObstacle(qx1, qy2, 2);
      addObstacle(qx1 + 1, qy2 - 1, 1);
      addObstacle(ix1, iy2, 0);
      addObstacle(qx2, qy2, 2);
      addObstacle(qx2 - 1, qy2 - 1, 1);
      addObstacle(ix2, iy2, 0);
      addObstacle(midX, qy1, 1);
      addObstacle(midX, qy2, 1);
      break;
    }
    case 'med_golden_pagoda': {
      [qx1, qx2].forEach((x) => {
        addObstacle(x, qy1, 0);
        addObstacle(x, iy1, 1);
        addObstacle(x, iy2, 2);
        addObstacle(x, qy2, 0);
      });
      addObstacle(ix1, qy1, 1);
      addObstacle(ix2, qy1, 2);
      addObstacle(ix1, qy2, 2);
      addObstacle(ix2, qy2, 1);
      addObstacle(midX, qy1, 0);
      addObstacle(midX, qy2, 0);
      break;
    }
    case 'med_dragon_court': {
      addObstacle(qx1, qy1, 0);
      addObstacle(qx1 + 1, qy1, 1);
      addObstacle(qx2, qy1, 1);
      addObstacle(qx2 - 1, qy1, 0);
      addObstacle(qx1, qy2, 2);
      addObstacle(qx1 + 1, qy2, 0);
      addObstacle(qx2, qy2, 0);
      addObstacle(qx2 - 1, qy2, 2);
      addObstacle(ix1, iy1, 1);
      addObstacle(ix2, iy1, 2);
      addObstacle(ix1, iy2, 2);
      addObstacle(ix2, iy2, 1);
      addObstacle(qx1, midY, 0);
      addObstacle(qx2, midY, 0);
      break;
    }
    case 'med_imperial_fort': {
      [
        { cx: qx1, cy: qy1, dx: 1, dy: 1 },
        { cx: qx2, cy: qy1, dx: -1, dy: 1 },
        { cx: qx1, cy: qy2, dx: 1, dy: -1 },
        { cx: qx2, cy: qy2, dx: -1, dy: -1 },
      ].forEach(({ cx, cy, dx, dy }, i) => {
        addObstacle(cx, cy, i % 3);
        addObstacle(cx + dx, cy, (i + 1) % 3);
        addObstacle(cx, cy + dy, (i + 2) % 3);
      });
      addObstacle(midX - 1, qy1, 0);
      addObstacle(midX + 1, qy1, 1);
      addObstacle(midX - 1, qy2, 1);
      addObstacle(midX + 1, qy2, 0);
      addObstacle(qx1, midY, 2);
      addObstacle(qx2, midY, 2);
      break;
    }
    case 'med_candi_sultan': {
      [
        { cx: qx1, cy: qy1, dx: 1, dy: 1 },
        { cx: qx2, cy: qy1, dx: -1, dy: 1 },
        { cx: qx1, cy: qy2, dx: 1, dy: -1 },
        { cx: qx2, cy: qy2, dx: -1, dy: -1 },
      ].forEach(({ cx, cy, dx, dy }, i) => {
        addObstacle(cx, cy, i % 3);
        addObstacle(cx + dx, cy, (i + 1) % 3);
        addObstacle(cx, cy + dy, (i + 2) % 3);
      });
      addObstacle(ix1, iy1, 0);
      addObstacle(ix2, iy1, 1);
      addObstacle(ix1, iy2, 2);
      addObstacle(ix2, iy2, 0);
      addObstacle(midX, qy1, 1);
      addObstacle(midX, qy2, 2);
      addObstacle(qx1, midY, 0);
      addObstacle(qx2, midY, 1);
      break;
    }

    // ================= HARD (SULIT 1-20) =================
    case 'hard_fortress_gates': {
      const c1 = Math.max(3, Math.floor(cols * 0.2));
      const c2 = Math.min(cols - 4, Math.floor(cols * 0.8));
      const r1 = Math.max(3, Math.floor(rows * 0.2));
      const r2 = Math.min(rows - 4, Math.floor(rows * 0.8));

      [
        { cx: c1, cy: r1, dx: 1, dy: 1 },
        { cx: c2, cy: r1, dx: -1, dy: 1 },
        { cx: c1, cy: r2, dx: 1, dy: -1 },
        { cx: c2, cy: r2, dx: -1, dy: -1 },
      ].forEach(({ cx, cy, dx, dy }, idx) => {
        addObstacle(cx, cy, idx % 3);
        addObstacle(cx + dx, cy, (idx + 1) % 3);
        addObstacle(cx, cy + dy, (idx + 2) % 3);
      });
      addObstacle(ix1, r1, 1);
      addObstacle(ix2, r1, 2);
      addObstacle(ix1, r2, 0);
      addObstacle(ix2, r2, 1);
      break;
    }
    case 'hard_cross_shield': {
      addObstacle(qx1, qy1, 0);
      addObstacle(qx2, qy1, 1);
      addObstacle(qx1, qy2, 2);
      addObstacle(qx2, qy2, 0);
      addObstacle(midX - 1, qy1, 1);
      addObstacle(midX, qy1, 0);
      addObstacle(midX + 1, qy1, 2);
      addObstacle(midX - 1, qy2, 2);
      addObstacle(midX, qy2, 0);
      addObstacle(midX + 1, qy2, 1);
      addObstacle(qx1, midY - 1, 0);
      addObstacle(qx1, midY, 1);
      addObstacle(qx1, midY + 1, 2);
      addObstacle(qx2, midY - 1, 2);
      addObstacle(qx2, midY, 1);
      addObstacle(qx2, midY + 1, 0);
      break;
    }
    case 'hard_dragon_teeth': {
      for (let x = qx1; x <= qx2; x += 2) {
        addObstacle(x, qy1, x % 3);
        addObstacle(x, qy2, (x + 1) % 3);
      }
      addObstacle(qx1, iy1, 0);
      addObstacle(qx1, iy2, 1);
      addObstacle(qx2, iy1, 2);
      addObstacle(qx2, iy2, 0);
      break;
    }
    case 'hard_hourglass': {
      addObstacle(qx1, qy1, 0);
      addObstacle(qx1 + 1, qy1, 1);
      addObstacle(qx2, qy1, 1);
      addObstacle(qx2 - 1, qy1, 0);
      addObstacle(qx1, qy2, 2);
      addObstacle(qx1 + 1, qy2, 0);
      addObstacle(qx2, qy2, 0);
      addObstacle(qx2 - 1, qy2, 2);

      addObstacle(ix1, iy1, 1);
      addObstacle(ix2, iy1, 2);
      addObstacle(ix1, iy2, 2);
      addObstacle(ix2, iy2, 1);

      addObstacle(midX, qy1, 0);
      addObstacle(midX, qy2, 0);
      addObstacle(qx1, midY, 1);
      addObstacle(qx2, midY, 2);
      break;
    }
    case 'hard_eight_mandala': {
      const ring = [
        { x: qx1, y: qy1 },
        { x: midX, y: qy1 },
        { x: qx2, y: qy1 },
        { x: qx2, y: midY },
        { x: qx2, y: qy2 },
        { x: midX, y: qy2 },
        { x: qx1, y: qy2 },
        { x: qx1, y: midY },
      ];
      ring.forEach((pt, i) => {
        addObstacle(pt.x, pt.y, i % 3);
      });
      addObstacle(ix1, iy1, 0);
      addObstacle(ix2, iy1, 1);
      addObstacle(ix1, iy2, 2);
      addObstacle(ix2, iy2, 0);
      addObstacle(qx1 + 1, qy1, 1);
      addObstacle(qx2 - 1, qy1, 2);
      addObstacle(qx1 + 1, qy2, 2);
      addObstacle(qx2 - 1, qy2, 1);
      break;
    }
    case 'hard_twin_citadel': {
      addObstacle(qx1, qy1, 0);
      addObstacle(qx1 + 1, qy1, 1);
      addObstacle(qx1, iy1, 2);
      addObstacle(qx1, iy2, 0);
      addObstacle(qx1, qy2, 1);
      addObstacle(qx1 + 1, qy2, 2);
      addObstacle(qx2, qy1, 0);
      addObstacle(qx2 - 1, qy1, 1);
      addObstacle(qx2, iy1, 2);
      addObstacle(qx2, iy2, 0);
      addObstacle(qx2, qy2, 1);
      addObstacle(qx2 - 1, qy2, 2);
      addObstacle(midX - 1, qy1, 0);
      addObstacle(midX + 1, qy1, 1);
      addObstacle(midX - 1, qy2, 1);
      addObstacle(midX + 1, qy2, 0);
      break;
    }
    case 'hard_knight_corridor': {
      [qx1, ix1, ix2, qx2].forEach((x, idx) => {
        addObstacle(x, qy1, idx % 3);
        addObstacle(x, qy2, (idx + 1) % 3);
      });
      addObstacle(qx1, iy1, 0);
      addObstacle(qx2, iy1, 1);
      addObstacle(qx1, iy2, 2);
      addObstacle(qx2, iy2, 0);
      addObstacle(ix1, iy1, 1);
      addObstacle(ix2, iy2, 2);
      addObstacle(midX - 5, midY, 0);
      addObstacle(midX + 5, midY, 1);
      break;
    }
    case 'hard_open_spiral': {
      addObstacle(qx1, qy1, 0);
      addObstacle(qx1 + 1, qy1, 1);
      addObstacle(qx1 + 2, qy1, 2);
      addObstacle(qx2, qy1, 0);
      addObstacle(qx2, qy1 + 1, 1);
      addObstacle(qx2, qy1 + 2, 2);
      addObstacle(qx2, qy2, 0);
      addObstacle(qx2 - 1, qy2, 1);
      addObstacle(qx2 - 2, qy2, 2);
      addObstacle(qx1, qy2, 0);
      addObstacle(qx1, qy2 - 1, 1);
      addObstacle(qx1, qy2 - 2, 2);
      addObstacle(ix1, iy1, 1);
      addObstacle(ix2, iy1, 2);
      addObstacle(ix1, iy2, 2);
      addObstacle(ix2, iy2, 1);
      break;
    }
    case 'hard_stone_throne': {
      [
        { cx: qx1, cy: qy1, dx: 1, dy: 1 },
        { cx: qx2, cy: qy1, dx: -1, dy: 1 },
        { cx: qx1, cy: qy2, dx: 1, dy: -1 },
        { cx: qx2, cy: qy2, dx: -1, dy: -1 },
      ].forEach(({ cx, cy, dx, dy }, idx) => {
        addObstacle(cx, cy, idx % 3);
        addObstacle(cx + dx, cy, (idx + 1) % 3);
        addObstacle(cx, cy + dy, (idx + 2) % 3);
      });
      addObstacle(ix1, iy1, 0);
      addObstacle(ix2, iy1, 1);
      addObstacle(ix1, iy2, 2);
      addObstacle(ix2, iy2, 0);
      addObstacle(midX, qy1, 1);
      addObstacle(midX, qy2, 2);
      addObstacle(qx1, midY, 0);
      addObstacle(qx2, midY, 1);
      break;
    }
    case 'hard_crimson_gates': {
      [qx1, ix1, ix2, qx2].forEach((x, idx) => {
        addObstacle(x, qy1, idx % 3);
        addObstacle(x, qy1 + 1, (idx + 1) % 3);
        addObstacle(x, qy2, (idx + 1) % 3);
        addObstacle(x, qy2 - 1, idx % 3);
      });
      addObstacle(qx1, midY, 0);
      addObstacle(qx2, midY, 1);
      break;
    }
    case 'hard_magma_cross': {
      [
        { cx: qx1, cy: qy1, dx: 1, dy: 1 },
        { cx: qx2, cy: qy1, dx: -1, dy: 1 },
        { cx: qx1, cy: qy2, dx: 1, dy: -1 },
        { cx: qx2, cy: qy2, dx: -1, dy: -1 },
      ].forEach(({ cx, cy, dx, dy }, idx) => {
        addObstacle(cx, cy, idx % 3);
        addObstacle(cx + dx, cy, (idx + 1) % 3);
        addObstacle(cx, cy + dy, (idx + 2) % 3);
      });
      addObstacle(midX - 1, qy1, 0);
      addObstacle(midX, qy1, 1);
      addObstacle(midX + 1, qy1, 2);
      addObstacle(midX - 1, qy2, 2);
      addObstacle(midX, qy2, 1);
      addObstacle(midX + 1, qy2, 0);
      break;
    }
    case 'hard_volcano_ring': {
      for (let x = qx1; x <= qx2; x += 2) {
        addObstacle(x, qy1, x % 3);
        addObstacle(x, qy2, (x + 1) % 3);
      }
      addObstacle(qx1, iy1, 0);
      addObstacle(qx1, midY, 1);
      addObstacle(qx1, iy2, 2);
      addObstacle(qx2, iy1, 2);
      addObstacle(qx2, midY, 1);
      addObstacle(qx2, iy2, 0);
      addObstacle(ix1, iy1, 1);
      addObstacle(ix2, iy2, 2);
      break;
    }
    case 'hard_obsidian_peaks': {
      const c1 = Math.max(3, Math.floor(cols * 0.2));
      const c2 = Math.min(cols - 4, Math.floor(cols * 0.8));
      const r1 = Math.max(3, Math.floor(rows * 0.2));
      const r2 = Math.min(rows - 4, Math.floor(rows * 0.8));
      [
        { cx: c1, cy: r1, dx: 1, dy: 1 },
        { cx: c2, cy: r1, dx: -1, dy: 1 },
        { cx: c1, cy: r2, dx: 1, dy: -1 },
        { cx: c2, cy: r2, dx: -1, dy: -1 },
      ].forEach(({ cx, cy, dx, dy }, idx) => {
        addObstacle(cx, cy, idx % 3);
        addObstacle(cx + dx, cy, (idx + 1) % 3);
        addObstacle(cx + dx * 2, cy, (idx + 2) % 3);
        addObstacle(cx, cy + dy, (idx + 1) % 3);
      });
      addObstacle(ix1, iy1, 0);
      addObstacle(ix2, iy1, 1);
      addObstacle(ix1, iy2, 2);
      addObstacle(ix2, iy2, 0);
      break;
    }
    case 'hard_inferno_bastion': {
      [qx1, qx2].forEach((x, idx) => {
        addObstacle(x, qy1, idx % 3);
        addObstacle(x, iy1, (idx + 1) % 3);
        addObstacle(x, midY, (idx + 2) % 3);
        addObstacle(x, iy2, idx % 3);
        addObstacle(x, qy2, (idx + 1) % 3);
      });
      addObstacle(ix1, qy1, 0);
      addObstacle(midX, qy1, 1);
      addObstacle(ix2, qy1, 2);
      addObstacle(ix1, qy2, 2);
      addObstacle(midX, qy2, 1);
      addObstacle(ix2, qy2, 0);
      break;
    }
    case 'hard_dragon_lair': {
      for (let x = qx1; x <= qx2; x += 2) {
        addObstacle(x, qy1, x % 3);
        addObstacle(x, qy2, (x + 1) % 3);
      }
      addObstacle(ix1, iy1, 0);
      addObstacle(ix2, iy1, 1);
      addObstacle(ix1, iy2, 2);
      addObstacle(ix2, iy2, 0);
      addObstacle(qx1, midY - 1, 1);
      addObstacle(qx1, midY + 1, 2);
      addObstacle(qx2, midY - 1, 2);
      addObstacle(qx2, midY + 1, 1);
      break;
    }
    case 'hard_blood_citadel': {
      [
        { cx: qx1, cy: qy1, dx: 1, dy: 1 },
        { cx: qx2, cy: qy1, dx: -1, dy: 1 },
        { cx: qx1, cy: qy2, dx: 1, dy: -1 },
        { cx: qx2, cy: qy2, dx: -1, dy: -1 },
      ].forEach(({ cx, cy, dx, dy }, idx) => {
        addObstacle(cx, cy, idx % 3);
        addObstacle(cx + dx, cy, (idx + 1) % 3);
        addObstacle(cx, cy + dy, (idx + 2) % 3);
        addObstacle(cx + dx, cy + dy, idx % 3);
      });
      addObstacle(midX, qy1, 1);
      addObstacle(midX, qy2, 2);
      addObstacle(qx1, midY, 0);
      addObstacle(qx2, midY, 1);
      break;
    }
    case 'hard_chaos_prism': {
      addObstacle(qx1, qy1, 0);
      addObstacle(ix1, qy1, 1);
      addObstacle(ix2, qy1, 2);
      addObstacle(qx2, qy1, 0);
      addObstacle(qx1, qy2, 2);
      addObstacle(ix1, qy2, 1);
      addObstacle(ix2, qy2, 0);
      addObstacle(qx2, qy2, 2);
      addObstacle(qx1, iy1, 1);
      addObstacle(qx1, iy2, 2);
      addObstacle(qx2, iy1, 2);
      addObstacle(qx2, iy2, 1);
      addObstacle(ix1, iy1, 0);
      addObstacle(ix2, iy1, 1);
      addObstacle(ix1, iy2, 2);
      addObstacle(ix2, iy2, 0);
      break;
    }
    case 'hard_abyss_throne': {
      const c1 = Math.max(3, Math.floor(cols * 0.2));
      const c2 = Math.min(cols - 4, Math.floor(cols * 0.8));
      const r1 = Math.max(3, Math.floor(rows * 0.2));
      const r2 = Math.min(rows - 4, Math.floor(rows * 0.8));
      [
        { cx: c1, cy: r1, dx: 1, dy: 1 },
        { cx: c2, cy: r1, dx: -1, dy: 1 },
        { cx: c1, cy: r2, dx: 1, dy: -1 },
        { cx: c2, cy: r2, dx: -1, dy: -1 },
      ].forEach(({ cx, cy, dx, dy }, idx) => {
        addObstacle(cx, cy, idx % 3);
        addObstacle(cx + dx, cy, (idx + 1) % 3);
        addObstacle(cx, cy + dy, (idx + 2) % 3);
      });
      addObstacle(midX - 1, r1, 0);
      addObstacle(midX + 1, r1, 1);
      addObstacle(midX - 1, r2, 1);
      addObstacle(midX + 1, r2, 0);
      addObstacle(c1, midY - 1, 2);
      addObstacle(c1, midY + 1, 0);
      addObstacle(c2, midY - 1, 0);
      addObstacle(c2, midY + 1, 2);
      addObstacle(ix1, iy1, 1);
      addObstacle(ix2, iy1, 2);
      addObstacle(ix1, iy2, 2);
      addObstacle(ix2, iy2, 1);
      break;
    }
    case 'hard_emperor_omega':
    case 'hard_king_sanctuary':
    default: {
      const c1 = Math.max(3, Math.floor(cols * 0.2));
      const c2 = Math.min(cols - 4, Math.floor(cols * 0.8));
      const r1 = Math.max(3, Math.floor(rows * 0.2));
      const r2 = Math.min(rows - 4, Math.floor(rows * 0.8));

      [
        { cx: c1, cy: r1, dx: 1, dy: 1 },
        { cx: c2, cy: r1, dx: -1, dy: 1 },
        { cx: c1, cy: r2, dx: 1, dy: -1 },
        { cx: c2, cy: r2, dx: -1, dy: -1 },
      ].forEach(({ cx, cy, dx, dy }, idx) => {
        addObstacle(cx, cy, idx % 3);
        addObstacle(cx + dx, cy, (idx + 1) % 3);
        addObstacle(cx, cy + dy, (idx + 2) % 3);
      });

      addObstacle(c1, iy1, 0);
      addObstacle(c1, iy2, 1);
      addObstacle(c2, iy1, 2);
      addObstacle(c2, iy2, 0);

      addObstacle(ix1, r1, 1);
      addObstacle(ix2, r1, 2);
      addObstacle(ix1, r2, 0);
      addObstacle(ix2, r2, 1);

      addObstacle(ix1, iy1, 2);
      addObstacle(ix2, iy1, 0);
      addObstacle(ix1, iy2, 1);
      addObstacle(ix2, iy2, 2);

      addObstacle(midX - 5, midY, 0);
      addObstacle(midX + 5, midY, 1);
      break;
    }
  }

  return obstacles;
}

/**
 * Checks if a position collides with any obstacle.
 */
export function detectObstacleCollision(pos: Position, obstacles: Obstacle[]): boolean {
  for (const obs of obstacles) {
    if (obs.x === pos.x && obs.y === pos.y) {
      return true;
    }
  }
  return false;
}
