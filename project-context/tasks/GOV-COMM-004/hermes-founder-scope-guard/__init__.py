"""Hermes guard for Founder-approved action boundaries.

The model may discuss or approve content without receiving permission to mutate
files, Git state, external systems, or delegate work.  This plugin reconstructs
explicit restrictions every turn and enforces the mechanically identifiable
parts immediately before tool execution.
"""

from __future__ import annotations

from dataclasses import dataclass, field
import json
import logging
from pathlib import Path
import re
import threading
import time
from typing import Any, Iterable


logger = logging.getLogger(__name__)
PLUGIN_DIR = Path(__file__).resolve().parent
HERMES_HOME = PLUGIN_DIR.parents[1]
STATE_PATH = HERMES_HOME / "plugin-state" / "founder-scope-guard.json"
MAX_STORED_SESSIONS = 500


ACTION_ALIASES: dict[str, tuple[str, ...]] = {
    "write": (
        "修改文件", "改文件", "写文件", "写入文件", "落盘", "文件改动",
        "产品代码改动", "治理文件改动", "write file", "edit file", "modify file",
    ),
    "commit": ("提交", "commit"),
    "push": ("推送", "push"),
    "branch": ("建分支", "创建分支", "切换分支", "branch"),
    "pr": ("建 pr", "建pr", "创建 pr", "创建pr", "pull request", "转 ready", "ready"),
    "merge": ("合并", "merge", "rebase"),
    "delegate": (
        "委派", "唤醒", "子 agent", "子agent", "其他角色", "builder", "reviewer",
        "delegate", "subagent", "spawn agent",
    ),
    "experiment": ("继续实验", "启动实验", "运行实验", "开始实验", "校准", "experiment"),
    "holdout": ("holdout", "保留集"),
    "deploy": ("部署", "发布", "deploy", "release"),
    "install": ("安装", "下载", "install", "download"),
    "external": ("外部调用", "外部服务", "联网", "web search", "browse the web"),
}

MUTATING_ACTIONS = {
    "write", "commit", "push", "branch", "pr", "merge", "deploy", "install",
}

NEGATIVE_MARKERS = (
    "禁止", "不得", "不允许", "不准", "不可", "不要", "先别", "暂不", "未授权",
    "do not", "don't", "must not", "prohibited", "not allowed", "not authorized",
)
ALLOW_MARKERS = (
    "明确授权", "授权你", "授权执行", "允许你", "允许执行", "现在可以", "请直接",
    "请你", "帮我", "go ahead", "you may", "i authorize", "authorized to",
)
DECISION_ONLY_MARKERS = (
    "决定是否", "裁决是否", "是否授权", "是否合并", "是否推送", "是否建", "等待决定",
)
STRUCTURED_RESTRICTION_MARKERS = (
    "禁止执行", "本轮禁止", "不得执行", "只允许只读", "仅允许只读", "只读分析",
    "prohibited actions", "read-only", "read only",
)


@dataclass
class ScopeState:
    prohibited: set[str] = field(default_factory=set)
    sources: dict[str, str] = field(default_factory=dict)

    def prohibit(self, action: str, source: str) -> None:
        self.prohibited.add(action)
        self.sources[action] = source.strip()[:240]

    def allow(self, action: str) -> None:
        self.prohibited.discard(action)
        self.sources.pop(action, None)


_states: dict[str, ScopeState] = {}
_state_lock = threading.RLock()


def _content_text(content: Any) -> str:
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        parts: list[str] = []
        for item in content:
            if isinstance(item, str):
                parts.append(item)
            elif isinstance(item, dict):
                value = item.get("text") or item.get("content")
                if isinstance(value, str):
                    parts.append(value)
        return "\n".join(parts)
    return "" if content is None else str(content)


def _message_parts(message: Any) -> tuple[str, str]:
    if isinstance(message, dict):
        return str(message.get("role") or ""), _content_text(message.get("content"))
    return str(getattr(message, "role", "")), _content_text(getattr(message, "content", ""))


def _lines(text: str) -> Iterable[str]:
    for line in re.split(r"[\r\n，。；;]+", text or ""):
        cleaned = line.strip().lower()
        if cleaned:
            yield cleaned


def _mentioned_actions(line: str) -> set[str]:
    return {
        action
        for action, aliases in ACTION_ALIASES.items()
        if any(alias in line for alias in aliases)
    }


def _has_any(line: str, markers: Iterable[str]) -> bool:
    return any(marker in line for marker in markers)


def _apply_restrictions(state: ScopeState, text: str, *, structured_only: bool) -> None:
    for line in _lines(text):
        if line in {"禁止：无", "禁止: 无", "禁止:none", "prohibited: none"}:
            continue
        strong = _has_any(line, STRUCTURED_RESTRICTION_MARKERS)
        negative = _has_any(line, NEGATIVE_MARKERS)
        readonly = "只读" in line or "read-only" in line or "read only" in line
        if structured_only and not strong:
            continue
        if readonly and (strong or negative or line.startswith(("允许", "本轮", "范围"))):
            for action in MUTATING_ACTIONS:
                state.prohibit(action, line)
        if negative or strong:
            for action in _mentioned_actions(line):
                state.prohibit(action, line)


