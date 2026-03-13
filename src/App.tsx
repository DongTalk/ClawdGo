import { useState, useCallback, useEffect, useRef } from 'react';
import { GameLobby, type GameConfig } from '@/components/GameLobby';
import { GameRoom } from '@/components/GameRoom';
import { GameInterface } from '@/components/GameInterface';
import { Toaster } from '@/components/ui/sonner';
import type { Faction, Player, GameState, TurnPhase } from '@/types/gameRules';
import type { CharacterId } from '@/types/characterRules';
import { GameStateManager } from '@/engine/GameStateManager_v2';
import { GameLoop } from '@/engine/GameLoop';
import { TurnPhaseSystem } from '@/engine/TurnPhaseSystem';
import { getHandLimitByRound } from '@/types/gameConstants';
import './styles/theme.css';

type AppScreen = 'lobby' | 'room' | 'game';

function App() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('lobby');
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [gameStateManager] = useState(() => new GameStateManager());
  const gameLoopRef = useRef<GameLoop | null>(null);
  const [currentPhase, setCurrentPhase] = useState<TurnPhase>('judgment');
  const [phaseTimeLeft, setPhaseTimeLeft] = useState(0);
  const [phaseTotalTime, setPhaseTotalTime] = useState(0);
  const [gameLogs, setGameLogs] = useState<string[]>([]);
  const [hostPlayer, setHostPlayer] = useState<{ 
    name: string; 
    faction: Faction;
    characterId: CharacterId;
  } | null>(null);

  // 更新游戏状态
  const updateGameState = useCallback((newState: GameState) => {
    setGameState(newState);
    setCurrentPhase(newState.currentPhase);
  }, []);

  // 添加游戏日志
  const addGameLog = useCallback((log: string) => {
    setGameLogs(prev => [...prev, log]);
  }, []);

  // 快速开始游戏（1v1模式）
  const handleStartGame = useCallback((config: GameConfig) => {
    // 初始化游戏
    const initialState = gameStateManager.initGame({
      gameId: `game_${Date.now()}`,
      players: [
        {
          id: 'p1',
          name: config.playerName,
          faction: config.faction,
          characterId: config.characterId || 'AR01',
          isAI: false,
        },
        {
          id: 'p2',
          name: 'AI对手',
          faction: config.faction === 'attacker' ? 'defender' : 'attacker',
          characterId: config.faction === 'attacker' ? 'DR01' : 'AR01',
          isAI: true,
          aiDifficulty: config.aiDifficulty || 'medium',
        }
      ]
    });

    // 设置状态变更回调
    gameStateManager.setOnStateChange((state) => {
      updateGameState(state);
    });

    // 初始化游戏循环
    const gameLoop = new GameLoop({
      gameStateManager,
      onStateChange: (state) => {
        updateGameState(state);
      },
      onPhaseChange: (phase: TurnPhase) => {
        setCurrentPhase(phase);
        const currentState = gameStateManager.getGameState();
        if (currentState) {
          addGameLog(`=== 第${currentState.round}轮次 - ${TurnPhaseSystem.getPhaseName(phase)} ===`);
        }
      },
      onTimerUpdate: (remaining: number, total: number) => {
        setPhaseTimeLeft(remaining);
        setPhaseTotalTime(total);
      },
      onVictory: (result) => {
        addGameLog(`🎉 游戏结束！${result.winner} 获胜 - ${result.victoryType}`);
      },
      onError: (error: string) => {
        addGameLog(`❌ 错误: ${error}`);
      },
    });

    gameLoopRef.current = gameLoop;
    
    // 启动游戏循环
    gameLoop.start();
    
    updateGameState(initialState);
    setCurrentScreen('game');
  }, [gameStateManager, updateGameState, addGameLog]);

  // 进入房间
  const handleEnterRoom = useCallback((player: { name: string; faction: Faction; characterId: CharacterId }) => {
    setHostPlayer(player);
    setCurrentScreen('room');
  }, []);

  // 房间开始游戏
  const handleRoomStartGame = useCallback((players: Player[]) => {
    // 转换玩家配置
    const playerConfigs = players.map(p => ({
      id: p.id,
      name: p.name,
      faction: p.faction,
      characterId: p.characterId as CharacterId,
      isAI: p.isAI,
      aiDifficulty: p.aiDifficulty,
    }));

    // 初始化游戏
    const initialState = gameStateManager.initGame({
      gameId: `game_${Date.now()}`,
      players: playerConfigs,
    });

    // 设置状态变更回调
    gameStateManager.setOnStateChange((state) => {
      updateGameState(state);
    });

    // 初始化游戏循环
    const gameLoop = new GameLoop({
      gameStateManager,
      onStateChange: (state) => {
        updateGameState(state);
      },
      onPhaseChange: (phase: TurnPhase) => {
        setCurrentPhase(phase);
        const currentState = gameStateManager.getGameState();
        if (currentState) {
          addGameLog(`=== 第${currentState.round}轮次 - ${TurnPhaseSystem.getPhaseName(phase)} ===`);
        }
      },
      onTimerUpdate: (remaining: number, total: number) => {
        setPhaseTimeLeft(remaining);
        setPhaseTotalTime(total);
      },
      onVictory: (result) => {
        addGameLog(`🎉 游戏结束！${result.winner} 获胜 - ${result.victoryType}`);
      },
      onError: (error: string) => {
        addGameLog(`❌ 错误: ${error}`);
      },
    });

    gameLoopRef.current = gameLoop;
    
    // 启动游戏循环
    gameLoop.start();
    
    updateGameState(initialState);
    setCurrentScreen('game');
  }, [gameStateManager, updateGameState, addGameLog]);

  // 取消房间
  const handleRoomCancel = useCallback(() => {
    setHostPlayer(null);
    setCurrentScreen('lobby');
  }, []);

  // 出牌处理
  const handlePlayCard = useCallback((cardIndex: number) => {
    if (!gameState) return;
    
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    if (!currentPlayer) return;
    
    // 检查是否在行动阶段
    if (gameState.currentPhase !== 'action') {
      addGameLog('❌ 只能在行动阶段出牌');
      return;
    }
    
    // 检查是否有剩余行动点
    if (currentPlayer.remainingActions <= 0) {
      addGameLog('❌ 没有剩余行动点');
      return;
    }
    
    // 执行出牌
    const success = gameStateManager.playCard(currentPlayer.id, cardIndex);
    
    if (success) {
      addGameLog(`✅ ${currentPlayer.name} 打出了一张卡牌`);
      // 通知游戏循环出牌成功（用于延长计时器）
      gameLoopRef.current?.notifyCardPlayed();
    } else {
      addGameLog('❌ 出牌失败');
    }
  }, [gameState, gameStateManager, addGameLog]);

  // 结束回合
  const handleEndTurn = useCallback(() => {
    if (!gameState) return;
    
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    if (!currentPlayer) return;
    
    // 检查是否在行动阶段
    if (gameState.currentPhase !== 'action') {
      addGameLog('❌ 只能在行动阶段结束回合');
      return;
    }
    
    addGameLog(`${currentPlayer.name} 结束回合`);
    
    // 手动推进到下一阶段
    gameLoopRef.current?.advancePhase();
  }, [gameState, addGameLog]);

  // 弃牌处理
  const handleDiscardCard = useCallback((cardIndex: number) => {
    if (!gameState) return;
    
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    if (!currentPlayer) return;
    
    // 检查是否在弃牌阶段
    if (gameState.currentPhase !== 'discard') {
      addGameLog('❌ 只能在弃牌阶段弃牌');
      return;
    }
    
    // 执行弃牌
    const success = gameStateManager.discardCard(currentPlayer.id, cardIndex);
    
    if (success) {
      addGameLog(`${currentPlayer.name} 弃置了一张卡牌`);
      
      // 检查是否还需要继续弃牌
      // 根据轮次获取手牌上限（R4.3: 1-4轮次3张，5-8轮次4张，9-12轮次5张）
      const handLimit = getHandLimitByRound(gameState.round);
      const currentHandSize = currentPlayer.hand.length - 1; // 已经弃掉一张
      
      if (currentHandSize <= handLimit) {
        addGameLog('✅ 弃牌完成，进入下一阶段');
        // 延迟后自动推进到下一阶段
        setTimeout(() => {
          gameLoopRef.current?.advancePhase();
        }, 500);
      }
    } else {
      addGameLog('❌ 弃牌失败');
    }
  }, [gameState, gameStateManager, addGameLog]);

  // 清理游戏循环
  useEffect(() => {
    return () => {
      if (gameLoopRef.current) {
        gameLoopRef.current.stop();
      }
    };
  }, []);

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-deep-space)' }}>
      {currentScreen === 'lobby' && (
        <GameLobby 
          onStartGame={handleStartGame}
          onEnterRoom={handleEnterRoom}
        />
      )}
      
      {currentScreen === 'room' && hostPlayer && (
        <GameRoom
          hostPlayer={hostPlayer}
          onStartGame={handleRoomStartGame}
          onCancel={handleRoomCancel}
        />
      )}
      
      {currentScreen === 'game' && gameState && gameState.players.length > 0 && (
        <GameInterface 
          gameState={gameState}
          currentPlayer={gameState.players[gameState.currentPlayerIndex]}
          currentPhase={currentPhase}
          phaseTimeLeft={phaseTimeLeft}
          phaseTotalTime={phaseTotalTime}
          gameLogs={gameLogs}
          onPlayCard={handlePlayCard}
          onEndTurn={handleEndTurn}
          onDiscardCard={handleDiscardCard}
          isPlayerTurn={!gameState.players[gameState.currentPlayerIndex]?.isAI}
        />
      )}
      
      <Toaster />
    </div>
  );
}

export default App;
