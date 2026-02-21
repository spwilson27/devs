# Task: Define SAOP Envelope Schema and TypeScript Types (Sub-Epic: 02_Trace Streaming and Agent Console Core)

## Covered Requirements
- [TAS-058], [3_MCP-TAS-038], [9_ROADMAP-TAS-703], [1_PRD-REQ-INT-009]

## 1. Initial Test Written

- [ ] In `packages/core/src/streaming/__tests__/saop-schema.test.ts`, write unit tests that validate the SAOP envelope schema:
  - Test that a `ThoughtEnvelope` object with fields `{ type: "thought", taskId: string, agentId: string, sequenceNumber: number, timestamp: string (ISO-8601), payload: { content: string, reasoning_chain?: string[] } }` passes schema validation.
  - Test that an `ActionEnvelope` object with fields `{ type: "action", taskId: string, agentId: string, sequenceNumber: number, timestamp: string, payload: { tool: string, args: Record<string, unknown>, status: "invoking" | "success" | "error" } }` passes schema validation.
  - Test that an `ObservationEnvelope` object with fields `{ type: "observation", taskId: string, agentId: string, sequenceNumber: number, timestamp: string, payload: { content: string, source: string } }` passes schema validation.
  - Test that envelopes with missing required fields (e.g., no `taskId`, no `type`) fail validation and throw a `ZodError` (or equivalent).
  - Test that a union type `SAOPEnvelope = ThoughtEnvelope | ActionEnvelope | ObservationEnvelope` correctly narrows on the `type` discriminant field.
  - Test that serializing a `SAOPEnvelope` to JSON and parsing it back produces an equivalent object (round-trip fidelity).

## 2. Task Implementation

- [ ] Create the file `packages/core/src/streaming/saop-schema.ts`.
- [ ] Install `zod` as a dependency of `@devs/core` if not already present (`npm install zod --workspace=packages/core`).
- [ ] Define and export a `ThoughtEnvelopeSchema` using `z.object()` with fields:
  - `type`: `z.literal("thought")`
  - `taskId`: `z.string().uuid()`
  - `agentId`: `z.string()`
  - `sequenceNumber`: `z.number().int().nonnegative()`
  - `timestamp`: `z.string().datetime()`
  - `payload`: `z.object({ content: z.string(), reasoning_chain: z.array(z.string()).optional() })`
- [ ] Define and export an `ActionEnvelopeSchema` using `z.object()` with fields:
  - `type`: `z.literal("action")`
  - `taskId`: `z.string().uuid()`
  - `agentId`: `z.string()`
  - `sequenceNumber`: `z.number().int().nonnegative()`
  - `timestamp`: `z.string().datetime()`
  - `payload`: `z.object({ tool: z.string(), args: z.record(z.unknown()), status: z.enum(["invoking", "success", "error"]) })`
- [ ] Define and export an `ObservationEnvelopeSchema` using `z.object()` with fields:
  - `type`: `z.literal("observation")`
  - `taskId`: `z.string().uuid()`
  - `agentId`: `z.string()`
  - `sequenceNumber`: `z.number().int().nonnegative()`
  - `timestamp`: `z.string().datetime()`
  - `payload`: `z.object({ content: z.string(), source: z.string() })`
- [ ] Define and export `SAOPEnvelopeSchema = z.discriminatedUnion("type", [ThoughtEnvelopeSchema, ActionEnvelopeSchema, ObservationEnvelopeSchema])`.
- [ ] Export TypeScript inferred types: `export type ThoughtEnvelope = z.infer<typeof ThoughtEnvelopeSchema>`, and similarly for `ActionEnvelope`, `ObservationEnvelope`, and `SAOPEnvelope`.
- [ ] Export a helper function `parseSAOPEnvelope(raw: unknown): SAOPEnvelope` that calls `SAOPEnvelopeSchema.parse(raw)`.
- [ ] Export the schemas from `packages/core/src/index.ts`.

## 3. Code Review

- [ ] Verify the `type` field is used as a proper discriminant (i.e., `z.discriminatedUnion`), not a plain union, enabling O(1) narrowing at runtime.
- [ ] Confirm all timestamp fields use `z.string().datetime()` (ISO-8601) rather than `z.date()`, to ensure JSON-serialization safety.
- [ ] Ensure `reasoning_chain` in the `ThoughtEnvelope` payload is optional, as it may only be present on the final thought of a reasoning chain.
- [ ] Check that `args` in the `ActionEnvelope` payload uses `z.record(z.unknown())` and not `z.any()` to maintain type inference.
- [ ] Verify no circular imports are introduced in `packages/core/src/index.ts`.

## 4. Run Automated Tests to Verify

- [ ] Run `npm test --workspace=packages/core -- --testPathPattern=saop-schema` and confirm all tests pass with zero failures.
- [ ] Run `npm run typecheck --workspace=packages/core` and confirm zero TypeScript errors.

## 5. Update Documentation

- [ ] Create `packages/core/src/streaming/saop-schema.agent.md` documenting:
  - The purpose of SAOP (Structured Agent Output Protocol) envelopes.
  - The three envelope types: Thought, Action, Observation, with their full field definitions.
  - Usage example showing how to call `parseSAOPEnvelope()`.
  - Guidance that all streaming events MUST be wrapped in a `SAOPEnvelope` before transmission.

## 6. Automated Verification

- [ ] Run `npm test --workspace=packages/core -- --testPathPattern=saop-schema --coverage` and assert that line coverage for `saop-schema.ts` is ≥ 95%.
- [ ] Run `npm run build --workspace=packages/core` and confirm the build produces valid `.d.ts` declaration files for all exported types.
- [ ] Assert the `dist/` output of `packages/core` contains `saop-schema.js` and `saop-schema.d.ts`.
