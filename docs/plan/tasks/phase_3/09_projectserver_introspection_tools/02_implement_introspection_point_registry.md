# Task: Implement Introspection Point Registry (Sub-Epic: 09_ProjectServer Introspection Tools)

## Covered Requirements
- [3_MCP-TAS-074], [3_MCP-TAS-066]

## 1. Initial Test Written
- [ ] Create `packages/mcp-server/src/projectserver/__tests__/introspection-registry.test.ts`.
- [ ] Write unit tests for `IntrospectionRegistry`:
  - `register(point: IntrospectionPoint)` — should store the point and be retrievable by `id`.
  - `getAll()` — returns all registered points as a readonly array.
  - `getById(id: string)` — returns the point or `undefined`.
  - `getByKind(kind: IntrospectionPointKind)` — filters points by kind.
  - `snapshot()` — returns a deep-frozen copy of all registered points (mutation of the snapshot must not affect the registry).
  - Registering a duplicate `id` must throw a `DuplicateIntrospectionPointError`.
- [ ] Write an integration test that exercises the `decorateWithIntrospectionPoint` helper (see implementation below):
  - Wrap a dummy function with a `state_snapshot` introspection point.
  - Verify that calling the wrapped function emits a `CustomEvent` (using a `MockEventEmitter`) with the correct `id` and a `payload` matching the function's return value.
- [ ] All tests must fail (RED) before any implementation code is written.

## 2. Task Implementation
- [ ] Create `packages/mcp-server/src/projectserver/registry/IntrospectionRegistry.ts`:
  - Implement `IntrospectionRegistry` as a singleton class (use a module-level singleton exported as `introspectionRegistry`).
  - Internal store: `Map<string, IntrospectionPoint>`.
  - Implement `register`, `getAll`, `getById`, `getByKind`, `snapshot` methods as described in tests.
  - Throw `DuplicateIntrospectionPointError extends Error` when a duplicate `id` is registered.
- [ ] Create `packages/mcp-server/src/projectserver/registry/decorateWithIntrospectionPoint.ts`:
  - Export a higher-order function `decorateWithIntrospectionPoint<T extends (...args: unknown[]) => unknown>(fn: T, point: IntrospectionPoint, emitter: EventEmitter): T`.
  - After each invocation of `fn`, emit an event named `"introspection:snapshot"` with payload `{ id: point.id, label: point.label, result: returnValue, timestamp: Date.now() }`.
  - Handle async functions correctly (await the result before emitting).
- [ ] Create `packages/mcp-server/src/projectserver/registry/index.ts` re-exporting both.
- [ ] The `IntrospectionRegistry` must auto-register any point passed to `decorateWithIntrospectionPoint` if it has not been registered already (do not throw on auto-registration; only throw on explicit duplicate `register` calls).

## 3. Code Review
- [ ] Verify the singleton is exported as a named constant, not exposed via a static `getInstance()` method (prefer module-level singleton pattern).
- [ ] Verify `snapshot()` returns a deeply frozen object — use `Object.freeze` recursively or `structuredClone` + freeze.
- [ ] Verify `decorateWithIntrospectionPoint` preserves the original function's return type in TypeScript without casting to `any`.
- [ ] Verify the emitter contract is injected (dependency injection), not hardcoded, so it is testable.
- [ ] Verify no side-effects occur on import (the registry map starts empty).

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/mcp-server test -- --testPathPattern="introspection-registry"` and confirm all tests pass (GREEN).
- [ ] Run `pnpm --filter @devs/mcp-server tsc --noEmit`.

## 5. Update Documentation
- [ ] Create `packages/mcp-server/src/projectserver/registry/index.agent.md`:
  - Describe the registry pattern and why a module-level singleton is used.
  - Provide a code example showing how to wrap a function with `decorateWithIntrospectionPoint`.
  - List requirement IDs: `3_MCP-TAS-074`, `3_MCP-TAS-066`.
- [ ] Update `packages/mcp-server/src/projectserver/types/index.agent.md` to cross-link the registry.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/mcp-server test -- --ci --testPathPattern="introspection-registry"` and assert exit code `0`.
- [ ] Run `node -e "const {introspectionRegistry} = require('./packages/mcp-server/dist/projectserver/registry'); console.assert(typeof introspectionRegistry.getAll === 'function')"` (after build) and assert exit code `0`.