def _is_direct_authorization(line: str, action: str) -> bool:
    if _has_any(line, NEGATIVE_MARKERS) or _has_any(line, DECISION_ONLY_MARKERS):
        return False
    if not _mentioned_actions(line).__contains__(action):
        return False
    if _has_any(line, ALLOW_MARKERS):
        return True
    aliases = ACTION_ALIASES[action]
    return any(
        re.search(rf"(?:^|[，。；;、\s])(?:请)?{re.escape(alias)}(?:吧|一下|即可|$)", line)
        for alias in aliases
    )


def _apply_authorizations(state: ScopeState, text: str) -> None:
    for line in _lines(text):
        # Content approval and mode selection are not tool authorization.
        if any(marker in line for marker in ("批准方案", "批准方向", "同意方案", "按你推荐")):
            continue
        for action in ACTION_ALIASES:
            if _is_direct_authorization(line, action):
                state.allow(action)


def _is_compaction_reference(text: str) -> bool:
    head = (text or "")[:600].lower()
    return "[context compaction — reference only]" in head or "[context compaction - reference only]" in head


def derive_scope(
    conversation_history: list[Any] | None,
    user_message: str,
    *,
    base: ScopeState | None = None,
) -> ScopeState:
    """Rebuild scope from Founder messages, never from Agent/tool prose."""
    state = ScopeState(set(base.prohibited), dict(base.sources)) if base else ScopeState()
    saw_unverified_compaction = False
    for message in conversation_history or []:
        role, text = _message_parts(message)
        if role.lower() != "user":
            continue
        if _is_compaction_reference(text):
            saw_unverified_compaction = True
            continue
        _apply_restrictions(state, text, structured_only=False)
        _apply_authorizations(state, text)
    if _is_compaction_reference(user_message):
        saw_unverified_compaction = True
    else:
        _apply_restrictions(state, user_message, structured_only=False)
        _apply_authorizations(state, user_message)
    if saw_unverified_compaction and base is None:
        # A generated summary is not proof of current authorization.  Fail safely
        # until a fresh Founder message names the permitted action.
        for action in set(ACTION_ALIASES):
            state.prohibit(action, "compacted session has no verified persisted action scope")
    return state


def _keys(*values: Any) -> list[str]:
    return [str(value) for value in values if value]


def _remember(state: ScopeState, *identifiers: Any) -> None:
    with _state_lock:
        for key in _keys(*identifiers):
            _states[key] = state


def _read_store() -> dict[str, Any]:
    try:
        raw = json.loads(STATE_PATH.read_text(encoding="utf-8"))
        return raw if isinstance(raw, dict) else {"sessions": {}}
    except (FileNotFoundError, json.JSONDecodeError, OSError):
        return {"sessions": {}}


def _load_persisted(*identifiers: Any) -> ScopeState | None:
    sessions = _read_store().get("sessions", {})
    if not isinstance(sessions, dict):
        return None
    for key in _keys(*identifiers):
        item = sessions.get(key)
        if isinstance(item, dict) and isinstance(item.get("prohibited"), list):
            return ScopeState(set(map(str, item["prohibited"])), {})
    return None


def _persist(state: ScopeState, *identifiers: Any) -> None:
    keys = _keys(*identifiers)
    if not keys:
        return
    with _state_lock:
        data = _read_store()
        sessions = data.setdefault("sessions", {})
        if not isinstance(sessions, dict):
            sessions = {}
            data["sessions"] = sessions
        now = time.time()
        payload = {"prohibited": sorted(state.prohibited), "updated_at": now}
        for key in keys:
            sessions[key] = payload
        if len(sessions) > MAX_STORED_SESSIONS:
            ordered = sorted(
                sessions.items(),
                key=lambda item: float(item[1].get("updated_at", 0)) if isinstance(item[1], dict) else 0,
                reverse=True,
            )
            data["sessions"] = dict(ordered[:MAX_STORED_SESSIONS])
        STATE_PATH.parent.mkdir(parents=True, exist_ok=True)
        temporary = STATE_PATH.with_suffix(".tmp")
        temporary.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
        temporary.replace(STATE_PATH)


def _lookup(*identifiers: Any) -> ScopeState:
    with _state_lock:
        for key in _keys(*identifiers):
            if key in _states:
                return _states[key]
    return ScopeState()


def _tool_text(args: Any) -> str:
    try:
        return json.dumps(args or {}, ensure_ascii=False, default=str).lower()
    except Exception:
        return str(args or "").lower()


