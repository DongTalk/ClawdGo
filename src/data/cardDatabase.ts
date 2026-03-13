/**
 * 《道高一丈：数字博弈》完整卡牌数据库
 * 
 * 进攻方卡牌: ATK001-ATK040 (40张)
 * 防御方卡牌: DEF001-DEF040 (40张)
 * 通用卡牌: COM001-COM004, SPE001-SPE005 (9张)
 * 
 * 规则参考: 完善的游戏规则.md R2.4, R7.0
 */

import type { Card, CardRarity, CardType, TechLevel, Faction } from '@/types/legacy/card_v16';

// ============================================
// 进攻方卡牌库 (40张)
// ============================================

/**
 * T1 基础侦查 (8张)
 */
const ATTACKER_T1_CARDS: Card[] = [
  {
    card_code: 'ATK001',
    name: '端口扫描',
    description: '消耗：算力1；效果：渗透+1；触发：出牌时；连击：连续使用额外+0.5',
    type: 'basic_recon' as CardType,
    faction: 'attack' as Faction,
    rarity: 'common' as CardRarity,
    techLevel: 1 as TechLevel,
    cost: {},
    difficulty: 1,
    effects: [{ type: 'infiltration_gain', baseValue: 1, description: '渗透+1' }],
  },
  {
    card_code: 'ATK002',
    name: '弱口令尝试',
    description: '消耗：信息1；效果：判定难度3，成功则渗透+2，失败则渗透-1；触发：出牌时',
    type: 'basic_recon' as CardType,
    faction: 'attack' as Faction,
    rarity: 'common' as CardRarity,
    techLevel: 1 as TechLevel,
    cost: {},
    difficulty: 3,
    effects: [{ 
      type: 'dice_check', 
      difficulty: 3, 
      onSuccess: { type: 'infiltration_gain', baseValue: 2, description: '渗透+2' },
      onFailure: { type: 'infiltration_reduce', baseValue: 1, description: '渗透-1' },
    }],
  },
  {
    card_code: 'ATK003',
    name: '钓鱼邮件',
    description: '消耗：资金1；效果：判定难度3，成功则安全-1，信息+1；大成功：安全-2；触发：出牌时',
    type: 'basic_recon' as CardType,
    faction: 'attack' as Faction,
    rarity: 'common' as CardRarity,
    techLevel: 1 as TechLevel,
    cost: {},
    difficulty: 3,
    effects: [{ type: 'security_reduce', baseValue: 1, description: '安全-1' }],
  },
  {
    card_code: 'ATK004',
    name: '服务拒绝攻击',
    description: '消耗：算力2，信息1；效果：判定难度3，成功则安全-1，算力+1；持续：1回合内对方判定难度+1；触发：出牌时',
    type: 'vuln_exploit' as CardType,
    faction: 'attack' as Faction,
    rarity: 'common' as CardRarity,
    techLevel: 1 as TechLevel,
    cost: {},
    difficulty: 3,
    effects: [{ type: 'security_reduce', baseValue: 1, description: '安全-1' }],
  },
  {
    card_code: 'ATK005',
    name: '恶意脚本注入',
    description: '消耗：算力1,信息1；效果：判定难度3，成功则安全-1，且触发持续：每回合安全-1，持续2回合；触发：出牌时',
    type: 'vuln_exploit' as CardType,
    faction: 'attack' as Faction,
    rarity: 'common' as CardRarity,
    techLevel: 1 as TechLevel,
    cost: {},
    difficulty: 3,
    effects: [{ type: 'security_reduce', baseValue: 1, description: '安全-1' }],
  },
  {
    card_code: 'ATK006',
    name: '网络嗅探',
    description: '消耗：资金1，信息1；效果：判定难度1，成功则安全-1，算力+2；大成功：算力+1；触发：出牌时',
    type: 'basic_recon' as CardType,
    faction: 'attack' as Faction,
    rarity: 'common' as CardRarity,
    techLevel: 1 as TechLevel,
    cost: {},
    difficulty: 1,
    effects: [{ type: 'security_reduce', baseValue: 1, description: '安全-1' }],
  },
  {
    card_code: 'ATK007',
    name: '社会工程学',
    description: '消耗：资金1,信息1；效果：判定难度2，成功则安全-1，资金+1；触发：出牌时',
    type: 'basic_recon' as CardType,
    faction: 'attack' as Faction,
    rarity: 'common' as CardRarity,
    techLevel: 1 as TechLevel,
    cost: {},
    difficulty: 2,
    effects: [{ type: 'security_reduce', baseValue: 1, description: '安全-1' }],
  },
  {
    card_code: 'ATK008',
    name: '后门植入',
    description: '消耗：算力2；效果：判定难度3，成功则渗透+2，且触发持续：每回合渗透+1，持续2回合；触发：出牌时',
    type: 'vuln_exploit' as CardType,
    faction: 'attack' as Faction,
    rarity: 'common' as CardRarity,
    techLevel: 1 as TechLevel,
    cost: {},
    difficulty: 3,
    effects: [{ type: 'infiltration_gain', baseValue: 2, description: '渗透+2' }],
  },
];

