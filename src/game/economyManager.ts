import {
  AchievementProgress,
  CustomSkinConfig,
  DifficultyLevel,
  MissionProgress,
  PlayerEconomyState,
  SnakeSkinId,
} from './gameTypes';
import { GAME_CONFIG } from './gameConfig';
import { DEFAULT_CUSTOM_SKIN, SNAKE_SKIN_CATALOG } from './skinCatalog';

export function getLocalTodayString(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getYesterdayString(date: Date = new Date()): string {
  const yesterday = new Date(date.getTime() - 86400000);
  return getLocalTodayString(yesterday);
}

function computeSignature(state: PlayerEconomyState): string {
  const raw = `${state.coins}|${state.ownedSkins.join(',')}|${state.lastHourlyClaimAt}|${state.dailyStreak.lastClaimDate || ''}|uk_v3_salt`;
  let hash = 2166136261;
  for (let i = 0; i < raw.length; i++) {
    hash ^= raw.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

export function createDefaultEconomyState(): PlayerEconomyState {
  const today = getLocalTodayString();
  return {
    coins: 100, // Starter welcome coins for new players
    ownedSkins: ['classic'],
    equippedSkin: 'classic',
    customSkin: { ...DEFAULT_CUSTOM_SKIN },
    unlockedLevels: {
      easy: 1,
      medium: 1,
      hard: 1,
    },
    completedLevels: {},
    lastHourlyClaimAt: 0, // Ready to claim first hourly bonus immediately!
    dailyStreak: {
      streakCount: 0,
      lastClaimDate: null,
    },
    stats: {
      totalFruitsEaten: 0,
      goldenFruitsEaten: 0,
      levelsClearedCount: 0,
      maxSnakeLength: 3,
      highestSingleScore: 0,
    },
    claimedMissions: [],
    claimedAchievements: [],
    missionResetDate: today,
  };
}

export function loadEconomyState(): PlayerEconomyState {
  const fallback = createDefaultEconomyState();
  try {
    const raw = localStorage.getItem(GAME_CONFIG.STORAGE_KEY_ECONOMY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as { state?: PlayerEconomyState; sig?: string };
    if (!parsed || !parsed.state) return fallback;

    const st = parsed.state;
    const expectedSig = computeSignature(st);
    if (parsed.sig !== expectedSig) {
      // If tampered, clamp coins to safe bounds and keep valid unlocked progress
      st.coins = Math.max(0, Math.min(st.coins || 0, 50000));
    }

    const now = Date.now();
    // Anti-clock manipulation: if lastHourlyClaimAt is in the future (user moved clock forward then back),
    // reset lastHourlyClaimAt to `now` so they wait a normal 1-hour cycle instead of getting stuck or exploiting
    const safeLastHourly =
      typeof st.lastHourlyClaimAt === 'number' && st.lastHourlyClaimAt > now
        ? now
        : Math.max(0, Number(st.lastHourlyClaimAt) || 0);

    const validOwned: SnakeSkinId[] = Array.isArray(st.ownedSkins)
      ? st.ownedSkins.filter((id): id is SnakeSkinId => id in SNAKE_SKIN_CATALOG)
      : ['classic'];
    if (!validOwned.includes('classic')) {
      validOwned.unshift('classic');
    }

    const equipped: SnakeSkinId =
      st.equippedSkin && validOwned.includes(st.equippedSkin) ? st.equippedSkin : 'classic';

    const today = getLocalTodayString();
    const isSameDay = st.missionResetDate === today;

    const loadedCustomSkin: CustomSkinConfig = {
      ...DEFAULT_CUSTOM_SKIN,
      ...(st.customSkin && typeof st.customSkin === 'object' ? st.customSkin : {}),
    };

    return {
      coins: Math.max(0, Math.floor(Number(st.coins) || 0)),
      ownedSkins: validOwned,
      equippedSkin: equipped,
      customSkin: loadedCustomSkin,
      unlockedLevels: {
        easy: Math.max(1, Math.min(20, Number(st.unlockedLevels?.easy) || 1)),
        medium: Math.max(1, Math.min(20, Number(st.unlockedLevels?.medium) || 1)),
        hard: Math.max(1, Math.min(20, Number(st.unlockedLevels?.hard) || 1)),
      },
      completedLevels: st.completedLevels && typeof st.completedLevels === 'object' ? st.completedLevels : {},
      lastHourlyClaimAt: safeLastHourly,
      dailyStreak: {
        streakCount: Math.max(0, Math.min(7, Number(st.dailyStreak?.streakCount) || 0)),
        lastClaimDate: st.dailyStreak?.lastClaimDate || null,
      },
      stats: {
        totalFruitsEaten: isSameDay
          ? Math.max(0, Number(st.stats?.totalFruitsEaten) || 0)
          : 0,
        goldenFruitsEaten: isSameDay
          ? Math.max(0, Number(st.stats?.goldenFruitsEaten) || 0)
          : 0,
        levelsClearedCount: Math.max(0, Number(st.stats?.levelsClearedCount) || 0),
        maxSnakeLength: Math.max(3, Number(st.stats?.maxSnakeLength) || 3),
        highestSingleScore: Math.max(0, Number(st.stats?.highestSingleScore) || 0),
      },
      claimedMissions: isSameDay && Array.isArray(st.claimedMissions) ? st.claimedMissions : [],
      claimedAchievements: Array.isArray(st.claimedAchievements) ? st.claimedAchievements : [],
      missionResetDate: today,
    };
  } catch {
    return fallback;
  }
}

export function saveEconomyState(state: PlayerEconomyState): void {
  try {
    const cleanState: PlayerEconomyState = {
      ...state,
      coins: Math.max(0, Math.floor(state.coins)),
    };
    const sig = computeSignature(cleanState);
    localStorage.setItem(
      GAME_CONFIG.STORAGE_KEY_ECONOMY,
      JSON.stringify({ state: cleanState, sig })
    );
  } catch {
    // Ignore storage quota errors
  }
}

export function updateCustomSkinAtomic(
  state: PlayerEconomyState,
  patch: Partial<CustomSkinConfig>
): PlayerEconomyState {
  const nextCustom: CustomSkinConfig = {
    ...DEFAULT_CUSTOM_SKIN,
    ...(state.customSkin || {}),
    ...patch,
  };
  const nextState: PlayerEconomyState = {
    ...state,
    customSkin: nextCustom,
  };
  saveEconomyState(nextState);
  return nextState;
}

/**
 * Atomically purchases a skin if player has sufficient coins and doesn't own it yet.
 */
export function purchaseSkinAtomic(
  state: PlayerEconomyState,
  skinId: SnakeSkinId
): { success: boolean; nextState: PlayerEconomyState; message: string } {
  const skin = SNAKE_SKIN_CATALOG[skinId];
  if (!skin) {
    return { success: false, nextState: state, message: 'Skin tidak ditemukan.' };
  }
  if (state.ownedSkins.includes(skinId)) {
    const next = { ...state, equippedSkin: skinId };
    saveEconomyState(next);
    return { success: true, nextState: next, message: 'Skin sudah dimiliki dan langsung dipakai!' };
  }
  if (state.coins < skin.price) {
    return {
      success: false,
      nextState: state,
      message: `Koin belum cukup! Butuh ${skin.price - state.coins} koin lagi.`,
    };
  }

  const nextState: PlayerEconomyState = {
    ...state,
    coins: Math.max(0, state.coins - skin.price),
    ownedSkins: [...state.ownedSkins, skinId],
    equippedSkin: skinId,
  };
  saveEconomyState(nextState);
  return {
    success: true,
    nextState,
    message: `Berhasil membeli & memakai ${skin.name}!`,
  };
}

/**
 * Remaining milliseconds until next hourly free coin bonus is ready.
 */
export function getHourlyBonusRemainingMs(state: PlayerEconomyState, nowMs: number = Date.now()): number {
  if (state.lastHourlyClaimAt <= 0) return 0;
  // Guard against backward system clock shifts
  if (nowMs < state.lastHourlyClaimAt) {
    return GAME_CONFIG.HOURLY_COOLDOWN_MS;
  }
  const elapsed = nowMs - state.lastHourlyClaimAt;
  return Math.max(0, GAME_CONFIG.HOURLY_COOLDOWN_MS - elapsed);
}

export function formatCountdownMMSS(remainingMs: number): string {
  if (remainingMs <= 0) return 'SIAP KLAIM!';
  const totalSec = Math.ceil(remainingMs / 1000);
  const mins = Math.floor(totalSec / 60);
  const secs = totalSec % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function claimHourlyBonusAtomic(
  state: PlayerEconomyState,
  nowMs: number = Date.now()
): { success: boolean; nextState: PlayerEconomyState; reward: number } {
  const remaining = getHourlyBonusRemainingMs(state, nowMs);
  if (remaining > 0) {
    return { success: false, nextState: state, reward: 0 };
  }
  const reward = GAME_CONFIG.HOURLY_BONUS_COINS;
  const nextState: PlayerEconomyState = {
    ...state,
    coins: state.coins + reward,
    lastHourlyClaimAt: nowMs,
  };
  saveEconomyState(nextState);
  return { success: true, nextState, reward };
}

export function canClaimDailyStreakToday(state: PlayerEconomyState): boolean {
  const today = getLocalTodayString();
  const last = state.dailyStreak.lastClaimDate;
  if (!last) return true;
  // Block if already claimed today or if lastClaimDate is in the future (clock rollback attempt)
  return last < today;
}

export function getNextDailyStreakDay(state: PlayerEconomyState): number {
  const today = getLocalTodayString();
  const yesterday = getYesterdayString();
  const last = state.dailyStreak.lastClaimDate;
  if (!last) return 1;
  if (last === today) return Math.max(1, state.dailyStreak.streakCount);
  if (last === yesterday) {
    return (state.dailyStreak.streakCount % 7) + 1;
  }
  return 1;
}

export function claimDailyStreakAtomic(
  state: PlayerEconomyState
): { success: boolean; nextState: PlayerEconomyState; reward: number; dayNumber: number } {
  if (!canClaimDailyStreakToday(state)) {
    return {
      success: false,
      nextState: state,
      reward: 0,
      dayNumber: Math.max(1, state.dailyStreak.streakCount),
    };
  }

  const today = getLocalTodayString();
  const nextDay = getNextDailyStreakDay(state);
  const reward = GAME_CONFIG.DAILY_STREAK_REWARDS[nextDay - 1] || 50;

  const nextState: PlayerEconomyState = {
    ...state,
    coins: state.coins + reward,
    dailyStreak: {
      streakCount: nextDay,
      lastClaimDate: today,
    },
  };
  saveEconomyState(nextState);
  return {
    success: true,
    nextState,
    reward,
    dayNumber: nextDay,
  };
}

export function getDailyMissions(state: PlayerEconomyState): MissionProgress[] {
  const defs: Omit<MissionProgress, 'current' | 'claimed'>[] = [
    {
      id: 'mission_eat_15',
      title: 'Pemburu Buah',
      description: 'Makan 15 buah hari ini',
      target: 15,
      rewardCoins: 100,
      type: 'eat_total',
    },
    {
      id: 'mission_golden_4',
      title: 'Mangga Emas',
      description: 'Makan 4 Mangga Emas',
      target: 4,
      rewardCoins: 140,
      type: 'eat_golden',
    },
    {
      id: 'mission_length_12',
      title: 'Ular Raksasa',
      description: 'Capai panjang 12 segmen',
      target: 12,
      rewardCoins: 150,
      type: 'reach_length',
    },
    {
      id: 'mission_clear_2',
      title: 'Penakluk Arena',
      description: 'Selesaikan 2 level',
      target: 2,
      rewardCoins: 180,
      type: 'clear_levels',
    },
  ];

  return defs.map((d) => {
    let current = 0;
    if (d.type === 'eat_total') current = state.stats.totalFruitsEaten;
    if (d.type === 'eat_golden') current = state.stats.goldenFruitsEaten;
    if (d.type === 'reach_length') current = state.stats.maxSnakeLength;
    if (d.type === 'clear_levels') current = state.stats.levelsClearedCount;

    return {
      ...d,
      current: Math.min(d.target, current),
      claimed: state.claimedMissions.includes(d.id),
    };
  });
}

export function getAchievements(state: PlayerEconomyState): AchievementProgress[] {
  const completedKeys = Object.keys(state.completedLevels);
  const easyCleared = completedKeys.filter((k) => k.startsWith('easy-')).length;
  const mediumCleared = completedKeys.filter((k) => k.startsWith('medium-')).length;
  const hardCleared = completedKeys.filter((k) => k.startsWith('hard-')).length;

  const defs = [
    {
      id: 'ach_first_clear',
      title: 'Langkah Pertama',
      description: 'Selesaikan 1 level',
      target: 1,
      current: completedKeys.length,
      rewardCoins: 100,
    },
    {
      id: 'ach_skin_collector',
      title: 'Kolektor Skin',
      description: 'Miliki 4 skin ular',
      target: 4,
      current: state.ownedSkins.length,
      rewardCoins: 250,
    },
    {
      id: 'ach_easy_master',
      title: 'Master Mudah',
      description: 'Tamatkan 10 level Mudah',
      target: 10,
      current: easyCleared,
      rewardCoins: 400,
    },
    {
      id: 'ach_medium_explorer',
      title: 'Master Sedang',
      description: 'Tamatkan 5 level Sedang',
      target: 5,
      current: mediumCleared,
      rewardCoins: 450,
    },
    {
      id: 'ach_hard_challenger',
      title: 'Master Sulit',
      description: 'Tamatkan 3 level Sulit',
      target: 3,
      current: hardCleared,
      rewardCoins: 600,
    },
    {
      id: 'ach_high_score_200',
      title: 'Skor Legenda',
      description: 'Raih skor 200+ sekali main',
      target: 200,
      current: state.stats.highestSingleScore,
      rewardCoins: 300,
    },
  ];

  return defs.map((d) => ({
    ...d,
    current: Math.min(d.target, d.current),
    claimed: state.claimedAchievements.includes(d.id),
  }));
}

export function claimMissionAtomic(
  state: PlayerEconomyState,
  missionId: string
): { success: boolean; nextState: PlayerEconomyState; reward: number } {
  if (state.claimedMissions.includes(missionId)) {
    return { success: false, nextState: state, reward: 0 };
  }
  const mission = getDailyMissions(state).find((m) => m.id === missionId);
  if (!mission || mission.current < mission.target) {
    return { success: false, nextState: state, reward: 0 };
  }

  const nextState: PlayerEconomyState = {
    ...state,
    coins: state.coins + mission.rewardCoins,
    claimedMissions: [...state.claimedMissions, missionId],
  };
  saveEconomyState(nextState);
  return { success: true, nextState, reward: mission.rewardCoins };
}

export function claimAchievementAtomic(
  state: PlayerEconomyState,
  achievementId: string
): { success: boolean; nextState: PlayerEconomyState; reward: number } {
  if (state.claimedAchievements.includes(achievementId)) {
    return { success: false, nextState: state, reward: 0 };
  }
  const ach = getAchievements(state).find((a) => a.id === achievementId);
  if (!ach || ach.current < ach.target) {
    return { success: false, nextState: state, reward: 0 };
  }

  const nextState: PlayerEconomyState = {
    ...state,
    coins: state.coins + ach.rewardCoins,
    claimedAchievements: [...state.claimedAchievements, achievementId],
  };
  saveEconomyState(nextState);
  return { success: true, nextState, reward: ach.rewardCoins };
}

export function getUnclaimedRewardCount(state: PlayerEconomyState, nowMs: number = Date.now()): number {
  let count = 0;
  if (getHourlyBonusRemainingMs(state, nowMs) === 0) count++;
  if (canClaimDailyStreakToday(state)) count++;
  const missions = getDailyMissions(state);
  count += missions.filter((m) => m.current >= m.target && !m.claimed).length;
  const achievements = getAchievements(state);
  count += achievements.filter((a) => a.current >= a.target && !a.claimed).length;
  return count;
}