def _terminal_actions(text: str) -> set[str]:
    actions: set[str] = set()
    if re.search(r"\bgit\s+(?:add|commit|reset|restore|stash)\b", text):
        actions.update({"write", "commit"} if "commit" in text else {"write"})
    if re.search(r"\bgit\s+push\b", text):
        actions.add("push")
    if re.search(
        r"\bgit\s+(?:checkout\s+-b|switch\s+-c|branch\s+(?:-[dDmMcC]\b|--delete\b|--move\b|--copy\b|[^-\s][^;&|]*))",
        text,
    ):
        actions.add("branch")
    if re.search(r"\bgit\s+(?:merge|rebase)\b", text):
        actions.add("merge")
    if re.search(r"\bgh\s+pr\s+(?:create|ready|merge|close|edit)\b", text):
        actions.add("pr")
    if re.search(
        r"(?:^|[;&|]\s*)(?:rm|mv|cp|mkdir|touch)\b|"
        r"\b(?:set-content|out-file|remove-item|move-item|copy-item|new-item)\b|"
        r"(?:^|\s)(?:>>?|2>)\s*[^&|]",
        text,
    ):
        actions.add("write")
    if re.search(r"\b(?:pip|pipx|npm|pnpm|yarn|uv|cargo|winget|choco)\s+install\b", text):
        actions.add("install")
    if re.search(r"\b(?:curl|wget|invoke-webrequest|start-bitstransfer)\b", text):
        actions.add("external")
    return actions


def _execute_code_actions(text: str) -> set[str]:
    actions: set[str] = set()
    if re.search(
        r"\b(?:write_file|apply_patch|write_text|write_bytes|unlink|rmtree|makedirs|mkdir)\b|"
        r"\bopen\s*\([^\n]{0,160},\s*['\"](?:w|a|x|\+)",
        text,
    ):
        actions.add("write")
    actions.update(_terminal_actions(text))
    return actions


def classify_tool(tool_name: str, args: Any) -> set[str]:
    name = (tool_name or "").strip().lower()
    text = _tool_text(args)
    actions: set[str] = set()
    if name in {"delegate_task", "spawn_agent", "subagent", "task"} or "delegate" in name:
        actions.add("delegate")
    if name in {
        "write_file", "patch", "apply_patch", "edit_file", "replace_file", "delete_file",
        "create_directory", "move_file", "copy_file",
    }:
        actions.add("write")
    if name in {"terminal", "shell", "shell_exec", "exec_command"}:
        actions.update(_terminal_actions(text))
    if name in {"execute_code", "python", "run_code"}:
        actions.update(_execute_code_actions(text))
    if name in {"web_search", "browser", "browser_navigate", "fetch_url", "http_request"}:
        actions.add("external")
    if "holdout" in text or "保留集" in text:
        actions.add("holdout")
    return actions


def pre_llm_call(
    session_id: str = "",
    user_message: str = "",
    conversation_history: list[Any] | None = None,
    task_id: str = "",
    is_first_turn: bool = False,
    **_: Any,
) -> dict[str, str] | None:
    base = _load_persisted(session_id, task_id)
    state = derive_scope(conversation_history, user_message, base=base)
    _remember(state, session_id, task_id)
    _persist(state, session_id, task_id)
    rendering = (
        "[Founder-facing response reminder]\n"
        "Follow the project's single adaptive response protocol. For a simple matter, use one short natural "
        "plain-language paragraph. For a genuinely complex decision, use enough natural paragraphs to explain "
        "the situation, user impact, options/tradeoffs, recommendation, and the one decision needed; do not turn "
        "those into a fixed seven-part checklist or a large technical table. Technical detail belongs in the "
        "handoff/report. After the Founder has clearly decided, act within existing permission or output the "
        "needed role-specific short handoff card; do not send a separate decision receipt or ask twice."
    )
    if is_first_turn:
        rendering += (
            "\nThis is the first turn of a new/restored task window. The first substantive response must put "
            "the Founder explanation under `## 先说人话（30 秒）`, followed by a compact `## 启动回执` of no "
            "more than seven information lines. The receipt comes after, never instead of, the plain-language answer."
        )
    if not state.prohibited:
        return {"context": rendering}
    active = "、".join(sorted(state.prohibited))
    return {
        "context": (
            rendering
            + "\n\n[Founder action-scope guard — mechanically enforced]\n"
            f"Active prohibited action categories: {active}.\n"
            "A content/plan approval or execution-mode choice does not remove these restrictions. "
            "Only a later, explicit Founder authorization naming the specific action can remove it. "
            "Do not call a prohibited tool; explain the remaining boundary in plain language."
        )
    }


def pre_tool_call(
    tool_name: str = "",
    args: Any = None,
    task_id: str = "",
    session_id: str = "",
    **_: Any,
) -> dict[str, str] | None:
    state = _lookup(session_id, task_id)
    blocked = sorted(classify_tool(tool_name, args).intersection(state.prohibited))
    if not blocked:
        return None
    detail = "、".join(blocked)
    source = state.sources.get(blocked[0], "Founder previously prohibited this action")
    logger.warning("Blocked Hermes tool session=%s tool=%s actions=%s", session_id or task_id, tool_name, detail)
    return {
        "action": "block",
        "message": (
            f"Founder scope guard blocked this tool call ({detail}). "
            f"Active source: {source}. Content approval is not action permission; "
            "continue without this action or ask for explicit authorization naming it."
        ),
    }


def register(ctx: Any) -> None:
    ctx.register_hook("pre_llm_call", pre_llm_call)
    ctx.register_hook("pre_tool_call", pre_tool_call)
    logger.info("founder-scope-guard registered")
