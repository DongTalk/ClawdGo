import argparse
import json
import os
import re
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
ARENA_API_KEY = os.environ.get("ARENA_API_KEY", "")
DEFAULT_TOTAL_ROUNDS = int(os.environ.get("ARENA_DEFAULT_ROUNDS", "1"))
MAX_TOTAL_ROUNDS = int(os.environ.get("ARENA_MAX_ROUNDS", "20"))

PHASE_WAITING_ATTACK = "waiting_attack"
PHASE_WAITING_DEFENSE = "waiting_defense"
PHASE_FINISHED = "finished"

UUID_RE = re.compile(r"^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$")

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
            # 向后兼容旧数据：补齐状态机字段
            for match in data.get("matches", []):
                if isinstance(match, dict):
                    _normalize_match(match)
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


def _sanitize_total_rounds(value: Any) -> int:
    """清洗轮次参数，限制在 [1, MAX_TOTAL_ROUNDS]。"""
    try:
        rounds = int(value)
    except (TypeError, ValueError):
        rounds = DEFAULT_TOTAL_ROUNDS
    if rounds < 1:
        return 1
    if rounds > MAX_TOTAL_ROUNDS:
        return MAX_TOTAL_ROUNDS
    return rounds


def _safe_int(value: Any, default: int) -> int:
    """容错整型转换。"""
    try:
        return int(value)
    except (TypeError, ValueError):
        return default


def _is_valid_match_id(match_id: str) -> bool:
    """match_id 必须是标准 UUID，避免占位符误入。"""
    return bool(UUID_RE.match(match_id.strip().lower()))


def _infer_phase(match: Dict[str, Any]) -> str:
    """根据当前对局状态推断 phase。"""
    status = match.get("status")
    if status in {"finished", "abandoned"}:
        return PHASE_FINISHED

    round_no = _safe_int(match.get("round", 1), 1)
    challenger_action = match.get("challenger", {}).get("action")
    defender_action = match.get("defender", {}).get("action")

    challenger_submitted = bool(challenger_action and _safe_int(challenger_action.get("round", -1), -1) == round_no)
    defender_submitted = bool(defender_action and _safe_int(defender_action.get("round", -1), -1) == round_no)

    if challenger_submitted and not defender_submitted:
        return PHASE_WAITING_DEFENSE
    return PHASE_WAITING_ATTACK


def _normalize_match(match: Dict[str, Any]) -> None:
    """兼容历史数据结构，补齐多轮状态机字段。"""
    match.setdefault("status", "in_progress")
    match["total_rounds"] = _sanitize_total_rounds(match.get("total_rounds", DEFAULT_TOTAL_ROUNDS))
    match["round"] = max(1, _safe_int(match.get("round", 1), 1))
    match.setdefault("round_results", [])
    match.setdefault("scoreboard", {"challenger": 0, "defender": 0, "draw": 0})
    match.setdefault("result", None)
    match.setdefault("created_at", time.time())
    match.setdefault("last_action_at", match.get("created_at", time.time()))

    match.setdefault("challenger", {})
    match.setdefault("defender", {})
    match["challenger"].setdefault("action", None)
    match["defender"].setdefault("action", None)

    # 历史单轮 finished 对局兼容
    if match.get("status") in {"finished", "abandoned"} and not match.get("round_results"):
        result = match.get("result") or {}
        winner = result.get("winner", "draw")
        round_result = {
            "round": match.get("round", 1),
            "attack": _action_content(match.get("challenger", {}).get("action")),
            "defend": _action_content(match.get("defender", {}).get("action")),
            "result": {
                "winner": winner,
                "reason": result.get("reason", "历史数据兼容"),
                "auto_judged": bool(result.get("auto_judged", True)),
            },
        }
        match["round_results"] = [round_result]

        scoreboard = {"challenger": 0, "defender": 0, "draw": 0}
        if winner in scoreboard:
            scoreboard[winner] += 1
        else:
            scoreboard["draw"] += 1
        match["scoreboard"] = scoreboard

    match["phase"] = _infer_phase(match)


