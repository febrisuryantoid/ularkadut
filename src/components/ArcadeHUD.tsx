import React, { useState, useEffect } from 'react';
import {
  Volume2,
  VolumeX,
  HelpCircle,
  Trophy,
  Coins,
  Palette,
  Flag,
  Maximize,
  Minimize,
} from 'lucide-react';
import { DifficultyLevel, GameState } from '../game/gameTypes';
import { formatCountdownMMSS } from '../game/economyManager';
import { isFullscreenActive, toggleFullscreen } from '../utils/fullscreen';

interface ArcadeHUDProps {
  score: number;
  targetScore: number;
  currentLevel: number;
  highScore: number;
  coins: number;
  hourlyRemainingMs: number;
  unclaimedRewardsCount: number;
  speedTPS: number;
  gameState: GameState;
  difficulty: DifficultyLevel;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenRewards: () => void;
  onOpenSkinShop: () => void;
  onOpenHelp: () => void;
  isHelpOpen: boolean;
  viewportMode?: 'landscape-wide' | 'landscape-compact' | 'portrait';
}

export const ArcadeHUD: React.FC<ArcadeHUDProps> = ({
  score,
  targetScore,
  currentLevel,
  highScore,
  coins,
  hourlyRemainingMs,
  unclaimedRewardsCount,
  difficulty,
  isMuted,
  onToggleMute,
  onOpenRewards,
  onOpenSkinShop,
  onOpenHelp,
  isHelpOpen,
  viewportMode = 'landscape-wide',
}) => {
  const isProgressMax = score >= targetScore;
  const progressPct = Math.min(100, Math.round((score / Math.max(1, targetScore)) * 100));
  const isHourlyReady = hourlyRemainingMs <= 0;

  const [isFullscreen, setIsFullscreen] = useState<boolean>(() => isFullscreenActive());

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(isFullscreenActive());
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  const handleToggleFullscreen = async () => {
    await toggleFullscreen();
    setIsFullscreen(isFullscreenActive());
  };

  // Difficulty color indicator dot/pill
  const diffDotColor =
    difficulty === 'hard'
      ? 'bg-[#E11D48]'
      : difficulty === 'medium'
        ? 'bg-[#EA580C]'
        : 'bg-[#16A34A]';

  // Fluid responsive height & square dimensions that automatically scale down to 320px (iPhone 5s)
  // and up to 1440px+ Desktop with zero clipping and strict geometric alignment
  const unitH =
    viewportMode === 'landscape-compact'
      ? 'h-8 sm:h-9'
      : 'h-[clamp(28px,7.8vw,42px)] sm:h-10 lg:h-11';
  const squareUnit =
    viewportMode === 'landscape-compact'
      ? 'w-8 h-8 sm:w-9 sm:h-9'
      : 'w-[clamp(28px,7.8vw,42px)] h-[clamp(28px,7.8vw,42px)] sm:w-10 sm:h-10 lg:w-11 lg:h-11';
  const fluidIcon = 'w-[clamp(13px,3.8vw,18px)] h-[clamp(13px,3.8vw,18px)] shrink-0';

  return (
    <header className="w-full z-20 shrink-0 select-none bg-transparent px-[clamp(6px,2vw,24px)] pt-[clamp(4px,1.2vw,10px)] pb-1">
      <div className="max-w-[1440px] mx-auto w-full flex items-center justify-between gap-[clamp(4px,1.2vw,12px)] min-w-0">
        {/* 1. LEFT: Brand Logo & Level Pill (Glassmorphism) */}
        <div
          className={`${unitH} px-[clamp(6px,1.8vw,14px)] rounded-xl glass-pill flex items-center gap-[clamp(4px,1.2vw,10px)] shrink-0`}
        >
          <img
            src="/assets/aistudio/Ular_Kadut_Logo_5be163da.png"
            alt="Ular Kadut"
            referrerPolicy="no-referrer"
            className="h-[clamp(16px,4.8vw,28px)] w-auto object-contain drop-shadow-[0_2px_3px_rgba(0,0,0,0.2)] select-none shrink-0 pointer-events-none"
          />
          <span className="h-3.5 w-px bg-[#203126]/15 shrink-0" aria-hidden="true" />
          <span className="flex items-center gap-1 text-[clamp(10px,2.8vw,13px)] font-black text-[#143018] tabular-nums whitespace-nowrap shrink-0">
            <span className={`w-2 h-2 rounded-full ${diffDotColor} shrink-0`} />
            <span>Lv.{currentLevel}</span>
          </span>
        </div>

        {/* 2. CENTER: Score Progress & High Score (Glassmorphism) */}
        <div className="flex items-center gap-[clamp(4px,1.2vw,10px)] min-w-0 shrink">
          {/* Score & Target Module */}
          <div
            className={`${unitH} px-[clamp(7px,2vw,16px)] rounded-xl glass-pill flex items-center gap-[clamp(4px,1.2vw,10px)] min-w-0`}
          >
            <Flag
              className={`${fluidIcon} ${
                isProgressMax ? 'text-[#F59E0B] fill-[#FACC15]' : 'text-[#16A34A]'
              }`}
            />
            <div className="flex flex-col justify-center min-w-0">
              <div className="flex items-baseline gap-0.5 leading-none tabular-nums whitespace-nowrap">
                <span className="text-[clamp(11px,3.2vw,15px)] font-black text-[#143018]">
                  {score}
                </span>
                <span className="text-[clamp(9px,2.4vw,12px)] font-bold text-[#526650]">
                  /{targetScore}
                </span>
              </div>
              <div className="hidden sm:block w-20 lg:w-28 h-1.5 bg-[#203126]/10 rounded-full overflow-hidden mt-1">
                <div
                  className="h-full bg-gradient-to-r from-[#16A34A] via-[#22C55E] to-[#84CC16] transition-all duration-200"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          </div>

          {/* High Score Module (Desktop & Tablet) */}
          <div
            className={`hidden md:flex ${unitH} px-3.5 rounded-xl glass-pill items-center gap-1.5 shrink-0`}
            title="Rekor Tertinggi"
          >
            <Trophy className={`${fluidIcon} text-[#D97706] fill-[#FACC15]`} />
            <span className="text-sm font-black text-[#143018] tabular-nums whitespace-nowrap">
              {highScore}
            </span>
          </div>
        </div>

        {/* 3. RIGHT: Uniform Action Pills & Icon Buttons (Zero Clipping down to 320px) */}
        <div className="flex items-center gap-[clamp(3px,1vw,8px)] shrink-0">
          {/* Coins & Rewards Button */}
          <button
            type="button"
            onClick={onOpenRewards}
            className={`relative ${unitH} px-[clamp(6px,1.8vw,14px)] rounded-xl bg-gradient-to-b from-[#FFFDF5]/90 to-[#FDE68A]/90 backdrop-blur-md border border-[#F59E0B] shadow-[0_3px_0_rgba(180,83,9,0.7),0_4px_12px_rgba(0,0,0,0.12)] hud-module-3d-interactive flex items-center gap-[clamp(3px,1vw,6px)] cursor-pointer shrink-0`}
            title="Koin & Hadiah"
          >
            <Coins className={`${fluidIcon} text-[#B45309] fill-[#F59E0B]`} />
            <span className="text-[clamp(10px,2.9vw,14px)] font-black text-[#451A03] tabular-nums whitespace-nowrap">
              {coins}
            </span>
            <span className="hidden lg:inline text-xs font-extrabold text-[#92400E] whitespace-nowrap tabular-nums ml-0.5">
              • {isHourlyReady ? '+100' : formatCountdownMMSS(hourlyRemainingMs)}
            </span>
            {unclaimedRewardsCount > 0 && (
              <span className=" -top-1 -right-1 absolute sm:static sm:ml-0.5 min-w-[15px] h-[15px] px-1 rounded-full bg-[#E11D48] text-white font-black text-[9px] leading-none flex items-center justify-center tabular-nums shadow-xs">
                {unclaimedRewardsCount}
              </span>
            )}
          </button>

          {/* Skin & Custom Studio Icon Button (Icon Only) */}
          <button
            type="button"
            onClick={onOpenSkinShop}
            className={`${squareUnit} rounded-xl bg-gradient-to-b from-[#FAF5FF]/90 to-[#E9D5FF]/90 backdrop-blur-md border border-[#A855F7] shadow-[0_3px_0_rgba(126,34,206,0.65),0_4px_12px_rgba(0,0,0,0.12)] hud-module-3d-interactive text-[#4C1D95] flex items-center justify-center cursor-pointer shrink-0`}
            aria-label="Skin Studio"
            title="Skin Studio"
          >
            <Palette className={`${fluidIcon} text-[#6D28D9]`} />
          </button>

          {/* Direct Icon-Only Mute/Unmute Toggle */}
          <button
            type="button"
            onClick={onToggleMute}
            className={`${squareUnit} rounded-xl glass-pill hud-module-3d-interactive text-[#203126] flex items-center justify-center cursor-pointer shrink-0`}
            aria-label={isMuted ? 'Nyalakan Suara' : 'Bisukan Suara'}
            title={isMuted ? 'Nyalakan Suara' : 'Bisukan Suara'}
          >
            {isMuted ? (
              <VolumeX className={`${fluidIcon} text-[#D9364F]`} />
            ) : (
              <Volume2 className={`${fluidIcon} text-[#16803C]`} />
            )}
          </button>

          {/* Fullscreen Toggle Button */}
          <button
            type="button"
            onClick={handleToggleFullscreen}
            className={`${squareUnit} rounded-xl glass-pill hud-module-3d-interactive text-[#203126] flex items-center justify-center cursor-pointer shrink-0`}
            aria-label={isFullscreen ? 'Keluar Fullscreen' : 'Layar Penuh'}
            title={isFullscreen ? 'Keluar Layar Penuh' : 'Layar Penuh'}
          >
            {isFullscreen ? (
              <Minimize className={`${fluidIcon} text-[#16803C]`} />
            ) : (
              <Maximize className={`${fluidIcon} text-[#203126]`} />
            )}
          </button>

          {/* Help "?" Button */}
          <button
            type="button"
            onClick={onOpenHelp}
            className={`${squareUnit} rounded-xl flex items-center justify-center cursor-pointer shrink-0 transition-transform ${
              isHelpOpen
                ? 'bg-[#24A148] text-white border border-[#14532D] shadow-[0_3px_0_#052E16]'
                : 'glass-pill hud-module-3d-interactive text-[#203126]'
            }`}
            aria-label="Bantuan"
            title="Panduan"
          >
            <HelpCircle className={fluidIcon} />
          </button>
        </div>
      </div>
    </header>
  );
};
