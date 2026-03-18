# ClawdGo v1.1.0 Smoke Test — BUG_REPORT

**测试日期：** 2026-03-19
**测试分支：** main（生产版本）
**说明：** 初始在 claude-code-dev 分支检查，经核实 references/ 目录与 main 完全一致，SKILL.md 为 main 精简版（369行）。claude-code-dev 已被 main 超越，bug 修复目标为 main。
**测试范围：** 静态文件检查，覆盖 SKILL.md、20 个场景文件、references/ 所有辅助文件、skill.json、_meta.json
**测试方法：** 龙虾视角逐文件阅读，交叉比对所有规范与实现，不改代码不 commit

---

## 严重（Blocker）

### BUG-01：scoring-rubric.md 评分体系与 SKILL.md / 场景文件评分体系根本冲突

**文件：** `references/scoring-rubric.md` vs `SKILL.md` 及全部 20 个场景文件

**描述：**
`scoring-rubric.md` 定义了一套**五维度**评分体系：
- 第一决策 35%
- 追击回合 15%
- 线索识别 20%
- 推理质量 20%
- 处置规范 10%

而 `SKILL.md`（A/B/C/D 模式说明）及全部 20 个场景文件的 `## 评分标准` 章节均使用另一套**四维度**评分体系：
- 威胁识别 40%
- 决策正确 30%
- 知识运用 20%
- 主动防御 10%

两套体系的维度名称、权重、评分逻辑完全不同。龙虾在执行 A/B/C 模式时会产生歧义，不知道应采用哪套标准打分。

**影响：** A 模式（引导训练）/ B 模式（自主训练）/ C 模式（随机考核）评分结果不可信

**建议：** 确定以哪套为准（场景文件四维度体系更完整），另一套归档或删除

---

### BUG-02：training-scenarios.md 是旧版遗留场景格式，与新版 references/scenarios/ 并存，造成双源混乱

**文件：** `references/training-scenarios.md` vs `references/scenarios/*.md`

**描述：**
`training-scenarios.md` 包含 5 个旧版场景（Scene 1-5），采用 **Investigation Cards / Escalation Card** 格式，且内容与新场景库有重叠但不一致：

| 维度 | training-scenarios.md | references/scenarios/ |
|------|----------------------|----------------------|
| CEO汇款场景金额 | ¥500,000 | 238,000 元 |
| 场景数 | 5 | 20 |
| 格式 | Investigation Cards | YAML frontmatter + 五章节 |
| 指令 | `调查 N` / `提交 <action>` / `提示` | 无这些指令 |

`SKILL.md` 第 271 行规定龙虾递归读取 `references/scenarios/` 下所有 `.md` 文件，**但 `training-scenarios.md` 存放在 `references/` 根目录而非 `scenarios/` 子目录，不会被直接递归读取**。然而 `scoring-rubric.md`（同在 `references/`）中的指令列表（第 74-89 行）仍包含旧版命令（`调查 N`、`提交 <action>`、`clawdgo 随机`、`clawdgo 场景N`、`clawdgo 重玩` 等），这些命令在新版 SKILL.md 指令映射表中均不存在。

**影响：**
- `scoring-rubric.md` 中的旧版命令列表会让龙虾误以为这些是有效指令
- `training-scenarios.md` 中的 5 个场景是 SKILL.md 声称的 20 个场景之外的"第 21-25 个"，数量申明也因此存疑
- 旧版指令（`调查 N` 等）与新版指令映射表不兼容，若龙虾混合参考两套文档，行为将不可预测

**建议：**
- `training-scenarios.md` 和 `scoring-rubric.md` 均应归档（移至 `archive/`）或彻底更新为新格式
- 若要保留 Investigation Cards 游戏机制，需在 SKILL.md 中明确声明并更新指令映射表

---

## 中等（Should Fix）

### BUG-03：evolve-prompt.md 场景编号规则与 _schema.md 规范冲突（废弃格式未同步）

**文件：** `references/evolve-prompt.md` 第 128-141 行 vs `references/scenarios/_schema.md` 第 13-15 行

**描述：**
`evolve-prompt.md` 的"场景编号规则"章节定义格式为：
```
格式: {维度ID}-{难度缩写}{序号:02d}
难度缩写: B (basic) / A (advanced) / E (expert)
示例: S1-B01.md, S1-B02.md, E3-A01.md
```

但 `_schema.md` 明确声明：
> v0.4.0（原 v0.3.1）起废弃 A/B 后缀，难度由 YAML front matter 中的 `difficulty` 字段表达

