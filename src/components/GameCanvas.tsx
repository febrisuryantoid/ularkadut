import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  CustomSkinConfig,
  DifficultyLevel,
  Direction,
  GameEngineState,
  SnakeSkinId,
} from '../game/gameTypes';
import { resolveSkinConfig } from '../game/skinCatalog';

interface GameCanvasProps {
  engineState: GameEngineState;
  snakeSkin?: SnakeSkinId;
  customSkin?: CustomSkinConfig;
  onUpdateGridDimensions: (cols: number, rows: number) => void;
  onDirectionInput?: (dir: Direction) => void;
  children?: React.ReactNode;
}

interface BoardThemePalette {
  outerShadow: string;
  extrusionFaceTop: string;
  extrusionFaceBottom: string;
  frameLight: string;
  frameMid: string;
  frameDark: string;
  frameOuterStroke: string;
  frameInnerStroke: string;
  jointColor: string;
  cornerGemCore: string;
  cornerGemGlow: string;
  tileEvenTop: string;
  tileEvenBottom: string;
  tileOddTop: string;
  tileOddBottom: string;
  tileBevelLight: string;
  tileBevelShadow: string;
  tuftColor: string;
  pillarFrontTop: string;
  pillarFrontBottom: string;
  pillarCapLight: string;
  pillarCapMid: string;
  pillarCapDark: string;
  pillarCrystalCore: string;
  pillarCrystalMid: string;
  pillarCrystalDark: string;
  ambientRayColor: string;
  particleColor: string;
}

const BOARD_THEMES: Record<DifficultyLevel, BoardThemePalette> = {
  easy: {
    outerShadow: 'rgba(8, 24, 12, 0.52)',
    extrusionFaceTop: '#526E4B',
    extrusionFaceBottom: '#2F442B',
    frameLight: '#EBF4E6',
    frameMid: '#C2D6B8',
    frameDark: '#87A37C',
    frameOuterStroke: '#3B5236',
    frameInnerStroke: '#4D6846',
    jointColor: 'rgba(58, 82, 53, 0.45)',
    cornerGemCore: '#6EE7B7',
    cornerGemGlow: 'rgba(16, 185, 129, 0.65)',
    tileEvenTop: '#DFF4CA',
    tileEvenBottom: '#CFE9B4',
    tileOddTop: '#CDE8B2',
    tileOddBottom: '#BDDDA0',
    tileBevelLight: 'rgba(255, 255, 255, 0.45)',
    tileBevelShadow: 'rgba(35, 72, 30, 0.14)',
    tuftColor: '#65A34E',
    pillarFrontTop: '#6E8767',
    pillarFrontBottom: '#465B41',
    pillarCapLight: '#F3F8F0',
    pillarCapMid: '#D0E0C9',
    pillarCapDark: '#9EB596',
    pillarCrystalCore: '#ECFDF5',
    pillarCrystalMid: '#34D399',
    pillarCrystalDark: '#059669',
    ambientRayColor: 'rgba(254, 249, 195, 0.11)',
    particleColor: 'rgba(190, 242, 100, 0.75)',
  },
  medium: {
    outerShadow: 'rgba(38, 18, 6, 0.55)',
    extrusionFaceTop: '#7C4D2B',
    extrusionFaceBottom: '#4A2B15',
    frameLight: '#FDF3E7',
    frameMid: '#E6C79C',
    frameDark: '#B88B58',
    frameOuterStroke: '#5C371B',
    frameInnerStroke: '#784925',
    jointColor: 'rgba(92, 55, 27, 0.45)',
    cornerGemCore: '#FDE047',
    cornerGemGlow: 'rgba(245, 158, 11, 0.7)',
    tileEvenTop: '#F9E8C9',
    tileEvenBottom: '#EED5AC',
    tileOddTop: '#EED6AE',
    tileOddBottom: '#E0C292',
    tileBevelLight: 'rgba(255, 251, 235, 0.5)',
    tileBevelShadow: 'rgba(92, 52, 20, 0.16)',
    tuftColor: '#B47B38',
    pillarFrontTop: '#9A6B43',
    pillarFrontBottom: '#664225',
    pillarCapLight: '#FFF8EB',
    pillarCapMid: '#EBD2B0',
    pillarCapDark: '#C29B6C',
    pillarCrystalCore: '#FFFBEB',
    pillarCrystalMid: '#FBBF24',
    pillarCrystalDark: '#B45309',
    ambientRayColor: 'rgba(254, 215, 170, 0.14)',
    particleColor: 'rgba(253, 224, 71, 0.8)',
  },
  hard: {
    outerShadow: 'rgba(24, 6, 10, 0.65)',
    extrusionFaceTop: '#52252E',
    extrusionFaceBottom: '#2B1016',
    frameLight: '#F5E1E4',
    frameMid: '#C99AA2',
    frameDark: '#8A5660',
    frameOuterStroke: '#451822',
    frameInnerStroke: '#632633',
    jointColor: 'rgba(82, 28, 39, 0.5)',
    cornerGemCore: '#FDA4AF',
    cornerGemGlow: 'rgba(225, 29, 72, 0.75)',
    tileEvenTop: '#EED7DA',
    tileEvenBottom: '#DFC0C5',
    tileOddTop: '#E2C4C9',
    tileOddBottom: '#D1AEB4',
    tileBevelLight: 'rgba(255, 241, 242, 0.42)',
    tileBevelShadow: 'rgba(76, 19, 32, 0.18)',
    tuftColor: '#9F4A58',
    pillarFrontTop: '#7A424D',
    pillarFrontBottom: '#4C212A',
    pillarCapLight: '#FCE7EA',
    pillarCapMid: '#DAB5BC',
    pillarCapDark: '#A87882',
    pillarCrystalCore: '#FFF1F2',
    pillarCrystalMid: '#FB7185',
    pillarCrystalDark: '#BE123C',
    ambientRayColor: 'rgba(254, 205, 211, 0.12)',
    particleColor: 'rgba(251, 113, 133, 0.85)',
  },
};

/**
 * Calculates a proportional, balanced 3D arena grid so the board never looks
 * stretched like a spreadsheet on wide desktops and maintains large, detailed 3D cells.
 */
