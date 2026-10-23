import { useState, useEffect, useRef, useCallback } from 'react';
import {
  CustomSkinConfig,
  Direction,
  DifficultyLevel,
  GameEngineState,
  PlayerEconomyState,
  SnakeSkinId,
} from '../game/gameTypes';
import { GAME_CONFIG } from '../game/gameConfig';
import {
  createInitialEngineState,
  createInitialSnake,
  getNextHeadPosition,
  detectWallCollision,
  detectObstacleCollision,
  findSelfCollisionIndex,
  isOppositeDirection,
  calculateSpeedTPS,
} from '../game/gameLogic';
import { spawnFruit } from '../game/fruitSpawner';
import { generateObstacles } from '../game/obstacleGenerator';
import {
  getLevelConfig,
  calculateLevelStars,
  MAX_LEVELS_PER_DIFFICULTY,
} from '../game/levelProgression';
import {
  loadEconomyState,
  saveEconomyState,
  purchaseSkinAtomic,
  updateCustomSkinAtomic,
  claimHourlyBonusAtomic,
  claimDailyStreakAtomic,
  claimMissionAtomic,
  claimAchievementAtomic,
  getHourlyBonusRemainingMs,
} from '../game/economyManager';
import {
  loadHighScore,
  saveHighScore,
  loadDifficulty,
  saveDifficulty,
  loadMutedState,
  saveMutedState,
  saveSnakeSkin,
} from '../utils/storage';
import { soundManager } from '../utils/audio';

