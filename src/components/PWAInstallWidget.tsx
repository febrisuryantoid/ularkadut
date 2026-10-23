import React from 'react';
import {
  Download,
  X,
  Share,
  PlusSquare,
  MoreVertical,
  MonitorSmartphone,
  ArrowLeft,
} from 'lucide-react';
import { PWAPlatform, PWABrowser } from '../hooks/usePWAInstall';
import { soundManager } from '../utils/audio';

export interface PWAInstallWidgetProps {
  visible: boolean;
  isPrompting: boolean;
  showManualInstructions: boolean;
  platform: PWAPlatform;
  browser: PWABrowser;
  onInstallNow: () => void;
  onDismiss: () => void;
  onBackFromInstructions: () => void;
}

export const PWAInstallWidget: React.FC<PWAInstallWidgetProps> = ({
  visible,
  isPrompting,
  showManualInstructions,
  platform,
  browser,
  onInstallNow,
  onDismiss,
  onBackFromInstructions,
}) => {
  if (!visible) {
    return null;
  }

  const handleInstallClick = () => {
    soundManager.playMenuClick();
    onInstallNow();
  };

  const handleDismissClick = () => {
    soundManager.playMenuClick();
    onDismiss();
  };

  const handleBackClick = () => {
    soundManager.playMenuClick();
    onBackFromInstructions();
  };

  return (
    <aside
      role="region"
      aria-label="Instal Ular Kadut"
      className="fixed z-40 left-[max(0.5rem,env(safe-area-inset-left,0px))] right-[max(0.5rem,env(safe-area-inset-right,0px))] bottom-[max(0.5rem,env(safe-area-inset-bottom,0px))] md:left-auto md:right-[max(1rem,env(safe-area-inset-right,0px))] md:bottom-[max(1rem,env(safe-area-inset-bottom,0px))] md:w-[376px] max-w-full pointer-events-none flex justify-center md:justify-end"
    >
      <div className="pointer-events-auto w-full max-w-[440px] md:max-w-[376px] rounded-2xl bg-white/95 backdrop-blur-md border border-[#DCE7D7] shadow-[0_10px_28px_rgba(16,42,22,0.15),0_2px_6px_rgba(36,161,72,0.1)] px-3 py-2.5 sm:p-3.5 text-[#203126] animate-in fade-in slide-in-from-bottom-3 duration-200 overflow-hidden">
        {!showManualInstructions ? (
          <div className="flex flex-col gap-2 sm:gap-2.5">
            {/* Header Row: App Icon, Title, Short Description & Close Button */}
            <div className="flex items-start justify-between gap-2.5 min-w-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#F2F8EE] border border-[#BBF7D0] p-1 flex items-center justify-center shrink-0 shadow-2xs">
                  <img
                    src="/pwa-192x192.png"
                    alt="Ikon Ular Kadut"
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (!target.src.endsWith('/icon.svg')) {
                        target.src = '/icon.svg';
                      }
                    }}
                    className="w-full h-full object-contain rounded-lg select-none pointer-events-none"
                  />
                </div>
                <div className="min-w-0">
                  <h2 className="text-[13px] sm:text-[15px] font-black text-[#143018] leading-tight truncate">
                    Instal Ular Kadut
                  </h2>
                  <p className="text-[11px] sm:text-[12px] font-semibold text-[#526650] leading-snug mt-0.5 line-clamp-2">
                    Main lebih praktis langsung dari perangkatmu.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleDismissClick}
                aria-label="Tutup ajakan instalasi"
                className="w-7 h-7 rounded-lg text-[#657467] hover:text-[#203126] hover:bg-[#EEF5E7] flex items-center justify-center shrink-0 cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Action Buttons: NANTI & INSTAL SEKARANG */}
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={handleDismissClick}
                className="h-8 sm:h-9 px-3 sm:px-3.5 rounded-xl bg-[#F4F9F0] hover:bg-[#E7F1E0] border border-[#DCE7D7] text-[#425445] font-extrabold text-[11px] sm:text-xs tracking-wide uppercase cursor-pointer transition-colors shrink-0"
              >
                NANTI
              </button>

              <button
                type="button"
                onClick={handleInstallClick}
                disabled={isPrompting}
                className="flex-1 sm:flex-initial h-8 sm:h-9 px-3.5 sm:px-4 rounded-xl bg-gradient-to-r from-[#24A148] to-[#16803C] hover:from-[#22C55E] hover:to-[#15803D] active:translate-y-0.5 text-white border border-[#14532D] shadow-[0_2px_0_#0D471E] font-black text-[11px] sm:text-xs tracking-wide uppercase flex items-center justify-center gap-1.5 cursor-pointer transition-all disabled:opacity-60 whitespace-nowrap min-w-0"
              >
                <Download className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">
                  {isPrompting ? 'MEMPROSES...' : 'INSTAL SEKARANG'}
                </span>
              </button>
            </div>
          </div>
        ) : (
          /* Manual Installation Instructions Fallback */
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2 min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <img
                  src="/pwa-192x192.png"
                  alt="Ikon Ular Kadut"
                  className="w-6 h-6 rounded-lg border border-[#BBF7D0] shrink-0"
                />
                <h2 className="text-[12px] sm:text-[14px] font-black text-[#143018] truncate">
                  Instal Ular Kadut Manual
                </h2>
              </div>
              <button
                type="button"
                onClick={handleDismissClick}
                aria-label="Tutup panduan instalasi"
                className="w-6 h-6 rounded-lg text-[#657467] hover:text-[#203126] hover:bg-[#EEF5E7] flex items-center justify-center shrink-0 cursor-pointer transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {platform === 'ios' ? (
              <div className="rounded-xl bg-[#F7FAF2] border border-[#DCE7D7] px-2.5 py-2 text-[11px] text-[#203126] space-y-1">
                <div className="flex items-center gap-2 font-semibold">
                  <span className="w-4 h-4 rounded-full bg-[#24A148] text-white text-[9px] font-black flex items-center justify-center shrink-0">
                    1
                  </span>
                  <span className="flex items-center gap-1 flex-wrap">
                    Ketuk ikon <Share className="w-3 h-3 text-[#16803C] inline shrink-0" />{' '}
                    <strong>Bagikan</strong> di menu browser.
                  </span>
                </div>
                <div className="flex items-center gap-2 font-semibold">
                  <span className="w-4 h-4 rounded-full bg-[#24A148] text-white text-[9px] font-black flex items-center justify-center shrink-0">
                    2
                  </span>
                  <span className="flex items-center gap-1 flex-wrap">
                    Pilih <PlusSquare className="w-3 h-3 text-[#16803C] inline shrink-0" />{' '}
                    <strong>Tambah ke Layar Utama</strong>.
                  </span>
                </div>
              </div>
            ) : platform === 'android' ? (
              <div className="rounded-xl bg-[#F7FAF2] border border-[#DCE7D7] px-2.5 py-2 text-[11px] text-[#203126] space-y-1">
                <div className="flex items-center gap-2 font-semibold">
                  <span className="w-4 h-4 rounded-full bg-[#24A148] text-white text-[9px] font-black flex items-center justify-center shrink-0">
                    1
                  </span>
                  <span className="flex items-center gap-1 flex-wrap">
                    Buka <MoreVertical className="w-3 h-3 text-[#16803C] inline shrink-0" />{' '}
                    <strong>Menu Browser</strong> di pojok layar.
                  </span>
                </div>
                <div className="flex items-center gap-2 font-semibold">
                  <span className="w-4 h-4 rounded-full bg-[#24A148] text-white text-[9px] font-black flex items-center justify-center shrink-0">
                    2
                  </span>
                  <span>
                    Ketuk <strong>Instal aplikasi</strong> atau{' '}
                    <strong>Tambahkan ke Layar utama</strong>.
                  </span>
                </div>
              </div>
            ) : (
              <div className="rounded-xl bg-[#F7FAF2] border border-[#DCE7D7] px-2.5 py-2 text-[11px] text-[#203126] space-y-1">
                <div className="flex items-center gap-2 font-semibold">
                  <span className="w-4 h-4 rounded-full bg-[#24A148] text-white text-[9px] font-black flex items-center justify-center shrink-0">
                    1
                  </span>
                  <span className="flex items-center gap-1 flex-wrap">
                    Klik ikon{' '}
                    <MonitorSmartphone className="w-3 h-3 text-[#16803C] inline shrink-0" />{' '}
                    <strong>Instal</strong> di bilah alamat{' '}
                    {browser === 'safari' ? 'atau menu File/Bagikan' : 'atau menu browser (⋮)'}.
                  </span>
                </div>
                <div className="flex items-center gap-2 font-semibold">
                  <span className="w-4 h-4 rounded-full bg-[#24A148] text-white text-[9px] font-black flex items-center justify-center shrink-0">
                    2
                  </span>
                  <span>
                    Pilih{' '}
                    <strong>
                      {browser === 'safari' ? 'Tambah ke Dock' : 'Instal Ular Kadut'}
                    </strong>
                    .
                  </span>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={handleBackClick}
                className="h-8 px-2.5 rounded-xl bg-[#F4F9F0] hover:bg-[#E7F1E0] border border-[#DCE7D7] text-[#425445] font-extrabold text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>KEMBALI</span>
              </button>

              <button
                type="button"
                onClick={handleDismissClick}
                className="h-8 px-3.5 rounded-xl bg-[#24A148] hover:bg-[#16803C] text-white font-black text-[11px] tracking-wide uppercase cursor-pointer transition-colors"
              >
                NANTI
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
