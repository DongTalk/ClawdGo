/**
 * 判定事件总线
 * 用于在引擎层和UI层之间传递判定事件
 * 
 * 功能：
 * 1. 支持订阅和发布判定开始/结束事件
 * 2. 管理判定过程的显示和隐藏
 * 3. 传递判定数据和结果
 */

import type { JudgmentType } from './PendingJudgmentSystem';
import type { JudgmentEffect } from './PendingJudgmentSystem';

// ============================================
// 类型定义
// ============================================

/** 判定事件数据 */
export interface JudgmentEventData {
  /** 判定ID */
  id: string;
  /** 判定类型 */
  type: JudgmentType;
  /** 判定阶段 */
  phase: 'response' | 'judgment';
  /** 判定标题 */
  title: string;
  /** 判定描述 */
  description: string;
  /** 发起者ID */
  initiatorId: string;
  /** 发起者名称 */
  initiatorName: string;
  /** 目标ID */
  targetId: string;
  /** 目标名称 */
  targetName: string;
  /** 难度值（骰子判定用） */
  difficulty?: number;
  /** 修正值（骰子判定用） */
  modifier?: number;
  /** 成功效果 */
  onSuccess: JudgmentEffect;
  /** 失败效果 */
  onFailure: JudgmentEffect;
  /** 关联卡牌名称 */
  cardName?: string;
}

/** 判定结果数据 */
export interface JudgmentResultData {
  /** 判定ID */
  id: string;
  /** 是否成功 */
  success: boolean;
  /** 结果类型 */
  resultType: 'success' | 'failure' | 'critical_success' | 'critical_failure';
  /** 详细描述 */
  detail: string;
  /** 骰子点数（骰子判定用） */
  roll?: number;
  /** RPS选择（RPS判定用） */
  rpsChoices?: {
    initiator: 'rock' | 'paper' | 'scissors';
    target: 'rock' | 'paper' | 'scissors';
  };
  /** 应用的效果 */
  appliedEffects: JudgmentEffect;
}

/** 判定事件回调函数 */
type JudgmentStartCallback = (data: JudgmentEventData) => void;
type JudgmentEndCallback = (data: JudgmentResultData) => void;

// ============================================
// 判定事件总线
// ============================================

class JudgmentEventBusClass {
  private startListeners: Set<JudgmentStartCallback> = new Set();
  private endListeners: Set<JudgmentEndCallback> = new Set();
  private currentJudgment: JudgmentEventData | null = null;
  private isProcessing: boolean = false;

  private static instance: JudgmentEventBusClass;

  static getInstance(): JudgmentEventBusClass {
    if (!JudgmentEventBusClass.instance) {
      JudgmentEventBusClass.instance = new JudgmentEventBusClass();
    }
    return JudgmentEventBusClass.instance;
  }

  // ============================================
  // 订阅/取消订阅
  // ============================================

  /**
   * 订阅判定开始事件
   */
  onJudgmentStart(callback: JudgmentStartCallback): () => void {
    this.startListeners.add(callback);
    return () => {
      this.startListeners.delete(callback);
    };
  }

  /**
   * 订阅判定结束事件
   */
  onJudgmentEnd(callback: JudgmentEndCallback): () => void {
    this.endListeners.add(callback);
    return () => {
      this.endListeners.delete(callback);
    };
  }

  // ============================================
  // 发布事件
  // ============================================

  /**
   * 发布判定开始事件
   * 这会触发UI显示判定界面
   */
  emitJudgmentStart(data: JudgmentEventData): void {
    if (this.isProcessing) {
      console.warn('[JudgmentEventBus] 已有判定正在进行中，跳过新判定');
      return;
    }

    this.currentJudgment = data;
    this.isProcessing = true;

    console.log('[JudgmentEventBus] 判定开始:', data.title, {
      type: data.type,
      phase: data.phase,
      initiator: data.initiatorName,
      target: data.targetName,
    });

    this.startListeners.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('[JudgmentEventBus] 判定开始回调错误:', error);
      }
    });
  }

  /**
   * 发布判定结束事件
   * 这会触发UI关闭判定界面
   */
  emitJudgmentEnd(data: JudgmentResultData): void {
    console.log('[JudgmentEventBus] 判定结束:', {
      id: data.id,
      success: data.success,
      resultType: data.resultType,
    });

    this.endListeners.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('[JudgmentEventBus] 判定结束回调错误:', error);
      }
    });

    this.currentJudgment = null;
    this.isProcessing = false;
  }

  // ============================================
  // 状态查询
  // ============================================

  /**
   * 获取当前判定
   */
  getCurrentJudgment(): JudgmentEventData | null {
    return this.currentJudgment;
  }

  /**
   * 检查是否正在进行判定
   */
  isJudgmentProcessing(): boolean {
    return this.isProcessing;
  }

  /**
   * 重置状态
   */
  reset(): void {
    this.currentJudgment = null;
    this.isProcessing = false;
    this.startListeners.clear();
    this.endListeners.clear();
  }
}

// 导出单例实例
export const JudgmentEventBus = JudgmentEventBusClass.getInstance();

// 便捷导出
export default JudgmentEventBus;