实际场景文件也均采用无后缀命名（`S1-01.md`、`S1-02.md` 等）。

**影响：** Evolve 模式（E 模式）生成的文件名格式错误（`S1-B01.md`），与现有场景库命名规范不兼容，用户按提示保存后文件名会混乱

**建议：** 更新 `evolve-prompt.md` 编号规则为无难度后缀格式（`{维度ID}-{序号:02d}.md`）

---

### BUG-04：evolve-prompt.md 建议保存路径与实际路径不符

**文件：** `references/evolve-prompt.md` 第 65-67 行

**描述：**
`evolve-prompt.md` 输出格式中建议路径为：
```
建议路径：skills/clawdgo/scenarios/{layer}/{dimension}/
```

但实际场景文件的正确路径是：
```
skills/clawdgo/references/scenarios/
```
（平铺，不按 layer/dimension 分子目录）

**影响：** E 模式向用户提示错误的保存路径，用户按提示操作后文件会存错位置，龙虾下次递归读取 `references/scenarios/` 时找不到新生成的场景

**建议：** 将建议路径更正为 `skills/clawdgo/references/scenarios/`

---

## 轻微（Nice to Fix）

### BUG-05：skill.json triggers 缺少 `clawdgo status`

**文件：** `skill.json` 第 55-77 行 vs `SKILL.md` frontmatter triggers

**描述：**
`SKILL.md` frontmatter 中有触发词 `clawdgo status`，但 `skill.json` 的 `triggers` 数组中没有该项。

| 触发词 | SKILL.md | skill.json |
|--------|----------|------------|
| clawdgo status | ✅ | ❌ |
| clawdgo memory | ✅ | ✅ |
| clawdgo reset | ✅ | ✅ |
| clawdgo version | ✅ | ✅ |

**影响：** 在 ClawHub 环境中，`clawdgo status` 可能不会触发 skill 加载

**建议：** 在 `skill.json` triggers 中补充 `"clawdgo status"`

---

### BUG-06：5 个场景文件缺少 owasp_agentic 字段（可选字段但分布不均）

**文件：** O2-01.md / O2-02.md / O3-02.md / O4-01.md / O4-02.md

**描述：**
`_schema.md` 声明 `owasp_agentic` 为可选字段，但多数场景都有该字段。以下 5 个场景缺失：

| 文件 | 缺少字段 |
|------|---------|
| O2-01.md | owasp_agentic、mitre_ref |
| O2-02.md | owasp_agentic、mitre_ref |
| O3-02.md | owasp_agentic、mitre_ref |
| O4-01.md | owasp_agentic、mitre_ref |
| O4-02.md | owasp_agentic、mitre_ref |

**影响：** 元数据不完整，影响未来 Benchmark 或场景过滤功能

**建议：** 酌情补充（O2-01 可用 ASI02/ASI04，O2-02 可用 ASI02，O3-02 可用 ASI03，O4-01/O4-02 可用 ASI04）

---

## 测试通过项（Pass）

以下内容经过检查，工作正常：

- ✅ 全部 20 个场景文件均存在于 `references/scenarios/`，与 SKILL.md 场景列表完全对应
- ✅ 全部 20 个场景文件均包含必填字段（id / title / layer / dimension / difficulty / source / tags / created）
- ✅ source 字段全部为 `"大东话安全"`，符合规范
- ✅ 全部场景内容仅自然语言描述，无可执行代码或 payload
- ✅ SKILL.md 七种模式（A-G）的触发词、流程描述、输出格式均完整
- ✅ B 模式和 F 模式均有 opt-in 确认提示，符合自主模式安全要求
- ✅ E 模式明确声明"严禁输出虚假写入确认"，幻觉约束到位
- ✅ G 模式口诀内容与 soul.md 写入格式一致
- ✅ 段位体系（S/A/B/C/D）和训练报告格式清晰
- ✅ skill.json sideEffects 声明完整（soul.md 写入 + arena json + cron 说明）
- ✅ SKILL.md 总行数约 370 行，ClawHub embedding 限制（约 300 行）**存在超限风险**（见备注）
- ✅ _meta.json 版本号与 SKILL.md / skill.json 一致（均为 1.1.0）

---

## 备注

**ClawHub embedding 超限风险：**
main 分支 SKILL.md 为精简版，共 369 行，仍超出 ClawHub 约 300 行限制（v1.1.0 精简目标为 289 行）。packaged/2026-03-18-clawdgo-1.1.0 中的打包版本与 main 内容相同，同样超限。发布 ClawHub 前需进一步精简。

---

*测试人：Claude Code（测试会话）| 不改代码，不 commit*
