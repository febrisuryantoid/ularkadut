import React, { useState } from 'react';
import {
  X,
  Coins,
  Check,
  Lock,
  Sparkles,
  Crown,
  ShoppingBag,
  Wand2,
  Flame,
  Star,
  Shield,
} from 'lucide-react';
import {
  CustomSkinConfig,
  CustomSkinHeadgearType,
  CustomSkinTailType,
  CustomSkinWingType,
  SkinPatternType,
  SkinRarity,
  SnakeSkinConfig,
  SnakeSkinId,
} from '../game/gameTypes';
import {
  DEFAULT_CUSTOM_SKIN,
  resolveSkinConfig,
  SNAKE_SKIN_LIST,
  SKIN_RARITY_META,
} from '../game/skinCatalog';

interface SkinShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  coins: number;
  ownedSkins: SnakeSkinId[];
  equippedSkin: SnakeSkinId;
  customSkin?: CustomSkinConfig;
  onUpdateCustomSkin?: (patch: Partial<CustomSkinConfig>) => void;
  onBuyOrEquip: (skinId: SnakeSkinId) => { success: boolean; message: string };
}

const COLOR_PRESETS: {
  label: string;
  headColor: string;
  bodyPrimary: string;
  bodySecondary: string;
  bellyColor: string;
  glowColor: string;
  sparkleColor: string;
}[] = [
  {
    label: 'Royal Amethyst',
    headColor: '#4C1D95',
    bodyPrimary: '#7C3AED',
    bodySecondary: '#EC4899',
    bellyColor: '#FDE047',
    glowColor: 'rgba(236, 72, 153, 0.9)',
    sparkleColor: '#FDE047',
  },
  {
    label: 'Naga Emas',
    headColor: '#92400E',
    bodyPrimary: '#F59E0B',
    bodySecondary: '#EF4444',
    bellyColor: '#FEF08A',
    glowColor: 'rgba(245, 158, 11, 0.95)',
    sparkleColor: '#FFFBEB',
  },
  {
    label: 'Cyber Cyan',
    headColor: '#0F172A',
    bodyPrimary: '#06B6D4',
    bodySecondary: '#3B82F6',
    bellyColor: '#A5F3FC',
    glowColor: 'rgba(6, 182, 212, 0.92)',
    sparkleColor: '#67E8F9',
  },
  {
    label: 'Inferno Crimson',
    headColor: '#450A0A',
    bodyPrimary: '#E11D48',
    bodySecondary: '#F97316',
    bellyColor: '#FECDD3',
    glowColor: 'rgba(225, 29, 72, 0.95)',
    sparkleColor: '#FDE047',
  },
  {
    label: 'Celestial Jade',
    headColor: '#064E3B',
    bodyPrimary: '#10B981',
    bodySecondary: '#84CC16',
    bellyColor: '#ECFDF5',
    glowColor: 'rgba(16, 185, 129, 0.9)',
    sparkleColor: '#BEF264',
  },
  {
    label: 'Sakura Pink',
    headColor: '#831843',
    bodyPrimary: '#F43F5E',
    bodySecondary: '#C084FC',
    bellyColor: '#FFF1F2',
    glowColor: 'rgba(244, 63, 94, 0.9)',
    sparkleColor: '#FBCFE8',
  },
];

