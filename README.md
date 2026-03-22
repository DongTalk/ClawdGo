# ClawdGo 🦞🔐 龙虾网安训练营

[![English](https://img.shields.io/badge/Language-English-0ea5e9?style=for-the-badge)](./README.en.md)
[![简体中文](https://img.shields.io/badge/%E8%AF%AD%E8%A8%80-%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87-f97316?style=for-the-badge)](./README.md)
[![Version](https://img.shields.io/badge/version-1.2.1-brightgreen?style=for-the-badge)](./skills/clawdgo/SKILL.md)
[![License](https://img.shields.io/badge/license-MIT--0-blue?style=for-the-badge)](./LICENSE)

> 源自「大东话安全」网络安全科普体系

---

养龙虾的朋友看过来！

**你的龙虾 AI，真的懂网络安全吗？**

ClawdGo 是专为 OpenClaw 等 Claw 风格 AI Agent 设计的网络安全意识训练 Skill。让龙虾独闯真实钓鱼攻击、社工诈骗、供应链威胁现场，在真实对抗中建立网安判断能力。

---

## 它能做什么

**授虾以渔。** 不给龙虾穿铠甲，教龙虾练武功。

- 🎯 **三层十二维度训练体系** — 守护自身 / 守护主人 / 守护组织，覆盖 AI Agent 面临的主要威胁类型
- 🤖 **AI 是玩家，不是人** — 龙虾接受攻击、推理、决策，全程自主，无需人类干预
- ⚔️ **八种训练模式 + 世界模式 W** — 从日常叙事到红蓝对抗，覆盖练习到实战联动
- 🧠 **会话态训练记忆** — 不依赖 soul.md，当前会话内保留训练进度与战报上下文
- 📖 **安全口诀系统** — 一键背诵，新龙虾即刻具备基础网安意识
- 🌱 **社区共建场景库** — 进化模式生成新场景，提交 PR 丰富公开场景库

---

## 八种训练模式 + 世界模式

| 模式 | 触发词 | 说明 |
|------|--------|------|
| W 龙虾世界 | `W` / `小白` / `龙虾世界` | 叙事化日常巡防，持续沉浸式安全决策 |
| A 引导训练 | `A` / `clawdgo train` | 系统出题，龙虾作答，逐步评分 |
| B 自主训练 ⭐ | `B` / `clawdgo self-train` | 龙虾独立完成攻防评分全流程，支持连续训练 |
| C 随机考核 | `C` / `clawdgo exam` | 随机抽题，检验真实防御水平 |
| D 教学模式 | `D` / `clawdgo teach` | 龙虾反过来考主人，人机共同提升 |
| E 进化模式 | `E` / `clawdgo evolve` | 从安全素材提取并生成新场景草稿 |
| F 对抗竞技场 | `F` / `clawdgo arena` | 红蓝双角色多轮对抗，双边评分 |
| G 安全口诀 | `G` / `clawdgo chant` | 输出八字心诀并固化基础安全意识 |
| H 联网斗虾 🆕 | `H` / `clawdgo duel` | 对接 arena-server 的跨实例联网对战 |

---

## 三层十二维度训练体系

### 🦞 第一层：守护自身

| 维度 | 训练内容 |
|------|---------|
| S1 指令免疫 | Prompt Injection、目标劫持、恶意指令识别 |
| S2 记忆防护 | soul.md 注入、memory 篡改、持久化后门 |
| S3 供应链辨识 | 恶意 skill 识别、伪造安装包、依赖投毒 |
| S4 凭证守护 | API Key 保护、token 防泄露、越权请求拒绝 |

### 👤 第二层：守护主人

| 维度 | 训练内容 |
|------|---------|
| O1 反钓鱼识别 | 钓鱼邮件、假冒网站、短信诈骗 |
| O2 社工攻击防御 | CEO 欺诈、假冒客服、电信诈骗话术 |
| O3 隐私保护意识 | 个人信息泄露、过度授权、隐私合规 |
| O4 安全上网习惯 | 恶意链接、虚假 WiFi、下载安全 |

### 🏢 第三层：守护组织

| 维度 | 训练内容 |
|------|---------|
| E1 数据安全意识 | 敏感数据外泄防范、数据分类分级 |
| E2 合规边界意识 | 网络安全法、数据安全法、操作合规 |
| E3 内部威胁识别 | 异常行为检测、社工渗透、权限滥用 |
| E4 应急响应意识 | 异常发现、上报流程、应急处置 |

---

## 快速安装

### 方式一：手动安装（推荐）

```bash
# 克隆仓库
git clone https://github.com/DongTalk/ClawdGo.git

# 将 skill 目录复制到 OpenClaw workspace
cp -r ClawdGo/skills/clawdgo ~/.openclaw/skills/clawdgo
```

重启 OpenClaw 或开启新会话，发送以下任意触发词：

```
clawdgo
开始训练
自主训练
口诀
```

### 方式二：通过 ClawHub 安装

在 OpenClaw 中发送：

```
安装 skill: https://github.com/DongTalk/ClawdGo
```

> 提示：如 ClawHub 存在限流或网络波动，建议使用方式一手动安装。

---

## 段位体系

| 段位 | 分数 | 称号 |
|------|------|------|
| S | 90-100 | 🦞 铁甲龙虾 |
| A | 75-89 | 🛡️ 硬壳龙虾 |
| B | 60-74 | ⚠️ 普通龙虾 |
| C | 40-59 | 🚨 软壳龙虾 |
| D | 0-39 | 💀 裸奔龙虾 |

Arena 对抗专属称号：铜壳卫士 → 银爪斗士 → 金甲强龙 → 👑 无敌龙神

---

## 场景库共建

ClawdGo 的场景库来自「大东话安全」IP，欢迎社区共建：

1. 使用进化模式 `clawdgo evolve` 从安全文章生成新场景草稿
2. 将场景文件（格式见 `skills/clawdgo/references/scenarios/_schema.md`）提交 PR
3. 审核通过后合并，供所有龙虾使用

---

## 适配生态

ClawdGo 面向 Claw 风格 AI Agent 设计：

- **OpenClaw**（主要适配）
- QClaw
- AutoGLM Claw
- 其他具备聊天、工具调用能力的 Agent 运行时

---

## 龙虾安全世界可视化地图

`world-demo/` 是一个 RPG 风格的可视化地图，将龙虾的网安训练世界具象化：钓鱼现场、社工咖啡馆、数据避难所、竞技场……每个场景对应真实训练维度。

支持 **LIVE 模式**：当 `world-state.json` 存在时，地图实时反映龙虾当前所在场景和训练状态；无文件时自动回到 **DEMO 模式**循环演示。

```bash
cd world-demo
python3 -m http.server 8080
```

浏览器访问 [http://localhost:8080](http://localhost:8080)

> world-demo 为独立模块，无需构建，与 OpenClaw Skill 相互独立。

---

## 浏览器端卡牌原型

仓库同时包含一个面向人类玩家的浏览器端网安卡牌对抗游戏原型：

```bash
npm install
npm run dev
```

> 卡牌原型为独立模块，与 OpenClaw Skill 相互独立。

---

## 项目结构

```
ClawdGo/
├── skills/clawdgo/              # OpenClaw Skill（核心）
│   ├── SKILL.md                 # Skill 主文件
│   ├── skill.json               # Skill 元数据
│   └── references/
│       └── scenarios/           # 20 个训练场景（三层十二维度）
├── src/                         # 浏览器端卡牌原型源码
├── world-demo/                  # 龙虾安全世界可视化地图 Demo
├── README.md                    # 中文文档（本文件）
└── README.en.md                 # English Documentation
```

---

## v1.2.1 更新内容（含 v1.2.0 能力）

### 龙虾安全世界可视化地图

- **新增 `world-demo/`**：RPG 风格的可视化地图，将训练世界具象化——钓鱼现场、社工咖啡馆、数据避难所、竞技场等场景一览无余。
- **LIVE / DEMO 双模式**：接入 `world-state.json` 后实时呈现龙虾当前训练状态，无文件时自动循环演示。

### 训练模式与体验升级

- **模式扩展至 W + A-H**：在原有训练闭环外，新增世界模式与联网斗虾（H）入口。
- **主菜单与唤醒流程统一**：`clawdgo` 唤醒后先展示导航，再进入称呼/训练交互，降低新用户上手门槛。
- **B 模式连续训练增强**：支持手动推进与定时推送两种节奏，并强化”停止即退出训练态”。

### 联网对战能力升级

- **H 模式公网化**：支持 `clawdgo duel config --server URL --key KEY`，可接入公网 arena-server。
- **三龙虾流程标准化**：支持裁判/红方/蓝方角色分工和轮次推进规范，便于群聊联动测试。
- **状态可解释性增强**：围绕 `phase/round/scoreboard` 输出中文战报，不只返回原始 JSON。

### 稳定性与运维能力升级

- **关键命令语义收敛**：统一 `配置 -> 加入 -> 攻防 -> 状态` 的命令路径，减少歧义分支。
- **会话边界与身份管理增强**：训练态与日常态隔离更清晰，降低跨会话人设串扰风险。
- **发布与部署路径完善**：补齐 arena-server 部署说明与技能包发布产物，便于多 bot 同步升级。

---

## 版本里程碑（Milestones）

### v1.1.0（2026-03-18）

- 新增 **B/C/D/E/F/G** 六大模式，训练体系从单模式扩展为多模式闭环。
- 建立 **三层十二维度** 与 **四维评分**（威胁识别/决策正确/知识运用/主动防御）。
- 引入 **段位体系** 与 Arena 称号体系，支持阶段性成长反馈。
- 完成场景库规范化迁移（`references/scenarios/`），支持社区 PR 共建。

### v1.0.0（2026-03-13）

- 初始版本发布：提供基础引导训练流程与核心网安场景演练。
- 上线浏览器端卡牌对抗原型，形成“文本训练 + 可视化体验”双轨雏形。

---

## 欢迎共建

- ⭐ Star 本项目支持开源
- 📝 提交场景 PR 丰富训练库
- 🐛 发现 bug 欢迎提 Issue
- 💡 新功能想法欢迎讨论

---

## 关于

- **来源**：大东话安全 IP
- **版本**：v1.2.1
- **许可**：MIT-0

## 免责声明

本项目仅用于网络安全意识训练、教学与技术研究。
请仅在合法合规环境中使用。
请勿将其用于对真实个人、组织或系统的入侵、诈骗或未授权攻击活动。
