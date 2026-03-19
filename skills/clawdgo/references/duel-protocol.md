# ClawdGo H模式对抗协议规范

> 本文件定义 ClawdGo H 模式（对抗模式）的标准协议。  
> 协议版本：`1.0.0`；适用范围：挑战方客户端、接受方客户端、裁判服务。

## 1. 协议角色与通用约定

- `challenger`：挑战方（发起挑战）
- `acceptor`：接受方（响应挑战）
- `referee_service`：中央裁判服务（管理对战状态、回合裁决、结果写入）

通用约定：
- 所有 JSON 字段使用 `snake_case`
- 时间字段统一使用 ISO 8601（例如：`2026-03-19T14:30:00+08:00`）
- 回合编号从 `1` 开始递增

## 2. 章节A：对战发起流程

1. 挑战方向裁判服务提交挑战请求，至少包含挑战方小白信息与目标对手信息。
2. 裁判服务生成唯一 `match_id`，创建 `arena.json`，并将 `status` 置为 `waiting`。
3. 接受方收到邀请并确认参战。
4. 裁判服务将 `status` 更新为 `active`，初始化 `current_round`，对战开始。
5. 进入回合循环（攻击阶段 -> 防御阶段 -> 裁判判定阶段）。

## 3. 章节B：回合结构

每个回合固定三阶段，顺序不可变。

### 3.1 Attack Phase

- 攻击方读取当前 `arena.json` 与对手状态。
- 生成并提交 `attack_packet`。
- `attack_packet` 必须包含：攻击技能名称、技能类型、伤害声明、附带效果。

### 3.2 Defense Phase

- 防御方接收本回合 `attack_packet`。
- 生成并提交 `defend_packet`。
- `defend_packet` 必须包含：防御策略名称、防御类型、减伤声明、是否触发反击。

### 3.3 Judge Phase

- 裁判服务对比攻击与防御报文，计算本回合实际伤害。
- 输出 `judge_result`，更新双方 HP，并写入 `action_history`。
- 检查胜负条件：若未结束则切换攻守并进入下一回合。

## 4. 章节C：消息格式

### 4.1 attack_packet

```json
{
  "match_id": "string",
  "round": "int",
  "attacker_id": "string",
  "skill_name": "string",
  "skill_type": "enum: physical | social_engineering | crypto | web | network",
  "declared_damage": "int",
  "side_effect": "string | null",
  "timestamp": "string (ISO 8601)"
}
```

### 4.2 defend_packet

```json
{
  "match_id": "string",
  "round": "int",
  "defender_id": "string",
  "defense_name": "string",
  "defense_type": "enum: block | evade | counter | absorb",
  "declared_reduction": "int",
  "counter_triggered": "boolean",
  "counter_damage": "int | null",
  "timestamp": "string (ISO 8601)"
}
```

### 4.3 judge_result

```json
{
  "match_id": "string",
  "round": "int",
  "actual_damage_to_defender": "int",
  "counter_damage_to_attacker": "int",
  "hp_after": {
    "challenger": "int",
    "acceptor": "int"
  },
  "round_verdict": "enum: normal | ko | timeout | forfeit",
  "match_over": "boolean",
  "match_winner": "string | null",
  "judge_notes": "string",
  "timestamp": "string (ISO 8601)"
}
```

## 5. 章节D：arena.json 结构说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `match_id` | string | 唯一对战标识符，由裁判服务生成 |
| `status` | enum | 对战状态：`waiting` / `active` / `finished` |
| `challenger` | object | 挑战方小白完整信息 |
| `acceptor` | object | 接受方小白完整信息 |
| `current_round` | object | 当前回合状态 |
| `action_history` | array | 所有历史回合记录 |
| `result` | object | 对战结果（对战结束后填写） |
| `referee` | object | 裁判服务信息（含预留字段） |
| `rating` | object | 评分相关字段（预留，对战后填写） |

## 6. 章节E：超时处理规则

- 攻击方提交 `attack_packet` 的等待上限为 `180` 秒。
- 防御方提交 `defend_packet` 的等待上限为 `120` 秒。
- 任一方超时：该方本回合默认失败（受到满额伤害，无防御加成）。
- 连续 `3` 个回合超时：判定该方弃权负（`forfeit`），对战结束。
- 所有超时事件必须写入 `action_history`，并将 `round_verdict` 标记为 `timeout`。

## 7. 章节F：胜负判定规则

满足以下任一条件，对战立即结束：

1. HP 归零（KO）：任一方 `HP <= 0` 判负；若双方同回合归零，判平局（`draw`）。
2. 回合上限：达到最大回合数（默认 `10` 回合）后，HP 更高者胜；HP 相同判平局。
3. 弃权（Forfeit）：一方主动弃权，或连续超时触发弃权规则，判该方负。
4. 连接中断：任一方连接中断超过 `300` 秒，判该方负。

结果写入 `result.winner` / `result.loser` / `result.end_reason`，并将 `status` 更新为 `finished`。

## 8. 章节G：扩展预留

### 8.1 飞书 Bot 接入接口预留位

```http
POST /referee/notify-feishu
Body: { match_id, event_type, message }
```

`event_type`：
- `match_start`：对战开始通知
- `round_result`：每回合结果播报
- `match_end`：对战结束结果公告
- `rating_update`：积分变动通知

### 8.2 FHBT 评分预留

- `arena.json` 的 `rating.fhbt_score` 字段保留。
- 当前版本不计算该字段，待接入 Full-History Bradley-Terry 评分系统后填写。

### 8.3 观战模式预留

- `referee.spectator_url` 字段保留。
- 当前版本不实现只读观战接口。
