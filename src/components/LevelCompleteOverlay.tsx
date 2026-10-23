import React from 'react';
import { Star, Coins, ArrowRight, RotateCcw, Home, Flag, Trophy } from 'lucide-react';
import { DifficultyLevel } from '../game/gameTypes';
import { DIFFICULTY_INFO } from '../game/gameConfig';
import { getLevelConfig, MAX_LEVELS_PER_DIFFICULTY } from '../game/levelProgression';

interface LevelCompleteOverlayProps {
  difficulty: DifficultyLevel;
  currentLevel: number;
  score: number;
  stars: number;
  sessionCoinsEarned: number;
  levelCompletionReward: number;
  onNextLevel: () => void;
  onReplay: () => void;
  onMenu: () => void;
}

export const LevelCompleteOverlay: React.FC<LevelCompleteOverlayProps> = ({
  difficulty,
  currentLevel,
  score,
  stars,
  sessionCoinsEarned,
  levelCompletionReward,
  onNextLevel,
  onReplay,
  onMenu,
}) => {
  const levelCfg = getLevelConfig(difficulty, currentLevel);
  const diffLabel = DIFFICULTY_INFO[difficulty].label;
  const hasNextLevel = currentLevel < MAX_LEVELS_PER_DIFFICULTY;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Level Selesai"
      className="absolute inset-0 z-30 bg-stone-950/35 backdrop-blur-md flex items-center justify-center p-3 rounded-2xl"
    >
      <div className="w-full max-w-xs sm:max-w-sm glass-panel rounded-3xl p-4 sm:p-5 text-center flex flex-col items-center gap-3.5 animate-in fade-in zoom-in-95">
        {/* 3D Stars Row */}
        <div className="flex items-center justify-center gap-2">
          {[1, 2, 3].map((idx) => {
            const earned = idx <= stars;
            return (
              <div
                key={idx}
                className={`w-11 h-11 rounded-2xl flex items-center justify-center border-2 shadow-xs ${
                  earned
                    ? 'bg-[#FFFBEB] border-[#F59E0B] text-[#F59E0B]'
                    : 'bg-white/40 border-white/60 text-stone-300'
                }`}
              >
                <Star
                  size={24}
                  className={earned ? 'fill-[#FACC15] text-[#D97706]' : ''}
                />
              </div>
            );
          })}
        </div>

        {/* Minimal Title */}
        <div>
          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-[#15803D] bg-[#DCFCE7] px-2.5 py-0.5 rounded-full border border-[#86EFAC]">
            {diffLabel} • LV.{currentLevel}
          </span>
          <h2 className="text-2xl font-black text-[#143018] tracking-wide mt-1 leading-none">
            MENANG!
          </h2>
        </div>

        {/* Visual Stat Badges Grid */}
        <div className="w-full grid grid-cols-3 gap-2">
          <div className="glass-card rounded-2xl p-2.5 flex flex-col items-center justify-center">
            <Flag size={15} className="text-[#16A34A] mb-0.5" />
            <span className="text-sm sm:text-base font-black text-[#143018] tabular-nums">
              {score}
              <span className="text-[10px] font-bold text-[#526650]">/{levelCfg.targetScore}</span>
            </span>
          </div>

          <div className="glass-card rounded-2xl p-2.5 flex flex-col items-center justify-center">
            <Trophy size={15} className="text-[#D97706] fill-[#FACC15] mb-0.5" />
            <span className="text-sm sm:text-base font-black text-[#B45309] tabular-nums">
              +{levelCompletionReward}
            </span>
          </div>

          <div className="glass-card rounded-2xl p-2.5 flex flex-col items-center justify-center">
            <Coins size={15} className="text-[#B45309] fill-[#F59E0B] mb-0.5" />
            <span className="text-sm sm:text-base font-black text-[#451A03] tabular-nums">
              +{sessionCoinsEarned}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-2">
          {hasNextLevel && (
            <button
              type="button"
              onClick={onNextLevel}
              className="btn-shining-cta w-full h-11 px-4 bg-gradient-to-r from-[#22C55E] via-[#16A34A] to-[#15803D] text-white font-black text-sm rounded-2xl border border-[#14532D] flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
            >
              <span>LANJUT LV.{currentLevel + 1}</span>
              <ArrowRight size={17} className="stroke-[2.5]" />
            </button>
          )}

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onReplay}
              className="h-10 px-3 glass-card hover:bg-white/80 text-[#203126] font-black text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer uppercase"
            >
              <RotateCcw size={14} className="text-[#16A34A]" />
              <span>ULANGI</span>
            </button>

            <button
              type="button"
              onClick={onMenu}
              className="h-10 px-3 glass-card hover:bg-white/80 text-[#203126] font-black text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer uppercase"
            >
              <Home size={14} />
              <span>MENU</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
