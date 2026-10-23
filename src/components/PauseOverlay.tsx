import React from 'react';
import { Play, RotateCcw, Home, PauseCircle } from 'lucide-react';

interface PauseOverlayProps {
  onResume: () => void;
  onRestart: () => void;
  onMenu: () => void;
}

export const PauseOverlay: React.FC<PauseOverlayProps> = ({
  onResume,
  onRestart,
  onMenu,
}) => {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Jeda"
      className="absolute inset-0 z-30 bg-stone-950/35 backdrop-blur-md flex items-center justify-center p-3 rounded-2xl"
    >
      <div className="w-full max-w-xs glass-panel rounded-3xl p-5 text-center flex flex-col items-center gap-4 animate-in fade-in zoom-in-95">
        <div className="w-12 h-12 rounded-2xl bg-[#24A148]/15 border border-[#24A148]/30 text-[#15803D] flex items-center justify-center shadow-xs">
          <PauseCircle size={28} />
        </div>

        <h2 className="text-xl font-black text-[#143018] tracking-wide leading-none">
          JEDA
        </h2>

        <div className="w-full flex flex-col gap-2.5">
          <button
            type="button"
            onClick={onResume}
            className="btn-shining-cta w-full h-11 px-4 bg-gradient-to-r from-[#22C55E] to-[#15803D] text-white font-black text-sm rounded-2xl border border-[#14532D] flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
          >
            <Play size={16} className="fill-current" />
            <span>LANJUT</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onRestart}
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
