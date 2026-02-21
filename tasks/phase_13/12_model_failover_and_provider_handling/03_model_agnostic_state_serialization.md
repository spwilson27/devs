# Task: Model-Agnostic State Serialization for Provider Handoffs (Sub-Epic: 12_Model Failover and Provider Handling)

## Covered Requirements
- [8_RISKS-REQ-082]

## 1. Initial Test Written
- [ ] In `src/llm/__tests__/HandoffSerializer.test.ts`, write unit tests covering:
  - `HandoffSerializer.serialize(context)` produces a valid Markdown string given a `HandoffContext` object with `threadId`, `taskId`, `reasoningSummary`, `previousProvider`, and `timestamp`.
  - `HandoffSerializer.deserialize(markdown)` correctly parses the Markdown string back into an identical `HandoffContext` object (round-trip fidelity).
  - Serialization of `HandoffContext` with a `reasoningSummary` containing backticks, angle brackets, and other Markdown special characters is escaped correctly and round-trips cleanly.
  - `deserialize` throws `HandoffDeserializationError` with a descriptive message when given invalid or truncated Markdown.
  - `serialize` throws `HandoffSerializationError` if required fields (`threadId`, `taskId`) are missing or undefined.
  - The serialized format includes a version header (`<!-- devs-handoff-v1 -->`) to enable future format migrations.
- [ ] In `src/llm/__tests__/HandoffSerializer.snapshot.test.ts`, write a snapshot test that asserts the serialized Markdown matches a committed `.snap` file for a known `HandoffContext` fixture.

## 2. Task Implementation
- [ ] Create `src/llm/HandoffSerializer.ts`:
  - Define `HandoffContext` interface: `{ threadId: string; taskId: string; reasoningSummary: string; previousProvider: string; timestamp: string; }`.
  - Implement `serialize(context: HandoffContext): string`:
    - Produces structured Markdown with a comment version header `<!-- devs-handoff-v1 -->`.
    - Sections: `## Thread ID`, `## Task ID`, `## Previous Provider`, `## Timestamp`, `## Reasoning Summary` (fenced code block with `text` language tag to avoid Markdown parsing of content).
  - Implement `deserialize(markdown: string): HandoffContext`:
    - Validates the version header is present; throws `HandoffDeserializationError` if absent.
    - Parses each section by regex, extracting values.
    - Validates all required fields are non-empty; throws `HandoffDeserializationError` listing missing fields.
  - Export `HandoffSerializationError` and `HandoffDeserializationError` (typed `Error` subclasses).
- [ ] Create `src/llm/__fixtures__/handoffContext.fixture.ts` exporting a standard `HandoffContext` test fixture object for use across test files.
- [ ] Create `src/llm/__snapshots__/HandoffSerializer.snapshot.test.ts.snap` (auto-generated on first test run — do not hand-author).

## 3. Code Review
- [ ] Verify that `serialize` and `deserialize` are pure functions with no side effects (no filesystem or network calls).
- [ ] Confirm that the version header enables forward-compatibility: a future `deserialize` for `v2` format can check the header and delegate accordingly.
- [ ] Ensure the fenced code block used for `reasoningSummary` prevents injection of Markdown that would corrupt the parsed structure.
- [ ] Check that `HandoffContext` fields are validated for non-empty strings (not just truthy) before serialization.
- [ ] Verify the round-trip invariant: `deserialize(serialize(ctx))` deep-equals `ctx` for any valid `ctx`.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern="src/llm/__tests__/HandoffSerializer"` and confirm all tests pass, including snapshot.
- [ ] Run `npm run lint -- src/llm/` with 0 errors.
- [ ] Run `npm run typecheck` with 0 errors.

## 5. Update Documentation
- [ ] Update `docs/architecture/llm-providers.md` with a "Provider Handoff State Format" section documenting the Markdown schema (sections, version header, field encoding) and the round-trip contract.
- [ ] Add changelog entry: `feat(llm): add HandoffSerializer for model-agnostic context persistence across provider switches`.

## 6. Automated Verification
- [ ] Run `npm test -- --coverage --testPathPattern="src/llm/__tests__/HandoffSerializer" --coverageThreshold='{"global":{"lines":95}}'` and confirm ≥95% line coverage (serialization logic must be fully exercised).
- [ ] Run `npm test -- --testPathPattern="HandoffSerializer.snapshot"` and assert exit code 0, confirming snapshot is committed and unchanged.
