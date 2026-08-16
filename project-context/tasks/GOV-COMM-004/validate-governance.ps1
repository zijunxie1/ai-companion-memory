param(
    [string]$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..\..\..')).Path,
    [string]$BaseRef = 'origin/main',
    [string]$SoulPath = '',
    [string]$HermesConfigPath = '',
    [string]$InstalledGuardPath = ''
)

$ErrorActionPreference = 'Stop'
$failures = [System.Collections.Generic.List[string]]::new()

function Require-Text {
    param([string]$Path, [string]$Pattern, [string]$Label)
    $text = Get-Content -LiteralPath (Join-Path $RepoRoot $Path) -Raw
    if ($text -notmatch $Pattern) { $failures.Add("MISSING [$Label] in $Path") }
}

function Reject-Text {
    param([string]$Path, [string]$Pattern, [string]$Label)
    $text = Get-Content -LiteralPath (Join-Path $RepoRoot $Path) -Raw
    if ($text -match $Pattern) { $failures.Add("CONFLICT [$Label] in $Path") }
}

$formalFiles = @(
    'AGENTS.md',
    'project-context/agent-response-protocol.md',
    'project-context/context-manifest.md',
    'project-context/role-wakeup-and-handoff.md',
    'project-context/handoff-and-task-state-machine.md',
    'project-context/templates/role-handoff-template.md'
)

Require-Text 'AGENTS.md' '2026-08-16\.1' 'unified version'
Require-Text 'AGENTS.md' '决定内容与动作权限必须分开' 'authorization model'
Require-Text 'project-context/agent-response-protocol.md' '内容决定与动作权限是两件事' 'response authorization boundary'
Require-Text 'project-context/context-manifest.md' '当前允许动作.*当前禁止动作' 'compression restores action scope'
Require-Text 'project-context/context-manifest.md' '回执最多七个信息行' 'compact Founder startup receipt'
Require-Text 'project-context/role-wakeup-and-handoff.md' '当前已授权的.*动作' 'handoff action permissions'
Require-Text 'project-context/handoff-and-task-state-machine.md' '内容门.*不是当前窗口自动获得' 'APPROVED is content-only gate'
Require-Text 'project-context/templates/role-handoff-template.md' 'persistence_authorization' 'persistence authorization field'
Require-Text 'project-context/agent-response-protocol.md' '历史 TASK/GOV 文件.*只证明当时发生过什么.*不再具有回复格式效力' 'historical template quarantine'
Require-Text 'project-context/tasks/GOV-COMM-004/hermes-founder-scope-guard/plugin.yaml' 'pre_llm_call[\s\S]*pre_tool_call' 'Hermes guard hooks'
Require-Text 'project-context/tasks/GOV-COMM-004/hermes-founder-scope-guard/__init__.py' 'Content approval is not action permission' 'mechanical authorization guard'

Reject-Text 'AGENTS.md' '## 委派前的固定输出' 'legacy fixed delegation output'
Reject-Text 'AGENTS.md' '## 固定状态报告' 'legacy fixed status report'
Reject-Text 'AGENTS.md' '## 执行模式判断' 'legacy Founder execution-mode heading'
Reject-Text 'AGENTS.md' '任务达到 APPROVED 后，Chief of Staff 必须先输出以下判断' 'legacy mandatory field block'
Reject-Text 'project-context/context-manifest.md' 'Chief 身份实例：\s*\r?\n与前任会话的关系' 'legacy expanded Chief startup receipt'

$authorityCount = 0
foreach ($file in $formalFiles) {
    $text = Get-Content -LiteralPath (Join-Path $RepoRoot $file) -Raw
    if ($text -match '回复方式的唯一权威来源') { $authorityCount++ }
}
if ($authorityCount -ne 1) {
    $failures.Add("AUTHORITY expected exactly 1 response-format authority, found $authorityCount")
}

$changed = @(& git -C $RepoRoot diff --name-only $BaseRef --)
$untracked = @(& git -C $RepoRoot ls-files --others --exclude-standard)
$changed = @($changed + $untracked | Sort-Object -Unique)
$blockedPatterns = @(
    '^v2/', '^eval/', '^migrations/', '\.(ts|tsx|js|jsx|sql)$',
    '^project-context/tasks/TASK-006/spike-r4-',
    '^project-context/tasks/TASK-006/spike-r3/data/'
)
foreach ($path in $changed) {
    foreach ($pattern in $blockedPatterns) {
        if ($path -match $pattern) { $failures.Add("SCOPE blocked path changed: $path") }
    }
}

if ($SoulPath) {
    if (-not (Test-Path -LiteralPath $SoulPath)) {
        $failures.Add("SOUL path missing: $SoulPath")
    } else {
        $soul = Get-Content -LiteralPath $SoulPath -Raw
        if ($soul -notmatch 'tool-use.*never.*expand|工具.*不.*扩大|read-only task.*read-only tools') {
            $failures.Add('SOUL missing explicit tool-use permission boundary')
        }
    }
}

if ($HermesConfigPath) {
    if (-not (Test-Path -LiteralPath $HermesConfigPath)) {
        $failures.Add("Hermes config missing: $HermesConfigPath")
    } else {
        $config = Get-Content -LiteralPath $HermesConfigPath -Raw
        if ($config -notmatch '(?m)^\s*default:\s*deepseek-v4-pro\s*$') {
            $failures.Add('Hermes default model changed or cannot be verified')
        }
        if ($config -notmatch '(?m)^\s*-\s*founder-scope-guard\s*$') {
            $failures.Add('Hermes founder-scope-guard is not enabled')
        }
    }
}

if ($InstalledGuardPath) {
    $canonical = Join-Path $RepoRoot 'project-context/tasks/GOV-COMM-004/hermes-founder-scope-guard/__init__.py'
    $installed = Join-Path $InstalledGuardPath '__init__.py'
    if (-not (Test-Path -LiteralPath $installed)) {
        $failures.Add("Installed guard missing: $installed")
    } elseif ((Get-FileHash -Algorithm SHA256 $canonical).Hash -ne (Get-FileHash -Algorithm SHA256 $installed).Hash) {
        $failures.Add('Installed Hermes guard differs from canonical task source')
    }
}

$guardTests = Join-Path $RepoRoot 'project-context/tasks/GOV-COMM-004/hermes-founder-scope-guard/test_founder_scope_guard.py'
& python $guardTests
if ($LASTEXITCODE -ne 0) { $failures.Add('Hermes founder-scope-guard tests failed') }

if ($failures.Count -gt 0) {
    $failures | ForEach-Object { Write-Error $_ }
    exit 1
}

Write-Output "PASS governance root-fix checks ($($changed.Count) changed files)"