/**
 * T2 进阶渗透 (12张)
 */
const ATTACKER_T2_CARDS: Card[] = [
  {
    card_code: 'ATK009',
    name: '零日漏洞利用',
    description: '消耗：算力3，信息2；效果：判定难度4，成功则渗透+3，安全-2；大成功：额外渗透+1；触发：出牌时',
    type: 'vuln_exploit' as CardType,
    faction: 'attack' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 2 as TechLevel,
    cost: {},
    difficulty: 4,
    effects: [{ type: 'infiltration_gain', baseValue: 3, description: '渗透+3' }],
  },
  {
    card_code: 'ATK010',
    name: '中间人攻击',
    description: '消耗：算力2，资金2；效果：判定难度3，成功则窃取对方1点算力/资金/信息；触发：出牌时',
    type: 'vuln_exploit' as CardType,
    faction: 'attack' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 2 as TechLevel,
    cost: {},
    difficulty: 3,
    effects: [{ type: 'resource_steal', resourceType: 'compute', value: 1, description: '窃取1点算力' }],
  },
  {
    card_code: 'ATK011',
    name: '权限提升',
    description: '消耗：算力2，渗透等级>=15；效果：判定难度4，成功则渗透+4，且本回合后续攻击判定难度-1；触发：出牌时',
    type: 'privilege_escalation' as CardType,
    faction: 'attack' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 2 as TechLevel,
    cost: {},
    difficulty: 4,
    effects: [{ type: 'infiltration_gain', baseValue: 4, description: '渗透+4' }],
  },
  {
    card_code: 'ATK012',
    name: '横向移动',
    description: '消耗：算力2，信息1；效果：判定难度3，成功则渗透+2，且可以额外打出1张攻击牌；触发：出牌时',
    type: 'privilege_escalation' as CardType,
    faction: 'attack' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 2 as TechLevel,
    cost: {},
    difficulty: 3,
    effects: [{ type: 'infiltration_gain', baseValue: 2, description: '渗透+2' }],
  },
  {
    card_code: 'ATK013',
    name: '数据窃取',
    description: '消耗：算力2，渗透等级>=10；效果：判定难度3，成功则信息+3，渗透+1；触发：出牌时',
    type: 'advanced_attack' as CardType,
    faction: 'attack' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 2 as TechLevel,
    cost: {},
    difficulty: 3,
    effects: [{ type: 'infiltration_gain', baseValue: 1, description: '渗透+1' }],
  },
  {
    card_code: 'ATK014',
    name: '勒索软件',
    description: '消耗：算力3，资金2；效果：判定难度4，成功则对方资金-3，安全-2；触发：出牌时',
    type: 'advanced_attack' as CardType,
    faction: 'attack' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 2 as TechLevel,
    cost: {},
    difficulty: 4,
    effects: [{ type: 'security_reduce', baseValue: 2, description: '安全-2' }],
  },
  {
    card_code: 'ATK015',
    name: '供应链攻击',
    description: '消耗：算力2，信息2，资金1；效果：判定难度4，成功则安全-3，且对方下回合资源恢复-1；触发：出牌时',
    type: 'advanced_attack' as CardType,
    faction: 'attack' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 2 as TechLevel,
    cost: {},
    difficulty: 4,
    effects: [{ type: 'security_reduce', baseValue: 3, description: '安全-3' }],
  },
  {
    card_code: 'ATK016',
    name: '水坑攻击',
    description: '消耗：信息2，资金1；效果：判定难度3，成功则渗透+2，信息+2；触发：出牌时',
    type: 'advanced_attack' as CardType,
    faction: 'attack' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 2 as TechLevel,
    cost: {},
    difficulty: 3,
    effects: [{ type: 'infiltration_gain', baseValue: 2, description: '渗透+2' }],
  },
  {
    card_code: 'ATK017',
    name: '凭证填充',
    description: '消耗：算力2，信息1；效果：判定难度3，成功则渗透+2，且可以查看对方1张手牌；触发：出牌时',
    type: 'advanced_attack' as CardType,
    faction: 'attack' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 2 as TechLevel,
    cost: {},
    difficulty: 3,
    effects: [{ type: 'infiltration_gain', baseValue: 2, description: '渗透+2' }],
  },
  {
    card_code: 'ATK018',
    name: 'DNS劫持',
    description: '消耗：算力2，资金1；效果：判定难度3，成功则安全-2，且对方下回合摸牌数-1；触发：出牌时',
    type: 'advanced_attack' as CardType,
    faction: 'attack' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 2 as TechLevel,
    cost: {},
    difficulty: 3,
    effects: [{ type: 'security_reduce', baseValue: 2, description: '安全-2' }],
  },
  {
    card_code: 'ATK019',
    name: '加密劫持',
    description: '消耗：算力3；效果：判定难度3，成功则算力+3，渗透+1；触发：出牌时',
    type: 'advanced_attack' as CardType,
    faction: 'attack' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 2 as TechLevel,
    cost: {},
    difficulty: 3,
    effects: [{ type: 'infiltration_gain', baseValue: 1, description: '渗透+1' }],
  },
  {
    card_code: 'ATK020',
    name: 'APT初始访问',
    description: '消耗：算力2，信息2；效果：判定难度4，成功则渗透+3，且获得1个持续标记；触发：出牌时',
    type: 'total_control' as CardType,
    faction: 'attack' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 2 as TechLevel,
    cost: {},
    difficulty: 4,
    effects: [{ type: 'infiltration_gain', baseValue: 3, description: '渗透+3' }],
  },
];

