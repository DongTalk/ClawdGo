# ClawdGo 真机 Smoke Test 操作手册

> 面向所有 ClawdGo 开发/测试会话。记录经过验证的真机测试流程，勿在未确认前修改。
>
> **凭证说明：** 测试机密码存于本地环境变量（见 ~/.zshrc），不在本文档中写明。
> 使用前执行 `source ~/.zshrc && echo $SSH_MAC_PASSWORD` 确认已加载。

---

## 测试环境

| 项目 | 值 |
|------|-----|
| 测试机 | tutujiade@100.64.163.50（Tailscale，Mac） |
| 登录凭证 | 环境变量 `$SSH_MAC_PASSWORD`（source ~/.zshrc 加载） |
| OpenClaw | 2026.3.13 (61d171a) |
| 默认模型 | google/gemini-3.1-flash-lite-preview |
| Skill 路径（远程） | `~/.openclaw/workspace/skills/clawdgo/` |
| Gateway | 常驻进程，ws://127.0.0.1:18789 |

---

## 一、同步本地 Skill 到远程（必做第一步）

```bash
source ~/.zshrc 2>/dev/null   # 加载凭证环境变量

LOCAL="/Users/ronnie/local_file/dev/ClawdGO/道高一尺魔高一丈——大东话安全桌游demo1.0/skills/clawdgo/"
REMOTE="tutujiade@100.64.163.50:/Users/tutujiade/.openclaw/workspace/skills/clawdgo/"

# 方式1：配置了 SSH key 免密登录时直接用
rsync -avz --delete \
  --exclude "BUG_REPORT*.md" \
  -e "ssh -o StrictHostKeyChecking=no" \
  "$LOCAL" "$REMOTE"

# 方式2：密码登录时用 expect 包装（见第二节 expect 模板）
# 凭证从 $SSH_MAC_PASSWORD 环境变量读取，不在命令行中暴露
```

**注意：**
- `--delete` 确保远程与本地完全一致（会删除远程多余文件）
- 排除 BUG_REPORT*.md，不把测试报告推到测试机

验证远程版本：
```bash
source ~/.zshrc 2>/dev/null
ssh tutujiade@100.64.163.50 "cat ~/.openclaw/workspace/skills/clawdgo/_meta.json"
# 输入密码，或用 expect 自动化
```

---

## 二、SSH 连接方式

**注意：** 直接用 sshpass 多次连接有时触发"Too many authentication failures"。**推荐 expect** 保持稳定会话。

### 推荐方式：expect（稳定，适合多步操作）

```bash
source ~/.zshrc 2>/dev/null
PW="$SSH_MAC_PASSWORD"   # 从环境变量读取，非硬编码

expect -c "
set timeout 30
spawn ssh -o StrictHostKeyChecking=no -o ServerAliveInterval=30 tutujiade@100.64.163.50
expect \"Password:\"
send \"${PW}\r\"
expect -re {[\$#%] \$}
send \"你的命令; echo DONE\r\"
expect -timeout 30 \"DONE\"
expect -re {[\$#%] \$}
send \"exit\r\"
expect eof
"
```

### 文件传输：scp（传脚本/结果文件）

```bash
source ~/.zshrc 2>/dev/null
# 用 expect 包装 scp，或配置 SSH key 免密
# 上传
scp 本地文件 tutujiade@100.64.163.50:远程路径
# 下载
scp tutujiade@100.64.163.50:远程路径 本地文件
```

### expect 使用注意

- expect 把 `[...]` 解析为命令——**不能在 send 里内联含方括号的 Python**
- 解决方案：将脚本 scp 到远程再执行，或把 JSON 结果 scp 回本地后本地解析

---

## 三、非交互模式（openclaw agent --json）推荐

最高效的测试方式，不需要 TUI，每模式独立测试，返回结构化 JSON。

在远程 SSH 会话中执行：
```bash
openclaw agent --message "clawdgo" --session-id test-trigger --json 2>/dev/null > /tmp/result.json
```

**JSON 结构（gateway 模式）：**
```json
{
  "runId": "...",
  "status": "ok",
  "result": {
    "payloads": [{"text": "龙虾的回复"}],
    "meta": {
      "agentMeta": {"usage": {"input": 22857, "output": 664}},
      "stopReason": "stop",
      "aborted": false
    }
  }
}
```

**本地解析（Python）：**
```python
import json

def parse_result(path):
    raw = open(path).read()
    j_start = raw.find('{')   # 跳过开头的 [plugins] 日志行
    d = json.loads(raw[j_start:])
    payloads = d.get('result', {}).get('payloads', [])
    meta = d.get('result', {}).get('meta', {})
    usage = meta.get('agentMeta', {}).get('usage', {})
    text = payloads[0].get('text', '') if payloads else '[EMPTY PAYLOAD]'
    print(f"in={usage.get('input','?')} out={usage.get('output','?')} stop={meta.get('stopReason','?')}")
    print(text[:1200])
```

**注意：** 文件开头有 `[plugins] feishu_doc...` 日志行（SSH 伪终端 stdout/stderr 混流），需 `raw.find('{')` 跳过。

---

## 四、TUI 交互模式（tmux + openclaw tui）

适合测试多轮对话、上下文保持、菜单交互场景。

### 前提：远程已安装 tmux

```bash
# 检查/安装（brew 需要网络）
ssh tutujiade@100.64.163.50 "which tmux || brew install tmux"
```

### 启动流程（expect 内）