def _bump_scoreboard(match: Dict[str, Any], winner: str) -> None:
    """更新对局累计比分。"""
    scoreboard = match.setdefault("scoreboard", {"challenger": 0, "defender": 0, "draw": 0})
    if winner not in scoreboard:
        winner = "draw"
    scoreboard[winner] = int(scoreboard.get(winner, 0)) + 1


def _finalize_multi_round_result(match: Dict[str, Any]) -> None:
    """按累计比分写入最终 winner/reason。"""
    scoreboard = match.get("scoreboard", {})
    challenger_wins = int(scoreboard.get("challenger", 0))
    defender_wins = int(scoreboard.get("defender", 0))
    draws = int(scoreboard.get("draw", 0))

    if challenger_wins > defender_wins:
        winner = "challenger"
    elif defender_wins > challenger_wins:
        winner = "defender"
    else:
        winner = "draw"

    total_rounds = int(match.get("total_rounds", 1))
    reason = f"总比分 challenger {challenger_wins} : defender {defender_wins}（draw {draws}，共{total_rounds}轮）"
    _set_match_result(match, winner, reason, True, status="finished")


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
    match["phase"] = PHASE_FINISHED
    match["last_action_at"] = now
    match["finished_at"] = now


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

        phase = match.get("phase") or _infer_phase(match)
        if phase == PHASE_WAITING_ATTACK:
            _set_match_result(match, "defender", "challenger 超时未提交攻击", True)
            changed = True
            continue
        if phase == PHASE_WAITING_DEFENSE:
            _set_match_result(match, "challenger", "defender 超时未提交防御", True)
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


def require_api_key():
    """校验 API_KEY，空字符串表示不鉴权（本地开发模式）。"""
    if not ARENA_API_KEY:
        return None
    payload = request.get_json(silent=True) or {}
    key = request.headers.get("X-Arena-Key") or str(payload.get("api_key", "")).strip()
    if key != ARENA_API_KEY:
        return jsonify({"error": "Unauthorized"}), 401
    return None


@app.before_request
def _before_request_timeout_guard() -> None:
    """每次请求前触发超时检查。"""
    _run_timeout_checks_with_lock()


@app.post("/arena/join")
def arena_join():
    """注册龙虾并在可配对时立即创建比赛。"""
    auth_err = require_api_key()
    if auth_err:
        return auth_err

    payload = request.get_json(silent=True) or {}
    join_key = str(payload.get("join_key", "")).strip()
    lobster_name = str(payload.get("lobster_name", "")).strip()
    owner = str(payload.get("owner", "")).strip()
    total_rounds = _sanitize_total_rounds(payload.get("total_rounds", DEFAULT_TOTAL_ROUNDS))

    if not join_key.startswith("arc_"):
        return jsonify({"error": "join_key 必须以 arc_ 开头"}), 400

    now = time.time()

    with FileLock(LOCK_FILE):
        state = _load_state()

        # 若该 join_key 已在未结束对局中，直接返回既有匹配信息。
        for match in state.get("matches", []):
            _normalize_match(match)
            if match.get("status") in {"finished", "abandoned"}:
                continue
            role = _participant_role(match, join_key)
            if role:
                return jsonify(
                    {
                        "match_id": match.get("match_id"),
                        "role": role,
                        "status": "matched",
                        "round": match.get("round", 1),
                        "total_rounds": match.get("total_rounds", 1),
                        "phase": match.get("phase", _infer_phase(match)),
                    }
                )

        waiting_pool = state.setdefault("waiting_pool", [])
        waiting_pool[:] = [item for item in waiting_pool if item.get("join_key") != join_key]

        current_player = {
            "join_key": join_key,
            "lobster_name": lobster_name,
            "owner": owner,
            "total_rounds": total_rounds,
            "joined_at": now,
        }
        waiting_pool.append(current_player)

        response = {
            "match_id": None,
            "role": None,
            "status": "waiting",
            "round": 1,
            "total_rounds": total_rounds,
            "phase": PHASE_WAITING_ATTACK,
        }

        if len(waiting_pool) >= 2:
            challenger = waiting_pool.pop(0)
            defender = waiting_pool.pop(0)
            created_at = time.time()
            match_id = str(uuid.uuid4())
            match_total_rounds = _sanitize_total_rounds(
                challenger.get("total_rounds") or defender.get("total_rounds") or DEFAULT_TOTAL_ROUNDS
            )

            match = {
                "match_id": match_id,
                "status": "in_progress",
                "round": 1,
                "total_rounds": match_total_rounds,
                "phase": PHASE_WAITING_ATTACK,
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
                "round_results": [],
                "scoreboard": {"challenger": 0, "defender": 0, "draw": 0},
                "result": None,
                "created_at": created_at,
                "last_action_at": created_at,
            }
            state.setdefault("matches", []).append(match)

            role = "challenger" if join_key == challenger.get("join_key") else "defender"
            response = {
                "match_id": match_id,
                "role": role,
                "status": "matched",
                "round": 1,
                "total_rounds": match_total_rounds,
                "phase": PHASE_WAITING_ATTACK,
            }

        _save_state(state)

    return jsonify(response)


