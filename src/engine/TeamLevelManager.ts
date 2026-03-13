/**
 * 队伍等级管理器
 *
 * 功能：
 * 1. 管理队伍共享等级（渗透/安全）
 * 2. 管理个体修正值（针对特定玩家的效果）
 * 3. 计算玩家的实际生效等级
 * 4. 处理等级修改的优先级规则
 *
 * 规则：
 * - 显示等级 = 队伍共享等级 + 个体偏移量
 * - 常规效果修改队伍共享等级
 * - 个体效果修改目标玩家的个体修正值
 * - "无法提升"效果优先级最高
 * - "降低速度"效果作为乘数应用
 */

import type { GameState, TeamId, IndividualModifiers } from '@/types/gameRules';

export type LevelType = 'infiltration' | 'safety';

export interface LevelModificationResult {
  success: boolean;
  actualChange: number;
  newSharedLevel: number;
  newIndividualLevel: number;
  message: string;
}

export interface IndividualModifierResult {
  success: boolean;
  message: string;
}

class TeamLevelManagerClass {
  /**
   * 获取玩家的实际生效等级
   * 显示等级 = 队伍共享等级 + 个体偏移量
   */
  getEffectiveLevel(
    gameState: GameState,
    playerId: string,
    levelType: LevelType
  ): number {
    const player = gameState.players.find(p => p.id === playerId);
    if (!player) return 0;

    const team = player.team || 'A';
    const sharedLevels = gameState.teamSharedLevels[team];

    if (!sharedLevels) {
      // 如果没有队伍共享等级，使用玩家自身的等级
      return levelType === 'infiltration' ? player.infiltrationLevel : player.safetyLevel;
    }

    const sharedLevel = levelType === 'infiltration'
      ? sharedLevels.infiltrationLevel
      : sharedLevels.safetyLevel;

    const offset = levelType === 'infiltration'
      ? player.individualModifiers.infiltrationLevelOffset
      : player.individualModifiers.safetyLevelOffset;

    // 计算实际等级并限制在0-100范围内
    return Math.max(0, Math.min(100, sharedLevel + offset));
  }

  /**
   * 获取队伍共享等级
   */
  getTeamSharedLevel(
    gameState: GameState,
    team: TeamId,
    levelType: LevelType
  ): number {
    const sharedLevels = gameState.teamSharedLevels[team];
    if (!sharedLevels) return 0;

    return levelType === 'infiltration'
      ? sharedLevels.infiltrationLevel
      : sharedLevels.safetyLevel;
  }

  /**
   * 修改队伍共享等级（常规效果）
   */
  modifyTeamLevel(
    gameState: GameState,
    team: TeamId,
    levelType: LevelType,
    amount: number,
    _sourcePlayerId?: string
  ): { newGameState: GameState; result: LevelModificationResult } {
    const newGameState = { ...gameState };
    const sharedLevels = { ...newGameState.teamSharedLevels };
    const teamLevels = { ...sharedLevels[team] };

    const currentLevel = levelType === 'infiltration'
      ? teamLevels.infiltrationLevel
      : teamLevels.safetyLevel;

    // 计算新等级
    let newLevel = currentLevel + amount;
    newLevel = Math.max(0, Math.min(100, newLevel));

    const actualChange = newLevel - currentLevel;

    // 更新队伍共享等级
    if (levelType === 'infiltration') {
      teamLevels.infiltrationLevel = newLevel;
    } else {
      teamLevels.safetyLevel = newLevel;
    }

    sharedLevels[team] = teamLevels;
    newGameState.teamSharedLevels = sharedLevels;

    // 更新该队伍所有玩家的显示等级
    newGameState.players = newGameState.players.map(player => {
      if (player.team === team) {
        const effectiveLevel = this.getEffectiveLevel(newGameState, player.id, levelType);
        return {
          ...player,
          [levelType === 'infiltration' ? 'infiltrationLevel' : 'safetyLevel']: effectiveLevel,
        };
      }
      return player;
    });

    const levelName = levelType === 'infiltration' ? '渗透' : '安全';
    const changeText = amount > 0 ? `+${amount}` : `${amount}`;

    return {
      newGameState,
      result: {
        success: actualChange !== 0,
        actualChange,
        newSharedLevel: newLevel,
        newIndividualLevel: newLevel,
        message: `队伍${team} ${levelName}等级 ${changeText} (${currentLevel} → ${newLevel})`,
      },
    };
  }

