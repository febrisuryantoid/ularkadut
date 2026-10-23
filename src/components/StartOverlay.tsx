import React from 'react';
import {
  Play,
  Trophy,
  Lock,
  Star,
  Coins,
  Palette,
  Gift,
  Flame,
  Shield,
  Zap,
  Flag,
  Sparkles,
  Crown,
} from 'lucide-react';
import { DifficultyLevel, PlayerEconomyState, SnakeSkinId } from '../game/gameTypes';
import { DIFFICULTY_INFO } from '../game/gameConfig';
import { LEVEL_PROGRESSION, getLevelConfig } from '../game/levelProgression';
import { resolveSkinConfig } from '../game/skinCatalog';

interface StartOverlayProps {
  difficulty: DifficultyLevel;
  currentLevel: number;
  onSelectDifficulty: (diff: DifficultyLevel) => void;
  onSelectLevel: (diff: DifficultyLevel, levelNumber: number) => void;
  snakeSkin: SnakeSkinId;
  economy: PlayerEconomyState;
  unclaimedRewardsCount: number;
  highScore: number;
  onStartGame: () => void;
  onOpenSkinShop: () => void;
  onOpenRewards: () => void;
  viewportMode?: 'landscape-wide' | 'landscape-compact' | 'portrait';
}

export const StartOverlay: React.FC<StartOverlayProps> = ({
  difficulty,
  currentLevel,
  onSelectDifficulty,
  onSelectLevel,
  snakeSkin,
  economy,
  unclaimedRewardsCount,
  highScore,
  onStartGame,
  onOpenSkinShop,
  onOpenRewards,
  viewportMode = 'landscape-wide',
}) => {
  const levels = LEVEL_PROGRESSION[difficulty] || LEVEL_PROGRESSION.easy;
  const maxUnlocked = economy.unlockedLevels[difficulty] || 1;
  const activeLevelCfg = getLevelConfig(difficulty, currentLevel);
  const activeSkin = resolveSkinConfig(snakeSkin, economy.customSkin);
  const levelKey = `${difficulty}-${currentLevel}`;
  const isClearedBefore = Boolean(economy.completedLevels[levelKey]);
  const rewardCoins = isClearedBefore
    ? activeLevelCfg.replayCoins
    : activeLevelCfg.firstClearCoins;

  const isLandscape = viewportMode === 'landscape-wide' || viewportMode === 'landscape-compact';
  const isCompactLandscape = viewportMode === 'landscape-compact';

  const difficultyOptions: {
    key: DifficultyLevel;
    icon: React.ReactNode;
    activeClass: string;
    selectedTileClass: string;
    ctaClass: string;
    badgeBg: string;
  }[] = [
    {
      key: 'easy',
      icon: (
        <Shield className="w-[clamp(11px,1.5vw,15px)] h-[clamp(11px,1.5vw,15px)] shrink-0" />
      ),
      activeClass:
        'bg-gradient-to-b from-[#34D399] via-[#16A34A] to-[#15803D] text-white border-[#14532D] shadow-[0_2px_0_#052E16,inset_0_1px_0_rgba(255,255,255,0.45)]',
      selectedTileClass:
        'bg-gradient-to-b from-[#22C55E] to-[#15803D] text-white border-[#14532D] shadow-[0_2px_0_#052E16]',
      ctaClass:
        'btn-shining-cta bg-gradient-to-r from-[#22C55E] via-[#16A34A] to-[#15803D] text-white border-[#14532D]',
      badgeBg: 'bg-[#DCFCE7]/90 text-[#166534] border-[#86EFAC]',
    },
    {
      key: 'medium',
      icon: (
        <Zap className="w-[clamp(11px,1.5vw,15px)] h-[clamp(11px,1.5vw,15px)] shrink-0" />
      ),
      activeClass:
        'bg-gradient-to-b from-[#FB923C] via-[#EA580C] to-[#C2410C] text-white border-[#7C2D12] shadow-[0_2px_0_#431407,inset_0_1px_0_rgba(255,255,255,0.45)]',
      selectedTileClass:
        'bg-gradient-to-b from-[#F97316] to-[#C2410C] text-white border-[#7C2D12] shadow-[0_2px_0_#431407]',
      ctaClass:
        'btn-shining-cta-yellow bg-gradient-to-r from-[#FB923C] via-[#EA580C] to-[#C2410C] text-white border-[#7C2D12]',
      badgeBg: 'bg-[#FFEDD5]/90 text-[#9A3412] border-[#FDBA74]',
    },
    {
      key: 'hard',
      icon: (
        <Flame className="w-[clamp(11px,1.5vw,15px)] h-[clamp(11px,1.5vw,15px)] shrink-0" />
      ),
      activeClass:
        'bg-gradient-to-b from-[#FB7185] via-[#E11D48] to-[#BE123C] text-white border-[#881337] shadow-[0_2px_0_#4C0519,inset_0_1px_0_rgba(255,255,255,0.4)]',
      selectedTileClass:
        'bg-gradient-to-b from-[#F43F5E] to-[#BE123C] text-white border-[#881337] shadow-[0_2px_0_#4C0519]',
      ctaClass:
        'btn-shining-cta-red bg-gradient-to-r from-[#FB7185] via-[#E11D48] to-[#BE123C] text-white border-[#881337]',
      badgeBg: 'bg-[#FFE4E6]/90 text-[#9F1239] border-[#FDA4AF]',
    },
  ];

  const currentDiffMeta =
    difficultyOptions.find((d) => d.key === difficulty) || difficultyOptions[0];

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-[clamp(4px,1vw,12px)] overflow-hidden">
      {/* =========================================================================
          LANDSCAPE VIEWPORT (Full-Width Desktop, Tablet Landscape, Mobile Landscape)
          Visual-First Gen Z / Gen Alpha Glassmorphism Console (20 Levels: 5x4 Grid)
         ========================================================================= */}
      {isLandscape ? (
        <div
          className={`w-full h-full max-w-[1440px] mx-auto glass-panel rounded-3xl ${
            isCompactLandscape
              ? 'p-2 gap-2'
              : 'p-[clamp(8px,1.5vw,20px)] gap-[clamp(8px,1.5vw,20px)]'
          } grid grid-cols-12 items-stretch animate-in fade-in zoom-in-95 duration-200 select-none overflow-hidden`}
        >
          {/* LEFT COLUMN (5 Cols): Logo, Auto-Responsive Mode Selector & Quick Hub */}
          <div className="col-span-5 flex flex-col justify-between gap-[clamp(6px,1.2vh,12px)] min-h-0 min-w-0">
            {/* 1. Brand Showcase + Compact Stat Pills + Auto-Scaling Difficulty Filter */}
            <div className="flex-1 min-h-0 glass-card rounded-2xl p-[clamp(8px,1.2vw,14px)] flex flex-col items-center justify-between text-center relative">
              <div className="w-full flex items-center justify-between gap-1.5 shrink-0">
                <div className="h-[clamp(24px,4.2vh,30px)] px-2.5 rounded-xl bg-white/85 border border-white text-[clamp(10px,1.1vw,12px)] font-black text-[#143018] flex items-center gap-1 shadow-2xs tabular-nums">
                  <Trophy className="w-3.5 h-3.5 text-[#D97706] fill-[#FACC15] shrink-0" />
                  <span>{highScore}</span>
                </div>

                <button
                  type="button"
                  onClick={onOpenRewards}
                  className="h-[clamp(24px,4.2vh,30px)] px-2.5 rounded-xl bg-[#FFFBEB]/95 hover:bg-[#FEF3C7] border border-[#F59E0B] text-[clamp(10px,1.1vw,12px)] font-black text-[#451A03] flex items-center gap-1 cursor-pointer transition-colors shadow-2xs tabular-nums"
                >
                  <Coins className="w-3.5 h-3.5 text-[#B45309] fill-[#F59E0B] shrink-0" />
                  <span>{economy.coins}</span>
                </button>
              </div>

              <img
                src="/assets/aistudio/Ular_Kadut_Logo_5be163da.png"
                alt="Ular Kadut"
                className="h-[clamp(30px,9.5vh,82px)] w-auto object-contain drop-shadow-[0_6px_12px_rgba(0,0,0,0.24)] select-none pointer-events-none my-auto shrink"
              />

              {/* Auto-Responsive Mode Selector (Mudah / Sedang / Sulit) — Zero Clipping */}
              <div className="w-full grid grid-cols-3 gap-[clamp(3px,0.6vw,6px)] bg-black/10 p-1.5 rounded-2xl border border-white/60 shrink-0">
                {difficultyOptions.map((opt) => {
                  const info = DIFFICULTY_INFO[opt.key];
                  const isSelected = difficulty === opt.key;
                  return (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => onSelectDifficulty(opt.key)}
                      className={`min-w-0 h-[clamp(28px,5vh,38px)] px-[clamp(3px,0.7vw,8px)] rounded-xl border font-black text-[clamp(9px,1.15vw,13px)] leading-none tracking-tight transition-all cursor-pointer flex items-center justify-center gap-[clamp(2px,0.4vw,5px)] whitespace-nowrap ${
                        isSelected
                          ? opt.activeClass
                          : 'bg-white/80 hover:bg-white text-[#203126] border-white/85'
                      }`}
                    >
                      {opt.icon}
                      <span className="leading-none">{info.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Visual Quick Hub: Skin Studio & Bonus Rewards */}
            <div className="grid grid-cols-2 gap-[clamp(6px,0.9vw,10px)] shrink-0">
              <button
                type="button"
                onClick={onOpenSkinShop}
                className="h-[clamp(38px,7vh,52px)] px-[clamp(6px,0.9vw,12px)] rounded-2xl glass-card hover:bg-white/80 flex items-center justify-between gap-1.5 text-left cursor-pointer transition-transform active:scale-98 min-w-0"
                aria-label="Skin Studio"
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="w-[clamp(24px,4vh,32px)] h-[clamp(24px,4vh,32px)] rounded-xl bg-[#FAF5FF] border border-[#C084FC] flex items-center justify-center shrink-0">
                    <Palette className="w-[clamp(12px,2vh,15px)] h-[clamp(12px,2vh,15px)] text-[#6D28D9]" />
                  </span>
                  <span className="text-[clamp(10px,1.1vw,13px)] font-black text-[#1E1B4B] truncate">
                    {activeSkin.name}
                  </span>
                </div>
                <span
                  className="w-[clamp(22px,3.8vh,30px)] h-[clamp(22px,3.8vh,30px)] rounded-full shrink-0 border-2 border-white shadow-sm flex items-center justify-center relative"
                  style={{
                    background: `radial-gradient(circle at 30% 30%, ${activeSkin.bellyColor}, ${activeSkin.bodyPrimary})`,
                  }}
                >
                  {(activeSkin.hasCrown || activeSkin.headgear === 'crown') && (
                    <Crown size={10} className="text-amber-300 fill-amber-300" />
                  )}
                  {activeSkin.isCustom && !activeSkin.hasCrown && (
                    <Sparkles size={10} className="text-white" />
                  )}
                </span>
              </button>

              <button
                type="button"
                onClick={onOpenRewards}
                className="relative h-[clamp(38px,7vh,52px)] px-[clamp(6px,0.9vw,12px)] rounded-2xl glass-card hover:bg-white/80 flex items-center justify-between gap-1.5 text-left cursor-pointer transition-transform active:scale-98 min-w-0"
              >
                <div className="min-w-0">
                  <span className="text-[clamp(8px,0.9vw,10px)] font-black uppercase tracking-wider text-[#B45309] flex items-center gap-1 leading-none">
                    <Gift size={11} className="shrink-0" /> HADIAH
                  </span>
                  <span className="text-[clamp(10px,1.1vw,13px)] font-black text-[#451A03] block truncate mt-0.5 leading-tight">
                    {unclaimedRewardsCount > 0 ? `${unclaimedRewardsCount} Klaim!` : 'Bonus Koin'}
                  </span>
                </div>
                <span className="w-[clamp(24px,4vh,32px)] h-[clamp(24px,4vh,32px)] rounded-xl bg-gradient-to-br from-[#FEF08A] to-[#F59E0B] border-2 border-white shadow-sm flex items-center justify-center shrink-0 relative">
                  <Gift className="w-[clamp(12px,2vh,15px)] h-[clamp(12px,2vh,15px)] text-[#78350F]" />
                  {unclaimedRewardsCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-[16px] px-1 rounded-full bg-[#E11D48] text-white font-black text-[9px] flex items-center justify-center tabular-nums">
                      {unclaimedRewardsCount}
                    </span>
                  )}
                </span>
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN (7 Cols): Visual 20-Level Grid (5x4) & Shining Start CTA */}
          <div className="col-span-7 glass-card rounded-2xl p-[clamp(8px,1.3vw,16px)] flex flex-col justify-between gap-[clamp(6px,1.2vh,12px)] min-h-0 min-w-0">
            {/* Compact Visual Header: Selected Level Badge + Target & Coin Pills */}
            <div className="flex items-center justify-between gap-2 shrink-0 min-w-0">
              <div className="flex items-center gap-1.5 min-w-0">
                <span
                  className={`px-2.5 py-0.5 rounded-xl text-[clamp(10px,1.1vw,13px)] font-black uppercase tracking-wider border ${currentDiffMeta.badgeBg} tabular-nums shrink-0`}
                >
                  LV.{currentLevel}/20
                </span>
                <span className="text-[clamp(11px,1.2vw,14px)] font-black text-[#143018] truncate">
                  {activeLevelCfg.name}
                </span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 tabular-nums">
                <span className="h-[clamp(24px,4vh,28px)] px-2.5 rounded-xl bg-white/85 border border-white text-[clamp(10px,1.1vw,12px)] font-black text-[#15803D] flex items-center gap-1 shadow-2xs">
                  <Flag size={11} className="shrink-0" /> {activeLevelCfg.targetScore}
                </span>
                <span className="h-[clamp(24px,4vh,28px)] px-2.5 rounded-xl bg-[#FFFBEB]/95 border border-[#FCD34D] text-[clamp(10px,1.1vw,12px)] font-black text-[#B45309] flex items-center gap-1 shadow-2xs">
                  <Coins size={11} className="fill-[#F59E0B] shrink-0" /> +{rewardCoins}
                </span>
              </div>
            </div>

            {/* 20 Level Visual Buttons (5 cols x 4 rows) */}
            <div className="flex-1 min-h-0 grid grid-cols-5 grid-rows-4 gap-[clamp(4px,0.7vw,8px)]">
              {levels.map((lv) => {
                const isUnlocked = lv.levelNumber <= maxUnlocked;
                const isSelected = lv.levelNumber === currentLevel;
                const completedInfo = economy.completedLevels[lv.id];
                const stars = completedInfo?.stars || 0;

                return (
                  <button
                    key={lv.id}
                    type="button"
                    disabled={!isUnlocked}
                    onClick={() => onSelectLevel(difficulty, lv.levelNumber)}
                    className={`relative h-full min-h-0 min-w-0 rounded-xl border flex flex-col items-center justify-center transition-all p-0.5 ${
                      isSelected
                        ? `${currentDiffMeta.selectedTileClass} scale-[1.02] z-10`
                        : isUnlocked
                          ? 'bg-white/80 hover:bg-white text-[#143018] border-white/90 shadow-2xs cursor-pointer'
                          : 'bg-black/10 text-[#203126]/40 border-white/30 cursor-not-allowed'
                    }`}
                  >
                    {isUnlocked ? (
                      <>
                        <span className="text-[clamp(10px,1.9vh,15px)] font-black leading-none tabular-nums">
                          {lv.levelNumber}
                        </span>
                        <div className="flex items-center gap-0.5 mt-0.5">
                          {[1, 2, 3].map((s) => (
                            <Star
                              key={s}
                              className={`w-[clamp(6px,1.1vh,9px)] h-[clamp(6px,1.1vh,9px)] ${
                                s <= stars
                                  ? isSelected
                                    ? 'fill-[#FDE047] text-[#FDE047]'
                                    : 'fill-[#F59E0B] text-[#D97706]'
                                  : isSelected
                                    ? 'text-white/35'
                                    : 'text-black/15'
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center gap-0.5 opacity-65">
                        <Lock className="w-[clamp(8px,1.3vh,11px)] h-[clamp(8px,1.3vh,11px)] shrink-0" />
                        <span className="text-[clamp(9px,1.5vh,12px)] font-extrabold leading-none tabular-nums">
                          {lv.levelNumber}
                        </span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Difficulty-Matched Shining 3D CTA Button */}
            <button
              type="button"
              onClick={onStartGame}
              className={`${currentDiffMeta.ctaClass} w-full h-[clamp(36px,6.5vh,50px)] px-5 font-black text-[clamp(11px,1.3vw,15px)] rounded-2xl border-2 flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider shrink-0`}
            >
              <Play className="w-[clamp(14px,2vh,18px)] h-[clamp(14px,2vh,18px)] fill-current shrink-0" />
              <span>MAIN LEVEL {currentLevel}</span>
            </button>
          </div>
        </div>
      ) : (
        /* =========================================================================
            PORTRAIT VIEWPORT (Mobile Portrait down to 320px iPhone 5s & Tablet Portrait)
            Fluid, Minimalist, Auto-Responsive 20-Level Grid (5x4) with Zero Clipping
           ========================================================================= */
        <div className="w-full h-full max-w-md mx-auto glass-panel rounded-3xl p-[clamp(6px,2.2vw,14px)] flex flex-col justify-between gap-[clamp(4px,1.1vh,10px)] animate-in fade-in zoom-in-95 duration-200 select-none overflow-hidden">
          {/* 1. Brand Logo + Visual High Score & Coin Pills */}
          <div className="w-full flex items-center justify-between gap-1.5 shrink-0">
            <div className="h-[clamp(24px,4.5vh,30px)] px-2 rounded-xl bg-white/85 border border-white text-[clamp(10px,2.7vw,12px)] font-black text-[#143018] flex items-center gap-1 shadow-2xs tabular-nums">
              <Trophy className="w-3 h-3 text-[#D97706] fill-[#FACC15] shrink-0" />
              <span>{highScore}</span>
            </div>

            <img
              src="/assets/aistudio/Ular_Kadut_Logo_5be163da.png"
              alt="Ular Kadut"
              className="h-[clamp(28px,6.8vh,48px)] w-auto object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.22)] select-none pointer-events-none"
            />

            <button
              type="button"
              onClick={onOpenRewards}
              className="h-[clamp(24px,4.5vh,30px)] px-2 rounded-xl bg-[#FFFBEB]/95 border border-[#F59E0B] text-[clamp(10px,2.7vw,12px)] font-black text-[#451A03] flex items-center gap-1 cursor-pointer shadow-2xs tabular-nums"
            >
              <Coins className="w-3 h-3 text-[#B45309] fill-[#F59E0B] shrink-0" />
              <span>{economy.coins}</span>
            </button>
          </div>

          {/* 2. Auto-Responsive Mode Switcher (Mudah / Sedang / Sulit) — Zero Clipping */}
          <div className="w-full bg-black/10 p-1.5 rounded-2xl border border-white/60 grid grid-cols-3 gap-[clamp(4px,1.4vw,8px)] shrink-0">
            {difficultyOptions.map((opt) => {
              const info = DIFFICULTY_INFO[opt.key];
              const isSelected = difficulty === opt.key;
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => onSelectDifficulty(opt.key)}
                  className={`min-w-0 h-[clamp(28px,4.8vh,36px)] px-[clamp(3px,1.2vw,8px)] rounded-xl border font-black text-[clamp(10px,2.8vw,13px)] leading-none tracking-tight transition-all cursor-pointer flex items-center justify-center gap-[clamp(2px,0.9vw,5px)] whitespace-nowrap ${
                    isSelected
                      ? opt.activeClass
                      : 'bg-white/85 hover:bg-white text-[#203126] border-white/90'
                  }`}
                >
                  {opt.icon}
                  <span className="leading-none">{info.label}</span>
                </button>
              );
            })}
          </div>

          {/* 3. Visual 20-Level Grid (5 cols x 4 rows) + Compact Target/Reward Header */}
          <div className="flex-1 min-h-0 w-full glass-card rounded-2xl p-[clamp(6px,2vw,10px)] flex flex-col justify-between gap-[clamp(4px,1vh,8px)]">
            <div className="flex items-center justify-between gap-1 shrink-0 min-w-0">
              <div className="flex items-center gap-1 min-w-0">
                <span
                  className={`px-2 py-0.5 rounded-lg text-[clamp(9px,2.6vw,11px)] font-black uppercase border ${currentDiffMeta.badgeBg} tabular-nums shrink-0`}
                >
                  LV.{currentLevel}/20
                </span>
                <span className="text-[clamp(10px,2.7vw,12px)] font-black text-[#143018] truncate">
                  {activeLevelCfg.name}
                </span>
              </div>

              <div className="flex items-center gap-1 tabular-nums shrink-0">
                <span className="px-1.5 py-0.5 rounded-lg bg-white/85 border border-white text-[clamp(9px,2.5vw,11px)] font-black text-[#15803D] flex items-center gap-0.5">
                  <Flag size={10} className="shrink-0" /> {activeLevelCfg.targetScore}
                </span>
                <span className="px-1.5 py-0.5 rounded-lg bg-[#FFFBEB]/95 border border-[#FCD34D] text-[clamp(9px,2.5vw,11px)] font-black text-[#B45309] flex items-center gap-0.5">
                  <Coins size={10} className="fill-[#F59E0B] shrink-0" /> +{rewardCoins}
                </span>
              </div>
            </div>

            <div className="flex-1 min-h-0 grid grid-cols-5 grid-rows-4 gap-[clamp(3px,1.1vw,6px)]">
              {levels.map((lv) => {
                const isUnlocked = lv.levelNumber <= maxUnlocked;
                const isSelected = lv.levelNumber === currentLevel;
                const completedInfo = economy.completedLevels[lv.id];
                const stars = completedInfo?.stars || 0;

                return (
                  <button
                    key={lv.id}
                    type="button"
                    disabled={!isUnlocked}
                    onClick={() => onSelectLevel(difficulty, lv.levelNumber)}
                    className={`relative h-full min-h-0 min-w-0 rounded-xl border flex flex-col items-center justify-center transition-all p-0.5 ${
                      isSelected
                        ? `${currentDiffMeta.selectedTileClass} scale-[1.02] z-10`
                        : isUnlocked
                          ? 'bg-white/80 hover:bg-white text-[#143018] border-white/90 cursor-pointer'
                          : 'bg-black/10 text-[#203126]/40 border-white/30 cursor-not-allowed'
                    }`}
                  >
                    {isUnlocked ? (
                      <>
                        <span className="text-[clamp(10px,2vh,14px)] font-black leading-none tabular-nums">
                          {lv.levelNumber}
                        </span>
                        <div className="flex items-center gap-0.5 mt-0.5">
                          {[1, 2, 3].map((s) => (
                            <Star
                              key={s}
                              className={`w-[clamp(5px,1.4vw,8px)] h-[clamp(5px,1.4vw,8px)] ${
                                s <= stars
                                  ? isSelected
                                    ? 'fill-[#FDE047] text-[#FDE047]'
                                    : 'fill-[#F59E0B] text-[#D97706]'
                                  : isSelected
                                    ? 'text-white/35'
                                    : 'text-black/15'
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center gap-0.5 opacity-65">
                        <Lock className="w-[clamp(7px,1.8vw,10px)] h-[clamp(7px,1.8vw,10px)] shrink-0" />
                        <span className="text-[clamp(8px,1.8vh,11px)] font-extrabold leading-none tabular-nums">
                          {lv.levelNumber}
                        </span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Visual Quick Hub Cards: Skin & Rewards */}
          <div className="w-full grid grid-cols-2 gap-1.5 shrink-0">
            <button
              type="button"
              onClick={onOpenSkinShop}
              className="h-[clamp(32px,5.5vh,42px)] px-2 rounded-2xl glass-card flex items-center justify-between gap-1 text-left cursor-pointer min-w-0"
              aria-label="Skin Studio"
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="w-5 h-5 rounded-lg bg-[#FAF5FF] border border-[#C084FC] flex items-center justify-center shrink-0">
                  <Palette size={11} className="text-[#6D28D9]" />
                </span>
                <span className="text-[clamp(9px,2.6vw,12px)] font-black text-[#1E1B4B] truncate">
                  {activeSkin.name}
                </span>
              </div>
              <span
                className="w-5 h-5 rounded-full shrink-0 border-2 border-white shadow-2xs"
                style={{
                  background: `radial-gradient(circle at 30% 30%, ${activeSkin.bellyColor}, ${activeSkin.bodyPrimary})`,
                }}
              />
            </button>

            <button
              type="button"
              onClick={onOpenRewards}
              className="relative h-[clamp(32px,5.5vh,42px)] px-2 rounded-2xl glass-card flex items-center justify-between gap-1 text-left cursor-pointer min-w-0"
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="w-5 h-5 rounded-lg bg-[#FFFBEB] border border-[#F59E0B] flex items-center justify-center shrink-0">
                  <Gift size={11} className="text-[#B45309]" />
                </span>
                <span className="text-[clamp(9px,2.6vw,12px)] font-black text-[#451A03] truncate">
                  {unclaimedRewardsCount > 0 ? `${unclaimedRewardsCount} Klaim!` : 'Bonus Koin'}
                </span>
              </div>
              {unclaimedRewardsCount > 0 && (
                <span className="min-w-[16px] h-[16px] px-1 rounded-full bg-[#E11D48] text-white font-black text-[9px] flex items-center justify-center tabular-nums shrink-0">
                  {unclaimedRewardsCount}
                </span>
              )}
            </button>
          </div>

          {/* 5. Difficulty-Matched Shining 3D Start Button */}
          <button
            type="button"
            onClick={onStartGame}
            className={`${currentDiffMeta.ctaClass} w-full h-[clamp(36px,6.2vh,46px)] px-4 font-black text-[clamp(11px,3.2vw,14px)] rounded-2xl border-2 flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider shrink-0`}
          >
            <Play className="w-3.5 h-3.5 fill-current shrink-0" />
            <span>MAIN LEVEL {currentLevel}</span>
          </button>
        </div>
      )}
    </div>
  );
};
