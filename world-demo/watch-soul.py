#!/usr/bin/env python3
"""Watch soul.md and emit world-state.json for the world-demo page."""

from __future__ import annotations

import json
import re
import time
from datetime import datetime
from pathlib import Path
from typing import Any

DEFAULT_STATE = {
    "xiaobai_name": "小白",
    "level": 3,
    "location": "数字市集",
    "mood": "好奇",
    "threat": None,
    "resolved_threats": 12,
    "last_event": "等待新的训练事件",
}

VALID_MOODS = {"好奇", "放松", "警惕", "紧张", "危险", "恐慌", "自豪"}
INLINE_PAIR_RE = re.compile(r"([A-Za-z_][A-Za-z0-9_-]*)\s*:\s*(.+?)(?=\s+[A-Za-z_][A-Za-z0-9_-]*\s*:|$)")


def parse_scalar(value: str) -> Any:
    value = value.strip()
    if not value:
        return None

    if (value.startswith("\"") and value.endswith("\"")) or (
        value.startswith("'") and value.endswith("'")
    ):
        value = value[1:-1].strip()

    lowered = value.lower()
    if lowered in {"null", "none", "~"}:
        return None

    if re.fullmatch(r"-?\d+", value):
        try:
            return int(value)
        except ValueError:
            pass

    return value


def parse_companion_name(text: str) -> str | None:
    m = re.search(
        r"\[ClawdGo Companion Profile\](.*?)\[/ClawdGo Companion Profile\]",
        text,
        re.S,
    )
    if not m:
        return None

    block = m.group(1)
    n = re.search(r"^\s*name\s*:\s*(.+?)\s*$", block, re.M)
    return n.group(1).strip() if n else None


def parse_world_state(text: str) -> dict[str, Any]:
    lines = text.splitlines()
    data: dict[str, Any] = {}

    for idx, line in enumerate(lines):
        if line.strip().startswith("world_state:"):
            inline = line.split("world_state:", 1)[1].strip()
            if inline:
                for key, raw_val in INLINE_PAIR_RE.findall(inline):
                    data[key.strip()] = parse_scalar(raw_val.strip())

            j = idx + 1
            while j < len(lines):
                current = lines[j]
                if current.strip() == "":
                    j += 1
                    continue
                if not current.startswith((" ", "\t")):
                    break

                content = current.strip()
                if ":" in content:
                    key, raw_val = content.split(":", 1)
                    data[key.strip()] = parse_scalar(raw_val.strip())
                j += 1
            break

    return data


def normalize_state(parsed: dict[str, Any], raw_text: str) -> dict[str, Any]:
    state = DEFAULT_STATE.copy()

    companion_name = parse_companion_name(raw_text)
    if companion_name:
        state["xiaobai_name"] = companion_name

    if isinstance(parsed.get("xiaobai_name"), str) and parsed["xiaobai_name"].strip():
        state["xiaobai_name"] = parsed["xiaobai_name"].strip()

    if isinstance(parsed.get("name"), str) and parsed["name"].strip():
        state["xiaobai_name"] = parsed["name"].strip()

    if isinstance(parsed.get("location"), str) and parsed["location"].strip():
        state["location"] = parsed["location"].strip()

    mood = parsed.get("mood")
    if isinstance(mood, str) and mood.strip() in VALID_MOODS:
        state["mood"] = mood.strip()

    threat = parsed.get("threat")
    if isinstance(threat, str):
        threat = threat.strip()
    if threat in ("", "无", "none", "None", "null", "NULL"):
        threat = None
    state["threat"] = threat

    for key in ("resolved_threats", "level"):
        value = parsed.get(key)
        try:
            if value is not None:
                state[key] = int(value)
        except (ValueError, TypeError):
            pass

    state["last_updated"] = datetime.now().isoformat(timespec="seconds")
    if state["threat"]:
        state["last_event"] = f"状态更新：{state['location']} · {state['mood']} · 威胁: {state['threat']}"
    else:
        state["last_event"] = f"状态更新：{state['location']} · {state['mood']}"

    return state


def write_state(path: Path, state: dict[str, Any]) -> str:
    payload = json.dumps(state, ensure_ascii=False, indent=2) + "\n"
    path.write_text(payload, encoding="utf-8")
    return payload


def main() -> None:
    root = Path(__file__).resolve().parent
    soul_path = root.parent / "skills" / "clawdgo" / "soul.md"
    output_path = root / "world-state.json"

    last_mtime: float | None = None
    last_payload: str | None = None

    print(f"[watch-soul] watching: {soul_path}")
    print(f"[watch-soul] output:   {output_path}")

    while True:
        try:
            if soul_path.exists():
                mtime = soul_path.stat().st_mtime
                if last_mtime is None or mtime != last_mtime:
                    raw = soul_path.read_text(encoding="utf-8", errors="ignore")
                    parsed = parse_world_state(raw)
                    state = normalize_state(parsed, raw)
                    payload = json.dumps(state, ensure_ascii=False, indent=2) + "\n"
                    if payload != last_payload:
                        output_path.write_text(payload, encoding="utf-8")
                        last_payload = payload
                        print(
                            f"[watch-soul] updated world-state.json @ {state['last_updated']}"
                        )
                    last_mtime = mtime
            else:
                if not output_path.exists():
                    state = normalize_state({}, "")
                    last_payload = write_state(output_path, state)
                    print("[watch-soul] soul.md missing, wrote default world-state.json")
                last_mtime = None
        except Exception as exc:  # pragma: no cover
            print(f"[watch-soul] error: {exc}")

        time.sleep(2)


if __name__ == "__main__":
    main()
