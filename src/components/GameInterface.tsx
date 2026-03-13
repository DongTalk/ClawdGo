/**
 * 游戏界面组件 - 完整版
 * 严格对照完善的游戏规则.md实现
 */

import type { AreaState, GameState, Player } from '@/types/gameRules';
import { Button } from '@/components/ui/button';
import { useState, useEffect, useMemo } from 'react';
import { 
  TurnPhaseIndicator, 
  RegionMap,
  type RegionId,
  JudgmentPanel,
  type RPSChoice,
  type JudgmentType,
  TechTreePanel,
  CardDetail,
  type CardData,
  GameLogPanel,
  EnhancedCardHand
} from './game';
import { JudgmentProcessPanel } from './game/judgment/JudgmentProcessPanel';
import { JudgmentEventBus, type JudgmentEventData } from '@/engine/JudgmentEventBus';
import type { TurnPhase } from '@/types/gameRules';
import { Sword, Shield, Cpu, Coins, Eye, Key, Zap, Sparkles } from 'lucide-react';
import { getActionPointsByRound } from '@/types/gameConstants';
import { COMPLETE_CARD_DATABASE } from '@/data/completeCardDatabase';
import { ComboStateManager, type ComboState } from '@/engine/ComboStateManager';

interface GameInterfaceProps {
  gameState: GameState;
  currentPlayer: Player;
  currentPhase?: TurnPhase;
  phaseTimeLeft?: number;
  phaseTotalTime?: number;
  gameLogs?: string[];
  onPlayCard: (cardIndex: number) => void;
  onEndTurn: () => void;
  onDiscardCard?: (cardIndex: number) => void;
  isPlayerTurn?: boolean;
  onGameStateUpdate?: (newGameState: GameState) => void;
}

// 模拟科技节点
const MOCK_TECH_NODES = [
  {
    id: 'tech-1-1',
    name: '基础侦查技术',
    level: 1 as const,
    requiredLevel: 15,
    description: '解锁基础侦查卡牌',
    unlockedCards: ['ATK-001', 'DEF-001'],
    isUnlocked: true,
    canUnlock: false,
    icon: '🔍'
  },
  {
    id: 'tech-1-2',
    name: '漏洞挖掘',
    level: 1 as const,
    requiredLevel: 15,
    description: '解锁漏洞利用卡牌',
    unlockedCards: ['ATK-002'],
    isUnlocked: false,
    canUnlock: true,
    icon: '🐛'
  },
  {
    id: 'tech-2-1',
    name: '高级渗透',
    level: 2 as const,
    requiredLevel: 30,
    description: '解锁高级攻击卡牌',
    unlockedCards: [],
    isUnlocked: false,
    canUnlock: false,
    icon: '🚀'
  }
];

