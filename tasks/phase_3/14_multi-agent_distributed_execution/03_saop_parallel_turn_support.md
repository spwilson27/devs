# Task: Extend SAOP Envelope Schema for Parallel Turn Support (Sub-Epic: 14_Multi-Agent & Distributed Execution)

## Covered Requirements
- [UNKNOWN-801]

## 1. Initial Test Written
- [ ] In `packages/core/src/protocol/__tests__/saop-parallel-turn.test.ts`, write the following tests:
  - Test that a `SAOP_ParallelTurnEnvelope` with two independent `agent_turns` (each with their own `agent_id`, `thought`, `action`) passes schema validation without errors.
  - Test that a `SAOP_ParallelTurnEnvelope` with two `agent_turns` sharing the same `agent_id` fails schema validation with a `SaopDuplicateAgentError`.
  - Test that parsing a valid JSON string into `SAOP_ParallelTurnEnvelope` using the `parseSaopParallelTurn` function produces a typed object with correct `agent_turns` length.
  - Test that a `SAOP_ParallelTurnEnvelope` with zero `agent_turns` fails validation with a `SaopEmptyParallelTurnError`.
  - Test that the serialized form of a `SAOP_ParallelTurnEnvelope` (via `serializeSaopParallelTurn`) is valid JSON that round-trips back to an equivalent object.
  - Test backward compatibility: a standard (non-parallel) `SAOP_Envelope` is still accepted by `parseSaopEnvelope` unchanged.

## 2. Task Implementation
- [ ] In `packages/core/src/protocol/saop-schema.ts`, add the `SAOP_ParallelTurnEnvelope` type:
  ```ts
  interface SAOP_AgentTurn {
    agent_id: string;
    turn_index: number;
    thought: string;
    action: SAOP_Action;
    observation?: SAOP_Observation;
  }

  interface SAOP_ParallelTurnEnvelope {
    envelope_type: 'parallel';
    session_id: string;
    parallel_turn_index: number;   // monotonically increasing index for this parallel group
    agent_turns: SAOP_AgentTurn[]; // at least 1, all agent_ids must be unique
  }
  ```
- [ ] Add a `zod` schema (or equivalent validator) for `SAOP_ParallelTurnEnvelope` in `packages/core/src/protocol/saop-validators.ts`:
  - Validate `agent_turns.length >= 1`.
  - Validate uniqueness of `agent_id` across all entries in `agent_turns` (use a `refine` check).
- [ ] Implement `parseSaopParallelTurn(raw: string): SAOP_ParallelTurnEnvelope` in `packages/core/src/protocol/saop-parser.ts` — parse JSON, run the schema validator, throw typed errors on failure.
- [ ] Implement `serializeSaopParallelTurn(envelope: SAOP_ParallelTurnEnvelope): string` — serialize to JSON.
- [ ] Add `SaopDuplicateAgentError` and `SaopEmptyParallelTurnError` to `packages/core/src/protocol/errors.ts`.
- [ ] Export all new types, functions, and errors from `packages/core/src/index.ts`.

## 3. Code Review
- [ ] Confirm the `zod` (or validator) `refine` check for agent_id uniqueness uses a Set-based O(n) approach, not O(n²) nested loops.
- [ ] Verify that `SAOP_ParallelTurnEnvelope` is a discriminated union with the `envelope_type: 'parallel'` literal to allow exhaustive type narrowing alongside the existing `SAOP_Envelope`.
- [ ] Check that `parseSaopParallelTurn` does NOT mutate the input string.
- [ ] Ensure backward compatibility: existing `SAOP_Envelope` tests still pass without modification.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/core test -- --testPathPattern saop-parallel-turn` and confirm all new tests pass.
- [ ] Run the full protocol test suite: `pnpm --filter @devs/core test -- --testPathPattern protocol` and confirm no regressions.

## 5. Update Documentation
- [ ] Update `packages/core/src/protocol/README.md` with a new "Parallel Turn Envelopes" section that describes the `SAOP_ParallelTurnEnvelope` schema, its constraints, and a usage example JSON payload.
- [ ] Add JSDoc to `parseSaopParallelTurn` and `serializeSaopParallelTurn` explaining the validation errors that can be thrown.
- [ ] Update `index.agent.md` to note that SAOP now supports parallel turns and the uniqueness constraint on `agent_id` within a parallel envelope.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/core build` (exit code 0).
- [ ] Run `pnpm --filter @devs/core test` (exit code 0).
- [ ] Run `pnpm --filter @devs/core tsc --noEmit` (exit code 0).
