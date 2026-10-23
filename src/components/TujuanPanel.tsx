import React from 'react';

interface TujuanPanelProps {
  compact?: boolean;
  className?: string;
}

export const TujuanPanel: React.FC<TujuanPanelProps> = ({
  compact = false,
  className = '',
}) => {
  return (
    <div
      className={`relative bg-[#FBF4E6] border-3 sm:border-4 border-[#B88144] rounded-2xl sm:rounded-3xl shadow-lg p-2.5 sm:p-3.5 select-none overflow-hidden ${className}`}
      style={{
        boxShadow: '0 8px 16px rgba(92, 59, 21, 0.18), inset 0 2px 4px rgba(255, 255, 255, 0.6)',
      }}
    >
      {/* Wooden Sign Corner Leaves */}
      <div className="absolute top-0 left-0 w-6 h-6 pointer-events-none">
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-[#24A148]">
          <path d="M0 0 C 10 2, 14 10, 8 18 C 3 14, 0 8, 0 0 Z" fill="#24A148" />
          <path d="M2 2 C 6 6, 8 10, 6 14" stroke="#B7F34A" strokeWidth="1" />
        </svg>
      </div>
      <div className="absolute top-0 right-0 w-6 h-6 pointer-events-none transform scale-x-[-1]">
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-[#24A148]">
          <path d="M0 0 C 10 2, 14 10, 8 18 C 3 14, 0 8, 0 0 Z" fill="#24A148" />
          <path d="M2 2 C 6 6, 8 10, 6 14" stroke="#B7F34A" strokeWidth="1" />
        </svg>
      </div>

      {/* Header Title */}
      <div className="text-center mb-2">
        <h3 className="text-xs sm:text-sm font-black text-[#6F3E16] uppercase tracking-wider drop-shadow-xs">
          TUJUAN
        </h3>
      </div>

      {/* Rules List */}
      <div className="flex flex-col gap-1.5 sm:gap-2">
        {/* Item 1: Makan buah */}
        <div className="flex items-center gap-2 bg-[#F2E5CE]/70 border border-[#DEBE93] rounded-xl px-2 py-1">
          <div className="w-6 h-6 rounded-lg bg-white flex items-center justify-center shrink-0 shadow-2xs text-sm">
            🍎
          </div>
          <span className="text-[10px] sm:text-[11px] font-bold text-[#4E2B0D] leading-tight">
            Makan buah tambah panjang!
          </span>
        </div>

        {/* Item 2: Tabrak tubuh */}
        <div className="flex items-center gap-2 bg-[#F2E5CE]/70 border border-[#DEBE93] rounded-xl px-2 py-1">
          <div className="w-6 h-6 rounded-lg bg-white flex items-center justify-center shrink-0 shadow-2xs text-sm">
            🐍
          </div>
          <span className="text-[10px] sm:text-[11px] font-bold text-[#4E2B0D] leading-tight">
            Tabrak tubuh sendiri maka terpotong!
          </span>
        </div>

        {/* Item 3: Tabrak dinding */}
        <div className="flex items-center gap-2 bg-[#FEE2E2]/70 border border-[#FCA5A5] rounded-xl px-2 py-1">
          <div className="w-6 h-6 rounded-lg bg-white flex items-center justify-center shrink-0 shadow-2xs text-sm">
            🧱
          </div>
          <span className="text-[10px] sm:text-[11px] font-black text-[#991B1B] leading-tight">
            Tabrak dinding = Game Over!
          </span>
        </div>
      </div>
    </div>
  );
};