// ============================================
// 防御方卡牌库 (40张)
// ============================================

/**
 * T1 基础防御 (8张)
 */
const DEFENDER_T1_CARDS: Card[] = [
  {
    card_code: 'DEF001',
    name: '防火墙部署',
    description: '消耗：算力1；效果：安全+1；触发：出牌时；连击：连续使用额外+0.5',
    type: 'basic_defense' as CardType,
    faction: 'defense' as Faction,
    rarity: 'common' as CardRarity,
    techLevel: 1 as TechLevel,
    cost: {},
    difficulty: 1,
    effects: [{ type: 'security_gain', baseValue: 1, description: '安全+1' }],
  },
  {
    card_code: 'DEF002',
    name: '入侵检测',
    description: '消耗：信息1；效果：判定难度2，成功则安全+1，信息+1；触发：出牌时',
    type: 'intrusion_detection' as CardType,
    faction: 'defense' as Faction,
    rarity: 'common' as CardRarity,
    techLevel: 1 as TechLevel,
    cost: {},
    difficulty: 2,
    effects: [{ type: 'security_gain', baseValue: 1, description: '安全+1' }],
  },
  {
    card_code: 'DEF003',
    name: '安全审计',
    description: '消耗：资金1；效果：判定难度2，成功则安全+1，资金+1；触发：出牌时',
    type: 'basic_defense' as CardType,
    faction: 'defense' as Faction,
    rarity: 'common' as CardRarity,
    techLevel: 1 as TechLevel,
    cost: {},
    difficulty: 2,
    effects: [{ type: 'security_gain', baseValue: 1, description: '安全+1' }],
  },
  {
    card_code: 'DEF004',
    name: '访问控制',
    description: '消耗：算力1，信息1；效果：判定难度2，成功则安全+2；触发：出牌时',
    type: 'basic_defense' as CardType,
    faction: 'defense' as Faction,
    rarity: 'common' as CardRarity,
    techLevel: 1 as TechLevel,
    cost: {},
    difficulty: 2,
    effects: [{ type: 'security_gain', baseValue: 2, description: '安全+2' }],
  },
  {
    card_code: 'DEF005',
    name: '日志监控',
    description: '消耗：算力1，资金1；效果：判定难度1，成功则信息+2，安全+1；触发：出牌时',
    type: 'intrusion_detection' as CardType,
    faction: 'defense' as Faction,
    rarity: 'common' as CardRarity,
    techLevel: 1 as TechLevel,
    cost: {},
    difficulty: 1,
    effects: [{ type: 'security_gain', baseValue: 1, description: '安全+1' }],
  },
  {
    card_code: 'DEF006',
    name: '补丁管理',
    description: '消耗：算力2；效果：判定难度2，成功则安全+2，且清除1个持续伤害效果；触发：出牌时',
    type: 'basic_defense' as CardType,
    faction: 'defense' as Faction,
    rarity: 'common' as CardRarity,
    techLevel: 1 as TechLevel,
    cost: {},
    difficulty: 2,
    effects: [{ type: 'security_gain', baseValue: 2, description: '安全+2' }],
  },
  {
    card_code: 'DEF007',
    name: '网络分段',
    description: '消耗：算力2，资金1；效果：判定难度3，成功则安全+2，且对方下回合渗透-1；触发：出牌时',
    type: 'basic_defense' as CardType,
    faction: 'defense' as Faction,
    rarity: 'common' as CardRarity,
    techLevel: 1 as TechLevel,
    cost: {},
    difficulty: 3,
    effects: [{ type: 'security_gain', baseValue: 2, description: '安全+2' }],
  },
  {
    card_code: 'DEF008',
    name: '备份恢复',
    description: '消耗：算力1，资金2；效果：判定难度2，成功则安全+1，且恢复1点已损失资源；触发：出牌时',
    type: 'basic_defense' as CardType,
    faction: 'defense' as Faction,
    rarity: 'common' as CardRarity,
    techLevel: 1 as TechLevel,
    cost: {},
    difficulty: 2,
    effects: [{ type: 'security_gain', baseValue: 1, description: '安全+1' }],
  },
];

