# Task: Implement Binary Gate Core (TDD Verification & Deterministic Exit-Code Gates) (Sub-Epic: 07_TAS)

## Covered Requirements
- [TAS-041]

## 1. Initial Test Written
- [ ] In `packages/core/src/sandbox/__tests__/binary-gate.test.ts` write unit tests that assert:
  - `evaluate(exitCode: number | null)` returns `{ status: 'GREEN' }` when `exitCode === 0`.
  - `evaluate(exitCode: number)` returns `{ status: 'RED', exitCode }` for a standard non-zero exit indicating test failure.
  - `evaluate(exitCode: number)` returns `{ status: 'REGRESSION', exitCode }` if `exitCode === 2` (reserved for regression detection) — choose and document the numeric mapping in docs.
  - `evaluate(exitCode: number)` returns `{ status: 'QUALITY', metrics }` if the sandbox runner produces a special quality-check exit code (e.g., 3) or if a `qualityReport` is provided by runner (test the quality path by calling `evaluate(null, { qualityReport })`).
  - `evaluate(null)` (killed/timeout) returns `{ status: 'RED', reason: 'PROCESS_KILLED' }`.
  - Ensure any configurable mapping (e.g., `exitCodeMap`) is covered by parameterized tests.

## 2. Task Implementation
- [ ] Implement `packages/core/src/sandbox/binary-gate.ts` exporting a pure function `evaluate(exitCode: number | null, opts?: { qualityReport?: QualityReport; exitCodeMap?: Record<number,string> }): GateResult` where `GateResult.status` is one of `GREEN|RED|REGRESSION|QUALITY`.
- [ ] Add `// REQ: TAS-041` at the top of `binary-gate.ts`.
- [ ] Implement a small typed `QualityReport` interface that can be passed through the sandbox runner (e.g., `{ score: number; issues: Array<{ path:string, message:string }> }`).
- [ ] Keep `evaluate()` pure (no logging, no IO); all side-effects and stateful escalation handling must live in an orchestrator (separate task).

## 3. Code Review
- [ ] Verify `evaluate()` is pure with complete unit test coverage (no hidden IO or network calls).
- [ ] Confirm the mapping from `exitCode` to `GateResult.status` is documented in `docs/sandbox/binary-gate.md` and is configurable via `exitCodeMap`.
- [ ] Confirm `// REQ: TAS-041` annotation is present.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/core test -- --testPathPattern="binary-gate"` and confirm all tests pass.
- [ ] Run `pnpm --filter @devs/core test` and confirm no regressions.

## 5. Update Documentation
- [ ] Create `docs/sandbox/binary-gate.md` describing the deterministic exit-code gate mapping (include default mapping and instructions for configuration overrides).
- [ ] Add a mermaid state diagram showing `RUN -> GREEN -> ADVANCE`, `RUN -> RED -> RETRY/ESCALATE`, `RUN -> QUALITY -> RUN_QUALITY_CHECKS`.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/core test --coverage` and assert `binary-gate.ts` has ≥ 90% branch coverage.
- [ ] Run `grep -n "REQ: TAS-041" packages/core/src/sandbox/binary-gate.ts` and assert exit code 0.
- [ ] Run `pnpm --filter @devs/core build` to ensure type safety.
