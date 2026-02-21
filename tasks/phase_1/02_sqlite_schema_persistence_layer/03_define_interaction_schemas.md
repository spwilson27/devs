# Task: Define Interaction Schemas (Sub-Epic: 02_SQLite Schema & Persistence Layer)

## Covered Requirements
- [TAS-112], [TAS-113]

## 1. Initial Test Written
- [ ] Create a type validation test in `packages/core/test/schemas/interaction.test.ts` that:
    - Validates sample JSON objects against the `TurnEnvelope` schema.
    - Validates sample JSON objects against various `EventPayload` schemas (THOUGHT_STREAM, TOOL_LIFECYCLE, etc.).
    - Ensures that invalid objects are correctly rejected by the validator (e.g., missing mandatory fields in a THOUGHT_STREAM event).

## 2. Task Implementation
- [ ] Define the `TurnEnvelope` interface and Zod schema in `packages/core/src/schemas/turn_envelope.ts`.
    - Include fields: `turn_index`, `agent_id`, `role`, `content` (thought, action, observation), `metadata`.
- [ ] Define the `Event` and `EventPayload` types/schemas in `packages/core/src/schemas/events.ts`.
    - Include event types: `THOUGHT_STREAM`, `TOOL_LIFECYCLE_INVOKED`, `TOOL_LIFECYCLE_COMPLETED`, `TASK_TRANSITION`, `SANDBOX_PULSE`.
    - Define specific payloads for each event type.
- [ ] Export these schemas for use in both persistence and real-time streaming modules.

## 3. Code Review
- [ ] Ensure the `TurnEnvelope` schema is strictly-typed as per [TAS-112].
- [ ] Verify that all specified event types (THOUGHT_STREAM, TOOL_LIFECYCLE, etc.) are covered [TAS-113].
- [ ] Check that the schemas are extensible for future event types.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm test packages/core/test/schemas/interaction.test.ts` and ensure all valid samples pass and invalid samples fail.

## 5. Update Documentation
- [ ] Document the Event types and Turn Envelope structure in `docs/architecture/saop_protocol.md`.

## 6. Automated Verification
- [ ] Use a JSON Schema generation tool or script to export the Zod schemas to standard JSON Schema files and verify they can be used to validate external agent logs.