@app.post("/arena/action")
def arena_action():
    """提交行动并在双方都提交后完成自动判定。"""
    auth_err = require_api_key()
    if auth_err:
        return auth_err

    payload = request.get_json(silent=True) or {}
    match_id = str(payload.get("match_id", "")).strip()
    join_key = str(payload.get("join_key", "")).strip()
    action_type = str(payload.get("action_type", "")).strip()
    content = str(payload.get("content", "")).strip()

    if not _is_valid_match_id(match_id):
        return jsonify({"error": "match_id 格式无效，请传入真实 UUID"}), 400

    if action_type not in {"attack", "defend"}:
        return jsonify({"error": "action_type 仅支持 attack 或 defend"}), 400
    if not content:
        return jsonify({"error": "content 不能为空"}), 400

    with FileLock(LOCK_FILE):
        state = _load_state()
        match = _find_match(state, match_id)

        if not match:
            return jsonify({"error": "match_id 不存在"}), 404

        _normalize_match(match)

        if match.get("status") in {"finished", "abandoned"}:
            return jsonify({"error": "该对局已结束"}), 400

        role = _participant_role(match, join_key)
        if not role:
            return jsonify({"error": "join_key 不属于该对局"}), 400

        expected_type = "attack" if role == "challenger" else "defend"
        if action_type != expected_type:
            return jsonify({"error": f"{role} 只能提交 {expected_type} 类型行动"}), 400

        expected_phase = PHASE_WAITING_ATTACK if role == "challenger" else PHASE_WAITING_DEFENSE
        current_phase = match.get("phase", _infer_phase(match))
        if current_phase != expected_phase:
            return (
                jsonify(
                    {
                        "error": f"当前阶段为 {current_phase}，{role} 不能提交 {action_type}",
                        "phase": current_phase,
                        "round": match.get("round", 1),
                    }
                ),
                409,
            )

        round_no = int(match.get("round", 1))
        role_action = match.get(role, {}).get("action")
        if role_action and _safe_int(role_action.get("round", -1), -1) == round_no:
            return jsonify({"error": f"{role} 在第 {round_no} 轮已提交过行动"}), 409

        now = time.time()
        match[role]["action"] = {
            "type": action_type,
            "content": content,
            "round": round_no,
            "submitted_at": now,
        }
        match["last_action_at"] = now

        challenger_action = match.get("challenger", {}).get("action")
        defender_action = match.get("defender", {}).get("action")

        challenger_submitted = bool(challenger_action and _safe_int(challenger_action.get("round", -1), -1) == round_no)
        defender_submitted = bool(defender_action and _safe_int(defender_action.get("round", -1), -1) == round_no)

        if challenger_submitted and defender_submitted:
            result = _auto_judge(
                _action_content(challenger_action),
                _action_content(defender_action),
            )
            _bump_scoreboard(match, str(result.get("winner", "draw")))
            round_result = {
                "round": round_no,
                "attack": _action_content(challenger_action),
                "defend": _action_content(defender_action),
                "result": result,
            }
            match.setdefault("round_results", []).append(round_result)
            match["latest_round_result"] = round_result

            total_rounds = int(match.get("total_rounds", 1))
            if round_no < total_rounds:
                match["round"] = round_no + 1
                match["phase"] = PHASE_WAITING_ATTACK
                match["status"] = "in_progress"
                match["result"] = None
                # 下一轮重新收集攻防包
                match["challenger"]["action"] = None
                match["defender"]["action"] = None
                response = {
                    "round": match.get("round", 1),
                    "total_rounds": total_rounds,
                    "waiting_for": "challenger",
                    "phase": PHASE_WAITING_ATTACK,
                    "previous_round_result": round_result,
                    "scoreboard": match.get("scoreboard", {}),
                }
            else:
                _finalize_multi_round_result(match)
                response = {
                    "round": round_no,
                    "total_rounds": total_rounds,
                    "waiting_for": None,
                    "phase": PHASE_FINISHED,
                    "result": match.get("result"),
                    "scoreboard": match.get("scoreboard", {}),
                }
        else:
            waiting_for = "defender" if role == "challenger" else "challenger"
            match["phase"] = PHASE_WAITING_DEFENSE if waiting_for == "defender" else PHASE_WAITING_ATTACK
            match["status"] = "waiting"
            response = {
                "round": round_no,
                "total_rounds": int(match.get("total_rounds", 1)),
                "waiting_for": waiting_for,
                "phase": match.get("phase"),
            }

        _save_state(state)

    return jsonify(response)


