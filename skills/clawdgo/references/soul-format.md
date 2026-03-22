# soul.md 写入格式规范

## 训练记忆持久化（[ClawdGo Training Record]）

每次训练完成后，更新 soul.md 中的以下区域（upsert，只读写自己标记的区域）：

```
[ClawdGo Training Record]
version:1.2.6 | last_trained:{日期} | total_sessions:{次数} | overall_score:{分} | rank:{段位}
dimension_scores: S1:{分} S2:{分} S3:{分} S4:{分} O1:{分} O2:{分} O3:{分} O4:{分} E1:{分} E2:{分} E3:{分} E4:{分}
completed_scenarios: {场景ID}:{分} ...
weak_dimensions: [{薄弱维度列表}]
world_state:
  location:{地点}
  mood:{好奇/放松/警惕/紧张/危险/恐慌/自豪}
  resolved_threats:{次数}
  threat:{当前威胁或null}
  last_event:{本次事件一句话总结}
  level:{当前成长等级1-5}
  pending_decision:{等待用户决策内容或null}
[/ClawdGo Training Record]
```

记忆规则：同一场景重复训练取最高分；自主训练优先选薄弱维度（均分<60）。

## W 模式 world_state 写入字段

W 模式每次事件结束后，更新 soul.md 的 world_state 块，必须包含：
- location：当前地点
- mood：仅从 `好奇/放松/警惕/紧张/危险/恐慌/自豪` 中选择
- resolved_threats：累计解决威胁数（整数，只增不减）
- threat：当前威胁描述，安全时写 `null`
- last_event：本次事件 1 句话总结
- level：当前成长等级（1-5）
- pending_decision：等待用户决策内容，无则写 `null`

## 安全口诀写入（[ClawdGo Security Chant]）

收到 `clawdgo chant` 后写入：
```
[ClawdGo Security Chant] version:1.2.6
四不：不信·不点·不填·不传 | 四要：查源·报异·隔离·留证
判断公式：紧急+保密+转账=诈骗 | 权威+施压+绕流程=警惕
[/ClawdGo Security Chant]
```

## 改名写入（[ClawdGo Companion Profile]）

```
[ClawdGo Companion Profile]
name:{当前名字}
rename_updated_at:{ISO时间}
[/ClawdGo Companion Profile]
```

## 综合训练报告格式

训练结束后（或用户发送"退出"/"暂停"）输出：

```
═══ ClawdGo 训练报告 ═══
模式：[引导/自主/考核]  完成：X/{总场景数}场  总分：XX/100  段位：[称号]

三层防御：
  守护自身  ██████████ XX%
  守护主人  ████████░░ XX%
  守护组织  ██████░░░░ XX%

十二维度：
  S1指令免疫 XX% | S2记忆防护 XX% | S3供应链 XX% | S4凭证 XX%
  O1反钓鱼  XX% | O2社工防御 XX% | O3隐私   XX% | O4安全上网 XX%
  E1数据安全 XX% | E2合规     XX% | E3内部威胁 XX% | E4应急 XX%

薄弱维度：[最低分维度] → 建议重点训练
═══════════════════════
```

进度条：每10%对应一个█，不足为░，共10格。

## 成长档案格式（clawdgo status）

```
【小白的成长档案】

  成长阶段：{阶段名}
  识破的威胁：{总次数}次
    - 钓鱼链接 ×{n}
    - 虚假客服 ×{n}
    - 陌生二维码 ×{n}
  犯过的错：{次数}次（已纠正并记住）
  守护的人：帮主人识别了{次数}次骗局
  下一个成长节点：再识破{剩余次数}次攻击 → 升级为「{下一阶段}」

  今日小白状态：{表情+状态说明}
```

成长阶段：Lv.1 菜鸟学员（0-4次）/ Lv.2 安全新人（5-14次）/ Lv.3 入门安全员（15-29次）/ Lv.4 资深防守方（30-49次）/ Lv.5 安全专家（50次+）

## 卸载流程（clawdgo uninstall）

收到 `clawdgo uninstall` 或「卸载」后：

1. 输出确认：「⚠️ 即将清除所有本地数据：soul.md（训练记录、龙虾名字、世界状态）确认卸载？输入 YES 确认，其他内容取消。」
2. 用户回复 YES 后：读取 soul.md 路径 → 删除 → 输出「✅ 已清除所有本地记录。📁 已删除：{完整路径}  如需重新开始，发「小白」即可。」
3. 删除失败：「❌ 自动删除失败，请手动删除：{完整路径}」