export function useGameEngine() {
  const [economy, setEconomy] = useState<PlayerEconomyState>(() => loadEconomyState());
  const [difficulty, setDifficultyState] = useState<DifficultyLevel>(() => loadDifficulty());
  const [currentLevel, setCurrentLevelState] = useState<number>(() => {
    const initialDiff = loadDifficulty();
    const initialEco = loadEconomyState();
    return initialEco.unlockedLevels[initialDiff] || 1;
  });
  const [highScore, setHighScore] = useState<number>(() => loadHighScore());
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    const muted = loadMutedState();
    soundManager.setMuted(muted);
    return muted;
  });

  // Live 1-second ticker for accurate 1-hour bonus countdown
  const [nowMs, setNowMs] = useState<number>(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => {
      setNowMs(Date.now());
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  // Automatically sync BGM track whenever difficulty level changes (easy / medium / hard)
  useEffect(() => {
    soundManager.setDifficultyBGM(difficulty);
  }, [difficulty]);

  const hourlyRemainingMs = getHourlyBonusRemainingMs(economy, nowMs);
  const snakeSkin = economy.equippedSkin;

  const gridSizeRef = useRef<{ cols: number; rows: number }>({
    cols: GAME_CONFIG.DEFAULT_GRID_COLS,
    rows: GAME_CONFIG.DEFAULT_GRID_ROWS,
  });

  const [engineState, setEngineState] = useState<GameEngineState>(() =>
    createInitialEngineState(
      loadHighScore(),
      loadDifficulty(),
      GAME_CONFIG.DEFAULT_GRID_COLS,
      GAME_CONFIG.DEFAULT_GRID_ROWS,
      loadEconomyState().unlockedLevels[loadDifficulty()] || 1
    )
  );

  // Direction input queue (max 2 buffered turns)
  const directionQueueRef = useRef<Direction[]>([]);
  const currentDirectionRef = useRef<Direction>('RIGHT');
  const growthPendingRef = useRef<number>(0);
  const fruitsEatenRef = useRef<number>(0);
  const selfCutCountRef = useRef<number>(0);

  const updateEconomy = useCallback((updater: (prev: PlayerEconomyState) => PlayerEconomyState) => {
    setEconomy((prev) => {
      const next = updater(prev);
      saveEconomyState(next);
      return next;
    });
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      soundManager.setMuted(next);
      saveMutedState(next);
      if (!next) {
        soundManager.playMenuClick();
      }
      return next;
    });
  }, []);

  const setDifficulty = useCallback(
    (newDiff: DifficultyLevel) => {
      soundManager.playMenuSelect();
      saveDifficulty(newDiff);
      setDifficultyState(newDiff);
      const targetLv = economy.unlockedLevels[newDiff] || 1;
      setCurrentLevelState(targetLv);
      const { cols, rows } = gridSizeRef.current;
      setEngineState((prev) => {
        if (prev.state === 'menu') {
          return createInitialEngineState(highScore, newDiff, cols, rows, targetLv);
        }
        return prev;
      });
    },
    [highScore, economy.unlockedLevels]
  );

  const selectLevel = useCallback(
    (diff: DifficultyLevel, levelNumber: number) => {
      const maxUnlocked = economy.unlockedLevels[diff] || 1;
      const safeLevel = Math.max(
        1,
        Math.min(maxUnlocked, Math.min(MAX_LEVELS_PER_DIFFICULTY, levelNumber))
      );
      soundManager.playMenuSelect();
      if (diff !== difficulty) {
        saveDifficulty(diff);
        setDifficultyState(diff);
      }
      setCurrentLevelState(safeLevel);
      const { cols, rows } = gridSizeRef.current;
      setEngineState((prev) => {
        if (prev.state === 'menu') {
          return createInitialEngineState(highScore, diff, cols, rows, safeLevel);
        }
        return prev;
      });
    },
    [difficulty, economy.unlockedLevels, highScore]
  );

  const setSnakeSkin = useCallback(
    (newSkin: SnakeSkinId) => {
      if (economy.ownedSkins.includes(newSkin)) {
        soundManager.playMenuSelect();
        saveSnakeSkin(newSkin);
        updateEconomy((prev) => ({
          ...prev,
          equippedSkin: newSkin,
        }));
      }
    },
    [economy.ownedSkins, updateEconomy]
  );

  const buyOrEquipSkin = useCallback(
    (skinId: SnakeSkinId): { success: boolean; message: string } => {
      let outcome = { success: false, message: '' };
      setEconomy((prev) => {
        const res = purchaseSkinAtomic(prev, skinId);
        outcome = { success: res.success, message: res.message };
        if (res.success) {
          saveSnakeSkin(skinId);
        }
        return res.nextState;
      });
      if (outcome.success) {
        soundManager.playCoinReward();
      } else {
        soundManager.playMenuClick();
      }
      return outcome;
    },
    []
  );

  const updateCustomSkin = useCallback((patch: Partial<CustomSkinConfig>) => {
    soundManager.playMenuSelect();
    setEconomy((prev) => updateCustomSkinAtomic(prev, patch));
  }, []);

  const claimHourlyBonus = useCallback((): { success: boolean; reward: number } => {
    let outcome = { success: false, reward: 0 };
    const currentNow = Date.now();
    setNowMs(currentNow);
    setEconomy((prev) => {
      const res = claimHourlyBonusAtomic(prev, currentNow);
      outcome = { success: res.success, reward: res.reward };
      return res.nextState;
    });
    if (outcome.success) {
      soundManager.playCoinReward();
    }
    return outcome;
  }, []);

  const claimDailyStreak = useCallback((): {
    success: boolean;
    reward: number;
    dayNumber: number;
  } => {
    let outcome = { success: false, reward: 0, dayNumber: 1 };
    setEconomy((prev) => {
      const res = claimDailyStreakAtomic(prev);
      outcome = { success: res.success, reward: res.reward, dayNumber: res.dayNumber };
      return res.nextState;
    });
    if (outcome.success) {
      soundManager.playCoinReward();
    }
    return outcome;
  }, []);

  const claimMission = useCallback((missionId: string): { success: boolean; reward: number } => {
    let outcome = { success: false, reward: 0 };
    setEconomy((prev) => {
      const res = claimMissionAtomic(prev, missionId);
      outcome = { success: res.success, reward: res.reward };
      return res.nextState;
    });
    if (outcome.success) {
      soundManager.playCoinReward();
    }
    return outcome;
  }, []);

  const claimAchievement = useCallback(
    (achievementId: string): { success: boolean; reward: number } => {
      let outcome = { success: false, reward: 0 };
      setEconomy((prev) => {
        const res = claimAchievementAtomic(prev, achievementId);
        outcome = { success: res.success, reward: res.reward };
        return res.nextState;
      });
      if (outcome.success) {
        soundManager.playCoinReward();
      }
      return outcome;
    },
    []
  );

  const updateGridDimensions = useCallback(
    (cols: number, rows: number) => {
      const prev = gridSizeRef.current;
      if (prev.cols === cols && prev.rows === rows) return;
      gridSizeRef.current = { cols, rows };

      setEngineState((state) => {
        if (state.state === 'menu') {
          return createInitialEngineState(highScore, difficulty, cols, rows, currentLevel);
        }
        return {
          ...state,
          gridCols: cols,
          gridRows: rows,
        };
      });
    },
    [highScore, difficulty, currentLevel]
  );

  const handleDirectionInput = useCallback((nextDir: Direction) => {
    const queue = directionQueueRef.current;
    const lastScheduledDir = queue.length > 0 ? queue[queue.length - 1] : currentDirectionRef.current;

    if (nextDir !== lastScheduledDir && !isOppositeDirection(lastScheduledDir, nextDir)) {
      if (queue.length < 2) {
        directionQueueRef.current = [...queue, nextDir];
        soundManager.playTurn();
      }
    }
  }, []);

  const startGame = useCallback(
    (levelOverride?: number, diffOverride?: DifficultyLevel) => {
      const activeDiff = diffOverride || difficulty;
      const activeLevel = levelOverride || currentLevel;
      const { cols, rows } = gridSizeRef.current;
      const levelCfg = getLevelConfig(activeDiff, activeLevel);

      directionQueueRef.current = [];
      currentDirectionRef.current = 'RIGHT';
      growthPendingRef.current = 0;
      fruitsEatenRef.current = 0;
      selfCutCountRef.current = 0;
      soundManager.playGameStart();

      const freshSnake = createInitialSnake(cols, rows);
      const freshObstacles = generateObstacles(cols, rows, activeDiff, freshSnake[0], activeLevel);
      const freshFruit = spawnFruit(freshSnake, freshObstacles, cols, rows) ?? {
        x: 2,
        y: 2,
        type: 'regular' as const,
        sizeScale: 1.0,
        points: 10,
        growth: 1,
        coinValue: 2,
        name: 'Apel Segar',
        color: '#D9364F',
      };

      setEngineState({
        snake: freshSnake,
        direction: 'RIGHT',
        fruit: freshFruit,
        obstacles: freshObstacles,
        score: 0,
        highScore: loadHighScore(),
        state: 'playing',
        speedTPS: levelCfg.initialTPS,
        difficulty: activeDiff,
        currentLevel: activeLevel,
        targetScore: levelCfg.targetScore,
        sessionCoinsEarned: 0,
        levelCompletionReward: 0,
        earnedStars: 0,
        gridCols: cols,
        gridRows: rows,
        cutSegments: [],
        cutEffectTimestamp: null,
        gameOverReason: null,
      });
    },
    [difficulty, currentLevel]
  );

  const startNextLevel = useCallback(() => {
    const nextLv = Math.min(MAX_LEVELS_PER_DIFFICULTY, currentLevel + 1);
    setCurrentLevelState(nextLv);
    startGame(nextLv, difficulty);
  }, [currentLevel, difficulty, startGame]);

  const pauseGame = useCallback(() => {
    setEngineState((prev) => {
      if (prev.state === 'playing') {
        soundManager.playPause();
        return { ...prev, state: 'paused' };
      }
      return prev;
    });
  }, []);

  const resumeGame = useCallback(() => {
    setEngineState((prev) => {
      if (prev.state === 'paused') {
        soundManager.playResume();
        return { ...prev, state: 'playing' };
      }
      return prev;
    });
  }, []);

  const restartGame = useCallback(() => {
    startGame(currentLevel, difficulty);
  }, [startGame, currentLevel, difficulty]);

  const goToMenu = useCallback(() => {
    soundManager.playMenuClick();
    directionQueueRef.current = [];
    currentDirectionRef.current = 'RIGHT';
    growthPendingRef.current = 0;
    fruitsEatenRef.current = 0;
    selfCutCountRef.current = 0;
    const { cols, rows } = gridSizeRef.current;
    setEngineState(createInitialEngineState(highScore, difficulty, cols, rows, currentLevel));
  }, [highScore, difficulty, currentLevel]);

  // Main Game Tick Effect
  useEffect(() => {
    if (engineState.state !== 'playing') return;

    const tickIntervalMs = 1000 / engineState.speedTPS;

    const timer = window.setInterval(() => {
      setEngineState((prev) => {
        if (prev.state !== 'playing') return prev;

        const { gridCols, gridRows } = prev;

        // 1. Dequeue next buffered direction if available
        let nextDir = prev.direction;
        if (directionQueueRef.current.length > 0) {
          const candidate = directionQueueRef.current[0];
          directionQueueRef.current = directionQueueRef.current.slice(1);
          if (!isOppositeDirection(prev.direction, candidate)) {
            nextDir = candidate;
          }
        }
        currentDirectionRef.current = nextDir;

        const currentHead = prev.snake[0];
        const nextHead = getNextHeadPosition(currentHead, nextDir);

        // 2. Check Wall Collision -> Game Over
        if (detectWallCollision(nextHead, gridCols, gridRows)) {
          soundManager.playWall();
          soundManager.playGameOver();
          return {
            ...prev,
            direction: nextDir,
            state: 'gameover',
            gameOverReason: 'wall',
          };
        }

        // 3. Check Obstacle Collision -> Game Over
        if (detectObstacleCollision(nextHead, prev.obstacles)) {
          soundManager.playObstacleCrash();
          soundManager.playGameOver();
          return {
            ...prev,
            direction: nextDir,
            state: 'gameover',
            gameOverReason: 'obstacle',
          };
        }

        // 4. Check Fruit Consumption
        const ateFruit = nextHead.x === prev.fruit.x && nextHead.y === prev.fruit.y;

        if (ateFruit) {
          growthPendingRef.current += prev.fruit.growth - 1;
          fruitsEatenRef.current += 1;
        }

        // Prepare candidate body before head insertion
        let bodyBeforeHead: typeof prev.snake;
        if (ateFruit) {
          bodyBeforeHead = [...prev.snake];
        } else if (growthPendingRef.current > 0) {
          growthPendingRef.current -= 1;
          bodyBeforeHead = [...prev.snake];
        } else {
          bodyBeforeHead = prev.snake.slice(0, -1);
        }

        // 5. Check Self-Collision -> CUT BODY instead of dying!
        const selfHitIndex = findSelfCollisionIndex(nextHead, bodyBeforeHead);
        let cutSegments: typeof prev.snake = prev.cutSegments;
        let cutEffectTimestamp = prev.cutEffectTimestamp;
        let scoreAfterCut = prev.score;

        if (selfHitIndex !== -1) {
          soundManager.playCut();
          selfCutCountRef.current += 1;
          const safeKeepIndex = Math.max(2, selfHitIndex);
          cutSegments = bodyBeforeHead.slice(safeKeepIndex);
          bodyBeforeHead = bodyBeforeHead.slice(0, safeKeepIndex);
          cutEffectTimestamp = Date.now();
          const penalty = cutSegments.length * GAME_CONFIG.CUT_PENALTY_POINTS;
          scoreAfterCut = Math.max(0, scoreAfterCut - penalty);
        } else if (cutEffectTimestamp && Date.now() - cutEffectTimestamp > 450) {
          cutSegments = [];
          cutEffectTimestamp = null;
        }

        const nextSnake = [nextHead, ...bodyBeforeHead];
        let nextScore = scoreAfterCut;
        let nextHighScore = prev.highScore;
        let nextSpeed = prev.speedTPS;
        let nextFruit = prev.fruit;
        let nextSessionCoins = prev.sessionCoinsEarned;

        if (ateFruit) {
          soundManager.playEat(prev.fruit.type);
          nextScore += prev.fruit.points;
          const fruitCoins = prev.fruit.coinValue || 2;
          nextSessionCoins += fruitCoins;

          if (nextScore > nextHighScore) {
            if (prev.highScore > 0 && prev.score <= prev.highScore) {
              soundManager.playHighScore();
            }
            nextHighScore = nextScore;
            saveHighScore(nextHighScore);
            setHighScore(nextHighScore);
          }

          nextSpeed = calculateSpeedTPS(
            fruitsEatenRef.current,
            prev.difficulty,
            prev.currentLevel
          );

          // Check if Level Target Score is reached!
          if (nextScore >= prev.targetScore) {
            soundManager.playLevelComplete();
            const levelCfg = getLevelConfig(prev.difficulty, prev.currentLevel);
            const levelKey = `${prev.difficulty}-${prev.currentLevel}`;
            const stars = calculateLevelStars(
              nextScore,
              prev.targetScore,
              selfCutCountRef.current
            );

            let completionBonus = levelCfg.replayCoins;
            setEconomy((ecoPrev) => {
              const wasCompletedBefore = Boolean(ecoPrev.completedLevels[levelKey]);
              const levelReward = wasCompletedBefore
                ? levelCfg.replayCoins
                : levelCfg.firstClearCoins;
              completionBonus = levelReward;

              const prevBest = ecoPrev.completedLevels[levelKey];
              const nextUnlocked = Math.min(
                MAX_LEVELS_PER_DIFFICULTY,
                Math.max(ecoPrev.unlockedLevels[prev.difficulty] || 1, prev.currentLevel + 1)
              );

              const updatedEco: PlayerEconomyState = {
                ...ecoPrev,
                coins: ecoPrev.coins + fruitCoins + levelReward,
                unlockedLevels: {
                  ...ecoPrev.unlockedLevels,
                  [prev.difficulty]: nextUnlocked,
                },
                completedLevels: {
                  ...ecoPrev.completedLevels,
                  [levelKey]: {
                    stars: Math.max(prevBest?.stars || 0, stars),
                    bestScore: Math.max(prevBest?.bestScore || 0, nextScore),
                  },
                },
                stats: {
                  totalFruitsEaten: ecoPrev.stats.totalFruitsEaten + 1,
                  goldenFruitsEaten:
                    ecoPrev.stats.goldenFruitsEaten + (prev.fruit.type === 'golden' ? 1 : 0),
                  levelsClearedCount: ecoPrev.stats.levelsClearedCount + 1,
                  maxSnakeLength: Math.max(ecoPrev.stats.maxSnakeLength, nextSnake.length),
                  highestSingleScore: Math.max(ecoPrev.stats.highestSingleScore, nextScore),
                },
              };
              saveEconomyState(updatedEco);
              return updatedEco;
            });

            return {
              ...prev,
              snake: nextSnake,
              direction: nextDir,
              score: nextScore,
              highScore: nextHighScore,
              speedTPS: nextSpeed,
              state: 'levelcomplete',
              sessionCoinsEarned: nextSessionCoins + completionBonus,
              levelCompletionReward: completionBonus,
              earnedStars: stars,
              cutSegments: [],
              cutEffectTimestamp: null,
            };
          }

          // Update economy coins & stats for fruit eaten
          setEconomy((ecoPrev) => {
            const updatedEco: PlayerEconomyState = {
              ...ecoPrev,
              coins: ecoPrev.coins + fruitCoins,
              stats: {
                ...ecoPrev.stats,
                totalFruitsEaten: ecoPrev.stats.totalFruitsEaten + 1,
                goldenFruitsEaten:
                  ecoPrev.stats.goldenFruitsEaten + (prev.fruit.type === 'golden' ? 1 : 0),
                maxSnakeLength: Math.max(ecoPrev.stats.maxSnakeLength, nextSnake.length),
                highestSingleScore: Math.max(ecoPrev.stats.highestSingleScore, nextScore),
              },
            };
            saveEconomyState(updatedEco);
            return updatedEco;
          });

          const spawned = spawnFruit(nextSnake, prev.obstacles, gridCols, gridRows);
          if (!spawned) {
            soundManager.playLevelComplete();
            return {
              ...prev,
              snake: nextSnake,
              direction: nextDir,
              score: nextScore,
              highScore: nextHighScore,
              speedTPS: nextSpeed,
              state: 'levelcomplete',
              sessionCoinsEarned: nextSessionCoins,
              earnedStars: 3,
              cutSegments: [],
              cutEffectTimestamp: null,
            };
          }
          nextFruit = spawned;
        }

        return {
          ...prev,
          snake: nextSnake,
          direction: nextDir,
          fruit: nextFruit,
          score: nextScore,
          highScore: nextHighScore,
          speedTPS: nextSpeed,
          sessionCoinsEarned: nextSessionCoins,
          cutSegments,
          cutEffectTimestamp,
        };
      });
    }, tickIntervalMs);

    return () => window.clearInterval(timer);
  }, [engineState.state, engineState.speedTPS]);

  // Keyboard Listener (WASD, Arrows, Space/P to Pause, Enter to Start)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (engineState.state === 'playing') {
        switch (e.key) {
          case 'ArrowUp':
          case 'w':
          case 'W':
            handleDirectionInput('UP');
            break;
          case 'ArrowDown':
          case 's':
          case 'S':
            handleDirectionInput('DOWN');
            break;
          case 'ArrowLeft':
          case 'a':
          case 'A':
            handleDirectionInput('LEFT');
            break;
          case 'ArrowRight':
          case 'd':
          case 'D':
            handleDirectionInput('RIGHT');
            break;
          case ' ':
          case 'p':
          case 'P':
          case 'Escape':
            pauseGame();
            break;
        }
      } else if (engineState.state === 'paused') {
        if (e.key === ' ' || e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
          resumeGame();
        }
      } else if (engineState.state === 'menu') {
        if (e.key === 'Enter') {
          startGame();
        }
      } else if (engineState.state === 'gameover') {
        if (e.key === 'Enter') {
          restartGame();
        }
      } else if (engineState.state === 'levelcomplete') {
        if (e.key === 'Enter') {
          startNextLevel();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    engineState.state,
    handleDirectionInput,
    pauseGame,
    resumeGame,
    startGame,
    restartGame,
    startNextLevel,
  ]);

  return {
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
    setSnakeSkin,
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
  };
}
