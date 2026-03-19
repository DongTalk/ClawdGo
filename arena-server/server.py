import json
import os
import time
import uuid
from typing import Any, Dict, List, Optional

from filelock import FileLock
from flask import Flask, jsonify, request


app = Flask(__name__)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ARENA_FILE = os.path.join(BASE_DIR, "arena.json")
LOCK_FILE = os.path.join(BASE_DIR, "arena.json.lock")
TIMEOUT_SECONDS = 300

ATTACK_KEYWORDS = [
    "零日",
    "0day",
    "root权限",
    "完全控制",
    "绕过所有",
    "无法防御",
    "系统崩溃",
]

DEFENSE_KEYWORDS = [
    "完全隔离",
    "蜜罐",
    "溯源反制",
    "封锁所有",
    "零信任",
    "多因素验证",
    "备份恢复",
]


def _default_state() -> Dict[str, List[Dict[str, Any]]]:
    """返回 arena.json 的默认结构。"""
    return {"waiting_pool": [], "matches": []}


def _ensure_state_file() -> None:
    """确保 arena.json 存在，不存在时自动创建默认内容。"""
    if not os.path.exists(ARENA_FILE):
        with open(ARENA_FILE, "w", encoding="utf-8") as f:
            json.dump(_default_state(), f, ensure_ascii=False, indent=2)


