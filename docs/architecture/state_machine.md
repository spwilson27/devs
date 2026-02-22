# Project Lifecycle State Machine

This document describes the canonical project lifecycle values and allowed transitions used by the Flight Recorder.

## ProjectStatus (enum)
- INITIALIZING — System setup in progress.
- ACTIVE — Orchestrator loop is running.
- PAUSED — User or system-initiated pause.
- ERROR — Fatal error state requiring intervention.
- COMPLETED — Project delivered (terminal).

## Allowed transitions (summary)
- INITIALIZING -> ACTIVE | ERROR
- ACTIVE -> PAUSED | COMPLETED | ERROR
- PAUSED -> ACTIVE | COMPLETED | ERROR
- ERROR -> PAUSED | ACTIVE | COMPLETED (recoverable states)
- COMPLETED -> (no transitions allowed) — terminal state

## ProjectPhase (enum)
- FOUNDATION — Phases 1-2
- INTELLIGENCE — Phases 3-5
- AUTONOMY — Phases 6-8
- MULTI_MODAL — Phase 7
- VALIDATION — Phase 8

Notes:
- Enum values are persisted as TEXT in the `projects` table (columns `status` and `current_phase`).
- `last_milestone` is stored as TEXT (nullable) to record the last completed milestone identifier.
- Use the `validateTransition(current, next)` helper in `@devs/core/src/types/lifecycle.ts` to validate status changes before persisting them.
