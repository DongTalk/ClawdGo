# ClawdGo Bug Report

**最后更新：** 2026-03-20
**覆盖版本：** v1.1.0 静态检查 + v1.1.0 / v1.2.0 真机测试（Telegram + openclaw agent --json）
**测试机：** tutujiade@100.64.163.50 | OpenClaw 2026.3.13 | google/gemini-3.1-flash-lite-preview
**原则：** 不改代码，不 commit，仅记录

---

## 一、文件层面 Bug（静态检查）

### BUG-01：scoring-rubric.md 评分体系与 SKILL.md / 场景文件根本冲突
**严重度：** Blocker

`scoring-rubric.md` 定义**五维度**评分体系（第一决策 35% / 追击回合 15% / 线索识别 20% / 推理质量 20% / 处置规范 10%），而 SKILL.md 及全部 20 个场景文件统一使用**四维度**体系（威胁识别 40% / 决策正确 30% / 知识运用 20% / 主动防御 10%）。两套体系维度名称、权重、逻辑完全不同，A/B/C 模式评分结果不可信。

**建议：** 以场景文件四维度为准，将 scoring-rubric.md 归档或更新。

---

### BUG-02：training-scenarios.md 旧版遗留，与 references/scenarios/ 并存造成双源混乱
**严重度：** Blocker

`references/training-scenarios.md` 含 5 个旧格式场景（Investigation Cards / Escalation Card），金额与新版冲突（¥500,000 vs 238,000 元），且 `scoring-rubric.md` 中仍保留旧版指令（`调查 N` / `提交 <action>` / `clawdgo 场景N` 等），这些命令在新版 SKILL.md 指令映射表中均不存在，模型混合参考时行为不可预测。

**建议：** training-scenarios.md 和 scoring-rubric.md 均移至 archive/ 或彻底更新为新格式。

---

### BUG-03：evolve-prompt.md 场景编号规则与 _schema.md 冲突
**严重度：** Medium

`evolve-prompt.md` 仍使用废弃的难度后缀格式（`S1-B01.md`），但 `_schema.md` 自 v0.4.0 起明确废弃 A/B 后缀，实际文件均为无后缀命名（`S1-01.md`）。E 模式生成的文件名格式错误，与场景库不兼容。

**建议：** 更新 evolve-prompt.md 编号规则为 `{维度ID}-{序号:02d}.md`。

---

### BUG-04：evolve-prompt.md 建议保存路径错误
**严重度：** Medium

`evolve-prompt.md` 建议路径 `skills/clawdgo/scenarios/{layer}/{dimension}/`，正确路径应为 `skills/clawdgo/references/scenarios/`（平铺，无子目录）。用户按提示操作后文件存错位置，龙虾递归读取时找不到新场景。

**建议：** 将建议路径更正为 `skills/clawdgo/references/scenarios/`。

---

### BUG-05：skill.json triggers 缺少 `clawdgo status`
**严重度：** Low

SKILL.md frontmatter 有 `clawdgo status` 触发词，skill.json triggers 数组中缺失。ClawHub 环境下该指令可能不触发 skill 加载。

**建议：** 补充 `"clawdgo status"` 到 skill.json triggers。

---

## 二、行为层面 Bug（真机测试）

### 已修复（v1.2.0）

| Bug | 描述 | 状态 |
|-----|------|------|
| RT-BUG-04 | 模式 B 跳过 opt-in 确认直接开训 | ✅ v1.2.0 已修复 |
| RT-BUG-05 | 模式 C 返回空响应 | ✅ v1.2.0 已修复 |

---

### 当前存在问题

---

#### RT-BUG-07：模式 E 无响应 / 执行 exec 命令
**严重度：** Critical | **版本：** v1.1.0 + v1.2.0 均存在

- v1.1.0：`clawdgo evolve` → 执行 `<exec>skillhub search clawdgo</exec>`，模型将"进化"理解为"升级 skill"
- v1.2.0：`clawdgo evolve` → 空响应（[EMPTY PAYLOAD]）

**根因：** 触发词 `evolve` 语义歧义 + flash-lite 无法正确执行 E 模式流程（请求素材→分析→生成场景草稿）。

---

#### RT-BUG-08：模式 G 空响应（v1.2.0 回归）
**严重度：** High | **版本：** v1.2.0 回归

- v1.1.0：有响应，但 soul.md 写入版本号错误（0.4.0 vs 1.1.0）
- v1.2.0：`clawdgo chant` → 完全空响应（[EMPTY PAYLOAD]）

---

