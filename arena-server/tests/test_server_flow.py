import os
import pathlib
import sys
import tempfile
import unittest

CURRENT_DIR = pathlib.Path(__file__).resolve().parent
SERVER_DIR = CURRENT_DIR.parent
if str(SERVER_DIR) not in sys.path:
    sys.path.insert(0, str(SERVER_DIR))

import server


class ArenaServerFlowTests(unittest.TestCase):
    def setUp(self):
        self.tmpdir = tempfile.TemporaryDirectory()
        server.ARENA_FILE = os.path.join(self.tmpdir.name, "arena.json")
        server.LOCK_FILE = os.path.join(self.tmpdir.name, "arena.json.lock")
        server.ARENA_API_KEY = ""
        server._ensure_state_file()
        self.client = server.app.test_client()

    def tearDown(self):
        self.tmpdir.cleanup()

    def _join(self, join_key: str, name: str, owner: str, total_rounds: int = 1):
        return self.client.post(
            "/arena/join",
            json={
                "join_key": join_key,
                "lobster_name": name,
                "owner": owner,
                "total_rounds": total_rounds,
            },
        )

    def _action(self, match_id: str, join_key: str, action_type: str, content: str):
        return self.client.post(
            "/arena/action",
            json={
                "match_id": match_id,
                "join_key": join_key,
                "action_type": action_type,
                "content": content,
            },
        )

    def test_multiround_phase_progression(self):
        first = self._join("arc_a_0001", "红方", "alice", total_rounds=2)
        self.assertEqual(first.status_code, 200)
        first_json = first.get_json()
        self.assertEqual(first_json["status"], "waiting")
        self.assertEqual(first_json["phase"], "waiting_attack")
        self.assertEqual(first_json["total_rounds"], 2)

        second = self._join("arc_b_0001", "蓝方", "bob", total_rounds=2)
        self.assertEqual(second.status_code, 200)
        second_json = second.get_json()
        self.assertEqual(second_json["status"], "matched")
        self.assertEqual(second_json["phase"], "waiting_attack")
        match_id = second_json["match_id"]

        r1_attack = self._action(match_id, "arc_a_0001", "attack", "伪造CEO紧急转账邮件")
        self.assertEqual(r1_attack.status_code, 200)
        r1_attack_json = r1_attack.get_json()
        self.assertEqual(r1_attack_json["phase"], "waiting_defense")
        self.assertEqual(r1_attack_json["round"], 1)

        r1_defend = self._action(match_id, "arc_b_0001", "defend", "电话二次核验并冻结异常转账")
        self.assertEqual(r1_defend.status_code, 200)
        r1_defend_json = r1_defend.get_json()
        self.assertEqual(r1_defend_json["phase"], "waiting_attack")
        self.assertEqual(r1_defend_json["round"], 2)
        self.assertEqual(r1_defend_json["waiting_for"], "challenger")

        r2_attack = self._action(match_id, "arc_a_0001", "attack", "伪装IT通知诱导安装脚本")
        self.assertEqual(r2_attack.status_code, 200)
        self.assertEqual(r2_attack.get_json()["phase"], "waiting_defense")

        r2_defend = self._action(match_id, "arc_b_0001", "defend", "走工单核验并在隔离环境验证")
        self.assertEqual(r2_defend.status_code, 200)
        r2_defend_json = r2_defend.get_json()
        self.assertEqual(r2_defend_json["phase"], "finished")
        self.assertIn(r2_defend_json["result"]["winner"], {"challenger", "defender", "draw"})
        self.assertEqual(sum(r2_defend_json["scoreboard"].values()), 2)

        state = self.client.get(f"/arena/state/{match_id}")
        self.assertEqual(state.status_code, 200)
        state_json = state.get_json()
        self.assertEqual(state_json["phase"], "finished")
        self.assertEqual(state_json["total_rounds"], 2)
        self.assertEqual(len(state_json["round_results"]), 2)

    def test_reject_placeholder_and_out_of_turn(self):
        self._join("arc_a_0002", "红方", "alice", total_rounds=1)
        matched = self._join("arc_b_0002", "蓝方", "bob", total_rounds=1)
        match_id = matched.get_json()["match_id"]

        placeholder = self._action("<MATCH_ID>", "arc_a_0002", "attack", "占位符测试")
        self.assertEqual(placeholder.status_code, 400)
        self.assertIn("UUID", placeholder.get_json()["error"])

        out_of_turn = self._action(match_id, "arc_b_0002", "defend", "我先防守")
        self.assertEqual(out_of_turn.status_code, 409)
        self.assertEqual(out_of_turn.get_json()["phase"], "waiting_attack")

    def test_reject_duplicate_submit_in_same_round(self):
        self._join("arc_a_0003", "红方", "alice", total_rounds=1)
        matched = self._join("arc_b_0003", "蓝方", "bob", total_rounds=1)
        match_id = matched.get_json()["match_id"]

        first_attack = self._action(match_id, "arc_a_0003", "attack", "第一次攻击")
        self.assertEqual(first_attack.status_code, 200)

        duplicate_attack = self._action(match_id, "arc_a_0003", "attack", "第二次重复攻击")
        self.assertEqual(duplicate_attack.status_code, 409)
        self.assertIn("不能提交", duplicate_attack.get_json()["error"])


if __name__ == "__main__":
    unittest.main()
