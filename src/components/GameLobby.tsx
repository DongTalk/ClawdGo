import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Bot, Users, Play, Settings, 
  Shield, Swords, Trophy, Clock, 
  UserPlus
} from 'lucide-react';
import type { Faction, Player } from '@/types/gameRules';
import type { CharacterId, CharacterDefinition } from '@/types/characterRules';
import { CHARACTER_DATABASE } from '@/data/characterDatabase';
import { PLAYER_NAME_RULES } from '@/types/gameConstants';

interface GameLobbyProps {
  onStartGame?: (config: GameConfig) => void;
  onEnterRoom?: (hostPlayer: { name: string; faction: Faction; characterId: CharacterId }) => void;
}

export interface GameConfig {
  gameId?: string;
  playerName: string;
  faction: Faction;
  characterId?: CharacterId;
  mode: '1v1' | '2v2';
  isAI?: boolean;
  aiDifficulty?: 'easy' | 'medium' | 'hard';
  players?: Player[];
}

// 根据阵营获取可用角色
function getCharactersByFaction(faction: Faction): CharacterDefinition[] {
  return Object.values(CHARACTER_DATABASE).filter(char => char.faction === faction);
}

export function GameLobby({ onStartGame: _onStartGame, onEnterRoom }: GameLobbyProps) {
  const [playerName, setPlayerName] = useState('玩家' + Math.floor(Math.random() * 1000));
  const [nameError, setNameError] = useState<string>('');
  const [selectedFaction, setSelectedFaction] = useState<Faction>('attacker');
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterId>('AR01');
  const [gameMode, setGameMode] = useState<'1v1' | '2v2'>('2v2');
  const [aiDifficulty, setAiDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

  /**
   * 验证玩家名称
   * 规则：2-20个字符，只允许中文、英文、数字和下划线
   */
  const validatePlayerName = (name: string): { valid: boolean; error: string } => {
    if (name.length < PLAYER_NAME_RULES.MIN_LENGTH) {
      return { valid: false, error: `玩家名称至少需要${PLAYER_NAME_RULES.MIN_LENGTH}个字符` };
    }
    if (name.length > PLAYER_NAME_RULES.MAX_LENGTH) {
      return { valid: false, error: `玩家名称不能超过${PLAYER_NAME_RULES.MAX_LENGTH}个字符` };
    }
    // 只允许中文、英文、数字和下划线
    if (!PLAYER_NAME_RULES.ALLOWED_PATTERN.test(name)) {
      return { valid: false, error: '名称只能包含中文、英文、数字和下划线' };
    }
    return { valid: true, error: '' };
  };

  /**
   * 处理玩家名称变化
   */
  const handlePlayerNameChange = (value: string) => {
    setPlayerName(value);
    const validation = validatePlayerName(value);
    setNameError(validation.error);
  };

  // 当阵营改变时，更新默认角色
  const handleFactionChange = (faction: Faction) => {
    setSelectedFaction(faction);
    // 选择该阵营的第一个可用角色
    const availableChars = getCharactersByFaction(faction);
    if (availableChars.length > 0) {
      setSelectedCharacter(availableChars[0].id as CharacterId);
    }
  };
  
  // 快速开始（1v1模式）- 进入房间
  const handleQuickStart = () => {
    // 验证玩家名称
    const validation = validatePlayerName(playerName);
    if (!validation.valid) {
      setNameError(validation.error);
      return;
    }
    if (onEnterRoom) {
      onEnterRoom({
        name: playerName.trim(),
        faction: selectedFaction,
        characterId: selectedCharacter
      });
    }
  };

  // 创建房间（2v2模式）
  const handleCreateRoom = () => {
    // 验证玩家名称
    const validation = validatePlayerName(playerName);
    if (!validation.valid) {
      setNameError(validation.error);
      return;
    }
    if (onEnterRoom) {
      onEnterRoom({
        name: playerName.trim(),
        faction: selectedFaction,
        characterId: selectedCharacter
      });
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      {/* 标题区域 */}
      <div className="text-center mb-8 pt-8">
        <h1 className="text-5xl font-bold text-white mb-2">
          <span className="bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
            ClawdGo
          </span>
        </h1>
        <p className="text-xl text-slate-400">网安训练场</p>
        <p className="text-sm text-slate-500 mt-2">AI Agent 网络安全对抗训练系统</p>
      </div>
      
      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧：游戏设置 */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="bg-slate-900/80 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Settings className="w-5 h-5" />
                游戏设置
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 玩家名称 */}
              <div>
                <label className="text-sm text-slate-400 mb-2 block">玩家名称</label>
                <Input
                  value={playerName}
                  onChange={(e) => handlePlayerNameChange(e.target.value)}
                  placeholder="输入你的名称"
                  className={`bg-slate-800 border-slate-600 text-white ${nameError ? 'border-red-500' : ''}`}
                />
                {nameError && (
                  <p className="text-red-400 text-xs mt-1">{nameError}</p>
                )}
              </div>
              
              {/* 游戏模式 */}
              <div>
                <label className="text-sm text-slate-400 mb-2 block">游戏模式</label>
                <Tabs value={gameMode} onValueChange={(v) => setGameMode(v as '1v1' | '2v2')}>
                  <TabsList className="grid w-full grid-cols-2 bg-slate-800">
                    <TabsTrigger value="1v1" className="data-[state=active]:bg-slate-700">
                      <Bot className="w-4 h-4 mr-2" />
                      快速对战
                    </TabsTrigger>
                    <TabsTrigger value="2v2" className="data-[state=active]:bg-slate-700">
                      <Users className="w-4 h-4 mr-2" />
                      组队对战
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="1v1" className="mt-4">
                    <div className="space-y-3">
                      <label className="text-sm text-slate-400">AI难度</label>
                      <div className="flex gap-2">
                        {(['easy', 'medium', 'hard'] as const).map((diff) => (
                          <Button
                            key={diff}
                            variant={aiDifficulty === diff ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setAiDifficulty(diff)}
                            className="flex-1"
                          >
                            {diff === 'easy' && '简单'}
                            {diff === 'medium' && '中等'}
                            {diff === 'hard' && '困难'}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="2v2" className="mt-4">
                    <div className="bg-slate-800/50 rounded-lg p-4">
                      <p className="text-slate-300 mb-2">创建房间，配置队伍和AI对手</p>
                      <ul className="text-sm text-slate-400 space-y-1">
                        <li>• 支持 1v1、2v2 多种模式</li>
                        <li>• 自由添加/移除AI队友</li>
                        <li>• 随机或手动分配队伍</li>
                      </ul>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
              
              {/* 阵营选择 */}
              <div>
                <label className="text-sm text-slate-400 mb-2 block">选择阵营</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleFactionChange('attacker')}
                    className={`
                      p-4 rounded-lg border-2 transition-all
                      ${selectedFaction === 'attacker'
                        ? 'border-red-500 bg-red-950/30'
                        : 'border-slate-700 bg-slate-800 hover:border-red-500/50'}
                    `}
                  >
                    <div className="flex flex-col items-center">
                      <Swords className="w-8 h-8 text-red-500 mb-2" />
                      <span className="text-white font-bold">攻击方</span>
                      <span className="text-xs text-slate-400 mt-1">黑客/渗透测试</span>
                      <Badge variant="outline" className="mt-2 text-red-400 border-red-400">
                        进攻型
                      </Badge>
                    </div>
                  </button>

                  <button
                    onClick={() => handleFactionChange('defender')}
                    className={`
                      p-4 rounded-lg border-2 transition-all
                      ${selectedFaction === 'defender'
                        ? 'border-blue-500 bg-blue-950/30'
                        : 'border-slate-700 bg-slate-800 hover:border-blue-500/50'}
                    `}
                  >
                    <div className="flex flex-col items-center">
                      <Shield className="w-8 h-8 text-blue-500 mb-2" />
                      <span className="text-white font-bold">防御方</span>
                      <span className="text-xs text-slate-400 mt-1">安全分析师/架构师</span>
                      <Badge variant="outline" className="mt-2 text-blue-400 border-blue-400">
                        防守型
                      </Badge>
                    </div>
                  </button>
                </div>
              </div>

              {/* 角色选择 */}
              <div>
                <label className="text-sm text-slate-400 mb-2 block">选择角色</label>
                <div className="grid grid-cols-1 gap-2">
                  {getCharactersByFaction(selectedFaction).map(char => (
                    <button
                      key={char.id}
                      onClick={() => setSelectedCharacter(char.id)}
                      className={`
                        p-3 rounded-lg border-2 transition-all text-left
                        ${selectedCharacter === char.id
                          ? selectedFaction === 'attacker'
                            ? 'border-red-500 bg-red-950/30'
                            : 'border-blue-500 bg-blue-950/30'
                          : 'border-slate-700 bg-slate-800 hover:border-slate-500'}
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`
                          w-10 h-10 rounded-full flex items-center justify-center text-white font-bold
                          ${selectedFaction === 'attacker' ? 'bg-red-600' : 'bg-blue-600'}
                        `}>
                          {char.name.chinese[0]}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white">{char.name.chinese}</span>
                            <Badge variant="outline" className="text-xs">
                              {char.type === 'RPS' ? '猜拳系' : char.type === 'Chance' ? '骰子系' : '专属系'}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-400 mt-1 line-clamp-2">{char.role}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* 开始按钮 */}
          {gameMode === '1v1' ? (
            <Button 
              onClick={handleQuickStart}
              size="lg"
              className="w-full h-14 text-lg"
            >
              <Play className="w-5 h-5 mr-2" />
              开始游戏
            </Button>
          ) : (
            <Button 
              onClick={handleCreateRoom}
              size="lg"
              className="w-full h-14 text-lg"
            >
              <UserPlus className="w-5 h-5 mr-2" />
              创建房间
            </Button>
          )}
        </div>
        
        {/* 右侧：游戏信息 */}
        <div className="space-y-4">
          <Card className="bg-slate-900/80 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-lg">游戏规则</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-slate-400 mt-0.5" />
                <span className="text-slate-300">每局最多24轮次</span>
              </div>
              <div className="flex items-start gap-2">
                <Trophy className="w-4 h-4 text-slate-400 mt-0.5" />
                <span className="text-slate-300">达成胜利条件即可获胜</span>
              </div>
              <div className="flex items-start gap-2">
                <Users className="w-4 h-4 text-slate-400 mt-0.5" />
                <span className="text-slate-300">支持1v1和2v2模式</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-900/80 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-lg">胜利条件</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-red-400 font-bold text-sm mb-2">攻击方</h4>
                <ul className="text-xs text-slate-300 space-y-1">
                  <li>• 资源枯竭：防御方算力+资金 ≤ 2</li>
                  <li>• 权限主宰：关键区域权限 ≥ 4</li>
                  <li>• 攻击链：一回合使用4种攻击类型</li>
                </ul>
              </div>
              <div>
                <h4 className="text-blue-400 font-bold text-sm mb-2">防御方</h4>
                <ul className="text-xs text-slate-300 space-y-1">
                  <li>• 威胁清零：清除所有威胁标记</li>
                  <li>• 韧性加固：使用4类防御卡牌</li>
                  <li>• 反杀：攻击方信息总和 ≤ 1</li>
                </ul>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-900/80 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-lg">资源说明</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-yellow-400">⚡ 算力</span>
                <span className="text-slate-400">执行操作的基础资源</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-400">💰 资金</span>
                <span className="text-slate-400">购买高级卡牌</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-blue-400">👁️ 信息</span>
                <span className="text-slate-400">情报收集与分析</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-purple-400">👑 权限</span>
                <span className="text-slate-400">系统控制权</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="max-w-4xl mx-auto mt-16 pt-8 border-t border-cyan-500/10 text-center space-y-2">
        <p className="text-sm text-slate-500">
          源自 <span className="text-orange-400 font-medium">大东话安全</span> IP · 专业网络安全知识游戏化
        </p>
        <p className="text-sm text-slate-600">
          @大东话安全 @TIER咖啡知识沙龙 · #AI #网络安全 #大龙虾 #Agent
        </p>
        <p className="text-base">
          <a
            href="https://clawhub.ai/DongSec001/clawdgo"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 underline underline-offset-4 hover:text-cyan-300"
          >
            ClawHub: clawdgo
          </a>
          <span className="px-3 text-slate-600">·</span>
          <a
            href="https://github.com/DongSec001/ClawdGo"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 underline underline-offset-4 hover:text-cyan-300"
          >
            GitHub
          </a>
        </p>
      </div>
    </div>
  );
}

export default GameLobby;
