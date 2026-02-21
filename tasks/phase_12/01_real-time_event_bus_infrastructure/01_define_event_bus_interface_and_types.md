# Task: Define EventBus Interface, Event Types, and Pub-Sub Core (Sub-Epic: 01_Real-time Event Bus Infrastructure)

## Covered Requirements
- [TAS-038]

## 1. Initial Test Written
- [ ] Create `packages/core/src/event-bus/__tests__/event-bus.test.ts`.
- [ ] Write a unit test verifying that `EventBus` is a singleton: calling `EventBus.getInstance()` twice returns the exact same object reference.
- [ ] Write a unit test that subscribes a mock handler to event type `THOUGHT_STREAM`, publishes a `THOUGHT_STREAM` event, and asserts the handler was called exactly once with the correct payload shape: `{ type: 'THOUGHT_STREAM', agentId: string, chunk: string, timestamp: number }`.
- [ ] Write a unit test for event type `TOOL_LIFECYCLE` verifying payload shape: `{ type: 'TOOL_LIFECYCLE', toolName: string, status: 'start' | 'end' | 'error', timestamp: number, durationMs?: number }`.
- [ ] Write a unit test for event type `STATE_TRANSITION` verifying payload shape: `{ type: 'STATE_TRANSITION', fromNode: string, toNode: string, checkpointId: string, timestamp: number }`.
- [ ] Write a unit test for event type `SYSTEM_HEALTH` verifying payload shape: `{ type: 'SYSTEM_HEALTH', cpuPercent: number, memMb: number, timestamp: number }`.
- [ ] Write a unit test verifying that calling `unsubscribe()` with a subscription token removes the handler: after unsubscribing, publishing a matching event must NOT call the handler.
- [ ] Write a unit test verifying that multiple subscribers on the same event type all receive the published event.
- [ ] Write a unit test verifying that a subscriber to `*` (wildcard) receives all event types.
- [ ] Write a unit test verifying that publishing an unknown or malformed event throws a typed `EventBusValidationError`.
- [ ] All tests must use `vitest` and must NOT import any external network or file-system modules.

## 2. Task Implementation
- [ ] Create the directory `packages/core/src/event-bus/`.
- [ ] Create `packages/core/src/event-bus/types.ts` exporting:
  - A discriminated union type `DevsEvent` covering all event types: `THOUGHT_STREAM`, `TOOL_LIFECYCLE`, `STATE_TRANSITION`, `SYSTEM_HEALTH`, `AGENT_START`, `AGENT_END`, `TASK_START`, `TASK_END`, `HITL_REQUEST`, `HITL_RESPONSE`.
  - Each variant must be a separate `interface` extending a `BaseEvent` base with `{ type: string; timestamp: number; correlationId?: string }`.
  - Export a `EventType` string literal union listing all type discriminants.
- [ ] Create `packages/core/src/event-bus/errors.ts` exporting `EventBusValidationError extends Error` with a `eventType` field.
- [ ] Create `packages/core/src/event-bus/event-bus.ts`:
  - Implement `EventBus` as a singleton class using a private static `instance` field.
  - Internal state: `Map<EventType | '*', Set<Handler>>` where `Handler = (event: DevsEvent) => void`.
  - Method `subscribe(eventType: EventType | '*', handler: Handler): SubscriptionToken` — adds handler to the set, returns an opaque token (a `Symbol`).
  - Method `unsubscribe(token: SubscriptionToken): void` — removes the handler associated with the token.
  - Method `publish(event: DevsEvent): void` — validates event shape via a Zod schema (imported from `./schemas.ts`), then calls all handlers registered for `event.type` and for `'*'`. Throws `EventBusValidationError` on validation failure.
  - Method `clear(): void` — removes all subscriptions (for test teardown only; decorated with `@testOnly` JSDoc tag).
- [ ] Create `packages/core/src/event-bus/schemas.ts` defining a Zod schema (`DevsEventSchema`) that validates the discriminated union. Use `z.discriminatedUnion('type', [...])`.
- [ ] Create `packages/core/src/event-bus/index.ts` re-exporting `EventBus`, `DevsEvent`, `EventType`, `SubscriptionToken`, `EventBusValidationError`.
- [ ] Ensure `packages/core/src/index.ts` re-exports from `./event-bus/index.ts`.

## 3. Code Review
- [ ] Verify the singleton pattern is correct and thread-safe within Node.js's single-threaded model (no lazy-init race conditions in async code paths).
- [ ] Verify `DevsEvent` is a proper discriminated union and TypeScript narrows correctly in all switch/case blocks.
- [ ] Verify Zod schemas are co-located in `schemas.ts` and not duplicated with the TypeScript interfaces — types should be inferred from Zod (`z.infer<typeof ...>`) where practical, or manually kept in sync with a comment reference.
- [ ] Verify no circular imports exist between `types.ts`, `errors.ts`, `schemas.ts`, and `event-bus.ts`.
- [ ] Verify `unsubscribe` does not leak memory: the internal token-to-handler map must be cleaned up.
- [ ] Verify all public methods have JSDoc comments with `@param` and `@returns` annotations.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/core test` and confirm all tests in `event-bus/__tests__/event-bus.test.ts` pass with exit code 0.
- [ ] Run `pnpm --filter @devs/core build` and confirm the TypeScript compilation produces no errors.
- [ ] Run `pnpm --filter @devs/core test --coverage` and verify line coverage for `src/event-bus/` is ≥ 90%.

## 5. Update Documentation
- [ ] Add a section `## Event Bus` to `packages/core/README.md` documenting: the singleton pattern, available event types with their payload shapes, how to subscribe/unsubscribe, and the wildcard `'*'` subscription.
- [ ] Update `docs/architecture/event-bus.md` (create if absent) with a Mermaid class diagram showing `EventBus`, `DevsEvent`, `SubscriptionToken`, and `EventBusValidationError`.
- [ ] Append an entry to `docs/agent-memory/decisions.md`: "Phase 12 / Task 01 — EventBus implemented as singleton in `@devs/core` using discriminated union `DevsEvent` validated by Zod. Wildcard `'*'` subscriptions supported."

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/core test --reporter=json --outputFile=test-results/event-bus.json` and assert the JSON contains `"numFailedTests": 0`.
- [ ] Run `node -e "const {EventBus} = require('./packages/core/dist'); const a = EventBus.getInstance(); const b = EventBus.getInstance(); if(a !== b) process.exit(1); console.log('Singleton OK');"` from the repo root to confirm the compiled singleton works at runtime.
