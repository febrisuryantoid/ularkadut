import React, { useState, useEffect } from 'react';
import {
  X,
  Coins,
  Gift,
  Clock,
  Calendar,
  Target,
  Award,
  Check,
  Sparkles,
} from 'lucide-react';
import { PlayerEconomyState } from '../game/gameTypes';
import { GAME_CONFIG } from '../game/gameConfig';
import {
  canClaimDailyStreakToday,
  formatCountdownMMSS,
  getAchievements,
  getDailyMissions,
  getNextDailyStreakDay,
} from '../game/economyManager';

interface RewardsHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  economy: PlayerEconomyState;
  hourlyRemainingMs: number;
  onClaimHourly: () => { success: boolean; reward: number };
  onClaimDailyStreak: () => { success: boolean; reward: number; dayNumber: number };
  onClaimMission: (missionId: string) => { success: boolean; reward: number };
  onClaimAchievement: (achievementId: string) => { success: boolean; reward: number };
}

export const RewardsHubModal: React.FC<RewardsHubModalProps> = ({
  isOpen,
  onClose,
  economy,
  hourlyRemainingMs,
  onClaimHourly,
  onClaimDailyStreak,
  onClaimMission,
  onClaimAchievement,
}) => {
  const [activeTab, setActiveTab] = useState<'bonus' | 'missions' | 'achievements'>('bonus');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

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

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    window.setTimeout(() => {
      setToastMsg((prev) => (prev === msg ? null : prev));
    }, 2600);
  };

  const isHourlyReady = hourlyRemainingMs <= 0;
  const canClaimDaily = canClaimDailyStreakToday(economy);
  const nextDailyDay = getNextDailyStreakDay(economy);
  const missions = getDailyMissions(economy);
  const achievements = getAchievements(economy);

  const readyBonusCount = (isHourlyReady ? 1 : 0) + (canClaimDaily ? 1 : 0);
  const readyMissionsCount = missions.filter((m) => m.current >= m.target && !m.claimed).length;
  const readyAchCount = achievements.filter((a) => a.current >= a.target && !a.claimed).length;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Pusat Hadiah"
      onClick={onClose}
      className="fixed inset-0 z-50 bg-stone-950/45 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-150 select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl max-h-[88dvh] glass-panel rounded-3xl shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Ultra-Compact Header + Integrated Navigation Tabs */}
        <div className="px-3 sm:px-4 py-2.5 bg-white/55 border-b border-white/70 flex flex-col gap-2 shrink-0">
          <div className="flex items-center justify-between gap-2">
            {/* Brand Title */}
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-b from-[#F59E0B] to-[#D97706] text-white flex items-center justify-center shadow-2xs border border-[#92400E] shrink-0">
                <Gift className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm sm:text-base font-black text-[#143018] tracking-tight leading-none truncate">
                  PUSAT HADIAH
                </h2>
                <span className="text-[10px] font-bold text-[#526650] block mt-0.5 leading-none">
                  Koin Gratis & Tantangan
                </span>
              </div>
            </div>

            {/* Inline Tabs on Desktop/Tablet (sm+) */}
            <div className="hidden sm:grid grid-cols-3 gap-1 bg-black/10 p-1 rounded-xl border border-white/60">
              <button
                type="button"
                onClick={() => setActiveTab('bonus')}
                className={`h-7 px-2.5 rounded-lg font-black text-[11px] uppercase tracking-tight flex items-center justify-center gap-1 cursor-pointer transition-all ${
                  activeTab === 'bonus'
                    ? 'bg-[#24A148] text-white shadow-2xs'
                    : 'text-[#203126] hover:bg-white/70'
                }`}
              >
                <Calendar size={12} />
                <span>Bonus</span>
                {readyBonusCount > 0 && (
                  <span className="min-w-[15px] h-[15px] px-1 rounded-full bg-[#FACC15] text-[#451A03] text-[9px] font-black flex items-center justify-center tabular-nums">
                    {readyBonusCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('missions')}
                className={`h-7 px-2.5 rounded-lg font-black text-[11px] uppercase tracking-tight flex items-center justify-center gap-1 cursor-pointer transition-all ${
                  activeTab === 'missions'
                    ? 'bg-[#24A148] text-white shadow-2xs'
                    : 'text-[#203126] hover:bg-white/70'
                }`}
              >
                <Target size={12} />
                <span>Misi</span>
                {readyMissionsCount > 0 && (
                  <span className="min-w-[15px] h-[15px] px-1 rounded-full bg-[#FACC15] text-[#451A03] text-[9px] font-black flex items-center justify-center tabular-nums">
                    {readyMissionsCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('achievements')}
                className={`h-7 px-2.5 rounded-lg font-black text-[11px] uppercase tracking-tight flex items-center justify-center gap-1 cursor-pointer transition-all ${
                  activeTab === 'achievements'
                    ? 'bg-[#24A148] text-white shadow-2xs'
                    : 'text-[#203126] hover:bg-white/70'
                }`}
              >
                <Award size={12} />
                <span>Trofi</span>
                {readyAchCount > 0 && (
                  <span className="min-w-[15px] h-[15px] px-1 rounded-full bg-[#FACC15] text-[#451A03] text-[9px] font-black flex items-center justify-center tabular-nums">
                    {readyAchCount}
                  </span>
                )}
              </button>
            </div>

            {/* Right Balance & Close */}
            <div className="flex items-center gap-1.5 shrink-0">
              <div className="h-8 px-2.5 rounded-xl bg-[#FFFBEB] border-2 border-[#D97706] flex items-center gap-1 shadow-2xs">
                <Coins className="w-3.5 h-3.5 text-[#B45309] fill-[#F59E0B] shrink-0" />
                <span className="text-xs sm:text-sm font-black text-[#451A03] tabular-nums">
                  {economy.coins}
                </span>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-xl bg-white/80 hover:bg-white text-[#526650] hover:text-[#143018] border border-white flex items-center justify-center cursor-pointer transition-colors"
                aria-label="Tutup Hadiah"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Segmented Navigation Bar on Mobile (< sm) */}
          <div className="grid sm:hidden grid-cols-3 gap-1 bg-black/10 p-1 rounded-xl border border-white/60">
            <button
              type="button"
              onClick={() => setActiveTab('bonus')}
              className={`h-7 px-2 rounded-lg font-black text-[11px] uppercase tracking-tight flex items-center justify-center gap-1 cursor-pointer transition-all ${
                activeTab === 'bonus'
                  ? 'bg-[#24A148] text-white shadow-2xs'
                  : 'text-[#203126] hover:bg-white/70'
              }`}
            >
              <Calendar size={12} className="shrink-0" />
              <span className="truncate">Bonus</span>
              {readyBonusCount > 0 && (
                <span className="min-w-[14px] h-[14px] px-1 rounded-full bg-[#FACC15] text-[#451A03] text-[9px] font-black flex items-center justify-center tabular-nums shrink-0">
                  {readyBonusCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('missions')}
              className={`h-7 px-2 rounded-lg font-black text-[11px] uppercase tracking-tight flex items-center justify-center gap-1 cursor-pointer transition-all ${
                activeTab === 'missions'
                  ? 'bg-[#24A148] text-white shadow-2xs'
                  : 'text-[#203126] hover:bg-white/70'
              }`}
            >
              <Target size={12} className="shrink-0" />
              <span className="truncate">Misi</span>
              {readyMissionsCount > 0 && (
                <span className="min-w-[14px] h-[14px] px-1 rounded-full bg-[#FACC15] text-[#451A03] text-[9px] font-black flex items-center justify-center tabular-nums shrink-0">
                  {readyMissionsCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('achievements')}
              className={`h-7 px-2 rounded-lg font-black text-[11px] uppercase tracking-tight flex items-center justify-center gap-1 cursor-pointer transition-all ${
                activeTab === 'achievements'
                  ? 'bg-[#24A148] text-white shadow-2xs'
                  : 'text-[#203126] hover:bg-white/70'
              }`}
            >
              <Award size={12} className="shrink-0" />
              <span className="truncate">Trofi</span>
              {readyAchCount > 0 && (
                <span className="min-w-[14px] h-[14px] px-1 rounded-full bg-[#FACC15] text-[#451A03] text-[9px] font-black flex items-center justify-center tabular-nums shrink-0">
                  {readyAchCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Compact Toast Feedback */}
        {toastMsg && (
          <div className="mx-3 sm:mx-4 mt-2 px-3 py-1.5 rounded-xl bg-emerald-100/95 border border-emerald-400 text-emerald-950 text-xs font-extrabold flex items-center justify-center gap-1.5 shrink-0">
            <Sparkles size={13} className="text-emerald-700 shrink-0" />
            <span className="truncate">{toastMsg}</span>
          </div>
        )}

        {/* Proportional & Concise Content Body */}
        <div className="p-3 sm:p-4 overflow-y-auto space-y-2.5">
          {activeTab === 'bonus' && (
            <div className="space-y-2.5">
              {/* 1. Compact Single-Row Hourly Free Coin Bonus */}
              <div className="glass-card rounded-2xl p-2.5 sm:p-3 flex items-center justify-between gap-2.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#FFFBEB] border border-[#F59E0B] text-[#D97706] flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-xs sm:text-sm font-black text-[#143018] truncate">
                        Koin Gratis Tiap Jam
                      </h3>
                      <span className="text-[10px] font-black text-[#B45309] tabular-nums shrink-0">
                        · +{GAME_CONFIG.HOURLY_BONUS_COINS}
                      </span>
                    </div>
                    <p className="text-[11px] font-semibold text-[#526650] truncate">
                      {isHourlyReady
                        ? 'Peti koin penuh, siap diklaim!'
                        : `Tersedia dalam ${formatCountdownMMSS(hourlyRemainingMs)}`}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={!isHourlyReady}
                  onClick={() => {
                    const res = onClaimHourly();
                    if (res.success) {
                      triggerToast(`+${res.reward} Koin Gratis berhasil diklaim!`);
                    }
                  }}
                  className={`h-9 px-3.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1 border shrink-0 transition-all ${
                    isHourlyReady
                      ? 'btn-shining-cta-yellow bg-gradient-to-r from-[#FACC15] via-[#F59E0B] to-[#D97706] text-[#451A03] border-[#92400E] cursor-pointer active:scale-95'
                      : 'bg-white/60 text-stone-400 border-stone-200 cursor-not-allowed tabular-nums'
                  }`}
                >
                  <Coins size={13} className="shrink-0" />
                  <span>
                    {isHourlyReady
                      ? `Klaim +${GAME_CONFIG.HOURLY_BONUS_COINS}`
                      : formatCountdownMMSS(hourlyRemainingMs)}
                  </span>
                </button>
              </div>

              {/* 2. Ultra-Neat 7-Day Login Streak (1 Single Row of 7 Days on All Devices) */}
              <div className="glass-card rounded-2xl p-2.5 sm:p-3 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="text-xs sm:text-sm font-black text-[#143018] leading-tight">
                      STREAK LOGIN 7 HARI
                    </h3>
                    <p className="text-[10px] sm:text-[11px] font-semibold text-[#526650] truncate">
                      Login rutin untuk hadiah berlipat hingga Hari ke-7
                    </p>
                  </div>
                  <span className="text-[11px] font-black text-[#15803D] tabular-nums shrink-0">
                    Hari {nextDailyDay}/7
                  </span>
                </div>

                {/* 7-Column Proportional Strip (Fits 1 Row on Mobile & Desktop) */}
                <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
                  {GAME_CONFIG.DAILY_STREAK_REWARDS.map((reward, idx) => {
                    const dayNum = idx + 1;
                    const isPastClaimed =
                      (!canClaimDaily && dayNum <= economy.dailyStreak.streakCount) ||
                      (canClaimDaily && dayNum < nextDailyDay);
                    const isCurrentTarget = canClaimDaily && dayNum === nextDailyDay;

                    return (
                      <div
                        key={dayNum}
                        className={`py-1.5 px-0.5 sm:p-2 rounded-xl border text-center flex flex-col items-center justify-between gap-0.5 min-w-0 transition-all ${
                          isCurrentTarget
                            ? 'bg-[#FFFBEB] border-[#F59E0B] ring-2 ring-[#F59E0B]/35 shadow-2xs'
                            : isPastClaimed
                              ? 'bg-[#DCFCE7]/80 border-[#22C55E]/60'
                              : 'bg-white/75 border-white'
                        }`}
                      >
                        <span className="text-[9px] sm:text-[10px] font-black uppercase text-[#526650] leading-none">
                          H{dayNum}
                        </span>
                        {isPastClaimed ? (
                          <div className="w-4 h-4 rounded-full bg-[#22C55E] text-white flex items-center justify-center my-0.5">
                            <Check size={10} className="stroke-[3]" />
                          </div>
                        ) : (
                          <Coins
                            size={14}
                            className={`my-0.5 ${
                              isCurrentTarget
                                ? 'text-[#D97706] fill-[#FACC15]'
                                : 'text-[#B45309]/80 fill-[#FDE047]/70'
                            }`}
                          />
                        )}
                        <span
                          className={`text-[9px] sm:text-[11px] font-black tabular-nums leading-none ${
                            isPastClaimed ? 'text-[#15803D]' : 'text-[#143018]'
                          }`}
                        >
                          +{reward}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <button
                  type="button"
                  disabled={!canClaimDaily}
                  onClick={() => {
                    const res = onClaimDailyStreak();
                    if (res.success) {
                      triggerToast(
                        `Streak Hari ke-${res.dayNumber} diklaim! +${res.reward} Koin!`
                      );
                    }
                  }}
                  className={`w-full h-9 sm:h-10 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 border transition-all ${
                    canClaimDaily
                      ? 'btn-shining-cta bg-gradient-to-r from-[#22C55E] via-[#16A34A] to-[#15803D] text-white border-[#14532D] cursor-pointer active:scale-98'
                      : 'bg-white/65 text-[#526650] border-white cursor-not-allowed'
                  }`}
                >
                  {canClaimDaily ? (
                    <>
                      <Gift size={14} />
                      <span>
                        Klaim Hari ke-{nextDailyDay} (+
                        {GAME_CONFIG.DAILY_STREAK_REWARDS[nextDailyDay - 1]} Koin)
                      </span>
                    </>
                  ) : (
                    <>
                      <Check size={14} className="text-[#16A34A] stroke-[3]" />
                      <span>Bonus Harian Sudah Diklaim</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'missions' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {missions.map((m) => {
                const isDone = m.current >= m.target;
                const pct = Math.min(100, Math.round((m.current / m.target) * 100));
                return (
                  <div
                    key={m.id}
                    className="glass-card rounded-2xl p-2.5 sm:p-3 flex items-center justify-between gap-2.5"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1.5">
                        <h4 className="text-xs sm:text-[13px] font-black text-[#143018] truncate">
                          {m.title}
                        </h4>
                        <span className="text-[11px] font-black text-[#B45309] flex items-center gap-0.5 shrink-0 tabular-nums">
                          <Coins size={11} className="fill-[#FACC15] text-[#D97706]" />+
                          {m.rewardCoins}
                        </span>
                      </div>
                      <p className="text-[10px] sm:text-[11px] font-semibold text-[#526650] truncate mt-0.5">
                        {m.description}
                      </p>
                      <div className="mt-1.5 flex items-center gap-1.5">
                        <div className="flex-1 h-1.5 bg-black/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#22C55E] transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-black text-[#143018] tabular-nums shrink-0">
                          {m.current}/{m.target}
                        </span>
                      </div>
                    </div>

                    {m.claimed ? (
                      <span className="h-8 px-2.5 rounded-xl bg-[#DCFCE7]/90 border border-[#86EFAC] text-[#15803D] font-black text-[10px] uppercase flex items-center gap-1 shrink-0">
                        <Check size={12} className="stroke-[3]" /> Selesai
                      </span>
                    ) : (
                      <button
                        type="button"
                        disabled={!isDone}
                        onClick={() => {
                          const res = onClaimMission(m.id);
                          if (res.success) {
                            triggerToast(`Misi selesai! +${res.reward} Koin!`);
                          }
                        }}
                        className={`h-8 px-3 rounded-xl font-black text-[11px] uppercase tracking-wider shrink-0 border transition-all ${
                          isDone
                            ? 'btn-shining-cta-yellow bg-gradient-to-r from-[#FACC15] to-[#F59E0B] text-[#451A03] border-[#D97706] cursor-pointer active:scale-95'
                            : 'bg-white/60 text-stone-400 border-stone-200 cursor-not-allowed'
                        }`}
                      >
                        {isDone ? 'Klaim' : 'Proses'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'achievements' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {achievements.map((a) => {
                const isDone = a.current >= a.target;
                const pct = Math.min(100, Math.round((a.current / a.target) * 100));
                return (
                  <div
                    key={a.id}
                    className="glass-card rounded-2xl p-2.5 sm:p-3 flex items-center justify-between gap-2.5"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1.5">
                        <h4 className="text-xs sm:text-[13px] font-black text-[#143018] truncate">
                          {a.title}
                        </h4>
                        <span className="text-[11px] font-black text-[#B45309] flex items-center gap-0.5 shrink-0 tabular-nums">
                          <Coins size={11} className="fill-[#FACC15] text-[#D97706]" />+
                          {a.rewardCoins}
                        </span>
                      </div>
                      <p className="text-[10px] sm:text-[11px] font-semibold text-[#526650] truncate mt-0.5">
                        {a.description}
                      </p>
                      <div className="mt-1.5 flex items-center gap-1.5">
                        <div className="flex-1 h-1.5 bg-black/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#F59E0B] transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-black text-[#143018] tabular-nums shrink-0">
                          {a.current}/{a.target}
                        </span>
                      </div>
                    </div>

                    {a.claimed ? (
                      <span className="h-8 px-2.5 rounded-xl bg-[#DCFCE7]/90 border border-[#86EFAC] text-[#15803D] font-black text-[10px] uppercase flex items-center gap-1 shrink-0">
                        <Check size={12} className="stroke-[3]" /> Selesai
                      </span>
                    ) : (
                      <button
                        type="button"
                        disabled={!isDone}
                        onClick={() => {
                          const res = onClaimAchievement(a.id);
                          if (res.success) {
                            triggerToast(`Trofi terbuka! +${res.reward} Koin!`);
                          }
                        }}
                        className={`h-8 px-3 rounded-xl font-black text-[11px] uppercase tracking-wider shrink-0 border transition-all ${
                          isDone
                            ? 'btn-shining-cta-yellow bg-gradient-to-r from-[#FACC15] to-[#F59E0B] text-[#451A03] border-[#D97706] cursor-pointer active:scale-95'
                            : 'bg-white/60 text-stone-400 border-stone-200 cursor-not-allowed'
                        }`}
                      >
                        {isDone ? 'Klaim' : 'Terkunci'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
