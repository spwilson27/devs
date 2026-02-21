# Task: Define SAOP Envelope TypeScript Interfaces (Sub-Epic: 95_Requirement_SAOP_Models)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-093]

## 1. Initial Test Written
- [ ] In `packages/ui-hooks/src/__tests__/saop.types.test.ts`, write a suite of type-guard unit tests that validate the SAOP envelope shape. Use `zod` or hand-rolled type-guard functions as the test surface:
  - Test that a minimal valid `SaopEnvelope` object with `type: "THOUGHT"`, a required `agent_id: string`, `sequence_id: number`, `timestamp: string` (ISO-8601), and `payload: ThoughtPayload` passes validation.
  - Test that a minimal valid `SaopEnvelope` with `type: "ACTION"` and `payload: ActionPayload` (including `tool_name: string`, `tool_input: Record<string, unknown>`, and optional `tool_call_id: string`) passes validation.
  - Test that a minimal valid `SaopEnvelope` with `type: "OBSERVATION"` and `payload: ObservationPayload` (including `tool_call_id: string`, `result: unknown`, and `is_error: boolean`) passes validation.
  - Test that an object missing `sequence_id` fails validation.
  - Test that an `ObservationPayload` missing `is_error` fails validation.
  - Test that the discriminated union correctly narrows type based on `type` field.
- [ ] In `packages/ui-hooks/src/__tests__/saop.guards.test.ts`, write tests for each exported type-guard function (`isSaopThought`, `isSaopAction`, `isSaopObservation`, `isSaopEnvelope`) asserting correct boolean returns for both positive and negative cases.

## 2. Task Implementation
- [ ] Create the file `packages/ui-hooks/src/saop.types.ts`. Define and export the following TypeScript types:
  ```ts
  export type SaopMessageType = "THOUGHT" | "ACTION" | "OBSERVATION";

  export interface ThoughtPayload {
    content: string;          // Raw markdown/text of the agent's reasoning
    is_partial: boolean;      // True while streaming, false on completion
  }

  export interface ActionPayload {
    tool_name: string;
    tool_input: Record<string, unknown>;
    tool_call_id?: string;
  }

  export interface ObservationPayload {
    tool_call_id: string;
    result: unknown;
    is_error: boolean;
    error_message?: string;
  }

  export type SaopPayload = ThoughtPayload | ActionPayload | ObservationPayload;

  export interface SaopEnvelope<T extends SaopPayload = SaopPayload> {
    type: SaopMessageType;
    agent_id: string;
    sequence_id: number;      // Monotonically increasing per agent session; used for desync detection
    timestamp: string;        // ISO-8601 UTC
    session_id: string;
    payload: T;
  }

  export type SaopThought = SaopEnvelope<ThoughtPayload> & { type: "THOUGHT" };
  export type SaopAction  = SaopEnvelope<ActionPayload>  & { type: "ACTION" };
  export type SaopObservation = SaopEnvelope<ObservationPayload> & { type: "OBSERVATION" };
  ```
- [ ] Create the file `packages/ui-hooks/src/saop.guards.ts`. Implement and export the following type-guard functions:
  - `isSaopEnvelope(val: unknown): val is SaopEnvelope` — checks for presence of `type`, `agent_id`, `sequence_id`, `timestamp`, `session_id`, `payload`.
  - `isSaopThought(env: SaopEnvelope): env is SaopThought` — checks `env.type === "THOUGHT"`.
  - `isSaopAction(env: SaopEnvelope): env is SaopAction` — checks `env.type === "ACTION"`.
  - `isSaopObservation(env: SaopEnvelope): env is SaopObservation` — checks `env.type === "OBSERVATION"`.
- [ ] Create the file `packages/ui-hooks/src/saop.schema.ts`. Using `zod`, define a `saopEnvelopeSchema` that mirrors the TypeScript types above. Export `parseSaopEnvelope(raw: unknown): SaopEnvelope | null` which returns `null` on parse failure instead of throwing. This schema is used by the stream parser in the next task.
- [ ] Re-export all new symbols from `packages/ui-hooks/src/index.ts`.

## 3. Code Review
- [ ] Verify the discriminated union is exhaustive: adding a new `type` literal to `SaopMessageType` without updating the guards should cause TypeScript to report an error in any `switch` statement over `type`.
- [ ] Verify that `SaopEnvelope<ThoughtPayload>` is not assignable to `SaopEnvelope<ActionPayload>` — i.e., the generic is invariant at the payload level.
- [ ] Confirm that `sequence_id` is typed as `number` (not `string`) and that `timestamp` is `string` (not `Date`), matching the wire format.
- [ ] Confirm the `zod` schema and the TypeScript types are kept in sync — any field present in the type must have a corresponding schema field.
- [ ] Verify all exports are accessible from the `@devs/ui-hooks` package entry point.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/ui-hooks test` and confirm all tests in `saop.types.test.ts` and `saop.guards.test.ts` pass with zero failures.
- [ ] Run `pnpm --filter @devs/ui-hooks typecheck` (or `tsc --noEmit`) and confirm zero TypeScript errors.

## 5. Update Documentation
- [ ] Update `packages/ui-hooks/README.md` (or create it if absent) with a section titled "SAOP Envelope Model" documenting the three message types, their payload shapes, and the `parseSaopEnvelope` utility.
- [ ] Add a JSDoc comment block above each exported interface and type in `saop.types.ts` referencing requirement `[6_UI_UX_ARCH-REQ-093]`.
- [ ] Update the agent memory file `packages/ui-hooks/ui-hooks.agent.md` (creating it if absent) with an entry recording: "SAOP Envelope TypeScript types are the canonical UI model for agent turn data. Source of truth: `saop.types.ts`. Zod schema available in `saop.schema.ts`."

## 6. Automated Verification
- [ ] Execute `pnpm --filter @devs/ui-hooks test --reporter=json > /tmp/saop_types_test_results.json` and verify exit code is `0`.
- [ ] Execute `cat /tmp/saop_types_test_results.json | jq '.numFailedTests'` and assert the value is `0`.
- [ ] Execute `pnpm --filter @devs/ui-hooks typecheck 2>&1 | grep -c "error TS"` and assert the count is `0`.
