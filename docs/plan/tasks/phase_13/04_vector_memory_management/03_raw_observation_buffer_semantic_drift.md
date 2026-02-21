# Task: Implement Raw Observation Buffer to Prevent Semantic Drift (Sub-Epic: 04_Vector Memory Management)

## Covered Requirements
- [3_MCP-RISK-501]

## 1. Initial Test Written
- [ ] Create `src/memory/__tests__/ObservationBuffer.test.ts`.
- [ ] Write a unit test `push_storesObservation_andMaintainsMaxFive` that:
  1. Creates a new `ObservationBuffer` instance.
  2. Pushes 7 raw terminal observations (strings) sequentially.
  3. Asserts that `buffer.getAll()` returns exactly 5 items (the most recent 5).
  4. Asserts that the oldest 2 observations are no longer present.
- [ ] Write a unit test `push_withFewerThanFive_returnsAll` that pushes 3 observations and asserts all 3 are returned by `getAll()`.
- [ ] Write a unit test `getAll_returnsRawUnsummarized_preservesExactContent` that pushes an observation containing special characters and multi-line content, and asserts the returned observation is byte-for-byte identical (no summarization or truncation).
- [ ] Write a unit test `clear_emptiesBuffer` that pushes 5 observations, calls `buffer.clear()`, and asserts `getAll()` returns an empty array.
- [ ] Write a unit test `toContextString_formatsObservationsForInjection` that pushes 3 observations and asserts `toContextString()` returns a string containing each observation verbatim separated by a defined delimiter.
- [ ] Write an integration test `observationBuffer_persistsAcrossAgentTurns` that simulates 3 agent turns, each pushing a terminal output via `AgentContext.recordObservation()`, and asserts the buffer retains the last 5 raw observations after 7 total pushes.

## 2. Task Implementation
- [ ] Create `src/memory/ObservationBuffer.ts`.
- [ ] Implement the `ObservationBuffer` class:
  ```typescript
  export class ObservationBuffer {
    private readonly maxSize: number = 5;
    private buffer: string[] = [];

    push(observation: string): void
    getAll(): readonly string[]
    clear(): void
    toContextString(): string
  }
  ```
- [ ] `push`: Appends the new raw observation string to `buffer`. If `buffer.length > maxSize`, removes the oldest entry (index 0) before appending.
- [ ] `getAll`: Returns a readonly shallow copy of `buffer` (prevent external mutation).
- [ ] `clear`: Sets `buffer` to `[]`.
- [ ] `toContextString`: Returns a formatted string joining all observations with `"\n---OBSERVATION---\n"` as delimiter, suitable for direct injection into an agent prompt context window.
- [ ] Create `src/context/AgentContext.ts` (or update if it exists) to hold a singleton `ObservationBuffer` instance and expose:
  ```typescript
  recordObservation(rawOutput: string): void
  getRecentObservations(): readonly string[]
  ```
- [ ] Wire `AgentContext.recordObservation` to be called every time a tool execution result or terminal output is received by the orchestrator (in `src/orchestrator/ToolExecutor.ts` or equivalent).
- [ ] Export `ObservationBuffer` from `src/memory/index.ts`.

## 3. Code Review
- [ ] Verify the buffer stores raw, unsummarized strings — no truncation, no LLM summarization, no compression.
- [ ] Verify `maxSize` is configurable via constructor parameter (defaulting to 5) to allow testing with smaller buffers.
- [ ] Verify `getAll` returns a copy (not a reference to the internal array) to prevent external mutation of the buffer state.
- [ ] Verify `toContextString` output is deterministic for the same set of observations (no timestamps or random elements injected).
- [ ] Verify `AgentContext` uses a per-session or per-run scoped instance, NOT a global singleton that leaks between test runs.
- [ ] Verify the `ObservationBuffer` has zero external dependencies (no LanceDB, no LLM calls) to keep it fast and side-effect-free.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern="ObservationBuffer"` from the project root.
- [ ] All tests in `src/memory/__tests__/ObservationBuffer.test.ts` must pass with exit code 0.
- [ ] Run the full orchestrator test suite `npm test -- --testPathPattern="src/orchestrator"` to confirm `ToolExecutor` integration does not regress existing tests.
- [ ] Confirm test coverage for `src/memory/ObservationBuffer.ts` is 100% (all branches, lines, functions).

## 5. Update Documentation
- [ ] Create `src/memory/ObservationBuffer.agent.md` documenting:
  - Purpose: Preserves the last 5 raw terminal observations to prevent semantic drift caused by over-summarization.
  - The `maxSize = 5` invariant and why it must not be lowered below 3 in production.
  - How `toContextString()` output is used in the agent prompt context window.
- [ ] Update `docs/agent-guidelines.md` to note that agent prompts MUST always include the `ObservationBuffer.toContextString()` output in their context, and must NOT rely solely on summarized memory for recent tool outputs.
- [ ] Update `docs/architecture/vector-memory.md` with a "Semantic Drift Prevention" subsection.

## 6. Automated Verification
- [ ] Run `npm test -- --testPathPattern="ObservationBuffer" --coverage --coverageReporters=text` and assert 100% coverage on `ObservationBuffer.ts`.
- [ ] Run `grep -rn "recordObservation" src/orchestrator/` and assert at least one call site exists in `ToolExecutor.ts` (or equivalent) confirming the wiring is in place.
- [ ] Run `npm run build` and confirm zero TypeScript compilation errors.