const SkinPreview: React.FC<{ skin: SnakeSkinConfig; large?: boolean }> = ({
  skin,
  large = false,
}) => {
  const rainbowColors = ['#F43F5E', '#F59E0B', '#10B981', '#06B6D4', '#6366F1'];
  const isHighTier = skin.rarity === 'legendary' || skin.rarity === 'mythic';
  const isEpicOrHigher = skin.rarity === 'epic' || isHighTier;
  const headgear = skin.headgear || (skin.hasCrown ? 'crown' : 'none');
  const wings = skin.wings || 'none';
  const tail = skin.tail || 'normal';

  return (
    <div
      className={`relative ${
        large ? 'h-28 sm:h-32' : 'h-16'
      } w-full rounded-2xl flex items-center justify-center overflow-hidden px-3 transition-all`}
      style={{
        background:
          skin.rarity === 'mythic'
            ? 'linear-gradient(135deg, #2E1065 0%, #1E1B4B 50%, #4C0519 100%)'
            : skin.rarity === 'legendary'
              ? 'linear-gradient(135deg, #451A03 0%, #78350F 50%, #1C1917 100%)'
              : skin.rarity === 'epic'
                ? 'linear-gradient(135deg, #082F49 0%, #1E1B4B 60%, #022C22 100%)'
                : 'linear-gradient(to bottom, #E8F5DF, #CDE5C1)',
        boxShadow: isHighTier ? `0 0 18px ${skin.glowColor}` : 'inset 0 1px 3px rgba(0,0,0,0.1)',
        border: `1.5px solid ${isHighTier ? skin.bellyColor : '#A5C68B'}`,
      }}
    >
      {/* Ambient Pulsing Aura for High Tier Skins */}
      {isEpicOrHigher && (
        <div
          className="absolute inset-0 pointer-events-none opacity-45 animate-pulse"
          style={{
            background: `radial-gradient(circle at center, ${skin.glowColor} 0%, transparent 72%)`,
          }}
        />
      )}

      {/* Floating Sparkle Accents */}
      {isEpicOrHigher && (
        <>
          <Sparkles
            size={large ? 16 : 12}
            className="absolute top-2 left-3 text-amber-300 animate-spin"
            style={{ animationDuration: '6s' }}
          />
          <Sparkles
            size={large ? 14 : 10}
            className="absolute bottom-2 right-3 text-white/80 animate-bounce"
            style={{ animationDuration: '2.5s' }}
          />
        </>
      )}

      {/* Snake Body Segment Preview */}
      <div className="relative z-10 flex items-center gap-0.5">
        {[4, 3, 2, 1, 0].map((idx) => {
          const isHead = idx === 0;
          const isShoulder = idx === 1;
          const isTail = idx === 4;
          const sizeClass = large
            ? isHead
              ? 'w-11 h-11'
              : isTail
                ? 'w-7 h-7'
                : 'w-9 h-9'
            : isHead
              ? 'w-8 h-8'
              : isTail
                ? 'w-5 h-5'
                : 'w-6 h-6';

          let bg = idx % 2 === 1 ? skin.bodySecondary : skin.bodyPrimary;
          if (skin.pattern === 'rainbow') {
            bg = isHead ? skin.headColor : rainbowColors[idx % rainbowColors.length];
          } else if (isHead) {
            bg = skin.headColor;
          }

          return (
            <div
              key={idx}
              className={`relative rounded-full ${sizeClass} -ml-1.5 first:ml-0 border border-black/25 flex items-center justify-center transition-transform`}
              style={{
                background: `radial-gradient(circle at 32% 28%, ${skin.bellyColor}, ${bg} 55%, ${skin.headColor} 100%)`,
                boxShadow: isHighTier
                  ? `0 4px 10px rgba(0,0,0,0.4), 0 0 8px ${skin.glowColor}`
                  : '0 3px 6px rgba(0,0,0,0.22)',
              }}
            >
              {/* Dynamic Specular Gloss Gleam */}
              <span className="absolute top-0.5 left-1 w-2.5 h-1.5 rounded-full bg-white/75 -rotate-12 pointer-events-none" />

              {/* 3D Wings Preview on Shoulder Segment (idx === 1) */}
              {isShoulder && wings !== 'none' && (
                <>
                  <span
                    className={`absolute -top-3.5 -left-1 ${
                      large ? 'w-6 h-4' : 'w-4 h-3'
                    } rounded-tl-full rounded-tr-full border border-white/70 -rotate-25 animate-pulse pointer-events-none`}
                    style={{
                      background:
                        wings === 'angel'
                          ? 'linear-gradient(135deg, #FFFFFF, #FEF08A)'
                          : wings === 'dragon'
                            ? 'linear-gradient(135deg, #F97316, #991B1B)'
                            : 'linear-gradient(135deg, #67E8F9, #C084FC)',
                      boxShadow: `0 0 8px ${skin.glowColor}`,
                    }}
                  />
                  <span
                    className={`absolute -bottom-3.5 -left-1 ${
                      large ? 'w-6 h-4' : 'w-4 h-3'
                    } rounded-bl-full rounded-br-full border border-white/70 rotate-25 animate-pulse pointer-events-none`}
                    style={{
                      background:
                        wings === 'angel'
                          ? 'linear-gradient(135deg, #FFFFFF, #FEF08A)'
                          : wings === 'dragon'
                            ? 'linear-gradient(135deg, #F97316, #991B1B)'
                            : 'linear-gradient(135deg, #67E8F9, #C084FC)',
                      boxShadow: `0 0 8px ${skin.glowColor}`,
                    }}
                  />
                </>
              )}

              {/* 3D Tail Accessory on Tail Segment (idx === 4) */}
              {isTail && tail !== 'normal' && (
                <span className="absolute -left-2.5 flex items-center justify-center pointer-events-none">
                  {tail === 'star' && (
                    <Star
                      size={large ? 15 : 11}
                      className="text-amber-300 fill-amber-300 drop-shadow-[0_0_6px_rgba(251,191,36,0.9)] animate-spin"
                      style={{ animationDuration: '4s' }}
                    />
                  )}
                  {tail === 'flame' && (
                    <Flame
                      size={large ? 15 : 11}
                      className="text-orange-400 fill-red-500 drop-shadow-[0_0_6px_rgba(239,68,68,0.9)] animate-bounce"
                    />
                  )}
                  {tail === 'blade' && (
                    <span
                      className={`${
                        large ? 'w-3.5 h-3.5' : 'w-2.5 h-2.5'
                      } rotate-45 bg-gradient-to-tr from-cyan-300 to-white border border-sky-500 shadow-[0_0_8px_#38BDF8]`}
                    />
                  )}
                </span>
              )}

              {/* Head Details & Headgear (Crown / Halo / Horns) */}
              {isHead && (
                <>
                  {headgear === 'crown' && (
                    <Crown
                      size={large ? 17 : 13}
                      className="absolute -top-3.5 text-amber-300 fill-amber-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)] animate-bounce"
                      style={{ animationDuration: '2s' }}
                    />
                  )}
                  {headgear === 'halo' && (
                    <span
                      className={`absolute -top-3 ${
                        large ? 'w-7 h-2.5' : 'w-5 h-2'
                      } rounded-full border-2 border-[#FEF08A] shadow-[0_0_10px_#FACC15] animate-pulse`}
                    />
                  )}
                  {headgear === 'horns' && (
                    <div className="absolute -top-2.5 flex items-center gap-2 pointer-events-none">
                      <span className="w-1.5 h-3 bg-gradient-to-t from-rose-700 to-amber-200 rounded-t-full -rotate-25 border border-black/30" />
                      <span className="w-1.5 h-3 bg-gradient-to-t from-rose-700 to-amber-200 rounded-t-full rotate-25 border border-black/30" />
                    </div>
                  )}
                  <div className="flex flex-col gap-1 ml-2">
                    <span
                      className="w-2 h-2 rounded-full border border-black/40 flex items-center justify-center shadow-xs"
                      style={{ backgroundColor: skin.eyeColor }}
                    >
                      <span
                        className="w-1 h-1 rounded-full"
                        style={{ backgroundColor: skin.pupilColor }}
                      />
                    </span>
                    <span
                      className="w-2 h-2 rounded-full border border-black/40 flex items-center justify-center shadow-xs"
                      style={{ backgroundColor: skin.eyeColor }}
                    >
                      <span
                        className="w-1 h-1 rounded-full"
                        style={{ backgroundColor: skin.pupilColor }}
                      />
                    </span>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const SkinShopModal: React.FC<SkinShopModalProps> = ({
  isOpen,
  onClose,
  coins,
  ownedSkins,
  equippedSkin,
  customSkin = DEFAULT_CUSTOM_SKIN,
  onUpdateCustomSkin,
  onBuyOrEquip,
}) => {
  const [activeTab, setActiveTab] = useState<'catalog' | 'custom_studio'>('catalog');
  const [selectedRarity, setSelectedRarity] = useState<'all' | SkinRarity>('all');
  const [feedback, setFeedback] = useState<{ text: string; ok: boolean } | null>(null);

  if (!isOpen) return null;

  const isCustomOwned = ownedSkins.includes('custom_sultan');
  const isCustomEquipped = equippedSkin === 'custom_sultan';
  const resolvedCustomSkin = resolveSkinConfig('custom_sultan', customSkin);

  const filteredSkins =
    selectedRarity === 'all'
      ? SNAKE_SKIN_LIST
      : SNAKE_SKIN_LIST.filter((s) => s.rarity === selectedRarity);

  const handleAction = (skin: SnakeSkinConfig) => {
    const res = onBuyOrEquip(skin.id);
    setFeedback({ text: res.message, ok: res.success });
    window.setTimeout(() => {
      setFeedback((prev) => (prev?.text === res.message ? null : prev));
    }, 2800);
  };

  const handleCustomChange = (patch: Partial<CustomSkinConfig>) => {
    if (onUpdateCustomSkin) {
      onUpdateCustomSkin(patch);
    }
  };

  const rarities: { key: 'all' | SkinRarity; label: string }[] = [
    { key: 'all', label: 'Semua' },
    { key: 'common', label: 'Common' },
    { key: 'rare', label: 'Rare' },
    { key: 'epic', label: 'Epic' },
    { key: 'legendary', label: 'Legendary' },
    { key: 'mythic', label: 'Mythic' },
  ];

  const wingOptions: { key: CustomSkinWingType; label: string; badge: string }[] = [
    { key: 'angel', label: 'Sayap Malaikat', badge: 'Emas Suci' },
    { key: 'dragon', label: 'Sayap Naga', badge: 'Api Magma' },
    { key: 'fairy', label: 'Sayap Kristal', badge: 'Prisma Aurora' },
    { key: 'none', label: 'Tanpa Sayap', badge: 'Mode Klasik' },
  ];

  const headgearOptions: { key: CustomSkinHeadgearType; label: string }[] = [
    { key: 'crown', label: 'Mahkota Emas' },
    { key: 'halo', label: 'Cincin Halo' },
    { key: 'horns', label: 'Tanduk Naga' },
    { key: 'none', label: 'Tanpa Mahkota' },
  ];

  const tailOptions: { key: CustomSkinTailType; label: string }[] = [
    { key: 'star', label: 'Bintang Astral' },
    { key: 'flame', label: 'Obor Api' },
    { key: 'blade', label: 'Pedang Kristal' },
    { key: 'normal', label: 'Ekor Klasik' },
  ];

  const patternOptions: { key: SkinPatternType; label: string }[] = [
    { key: 'cosmic', label: 'Kosmik Galaksi' },
    { key: 'rainbow', label: 'Prisma Pelangi' },
    { key: 'metallic', label: 'Emas Metalik' },
    { key: 'cyber', label: 'Cyber Neon' },
    { key: 'stripes', label: 'Belang Harimau' },
    { key: 'spots', label: 'Totol Permata' },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Skin Studio"
      onClick={onClose}
      className="fixed inset-0 z-50 bg-stone-950/45 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-150 select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl max-h-[92dvh] glass-panel rounded-3xl shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Modal Header (Max 2 Words per Label) */}
        <div className="px-4 sm:px-6 py-3 bg-white/55 border-b border-white/70 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-b from-[#A855F7] to-[#6D28D9] text-white flex items-center justify-center shadow-xs border border-[#4C1D95]">
              <Wand2 size={20} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-[#143018] tracking-tight leading-none">
                SKIN STUDIO
              </h2>
              <span className="text-[11px] font-bold text-[#526650] tabular-nums">
                {ownedSkins.length}/{SNAKE_SKIN_LIST.length} Terbuka
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="h-9 px-3 rounded-xl bg-[#FFFBEB] border-2 border-[#D97706] flex items-center gap-1.5 shadow-2xs">
              <Coins className="w-4 h-4 text-[#B45309] fill-[#F59E0B]" />
              <span className="text-sm font-black text-[#451A03] tabular-nums">{coins}</span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-white/80 hover:bg-white text-[#526650] hover:text-[#1E3F23] border border-white flex items-center justify-center cursor-pointer transition-colors"
              aria-label="Tutup"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Mode Switcher Bar: Koleksi vs Custom 5K (Max 2 Words) */}
        <div className="px-4 sm:px-6 py-2.5 bg-white/40 border-b border-white/60 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1.5 bg-black/10 p-1 rounded-xl border border-white/60">
            <button
              type="button"
              onClick={() => setActiveTab('catalog')}
              className={`h-8 px-3.5 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all ${
                activeTab === 'catalog'
                  ? 'bg-[#24A148] text-white shadow-xs'
                  : 'text-[#203126] hover:bg-white/70'
              }`}
            >
              <ShoppingBag size={13} />
              <span>Koleksi</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('custom_studio')}
              className={`h-8 px-3.5 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all ${
                activeTab === 'custom_studio'
                  ? 'bg-gradient-to-r from-[#7C3AED] to-[#EC4899] text-white shadow-xs'
                  : 'text-[#6D28D9] hover:bg-white/70'
              }`}
            >
              <Wand2 size={13} />
              <span>Custom 5K</span>
            </button>
          </div>

          {activeTab === 'catalog' && (
            <div className="flex items-center gap-1 overflow-x-auto">
              {rarities.map((r) => {
                const active = selectedRarity === r.key;
                return (
                  <button
                    key={r.key}
                    type="button"
                    onClick={() => setSelectedRarity(r.key)}
                    className={`h-7 px-2.5 rounded-lg text-[11px] font-black uppercase tracking-wider shrink-0 transition-all cursor-pointer border ${
                      active
                        ? 'bg-[#1E3F23] text-white border-[#143018]'
                        : 'bg-white/75 text-[#526650] border-white hover:bg-white'
                    }`}
                  >
                    {r.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Feedback Banner */}
        {feedback && (
          <div
            className={`mx-4 sm:mx-6 mt-2.5 px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 border shrink-0 ${
              feedback.ok
                ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                : 'bg-rose-50 text-rose-900 border-rose-300'
            }`}
          >
            <Sparkles size={14} />
            <span>{feedback.text}</span>
          </div>
        )}

        {/* ==================== TAB 1: CUSTOM 5K (All Labels Max 2 Words) ==================== */}
        {activeTab === 'custom_studio' ? (
          <div className="p-4 sm:p-5 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Left Column (5 Cols): Live 3D Preview & Unlock/Equip CTA */}
            <div className="lg:col-span-5 glass-card rounded-2xl p-4 border-2 border-[#C084FC] flex flex-col justify-between gap-3">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-300">
                    Mythic 5K
                  </span>
                  {isCustomOwned && (
                    <span className="px-2 py-0.5 rounded-lg text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
                      Dimiliki
                    </span>
                  )}
                </div>

                {/* Large 3D Live Preview */}
                <SkinPreview skin={resolvedCustomSkin} large />

                <div className="mt-3">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-[#6D28D9] mb-1">
                    Nama Ular
                  </label>
                  <input
                    type="text"
                    maxLength={20}
                    value={customSkin.customName}
                    onChange={(e) => handleCustomChange({ customName: e.target.value })}
                    placeholder="Sultan Custom"
                    className="w-full h-9 px-3 rounded-xl bg-white/90 border border-[#C4B5FD] text-xs font-black text-[#2E1065] focus:outline-none focus:border-[#7C3AED]"
                  />
                </div>

                {/* Preset Palettes (All Max 2 Words) */}
                <div className="mt-3">
                  <span className="block text-[10px] font-black uppercase tracking-wider text-[#526650] mb-1.5">
                    Tema Instan
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {COLOR_PRESETS.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() =>
                          handleCustomChange({
                            headColor: preset.headColor,
                            bodyPrimary: preset.bodyPrimary,
                            bodySecondary: preset.bodySecondary,
                            bellyColor: preset.bellyColor,
                            glowColor: preset.glowColor,
                            sparkleColor: preset.sparkleColor,
                          })
                        }
                        className="p-1.5 rounded-xl bg-white/80 hover:bg-white border border-white flex items-center gap-1.5 text-left cursor-pointer transition-colors"
                      >
                        <span
                          className="w-4 h-4 rounded-full shrink-0 border border-black/20"
                          style={{
                            background: `linear-gradient(135deg, ${preset.bodyPrimary}, ${preset.bodySecondary})`,
                          }}
                        />
                        <span className="text-[10px] font-extrabold text-[#203126] truncate">
                          {preset.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Buy 5,000 Coins or Equip Button (Max 2 Words) */}
              <div className="pt-2 border-t border-white/60">
                {isCustomEquipped ? (
                  <div className="w-full h-11 px-4 rounded-xl bg-[#24A148] text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xs">
                    <Check size={16} className="stroke-[3]" />
                    <span>Sedang Dipakai</span>
                  </div>
                ) : isCustomOwned ? (
                  <button
                    type="button"
                    onClick={() => handleAction(resolvedCustomSkin)}
                    className="btn-shining-cta w-full h-11 px-4 rounded-xl bg-gradient-to-r from-[#22C55E] to-[#15803D] text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Check size={16} />
                    <span>Pakai Custom</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleAction(resolvedCustomSkin)}
                    className={`w-full h-11 px-4 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 border-2 transition-all cursor-pointer ${
                      coins >= 5000
                        ? 'btn-shining-cta-yellow bg-gradient-to-r from-[#F59E0B] via-[#EA580C] to-[#D97706] text-white border-[#78350F]'
                        : 'bg-stone-100 text-stone-500 border-stone-300'
                    }`}
                  >
                    {coins >= 5000 ? (
                      <Coins size={16} className="text-amber-200 fill-amber-300" />
                    ) : (
                      <Lock size={15} />
                    )}
                    <span>Buka 5.000</span>
                  </button>
                )}
              </div>
            </div>

            {/* Right Column (7 Cols): Color Pickers & 3D Accessories (Max 2 Words Each) */}
            <div className="lg:col-span-7 glass-card rounded-2xl p-4 flex flex-col gap-3.5">
              {/* 1. Warna Ular */}
              <div>
                <span className="block text-xs font-black uppercase tracking-wider text-[#1E3F23] mb-2">
                  Warna Ular
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <label className="p-2 rounded-xl bg-white/80 border border-white flex items-center justify-between gap-2 cursor-pointer">
                    <span className="text-[11px] font-extrabold text-[#203126]">Kepala</span>
                    <input
                      type="color"
                      value={customSkin.headColor}
                      onChange={(e) => handleCustomChange({ headColor: e.target.value })}
                      className="w-7 h-7 rounded-lg cursor-pointer border-0 bg-transparent"
                    />
                  </label>

                  <label className="p-2 rounded-xl bg-white/80 border border-white flex items-center justify-between gap-2 cursor-pointer">
                    <span className="text-[11px] font-extrabold text-[#203126]">Sisik Utama</span>
                    <input
                      type="color"
                      value={customSkin.bodyPrimary}
                      onChange={(e) => handleCustomChange({ bodyPrimary: e.target.value })}
                      className="w-7 h-7 rounded-lg cursor-pointer border-0 bg-transparent"
                    />
                  </label>

                  <label className="p-2 rounded-xl bg-white/80 border border-white flex items-center justify-between gap-2 cursor-pointer">
                    <span className="text-[11px] font-extrabold text-[#203126]">Sisik Kedua</span>
                    <input
                      type="color"
                      value={customSkin.bodySecondary}
                      onChange={(e) => handleCustomChange({ bodySecondary: e.target.value })}
                      className="w-7 h-7 rounded-lg cursor-pointer border-0 bg-transparent"
                    />
                  </label>

                  <label className="p-2 rounded-xl bg-white/80 border border-white flex items-center justify-between gap-2 cursor-pointer">
                    <span className="text-[11px] font-extrabold text-[#203126]">Kilau Perut</span>
                    <input
                      type="color"
                      value={customSkin.bellyColor}
                      onChange={(e) =>
                        handleCustomChange({
                          bellyColor: e.target.value,
                          sparkleColor: e.target.value,
                        })
                      }
                      className="w-7 h-7 rounded-lg cursor-pointer border-0 bg-transparent"
                    />
                  </label>
                </div>
              </div>

              {/* 2. Sayap 3D */}
              <div>
                <span className="block text-xs font-black uppercase tracking-wider text-[#1E3F23] mb-1.5">
                  Sayap 3D
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {wingOptions.map((w) => {
                    const active = customSkin.wings === w.key;
                    return (
                      <button
                        key={w.key}
                        type="button"
                        onClick={() => handleCustomChange({ wings: w.key })}
                        className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                          active
                            ? 'bg-[#FAF5FF] border-[#7C3AED] ring-2 ring-[#7C3AED]/20'
                            : 'bg-white/80 border-white hover:bg-white'
                        }`}
                      >
                        <div className="text-xs font-black text-[#203126]">{w.label}</div>
                        <div className="text-[10px] font-bold text-[#6D28D9] leading-tight mt-0.5">
                          {w.badge}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Mahkota 3D */}
              <div>
                <span className="block text-xs font-black uppercase tracking-wider text-[#1E3F23] mb-1.5">
                  Mahkota 3D
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {headgearOptions.map((h) => {
                    const active = customSkin.headgear === h.key;
                    return (
                      <button
                        key={h.key}
                        type="button"
                        onClick={() => handleCustomChange({ headgear: h.key })}
                        className={`h-10 px-2.5 rounded-xl border text-xs font-black transition-all cursor-pointer flex items-center justify-center text-center ${
                          active
                            ? 'bg-[#FFFBEB] border-[#D97706] text-[#92400E] ring-2 ring-[#D97706]/20'
                            : 'bg-white/80 border-white text-[#203126] hover:bg-white'
                        }`}
                      >
                        {h.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4. Pusaka Ekor & Corak Sisik */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="block text-xs font-black uppercase tracking-wider text-[#1E3F23] mb-1.5">
                    Pusaka Ekor
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {tailOptions.map((t) => {
                      const active = customSkin.tail === t.key;
                      return (
                        <button
                          key={t.key}
                          type="button"
                          onClick={() => handleCustomChange({ tail: t.key })}
                          className={`h-9 px-2 rounded-xl border text-[11px] font-black transition-all cursor-pointer ${
                            active
                              ? 'bg-[#ECFDF5] border-[#16A34A] text-[#166534]'
                              : 'bg-white/80 border-white text-[#203126] hover:bg-white'
                          }`}
                        >
                          {t.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <span className="block text-xs font-black uppercase tracking-wider text-[#1E3F23] mb-1.5">
                    Corak Sisik
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {patternOptions.slice(0, 4).map((p) => {
                      const active = customSkin.pattern === p.key;
                      return (
                        <button
                          key={p.key}
                          type="button"
                          onClick={() => handleCustomChange({ pattern: p.key })}
                          className={`h-9 px-2 rounded-xl border text-[11px] font-black transition-all cursor-pointer ${
                            active
                              ? 'bg-[#EFF6FF] border-[#2563EB] text-[#1E40AF]'
                              : 'bg-white/80 border-white text-[#203126] hover:bg-white'
                          }`}
                        >
                          {p.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ==================== TAB 2: KOLEKSI SKIN (All Labels Max 2 Words) ==================== */
          <div className="p-4 sm:p-5 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredSkins.map((rawSkin) => {
              const skin =
                rawSkin.id === 'custom_sultan'
                  ? resolveSkinConfig('custom_sultan', customSkin)
                  : rawSkin;
              const isOwned = ownedSkins.includes(skin.id);
              const isEquipped = equippedSkin === skin.id;
              const canAfford = coins >= skin.price;
              const rarityMeta = SKIN_RARITY_META[skin.rarity];

              return (
                <div
                  key={skin.id}
                  className={`glass-card rounded-2xl p-3.5 border-2 transition-all flex flex-col justify-between gap-2.5 ${
                    isEquipped
                      ? 'border-[#24A148] ring-2 ring-[#24A148]/25 bg-white/90'
                      : rarityMeta.cardBorder
                  }`}
                >
                  <div>
                    {/* Top Badges */}
                    <div className="flex items-center justify-between gap-1 mb-2">
                      <span
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider border ${rarityMeta.bgBadge} ${rarityMeta.textBadge} ${rarityMeta.borderBadge}`}
                      >
                        {rarityMeta.label}
                      </span>
                      <span className="text-[10px] font-bold text-[#526650] bg-white/80 px-2 py-0.5 rounded-lg border border-white">
                        {skin.categoryLabel}
                      </span>
                    </div>

                    {/* Skin Preview */}
                    <SkinPreview skin={skin} />

                    {/* Name & Short Tagline (Max 2 Words) */}
                    <div className="mt-2 flex items-center justify-between gap-1">
                      <div>
                        <h3 className="text-sm font-black text-[#203126] truncate">{skin.name}</h3>
                        <p className="text-[10px] font-bold text-[#657467] leading-tight">
                          {skin.tagline}
                        </p>
                      </div>
                      {isOwned && !isEquipped && (
                        <span className="text-[9px] font-extrabold uppercase text-[#24A148] bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 shrink-0">
                          Dimiliki
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons (Max 2 Words) */}
                  <div className="flex flex-col gap-1.5">
                    {skin.id === 'custom_sultan' && (
                      <button
                        type="button"
                        onClick={() => setActiveTab('custom_studio')}
                        className="w-full py-1.5 px-3 rounded-xl bg-[#FAF5FF] hover:bg-[#F3E8FF] text-[#6D28D9] border border-[#C084FC] font-black text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Wand2 size={13} />
                        <span>Studio Custom</span>
                      </button>
                    )}

                    {isEquipped ? (
                      <div className="w-full py-2 px-3 rounded-xl bg-[#24A148] text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-2xs">
                        <Check size={14} className="stroke-[3]" />
                        <span>Sedang Dipakai</span>
                      </div>
                    ) : isOwned ? (
                      <button
                        type="button"
                        onClick={() => handleAction(skin)}
                        className="w-full py-2 px-3 rounded-xl bg-white/85 hover:bg-[#24A148] text-[#1E3F23] hover:text-white border border-[#24A148] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer active:scale-98"
                      >
                        <Shield size={13} />
                        <span>Pakai Skin</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleAction(skin)}
                        className={`w-full py-2 px-3 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 border transition-all cursor-pointer active:scale-98 ${
                          canAfford
                            ? 'bg-[#FFC928] hover:bg-[#F59E0B] text-[#451A03] border-[#D97706] shadow-2xs'
                            : 'bg-stone-100 text-stone-500 border-stone-300'
                        }`}
                      >
                        {canAfford ? (
                          <Coins size={14} className="text-[#B45309] fill-[#F59E0B]" />
                        ) : (
                          <Lock size={13} />
                        )}
                        <span>{skin.price} Koin</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