  /**
   * 修改个体偏移量（针对特定玩家的效果）
   */
  modifyIndividualOffset(
    gameState: GameState,
    playerId: string,
    levelType: LevelType,
    offsetChange: number
  ): { newGameState: GameState; result: IndividualModifierResult } {
    const newGameState = { ...gameState };
    const playerIndex = newGameState.players.findIndex(p => p.id === playerId);

    if (playerIndex === -1) {
      return {
        newGameState,
        result: { success: false, message: '找不到玩家' },
      };
    }

    const player = { ...newGameState.players[playerIndex] };
    const modifiers = { ...player.individualModifiers };

    // 修改偏移量
    if (levelType === 'infiltration') {
      modifiers.infiltrationLevelOffset += offsetChange;
    } else {
      modifiers.safetyLevelOffset += offsetChange;
    }

    player.individualModifiers = modifiers;

    // 重新计算显示等级
    const effectiveLevel = this.getEffectiveLevel(newGameState, playerId, levelType);
    player[levelType === 'infiltration' ? 'infiltrationLevel' : 'safetyLevel'] = effectiveLevel;

    newGameState.players[playerIndex] = player;

    const levelName = levelType === 'infiltration' ? '渗透' : '安全';
    const changeText = offsetChange > 0 ? `+${offsetChange}` : `${offsetChange}`;

    return {
      newGameState,
      result: {
        success: true,
        message: `${player.name} ${levelName}偏移 ${changeText}，当前显示等级: ${effectiveLevel}`,
      },
    };
  }

  /**
   * 设置个体速度修正（降低提升速度效果）
   */
  setGainModifier(
    gameState: GameState,
    playerId: string,
    levelType: LevelType,
    modifier: number,
    effectSource: string
  ): { newGameState: GameState; result: IndividualModifierResult } {
    const newGameState = { ...gameState };
    const playerIndex = newGameState.players.findIndex(p => p.id === playerId);

    if (playerIndex === -1) {
      return {
        newGameState,
        result: { success: false, message: '找不到玩家' },
      };
    }

    const player = { ...newGameState.players[playerIndex] };
    const modifiers = { ...player.individualModifiers };

    // 设置速度修正
    if (levelType === 'infiltration') {
      modifiers.infiltrationGainModifier = modifier;
    } else {
      modifiers.safetyGainModifier = modifier;
    }

    // 记录效果来源
    if (!modifiers.sourceEffects.includes(effectSource)) {
      modifiers.sourceEffects = [...modifiers.sourceEffects, effectSource];
    }

    player.individualModifiers = modifiers;
    newGameState.players[playerIndex] = player;

    const levelName = levelType === 'infiltration' ? '渗透' : '安全';
    const modifierText = (modifier * 100).toFixed(0);

    return {
      newGameState,
      result: {
        success: true,
        message: `${player.name} ${levelName}获取速度变为 ${modifierText}%`,
      },
    };
  }

  /**
   * 设置无法提升等级（优先级最高）
   */
  setCannotGain(
    gameState: GameState,
    playerId: string,
    levelType: LevelType,
    cannotGain: boolean,
    effectSource: string
  ): { newGameState: GameState; result: IndividualModifierResult } {
    const newGameState = { ...gameState };
    const playerIndex = newGameState.players.findIndex(p => p.id === playerId);

    if (playerIndex === -1) {
      return {
        newGameState,
        result: { success: false, message: '找不到玩家' },
      };
    }

    const player = { ...newGameState.players[playerIndex] };
    const modifiers = { ...player.individualModifiers };

    // 设置无法提升
    if (levelType === 'infiltration') {
      modifiers.cannotGainInfiltration = cannotGain;
    } else {
      modifiers.cannotGainSafety = cannotGain;
    }

    // 记录效果来源
    if (cannotGain && !modifiers.sourceEffects.includes(effectSource)) {
      modifiers.sourceEffects = [...modifiers.sourceEffects, effectSource];
    }

    player.individualModifiers = modifiers;
    newGameState.players[playerIndex] = player;

    const levelName = levelType === 'infiltration' ? '渗透' : '安全';
    const statusText = cannotGain ? '无法提升' : '可以正常提升';

    return {
      newGameState,
      result: {
        success: true,
        message: `${player.name} ${levelName}${statusText}`,
      },
    };
  }

