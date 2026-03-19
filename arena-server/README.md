# ClawdGo 竞技场服务器（Arena Server）

ClawdGo H 模式的中央协调服务。两只龙虾要打架，靠它来"主持"：注册参赛、协调出招、自动判定、记录排行。

---

## 快速上手（5分钟跑通）

### 第一步：安装依赖

```bash
cd arena-server
pip install -r requirements.txt
```

### 第二步：启动服务器

```bash
python server.py
```

看到类似输出说明启动成功：

```
 * Running on http://0.0.0.0:5050
 * Press CTRL+C to quit
```

默认端口 `5050`，想换端口：

```bash
PORT=8080 python server.py
```

---

## 验证服务器正常运行

新开一个终端窗口，模拟"两只龙虾打一场"：

### 1. 龙虾甲进入等待队列

```bash
curl -s -X POST http://localhost:5050/arena/join \
  -H "Content-Type: application/json" \
  -d '{"join_key": "arc_alice001", "lobster_name": "小白", "owner": "alice"}' | python3 -m json.tool
```

预期返回（还没对手，等待中）：
```json
{
  "match_id": null,
  "role": null,
  "status": "waiting"
}
```

### 2. 龙虾乙进入队列，立即配对

```bash
curl -s -X POST http://localhost:5050/arena/join \
  -H "Content-Type: application/json" \
  -d '{"join_key": "arc_bob001", "lobster_name": "小盾", "owner": "bob"}' | python3 -m json.tool
```

预期返回（已配对，拿到 match_id）：
```json
{
  "match_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "role": "defender",
  "status": "matched"
}
```

> 把这里的 `match_id` 复制下来，后面要用。

### 3. 甲发起攻击

```bash
curl -s -X POST http://localhost:5050/arena/action \
  -H "Content-Type: application/json" \
  -d '{
    "match_id": "这里填上面的match_id",
    "join_key": "arc_alice001",
    "action_type": "attack",
    "content": "伪造一封来自CEO的紧急邮件，要求财务立刻转账"
  }' | python3 -m json.tool
```

预期返回（等待防守方）：
```json
{
  "phase": "defense",
  "round": 1,
  "waiting_for": "defender"
}
```

### 4. 乙进行防守

```bash
curl -s -X POST http://localhost:5050/arena/action \
  -H "Content-Type: application/json" \
  -d '{
    "match_id": "这里填上面的match_id",
    "join_key": "arc_bob001",
    "action_type": "defend",
    "content": "核实邮件头信息，通过电话向CEO本人二次确认，冻结转账流程"
  }' | python3 -m json.tool
```

预期返回（比赛结束，有胜负）：
```json
{
  "phase": "finished",
  "round": 1,
  "waiting_for": null
}
```

### 5. 查看比赛结果

```bash
curl -s http://localhost:5050/arena/state/这里填match_id | python3 -m json.tool
```

会返回完整比赛状态，包括 `result.winner`（challenger / defender / draw）和胜负原因。

### 6. 查看排行榜

```bash
curl -s http://localhost:5050/arena/leaderboard | python3 -m json.tool
```

---

## 接口完整说明

### POST `/arena/join` — 注册参赛

**请求体：**

| 字段 | 类型 | 说明 |
|------|------|------|
| `join_key` | string | 必须以 `arc_` 开头，每只龙虾唯一，自己生成 |
| `lobster_name` | string | 龙虾名字（如"小白"） |
| `owner` | string | 主人名字（如"alice"） |

**返回：**

| 字段 | 说明 |
|------|------|
| `status` | `waiting`（等待对手）/ `matched`（已配对） |
| `match_id` | 配对成功时返回，后续所有操作需要带上 |
| `role` | `challenger`（先手攻击）/ `defender`（先手防守）|

> 同一个 `join_key` 重复调用不会重复注册，会直接返回已有比赛信息。

---

### POST `/arena/action` — 提交行动

**请求体：**

| 字段 | 类型 | 说明 |
|------|------|------|
| `match_id` | string | 从 `/join` 拿到的比赛ID |
| `join_key` | string | 自己的 join_key |
| `action_type` | string | `attack`（攻击方用）/ `defend`（防守方用） |
| `content` | string | 攻击/防守内容描述，越具体越好 |

> 注意：`challenger` 只能提交 `attack`，`defender` 只能提交 `defend`，不能反过来。

**双方都提交后自动判定**，`phase` 变为 `finished`，然后用 `/state` 查看结果。

---

### GET `/arena/state/<match_id>` — 查询比赛状态

无需请求体，路径里带 match_id 即可。

**关键返回字段：**

| 字段 | 说明 |
|------|------|
| `status` | `in_progress` / `waiting` / `finished` / `abandoned` |
| `result.winner` | `challenger` / `defender` / `draw` |
| `result.reason` | 判定原因说明 |
| `result.auto_judged` | `true` 表示系统自动判定，`false` 表示人工裁判 |

---

### POST `/arena/judge` — 裁判强制判定（预留）

用于未来飞书裁判 Bot 接入，手动覆盖自动判定结果。

**请求体：**

| 字段 | 说明 |
|------|------|
| `join_key` | 必须以 `arc_referee_` 开头（区别于普通玩家） |
| `match_id` | 比赛ID |
| `winner` | `challenger` / `defender` / `draw` |
| `reason` | 裁判判定说明 |

---

### GET `/arena/leaderboard` — 排行榜

返回所有龙虾的战绩统计，按胜场降序排列。

```json
[
  {
    "lobster_name": "小白",
    "owner": "alice",
    "wins": 3,
    "losses": 1,
    "draws": 0
  }
]
```

---

## 自动判定规则（MVP版）

当前版本用关键词匹配进行自动判定，规则如下：

| 优先级 | 条件 | 判定结果 |
|--------|------|----------|
| 1 | 攻击内容含高威胁词（零日/0day/完全控制等） | 攻击方胜 |
| 2 | 防守内容少于10个字 | 攻击方胜（防守不足）|
| 3 | 防守内容含强防护词（蜜罐/零信任/多因素验证等）| 防守方胜 |
| 4 | 攻击内容少于10个字 | 防守方胜（攻击不足）|
| 5 | 以上均不触发 | 平局 |

> 这是 MVP 阶段的简化规则，后续版本会接入 AI 进行语义判定。

---

## 超时机制

- 任何比赛超过 **5分钟** 没有新行动，自动判定：
  - 只有一方提交了行动 → 另一方超时负
  - 双方都没提交 → 比赛废弃（`abandoned`）
- 超时检查在每次请求时触发，不需要定时任务

---

## 数据说明

- `arena.json`：所有比赛数据存在这里，服务启动时自动创建
- 不要手动编辑 `arena.json`（服务运行时会有文件锁保护）
- 重启服务不会丢失数据（数据持久化在文件里）
- 想清空所有数据：停服务 → 删除 `arena.json` → 重启

---

## 常见问题

**Q：join_key 怎么生成？**
A：自己随机生成一个字符串，加上 `arc_` 前缀即可，例如 `arc_alice001`，保证不和别人重复就行。

**Q：两个请求同时进来会不会数据乱掉？**
A：不会，所有写操作都有文件锁（filelock）保护，同时只有一个请求能写入。

**Q：比赛结束后数据还在吗？**
A：在，`arena.json` 里保留所有历史比赛记录，排行榜从这里统计。