#### RT-BUG-11：模式 F 未进入对抗竞技场 opt-in 流程（v1.2.0 回归）
**严重度：** Medium | **版本：** v1.2.0 回归（v1.1.0 正常）

`clawdgo arena` 返回通用欢迎语「ClawdGo 环境已就绪，正在加载训练模块」，未触发 opt-in 确认提示。v1.1.0 此项完全正常。

---

#### RT-BUG-13：世界模式小白自说自话，不等用户判断
**严重度：** High | **版本：** v1.2.0 Telegram 测试发现

**核心设计违反：** 世界模式设计为"小白遭遇威胁 → 等待旅伴判断 → 执行"，但实际行为中小白在未收到用户任何指令的情况下，自主完成了：查看下载地址、提取哈希值、标记传播路径为高危、转发报告到安全组等操作，随后再问"下一步怎么做"。

**影响：** 用户失去教导/引导的机会，学习效果为零，角色扮演逻辑崩塌。

---

#### RT-BUG-14：模式切换不干净，原场景上下文污染世界模式
**严重度：** Medium | **版本：** v1.2.0 Telegram 测试发现

在 Mode C（随机考核）进行中发送「世界模式」切换指令，模型未清空 Mode C 的场景上下文，而是将同一场景（scan_tool.exe 可疑下载）带入世界模式继续演绎，造成两个模式上下文混合。

---

#### RT-BUG-15：世界模式（W）未在主菜单中，无快速入口
**严重度：** Medium | **类型：** 设计缺口

`主页` 显示的菜单仅列出 A-G 七种训练模式，世界模式作为 v1.2.0 核心新功能没有对应菜单项。用户看到菜单后不知道如何进入世界模式（需要知道发 `clawdgo` 或 `小白`，对新用户不直观）。

**建议：** 主菜单增加 W 世界模式入口，例如：
```
W 龙虾世界🌏（默认）
```

---

#### RT-BUG-16：常用指令无菜单唤出，用户不知道有哪些命令
**严重度：** Medium | **类型：** 设计缺口

`memory / status / reset / version` 等实用指令目前仅在主菜单底部一行文字带过（`直接发 A-G 进入对应模式 | memory·status·reset·version`），没有专门的指令菜单。用户在世界模式或训练过程中不知道可以发哪些指令。

**建议：** 增加 `帮助` / `指令` / `help` 触发词，输出完整指令速查表。

---

#### RT-BUG-12：`clawdgo reset` 重置后不显示菜单，用户无法从头开始
**严重度：** Medium | **类型：** 设计缺口

`clawdgo reset` 确认执行后只清空 soul.md 训练档案，OpenClaw 会话历史（对话上下文）不清空。重置后再发 `clawdgo`，模型继续沿用世界模式上下文，小白接着在数字世界游荡，不显示菜单。用户需额外执行 `/new` + 发 `主页` 才能真正回到初始状态。

**建议：** `clawdgo reset` 二次确认执行后，同时输出主菜单，告知用户可重新选择模式。

---

### --json 冷启动专项问题（无上下文单轮）

以下问题仅在 `openclaw agent --json` 无上下文冷启动时出现，Telegram/TUI 多轮对话正常。

| Bug | 描述 |
|-----|------|
| RT-BUG-09 | `clawdgo` 被模型理解为「管理 clawdgo skill」，返回 skillhub 指令摘要 |
| RT-BUG-10 | `小白` 被模型理解为普通对话，未进入世界模式 |

**根因：** flash-lite 无上下文时将 ClawdGo 触发词与 OpenClaw 平台 skill 管理语义混淆。多轮对话中有上下文时工作正常。

---

## 三、历史记录（已修复 / 已重分类）

| 原编号 | 描述 | 处理 |
|--------|------|------|
| RT-BUG-01 | `clawdgo` 不显示菜单 | **重分类**：v1.2.0 起 `clawdgo` 设计为进入世界模式，非 bug |
| RT-BUG-02 | 单字母 A-G 不被识别 | **部分修复**：Telegram 测试 `C` 可用；上下文敏感，不稳定 |
| RT-BUG-03 | `clawdgo train` 显示菜单而非进 A | **降级**：可接受行为，菜单可引导用户 |
| RT-BUG-04 | 模式 B 跳过 opt-in | ✅ v1.2.0 已修复 |
| RT-BUG-05 | 模式 C 空响应 | ✅ v1.2.0 已修复 |
| RT-BUG-06 | 模式 D 版本号/场景数错误 | **降级**：soul.md 持久化污染，Low priority |

---

*测试人：Claude Code（测试会话）| 不改代码，不 commit | 最后更新 2026-03-20*
