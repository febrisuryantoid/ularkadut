import React from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Hand } from 'lucide-react';

interface KontrolPanelProps {
  compact?: boolean;
  className?: string;
}

export const KontrolPanel: React.FC<KontrolPanelProps> = ({
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
          KONTROL
        </h3>
      </div>

      {/* Controls Details */}
      <div className="flex flex-col items-center gap-2">
        {/* Keys Section: Arrows vs WASD */}
        <div className="flex items-center justify-center gap-1.5 sm:gap-2 text-[11px] font-bold text-[#8A5422]">
          {/* Arrow Keys Cluster */}
          <div className="flex flex-col items-center gap-0.5">
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-[#24A148] border-b-2 border-[#16803C] shadow-xs text-white flex items-center justify-center font-black">
              <ArrowUp size={12} className="stroke-[3]" />
            </div>
            <div className="flex gap-0.5">
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-[#24A148] border-b-2 border-[#16803C] shadow-xs text-white flex items-center justify-center font-black">
                <ArrowLeft size={12} className="stroke-[3]" />
              </div>
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-[#24A148] border-b-2 border-[#16803C] shadow-xs text-white flex items-center justify-center font-black">
                <ArrowDown size={12} className="stroke-[3]" />
              </div>
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-[#24A148] border-b-2 border-[#16803C] shadow-xs text-white flex items-center justify-center font-black">
                <ArrowRight size={12} className="stroke-[3]" />
              </div>
            </div>
          </div>

          <span className="text-[10px] sm:text-xs font-extrabold text-[#9A6230]">atau</span>

          {/* WASD Keys Cluster */}
          <div className="flex flex-col items-center gap-0.5">
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-[#24A148] border-b-2 border-[#16803C] shadow-xs text-white flex items-center justify-center font-black text-[10px] sm:text-xs leading-none">
              W
            </div>
            <div className="flex gap-0.5">
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-[#24A148] border-b-2 border-[#16803C] shadow-xs text-white flex items-center justify-center font-black text-[10px] sm:text-xs leading-none">
                A
              </div>
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-[#24A148] border-b-2 border-[#16803C] shadow-xs text-white flex items-center justify-center font-black text-[10px] sm:text-xs leading-none">
                S
              </div>
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-[#24A148] border-b-2 border-[#16803C] shadow-xs text-white flex items-center justify-center font-black text-[10px] sm:text-xs leading-none">
                D
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Swipe Hint */}
        <div className="flex items-center gap-1.5 bg-[#F2E5CE]/80 border border-[#DEBE93] rounded-xl px-2 py-1 max-w-[200px]">
          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#FFC928] text-[#8A5422] flex items-center justify-center shrink-0 shadow-xs">
            <Hand size={12} className="fill-current" />
          </div>
          <span className="text-[9px] sm:text-[10px] font-bold text-[#6F3E16] leading-tight">
            Geser layar untuk bergerak (di mobile)
          </span>
        </div>
      </div>
    </div>
  );
};