function calculateDynamicGrid(usableW: number, usableH: number): {
  cols: number;
  rows: number;
  cellSize: number;
} {
  const isLandscape = usableW >= usableH;

  if (isLandscape) {
    // Harmonious ~4:3 arcade cabinet proportion on Desktop & Landscape devices
    const targetCols = usableW >= 900 ? 22 : usableW >= 640 ? 20 : 18;
    const targetRows = usableW >= 900 ? 16 : usableW >= 640 ? 15 : 14;
    const cellSize = Math.max(
      18,
      Math.floor(Math.min(usableW / targetCols, usableH / targetRows))
    );
    return { cols: targetCols, rows: targetRows, cellSize };
  } else {
    // Balanced ~3:4 vertical temple proportion on Portrait devices
    const targetCols = usableW < 360 ? 14 : 15;
    const targetRows = usableH < 520 ? 16 : 18;
    const cellSize = Math.max(
      18,
      Math.floor(Math.min(usableW / targetCols, usableH / targetRows))
    );
    return { cols: targetCols, rows: targetRows, cellSize };
  }
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  engineState,
  snakeSkin = 'classic',
  customSkin,
  onUpdateGridDimensions,
  onDirectionInput,
  children,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const bgCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const [gridMetrics, setGridMetrics] = useState<{
    width: number;
    height: number;
    cols: number;
    rows: number;
    cellSize: number;
    offsetX: number;
    offsetY: number;
  }>({
    width: 720,
    height: 540,
    cols: 22,
    rows: 16,
    cellSize: 30,
    offsetX: 30,
    offsetY: 30,
  });

  const handleResize = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const w = Math.floor(rect.width);
    const h = Math.floor(rect.height);

    if (w <= 0 || h <= 0) return;

    // Reserve space for 3D extruded stone frame + bottom 3D foundation ledge
    const framePaddingX = Math.max(16, Math.min(28, Math.floor(w * 0.03)));
    const framePaddingY = Math.max(18, Math.min(30, Math.floor(h * 0.04)));
    const usableW = Math.max(160, w - framePaddingX * 2);
    const usableH = Math.max(160, h - framePaddingY * 2);

    const { cols, rows, cellSize } = calculateDynamicGrid(usableW, usableH);
    const gridW = cols * cellSize;
    const gridH = rows * cellSize;
    const offsetX = Math.floor((w - gridW) / 2);
    const offsetY = Math.floor((h - gridH) / 2) - 3; // Slight upward offset for 3D bottom extrusion

    setGridMetrics((prev) => {
      if (
        prev.width === w &&
        prev.height === h &&
        prev.cols === cols &&
        prev.rows === rows &&
        prev.cellSize === cellSize
      ) {
        return prev;
      }
      return {
        width: w,
        height: h,
        cols,
        rows,
        cellSize,
        offsetX,
        offsetY,
      };
    });

    onUpdateGridDimensions(cols, rows);
  }, [onUpdateGridDimensions]);

  useEffect(() => {
    handleResize();
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(handleResize);
    observer.observe(container);

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [handleResize]);

  // Touch Swipe Gesture Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartRef.current || !onDirectionInput || e.touches.length !== 1) return;
    const touch = e.touches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    const minSwipeDistance = 24;

    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > minSwipeDistance) {
      onDirectionInput(dx > 0 ? 'RIGHT' : 'LEFT');
      touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    } else if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > minSwipeDistance) {
      onDirectionInput(dy > 0 ? 'DOWN' : 'UP');
      touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current || !onDirectionInput) return;
    const touchEnd = e.changedTouches[0];
    const dx = touchEnd.clientX - touchStartRef.current.x;
    const dy = touchEnd.clientY - touchStartRef.current.y;
    touchStartRef.current = null;

    const minSwipeDistance = 20;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > minSwipeDistance) {
      onDirectionInput(dx > 0 ? 'RIGHT' : 'LEFT');
    } else if (Math.abs(dy) > Math.abs(dy) && Math.abs(dy) > minSwipeDistance) {
      onDirectionInput(dy > 0 ? 'DOWN' : 'UP');
    }
  };

  // Pre-render Realistic 3D Architectural Temple Board whenever gridMetrics or difficulty change
  useEffect(() => {
    const { width, height, cols, rows, cellSize, offsetX, offsetY } = gridMetrics;
    const dpr = Math.min(Math.max(window.devicePixelRatio || 1, 2), 3);
    const theme = BOARD_THEMES[engineState.difficulty] || BOARD_THEMES.easy;

    const mainCanvas = canvasRef.current;
    if (mainCanvas) {
      const targetW = Math.round(width * dpr);
      const targetH = Math.round(height * dpr);
      if (mainCanvas.width !== targetW || mainCanvas.height !== targetH) {
        mainCanvas.width = targetW;
        mainCanvas.height = targetH;
      }
    }

    if (!bgCanvasRef.current && typeof document !== 'undefined') {
      bgCanvasRef.current = document.createElement('canvas');
    }
    const bgCanvas = bgCanvasRef.current;
    if (!bgCanvas) return;

    bgCanvas.width = Math.round(width * dpr);
    bgCanvas.height = Math.round(height * dpr);
    const ctx = bgCanvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.scale(dpr, dpr);

    const arenaX = offsetX;
    const arenaY = offsetY;
    const arenaW = cols * cellSize;
    const arenaH = rows * cellSize;
    const frameW = 14;
    const extrusionDepth = 10;

    // 1. Deep 3D Ground Ambient Shadow + Physical 3D Extruded Stone Foundation Wall
    ctx.save();
    ctx.shadowColor = theme.outerShadow;
    ctx.shadowBlur = 28;
    ctx.shadowOffsetY = 14;

    const extGrad = ctx.createLinearGradient(
      arenaX,
      arenaY + arenaH,
      arenaX,
      arenaY + arenaH + frameW + extrusionDepth
    );
    extGrad.addColorStop(0, theme.extrusionFaceTop);
    extGrad.addColorStop(1, theme.extrusionFaceBottom);
    ctx.fillStyle = extGrad;
    ctx.beginPath();
    ctx.roundRect(
      arenaX - frameW,
      arenaY - frameW + extrusionDepth,
      arenaW + frameW * 2,
      arenaH + frameW * 2,
      18
    );
    ctx.fill();
    ctx.restore();

    // 2. Sculpted 3D Temple Perimeter Frame (Multi-Beveled Architectural Stone)
    ctx.save();
    const frameGrad = ctx.createLinearGradient(
      arenaX - frameW,
      arenaY - frameW,
      arenaX + arenaW + frameW,
      arenaY + arenaH + frameW
    );
    frameGrad.addColorStop(0, theme.frameLight);
    frameGrad.addColorStop(0.48, theme.frameMid);
    frameGrad.addColorStop(1, theme.frameDark);

    ctx.fillStyle = frameGrad;
    ctx.beginPath();
    ctx.roundRect(
      arenaX - frameW,
      arenaY - frameW,
      arenaW + frameW * 2,
      arenaH + frameW * 2,
      16
    );
    ctx.fill();

    // 3D Chiseled Stone Block Seams along the Perimeter Wall
    ctx.strokeStyle = theme.jointColor;
    ctx.lineWidth = 1.5;
    const brickSpacing = Math.max(36, cellSize * 1.5);
    for (let bx = arenaX + cellSize; bx < arenaX + arenaW; bx += brickSpacing) {
      ctx.beginPath();
      ctx.moveTo(bx, arenaY - frameW);
      ctx.lineTo(bx, arenaY);
      ctx.moveTo(bx, arenaY + arenaH);
      ctx.lineTo(bx, arenaY + arenaH + frameW);
      ctx.stroke();
    }
    for (let by = arenaY + cellSize; by < arenaY + arenaH; by += brickSpacing) {
      ctx.beginPath();
      ctx.moveTo(arenaX - frameW, by);
      ctx.lineTo(arenaX, by);
      ctx.moveTo(arenaX + arenaW, by);
      ctx.lineTo(arenaX + arenaW + frameW, by);
      ctx.stroke();
    }

    // Top-Left 3D Sunlight Specular Ridge on Frame
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.82)';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.roundRect(
      arenaX - frameW + 1.5,
      arenaY - frameW + 1.5,
      arenaW + frameW * 2 - 3,
      arenaH + frameW * 2 - 3,
      15
    );
    ctx.stroke();

    // Outer & Inner Chiseled Rim Borders
    ctx.strokeStyle = theme.frameOuterStroke;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.roundRect(
      arenaX - frameW,
      arenaY - frameW,
      arenaW + frameW * 2,
      arenaH + frameW * 2,
      16
    );
    ctx.stroke();

    ctx.strokeStyle = theme.frameInnerStroke;
    ctx.lineWidth = 2.5;
    ctx.strokeRect(arenaX, arenaY, arenaW, arenaH);
    ctx.restore();

    // 3. 3D Recessed Playfield Tiles with Micro-Bevels & Tactile Relief
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const isEven = (r + c) % 2 === 0;
        const tx = offsetX + c * cellSize;
        const ty = offsetY + r * cellSize;

        const tileGrad = ctx.createLinearGradient(tx, ty, tx + cellSize, ty + cellSize);
        if (isEven) {
          tileGrad.addColorStop(0, theme.tileEvenTop);
          tileGrad.addColorStop(1, theme.tileEvenBottom);
        } else {
          tileGrad.addColorStop(0, theme.tileOddTop);
          tileGrad.addColorStop(1, theme.tileOddBottom);
        }
        ctx.fillStyle = tileGrad;
        ctx.fillRect(tx, ty, cellSize, cellSize);

        // 3D Top-Left Highlight Bevel
        ctx.strokeStyle = theme.tileBevelLight;
        ctx.lineWidth = 0.85;
        ctx.beginPath();
        ctx.moveTo(tx + 0.5, ty + cellSize - 0.5);
        ctx.lineTo(tx + 0.5, ty + 0.5);
        ctx.lineTo(tx + cellSize - 0.5, ty + 0.5);
        ctx.stroke();

        // 3D Bottom-Right Recessed Joint Shadow
        ctx.strokeStyle = theme.tileBevelShadow;
        ctx.lineWidth = 0.85;
        ctx.beginPath();
        ctx.moveTo(tx + cellSize - 0.5, ty + 0.5);
        ctx.lineTo(tx + cellSize - 0.5, ty + cellSize - 0.5);
        ctx.lineTo(tx + 0.5, ty + cellSize - 0.5);
        ctx.stroke();

        // Subtle 3D Botanical / Stone Surface Detail
        if ((r * 7 + c * 13) % 19 === 0 && r > 1 && r < rows - 2 && c > 1 && c < cols - 2) {
          const gx = tx + cellSize * 0.5;
          const gy = ty + cellSize * 0.68;

          // Tiny ground shadow under grass tuft
          ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
          ctx.beginPath();
          ctx.ellipse(gx, gy + 2, 5, 1.8, 0, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = theme.tuftColor;
          ctx.lineWidth = 1.5;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(gx - 3, gy + 1.5);
          ctx.quadraticCurveTo(gx - 5, gy - 2.5, gx - 6, gy - 5);
          ctx.moveTo(gx, gy + 1.5);
          ctx.quadraticCurveTo(gx, gy - 3.5, gx + 0.8, gy - 6.5);
          ctx.moveTo(gx + 3, gy + 1.5);
          ctx.quadraticCurveTo(gx + 5, gy - 2.5, gx + 6, gy - 5);
          ctx.stroke();
        }
      }
    }

    // 4. Deep 3D Recessed Wall Cast Shadows onto Playfield (Directional Sun from Top-Left)
    ctx.save();
    const topWallShadow = ctx.createLinearGradient(arenaX, arenaY, arenaX, arenaY + cellSize * 0.65);
    topWallShadow.addColorStop(0, 'rgba(12, 28, 14, 0.34)');
    topWallShadow.addColorStop(0.5, 'rgba(12, 28, 14, 0.12)');
    topWallShadow.addColorStop(1, 'rgba(12, 28, 14, 0)');
    ctx.fillStyle = topWallShadow;
    ctx.fillRect(arenaX, arenaY, arenaW, cellSize * 0.65);

    const leftWallShadow = ctx.createLinearGradient(arenaX, arenaY, arenaX + cellSize * 0.55, arenaY);
    leftWallShadow.addColorStop(0, 'rgba(12, 28, 14, 0.26)');
    leftWallShadow.addColorStop(0.5, 'rgba(12, 28, 14, 0.08)');
    leftWallShadow.addColorStop(1, 'rgba(12, 28, 14, 0)');
    ctx.fillStyle = leftWallShadow;
    ctx.fillRect(arenaX, arenaY, cellSize * 0.55, arenaH);
    ctx.restore();

    // 5. Four 3D Sculpted Corner Pedestals with Glowing Energy Gems
    const cornerSize = Math.min(cellSize * 1.45, 44);
    const drawCornerPedestal = (cx: number, cy: number) => {
      ctx.save();
      // Drop shadow
      ctx.fillStyle = 'rgba(10, 22, 12, 0.32)';
      ctx.beginPath();
      ctx.roundRect(cx + 2, cy + 3.5, cornerSize, cornerSize, 8);
      ctx.fill();

      // 3D Stepped Pedestal Base
      const pedGrad = ctx.createLinearGradient(cx, cy, cx + cornerSize, cy + cornerSize);
      pedGrad.addColorStop(0, theme.frameLight);
      pedGrad.addColorStop(0.5, theme.frameMid);
      pedGrad.addColorStop(1, theme.frameDark);
      ctx.fillStyle = pedGrad;
      ctx.strokeStyle = theme.frameOuterStroke;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.roundRect(cx, cy, cornerSize, cornerSize, 8);
      ctx.fill();
      ctx.stroke();

      // Inner Recessed Socket
      const midX = cx + cornerSize / 2;
      const midY = cy + cornerSize / 2;
      ctx.fillStyle = 'rgba(15, 28, 16, 0.25)';
      ctx.beginPath();
      ctx.arc(midX, midY, cornerSize * 0.28, 0, Math.PI * 2);
      ctx.fill();

      // Glowing 3D Orb inside Socket
      const gemR = cornerSize * 0.22;
      const gemGrad = ctx.createRadialGradient(
        midX - gemR * 0.3,
        midY - gemR * 0.3,
        1,
        midX,
        midY,
        gemR * 1.3
      );
      gemGrad.addColorStop(0, '#FFFFFF');
      gemGrad.addColorStop(0.45, theme.cornerGemCore);
      gemGrad.addColorStop(1, theme.frameOuterStroke);
      ctx.shadowColor = theme.cornerGemGlow;
      ctx.shadowBlur = 10;
      ctx.fillStyle = gemGrad;
      ctx.beginPath();
      ctx.arc(midX, midY, gemR, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    drawCornerPedestal(arenaX - 6, arenaY - 6);
    drawCornerPedestal(arenaX + arenaW - cornerSize + 6, arenaY - 6);
    drawCornerPedestal(arenaX - 6, arenaY + arenaH - cornerSize + 6);
    drawCornerPedestal(arenaX + arenaW - cornerSize + 6, arenaY + arenaH - cornerSize + 6);

    ctx.restore();
  }, [gridMetrics, engineState.difficulty]);

  // 60FPS Real-time 3D Volumetric Entities & Atmospheric Lighting Loop
  useEffect(() => {
    let rafId = 0;

    const renderFrame = (timeMs: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const { cols, rows, cellSize, offsetX, offsetY } = gridMetrics;
      const dpr = Math.min(Math.max(window.devicePixelRatio || 1, 2), 3);
      const skin = resolveSkinConfig(snakeSkin, customSkin);
      const theme = BOARD_THEMES[engineState.difficulty] || BOARD_THEMES.easy;
      const rainbowPalette = ['#F43F5E', '#F59E0B', '#10B981', '#06B6D4', '#6366F1', '#D946EF'];

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Blit pre-rendered 3D temple board
      if (bgCanvasRef.current && bgCanvasRef.current.width > 0 && bgCanvasRef.current.height > 0) {
        ctx.drawImage(bgCanvasRef.current, 0, 0);
      }

      ctx.scale(dpr, dpr);

      const arenaW = cols * cellSize;
      const arenaH = rows * cellSize;

      // A. Volumetric 3D Sunbeams / Light Shafts across the Arena
      ctx.save();
      ctx.beginPath();
      ctx.rect(offsetX, offsetY, arenaW, arenaH);
      ctx.clip();

      const rayShift = Math.sin(timeMs / 2800) * 24;
      const rayGrad = ctx.createLinearGradient(
        offsetX + rayShift,
        offsetY,
        offsetX + arenaW * 0.65 + rayShift,
        offsetY + arenaH
      );
      rayGrad.addColorStop(0, theme.ambientRayColor);
      rayGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0)');
      rayGrad.addColorStop(1, theme.ambientRayColor);
      ctx.fillStyle = rayGrad;
      ctx.fillRect(offsetX, offsetY, arenaW, arenaH);
      ctx.restore();

      // B. Render Realistic 3D Architectural Pillars (Obstacles) with Levitating 3D Crystal
      const obstacles = engineState.obstacles || [];
      obstacles.forEach((obs) => {
        if (obs.x >= cols || obs.y >= rows) return;

        const ox = offsetX + obs.x * cellSize;
        const oy = offsetY + obs.y * cellSize;
        const pad = 1.5;
        const bw = cellSize - pad * 2;
        const bh = cellSize - pad * 2;
        const frontDepthH = Math.max(6, bh * 0.28);
        const capH = bh - frontDepthH;

        ctx.save();

        // 1. Directional 3D Floor Shadow cast to bottom-right
        ctx.fillStyle = 'rgba(10, 22, 12, 0.42)';
        ctx.beginPath();
        ctx.roundRect(ox + pad + 3.5, oy + pad + 5.5, bw, bh, 7);
        ctx.fill();

        // 2. 3D Extruded Vertical Stone Shaft (Front Face)
        const shaftGrad = ctx.createLinearGradient(ox, oy + capH, ox, oy + bh);
        shaftGrad.addColorStop(0, theme.pillarFrontTop);
        shaftGrad.addColorStop(1, theme.pillarFrontBottom);
        ctx.fillStyle = shaftGrad;
        ctx.beginPath();
        ctx.roundRect(ox + pad, oy + pad + 2, bw, bh - 2, 6.5);
        ctx.fill();

        // Vertical Fluted Pillar Grooves on Front Shaft
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
        ctx.lineWidth = 1.2;
        [0.28, 0.5, 0.72].forEach((pos) => {
          ctx.beginPath();
          ctx.moveTo(ox + pad + bw * pos, oy + pad + capH);
          ctx.lineTo(ox + pad + bw * pos, oy + pad + bh - 2);
          ctx.stroke();
        });

        // 3. Elevated 3D Beveled Capital (Top Face of Pillar)
        const capGrad = ctx.createLinearGradient(ox, oy + pad - 2, ox + bw, oy + pad + capH);
        capGrad.addColorStop(0, theme.pillarCapLight);
        capGrad.addColorStop(0.55, theme.pillarCapMid);
        capGrad.addColorStop(1, theme.pillarCapDark);

        ctx.fillStyle = capGrad;
        ctx.beginPath();
        ctx.roundRect(ox + pad, oy + pad - 2, bw, capH + 3, 6.5);
        ctx.fill();

        // Top-Left 3D Specular Rim on Pillar Cap
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.88)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(ox + pad + 4, oy + pad - 0.5);
        ctx.lineTo(ox + pad + bw - 4, oy + pad - 0.5);
        ctx.stroke();

        // Crisp 3D Pillar Contour Outline
        ctx.strokeStyle = theme.frameOuterStroke;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(ox + pad, oy + pad - 2, bw, bh + 2, 6.5);
        ctx.stroke();

        // 4. Levitating 3D Faceted Crystal Prism above Pillar
        const hoverBob = Math.sin(timeMs / 240 + obs.x * 1.7 + obs.y) * 2.2;
        const cx = ox + pad + bw / 2;
        const cy = oy + pad + capH * 0.48 + hoverBob;
        const runeR = bw * 0.26;

        // Crystal Shadow on Pillar Cap
        ctx.fillStyle = 'rgba(0, 0, 0, 0.24)';
        ctx.beginPath();
        ctx.ellipse(cx, oy + pad + capH * 0.62, runeR * 0.75, runeR * 0.35, 0, 0, Math.PI * 2);
        ctx.fill();

        // 3D Crystal Faceted Body
        const crystalGrad = ctx.createRadialGradient(
          cx - runeR * 0.3,
          cy - runeR * 0.3,
          0.5,
          cx,
          cy,
          runeR * 1.15
        );
        crystalGrad.addColorStop(0, theme.pillarCrystalCore);
        crystalGrad.addColorStop(0.45, theme.pillarCrystalMid);
        crystalGrad.addColorStop(1, theme.pillarCrystalDark);

        ctx.shadowColor = theme.cornerGemGlow;
        ctx.shadowBlur = 8;
        ctx.fillStyle = crystalGrad;
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 0.9;

        ctx.beginPath();
        ctx.moveTo(cx, cy - runeR);
        ctx.lineTo(cx + runeR * 0.82, cy);
        ctx.lineTo(cx, cy + runeR);
        ctx.lineTo(cx - runeR * 0.82, cy);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Inner 3D Facet Ridge Lines
        ctx.shadowBlur = 0;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(cx, cy - runeR);
        ctx.lineTo(cx, cy + runeR);
        ctx.moveTo(cx - runeR * 0.82, cy);
        ctx.lineTo(cx + runeR * 0.82, cy);
        ctx.stroke();

        ctx.restore();
      });

      // C. Draw 3D Volumetric Ray-Traced Style Fruits
      const fruit = engineState.fruit;
      if (fruit && fruit.x < cols && fruit.y < rows) {
        const fX = offsetX + fruit.x * cellSize + cellSize / 2;
        const bobOffset = Math.sin(timeMs / 220) * 2.2;
        const fY = offsetY + fruit.y * cellSize + cellSize / 2 - 1.5 + bobOffset;
        const scale = fruit.sizeScale || 1.0;
        const radius = cellSize * 0.45 * Math.min(scale, 1.48);

        ctx.save();

        // 1. Subsurface Bounce-Light Halo on the Ground Tile
        const pulseRate = fruit.type === 'mega' ? 180 : fruit.type === 'golden' ? 200 : 260;
        const auraPulse = 1 + Math.sin(timeMs / pulseRate) * 0.14;
        const haloColorInner =
          fruit.type === 'mega'
            ? 'rgba(74, 222, 128, 0.5)'
            : fruit.type === 'golden'
              ? 'rgba(253, 224, 71, 0.6)'
              : 'rgba(248, 113, 113, 0.45)';

        const aura = ctx.createRadialGradient(
          fX,
          fY,
          radius * 0.25,
          fX,
          fY,
          radius * 1.85 * auraPulse
        );
        aura.addColorStop(0, haloColorInner);
        aura.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = aura;
        ctx.beginPath();
        ctx.arc(fX, fY, radius * 1.85 * auraPulse, 0, Math.PI * 2);
        ctx.fill();

        // 2. Realistic 3D Ground Contact Shadow (scales inversely with height)
        const shadowScale = 1 - bobOffset * 0.05;
        ctx.fillStyle = 'rgba(10, 24, 12, 0.36)';
        ctx.beginPath();
        ctx.ellipse(
          fX + 1.5,
          offsetY + fruit.y * cellSize + cellSize / 2 + radius * 0.85,
          radius * 0.92 * shadowScale,
          radius * 0.38 * shadowScale,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();

        // 3. 3D Volumetric Fruit Sphere
        if (fruit.type === 'mega') {
          const melonGrad = ctx.createRadialGradient(
            fX - radius * 0.35,
            fY - radius * 0.35,
            radius * 0.06,
            fX + radius * 0.1,
            fY + radius * 0.1,
            radius * 1.05
          );
          melonGrad.addColorStop(0, '#DCFCE7');
          melonGrad.addColorStop(0.25, '#4ADE80');
          melonGrad.addColorStop(0.68, '#15803D');
          melonGrad.addColorStop(0.92, '#064E3B');
          melonGrad.addColorStop(1, '#022C22');

          ctx.fillStyle = melonGrad;
          ctx.beginPath();
          ctx.arc(fX, fY, radius, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = 'rgba(2, 44, 34, 0.72)';
          ctx.lineWidth = 2.2;
          [-0.46, 0, 0.46].forEach((stripOffset) => {
            ctx.beginPath();
            ctx.ellipse(
              fX + stripOffset * radius * 0.68,
              fY,
              radius * 0.2,
              radius * 0.86,
              0.12,
              0,
              Math.PI * 2
            );
            ctx.stroke();
          });
        } else if (fruit.type === 'golden') {
          const goldGrad = ctx.createRadialGradient(
            fX - radius * 0.35,
            fY - radius * 0.35,
            radius * 0.06,
            fX + radius * 0.1,
            fY + radius * 0.1,
            radius * 1.05
          );
          goldGrad.addColorStop(0, '#FFFFFF');
          goldGrad.addColorStop(0.22, '#FEF08A');
          goldGrad.addColorStop(0.58, '#F59E0B');
          goldGrad.addColorStop(0.86, '#B45309');
          goldGrad.addColorStop(1, '#451A03');

          ctx.fillStyle = goldGrad;
          ctx.beginPath();
          ctx.arc(fX, fY, radius, 0, Math.PI * 2);
          ctx.fill();
        } else {
          const appleGrad = ctx.createRadialGradient(
            fX - radius * 0.35,
            fY - radius * 0.35,
            radius * 0.06,
            fX + radius * 0.1,
            fY + radius * 0.1,
            radius * 1.05
          );
          appleGrad.addColorStop(0, '#FFE4E6');
          appleGrad.addColorStop(0.24, '#FB7185');
          appleGrad.addColorStop(0.62, '#E11D48');
          appleGrad.addColorStop(0.88, '#9F1239');
          appleGrad.addColorStop(1, '#4C0519');

          ctx.fillStyle = appleGrad;
          ctx.beginPath();
          ctx.arc(fX, fY, radius, 0, Math.PI * 2);
          ctx.fill();
        }

        // Crisp 3D Rim Light along Bottom-Right Edge
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.38)';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(fX, fY, radius * 0.88, Math.PI * 0.15, Math.PI * 0.75);
        ctx.stroke();

        // 4. 3D Recessed Stem Cavity + Woody Stem & Sculpted Leaf
        ctx.fillStyle = 'rgba(20, 5, 5, 0.52)';
        ctx.beginPath();
        ctx.ellipse(fX, fY - radius * 0.72, radius * 0.28, radius * 0.12, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#5C2B10';
        ctx.lineWidth = 2.6;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(fX, fY - radius * 0.72);
        ctx.quadraticCurveTo(fX + 2.5, fY - radius * 1.2, fX + 5, fY - radius * 1.34);
        ctx.stroke();

        const leafGrad = ctx.createLinearGradient(
          fX + 2,
          fY - radius * 1.15,
          fX + 12,
          fY - radius * 0.8
        );
        leafGrad.addColorStop(0, '#A7F3D0');
        leafGrad.addColorStop(0.5, '#22C55E');
        leafGrad.addColorStop(1, '#14532D');
        ctx.fillStyle = leafGrad;
        ctx.strokeStyle = '#052E16';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(
          fX + radius * 0.44,
          fY - radius * 0.96,
          radius * 0.42,
          radius * 0.2,
          -Math.PI / 5,
          0,
          Math.PI * 2
        );
        ctx.fill();
        ctx.stroke();

        // 5. Realistic Dual Fresnel Specular Gloss Reflections
        ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
        ctx.beginPath();
        ctx.ellipse(
          fX - radius * 0.34,
          fY - radius * 0.34,
          radius * 0.3,
          radius * 0.15,
          -Math.PI / 4,
          0,
          Math.PI * 2
        );
        ctx.fill();

        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.beginPath();
        ctx.arc(fX - radius * 0.52, fY - radius * 0.06, radius * 0.09, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      // D. Render Severed Cut Segments (when snake bites its own body)
      if (engineState.cutSegments && engineState.cutSegments.length > 0) {
        engineState.cutSegments.forEach((seg) => {
          const sx = offsetX + seg.x * cellSize + cellSize / 2;
          const sy = offsetY + seg.y * cellSize + cellSize / 2;
          ctx.save();
          ctx.globalAlpha = 0.7;
          const cutGrad = ctx.createRadialGradient(
            sx - 3,
            sy - 3,
            1,
            sx,
            sy,
            cellSize * 0.38
          );
          cutGrad.addColorStop(0, '#FCA5A5');
          cutGrad.addColorStop(0.6, '#EF4444');
          cutGrad.addColorStop(1, '#7F1D1D');
          ctx.fillStyle = cutGrad;
          ctx.beginPath();
          ctx.arc(sx, sy, cellSize * 0.36, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });
      }

      // E. Draw Realistic 3D Anatomical Snake with 3D Scale Relief & Tier VFX
      const snake = engineState.snake;
      if (snake.length > 0) {
        const head = snake[0];
        const isNearFruit =
          fruit &&
          Math.abs(head.x - fruit.x) <= 2 &&
          Math.abs(head.y - fruit.y) <= 2;

        // Subtle breathing micro-motion when in menu/paused so the 3D snake looks alive
        const idleBreath =
          engineState.state !== 'playing' ? Math.sin(timeMs / 420) * 1.2 : 0;

        // 1. Dynamic Particle Trail for Higher Tier Skins
        const vfx = skin.tierVFX;
        if (vfx && vfx.particleType !== 'none') {
          const trailCount = Math.min(snake.length, vfx.trailLength + 2);
          for (let p = 0; p < trailCount; p++) {
            const seg = snake[p];
            const sX = offsetX + seg.x * cellSize + cellSize / 2;
            const sY = offsetY + seg.y * cellSize + cellSize / 2;
            const pAngle = timeMs / 250 + p * 1.35;
            const pDist = cellSize * (0.4 + Math.sin(timeMs / 160 + p) * 0.15);
            const px = sX + Math.cos(pAngle) * pDist;
            const py = sY + Math.sin(pAngle) * pDist;

            ctx.save();
            if (vfx.particleType === 'stardust') {
              const starR = 3.0 + Math.sin(timeMs / 120 + p) * 1.2;
              ctx.fillStyle = skin.sparkleColor || '#FDE047';
              ctx.shadowColor = skin.glowColor;
              ctx.shadowBlur = 10;
              ctx.beginPath();
              ctx.moveTo(px, py - starR);
              ctx.quadraticCurveTo(px, py, px + starR, py);
              ctx.quadraticCurveTo(px, py, px, py + starR);
              ctx.quadraticCurveTo(px, py, px - starR, py);
              ctx.quadraticCurveTo(px, py, px, py - starR);
              ctx.fill();
            } else if (vfx.particleType === 'ember') {
              const emberR = 2.4 + Math.sin(timeMs / 100 + p) * 1.0;
              ctx.fillStyle = p % 2 === 0 ? '#F59E0B' : '#EF4444';
              ctx.shadowColor = 'rgba(239, 68, 68, 0.85)';
              ctx.shadowBlur = 7;
              ctx.beginPath();
              ctx.arc(px, py - Math.sin(timeMs / 160 + p) * 3, emberR, 0, Math.PI * 2);
              ctx.fill();
            } else if (vfx.particleType === 'neon') {
              ctx.fillStyle = skin.sparkleColor || '#38BDF8';
              ctx.shadowColor = skin.glowColor;
              ctx.shadowBlur = 8;
              ctx.fillRect(px - 1.8, py - 1.8, 3.6, 3.6);
            } else {
              const spR = 2.2 + Math.sin(timeMs / 140 + p) * 0.8;
              ctx.fillStyle = skin.sparkleColor || '#FFFBEB';
              ctx.shadowColor = skin.glowColor;
              ctx.shadowBlur = 6;
              ctx.beginPath();
              ctx.arc(px, py, spR, 0, Math.PI * 2);
              ctx.fill();
            }
            ctx.restore();
          }
        }

        // 2. Draw 3D Cylindrical Body Segments (from tail tip to neck for natural 3D Z-depth overlap)
        for (let i = snake.length - 1; i >= 1; i--) {
          const seg = snake[i];
          const prevSeg = snake[i - 1];
          const segWave =
            engineState.state !== 'playing'
              ? Math.sin(timeMs / 350 + i * 0.7) * 1.1
              : 0;
          const sX = offsetX + seg.x * cellSize + cellSize / 2 + segWave;
          const sY = offsetY + seg.y * cellSize + cellSize / 2 + idleBreath * 0.4;

          const progress = i / snake.length;
          const taperFactor =
            i === snake.length - 1 ? 0.66 : i === snake.length - 2 ? 0.82 : 1 - progress * 0.15;
          const segmentRadius = cellSize * 0.48 * taperFactor;

          const isAlt = i % 2 === 1;
          let segPrimary = isAlt ? skin.bodySecondary : skin.bodyPrimary;
          if (skin.pattern === 'rainbow') {
            const cIdx = (i + Math.floor(timeMs / 160)) % rainbowPalette.length;
            segPrimary = rainbowPalette[cIdx];
          }

          ctx.save();

          // A. 3D Ground Cast Shadow & Aura Glow
          if (vfx && vfx.auraIntensity > 0.4) {
            ctx.shadowColor = skin.glowColor;
            ctx.shadowBlur = Math.min(20, 9 + Math.sin(timeMs / 180 + i) * 6 * vfx.auraIntensity);
          }

          ctx.fillStyle = 'rgba(10, 24, 12, 0.34)';
          ctx.beginPath();
          ctx.ellipse(
            sX + 2.2,
            sY + segmentRadius * 0.42 + 3.2,
            segmentRadius * 0.98,
            segmentRadius * 0.76,
            0,
            0,
            Math.PI * 2
          );
          ctx.fill();

          // B. Seamless 3D Intermediate Cylinder Joint between adjacent segments
          if (prevSeg && Math.abs(prevSeg.x - seg.x) + Math.abs(prevSeg.y - seg.y) === 1) {
            const midX = sX + (prevSeg.x - seg.x) * cellSize * 0.48;
            const midY = sY + (prevSeg.y - seg.y) * cellSize * 0.48;
            const connR = segmentRadius * 0.95;
            const connGrad = ctx.createRadialGradient(
              midX - connR * 0.32,
              midY - connR * 0.34,
              connR * 0.06,
              midX + connR * 0.1,
              midY + connR * 0.1,
              connR * 1.05
            );
            connGrad.addColorStop(0, skin.bellyColor);
            connGrad.addColorStop(0.42, segPrimary);
            connGrad.addColorStop(0.88, skin.headColor);
            connGrad.addColorStop(1, 'rgba(0,0,0,0.45)');
            ctx.fillStyle = connGrad;
            ctx.beginPath();
            ctx.arc(midX, midY, connR, 0, Math.PI * 2);
            ctx.fill();
          }

          // C. Main 3D Volumetric Spherical Segment
          const segGrad = ctx.createRadialGradient(
            sX - segmentRadius * 0.34,
            sY - segmentRadius * 0.36,
            segmentRadius * 0.06,
            sX + segmentRadius * 0.08,
            sY + segmentRadius * 0.1,
            segmentRadius * 1.04
          );
          segGrad.addColorStop(0, skin.bellyColor);
          segGrad.addColorStop(0.42, segPrimary);
          segGrad.addColorStop(0.86, skin.headColor);
          segGrad.addColorStop(1, 'rgba(0,0,0,0.48)');

          ctx.fillStyle = segGrad;
          ctx.beginPath();
          ctx.arc(sX, sY, segmentRadius, 0, Math.PI * 2);
          ctx.fill();

          // D. Realistic 3D Reptile Scale Relief & Skin Dorsal Markings
          ctx.save();
          ctx.beginPath();
          ctx.arc(sX, sY, segmentRadius * 0.94, 0, Math.PI * 2);
          ctx.clip();

          // 3D Overlapping Diamond Reptile Scale Mesh
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.18)';
          ctx.lineWidth = 0.9;
          const scR = segmentRadius * 0.42;
          [-0.32, 0.28].forEach((oxFactor) => {
            [-0.25, 0.28].forEach((oyFactor) => {
              const scX = sX + segmentRadius * oxFactor;
              const scY = sY + segmentRadius * oyFactor;
              ctx.beginPath();
              ctx.arc(scX, scY, scR, -Math.PI * 0.25, Math.PI * 0.75);
              ctx.stroke();
            });
          });

          if (skin.pattern === 'cyber') {
            ctx.strokeStyle = skin.bellyColor;
            ctx.lineWidth = Math.max(1.5, segmentRadius * 0.17);
            ctx.beginPath();
            ctx.arc(sX, sY, segmentRadius * 0.56, 0, Math.PI * 1.35);
            ctx.stroke();
          } else if (skin.pattern === 'stripes') {
            ctx.fillStyle = skin.bellyColor;
            ctx.globalAlpha = 0.72;
            ctx.beginPath();
            ctx.ellipse(
              sX,
              sY - segmentRadius * 0.1,
              segmentRadius * 0.72,
              segmentRadius * 0.22,
              0,
              0,
              Math.PI * 2
            );
            ctx.fill();
          } else if (skin.pattern === 'metallic' || skin.pattern === 'cosmic') {
            ctx.fillStyle = skin.bellyColor;
            ctx.globalAlpha = 0.85;
            ctx.beginPath();
            ctx.ellipse(
              sX,
              sY + segmentRadius * 0.32,
              segmentRadius * 0.52,
              segmentRadius * 0.24,
              0,
              0,
              Math.PI * 2
            );
            ctx.fill();

            if (i % 2 === 1) {
              ctx.fillStyle = skin.sparkleColor || '#FFFBEB';
              ctx.globalAlpha = 0.92;
              ctx.beginPath();
              ctx.arc(sX, sY - segmentRadius * 0.15, segmentRadius * 0.22, 0, Math.PI * 2);
              ctx.fill();
            }
          } else if (skin.pattern === 'spots') {
            ctx.fillStyle = skin.headColor;
            ctx.globalAlpha = 0.55;
            ctx.beginPath();
            ctx.arc(
              sX - segmentRadius * 0.22,
              sY - segmentRadius * 0.05,
              segmentRadius * 0.24,
              0,
              Math.PI * 2
            );
            ctx.arc(
              sX + segmentRadius * 0.28,
              sY + segmentRadius * 0.18,
              segmentRadius * 0.18,
              0,
              Math.PI * 2
            );
            ctx.fill();
          }
          ctx.restore();

          // E. 3D Rim Light & Traveling Specular Shimmer Wave
          const shimmerWave = 0.58 + Math.max(0, Math.sin(timeMs / 160 - i * 0.48)) * 0.38;
          ctx.fillStyle = `rgba(255, 255, 255, ${shimmerWave.toFixed(2)})`;
          ctx.beginPath();
          ctx.ellipse(
            sX - segmentRadius * 0.28,
            sY - segmentRadius * 0.34,
            segmentRadius * 0.3,
            segmentRadius * 0.14,
            -Math.PI / 5,
            0,
            Math.PI * 2
          );
          ctx.fill();

          // Subtle 3D Bottom Rim Bounce Reflection
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
          ctx.lineWidth = 1.1;
          ctx.beginPath();
          ctx.arc(sX, sY, segmentRadius * 0.88, Math.PI * 0.2, Math.PI * 0.75);
          ctx.stroke();

          // F. 3D Tail Artifact (Star / Flame / Crystal Blade) on the final tail segment
          if (i === snake.length - 1 && skin.tail && skin.tail !== 'normal' && prevSeg) {
            const tailAngle = Math.atan2(seg.y - prevSeg.y, seg.x - prevSeg.x);
            const tipDist = segmentRadius * 1.15;
            const tipX = sX + Math.cos(tailAngle) * tipDist;
            const tipY = sY + Math.sin(tailAngle) * tipDist;

            ctx.save();
            ctx.translate(tipX, tipY);
            ctx.rotate(tailAngle);

            if (skin.tail === 'star') {
              ctx.rotate(timeMs / 260);
              const starR = cellSize * 0.34;
              ctx.shadowColor = '#FACC15';
              ctx.shadowBlur = 10;
              ctx.fillStyle = '#FEF08A';
              ctx.strokeStyle = '#D97706';
              ctx.lineWidth = 1.2;
              ctx.beginPath();
              for (let pt = 0; pt < 8; pt++) {
                const r = pt % 2 === 0 ? starR : starR * 0.42;
                const a = (pt * Math.PI) / 4;
                if (pt === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
                else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
              }
              ctx.closePath();
              ctx.fill();
              ctx.stroke();
            } else if (skin.tail === 'flame') {
              const flicker = 1 + Math.sin(timeMs / 80) * 0.18;
              const flR = cellSize * 0.36 * flicker;
              const flGrad = ctx.createRadialGradient(0, 0, 1, 0, 0, flR);
              flGrad.addColorStop(0, '#FEF08A');
              flGrad.addColorStop(0.5, '#F97316');
              flGrad.addColorStop(1, '#DC2626');
              ctx.shadowColor = 'rgba(239, 68, 68, 0.9)';
              ctx.shadowBlur = 12;
              ctx.fillStyle = flGrad;
              ctx.beginPath();
              ctx.moveTo(-flR * 0.4, -flR * 0.55);
              ctx.quadraticCurveTo(flR * 0.5, -flR * 0.3, flR * 1.15, 0);
              ctx.quadraticCurveTo(flR * 0.5, flR * 0.3, -flR * 0.4, flR * 0.55);
              ctx.closePath();
              ctx.fill();
            } else if (skin.tail === 'blade') {
              const blR = cellSize * 0.38;
              const blGrad = ctx.createLinearGradient(-blR * 0.4, 0, blR, 0);
              blGrad.addColorStop(0, '#FFFFFF');
              blGrad.addColorStop(0.5, '#38BDF8');
              blGrad.addColorStop(1, '#0284C7');
              ctx.shadowColor = '#38BDF8';
              ctx.shadowBlur = 10;
              ctx.fillStyle = blGrad;
              ctx.strokeStyle = '#FFFFFF';
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.moveTo(-blR * 0.3, 0);
              ctx.lineTo(blR * 0.25, -blR * 0.48);
              ctx.lineTo(blR * 1.1, 0);
              ctx.lineTo(blR * 0.25, blR * 0.48);
              ctx.closePath();
              ctx.fill();
              ctx.stroke();
            }
            ctx.restore();
          }

          // G. 3D Animated Flapping Wings on Shoulder Segment (i === 1)
          if (i === 1 && skin.wings && skin.wings !== 'none' && prevSeg) {
            const bodyAngle = Math.atan2(prevSeg.y - seg.y, prevSeg.x - seg.x);
            const flapScale = 0.82 + Math.sin(timeMs / 135) * 0.24;
            const wingSpan = cellSize * 0.85 * flapScale;
            const wingChord = cellSize * 0.52;

            ctx.save();
            ctx.translate(sX, sY);
            ctx.rotate(bodyAngle);

            [-1, 1].forEach((side) => {
              ctx.save();
              ctx.scale(1, side);

              if (skin.wings === 'angel') {
                const wGrad = ctx.createLinearGradient(0, 0, -wingChord, wingSpan);
                wGrad.addColorStop(0, '#FFFFFF');
                wGrad.addColorStop(0.65, '#FEF08A');
                wGrad.addColorStop(1, '#F59E0B');
                ctx.fillStyle = wGrad;
                ctx.strokeStyle = '#D97706';
                ctx.lineWidth = 1.2;
                ctx.shadowColor = 'rgba(254, 240, 138, 0.85)';
                ctx.shadowBlur = 10;

                ctx.beginPath();
                ctx.moveTo(0, segmentRadius * 0.55);
                ctx.quadraticCurveTo(wingChord * 0.35, wingSpan * 0.75, -wingChord * 0.35, wingSpan);
                ctx.quadraticCurveTo(-wingChord * 0.85, wingSpan * 0.7, -wingChord * 0.55, segmentRadius * 0.45);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
              } else if (skin.wings === 'dragon') {
                const dGrad = ctx.createLinearGradient(0, 0, -wingChord, wingSpan);
                dGrad.addColorStop(0, '#F97316');
                dGrad.addColorStop(0.55, '#DC2626');
                dGrad.addColorStop(1, '#450A0A');
                ctx.fillStyle = dGrad;
                ctx.strokeStyle = '#FEF08A';
                ctx.lineWidth = 1.1;
                ctx.shadowColor = 'rgba(239, 68, 68, 0.85)';
                ctx.shadowBlur = 10;

                ctx.beginPath();
                ctx.moveTo(2, segmentRadius * 0.5);
                ctx.lineTo(wingChord * 0.2, wingSpan * 0.85);
                ctx.lineTo(-wingChord * 0.3, wingSpan);
                ctx.lineTo(-wingChord * 0.75, wingSpan * 0.68);
                ctx.lineTo(-wingChord * 0.45, segmentRadius * 0.45);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
              } else if (skin.wings === 'fairy') {
                const fGrad = ctx.createLinearGradient(0, 0, -wingChord, wingSpan);
                fGrad.addColorStop(0, '#E0F2FE');
                fGrad.addColorStop(0.5, '#38BDF8');
                fGrad.addColorStop(1, '#C084FC');
                ctx.fillStyle = fGrad;
                ctx.strokeStyle = '#FFFFFF';
                ctx.lineWidth = 1.2;
                ctx.shadowColor = 'rgba(56, 189, 248, 0.9)';
                ctx.shadowBlur = 12;

                ctx.beginPath();
                ctx.ellipse(
                  -wingChord * 0.18,
                  segmentRadius * 0.5 + wingSpan * 0.42,
                  wingChord * 0.48,
                  wingSpan * 0.45,
                  -0.25,
                  0,
                  Math.PI * 2
                );
                ctx.fill();
                ctx.stroke();
              }

              ctx.restore();
            });

            ctx.restore();
          }

          ctx.restore();
        }

        // 3. Draw Realistic 3D Sculpted Snake Head (snake[0])
        const hX = offsetX + head.x * cellSize + cellSize / 2;
        const hY = offsetY + head.y * cellSize + cellSize / 2 + idleBreath * 0.6;
        const headRadius = cellSize * 0.52;
        const dir: Direction = engineState.direction;

        ctx.save();
        ctx.translate(hX, hY);

        let rotationAngle = 0;
        if (dir === 'RIGHT') rotationAngle = 0;
        else if (dir === 'DOWN') rotationAngle = Math.PI / 2;
        else if (dir === 'LEFT') rotationAngle = Math.PI;
        else if (dir === 'UP') rotationAngle = -Math.PI / 2;

        ctx.rotate(rotationAngle);

        // A. 3D Head Ground Shadow
        ctx.fillStyle = 'rgba(10, 24, 12, 0.38)';
        ctx.beginPath();
        ctx.ellipse(2, 5.5, headRadius * 1.12, headRadius * 0.86, 0, 0, Math.PI * 2);
        ctx.fill();

        // B. Animated 3D Flicking Forked Tongue
        const timeSec = timeMs / 190;
        const tongueLength = headRadius * 0.74 + Math.sin(timeSec) * 3.5;
        const tongueGrad = ctx.createLinearGradient(
          headRadius * 0.7,
          0,
          headRadius * 0.75 + tongueLength + 5,
          0
        );
        tongueGrad.addColorStop(0, '#991B1B');
        tongueGrad.addColorStop(0.5, '#EF4444');
        tongueGrad.addColorStop(1, '#FCA5A5');
        ctx.fillStyle = tongueGrad;
        ctx.strokeStyle = '#7F1D1D';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(headRadius * 0.72, -2.4);
        ctx.lineTo(headRadius * 0.72 + tongueLength, -2.4);
        ctx.lineTo(headRadius * 0.72 + tongueLength + 5.5, -5.8);
        ctx.lineTo(headRadius * 0.72 + tongueLength + 1.6, 0);
        ctx.lineTo(headRadius * 0.72 + tongueLength + 5.5, 5.8);
        ctx.lineTo(headRadius * 0.72 + tongueLength, 2.4);
        ctx.lineTo(headRadius * 0.72, 2.4);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // C. Sculpted 3D Reptile Cranium & Tapered Snout
        const headGrad = ctx.createRadialGradient(
          -headRadius * 0.24,
          -headRadius * 0.28,
          headRadius * 0.06,
          0,
          0,
          headRadius * 1.18
        );
        headGrad.addColorStop(0, skin.bellyColor);
        headGrad.addColorStop(0.42, skin.bodyPrimary);
        headGrad.addColorStop(0.86, skin.headColor);
        headGrad.addColorStop(1, 'rgba(0,0,0,0.48)');

        ctx.fillStyle = headGrad;
        ctx.beginPath();
        ctx.moveTo(-headRadius * 0.95, -headRadius * 0.72);
        ctx.quadraticCurveTo(0, -headRadius * 1.05, headRadius * 0.92, -headRadius * 0.52);
        ctx.quadraticCurveTo(headRadius * 1.28, 0, headRadius * 0.92, headRadius * 0.52);
        ctx.quadraticCurveTo(0, headRadius * 1.05, -headRadius * 0.95, headRadius * 0.72);
        ctx.quadraticCurveTo(-headRadius * 1.15, 0, -headRadius * 0.95, -headRadius * 0.72);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = 'rgba(10, 20, 12, 0.42)';
        ctx.lineWidth = 1.6;
        ctx.stroke();

        // D. 3D Cranial Crest / Forehead Gem
        ctx.fillStyle = skin.sparkleColor || skin.bellyColor;
        ctx.globalAlpha = 0.88;
        ctx.beginPath();
        ctx.moveTo(-headRadius * 0.48, 0);
        ctx.lineTo(-headRadius * 0.12, -headRadius * 0.26);
        ctx.lineTo(headRadius * 0.2, 0);
        ctx.lineTo(-headRadius * 0.12, headRadius * 0.26);
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = 1;

        // 3D Headgear: Royal Golden Crown, Celestial Halo, or Dragon Crystal Horns
        const activeHeadgear = skin.headgear || (skin.hasCrown ? 'crown' : 'none');
        if (activeHeadgear === 'crown') {
          ctx.save();
          const crownGrad = ctx.createLinearGradient(
            -headRadius * 0.5,
            -headRadius * 0.4,
            0,
            headRadius * 0.4
          );
          crownGrad.addColorStop(0, '#FEF08A');
          crownGrad.addColorStop(0.5, '#FACC15');
          crownGrad.addColorStop(1, '#B45309');
          ctx.fillStyle = crownGrad;
          ctx.strokeStyle = '#78350F';
          ctx.lineWidth = 1.2;
          const cx = -headRadius * 0.3;
          const cw = headRadius * 0.46;
          ctx.beginPath();
          ctx.moveTo(cx - cw * 0.5, -cw * 0.58);
          ctx.lineTo(cx + cw * 0.52, -cw * 0.34);
          ctx.lineTo(cx + cw * 0.2, 0);
          ctx.lineTo(cx + cw * 0.52, cw * 0.34);
          ctx.lineTo(cx - cw * 0.5, cw * 0.58);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // Ruby center jewel on crown
          ctx.fillStyle = '#E11D48';
          ctx.beginPath();
          ctx.arc(cx - cw * 0.1, 0, 2.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        } else if (activeHeadgear === 'halo') {
          ctx.save();
          const haloPulse = 1 + Math.sin(timeMs / 200) * 0.08;
          ctx.strokeStyle = '#FEF08A';
          ctx.lineWidth = 2.6;
          ctx.shadowColor = '#FACC15';
          ctx.shadowBlur = 12;
          ctx.beginPath();
          ctx.ellipse(
            -headRadius * 0.38,
            0,
            headRadius * 0.28 * haloPulse,
            headRadius * 0.56 * haloPulse,
            0,
            0,
            Math.PI * 2
          );
          ctx.stroke();
          ctx.restore();
        } else if (activeHeadgear === 'horns') {
          ctx.save();
          [-1, 1].forEach((side) => {
            const hGrad = ctx.createLinearGradient(
              -headRadius * 0.2,
              side * headRadius * 0.4,
              -headRadius * 0.95,
              side * headRadius * 0.95
            );
            hGrad.addColorStop(0, '#FCA5A5');
            hGrad.addColorStop(0.5, '#E11D48');
            hGrad.addColorStop(1, '#FEF08A');
            ctx.fillStyle = hGrad;
            ctx.strokeStyle = '#4C0519';
            ctx.lineWidth = 1.1;
            ctx.beginPath();
            ctx.moveTo(-headRadius * 0.15, side * headRadius * 0.42);
            ctx.quadraticCurveTo(
              -headRadius * 0.55,
              side * headRadius * 0.92,
              -headRadius * 0.98,
              side * headRadius * 0.78
            );
            ctx.quadraticCurveTo(
              -headRadius * 0.62,
              side * headRadius * 0.48,
              -headRadius * 0.45,
              side * headRadius * 0.25
            );
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
          });
          ctx.restore();
        }

        // E. 3D Snout Bridge Specular Highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.76)';
        ctx.beginPath();
        ctx.ellipse(
          -headRadius * 0.12,
          -headRadius * 0.34,
          headRadius * 0.35,
          headRadius * 0.14,
          -0.18,
          0,
          Math.PI * 2
        );
        ctx.fill();

        // Recessed 3D Nostrils on Snout Tip
        ctx.fillStyle = 'rgba(0, 0, 0, 0.52)';
        [-1, 1].forEach((side) => {
          ctx.beginPath();
          ctx.ellipse(
            headRadius * 0.78,
            side * headRadius * 0.22,
            1.7,
            1.1,
            side * 0.3,
            0,
            Math.PI * 2
          );
          ctx.fill();
        });

        // F. Realistic 3D Spherical Eyes with Supraorbital Brow Ridge & Corneal Dome
        const eyeOffsetX = headRadius * 0.22;
        const eyeOffsetY = headRadius * 0.48;
        const eyeRadius = isNearFruit ? headRadius * 0.36 : headRadius * 0.32;

        [-1, 1].forEach((side) => {
          const eyeY = side * eyeOffsetY;

          // Deep 3D Eye Socket Ambient Occlusion
          ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
          ctx.beginPath();
          ctx.arc(eyeOffsetX + 1, eyeY + 1.2, eyeRadius * 1.12, 0, Math.PI * 2);
          ctx.fill();

          // 3D Sclera Sphere
          const scleraGrad = ctx.createRadialGradient(
            eyeOffsetX - eyeRadius * 0.25,
            eyeY - eyeRadius * 0.25,
            1,
            eyeOffsetX,
            eyeY,
            eyeRadius
          );
          scleraGrad.addColorStop(0, '#FFFFFF');
          scleraGrad.addColorStop(0.75, skin.eyeColor);
          scleraGrad.addColorStop(1, '#94A3B8');
          ctx.fillStyle = scleraGrad;
          ctx.beginPath();
          ctx.arc(eyeOffsetX, eyeY, eyeRadius, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = 'rgba(15, 23, 42, 0.45)';
          ctx.lineWidth = 1.2;
          ctx.stroke();

          // Reactive 3D Iris & Pupil
          const pupilX = eyeOffsetX + (isNearFruit ? 3.2 : 2.0);
          ctx.fillStyle = skin.pupilColor;
          ctx.beginPath();
          ctx.arc(pupilX, eyeY, eyeRadius * 0.54, 0, Math.PI * 2);
          ctx.fill();

          // Primary & Secondary 3D Corneal Catchlights
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(pupilX + 1.5, eyeY - 1.6, eyeRadius * 0.26, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
          ctx.beginPath();
          ctx.arc(pupilX - 1.2, eyeY + 1.4, eyeRadius * 0.12, 0, Math.PI * 2);
          ctx.fill();
        });

        ctx.restore();
      }

      // F. 3D Floating Atmospheric Particles (Fireflies / Solar Motes / Magma Embers)
      ctx.save();
      for (let i = 0; i < 14; i++) {
        const seedX = (i * 137.5) % arenaW;
        const seedY = (i * 293.7) % arenaH;
        const driftX = Math.sin(timeMs / (1800 + i * 110) + i) * 18;
        const driftY = Math.cos(timeMs / (2100 + i * 95) + i * 2) * 14;
        const px = offsetX + ((seedX + driftX + arenaW) % arenaW);
        const py = offsetY + ((seedY + driftY + arenaH) % arenaH);
        const alpha = 0.35 + Math.sin(timeMs / 400 + i * 1.7) * 0.3;
        const pRadius = 1.6 + (i % 3) * 0.7;

        ctx.globalAlpha = Math.max(0.1, alpha);
        ctx.fillStyle = theme.particleColor;
        ctx.shadowColor = theme.particleColor;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(px, py, pRadius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      ctx.restore();

      // Keep 60fps loop active so 3D lighting, snake idle breathing, and particles stay alive
      rafId = window.requestAnimationFrame(renderFrame);
    };

    rafId = window.requestAnimationFrame(renderFrame);
    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [engineState, gridMetrics, snakeSkin, customSkin]);

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="w-full h-full relative overflow-hidden select-none touch-none flex items-center justify-center"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block cursor-default"
        style={{ imageRendering: 'auto' }}
        aria-label="Papan Permainan Ular Kadut"
      />

      {/* Full-Width Glassmorphism Overlay Layer */}
      {children && (
        <div className="absolute inset-0 z-30 pointer-events-none flex items-center justify-center">
          <div className="relative pointer-events-auto flex items-center justify-center w-full h-full">
            {children}
          </div>
        </div>
      )}
    </div>
  );
};
