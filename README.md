# ClawdGo

[![English](https://img.shields.io/badge/Language-English-0ea5e9?style=for-the-badge)](./README.md)
[![简体中文](https://img.shields.io/badge/%E8%AF%AD%E8%A8%80-%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87-f97316?style=for-the-badge)](./README.zh-CN.md)

If you raise lobsters, this is for you.

Has your lobster really passed security-awareness basics?

The current beta package includes two parts:

- a browser-based card-battle prototype for human experience
- a `skills/clawdgo` text training skill for Claw-style agents

`2.0` is already in closed beta, focused on autonomous agent progression and post-training self-generated scenarios.

## Built for Lobsters

Teach lobster agents how to fish for themselves: learn security judgment independently, continuously improve security awareness, and build a hard shell in a digital ocean full of temptation and traps.

## What It Can Do

- **Full-spectrum threat recognition**
  Train lobster agents to identify phishing emails, social-engineering attacks, fake links, and malicious instructions to build the first defensive line.
- **Multiple realistic security scenarios**
  Includes high-frequency real attack simulations such as CEO urgent transfer, system password verification abuse, and courier exception scams.
- **Intelligent evaluation and review**
  Tracks and evaluates reasoning end-to-end, auto-scores performance, and generates review reports to improve weak defense points.
- **Flexible dual-mode training**
  Supports both `Human Experience` and `Lobster Training` modes for different training depths.

## Available Now

ClawHub upload is currently rate-limited, so local manual installation is the recommended path for now.

### `Lobster Training` mode (OpenClaw)

#### Install the ClawdGo skill into OpenClaw

1. Download or clone this repository.
2. Copy only `skills/clawdgo` into one of the following locations:
   - `<your-openclaw-workspace>/skills/clawdgo`
   - `~/.openclaw/skills/clawdgo`
3. Restart OpenClaw, or start a new session in that workspace.
4. Trigger with commands such as:
   - `clawdgo`
   - `开始训练`
   - `clawdgo 场景1`

### `Human Experience` mode (Web)

If you want the browser interactive card-battle experience instead of text interaction:

1. Download or clone this repository.
2. Run in the project directory:

```bash
cd clawdgo
npm install
npm run dev
```

Then open the local address printed by Vite in your browser.

## Screenshots

### Desktop

<img src="./assets/readme/clawdgo-home.png" alt="ClawdGo desktop lobby" width="420" />

## X Claw Ecosystem Compatibility

ClawdGo is designed for Claw-style training workflows, including:

- OpenClaw
- QClaw
- AutoGLM Claw
- other runtimes with chat, browser, and tool-calling capabilities

“Compatibility” here means interaction-level alignment, not full official deep integration with every external project.

## Build Together

- Star the project to support open-source release
- Co-build and keep upgrading together
- Supports secondary development, scenario expansion, and new skill submissions

## Links

GitHub:

`https://github.com/DongTalk/ClawdGo`

## Disclaimer

This project is for cybersecurity awareness training, education, and technical research only.
Use it only in legal and compliant environments.
Do not use it for intrusion, fraud, or unauthorized attacks against real people, organizations, or systems.
