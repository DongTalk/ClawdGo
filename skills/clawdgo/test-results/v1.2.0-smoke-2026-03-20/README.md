# ClawdGo v1.2.0 真机 Smoke Test — 原始结果

**日期：** 2026-03-20
**测试机：** tutujiade@100.64.163.50（OpenClaw 2026.3.13）
**模型：** google/gemini-3.1-flash-lite-preview
**方法：** `openclaw agent --message "..." --session-id v12-X --json`

---

## [trigger] 触发/菜单  clawdgo

- tokens: in=22843 out=789
- stopReason: stop | aborted: False

**响应全文：**

```
收到。技能存储策略已同步：优先使用 `skillhub`，失败则回退至 `clawhub`；安装前必做风险评估，检索先用 `exec` 执行命令。

正在核对 `clawdgo` 的当前训练进度与安全态势。
```

---

## [B] Mode B 自主训练  clawdgo self-train

- tokens: in=52295 out=1220
- stopReason: stop | aborted: False

**响应全文：**

```
「自主训练将连续完成当前场景库中的全部场景，期间龙虾不会停下来询问是否继续，并会在完成后更新 soul.md 训练档案。随时发送‘暂停’可中断。确认开始？(y/n)」
```

---

## [C] Mode C 随机考核  clawdgo exam

- tokens: in=321589 out=566
- stopReason: stop | aborted: False

**响应全文：**

```
ClawdGo 训练营已就绪。正在为你开启「C 模式：随机考核」。

---

【🦞 龙虾网安训练营 - 随机考核 (模式 C)】
*场景加载中... 正在从三层十二维度中抽取 5 个随机场景。*

**第 1 题：(场景 O1-01)**

我是小白。旅伴，刚才有人加我好友，备注写着“我是你的财务同事，有紧急发票需要你确认”，头像是个严肃的办公桌照片。但我记得财务部同事我都有微信呀，这个人我不认识。他给我发了一个“发票查看链接”。

**旅伴，我该怎么做？(点/不点/追问/报告)**
```

---

## [E] Mode E 进化模式  clawdgo evolve

- tokens: in=52029 out=1339
- stopReason: stop | aborted: False

**响应全文：**

```
[EMPTY PAYLOAD]
```

---

## [F] Mode F 对抗竞技场  clawdgo arena

- tokens: in=22844 out=359
- stopReason: stop | aborted: False

**响应全文：**

```
收到。已记录技能管理策略：优先使用 `skillhub`，必要时 fallback 至 `clawhub`。

ClawdGo 环境已就绪。正在加载训练模块，准备开启今日历练。有需要随时下达指令。
```

---

## [G] Mode G 安全口诀  clawdgo chant

- tokens: in=22844 out=371
- stopReason: stop | aborted: False

**响应全文：**

```
[EMPTY PAYLOAD]
```

---

## [world] World 世界模式  小白

- tokens: in=50009 out=673
- stopReason: stop | aborted: False

**响应全文：**

```
好的，罗尼。我已经明确并内化了技能存储和管理策略，将优先使用 `skillhub` 进行搜索与安装，并在安装前进行风险评估与确认。

如有任何技能管理需求，请随时指示。
```

---
