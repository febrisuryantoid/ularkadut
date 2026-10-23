import React, { useEffect } from 'react';
import { X, Sparkles, Apple, Flame } from 'lucide-react';
import { KontrolPanel } from './KontrolPanel';
import { TujuanPanel } from './TujuanPanel';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Petunjuk Bermain"
      onClick={onClose}
      className="fixed inset-0 z-50 bg-stone-900/45 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl bg-white border-2 border-[#DCE7D7] rounded-3xl p-4 sm:p-6 shadow-2xl relative text-left max-h-[90dvh] overflow-y-auto"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3.5 right-3.5 w-9 h-9 rounded-xl bg-[#EEF5E7] text-[#657467] hover:text-[#203126] hover:bg-[#DCE7D7] flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Tutup Petunjuk"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-2.5 mb-4 pr-10">
          <img
            src="/assets/aistudio/Ular_Kadut_Logo_5be163da.png"
            alt="Logo Ular Kadut"
            className="h-8 sm:h-9 w-auto object-contain drop-shadow-xs select-none pointer-events-none"
          />
          <h2 className="text-base sm:text-lg font-black text-[#203126] tracking-tight">
            PANDUAN & ATURAN BERMAIN
          </h2>
        </div>

        <div className="space-y-3.5 text-xs sm:text-sm text-[#203126]">
          {/* Widget Kontrol & Tujuan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-stretch">
            <KontrolPanel className="w-full h-full flex flex-col justify-between" />
            <TujuanPanel className="w-full h-full flex flex-col justify-between" />
          </div>

          {/* 3 Tingkat Kesulitan */}
          <div className="p-3 bg-[#EEF5E7] border border-[#DCE7D7] rounded-2xl space-y-2">
            <strong className="text-[#203126] block font-extrabold">3 Tingkat Kesulitan:</strong>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <div className="p-2.5 bg-white rounded-xl border border-[#DCE7D7]">
                <span className="font-black text-[#24A148] block">Mudah</span>
                <span className="text-[#657467]">Tanpa rintangan batu, arena bersih & santai.</span>
              </div>
              <div className="p-2.5 bg-white rounded-xl border border-[#DCE7D7]">
                <span className="font-black text-[#FF8A24] block">Sedang</span>
                <span className="text-[#657467]">Beberapa pilar batu kuno tersebar di arena.</span>
              </div>
              <div className="p-2.5 bg-white rounded-xl border border-[#DCE7D7]">
                <span className="font-black text-[#D9364F] block">Sulit</span>
                <span className="text-[#657467]">Banyak pilar rintangan batu di arena!</span>
              </div>
            </div>
          </div>

          {/* Variasi Ukuran Buah & Pertumbuhan */}
          <div className="p-3 bg-[#FFF9E6] border border-[#FFC928]/50 rounded-2xl space-y-2">
            <strong className="text-[#203126] block font-extrabold">Variasi Buah & Pertumbuhan:</strong>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <div className="p-2.5 bg-white rounded-xl border border-[#DCE7D7]">
                <div className="flex items-center gap-1 font-black text-[#D9364F]">
                  <Apple size={14} /> <span>Apel Merah (1x)</span>
                </div>
                <span className="text-[#657467] block mt-0.5">+10 Poin • Tumbuh +1 Segmen</span>
              </div>
              <div className="p-2.5 bg-white rounded-xl border border-[#DCE7D7]">
                <div className="flex items-center gap-1 font-black text-[#D97706]">
                  <Flame size={14} /> <span>Mangga Emas (1.35x)</span>
                </div>
                <span className="text-[#657467] block mt-0.5">+25 Poin • Tumbuh +2 Segmen</span>
              </div>
              <div className="p-2.5 bg-white rounded-xl border border-[#DCE7D7]">
                <div className="flex items-center gap-1 font-black text-[#24A148]">
                  <Sparkles size={14} /> <span>Semangka Mega (1.8x)</span>
                </div>
                <span className="text-[#657467] block mt-0.5">+50 Poin • Tumbuh +3 Segmen</span>
              </div>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full py-3 bg-[#24A148] hover:bg-[#16803C] active:scale-98 text-white font-black text-sm rounded-2xl cursor-pointer text-center transition-all shadow-sm uppercase tracking-wider"
        >
          Tutup & Lanjut Main
        </button>
      </div>
    </div>
  );
};

