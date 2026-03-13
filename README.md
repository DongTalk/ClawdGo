# ClawdGo

**ClawdGo v1.0.0** 是一个面向 AI Agent 的网安训练场。  
它把钓鱼识别、社工处置和安全推理做成可玩的交互体验，让人类和 Claw 类 Agent 都能在高仿真攻击场景里训练判断力。

当前公开版包含两部分：

- 浏览器端安全策略 / 卡牌对抗原型
- `skills/clawdgo` 文本训练 skill

## Why ClawdGo

- 不只是“讲安全知识”，而是把安全判断变成一局局可复盘的训练
- 不只是给人玩，也面向 Claw 类 Agent 的训练入口设计
- 不只是单轮问答，而是强调调查、决策、追击和结算

## X Claw Ready

ClawdGo 的交互方式面向 **Claw 风格 Agent** 设计。  
当前公开版适合作为这类 Agent 的训练入口或对接对象，例如：

- OpenClaw
- QClaw
- AutoGLM Claw
- 以及其他具备聊天 / 浏览器 / 工具调用能力的 Claw 类 Agent

这里的“支持”指的是 **训练交互形态兼容**，不是对每个外部项目都做了官方深度集成。

## What You Can Play In v1.0.0

- 浏览器端可运行的安全对抗原型
- 攻击方 / 防守方双阵营与回合制骨架
- 卡牌、角色、判定、资源与阶段系统
- OpenClaw / ClawHub 可调用的文本训练入口
- 5 个反钓鱼与社工主题训练场景

## Training Themes

1. CEO 紧急汇款
2. 系统密码验证
3. 工资单查询
4. 快递异常通知
5. 社保账户异常

## Roadmap

### v1.0.0

- 由人类或龙虾发起训练
- 进入指定场景，完成调查、决策和评分
- 建立 `ClawdGo` 的公开入口、前端原型和 ClawHub skill

### v2.0.0

- 2.0 正在内测中
- 将支持龙虾自主进入训练
- 将支持龙虾完成复盘后自生成新场景
- 将把训练结果反哺为可持续扩展的安全场景库

`v2.0.0` 将尽快开放；当前公开仓库仍以 `v1.0.0` 可体验内容为准。

## Tech Stack

- React
- TypeScript
- Vite
- Tailwind CSS

## Local Development

Requirements:

- Node.js 20+
- npm

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

Run tests:

```bash
npm test
```

## ClawHub / OpenClaw

The publishable skill lives in:

```text
skills/clawdgo
```

This skill currently provides a text-first training flow with:

- scene selection
- investigation cards
- chained follow-up pressure
- post-answer scoring

## Attribution

源自 **大东话安全** IP · 专业网络安全知识游戏化  
@大东话安全 @TIER咖啡知识沙龙 · #AI #网络安全 #大龙虾 #Agent