@app.get("/arena/state/<match_id>")
def arena_state(match_id: str):
    """查询指定比赛的完整状态。"""
    with FileLock(LOCK_FILE):
        state = _load_state()
        match = _find_match(state, match_id)
        if not match:
            return jsonify({"error": "match_id 不存在"}), 404
        _normalize_match(match)
        _save_state(state)
        return jsonify(match)


@app.post("/arena/judge")
def arena_judge():
    """预留裁判接口：由 referee join_key 强制写入判定结果。"""
    auth_err = require_api_key()
    if auth_err:
        return auth_err

    payload = request.get_json(silent=True) or {}
    match_id = str(payload.get("match_id", "")).strip()
    join_key = str(payload.get("join_key", "")).strip()
    winner = str(payload.get("winner", "")).strip()
    reason = str(payload.get("reason", "")).strip() or "裁判判定"

    if not _is_valid_match_id(match_id):
        return jsonify({"error": "match_id 格式无效，请传入真实 UUID"}), 400

    if not join_key.startswith("arc_referee_"):
        return jsonify({"error": "裁判 join_key 必须以 arc_referee_ 开头"}), 400

    if winner not in {"challenger", "defender", "draw"}:
        return jsonify({"error": "winner 仅支持 challenger/defender/draw"}), 400

    with FileLock(LOCK_FILE):
        state = _load_state()
        match = _find_match(state, match_id)
        if not match:
            return jsonify({"error": "match_id 不存在"}), 404

        _normalize_match(match)
        _bump_scoreboard(match, winner)
        match.setdefault("round_results", []).append(
            {
                "round": int(match.get("round", 1)),
                "attack": _action_content(match.get("challenger", {}).get("action")),
                "defend": _action_content(match.get("defender", {}).get("action")),
                "result": {"winner": winner, "reason": reason, "auto_judged": False},
            }
        )

        match["result"] = {
            "winner": winner,
            "reason": reason,
            "auto_judged": False,
        }
        match["status"] = "finished"
        match["phase"] = PHASE_FINISHED
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
    """以命令行参数启动 Flask 服务。"""
    parser = argparse.ArgumentParser()
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=8118)
    args = parser.parse_args()
    app.run(host=args.host, port=args.port)
