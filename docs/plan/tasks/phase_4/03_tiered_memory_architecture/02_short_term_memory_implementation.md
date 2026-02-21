# Task: Implement Short-Term (In-Context) Memory Layer (Sub-Epic: 03_Tiered_Memory_Architecture)

## Covered Requirements
- [TAS-081], [4_USER_FEATURES-REQ-017]

## 1. Initial Test Written
- [ ] Create `packages/memory/src/__tests__/short-term-memory.test.ts`.
- [ ] Write unit tests for a concrete class `InContextMemory` implementing `IShortTermMemory`:
  - `set` stores a key-value pair and `get` returns it by the same key.
  - `get` returns `undefined` for an unknown key.
  - `clear` removes all stored entries, such that subsequent `get` calls return `undefined`.
  - `snapshot` returns a shallow copy of all current entries as a plain object.
  - Mutating the object returned by `snapshot` does NOT affect the internal store (copy semantics).
  - After `clear`, `snapshot` returns an empty object `{}`.
- [ ] Write a test verifying `InContextMemory` satisfies the `IShortTermMemory` interface (TypeScript assignability check using a typed variable).
- [ ] All tests must fail (red) before implementation.

## 2. Task Implementation
- [ ] Create `packages/memory/src/short-term/InContextMemory.ts`:
  - Use a private `Map<string, unknown>` as the backing store.
  - Implement `get(key: string): unknown` returning `this._store.get(key)`.
  - Implement `set(key: string, value: unknown): void` calling `this._store.set(key, value)`.
  - Implement `clear(): void` calling `this._store.clear()`.
  - Implement `snapshot(): Record<string, unknown>` returning `Object.fromEntries(this._store)`.
  - Export `InContextMemory` as a named export.
- [ ] Add `packages/memory/src/short-term/index.ts` re-exporting `InContextMemory`.
- [ ] Update `packages/memory/src/index.ts` to re-export from `./short-term`.

## 3. Code Review
- [ ] Confirm `snapshot()` returns a new object each call (not the same reference) to ensure copy semantics.
- [ ] Confirm the class has no external dependencies (no imports outside `../interfaces` and `../types`).
- [ ] Confirm the class is not a singleton; callers should be able to instantiate multiple independent instances.
- [ ] Verify the class is annotated with `implements IShortTermMemory`.

## 4. Run Automated Tests to Verify
- [ ] Run `npm run test --workspace=packages/memory -- --testPathPattern=short-term-memory`
- [ ] Confirm all tests pass (green).
- [ ] Run `npm run build --workspace=packages/memory` and confirm zero TypeScript errors.

## 5. Update Documentation
- [ ] Update `packages/memory/src/memory.agent.md` to add a "Short-Term Memory" section describing:
  - `InContextMemory` as the concrete implementation.
  - Its backing store (Map).
  - Its lifecycle: created per-task, cleared at task boundary.
  - The snapshot/copy semantics.

## 6. Automated Verification
- [ ] Run `npm run test --workspace=packages/memory -- --testPathPattern=short-term-memory --reporter=json` and assert `numFailedTests` is `0`.
- [ ] Run `npm run build --workspace=packages/memory 2>&1 | grep -c "error TS"` and assert output is `0`.