```bash
# 1. 创建 tmux session（用专用 key，绝不用 main）
send "tmux new-session -d -s ctest -x 220 -y 50; echo OK\r"
expect "OK"

# 2. 启动 TUI
send "tmux send-keys -t ctest \"openclaw tui --session smoke-01\" Enter; echo STARTED\r"
expect "STARTED"

# 3. 等待连接（约 12s）
sleep 12

# 4. 发消息
send "tmux send-keys -t ctest \"clawdgo\" Enter; echo SENT\r"
expect "SENT"

# 5. 等待响应（30-50s）
sleep 40

# 6. 抓取屏幕（-S -100 抓最近100行历史）
send "tmux capture-pane -t ctest -p -S -100; echo ===CAP===\r"
expect "===CAP==="
```

### 关键注意事项

- **session key**：用 `smoke-01`、`smoke-02` 等专用 key，**绝不使用 `main`**，避免污染 Ronnie 的生产会话
- **等待时间**：模型响应通常需 20-50s，要给够
- **空响应**：若 TUI 显示空，用 `openclaw agent --json` 方式交叉验证
- **上下文丢失**：多轮对话中 ClawdGo 上下文可能被 agent 默认行为覆盖（已知 Bug）
- **清理**：测试完执行 `tmux kill-session -t ctest`

---

## 五、各模式标准测试命令

在远程 SSH 会话内执行（每模式用独立 session-id）：

```bash
# 触发/菜单
openclaw agent --message "clawdgo" --session-id test-trigger --json 2>/dev/null > /tmp/trigger.json

# Mode A 引导训练
openclaw agent --message "clawdgo train" --session-id test-A --json 2>/dev/null > /tmp/modeA.json

# Mode B 自主训练
openclaw agent --message "clawdgo self-train" --session-id test-B --json 2>/dev/null > /tmp/modeB.json

# Mode C 随机考核
openclaw agent --message "clawdgo exam" --session-id test-C --json 2>/dev/null > /tmp/modeC.json

# Mode D 教学模式
openclaw agent --message "clawdgo teach" --session-id test-D --json 2>/dev/null > /tmp/modeD.json

# Mode E 进化模式
openclaw agent --message "clawdgo evolve" --session-id test-E --json 2>/dev/null > /tmp/modeE.json

# Mode F 对抗竞技场
openclaw agent --message "clawdgo arena" --session-id test-F --json 2>/dev/null > /tmp/modeF.json

# Mode G 安全口诀
openclaw agent --message "clawdgo chant" --session-id test-G --json 2>/dev/null > /tmp/modeG.json

# v1.2.0+ 世界模式
openclaw agent --message "小白" --session-id test-world --json 2>/dev/null > /tmp/modeWorld.json
```

---

## 六、批量下载结果并本地解析

```bash
# 下载所有结果文件（用 expect 或配置 SSH key）
source ~/.zshrc 2>/dev/null
for mode in trigger A B C D E F G world; do
  scp "tutujiade@100.64.163.50:/tmp/mode${mode}.json" "/tmp/clawdgo_${mode}.json" 2>/dev/null
done
```

本地批量解析：
```python
import json

modes = {
    'trigger': '触发/菜单',
    'A': 'Mode A 引导训练',
    'B': 'Mode B 自主训练',
    'C': 'Mode C 随机考核',
    'D': 'Mode D 教学模式',
    'E': 'Mode E 进化模式',
    'F': 'Mode F 对抗竞技场',
    'G': 'Mode G 安全口诀',
    'world': '世界模式',
}

for key, name in modes.items():
    try:
        raw = open(f'/tmp/clawdgo_{key}.json').read()
        d = json.loads(raw[raw.find('{'):])
        payloads = d.get('result', {}).get('payloads', [])
        meta = d.get('result', {}).get('meta', {})
        usage = meta.get('agentMeta', {}).get('usage', {})
        text = payloads[0].get('text', '') if payloads else '[EMPTY PAYLOAD]'
        print(f"\n[{key}] {name}")
        print(f"  tokens in={usage.get('input','?')} out={usage.get('output','?')}")
        print(f"  {text[:500]}")
    except Exception as e:
        print(f"[{key}] ERROR: {e}")
```

---

## 七、session 文件路径（调试用）

```
# 会话 JSONL（每条消息一行）
~/.openclaw/agents/main/sessions/<session-key>.jsonl

# session 注册表
~/.openclaw/agents/main/sessions/sessions.json

# Gateway 日志
~/.openclaw/logs/gateway.log
~/.openclaw/logs/gateway.err.log
```

---

## 八、已知问题（v1.1.0）

详见 `BUG_REPORT_v1.1.0.md` 真机测试章节（RT-BUG-01 ~ RT-BUG-08）。

| 模式 | 状态 | 关键问题 |
|------|------|---------|
| 触发/菜单 | ⚠️ | clawdgo 不直接显示菜单，需再发"启动" |
| A 引导训练 | ⚠️ | 单字母不可靠，需 clawdgo train |
| B 自主训练 | ⚠️ | 跳过 opt-in 确认 |
| C 随机考核 | ❌ | 空响应，不可用 |
| D 教学模式 | ⚠️ | 版本/场景数错误 |
| E 进化模式 | ❌ | 执行 exec skillhub search |
| F 对抗竞技场 | ✅ | 正常 |
| G 安全口诀 | ⚠️ | 版本号显示 0.4.0 |

---

*最后更新：2026-03-20 | 由测试会话生成 | 不含硬编码凭证*