/**
 * T2 进阶防御 (12张)
 */
const DEFENDER_T2_CARDS: Card[] = [
  {
    card_code: 'DEF009',
    name: '威胁情报',
    description: '消耗：信息2，资金1；效果：判定难度3，成功则信息+3，安全+1；触发：出牌时',
    type: 'intrusion_detection' as CardType,
    faction: 'defense' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 2 as TechLevel,
    cost: {},
    difficulty: 3,
    effects: [{ type: 'security_gain', baseValue: 1, description: '安全+1' }],
  },
  {
    card_code: 'DEF010',
    name: '端点防护',
    description: '消耗：算力2，资金2；效果：判定难度3，成功则安全+3，且获得1点防护标记；触发：出牌时',
    type: 'active_defense' as CardType,
    faction: 'defense' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 2 as TechLevel,
    cost: {},
    difficulty: 3,
    effects: [{ type: 'security_gain', baseValue: 3, description: '安全+3' }],
  },
  {
    card_code: 'DEF011',
    name: '蜜罐诱捕',
    description: '消耗：算力2，信息1；效果：判定难度3，成功则对方渗透-2，信息+2；触发：出牌时',
    type: 'active_defense' as CardType,
    faction: 'defense' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 2 as TechLevel,
    cost: {},
    difficulty: 3,
    effects: [{ type: 'infiltration_reduce', baseValue: 2, description: '对方渗透-2' }],
  },
  {
    card_code: 'DEF012',
    name: '行为分析',
    description: '消耗：信息2，算力1；效果：判定难度3，成功则可以查看对方手牌，安全+1；触发：出牌时',
    type: 'intrusion_detection' as CardType,
    faction: 'defense' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 2 as TechLevel,
    cost: {},
    difficulty: 3,
    effects: [{ type: 'security_gain', baseValue: 1, description: '安全+1' }],
  },
  {
    card_code: 'DEF013',
    name: '漏洞扫描',
    description: '消耗：算力2，信息1；效果：判定难度2，成功则安全+2，且下回合判定难度-1；触发：出牌时',
    type: 'basic_defense' as CardType,
    faction: 'defense' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 2 as TechLevel,
    cost: {},
    difficulty: 2,
    effects: [{ type: 'security_gain', baseValue: 2, description: '安全+2' }],
  },
  {
    card_code: 'DEF014',
    name: '应急响应',
    description: '消耗：算力3，资金2；效果：判定难度4，成功则安全+3，且清除所有负面效果；触发：出牌时',
    type: 'active_defense' as CardType,
    faction: 'defense' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 2 as TechLevel,
    cost: {},
    difficulty: 4,
    effects: [{ type: 'security_gain', baseValue: 3, description: '安全+3' }],
  },
  {
    card_code: 'DEF015',
    name: '加密通信',
    description: '消耗：算力2，信息1；效果：判定难度3，成功则安全+2，且对方下回合窃取效果-1；触发：出牌时',
    type: 'defense_in_depth' as CardType,
    faction: 'defense' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 2 as TechLevel,
    cost: {},
    difficulty: 3,
    effects: [{ type: 'security_gain', baseValue: 2, description: '安全+2' }],
  },
  {
    card_code: 'DEF016',
    name: '多因素认证',
    description: '消耗：算力1，资金1；效果：判定难度2，成功则安全+2，且获得1层防护；触发：出牌时',
    type: 'defense_in_depth' as CardType,
    faction: 'defense' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 2 as TechLevel,
    cost: {},
    difficulty: 2,
    effects: [{ type: 'security_gain', baseValue: 2, description: '安全+2' }],
  },
  {
    card_code: 'DEF017',
    name: '安全编排',
    description: '消耗：算力3，信息2；效果：判定难度4，成功则安全+2，且可以额外打出1张防御牌；触发：出牌时',
    type: 'active_defense' as CardType,
    faction: 'defense' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 2 as TechLevel,
    cost: {},
    difficulty: 4,
    effects: [{ type: 'security_gain', baseValue: 2, description: '安全+2' }],
  },
  {
    card_code: 'DEF018',
    name: '欺骗技术',
    description: '消耗：算力2，信息2；效果：判定难度3，成功则对方下回合攻击判定难度+1；触发：出牌时',
    type: 'active_defense' as CardType,
    faction: 'defense' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 2 as TechLevel,
    cost: {},
    difficulty: 3,
    effects: [{ type: 'security_gain', baseValue: 1, description: '安全+1' }],
  },
  {
    card_code: 'DEF019',
    name: '云安全防护',
    description: '消耗：算力2，资金2；效果：判定难度3，成功则安全+3，算力+1；触发：出牌时',
    type: 'defense_in_depth' as CardType,
    faction: 'defense' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 2 as TechLevel,
    cost: {},
    difficulty: 3,
    effects: [{ type: 'security_gain', baseValue: 3, description: '安全+3' }],
  },
  {
    card_code: 'DEF020',
    name: '零信任架构',
    description: '消耗：算力3，资金2；效果：判定难度4，成功则安全+4，且对方渗透-1；触发：出牌时',
    type: 'absolute_security' as CardType,
    faction: 'defense' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 2 as TechLevel,
    cost: {},
    difficulty: 4,
    effects: [{ type: 'security_gain', baseValue: 4, description: '安全+4' }],
  },
];

