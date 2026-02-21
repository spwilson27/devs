# Task: Implement `TieredMemoryManager` Orchestrator (Sub-Epic: 03_Tiered_Memory_Architecture)

## Covered Requirements
- [TAS-100], [TAS-081], [1_PRD-REQ-GOAL-007], [4_USER_FEATURES-REQ-017]

## 1. Initial Test Written
- [ ] Create `packages/memory/src/__tests__/tiered-memory-manager.test.ts`.
- [ ] Instantiate `TieredMemoryManager` with mock implementations of `IShortTermMemory`, `IMediumTermMemory`, and `ILongTermMemory` (jest mocks).
- [ ] Write unit tests for `TieredMemoryManager` implementing `ITieredMemoryManager`:
  - `shortTerm`, `mediumTerm`, and `longTerm` properties expose the injected instances.
  - `promote(entry, 'medium')` calls `mediumTerm.append(entry)` exactly once and does NOT call `longTerm.upsert`.
  - `promote(entry, 'long')` calls `longTerm.upsert` with a `MemoryDocument` derived from the entry (same `id`, `content`, `tags`), and does NOT call `mediumTerm.append`.
  - `flush()` calls `shortTerm.clear()` exactly once and resolves without error.
  - `flush()` does NOT call `mediumTerm.prune` or `longTerm.delete` (those are separate lifecycle concerns).
  - Calling `promote` with an unknown tier type (`'short'` cast to the union) throws a descriptive `Error`.
- [ ] All tests must fail (red) before implementation.

## 2. Task Implementation
- [ ] Create `packages/memory/src/TieredMemoryManager.ts`:
  - Accept `shortTerm: IShortTermMemory`, `mediumTerm: IMediumTermMemory`, `longTerm: ILongTermMemory` in the constructor and expose them as readonly public properties.
  - Implement `promote(entry: MemoryEntry, tier: 'medium' | 'long'): Promise<void>`:
    - If `tier === 'medium'`: call `this.mediumTerm.append(entry)`.
    - If `tier === 'long'`: call `this.longTerm.upsert({ id: entry.id, content: entry.content, createdAt: entry.createdAt, tags: entry.tags, metadata: entry.metadata })`.
    - Otherwise: throw `new Error(`Unknown memory tier: ${tier}`)`.
  - Implement `flush(): Promise<void>`:
    - Call `this.shortTerm.clear()`.
    - Resolve the returned promise.
  - Annotate the class with `implements ITieredMemoryManager`.
- [ ] Create a factory function `createTieredMemoryManager(config: TieredMemoryConfig): TieredMemoryManager` in the same file:
  - `TieredMemoryConfig` type: `{ sqliteDb: Database; lanceDbPath: string }`.
  - Instantiates `InContextMemory`, `SqliteMediumTermMemory`, `LanceDbLongTermMemory` with the given config and returns a `TieredMemoryManager`.
- [ ] Update `packages/memory/src/index.ts` to export `TieredMemoryManager` and `createTieredMemoryManager`.

## 3. Code Review
- [ ] Verify `TieredMemoryManager` has no direct knowledge of concrete implementations (it works only against the interfaces) — except for the factory function, which is the single composition root.
- [ ] Verify `promote` does not swallow errors from the underlying tier implementations; they must propagate to the caller.
- [ ] Confirm the factory function is the only place where concrete classes are imported; the `TieredMemoryManager` class itself imports only interfaces.
- [ ] Verify `TieredMemoryConfig` is exported from `packages/memory/src/index.ts`.

## 4. Run Automated Tests to Verify
- [ ] Run `npm run test --workspace=packages/memory -- --testPathPattern=tiered-memory-manager`
- [ ] Confirm all tests pass (green).
- [ ] Run `npm run test --workspace=packages/memory` (full suite) and confirm zero failures.
- [ ] Run `npm run build --workspace=packages/memory` and confirm zero TypeScript errors.

## 5. Update Documentation
- [ ] Update `packages/memory/src/memory.agent.md` to add a "TieredMemoryManager" section describing:
  - The role of `TieredMemoryManager` as the single entry point for all memory operations.
  - The `promote` semantics: when to promote to `medium` (end of task) vs `long` (architectural decisions, RCAs).
  - The `flush` semantics: called at task boundaries to clear in-context state.
  - The `createTieredMemoryManager` factory and its required configuration.

## 6. Automated Verification
- [ ] Run `npm run test --workspace=packages/memory --reporter=json` and assert `numFailedTests` is `0` and `numPassedTests` is greater than `0`.
- [ ] Run `npm run build --workspace=packages/memory 2>&1 | grep -c "error TS"` and assert output is `0`.
- [ ] Run `node -e "const m = require('./packages/memory/dist/index.js'); console.log(typeof m.createTieredMemoryManager)"` and assert output is `function`.
