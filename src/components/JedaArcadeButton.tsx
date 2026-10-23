import React from 'react';
import { Pause, Play } from 'lucide-react';

interface JedaArcadeButtonProps {
  isPaused: boolean;
  disabled?: boolean;
  onTogglePause: () => void;
  size?: 'normal' | 'compact';
  className?: string;
}

export const JedaArcadeButton: React.FC<JedaArcadeButtonProps> = ({
  isPaused,
  disabled = false,
  onTogglePause,
  size = 'normal',
  className = '',
}) => {
  const isCompact = size === 'compact';

  return (
    <div className={`flex flex-col items-center justify-center select-none ${className}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={onTogglePause}
        aria-label={isPaused ? 'Lanjutkan Permainan' : 'Jeda Permainan'}
        title={isPaused ? 'Lanjutkan (Spasi / P)' : 'Jeda (Spasi / P)'}
        className={`relative group flex flex-col items-center justify-center transition-all ${
          disabled ? 'opacity-45 cursor-not-allowed' : 'cursor-pointer active:translate-y-1'
        }`}
      >
        {/* Outer Stone Pedestal Base */}
        <div
          className={`${
            isCompact ? 'w-16 h-16' : 'w-24 h-24 xl:w-28 xl:h-28'
          } rounded-full bg-gradient-to-b from-[#DCE6D5] to-[#8C9E83] p-1.5 shadow-[0_8px_18px_rgba(20,40,22,0.3),0_3px_0_#5E7155] border-2 border-[#6B7F62] flex items-center justify-center`}
        >
          {/* Inner 3D Tactile Button Cap */}
          <div
            className={`w-full h-full rounded-full flex flex-col items-center justify-center transition-transform border-2 ${
              isPaused
                ? 'bg-gradient-to-b from-[#FFE066] via-[#FFC928] to-[#E09F00] border-[#FFF3B0] shadow-[inset_0_3px_6px_rgba(255,255,255,0.8),0_3px_0_#B37B00]'
                : 'bg-gradient-to-b from-[#F8FBF6] via-[#E3EDE0] to-[#C5D6BF] border-white shadow-[inset_0_3px_6px_rgba(255,255,255,0.9),0_3px_0_#7A8F70]'
            }`}
          >
            {isPaused ? (
              <Play
                className={`${
                  isCompact ? 'w-5 h-5' : 'w-7 h-7 xl:w-8 xl:h-8'
                } text-[#5A3E00] fill-[#5A3E00] drop-shadow-xs`}
              />
            ) : (
              <Pause
                className={`${
                  isCompact ? 'w-5 h-5' : 'w-7 h-7 xl:w-8 xl:h-8'
                } text-[#2D4232] fill-[#2D4232] drop-shadow-xs`}
              />
            )}
            <span
              className={`mt-0.5 font-black ${
                isCompact ? 'text-[9px]' : 'text-[11px] xl:text-xs'
              } tracking-wider uppercase ${
                isPaused ? 'text-[#5A3E00]' : 'text-[#2D4232]'
              }`}
            >
              {isPaused ? 'LANJUT' : 'JEDA'}
            </span>
          </div>
        </div>
      </button>
    </div>
  );
};