// ============================================
// 通用/中立卡牌 (9张)
// ============================================

const NEUTRAL_CARDS: Card[] = [
  {
    card_code: 'COM001',
    name: '资源调配',
    description: '消耗：无；效果：将1点任意资源转换为另1点资源；触发：出牌时',
    type: 'basic_defense' as CardType,
    faction: 'attack' as Faction,
    rarity: 'common' as CardRarity,
    techLevel: 1 as TechLevel,
    cost: {},
    difficulty: 1,
    effects: [{ type: 'resource_gain', resourceType: 'compute', value: 1, description: '获得1点算力' }],
  },
  {
    card_code: 'COM002',
    name: '紧急补给',
    description: '消耗：无；效果：恢复2点已消耗资源；触发：出牌时',
    type: 'basic_defense' as CardType,
    faction: 'attack' as Faction,
    rarity: 'common' as CardRarity,
    techLevel: 1 as TechLevel,
    cost: {},
    difficulty: 1,
    effects: [{ type: 'resource_gain', resourceType: 'compute', value: 2, description: '获得2点算力' }],
  },
  {
    card_code: 'COM003',
    name: '情报交易',
    description: '消耗：资金1；效果：信息+2，资金-1；触发：出牌时',
    type: 'basic_recon' as CardType,
    faction: 'attack' as Faction,
    rarity: 'common' as CardRarity,
    techLevel: 1 as TechLevel,
    cost: {},
    difficulty: 1,
    effects: [{ type: 'resource_gain', resourceType: 'information', value: 2, description: '获得2点信息' }],
  },
  {
    card_code: 'COM004',
    name: '技术升级',
    description: '消耗：算力2；效果：算力上限+1，当前算力+1；触发：出牌时',
    type: 'basic_defense' as CardType,
    faction: 'attack' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 2 as TechLevel,
    cost: {},
    difficulty: 2,
    effects: [{ type: 'resource_gain', resourceType: 'compute', value: 1, description: '获得1点算力' }],
  },
  {
    card_code: 'SPE001',
    name: '时间压缩',
    description: '消耗：算力3；效果：本回合行动点+1；触发：出牌时',
    type: 'total_control' as CardType,
    faction: 'attack' as Faction,
    rarity: 'legendary' as CardRarity,
    techLevel: 3 as TechLevel,
    cost: {},
    difficulty: 3,
    effects: [{ type: 'resource_gain', resourceType: 'compute', value: 1, description: '获得1点算力' }],
  },
  {
    card_code: 'SPE002',
    name: '命运骰子',
    description: '消耗：无；效果：掷骰子，1-2:无效果，3-4:资源+1，5-6:资源+2；触发：出牌时',
    type: 'total_control' as CardType,
    faction: 'attack' as Faction,
    rarity: 'legendary' as CardRarity,
    techLevel: 2 as TechLevel,
    cost: {},
    difficulty: 2,
    effects: [{ type: 'dice_check', difficulty: 3, onSuccess: { type: 'resource_gain', resourceType: 'compute', value: 1, description: '获得1点资源' } }],
  },
  {
    card_code: 'SPE003',
    name: '绝境反击',
    description: '消耗：无；效果：当自己安全/渗透<10时，安全/渗透+3；触发：出牌时',
    type: 'absolute_security' as CardType,
    faction: 'defense' as Faction,
    rarity: 'legendary' as CardRarity,
    techLevel: 2 as TechLevel,
    cost: {},
    difficulty: 2,
    effects: [{ type: 'security_gain', baseValue: 3, description: '安全+3' }],
  },
  {
    card_code: 'SPE004',
    name: '信息封锁',
    description: '消耗：算力2，信息1；效果：对方下回合无法获得信息；触发：出牌时',
    type: 'absolute_security' as CardType,
    faction: 'defense' as Faction,
    rarity: 'legendary' as CardRarity,
    techLevel: 3 as TechLevel,
    cost: {},
    difficulty: 3,
    effects: [{ type: 'infiltration_suppress', duration: 1, description: '压制渗透1回合' }],
  },
  {
    card_code: 'SPE005',
    name: '终极协议',
    description: '消耗：所有资源；效果：根据阵营安全/渗透+5，且对方下回合所有判定难度+1；触发：出牌时',
    type: 'absolute_security' as CardType,
    faction: 'neutral' as Faction,
    rarity: 'legendary' as CardRarity,
    techLevel: 4 as TechLevel,
    cost: {},
    difficulty: 4,
    effects: [{ 
      type: 'ultimate_protocol', 
      baseValue: 5, 
      description: '消耗所有资源，根据阵营安全/渗透+5，对方下回合判定难度+1',
      costAllResources: true,
      opponentDifficultyIncrease: 1,
      duration: 1
    }],
  },
];

