# Task: Implement User-Triggered Strategy Override for Agent Pivot (Sub-Epic: 09_Agent Error and Loop Handling)

## Covered Requirements
- [4_USER_FEATURES-REQ-077]

## 1. Initial Test Written
- [ ] In `src/orchestration/__tests__/strategyOverride.test.ts`, write unit and integration tests:
  - **Override application**: `applyStrategyOverride(taskId, newStrategy, reason)` inserts a row into `strategy_overrides` table (`task_id TEXT, new_strategy TEXT, reason TEXT, applied_at TEXT, applied_by TEXT DEFAULT 'user'`) and updates the task's `current_strategy` field in the `tasks` table.
  - **Override retrieval**: `getActiveOverride(taskId)` returns the most recent override row for the given task, or `null` if none.
  - **Prompt injection**: `getOverrideDirective(taskId)` returns a formatted `SYSTEM: The user has mandated a strategy change: ...` prefix, or an empty string if no active override.
  - **Override clears blacklist for new strategy**: After `applyStrategyOverride`, the new strategy is NOT blocked by `isStrategyBlacklisted` (override takes precedence).
  - **CLI integration**: Mock the CLI command `devs override --task <taskId> --strategy "<text>" --reason "<text>"` and assert it calls `applyStrategyOverride` with the correct arguments and prints a confirmation message.
  - **MCP tool integration**: Mock the MCP tool call `{ tool: "override_strategy", params: { taskId, newStrategy, reason } }` and assert `applyStrategyOverride` is invoked.
- [ ] Write an integration test: a paused agent (`PAUSED_FOR_INTERVENTION`) receives a strategy override via the CLI, resumes, and the new strategy directive appears in the next LLM system prompt.

## 2. Task Implementation
- [ ] Add migration `src/db/migrations/XXXX_add_strategy_overrides.sql`:
  ```sql
  CREATE TABLE IF NOT EXISTS strategy_overrides (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
    task_id TEXT NOT NULL,
    new_strategy TEXT NOT NULL,
    reason TEXT NOT NULL,
    applied_at TEXT NOT NULL DEFAULT (datetime('now')),
    applied_by TEXT NOT NULL DEFAULT 'user'
  );
  CREATE INDEX IF NOT EXISTS idx_strategy_overrides_task ON strategy_overrides(task_id, applied_at DESC);
  ```
- [ ] Create `src/orchestration/strategyOverride.ts`:
  - `applyStrategyOverride(taskId: string, newStrategy: string, reason: string, appliedBy?: string): void` — inserts into `strategy_overrides`; updates `tasks.current_strategy = newStrategy` in the same transaction.
  - `getActiveOverride(taskId: string): StrategyOverride | null` — returns the most recent row by `applied_at`.
  - `getOverrideDirective(taskId: string): string` — returns formatted system prompt prefix if active override exists.
  - Export `StrategyOverride` type: `{ id: string, taskId: string, newStrategy: string, reason: string, appliedAt: string, appliedBy: string }`.
- [ ] In `src/orchestration/orchestrator.ts`:
  - Before building the system prompt for each LLM turn, call `getOverrideDirective(taskId)` and prepend its output.
  - The override directive must appear AFTER the blacklist directive (blacklist says what to avoid; override says what to do instead).
- [ ] In `src/cli/commands/override.ts`, implement the `devs override` CLI command using the existing CLI framework (e.g., Commander.js or Yargs):
  - Arguments: `--task <taskId>`, `--strategy <text>`, `--reason <text>`.
  - On success, print: `✓ Strategy override applied for task <taskId>. The agent will adopt the new strategy on its next turn.`
  - On error (task not found, DB write failure), print an actionable error message and exit with code 1.
- [ ] Register an MCP tool `override_strategy` in `src/mcp/tools/overrideStrategy.ts` with schema:
  ```json
  { "taskId": "string", "newStrategy": "string", "reason": "string" }
  ```
  that calls `applyStrategyOverride` and returns `{ success: true, overrideId: string }`.

## 3. Code Review
- [ ] Verify the override DB write is atomic (single transaction covering both `strategy_overrides` insert and `tasks` update).
- [ ] Confirm the CLI command validates that `taskId` exists before attempting the override (return a clear error if not found).
- [ ] Ensure the MCP tool handler validates all three required fields and returns a structured error for missing/invalid inputs.
- [ ] Confirm the override directive is applied even when the task has an active blacklist — the override MUST win over the blacklist for the specified new strategy.
- [ ] Verify the `getOverrideDirective` output is sanitized (no unescaped user content that could alter prompt structure).

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern=strategyOverride` and confirm all tests pass.
- [ ] Run `npm test -- --coverage --testPathPattern=strategyOverride` and confirm line coverage ≥ 90% for `src/orchestration/strategyOverride.ts`, `src/cli/commands/override.ts`, and `src/mcp/tools/overrideStrategy.ts`.

## 5. Update Documentation
- [ ] Create `src/orchestration/strategyOverride.agent.md`:
  - Intent: allow users (via CLI or MCP) to force an agent to adopt a new implementation strategy mid-task.
  - Edge Cases: task not found, override applied to a completed task, multiple overrides in rapid succession.
  - Testability: fully unit-testable; CLI tested with mocked DB; MCP tool tested with mocked handler.
- [ ] Update `docs/cli-reference.md` with the `devs override` command specification: synopsis, arguments, examples, exit codes.
- [ ] Update `docs/mcp-tools.md` with the `override_strategy` tool schema and usage example.

## 6. Automated Verification
- [ ] Add CI step: `npm test -- --testPathPattern=strategyOverride --ci` must pass.
- [ ] Add a contract test script `scripts/test_strategy_override_contract.ts` that:
  1. Inserts a test task into SQLite.
  2. Calls `applyStrategyOverride`.
  3. Queries `strategy_overrides` and `tasks` and asserts both are updated correctly.
  4. Asserts `getOverrideDirective` returns the expected prompt string.
- [ ] Run `npx ts-node scripts/test_strategy_override_contract.ts` in CI and assert exit code 0.
