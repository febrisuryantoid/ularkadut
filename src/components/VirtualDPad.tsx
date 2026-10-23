import React from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { Direction } from '../game/gameTypes';

interface VirtualDPadProps {
  onDirection: (dir: Direction) => void;
  className?: string;
  size?: 'normal' | 'compact';
}

export const VirtualDPad: React.FC<VirtualDPadProps> = ({
  onDirection,
  className = '',
  size = 'normal',
}) => {
  const triggerDir = (dir: Direction) => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(12);
      } catch {
        // ignore
      }
    }
    onDirection(dir);
  };

  const isCompact = size === 'compact';
  const padSize = isCompact ? 'w-28 h-28' : 'w-36 h-36 sm:w-40 sm:h-40';
  const btnSize = isCompact ? 'w-10 h-10' : 'w-12 h-12 sm:w-14 sm:h-14';
  const iconSize = isCompact ? 18 : 22;

  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      {/* Decorative Tropical Leaves Behind D-Pad */}
      <svg
        className="absolute -inset-2 w-[calc(100%+16px)] h-[calc(100%+16px)] pointer-events-none opacity-85 text-[#24A148]"
        viewBox="0 0 160 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M20 30 C 15 15, 35 15, 45 25 C 50 30, 40 40, 30 40 Z"
          fill="#34D399"
          stroke="#059669"
          strokeWidth="1.5"
        />
        <path
          d="M140 30 C 145 15, 125 15, 115 25 C 110 30, 120 40, 130 40 Z"
          fill="#34D399"
          stroke="#059669"
          strokeWidth="1.5"
        />
        <path
          d="M20 130 C 15 145, 35 145, 45 135 C 50 130, 40 120, 30 120 Z"
          fill="#10B981"
          stroke="#059669"
          strokeWidth="1.5"
        />
        <path
          d="M140 130 C 145 145, 125 145, 115 135 C 110 130, 120 120, 130 120 Z"
          fill="#10B981"
          stroke="#059669"
          strokeWidth="1.5"
        />
      </svg>

      {/* Flower / Cross Shaped White Base Plate */}
      <div
        className={`relative ${padSize} bg-white/95 rounded-full p-1.5 shadow-lg border-2 border-[#DCE7D7] flex items-center justify-center`}
      >
        {/* Center Pivot Accent */}
        <div className="absolute w-8 h-8 rounded-full bg-[#EAF2E2] border border-[#CBDBC5] shadow-inner flex items-center justify-center pointer-events-none z-10">
          <div className="w-3.5 h-3.5 rounded-full bg-[#24A148]/30 border border-[#24A148]/50" />
        </div>

        {/* UP BUTTON */}
        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            triggerDir('UP');
          }}
          aria-label="Atas"
          className={`absolute top-1 left-1/2 -translate-x-1/2 ${btnSize} rounded-full bg-gradient-to-b from-[#2FD55D] to-[#16803C] hover:from-[#34E065] hover:to-[#189144] active:scale-90 active:from-[#16803C] active:to-[#12662F] text-white flex items-center justify-center shadow-md shadow-[#24A148]/30 border-2 border-[#6EE7B7] transition-transform cursor-pointer`}
        >
          <ArrowUp size={iconSize} className="stroke-[3] drop-shadow-xs" />
        </button>

        {/* LEFT BUTTON */}
        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            triggerDir('LEFT');
          }}
          aria-label="Kiri"
          className={`absolute left-1 top-1/2 -translate-y-1/2 ${btnSize} rounded-full bg-gradient-to-b from-[#2FD55D] to-[#16803C] hover:from-[#34E065] hover:to-[#189144] active:scale-90 active:from-[#16803C] active:to-[#12662F] text-white flex items-center justify-center shadow-md shadow-[#24A148]/30 border-2 border-[#6EE7B7] transition-transform cursor-pointer`}
        >
          <ArrowLeft size={iconSize} className="stroke-[3] drop-shadow-xs" />
        </button>

        {/* RIGHT BUTTON */}
        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            triggerDir('RIGHT');
          }}
          aria-label="Kanan"
          className={`absolute right-1 top-1/2 -translate-y-1/2 ${btnSize} rounded-full bg-gradient-to-b from-[#2FD55D] to-[#16803C] hover:from-[#34E065] hover:to-[#189144] active:scale-90 active:from-[#16803C] active:to-[#12662F] text-white flex items-center justify-center shadow-md shadow-[#24A148]/30 border-2 border-[#6EE7B7] transition-transform cursor-pointer`}
        >
          <ArrowRight size={iconSize} className="stroke-[3] drop-shadow-xs" />
        </button>

        {/* DOWN BUTTON */}
        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            triggerDir('DOWN');
          }}
          aria-label="Bawah"
          className={`absolute bottom-1 left-1/2 -translate-x-1/2 ${btnSize} rounded-full bg-gradient-to-b from-[#2FD55D] to-[#16803C] hover:from-[#34E065] hover:to-[#189144] active:scale-90 active:from-[#16803C] active:to-[#12662F] text-white flex items-center justify-center shadow-md shadow-[#24A148]/30 border-2 border-[#6EE7B7] transition-transform cursor-pointer`}
        >
          <ArrowDown size={iconSize} className="stroke-[3] drop-shadow-xs" />
        </button>
      </div>
    </div>
  );
};