export function GameInterface({ 
  gameState, 
  currentPlayer, 
  currentPhase: externalPhase,
  phaseTimeLeft: externalTimeLeft,
  phaseTotalTime: externalTotalTime,
  gameLogs: _externalGameLogs,
  onPlayCard,
  onEndTurn,
  onDiscardCard: _onDiscardCard,
  isPlayerTurn = true,
  onGameStateUpdate
}: GameInterfaceProps) {
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<RegionId | null>(null);
  const [judgmentType, setJudgmentType] = useState<JudgmentType>(null);
  const [internalPhase, setInternalPhase] = useState<TurnPhase>('judgment');
  const [showTechTree, setShowTechTree] = useState(false);
  const [showCardDetail, setShowCardDetail] = useState(false);
  
  // 判定面板状态
  const [judgmentProcessOpen, setJudgmentProcessOpen] = useState(false);
  const [currentJudgmentEvent, setCurrentJudgmentEvent] = useState<JudgmentEventData | null>(null);
  
  // 连击状态
  const [comboState, setComboState] = useState<ComboState>(ComboStateManager.getState(currentPlayer.id));
  
  // 使用外部传入的阶段或内部状态
  const currentPhase = externalPhase || internalPhase;
  const selectedCard = useMemo<CardData | null>(() => {
    if (selectedCardIndex === null) return null;
    const cardId = currentPlayer.hand[selectedCardIndex];
    const rawCard = cardId ? COMPLETE_CARD_DATABASE[cardId] : null;
    if (!rawCard) return null;

    return {
      id: rawCard.card_code,
      name: rawCard.name,
      type: rawCard.type as CardData['type'],
      faction: rawCard.faction === 'attack' ? 'attacker' : 'defender',
      rarity: rawCard.rarity,
      techLevel: rawCard.techLevel,
      description: rawCard.description,
      flavorText: rawCard.flavorText,
      cost: {
        compute: rawCard.cost.compute || 0,
        funds: rawCard.cost.funds || 0,
        information: rawCard.cost.information || 0,
        permission: rawCard.cost.access || 0,
      },
      effects: rawCard.effects.map((effect) => ({
        type: effect.type,
        description: 'description' in effect ? effect.description : effect.type,
        value: 'value' in effect ? effect.value : undefined,
      })),
      keywords: [
        ...(rawCard.comboEffect ? ['连击'] : []),
        ...(rawCard.sustainEffect ? ['持续'] : []),
        ...(rawCard.counterEffect ? ['响应'] : []),
      ],
      difficulty: rawCard.difficulty,
    };
  }, [currentPlayer.hand, selectedCardIndex]);
  
  // 将 gameState.areas 转换为 RegionMap 需要的格式
  const mapRegions = useMemo(() => {
    const regionData = gameState.areas;
    const players = gameState.players;
    
    const convertController = (controlledBy: string | null): 'attacker' | 'defender' | 'neutral' => {
      if (!controlledBy) return 'neutral';
      return controlledBy as 'attacker' | 'defender';
    };
    
    const countTokens = (area: AreaState, faction: 'attacker' | 'defender') => {
      return area.tokens.filter(t => {
        const owner = players.find(p => p.id === t.owner);
        return owner?.faction === faction;
      }).length;
    };
    
    const countThreatMarks = (area: AreaState) => {
      return area.tokens.filter(t => t.type === 'threat').length;
    };
    
    const countDefenseMarks = (area: AreaState) => {
      return area.tokens.filter(t => t.type === 'defense').length;
    };
    
    return {
      perimeter: {
        id: 'perimeter' as RegionId,
        name: '网络边界',
        description: '外部攻击第一道防线',
        controller: convertController(regionData.perimeter.controlledBy),
        attackerMarks: countTokens(regionData.perimeter, 'attacker'),
        defenderMarks: countTokens(regionData.perimeter, 'defender'),
        threatMarks: countThreatMarks(regionData.perimeter),
        defenseMarks: countDefenseMarks(regionData.perimeter),
        attackerBonus: '每回合渗透+1',
        defenderBonus: '每回合安全+1'
      },
      dmz: {
        id: 'dmz' as RegionId,
        name: '隔离区',
        description: '缓冲带',
        controller: convertController(regionData.dmz.controlledBy),
        attackerMarks: countTokens(regionData.dmz, 'attacker'),
        defenderMarks: countTokens(regionData.dmz, 'defender'),
        threatMarks: countThreatMarks(regionData.dmz),
        defenseMarks: countDefenseMarks(regionData.dmz),
        attackerBonus: '行动点+1',
        defenderBonus: '行动点+1'
      },
      internal: {
        id: 'internal' as RegionId,
        name: '内网',
        description: '防御方核心',
        controller: convertController(regionData.internal.controlledBy),
        attackerMarks: countTokens(regionData.internal, 'attacker'),
        defenderMarks: countTokens(regionData.internal, 'defender'),
        threatMarks: countThreatMarks(regionData.internal),
        defenseMarks: countDefenseMarks(regionData.internal),
        attackerBonus: '每回合渗透+2',
        defenderBonus: '每回合安全+1'
      },
      ics: {
        id: 'ics' as RegionId,
        name: '工控系统',
        description: '高价值目标',
        controller: convertController(regionData.ics.controlledBy),
        attackerMarks: countTokens(regionData.ics, 'attacker'),
        defenderMarks: countTokens(regionData.ics, 'defender'),
        threatMarks: countThreatMarks(regionData.ics),
        defenseMarks: countDefenseMarks(regionData.ics),
        attackerBonus: '每回合渗透+2',
        defenderBonus: '每回合安全+2'
      }
    };
  }, [gameState.areas, gameState.players]);
  
  // 订阅连击状态变化
  useEffect(() => {
    const unsubscribe = ComboStateManager.subscribe((playerId, state) => {
      if (playerId === currentPlayer.id) {
        setComboState(state);
      }
    });
    return () => unsubscribe();
  }, [currentPlayer.id]);
  
  // 订阅判定事件
  useEffect(() => {
    // 订阅判定开始事件
    const unsubscribeStart = JudgmentEventBus.onJudgmentStart((data) => {
      console.log('[GameInterface] 收到判定开始事件:', data.title);
      setCurrentJudgmentEvent(data);
      setJudgmentProcessOpen(true);
    });
    
    // 订阅判定结束事件
    const unsubscribeEnd = JudgmentEventBus.onJudgmentEnd((data) => {
      console.log('[GameInterface] 收到判定结束事件:', data.id);
      // 延迟关闭面板，让玩家看到结果
      setTimeout(() => {
        setJudgmentProcessOpen(false);
        setCurrentJudgmentEvent(null);
      }, 1000);
    });
    
    return () => {
      unsubscribeStart();
      unsubscribeEnd();
    };
  }, []);
  
  // 行动点从游戏状态获取
  // 根据轮次获取行动点上限（R2.3: 1-4轮次3点，5-8轮次4点，9-12轮次5点）
  const actionPoints = {
    current: currentPlayer.remainingActions || 0,
    max: currentPlayer.maxActions || getActionPointsByRound(gameState.round)
  };

  // 模拟猜拳状态
  const [rpsState, setRpsState] = useState({
    playerChoice: undefined as RPSChoice | undefined,
    opponentChoice: undefined as RPSChoice | undefined,
    playerCommitted: false,
    opponentCommitted: false,
    result: undefined as 'win' | 'lose' | 'draw' | undefined
  });

  // 模拟骰子状态
  const [diceState, setDiceState] = useState({
    playerRoll: 0,
    opponentRoll: undefined as number | undefined,
    difficulty: 4,
    isCriticalSuccess: false,
    isCriticalFail: false,
    canReroll: true,
    hasRerolled: false
  });

  const handleRPSChoice = (choice: RPSChoice) => {
    setRpsState(prev => ({ ...prev, playerChoice: choice }));
    // 模拟对手选择和结果
    const choices: RPSChoice[] = ['rock', 'paper', 'scissors'];
    const opponentChoice = choices[Math.floor(Math.random() * 3)];
    
    let result: 'win' | 'lose' | 'draw';
    if (choice === opponentChoice) {
      result = 'draw';
    } else if (
      (choice === 'rock' && opponentChoice === 'scissors') ||
      (choice === 'paper' && opponentChoice === 'rock') ||
      (choice === 'scissors' && opponentChoice === 'paper')
    ) {
      result = 'win';
    } else {
      result = 'lose';
    }
    
    setTimeout(() => {
      setRpsState(prev => ({ ...prev, opponentChoice, result }));
    }, 500);
  };

  const handleDiceRoll = () => {
    const roll = Math.floor(Math.random() * 6) + 1;
    setDiceState(prev => ({
      ...prev,
      playerRoll: roll,
      isCriticalSuccess: roll === 6,
      isCriticalFail: roll === 1
    }));
  };

  const handleDiceReroll = () => {
    const roll = Math.floor(Math.random() * 6) + 1;
    setDiceState(prev => ({
      ...prev,
      playerRoll: roll,
      isCriticalSuccess: roll === 6,
      isCriticalFail: roll === 1,
      hasRerolled: true
    }));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* 游戏标题 */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            ClawdGo
          </h1>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-slate-800 rounded-full text-sm">
              {currentPlayer.faction === 'attacker' ? (
                <span className="flex items-center gap-1 text-red-400">
                  <Sword className="w-4 h-4" /> 进攻方
                </span>
              ) : (
                <span className="flex items-center gap-1 text-blue-400">
                  <Shield className="w-4 h-4" /> 防御方
                </span>
              )}
            </span>
          </div>
        </div>

        {/* 7阶段回合指示器 */}
        <TurnPhaseIndicator
          currentPhase={currentPhase}
          roundNumber={gameState.round}
          maxRounds={gameState.maxRounds}
          actionPoints={actionPoints}
          onPhaseClick={(phase) => setInternalPhase(phase)}
        />

        {/* 阶段计时器和状态 */}
        <div className="flex justify-between items-center bg-slate-800 p-3 rounded-lg">
          <div className="flex items-center gap-4">
            <span className="text-lg font-bold text-blue-400">
              当前阶段: {currentPhase === 'judgment' && '判定阶段'}
              {currentPhase === 'recovery' && '恢复阶段'}
              {currentPhase === 'draw' && '摸牌阶段'}
              {currentPhase === 'action' && '行动阶段'}
              {currentPhase === 'response' && '响应阶段'}
              {currentPhase === 'discard' && '弃牌阶段'}
              {currentPhase === 'end' && '结束阶段'}
            </span>
            {externalTotalTime && externalTotalTime > 0 && (
              <span className={`font-mono text-lg ${externalTimeLeft && externalTimeLeft <= 5 ? 'text-red-500 animate-pulse' : 'text-green-400'}`}>
                ⏱️ {externalTimeLeft}s / {externalTotalTime}s
              </span>
            )}
          </div>
          <div className="text-sm text-slate-400">
            {isPlayerTurn ? '🎮 你的回合' : '🤖 AI回合'}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* 左侧：玩家信息和资源 */}
          <div className="space-y-4">
            {/* 玩家信息 */}
            <div className="bg-slate-900 p-4 rounded-lg shadow-lg">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span>👤</span> {currentPlayer.name}
              </h3>
              
              {/* 渗透/安全等级 */}
              <div className="space-y-3 mb-4">
                {currentPlayer.faction === 'attacker' ? (
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-400">渗透等级</span>
                      <div className="flex items-center gap-2">
                        {/* 显示队伍共享等级和个体偏移 */}
                        {gameState.teamSharedLevels && (
                          <span className="text-xs text-slate-500">
                            (队伍{currentPlayer.team}: {gameState.teamSharedLevels[currentPlayer.team || 'A']?.infiltrationLevel || 0}
                            {currentPlayer.individualModifiers?.infiltrationLevelOffset !== 0 && (
                              <span className={currentPlayer.individualModifiers.infiltrationLevelOffset > 0 ? 'text-green-400' : 'text-red-400'}>
                                {currentPlayer.individualModifiers.infiltrationLevelOffset > 0 ? '+' : ''}{currentPlayer.individualModifiers.infiltrationLevelOffset}
                              </span>
                            )})
                          </span>
                        )}
                        <span className="text-red-400 font-bold">{currentPlayer.infiltrationLevel}/75</span>
                      </div>
                    </div>
                    <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all"
                        style={{ width: `${(currentPlayer.infiltrationLevel / 75) * 100}%` }}
                      />
                    </div>
                    {/* 显示个体修正状态 */}
                    {currentPlayer.individualModifiers && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {currentPlayer.individualModifiers.cannotGainInfiltration && (
                          <span className="text-[10px] bg-red-900/50 text-red-300 px-1 rounded">无法提升</span>
                        )}
                        {currentPlayer.individualModifiers.infiltrationGainModifier !== 1.0 && (
                          <span className="text-[10px] bg-yellow-900/50 text-yellow-300 px-1 rounded">
                            速度{(currentPlayer.individualModifiers.infiltrationGainModifier * 100).toFixed(0)}%
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-400">安全等级</span>
                      <div className="flex items-center gap-2">
                        {/* 显示队伍共享等级和个体偏移 */}
                        {gameState.teamSharedLevels && (
                          <span className="text-xs text-slate-500">
                            (队伍{currentPlayer.team}: {gameState.teamSharedLevels[currentPlayer.team || 'B']?.safetyLevel || 0}
                            {currentPlayer.individualModifiers?.safetyLevelOffset !== 0 && (
                              <span className={currentPlayer.individualModifiers.safetyLevelOffset > 0 ? 'text-green-400' : 'text-red-400'}>
                                {currentPlayer.individualModifiers.safetyLevelOffset > 0 ? '+' : ''}{currentPlayer.individualModifiers.safetyLevelOffset}
                              </span>
                            )})
                          </span>
                        )}
                        <span className="text-blue-400 font-bold">{currentPlayer.safetyLevel}/75</span>
                      </div>
                    </div>
                    <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all"
                        style={{ width: `${(currentPlayer.safetyLevel / 75) * 100}%` }}
                      />
                    </div>
                    {/* 显示个体修正状态 */}
                    {currentPlayer.individualModifiers && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {currentPlayer.individualModifiers.cannotGainSafety && (
                          <span className="text-[10px] bg-red-900/50 text-red-300 px-1 rounded">无法提升</span>
                        )}
                        {currentPlayer.individualModifiers.safetyGainModifier !== 1.0 && (
                          <span className="text-[10px] bg-yellow-900/50 text-yellow-300 px-1 rounded">
                            速度{(currentPlayer.individualModifiers.safetyGainModifier * 100).toFixed(0)}%
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* 资源面板 */}
            <div className="bg-slate-900 p-4 rounded-lg shadow-lg">
              <h3 className="font-bold mb-3 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" /> 资源
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-800 p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                    <Cpu className="w-4 h-4" /> 算力
                  </div>
                  <div className="text-xl font-bold">
                    {currentPlayer.resources.compute}
                    <span className="text-sm text-slate-500 font-normal">/15</span>
                  </div>
                  <div className="text-xs text-green-400">+2/回合</div>
                </div>
                <div className="bg-slate-800 p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                    <Coins className="w-4 h-4" /> 资金
                  </div>
                  <div className="text-xl font-bold">
                    {currentPlayer.resources.funds}
                    <span className="text-sm text-slate-500 font-normal">/20</span>
                  </div>
                  <div className="text-xs text-green-400">+2/回合</div>
                </div>
                <div className="bg-slate-800 p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                    <Eye className="w-4 h-4" /> 信息
                  </div>
                  <div className="text-xl font-bold">
                    {currentPlayer.resources.information}
                    <span className="text-sm text-slate-500 font-normal">/10</span>
                  </div>
                  <div className="text-xs text-green-400">+2/回合</div>
                </div>
                <div className="bg-slate-800 p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                    <Key className="w-4 h-4" /> 权限
                  </div>
                  <div className="text-xl font-bold">
                    {currentPlayer.resources.permission}
                    <span className="text-sm text-slate-500 font-normal">/5</span>
                  </div>
                  <div className="text-xs text-slate-500">特殊获取</div>
                </div>
              </div>
            </div>

            {/* 游戏日志 - 使用增强版GameLogPanel */}
            <GameLogPanel 
              logs={gameState.log || []}
              currentRound={gameState.round}
              currentPhase={currentPhase}
              maxHeight="250px"
            />

            {/* 科技树按钮 */}
            <div className="bg-slate-900 p-4 rounded-lg shadow-lg">
              <h3 className="font-bold mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-400" /> 科技树
              </h3>
              <Button 
                onClick={() => setShowTechTree(true)}
                variant="outline" 
                className="w-full"
              >
                查看科技树
              </Button>
              <p className="text-xs text-slate-500 mt-2">
                当前{currentPlayer.faction === 'attacker' ? '渗透' : '安全'}等级: 
                {currentPlayer.faction === 'attacker' 
                  ? currentPlayer.infiltrationLevel 
                  : currentPlayer.safetyLevel}/75
              </p>
            </div>
          </div>

          {/* 中间：区域地图 */}
          <div className="lg:col-span-2 space-y-4">
            <RegionMap
              regions={mapRegions}
              currentFaction={currentPlayer.faction}
              onRegionClick={(regionId) => setSelectedRegion(regionId)}
              selectedRegion={selectedRegion}
            />

            {/* 手牌区域 - 使用增强版EnhancedCardHand */}
            <EnhancedCardHand
              hand={currentPlayer.hand}
              selectedCardIndex={selectedCardIndex}
              onSelectCard={setSelectedCardIndex}
              onPlayCard={onPlayCard}
              onDiscardCard={_onDiscardCard}
              onEndTurn={onEndTurn}
              currentPhase={currentPhase}
              isPlayerTurn={isPlayerTurn}
              comboState={comboState}
              maxHandSize={gameState.round <= 4 ? 3 : gameState.round <= 8 ? 4 : 5}
            />
          </div>
        </div>
      </div>

      {/* 旧的判定面板弹窗（保留兼容性） */}
      {judgmentType && (
        <JudgmentPanel
          type={judgmentType}
          rpsState={judgmentType === 'rps' ? rpsState : undefined}
          diceState={judgmentType === 'dice' ? diceState : undefined}
          onRPSChoice={handleRPSChoice}
          onRPSCommit={(commit) => setRpsState(prev => ({ ...prev, playerCommitted: commit }))}
          onDiceRoll={handleDiceRoll}
          onDiceReroll={handleDiceReroll}
          onClose={() => {
            setJudgmentType(null);
            setRpsState({
              playerChoice: undefined,
              opponentChoice: undefined,
              playerCommitted: false,
              opponentCommitted: false,
              result: undefined
            });
            setDiceState({
              playerRoll: 0,
              opponentRoll: undefined,
              difficulty: 4,
              isCriticalSuccess: false,
              isCriticalFail: false,
              canReroll: true,
              hasRerolled: false
            });
          }}
        />
      )}

      {/* 新的判定过程面板（由事件总线触发） */}
      <JudgmentProcessPanel
        isOpen={judgmentProcessOpen}
        eventData={currentJudgmentEvent}
        currentPlayerId={currentPlayer.id}
        gameState={gameState}
        onComplete={(result) => {
          console.log('[GameInterface] 判定完成:', result);
        }}
        onGameStateUpdate={(newGameState) => {
          console.log('[GameInterface] 游戏状态更新:', newGameState);
          onGameStateUpdate?.(newGameState);
        }}
      />

      {/* 科技树面板 */}
      {showTechTree && (
        <TechTreePanel
          faction={currentPlayer.faction}
          currentLevel={currentPlayer.faction === 'attacker' 
            ? currentPlayer.infiltrationLevel 
            : currentPlayer.safetyLevel}
          techNodes={MOCK_TECH_NODES}
          onUnlockNode={(nodeId) => {
            console.log('解锁科技节点:', nodeId);
            setShowTechTree(false);
          }}
          onClose={() => setShowTechTree(false)}
        />
      )}

      {/* 卡牌详情弹窗 */}
      {showCardDetail && selectedCard && (
        <CardDetail
          card={selectedCard}
          isOpen={showCardDetail}
          onClose={() => setShowCardDetail(false)}
          onPlay={() => {
            if (selectedCardIndex !== null) {
              onPlayCard(selectedCardIndex);
              setShowCardDetail(false);
            }
          }}
          canPlay={selectedCardIndex !== null && isPlayerTurn}
          currentResources={currentPlayer.resources}
        />
      )}
    </div>
  );
}

export default GameInterface;
