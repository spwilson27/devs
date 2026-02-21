# Task: Implement LRU File Swap-Out Logic for Active File Pin Limit (Sub-Epic: 09_Active_File_Pinning_and_Context_Injection)

## Covered Requirements
- [3_MCP-TAS-048], [RISK-802]

## 1. Initial Test Written
- [ ] Create `packages/memory/src/active-file-pin/__tests__/ActiveFilePinManager.test.ts`.
- [ ] Write a unit test that `ActiveFilePinManager` wraps `ActiveFilePinStore` and enforces a `maxPins` limit (default `5`).
- [ ] Write a test: when `pinFile(path, tokenEstimate)` is called and `getPinCount() < maxPins`, the file is added without eviction and the method returns `{ evicted: null, pinned: ActiveFilePin }`.
- [ ] Write a test: when `pinFile(path, tokenEstimate)` is called and `getPinCount() === maxPins` (limit reached), the file with the **oldest** `pinned_at` timestamp is removed first, then the new file is pinned, and the method returns `{ evicted: ActiveFilePin, pinned: ActiveFilePin }` where `evicted` is the previously oldest pin.
- [ ] Write a test: pinning a file that is **already pinned** (same path) does NOT evict another file; instead it throws `DuplicatePinError` (delegated from the store).
- [ ] Write a test: the eviction event is emitted on an `EventEmitter` as `"pin:evicted"` with payload `{ evicted: ActiveFilePin }`.
- [ ] Write a test: `maxPins` can be configured at construction time (e.g., `new ActiveFilePinManager(store, { maxPins: 3 })`).
- [ ] Write a test validating that `unpinFile` and `listPinnedFiles` delegate directly to the store without modification.
- [ ] Use a `MockActivePinStore` (Jest manual mock) implementing the same interface for isolation.

## 2. Task Implementation
- [ ] Create `packages/memory/src/active-file-pin/ActiveFilePinManager.ts`:
  - Imports `ActiveFilePinStore`, `ActiveFilePin`, `DuplicatePinError` from `./ActiveFilePinStore`.
  - Imports `EventEmitter` from `node:events`.
  - `ActiveFilePinManagerOptions`: `{ maxPins?: number }` (default `5`).
  - `PinResult`: `{ evicted: ActiveFilePin | null; pinned: ActiveFilePin }`.
  - `class ActiveFilePinManager extends EventEmitter`:
    - Constructor: `(store: ActiveFilePinStore, options?: ActiveFilePinManagerOptions)`.
    - `async pinFile(absolutePath: string, tokenEstimate: number): Promise<PinResult>`:
      1. Check `store.getPinCount()`.
      2. If `>= maxPins`: call `store.listPins()[0]` (oldest), call `store.removePin(oldest.absolutePath)`, emit `"pin:evicted"` with `{ evicted: oldest }`.
      3. Call `store.addPin(absolutePath, tokenEstimate)`.
      4. Return `{ evicted, pinned }`.
    - `unpinFile(absolutePath: string): boolean` — delegates to `store.removePin(...)`.
    - `listPinnedFiles(): ActiveFilePin[]` — delegates to `store.listPins()`.
- [ ] Export `ActiveFilePinManager`, `PinResult`, `ActiveFilePinManagerOptions` from `packages/memory/src/active-file-pin/index.ts`.
- [ ] Update the `pin_file` MCP tool handler (`packages/mcp-server/src/tools/active-file-pin/pinFileHandler.ts`) to use `ActiveFilePinManager.pinFile(...)` instead of calling the store directly. Include the `evicted` field in the tool response so the caller knows which file was swapped out.

## 3. Code Review
- [ ] Confirm the swap-out is atomic from the store's perspective: `removePin` is called before `addPin` in all code paths. There must be no state where `count > maxPins`.
- [ ] Confirm the `"pin:evicted"` event is emitted even when the evicted file's token estimate is `0`.
- [ ] Confirm `maxPins` is validated to be a positive integer ≥ 1 in the constructor; throw `RangeError` otherwise.
- [ ] Confirm there is no direct dependency on `fs` or file I/O in `ActiveFilePinManager`; it is purely an orchestration layer over the store.
- [ ] Verify TypeScript strict mode: `pnpm tsc --noEmit` in `packages/memory`.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/memory test -- --testPathPattern="ActiveFilePinManager"` and confirm all tests pass.
- [ ] Confirm ≥ 90% branch coverage on `ActiveFilePinManager.ts`.
- [ ] Run `pnpm --filter @devs/mcp-server test -- --testPathPattern="pinTools"` to ensure the updated handler still passes.

## 5. Update Documentation
- [ ] Update `packages/memory/src/active-file-pin/ActiveFilePinStore.agent.md` to add a new section: **`ActiveFilePinManager`**, describing:
  - The `maxPins` limit and LRU eviction policy.
  - The `"pin:evicted"` event payload.
  - The `PinResult` return shape.
- [ ] Update `packages/mcp-server/src/tools/active-file-pin/pinTools.agent.md` to document the `evicted` field in the `pin_file` response.

## 6. Automated Verification
- [ ] Execute `pnpm --filter @devs/memory test --ci` and `pnpm --filter @devs/mcp-server test --ci`; confirm both exit with code `0`.
- [ ] Run `node scripts/smoke-test-pin-tools.js --scenario=eviction` which pins 6 files sequentially and asserts the first response for file #6 contains `evicted` equal to the path of file #1.
