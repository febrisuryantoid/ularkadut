import React from 'react';
import { RotateCcw, Home, Trophy, Skull, Coins, Flag } from 'lucide-react';

interface GameOverOverlayProps {
  score: number;
  targetScore: number;
  currentLevel: number;
  sessionCoinsEarned: number;
  highScore: number;
  reason?: 'wall' | 'obstacle' | null;
  onPlayAgain: () => void;
  onMenu: () => void;
}

export const GameOverOverlay: React.FC<GameOverOverlayProps> = ({
  score,
  targetScore,
  currentLevel,
  sessionCoinsEarned,
  highScore,
  onPlayAgain,
  onMenu,
}) => {
  const isNewRecord = score > 0 && score >= highScore;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Game Over"
      className="absolute inset-0 z-30 bg-stone-950/40 backdrop-blur-md flex items-center justify-center p-3 rounded-2xl"
    >
      <div className="w-full max-w-xs sm:max-w-sm glass-panel rounded-3xl p-4 sm:p-5 text-center flex flex-col items-center gap-3.5 animate-in fade-in zoom-in-95">
        {/* Visual Header */}
        <div className="flex flex-col items-center gap-1">
          <div className="w-12 h-12 rounded-2xl bg-[#E11D48]/15 text-[#E11D48] border border-[#E11D48]/30 flex items-center justify-center shadow-xs">
            <Skull size={26} />
          </div>
          <h2 className="text-2xl font-black text-[#BE123C] tracking-wide mt-0.5 leading-none">
            GAME OVER
          </h2>
          {isNewRecord && (
            <span className="mt-1 px-2.5 py-0.5 bg-[#FEF08A] border border-[#F59E0B] rounded-full text-[#451A03] font-black text-[10px] uppercase tracking-wider inline-flex items-center gap-1">
              <Trophy size={11} className="text-[#D97706]" /> REKOR BARU!
            </span>
          )}
        </div>

        {/* Visual Stat Badges Grid (Minimal Text) */}
        <div className="w-full grid grid-cols-3 gap-2">
          <div className="glass-card rounded-2xl p-2.5 flex flex-col items-center justify-center">
            <Flag size={15} className="text-[#16A34A] mb-0.5" />
            <span className="text-sm sm:text-base font-black text-[#143018] tabular-nums">
              {score}
              <span className="text-[10px] font-bold text-[#526650]">/{targetScore}</span>
            </span>
          </div>

          <div className="glass-card rounded-2xl p-2.5 flex flex-col items-center justify-center">
            <Coins size={15} className="text-[#B45309] fill-[#F59E0B] mb-0.5" />
            <span className="text-sm sm:text-base font-black text-[#B45309] tabular-nums">
              +{sessionCoinsEarned}
            </span>
          </div>

          <div className="glass-card rounded-2xl p-2.5 flex flex-col items-center justify-center">
            <Trophy size={15} className="text-[#D97706] fill-[#FACC15] mb-0.5" />
            <span className="text-sm sm:text-base font-black text-[#143018] tabular-nums">
              {highScore}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-2">
          <button
            type="button"
            onClick={onPlayAgain}
            className="btn-shining-cta-yellow w-full h-11 px-4 bg-gradient-to-r from-[#FB923C] via-[#EA580C] to-[#C2410C] text-white font-black text-sm rounded-2xl border border-[#7C2D12] flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
          >
            <RotateCcw size={16} className="stroke-[2.5]" />
            <span>MAIN LAGI • LV.{currentLevel}</span>
          </button>

          <button
            type="button"
            onClick={onMenu}
            className="w-full h-10 px-4 glass-card hover:bg-white/80 text-[#203126] font-black text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider"
          >
            <Home size={14} />
            <span>MENU</span>
          </button>
        </div>
      </div>
    </div>
  );
};
