---
module: packages/core/src/orchestration/StateTransitionGuard.ts
phase: 1
task: "07_audit_trails_glass-box_observability/03_acid_state_transition_logger"
requirements:
  - "[3_MCP-REQ-SYS-002]"
exports:
  classes:
    - StateTransitionGuard
description: |
  Guard middleware ensuring a durable PRE_TOOL_EXECUTION audit entry is
  persisted to the Flight Recorder (SQLite) before a tool implementation is
  invoked. This module provides crash-recovery safety by committing a
  pre-execution checkpoint in an ACID transaction prior to executing external
  side-effecting tool code.
---

# StateTransitionGuard — Module Documentation

## Purpose

Provides a small, dependency-injected middleware that ensures a PRE_TOOL_EXECUTION
agent_log row is durably written to the shared state database before any tool
implementation runs. If the DB write fails, the tool is not executed and the
error is propagated to the caller.

## API

- `class StateTransitionGuard(repo: StateRepository)` — construct with a
  StateRepository implementation.
- `async runWithGuard(toolFn, toolArgs, taskId): Promise<T>` — appends the
  PRE_TOOL_EXECUTION audit row in a transaction and only after successful
  commit invokes `toolFn(...toolArgs)`.

## Guarantees

- Ensures ordering: DB.write() -> Tool.execute().
- Prevents tool invocation on DB write failure.
- Suitable for local SQLite with WAL or synchronous settings to guarantee
  durability for crash-safe recovery.

## Notes

This documentation is intentionally concise; implementation details and test
coverage live in `packages/core/src/orchestration/StateTransitionGuard.ts` and
`packages/core/test/audit/acid_guard.test.ts`.
