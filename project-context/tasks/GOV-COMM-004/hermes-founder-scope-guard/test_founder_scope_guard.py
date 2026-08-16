from __future__ import annotations

import importlib.util
from pathlib import Path
import sys
import unittest


MODULE_PATH = Path(__file__).with_name("__init__.py")
SPEC = importlib.util.spec_from_file_location("founder_scope_guard", MODULE_PATH)
guard = importlib.util.module_from_spec(SPEC)
assert SPEC and SPEC.loader
sys.modules[SPEC.name] = guard
SPEC.loader.exec_module(guard)


class ScopeTests(unittest.TestCase):
    def test_plan_approval_does_not_clear_write_or_delegation(self):
        history = [{"role": "user", "content": "只允许只读分析。禁止修改文件、提交、推送、建 PR、唤醒其他角色。"}]
        state = guard.derive_scope(history, "批准这个方案方向，按你推荐的临时委派走。")
        self.assertTrue({"write", "commit", "push", "pr", "delegate"}.issubset(state.prohibited))

    def test_explicit_authorization_clears_only_named_action(self):
        history = [{"role": "user", "content": "禁止修改文件、推送、唤醒 Builder。"}]
        state = guard.derive_scope(history, "现在明确授权你唤醒 Builder，但仍不要修改文件或推送。")
        self.assertNotIn("delegate", state.prohibited)
        self.assertIn("write", state.prohibited)
        self.assertIn("push", state.prohibited)

    def test_decide_whether_merge_is_not_merge_permission(self):
        history = [{"role": "user", "content": "禁止合并。"}]
        state = guard.derive_scope(history, "允许你审阅后决定是否合并。")
        self.assertIn("merge", state.prohibited)

    def test_direct_merge_imperative_clears_merge(self):
        history = [{"role": "user", "content": "禁止合并。"}]
        state = guard.derive_scope(history, "合并吧")
        self.assertNotIn("merge", state.prohibited)

    def test_readonly_terminal_allowed_but_git_commit_blocked(self):
        state = guard.derive_scope([], "只允许只读分析。")
        guard._remember(state, "s1")
        self.assertIsNone(guard.pre_tool_call("terminal", {"command": "git status"}, session_id="s1"))
        result = guard.pre_tool_call("terminal", {"command": "git add .; git commit -m test"}, session_id="s1")
        self.assertEqual("block", result["action"])

    def test_readonly_git_branch_query_allowed(self):
        state = guard.derive_scope([], "只允许只读分析。")
        guard._remember(state, "s-branch")
        self.assertIsNone(
            guard.pre_tool_call("terminal", {"command": "git branch --show-current"}, session_id="s-branch")
        )

    def test_delegate_tool_blocked(self):
        state = guard.derive_scope([], "禁止唤醒其他角色。")
        guard._remember(state, "s2")
        result = guard.pre_tool_call("delegate_task", {"prompt": "do work"}, task_id="s2")
        self.assertEqual("block", result["action"])

    def test_holdout_read_blocked(self):
        state = guard.derive_scope([], "不得读取 holdout。")
        guard._remember(state, "s3")
        result = guard.pre_tool_call("read_file", {"path": "data/holdout.json"}, task_id="s3")
        self.assertEqual("block", result["action"])

    def test_agent_or_tool_text_cannot_invent_restrictions(self):
        history = [
            {"role": "assistant", "content": "本轮禁止执行：修改文件、建 PR、合并。"},
            {"role": "tool", "content": "文档写着禁止读取 holdout。"},
        ]
        state = guard.derive_scope(history, "继续")
        self.assertEqual(set(), state.prohibited)

    def test_unverified_compaction_fails_safe(self):
        history = [{"role": "user", "content": "[CONTEXT COMPACTION — REFERENCE ONLY] historical text"}]
        state = guard.derive_scope(history, "继续")
        self.assertEqual(set(guard.ACTION_ALIASES), state.prohibited)

    def test_first_turn_injects_adaptive_format_and_receipt(self):
        original_path = guard.STATE_PATH
        try:
            guard.STATE_PATH = Path(self.id().replace(".", "_") + ".json")
            result = guard.pre_llm_call(
                session_id="format-test",
                user_message="简单查询",
                conversation_history=[],
                is_first_turn=True,
            )
            self.assertIn("one short natural", result["context"])
            self.assertIn("## 启动回执", result["context"])
            self.assertIn("no more than seven", result["context"])
        finally:
            if guard.STATE_PATH.exists():
                guard.STATE_PATH.unlink()
            guard.STATE_PATH = original_path


if __name__ == "__main__":
    unittest.main()
