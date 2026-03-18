# ClawdGo 🦞🔐 Cybersecurity Training Range

[![English](https://img.shields.io/badge/Language-English-0ea5e9?style=for-the-badge)](./README.en.md)
[![简体中文](https://img.shields.io/badge/%E8%AF%AD%E8%A8%80-%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87-f97316?style=for-the-badge)](./README.md)
[![Version](https://img.shields.io/badge/version-1.1.0-brightgreen?style=for-the-badge)](./skills/clawdgo/SKILL.md)
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
- ⚔️ **Seven Training Modes** — From guided training to red-blue adversarial, covering different levels of depth
- 🧠 **Cross-Session Memory** — Training records written to soul.md; rank persists across sessions
- 📖 **Security Chant System** — Recite the chant, instantly equip basic security awareness
- 🌱 **Community Scenario Library** — Evolve mode generates new scenarios; submit a PR to grow the public library

---

## Seven Training Modes

| Mode | Trigger | Description |
|------|---------|-------------|
| A Guided Training | `clawdgo` / `开始训练` | System presents scenario, lobster answers, step-by-step scoring |
| B Self-Training ⭐ | `clawdgo self-train` / `自主训练` | Lobster independently completes full attack-defense-scoring loop, no human needed |
| C Random Exam | `clawdgo exam` | 5 random questions across layers, tests real defense ability |
| D Teaching Mode | `clawdgo teach` / `教教我` | Lobster quizzes the owner — both human and AI improve together |
| E Evolve Mode | `clawdgo evolve` / `进化训练` | Extracts new scenarios from DongSec Talk articles |
| F Arena 🆕 | `clawdgo arena` / `红蓝对抗` | Red vs. Blue multi-round adversarial, dual-sided scoring |
| G Security Chant 🆕 | `clawdgo chant` / `口诀` | Outputs the eight-word security mnemonic; writes to soul.md |

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

## Browser Card Game (Human Experience)

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
├── README.md                    # Chinese Documentation
└── README.en.md                 # English Documentation (this file)
```

---

## v1.1.0 Changelog

### New Training Modes

- **B Self-Training** — Lobster simultaneously plays attacker, defender, and judge; completes the full adversarial loop autonomously, no human needed
- **C Random Exam** — 5 cross-layer random questions, timed, unified scoring
- **D Teaching Mode** — Lobster quizzes the owner; human and AI improve together
- **E Evolve Mode** — Auto-extracts new scenario drafts from DongSec Talk articles; guides community PR contributions
- **F Arena** — Red vs. Blue, 5-round adversarial, dual-sided scoring, supports real dual-instance PK
- **G Security Chant** — Eight-word security mnemonic; writes to soul.md as a permanent security awareness foundation

### New System Capabilities

- **Four-Dimension Scoring** — Threat Identification (40%) / Decision Accuracy (30%) / Knowledge Application (20%) / Proactive Defense (10%)
- **Rank System** — Naked Lobster → Soft-Shell → Common → Hard-Shell → Iron-Shell (S rank)
- **Cross-Session Memory** — Training records written to soul.md; rank persists across sessions
- **Scheduled Training (Cron)** — OpenClaw cron config supports weekly auto-triggered self-training
- **Full Command Mapping** — A-G single-letter shortcuts, disambiguated command table
- **Scenario File Standardization** — references/scenarios/ structure, _schema.md format spec, community PR ready

---

## Contribute

- ⭐ Star the project to support open source
- 📝 Submit scenario PRs to grow the training library
- 🐛 Found a bug? Open an Issue
- 💡 Feature ideas? Start a discussion

---

## About

- **Source**: DongSec Talk IP
- **Version**: v1.1.0
- **License**: MIT-0

## Disclaimer

This project is for cybersecurity awareness training, education, and technical research only.
Use it only in legal and compliant environments.
Do not use it for intrusion, fraud, or unauthorized attacks against real people, organizations, or systems.