  /**
   * 应用等级变化（考虑所有修正）
   * 这是主要的等级修改接口，会自动处理所有优先级规则
   */
  applyLevelChange(
    gameState: GameState,
    targetPlayerId: string,
    levelType: LevelType,
    baseAmount: number,
    isIndividualEffect: boolean = false,
    _effectSource?: string
  ): { newGameState: GameState; result: LevelModificationResult } {
    const player = gameState.players.find(p => p.id === targetPlayerId);
    if (!player) {
      return {
        newGameState: gameState,
        result: {
          success: false,
          actualChange: 0,
          newSharedLevel: 0,
          newIndividualLevel: 0,
          message: '找不到玩家',
        },
      };
    }

    const team = player.team || 'A';
    const modifiers = player.individualModifiers;

    // 1. 检查"无法提升"效果（优先级最高）
    const cannotGain = levelType === 'infiltration'
      ? modifiers.cannotGainInfiltration
      : modifiers.cannotGainSafety;

    if (cannotGain && baseAmount > 0) {
      return {
        newGameState: gameState,
        result: {
          success: false,
          actualChange: 0,
          newSharedLevel: this.getTeamSharedLevel(gameState, team, levelType),
          newIndividualLevel: this.getEffectiveLevel(gameState, targetPlayerId, levelType),
          message: `${player.name} 本回合无法提升${levelType === 'infiltration' ? '渗透' : '安全'}等级`,
        },
      };
    }

    // 2. 应用速度修正
    const gainModifier = levelType === 'infiltration'
      ? modifiers.infiltrationGainModifier
      : modifiers.safetyGainModifier;

    const modifiedAmount = Math.round(baseAmount * gainModifier);

    // 3. 根据效果类型决定修改方式
    if (isIndividualEffect) {
      // 个体效果：修改个体偏移量
      const individualResult = this.modifyIndividualOffset(gameState, targetPlayerId, levelType, modifiedAmount);
      return {
        newGameState: individualResult.newGameState,
        result: {
          success: individualResult.result.success,
          actualChange: modifiedAmount,
          newSharedLevel: this.getTeamSharedLevel(individualResult.newGameState, team, levelType),
          newIndividualLevel: this.getEffectiveLevel(individualResult.newGameState, targetPlayerId, levelType),
          message: individualResult.result.message,
        },
      };
    } else {
      // 常规效果：修改队伍共享等级
      return this.modifyTeamLevel(gameState, team, levelType, modifiedAmount, targetPlayerId);
    }
  }

  /**
   * 重置个体修正值（回合结束时调用）
   */
  resetIndividualModifiers(
    gameState: GameState,
    playerId: string
  ): { newGameState: GameState; message: string } {
    const newGameState = { ...gameState };
    const playerIndex = newGameState.players.findIndex(p => p.id === playerId);

    if (playerIndex === -1) {
      return { newGameState, message: '找不到玩家' };
    }

    const player = { ...newGameState.players[playerIndex] };

    // 重置所有修正值
    player.individualModifiers = {
      infiltrationLevelOffset: 0,
      safetyLevelOffset: 0,
      infiltrationGainModifier: 1.0,
      safetyGainModifier: 1.0,
      cannotGainInfiltration: false,
      cannotGainSafety: false,
      judgmentDifficultyModifier: 0,
      sourceEffects: [],
    };

    // 重新计算显示等级
    const infiltrationLevel = this.getEffectiveLevel(newGameState, playerId, 'infiltration');
    const safetyLevel = this.getEffectiveLevel(newGameState, playerId, 'safety');

    player.infiltrationLevel = infiltrationLevel;
    player.safetyLevel = safetyLevel;

    newGameState.players[playerIndex] = player;

    return {
      newGameState,
      message: `${player.name} 的个体修正值已重置`,
    };
  }

  /**
   * 初始化队伍共享等级
   */
  initializeTeamSharedLevels(): Record<TeamId, { infiltrationLevel: number; safetyLevel: number }> {
    return {
      A: { infiltrationLevel: 0, safetyLevel: 0 },
      B: { infiltrationLevel: 0, safetyLevel: 0 },
    };
  }

  /**
   * 初始化个体修正值
   */
  initializeIndividualModifiers(): IndividualModifiers {
    return {
      infiltrationLevelOffset: 0,
      safetyLevelOffset: 0,
      infiltrationGainModifier: 1.0,
      safetyGainModifier: 1.0,
      cannotGainInfiltration: false,
      cannotGainSafety: false,
      judgmentDifficultyModifier: 0,
      sourceEffects: [],
    };
  }
}

// 导出单例
export const TeamLevelManager = new TeamLevelManagerClass();
export default TeamLevelManager;
