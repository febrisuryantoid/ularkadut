import React, { useState, useEffect, useCallback } from 'react';
import { useGameEngine } from './hooks/useGameEngine';
import { usePWAInstall } from './hooks/usePWAInstall';
import { getUnclaimedRewardCount } from './game/economyManager';
import { soundManager } from './utils/audio';
import { setupAutoFullscreenForPWA } from './utils/fullscreen';
import { ArcadeHUD } from './components/ArcadeHUD';
import { GameCanvas } from './components/GameCanvas';
import { VirtualDPad } from './components/VirtualDPad';
import { JedaArcadeButton } from './components/JedaArcadeButton';
import { StartOverlay } from './components/StartOverlay';
import { PauseOverlay } from './components/PauseOverlay';
import { GameOverOverlay } from './components/GameOverOverlay';
import { LevelCompleteOverlay } from './components/LevelCompleteOverlay';
import { SkinShopModal } from './components/SkinShopModal';
import { RewardsHubModal } from './components/RewardsHubModal';
import { HowToPlayModal } from './components/HowToPlayModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { PWAInstallWidget } from './components/PWAInstallWidget';
import { DifficultyLevel } from './game/gameTypes';

const DIFFICULTY_BACKGROUNDS: Record<
  DifficultyLevel,
  { landscape: string; portrait: string; name: string }
> = {
  easy: {
    landscape: '/assets/aistudio/image_0a9399dc.png',
    portrait: '/assets/aistudio/image_6f5a2653.png',
    name: 'Hutan Tropis Kadut (Mudah)',
  },
  medium: {
    landscape: '/assets/aistudio/image_ce10a6a3.png',
    portrait: '/assets/aistudio/image_7acd21ad.png',
    name: 'Candi Lembah Jingga (Sedang)',
  },
  hard: {
    landscape: '/assets/aistudio/image_fa7bc5b9.png',
    portrait: '/assets/aistudio/image_699a4595.png',
    name: 'Reruntuhan Magma Crimson (Sulit)',
  },
};