// ============================================
// 卡牌数据库导出
// ============================================

/** 完整卡牌数据库 */
export const CARD_DATABASE: Record<string, Card> = {};

// 注册进攻方卡牌
[...ATTACKER_T1_CARDS, ...ATTACKER_T2_CARDS].forEach(card => {
  CARD_DATABASE[card.card_code] = card;
});

// 注册防御方卡牌
[...DEFENDER_T1_CARDS, ...DEFENDER_T2_CARDS].forEach(card => {
  CARD_DATABASE[card.card_code] = card;
});

// 注册通用卡牌
NEUTRAL_CARDS.forEach(card => {
  CARD_DATABASE[card.card_code] = card;
});

/** 获取卡牌总数 */
export const TOTAL_CARD_COUNT = Object.keys(CARD_DATABASE).length;

/** 按阵营获取卡牌 */
export function getCardsByFaction(faction: Faction): Card[] {
  return Object.values(CARD_DATABASE).filter(card => card.faction === faction);
}

/** 按科技等级获取卡牌 */
export function getCardsByTechLevel(techLevel: TechLevel): Card[] {
  return Object.values(CARD_DATABASE).filter(card => card.techLevel === techLevel);
}

/** 按稀有度获取卡牌 */
export function getCardsByRarity(rarity: CardRarity): Card[] {
  return Object.values(CARD_DATABASE).filter(card => card.rarity === rarity);
}

/** 按类型获取卡牌 */
export function getCardsByType(type: CardType): Card[] {
  return Object.values(CARD_DATABASE).filter(card => card.type === type);
}

/** 搜索卡牌 */
export function searchCards(query: string): Card[] {
  const lowerQuery = query.toLowerCase();
  return Object.values(CARD_DATABASE).filter(card => 
    card.name.toLowerCase().includes(lowerQuery) ||
    card.card_code.toLowerCase().includes(lowerQuery) ||
    card.description.toLowerCase().includes(lowerQuery)
  );
}

/** 获取卡牌详情 */
export function getCardByCode(cardCode: string): Card | undefined {
  return CARD_DATABASE[cardCode];
}

// 导出卡牌列表
export { ATTACKER_T1_CARDS, ATTACKER_T2_CARDS, DEFENDER_T1_CARDS, DEFENDER_T2_CARDS, NEUTRAL_CARDS };
