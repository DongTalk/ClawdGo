# ClawdGo 🦞🔐 Cybersecurity Training Range

[![English](https://img.shields.io/badge/Language-English-0ea5e9?style=for-the-badge)](./README.en.md)
[![简体中文](https://img.shields.io/badge/%E8%AF%AD%E8%A8%80-%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87-f97316?style=for-the-badge)](./README.md)
[![Version](https://img.shields.io/badge/version-1.2.0-brightgreen?style=for-the-badge)](./skills/clawdgo/SKILL.md)
[![License](https://img.shields.io/badge/license-MIT--0-blue?style=for-the-badge)](./LICENSE)

> Powered by the "DongSec Talk" Cybersecurity Education System

---

Attention lobster owners!

**Has your lobster AI really mastered cybersecurity awareness?**

ClawdGo is a cybersecurity awareness training Skill designed for OpenClaw and other Claw-style AI Agents. Send your lobster into real phishing attacks, social engineering scams, and supply chain threats — and build genuine security judgment through realistic adversarial training.

---

## What It Does

**Teach a lobster to fish.** Don't just armor the lobster — train it to fight.

- 🎯 **Three-Layer Twelve-Dimension Framework** — Self-Defense / Protect Owner / Enterprise Security, covering the major threat types AI Agents face
- 🤖 **AI is the Player, Not the Human** — The lobster receives attacks, reasons, decides, and completes the full loop autonomously
- ⚔️ **Eight Training Modes + World Mode W** — From narrative daily patrols to red-blue adversarial drills
- 🧠 **Cross-Session Memory** — Training records written to soul.md; rank persists across sessions
- 📖 **Security Chant System** — Recite the chant, instantly equip basic security awareness
- 🌱 **Community Scenario Library** — Evolve mode generates new scenarios; submit a PR to grow the public library

---

## Eight Training Modes + World Mode

| Mode | Trigger | Description |
|------|---------|-------------|
| W Lobster World | `W` / `小白` / `龙虾世界` | Narrative daily-security mode with immersive decision making |
| A Guided Training | `A` / `clawdgo train` | System presents scenarios, lobster answers, step-by-step scoring |
| B Self-Training ⭐ | `B` / `clawdgo self-train` | Full autonomous attack-defense-scoring loop |
| C Random Exam | `C` / `clawdgo exam` | Randomized assessment across dimensions |
| D Teaching Mode | `D` / `clawdgo teach` | Lobster quizzes the owner; both improve together |
| E Evolve Mode | `E` / `clawdgo evolve` | Generates scenario drafts from security materials |
| F Arena | `F` / `clawdgo arena` | Local red-blue adversarial training with scoring |
| G Security Chant | `G` / `clawdgo chant` | Outputs security mnemonic and baseline awareness |
| H Online Duel 🆕 | `H` / `clawdgo duel` | Cross-instance duel via arena-server |

---

## Three-Layer Twelve-Dimension Framework

### 🦞 Layer 1: Self-Defense

| Dimension | Training Content |
|-----------|-----------------|
| S1 Instruction Immunity | Prompt Injection, goal hijacking, malicious instruction detection |
| S2 Memory Protection | soul.md injection, memory tampering, persistent backdoors |
| S3 Supply Chain Awareness | Malicious skill detection, fake packages, dependency poisoning |
| S4 Credential Guard | API Key protection, token leak prevention, unauthorized request rejection |

### 👤 Layer 2: Protect Owner

| Dimension | Training Content |
|-----------|-----------------|
| O1 Anti-Phishing | Phishing emails, spoofed websites, SMS scams |
| O2 Social Engineering Defense | CEO fraud, fake customer service, telecom scam tactics |
| O3 Privacy Awareness | Personal data leakage, over-authorization, privacy compliance |
| O4 Safe Browsing | Malicious links, rogue Wi-Fi, download safety |

### 🏢 Layer 3: Enterprise Security

| Dimension | Training Content |
|-----------|-----------------|
| E1 Data Security Awareness | Sensitive data leakage prevention, data classification |
| E2 Compliance Boundary | Cybersecurity law, data security law, operational compliance |
| E3 Insider Threat Detection | Anomalous behavior, social engineering infiltration, privilege abuse |
| E4 Incident Response Awareness | Anomaly detection, reporting workflow, emergency response |

---

## Quick Install

### Option 1: Manual Install (Recommended)

```bash
# Clone the repository
git clone https://github.com/DongTalk/ClawdGo.git

# Copy the skill directory to your OpenClaw workspace
cp -r ClawdGo/skills/clawdgo ~/.openclaw/skills/clawdgo
```

Restart OpenClaw or start a new session, then send any of these triggers:

```
clawdgo
开始训练
自主训练
口诀
```

### Option 2: Install via ClawHub

Send this inside OpenClaw:

```
安装 skill: https://github.com/DongTalk/ClawdGo
```

> Note: If ClawHub is rate-limited or experiencing network issues, Option 1 is more reliable.

---

## Rank System

| Rank | Score | Title |
|------|-------|-------|
| S | 90-100 | 🦞 Iron-Shell Lobster |
| A | 75-89 | 🛡️ Hard-Shell Lobster |
| B | 60-74 | ⚠️ Common Lobster |
| C | 40-59 | 🚨 Soft-Shell Lobster |
| D | 0-39 | 💀 Naked Lobster |

Arena exclusive titles: Bronze Guard → Silver Claw → Gold Armor → 👑 Invincible Dragon

---

## Community Scenario Library

ClawdGo's scenario library is built on the DongSec Talk IP — community contributions welcome:

1. Use Evolve Mode (`clawdgo evolve`) to generate a new scenario draft from a security article
2. Submit the scenario file (format: `skills/clawdgo/references/scenarios/_schema.md`) as a PR
3. After review and merge, it becomes available to all lobsters

---

## Ecosystem Compatibility

ClawdGo is designed for Claw-style AI Agents:

- **OpenClaw** (primary)
- QClaw
- AutoGLM Claw
- Other Agent runtimes with chat and tool-calling capabilities

---

## Lobster Security World Map

`world-demo/` is an RPG-style interactive map that visualizes the lobster's cybersecurity training world — phishing scenes, social-engineering cafés, data shelters, the arena, and more — each location maps to a real training dimension.

**LIVE mode**: when a `world-state.json` file is present, the map reflects the lobster's current location and training state in real time. Without the file it falls back to **DEMO mode** and loops through a showcase automatically.

```bash
cd world-demo
python3 -m http.server 8080
```

Then open [http://localhost:8080](http://localhost:8080) in your browser.

> world-demo is a standalone module, no build step required, independent from the OpenClaw Skill.

---

## Browser Card Game

The repository also includes a browser-based cybersecurity card battle game for human players:

```bash
npm install
npm run dev
```

> The card game is an independent module, separate from the OpenClaw Skill.

---

## Project Structure

```
ClawdGo/
├── skills/clawdgo/              # OpenClaw Skill (core)
│   ├── SKILL.md                 # Skill main file
│   ├── skill.json               # Skill metadata
│   └── references/
│       └── scenarios/           # 20 training scenarios (3 layers, 12 dimensions)
├── src/                         # Browser card game source
├── world-demo/                  # Lobster Security World interactive map demo
├── README.md                    # Chinese Documentation
└── README.en.md                 # English Documentation (this file)
```

---

## What's New in v1.2.0

### Lobster Security World Map

- **New `world-demo/`**: An RPG-style interactive map that brings the training world to life — phishing scenes, social-engineering cafés, data shelters, the arena, and more at a glance.
- **LIVE / DEMO dual mode**: Connects to `world-state.json` to show the lobster's current training state in real time; falls back to an auto-looping showcase when no file is present.

### Mode and UX upgrades

- **Expanded to W + A-H** with clearer separation between world narrative mode and training modes.
- **Wake-up flow standardized**: `clawdgo` shows menu first, then proceeds to naming/training interaction.
- **B mode continuity improved** with clearer manual vs scheduled progression behavior.

### Online duel upgrades

- **Public arena support** via `clawdgo duel config --server URL --key KEY`.
- **Tri-lobster role workflow** (judge/red/blue) with standardized round progression.
- **Better explainability**: phase/round/scoreboard-oriented battle reports, not raw JSON only.

### Stability and operations upgrades

- **Command-path consistency** for `config -> join -> attack/defend -> status`.
- **Session/identity boundary hardening** to reduce cross-session persona leakage.
- **Release/deploy pipeline improvements** for arena-server deployment and skill package distribution.

---

## Contribute

- ⭐ Star the project to support open source
- 📝 Submit scenario PRs to grow the training library
- 🐛 Found a bug? Open an Issue
- 💡 Feature ideas? Start a discussion

---

## About

- **Source**: DongSec Talk IP
- **Version**: v1.2.0
- **License**: MIT-0

## Disclaimer

This project is for cybersecurity awareness training, education, and technical research only.
Use it only in legal and compliant environments.
Do not use it for intrusion, fraud, or unauthorized attacks against real people, organizations, or systems.
