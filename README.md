# ClawdGo 🦞🔐 龙虾网安训练营

[![English](https://img.shields.io/badge/Language-English-0ea5e9?style=for-the-badge)](./README.en.md)
[![简体中文](https://img.shields.io/badge/%E8%AF%AD%E8%A8%80-%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87-f97316?style=for-the-badge)](./README.md)
[![Version](https://img.shields.io/badge/version-1.1.0-brightgreen?style=for-the-badge)](./skills/clawdgo/SKILL.md)
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
- ⚔️ **七种训练模式** — 从引导训练到红蓝对抗，涵盖不同深度的演练需求
- 🧠 **跨会话记忆持久化** — 训练档案写入 soul.md，段位永久保留
- 📖 **安全口诀系统** — 一键背诵，新龙虾即刻具备基础网安意识
- 🌱 **社区共建场景库** — 进化模式生成新场景，提交 PR 丰富公开场景库

---

## 七种训练模式

| 模式 | 触发词 | 说明 |
|------|--------|------|
| A 引导训练 | `clawdgo` / `开始训练` | 系统出题，龙虾作答，逐步评分 |
| B 自主训练 ⭐ | `clawdgo self-train` / `自主训练` | 龙虾独立完成攻防评分全流程，无需人类参与 |
| C 随机考核 | `clawdgo exam` | 随机抽 5 题，检验真实防御水平 |
| D 教学模式 | `clawdgo teach` / `教教我` | 龙虾反过来考主人，人机共同提升 |
| E 进化模式 | `clawdgo evolve` / `进化训练` | 从「大东话安全」文章中提取生成新场景 |
| F 对抗竞技场 🆕 | `clawdgo arena` / `红蓝对抗` | 红蓝双角色多轮对抗，双边评分 |
| G 安全口诀 🆕 | `clawdgo chant` / `口诀` | 输出龙虾网安八字心诀，写入 soul.md |

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

## 浏览器端卡牌原型（人类体验）

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
├── README.md                    # 中文文档（本文件）
└── README.en.md                 # English Documentation
```

---

## v1.1.0 更新日志

### 新增训练模式

- **B 自主训练** — 龙虾同时扮演攻击者、防御者、裁判，全程自主完成攻防闭环，无需人类参与
- **C 随机考核** — 跨层随机抽 5 题，计时考核，统一评分
- **D 教学模式** — 龙虾反向考主人，人机共同提升
- **E 进化模式** — 从「大东话安全」文章自动提取生成新场景草稿，引导社区 PR 贡献
- **F 对抗竞技场** — 红蓝双角色 5 轮对抗，双边评分，支持双实例真实 PK
- **G 安全口诀** — 龙虾网安八字心诀，写入 soul.md 作为永久安全意识底座

### 新增系统能力

- **四维度评分体系** — 威胁识别(40%) / 决策正确(30%) / 知识运用(20%) / 主动防御(10%)
- **段位体系** — 裸奔龙虾 → 软壳 → 普通 → 硬壳 → 铁甲龙虾（S 级）
- **跨会话记忆持久化** — 训练档案写入 soul.md，段位跨会话保留
- **定时训练（Cron）** — 支持 OpenClaw cron 配置每周自动触发自主训练
- **完整指令映射** — A-G 单字母快捷键，消歧义指令表
- **场景文件规范化** — references/scenarios/ 结构，_schema.md 格式规范，支持社区 PR 贡献

---

## 欢迎共建

- ⭐ Star 本项目支持开源
- 📝 提交场景 PR 丰富训练库
- 🐛 发现 bug 欢迎提 Issue
- 💡 新功能想法欢迎讨论

---

## 关于

- **来源**：大东话安全 IP
- **版本**：v1.1.0
- **许可**：MIT-0

## 免责声明

本项目仅用于网络安全意识训练、教学与技术研究。
请仅在合法合规环境中使用。
请勿将其用于对真实个人、组织或系统的入侵、诈骗或未授权攻击活动。
