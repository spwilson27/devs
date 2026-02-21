# Task: Implement Multi-Container ProjectServer Registry (Sub-Epic: 14_Multi-Agent & Distributed Execution)

## Covered Requirements
- [3_MCP-UNKNOWN-201]

## 1. Initial Test Written
- [ ] In `packages/core/src/orchestration/__tests__/project-server-registry.test.ts`, write the following tests:
  - Test that `ProjectServerRegistry.register(serviceId, endpoint)` stores a `ProjectServerRecord` and `getByServiceId(serviceId)` returns it.
  - Test that registering the same `serviceId` twice throws a `DuplicateServiceError`.
  - Test that `deregister(serviceId)` removes the record and subsequent `getByServiceId` returns `undefined`.
  - Test that `listAll()` returns all currently registered servers as a `ProjectServerRecord[]`.
  - Test that `getByServiceId` for an unknown `serviceId` returns `undefined` (not throws).
  - Test that a `ProjectServerRecord` contains the fields: `serviceId: string`, `endpoint: string`, `status: 'healthy' | 'unhealthy' | 'unknown'`, `registeredAt: Date`.
  - Test that `healthCheck(serviceId)` calls the endpoint's `/health` route (mock with `nock` or `msw`) and updates the record's `status` to `'healthy'` on HTTP 200 or `'unhealthy'` on non-200/timeout.

## 2. Task Implementation
- [ ] Create `packages/core/src/orchestration/project-server-registry.ts`:
  - Define `ProjectServerRecord` interface: `{ serviceId: string; endpoint: string; status: 'healthy' | 'unhealthy' | 'unknown'; registeredAt: Date }`.
  - Implement `ProjectServerRegistry` class:
    - Internal `Map<string, ProjectServerRecord>` for storage.
    - `register(serviceId: string, endpoint: string): ProjectServerRecord` — validates `serviceId` not already registered; throws `DuplicateServiceError`; stores and returns the record with `status: 'unknown'`.
    - `deregister(serviceId: string): void` — removes the entry (no-op if not found).
    - `getByServiceId(serviceId: string): ProjectServerRecord | undefined`.
    - `listAll(): ProjectServerRecord[]`.
    - `healthCheck(serviceId: string): Promise<void>` — issues an HTTP GET to `${endpoint}/health` with a 5-second timeout; updates `status` to `'healthy'` on HTTP 200, `'unhealthy'` otherwise.
- [ ] Add `DuplicateServiceError` to `packages/core/src/orchestration/errors.ts`.
- [ ] Export `ProjectServerRegistry`, `ProjectServerRecord`, and `DuplicateServiceError` from `packages/core/src/index.ts`.

## 3. Code Review
- [ ] Confirm `healthCheck` uses a standard `AbortController` with a 5-second timeout to avoid hanging requests.
- [ ] Verify `register` performs a synchronous uniqueness check (not async) since the in-memory Map is single-threaded in Node.js.
- [ ] Ensure the `endpoint` string is validated as a valid URL (throw `InvalidEndpointError` for malformed values).
- [ ] Check that `listAll()` returns a shallow copy of the records array, not the internal Map's live values, to prevent external mutation.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/core test -- --testPathPattern project-server-registry` and confirm all tests pass.
- [ ] Run with coverage: `pnpm --filter @devs/core test -- --coverage --testPathPattern project-server-registry` and confirm ≥ 90% line coverage for `project-server-registry.ts`.

## 5. Update Documentation
- [ ] Create `packages/core/src/orchestration/README.md` (or append to existing) with a "Multi-Container ProjectServer Registry" section explaining:
  - The purpose of the registry in a microservices project (one `ProjectServer` per service).
  - How to register/deregister servers.
  - The `healthCheck` polling expectation.
- [ ] Update `index.agent.md` noting that MCP tool calls in multi-container projects must route through the registry to locate the correct `ProjectServer`.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/core build` (exit code 0).
- [ ] Run `pnpm --filter @devs/core test` (exit code 0).
- [ ] Run `pnpm --filter @devs/core tsc --noEmit` (exit code 0).