export default function App() {
  const {
    engineState,
    difficulty,
    currentLevel,
    snakeSkin,
    highScore,
    economy,
    hourlyRemainingMs,
    nowMs,
    isMuted,
    toggleMute,
    setDifficulty,
    selectLevel,
    buyOrEquipSkin,
    updateCustomSkin,
    claimHourlyBonus,
    claimDailyStreak,
    claimMission,
    claimAchievement,
    updateGridDimensions,
    handleDirectionInput,
    startGame,
    startNextLevel,
    pauseGame,
    resumeGame,
    restartGame,
    goToMenu,
  } = useGameEngine();

  const pwaInstall = usePWAInstall();

  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isSkinShopOpen, setIsSkinShopOpen] = useState(false);
  const [isRewardsOpen, setIsRewardsOpen] = useState(false);

  const [viewportMode, setViewportMode] = useState<
    'landscape-wide' | 'landscape-compact' | 'portrait'
  >(() => {
    if (typeof window === 'undefined') return 'landscape-wide';
    const w = window.innerWidth;
    const h = window.innerHeight;
    if (w >= 1024) return 'landscape-wide';
    if (w > h && h < 560) return 'landscape-compact';
    if (w >= 768 && w > h) return 'landscape-wide';
    return 'portrait';
  });

  useEffect(() => {
    const updateViewportMode = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      if (w >= 1024 || (w >= 720 && w > h && h >= 520)) {
        setViewportMode('landscape-wide');
      } else if (w > h && h < 520) {
        setViewportMode('landscape-compact');
      } else {
        setViewportMode('portrait');
      }
    };

    updateViewportMode();
    window.addEventListener('resize', updateViewportMode);
    window.addEventListener('orientationchange', updateViewportMode);
    return () => {
      window.removeEventListener('resize', updateViewportMode);
      window.removeEventListener('orientationchange', updateViewportMode);
    };
  }, []);

  // PWA Standalone auto-fullscreen activation
  useEffect(() => {
    const cleanup = setupAutoFullscreenForPWA();
    return cleanup;
  }, []);

  const isMenu = engineState.state === 'menu';
  const isPaused = engineState.state === 'paused';
  const isPlaying = engineState.state === 'playing';
  const isGameOver = engineState.state === 'gameover';
  const isLevelComplete = engineState.state === 'levelcomplete';

  const isAnyModalOpen = isHelpOpen || isSkinShopOpen || isRewardsOpen;
  const isPWAWidgetVisible = pwaInstall.shouldShowWidget && isMenu && !isAnyModalOpen;

  const unclaimedRewardsCount = getUnclaimedRewardCount(economy, nowMs);

  const handleTogglePause = useCallback(() => {
    if (isPaused) {
      resumeGame();
    } else if (isPlaying) {
      pauseGame();
    }
  }, [isPaused, isPlaying, resumeGame, pauseGame]);

  const handleOpenHelp = useCallback(() => {
    soundManager.playMenuClick();
    if (isPlaying) {
      pauseGame();
    }
    setIsHelpOpen(true);
  }, [isPlaying, pauseGame]);

  const handleCloseHelp = useCallback(() => {
    soundManager.playMenuClick();
    setIsHelpOpen(false);
  }, []);

  const handleOpenSkinShop = useCallback(() => {
    soundManager.playMenuClick();
    if (isPlaying) {
      pauseGame();
    }
    setIsSkinShopOpen(true);
  }, [isPlaying, pauseGame]);

  const handleCloseSkinShop = useCallback(() => {
    soundManager.playMenuClick();
    setIsSkinShopOpen(false);
  }, []);

  const handleOpenRewards = useCallback(() => {
    soundManager.playMenuClick();
    if (isPlaying) {
      pauseGame();
    }
    setIsRewardsOpen(true);
  }, [isPlaying, pauseGame]);

  const handleCloseRewards = useCallback(() => {
    soundManager.playMenuClick();
    setIsRewardsOpen(false);
  }, []);

  const isLandscapeLayout =
    viewportMode === 'landscape-wide' || viewportMode === 'landscape-compact';
  const isCompactLandscape = viewportMode === 'landscape-compact';

  const currentBg = DIFFICULTY_BACKGROUNDS[difficulty] || DIFFICULTY_BACKGROUNDS.easy;

  return (
    <div className="relative h-[100dvh] max-h-[100dvh] w-full flex flex-col justify-between overflow-hidden bg-[#EBF4E5] text-[#203126] select-none pt-[env(safe-area-inset-top,0px)] pb-[env(safe-area-inset-bottom,0px)] pl-[env(safe-area-inset-left,0px)] pr-[env(safe-area-inset-right,0px)]">
      {/* 0. Ambient Scenery Background (Responsive Easy/Medium/Hard in Landscape & Portrait) */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden transition-all duration-300">
        <picture key={`${difficulty}-${viewportMode}`}>
          <source media="(orientation: portrait)" srcSet={currentBg.portrait} />
          <source media="(orientation: landscape)" srcSet={currentBg.landscape} />
          <img
            src={viewportMode === 'portrait' ? currentBg.portrait : currentBg.landscape}
            alt={currentBg.name}
            className="w-full h-full object-cover object-center animate-in fade-in duration-300"
          />
        </picture>
        <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/15 pointer-events-none" />
      </div>

      {/* Offline Toast Notification for PWA */}
      <OfflineIndicator />

      {/* 1. TOP HEADER (Uniform 3D HUD without duplicate Difficulty filter or Pause button) */}
      <div className="relative z-20 shrink-0 w-full">
        <ArcadeHUD
          score={engineState.score}
          targetScore={engineState.targetScore}
          currentLevel={currentLevel}
          highScore={highScore}
          coins={economy.coins}
          hourlyRemainingMs={hourlyRemainingMs}
          unclaimedRewardsCount={unclaimedRewardsCount}
          speedTPS={engineState.speedTPS}
          gameState={engineState.state}
          difficulty={difficulty}
          isMuted={isMuted}
          onToggleMute={toggleMute}
          onOpenRewards={handleOpenRewards}
          onOpenSkinShop={handleOpenSkinShop}
          onOpenHelp={handleOpenHelp}
          isHelpOpen={isHelpOpen}
          viewportMode={viewportMode}
        />
      </div>

      {/* 2. UNIFIED RESPONSIVE ARENA (Full-Width Overlay in Menu, Balanced Controls in Gameplay) */}
      <div
        className={`flex-1 min-h-0 w-full relative z-10 flex transition-[padding] duration-200 ${
          isLandscapeLayout
            ? `flex-row items-center justify-between px-2 sm:px-4 xl:px-6 pt-1 ${
                isPWAWidgetVisible && !isCompactLandscape ? 'pb-[118px]' : 'pb-1'
              } gap-2 sm:gap-3 max-w-[1600px] mx-auto`
            : `flex-col justify-between px-1.5 sm:px-3 pt-0.5 ${
                isPWAWidgetVisible ? 'pb-[114px]' : 'pb-1'
              }`
        }`}
      >
        {/* Left Side Control in Landscape Mode (Shown during gameplay/pause/gameover) */}
        {isLandscapeLayout && !isMenu && (
          <aside
            className={`${
              isCompactLandscape ? 'w-28' : 'w-36 xl:w-44'
            } shrink-0 flex flex-col items-center justify-center py-1 animate-in fade-in duration-150`}
          >
            <VirtualDPad
              onDirection={handleDirectionInput}
              size={isCompactLandscape ? 'compact' : 'normal'}
            />
          </aside>
        )}

        {/* Center Main Game Board Canvas & Full-Width Overlay */}
        <main className="flex-1 min-h-0 w-full h-full relative overflow-hidden flex items-center justify-center">
          <GameCanvas
            engineState={engineState}
            snakeSkin={snakeSkin}
            customSkin={economy.customSkin}
            onUpdateGridDimensions={updateGridDimensions}
            onDirectionInput={handleDirectionInput}
          >
            {isMenu && (
              <StartOverlay
                difficulty={difficulty}
                currentLevel={currentLevel}
                onSelectDifficulty={setDifficulty}
                onSelectLevel={selectLevel}
                snakeSkin={snakeSkin}
                economy={economy}
                unclaimedRewardsCount={unclaimedRewardsCount}
                highScore={highScore}
                onStartGame={() => {
                  soundManager.playBGM();
                  startGame(currentLevel, difficulty);
                }}
                onOpenSkinShop={handleOpenSkinShop}
                onOpenRewards={handleOpenRewards}
                viewportMode={viewportMode}
              />
            )}

            {isPaused && (
              <PauseOverlay
                onResume={resumeGame}
                onRestart={restartGame}
                onMenu={goToMenu}
              />
            )}

            {isGameOver && (
              <GameOverOverlay
                score={engineState.score}
                targetScore={engineState.targetScore}
                currentLevel={currentLevel}
                sessionCoinsEarned={engineState.sessionCoinsEarned}
                highScore={highScore}
                reason={engineState.gameOverReason}
                onPlayAgain={restartGame}
                onMenu={goToMenu}
              />
            )}

            {isLevelComplete && (
              <LevelCompleteOverlay
                difficulty={difficulty}
                currentLevel={currentLevel}
                score={engineState.score}
                stars={engineState.earnedStars}
                sessionCoinsEarned={engineState.sessionCoinsEarned}
                levelCompletionReward={engineState.levelCompletionReward}
                onNextLevel={startNextLevel}
                onReplay={restartGame}
                onMenu={goToMenu}
              />
            )}
          </GameCanvas>
        </main>

        {/* Right Side Control in Landscape Mode (Shown during gameplay/pause/gameover) */}
        {isLandscapeLayout && !isMenu && (
          <aside
            className={`${
              isCompactLandscape ? 'w-24' : 'w-36 xl:w-44'
            } shrink-0 flex flex-col items-center justify-center py-1 animate-in fade-in duration-150`}
          >
            <JedaArcadeButton
              isPaused={isPaused}
              disabled={!isPlaying && !isPaused}
              onTogglePause={handleTogglePause}
              size={isCompactLandscape ? 'compact' : 'normal'}
            />
          </aside>
        )}

        {/* Bottom Control Bar in Portrait Mode: Centered D-Pad + Single JEDA Button (only during gameplay/pause/gameover) */}
        {!isLandscapeLayout && !isMenu && (
          <footer className="w-full shrink-0 pt-1 pb-1.5 flex items-center justify-center gap-6 max-w-lg mx-auto animate-in fade-in duration-150">
            <VirtualDPad onDirection={handleDirectionInput} size="compact" />
            <JedaArcadeButton
              isPaused={isPaused}
              disabled={!isPlaying && !isPaused}
              onTogglePause={handleTogglePause}
              size="compact"
            />
          </footer>
        )}
      </div>

      {/* 3. Modals: Skin Shop & Custom 5K Studio, Rewards Hub, and How To Play ("?") */}
      <SkinShopModal
        isOpen={isSkinShopOpen}
        onClose={handleCloseSkinShop}
        coins={economy.coins}
        ownedSkins={economy.ownedSkins}
        equippedSkin={snakeSkin}
        customSkin={economy.customSkin}
        onUpdateCustomSkin={updateCustomSkin}
        onBuyOrEquip={buyOrEquipSkin}
      />

      <RewardsHubModal
        isOpen={isRewardsOpen}
        onClose={handleCloseRewards}
        economy={economy}
        hourlyRemainingMs={hourlyRemainingMs}
        onClaimHourly={claimHourlyBonus}
        onClaimDailyStreak={claimDailyStreak}
        onClaimMission={claimMission}
        onClaimAchievement={claimAchievement}
      />

      <HowToPlayModal isOpen={isHelpOpen} onClose={handleCloseHelp} />

      {/* 4. Smart PWA Install Prompt Widget (Desktop Floating Bottom-Right / Mobile Compact Card) */}
      <PWAInstallWidget
        visible={isPWAWidgetVisible}
        isPrompting={pwaInstall.isPrompting}
        showManualInstructions={pwaInstall.showManualInstructions}
        platform={pwaInstall.platform}
        browser={pwaInstall.browser}
        onInstallNow={pwaInstall.handleInstallNow}
        onDismiss={pwaInstall.handleDismiss}
        onBackFromInstructions={pwaInstall.handleBackFromInstructions}
      />
    </div>
  );
}