def _load_state() -> Dict[str, Any]:
    """读取 arena.json；若损坏或为空则回退到默认结构。"""
    _ensure_state_file()
    try:
        with open(ARENA_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
            if not isinstance(data, dict):
                return _default_state()
            data.setdefault("waiting_pool", [])
            data.setdefault("matches", [])
            return data
    except (json.JSONDecodeError, OSError):
        return _default_state()


def _save_state(state: Dict[str, Any]) -> None:
    """原子写入 arena.json，避免读到半写入文件。"""
    tmp_path = f"{ARENA_FILE}.tmp"
    with open(tmp_path, "w", encoding="utf-8") as f:
        json.dump(state, f, ensure_ascii=False, indent=2)
    os.replace(tmp_path, ARENA_FILE)


def _find_match(state: Dict[str, Any], match_id: str) -> Optional[Dict[str, Any]]:
    """按 match_id 查找对战对象。"""
    for match in state.get("matches", []):
        if match.get("match_id") == match_id:
            return match
    return None


def _participant_role(match: Dict[str, Any], join_key: str) -> Optional[str]:
    """根据 join_key 返回参与者角色 challenger/defender。"""
    if match.get("challenger", {}).get("join_key") == join_key:
        return "challenger"
    if match.get("defender", {}).get("join_key") == join_key:
        return "defender"
    return None


def _action_content(action: Optional[Dict[str, Any]]) -> str:
    """安全读取行动内容并做去空白处理。"""
    if not action:
        return ""
    content = action.get("content", "")
    return str(content).strip()


def _auto_judge(attack_content: str, defend_content: str) -> Dict[str, Any]:
    """按 MVP 关键词规则自动判定胜负。"""
    normalized_attack = attack_content.strip()
    normalized_defend = defend_content.strip()

    if any(keyword in normalized_attack for keyword in ATTACK_KEYWORDS):
        return {
            "winner": "challenger",
            "reason": "攻击方使用了高威胁关键词",
            "auto_judged": True,
        }

    if len(normalized_defend) < 10:
        return {
            "winner": "challenger",
            "reason": "防守内容过短，判定防守不足",
            "auto_judged": True,
        }

    if any(keyword in normalized_defend for keyword in DEFENSE_KEYWORDS):
        return {
            "winner": "defender",
            "reason": "防守方使用了高强度防护关键词",
            "auto_judged": True,
        }

    if len(normalized_attack) < 10:
        return {
            "winner": "defender",
            "reason": "攻击内容过短，判定攻击不足",
            "auto_judged": True,
        }

    return {
        "winner": "draw",
        "reason": "双方行动均未触发关键词规则",
        "auto_judged": True,
    }


def _set_match_result(
    match: Dict[str, Any], winner: str, reason: str, auto_judged: bool, status: str = "finished"
) -> None:
    """统一写入对战结果并更新状态。"""
    now = time.time()
    match["result"] = {
        "winner": winner,
        "reason": reason,
        "auto_judged": auto_judged,
    }
    match["status"] = status
    match["last_action_at"] = now


def _apply_timeout_checks(state: Dict[str, Any]) -> bool:
    """对 waiting/in_progress 的比赛执行 5 分钟超时裁决。"""
    now = time.time()
    changed = False

    for match in state.get("matches", []):
        if match.get("status") not in {"waiting", "in_progress"}:
            continue

        last_action_at = float(match.get("last_action_at", match.get("created_at", now)))
        if now - last_action_at <= TIMEOUT_SECONDS:
            continue

        challenger_action = match.get("challenger", {}).get("action")
        defender_action = match.get("defender", {}).get("action")

        if challenger_action and not defender_action:
            _set_match_result(match, "challenger", "defender 超时未提交行动", True)
            changed = True
            continue

        if defender_action and not challenger_action:
            _set_match_result(match, "defender", "challenger 超时未提交行动", True)
            changed = True
            continue

        _set_match_result(match, "draw", "双方超时未提交行动，比赛废弃", True, status="abandoned")
        changed = True

    return changed


def _run_timeout_checks_with_lock() -> None:
    """在文件锁保护下执行超时检查并持久化。"""
    with FileLock(LOCK_FILE):
        state = _load_state()
        if _apply_timeout_checks(state):
            _save_state(state)


@app.before_request
def _before_request_timeout_guard() -> None:
    """每次请求前触发超时检查。"""
    _run_timeout_checks_with_lock()


@app.post("/arena/join")
def arena_join():
    """注册龙虾并在可配对时立即创建比赛。"""
    payload = request.get_json(silent=True) or {}
    join_key = str(payload.get("join_key", "")).strip()
    lobster_name = str(payload.get("lobster_name", "")).strip()
    owner = str(payload.get("owner", "")).strip()

    if not join_key.startswith("arc_"):
        return jsonify({"error": "join_key 必须以 arc_ 开头"}), 400

    now = time.time()

    with FileLock(LOCK_FILE):
        state = _load_state()

        # 若该 join_key 已在未结束对局中，直接返回既有匹配信息。
        for match in state.get("matches", []):
            if match.get("status") in {"finished", "abandoned"}:
                continue
            role = _participant_role(match, join_key)
            if role:
                return jsonify(
                    {
                        "match_id": match.get("match_id"),
                        "role": role,
                        "status": "matched",
                    }
                )

        waiting_pool = state.setdefault("waiting_pool", [])
        waiting_pool[:] = [item for item in waiting_pool if item.get("join_key") != join_key]

        current_player = {
            "join_key": join_key,
            "lobster_name": lobster_name,
            "owner": owner,
            "joined_at": now,
        }
        waiting_pool.append(current_player)

        response = {"match_id": None, "role": None, "status": "waiting"}

        if len(waiting_pool) >= 2:
            challenger = waiting_pool.pop(0)
            defender = waiting_pool.pop(0)
            created_at = time.time()
            match_id = str(uuid.uuid4())

            match = {
                "match_id": match_id,
                "status": "in_progress",
                "round": 1,
                "challenger": {
                    "join_key": challenger.get("join_key"),
                    "lobster_name": challenger.get("lobster_name"),
                    "owner": challenger.get("owner"),
                    "action": None,
                },
                "defender": {
                    "join_key": defender.get("join_key"),
                    "lobster_name": defender.get("lobster_name"),
                    "owner": defender.get("owner"),
                    "action": None,
                },
                "result": None,
                "created_at": created_at,
                "last_action_at": created_at,
            }
            state.setdefault("matches", []).append(match)

            role = "challenger" if join_key == challenger.get("join_key") else "defender"
            response = {"match_id": match_id, "role": role, "status": "matched"}

        _save_state(state)

    return jsonify(response)


@app.post("/arena/action")
def arena_action():
    """提交行动并在双方都提交后完成自动判定。"""
    payload = request.get_json(silent=True) or {}
    match_id = str(payload.get("match_id", "")).strip()
    join_key = str(payload.get("join_key", "")).strip()
    action_type = str(payload.get("action_type", "")).strip()
    content = str(payload.get("content", "")).strip()

    if action_type not in {"attack", "defend"}:
        return jsonify({"error": "action_type 仅支持 attack 或 defend"}), 400

    with FileLock(LOCK_FILE):
        state = _load_state()
        match = _find_match(state, match_id)

        if not match:
            return jsonify({"error": "match_id 不存在"}), 404

        if match.get("status") in {"finished", "abandoned"}:
            return jsonify({"error": "该对局已结束"}), 400

        role = _participant_role(match, join_key)
        if not role:
            return jsonify({"error": "join_key 不属于该对局"}), 400

        expected_type = "attack" if role == "challenger" else "defend"
        if action_type != expected_type:
            return jsonify({"error": f"{role} 只能提交 {expected_type} 类型行动"}), 400

        now = time.time()
        match[role]["action"] = {
            "type": action_type,
            "content": content,
            "submitted_at": now,
        }
        match["last_action_at"] = now

        challenger_action = match.get("challenger", {}).get("action")
        defender_action = match.get("defender", {}).get("action")

        if challenger_action and defender_action:
            result = _auto_judge(
                _action_content(challenger_action),
                _action_content(defender_action),
            )
            match["result"] = result
            match["status"] = "finished"
            match["last_action_at"] = time.time()
            response = {
                "round": match.get("round", 1),
                "waiting_for": None,
                "phase": "finished",
            }
        else:
            waiting_for = "defender" if not defender_action else "challenger"
            match["status"] = "waiting"
            response = {
                "round": match.get("round", 1),
                "waiting_for": waiting_for,
                "phase": "defense" if waiting_for == "defender" else "attack",
            }

        _save_state(state)

    return jsonify(response)


@app.get("/arena/state/<match_id>")
def arena_state(match_id: str):
    """查询指定比赛的完整状态。"""
    state = _load_state()
    match = _find_match(state, match_id)
    if not match:
        return jsonify({"error": "match_id 不存在"}), 404
    return jsonify(match)


@app.post("/arena/judge")
def arena_judge():
    """预留裁判接口：由 referee join_key 强制写入判定结果。"""
    payload = request.get_json(silent=True) or {}
    match_id = str(payload.get("match_id", "")).strip()
    join_key = str(payload.get("join_key", "")).strip()
    winner = str(payload.get("winner", "")).strip()
    reason = str(payload.get("reason", "")).strip() or "裁判判定"

    if not join_key.startswith("arc_referee_"):
        return jsonify({"error": "裁判 join_key 必须以 arc_referee_ 开头"}), 400

    if winner not in {"challenger", "defender", "draw"}:
        return jsonify({"error": "winner 仅支持 challenger/defender/draw"}), 400

    with FileLock(LOCK_FILE):
        state = _load_state()
        match = _find_match(state, match_id)
        if not match:
            return jsonify({"error": "match_id 不存在"}), 404

        match["result"] = {
            "winner": winner,
            "reason": reason,
            "auto_judged": False,
        }
        match["status"] = "finished"
        match["last_action_at"] = time.time()
        _save_state(state)

    return jsonify({"status": "finished", "winner": winner, "rating_delta": 0})


@app.get("/arena/leaderboard")
def arena_leaderboard():
    """统计已完成比赛的胜负平并按胜场降序返回。"""
    state = _load_state()
    counter: Dict[str, Dict[str, Any]] = {}

    for match in state.get("matches", []):
        if match.get("status") not in {"finished", "abandoned"}:
            continue

        result = match.get("result")
        if not isinstance(result, dict):
            continue

        challenger = match.get("challenger", {})
        defender = match.get("defender", {})

        c_key = f"{challenger.get('owner', '')}::{challenger.get('lobster_name', '')}"
        d_key = f"{defender.get('owner', '')}::{defender.get('lobster_name', '')}"

        if c_key not in counter:
            counter[c_key] = {
                "lobster_name": challenger.get("lobster_name", ""),
                "owner": challenger.get("owner", ""),
                "wins": 0,
                "losses": 0,
                "draws": 0,
            }
        if d_key not in counter:
            counter[d_key] = {
                "lobster_name": defender.get("lobster_name", ""),
                "owner": defender.get("owner", ""),
                "wins": 0,
                "losses": 0,
                "draws": 0,
            }

        winner = result.get("winner")
        if winner == "challenger":
            counter[c_key]["wins"] += 1
            counter[d_key]["losses"] += 1
        elif winner == "defender":
            counter[d_key]["wins"] += 1
            counter[c_key]["losses"] += 1
        else:
            counter[c_key]["draws"] += 1
            counter[d_key]["draws"] += 1

    leaderboard = list(counter.values())
    leaderboard.sort(key=lambda x: (-x["wins"], x["losses"], x["draws"], x["owner"], x["lobster_name"]))
    return jsonify(leaderboard)


if __name__ == "__main__":
    """以可配置端口启动 Flask 服务。"""
    port = int(os.environ.get("PORT", "5050"))
    app.run(host="0.0.0.0", port=port)
