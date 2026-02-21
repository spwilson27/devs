# Task: Build SpecRefreshService — Load and Inject TAS/PRD Blueprints (Sub-Epic: 10_Spec_Refresh_Protocol)

## Covered Requirements
- [3_MCP-TAS-050], [8_RISKS-REQ-011], [5_SECURITY_DESIGN-REQ-SEC-SD-084]

## 1. Initial Test Written
- [ ] In `packages/memory/src/__tests__/specRefreshService.test.ts`, write unit and integration tests:
  - **Unit — `loadBlueprints()`**:
    - Mock the file system (`fs/promises`) with a fake TAS (`fake_tas.md`, ~500 chars) and PRD (`fake_prd.md`, ~500 chars).
    - Assert `loadBlueprints()` returns an object `{ tas: string; prd: string }` containing the full file contents.
    - Assert that calling `loadBlueprints()` a second time returns the same cached values without hitting the filesystem again (spy on `fs.readFile`).
  - **Unit — `buildRefreshBlock()`**:
    - Given known TAS and PRD strings, assert the returned string includes the literal markers `<!-- SPEC_REFRESH_START -->` and `<!-- SPEC_REFRESH_END -->`.
    - Assert the returned string contains both TAS and PRD content verbatim.
    - Assert the returned string includes a `High-Priority Anchor` header and turn number.
  - **Unit — `injectIntoContext()`**:
    - Given a `ContextWindow` mock with a `prepend(block: string): void` method, assert `injectIntoContext(contextWindow, turnNumber)` calls `contextWindow.prepend()` exactly once with the output of `buildRefreshBlock()`.
  - **Integration**: Construct `SpecRefreshService` pointed at a temp directory containing real markdown files. Call `injectIntoContext()` and assert the resulting context string begins with `<!-- SPEC_REFRESH_START -->`.

## 2. Task Implementation
- [ ] Create `packages/memory/src/specRefreshService.ts` exporting a `SpecRefreshService` class:
  - Constructor accepts:
    - `tasPath: string` — absolute path to the TAS document.
    - `prdPath: string` — absolute path to the PRD document.
  - `loadBlueprints(): Promise<{ tas: string; prd: string }>` — reads both files with `fs/promises.readFile('utf-8')`, caches the result in a private `_cache` property, and returns cached values on subsequent calls.
  - `buildRefreshBlock(tas: string, prd: string, turnNumber: number): string` — returns:
    ```
    <!-- SPEC_REFRESH_START -->
    ## High-Priority Anchor (Turn {turnNumber})
    ### Technical Architecture Specification (TAS)
    {tas}
    ### Product Requirements Document (PRD)
    {prd}
    <!-- SPEC_REFRESH_END -->
    ```
  - `injectIntoContext(contextWindow: IContextWindow, turnNumber: number): Promise<void>` — calls `loadBlueprints()`, then calls `contextWindow.prepend(this.buildRefreshBlock(tas, prd, turnNumber))`.
- [ ] Define `IContextWindow` interface in `packages/memory/src/types.ts`:
  ```ts
  export interface IContextWindow {
    prepend(block: string): void;
    getMessages(): ContextMessage[];
  }
  ```
- [ ] Export `SpecRefreshService` and `IContextWindow` from `packages/memory/src/index.ts`.

## 3. Code Review
- [ ] Verify `loadBlueprints()` caching is done using a simple null-check on a private class field (not a Map or external cache) to keep the pattern transparent.
- [ ] Confirm `buildRefreshBlock()` is a pure synchronous function with no I/O side effects.
- [ ] Confirm the injected block is always prepended (not appended) to the context window to ensure it is treated as "High-Priority."
- [ ] Verify no hardcoded file paths exist inside the class — all paths must be injected via the constructor.
- [ ] Confirm all exported types use `interface` not `type` for extensibility by downstream packages.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/memory test -- --testPathPattern=specRefreshService` and confirm all tests pass.
- [ ] Run `pnpm --filter @devs/memory test -- --coverage` and confirm `specRefreshService.ts` has ≥ 95% line coverage.

## 5. Update Documentation
- [ ] Add a `## SpecRefreshService` section to `packages/memory/README.md` describing `loadBlueprints()`, `buildRefreshBlock()`, and `injectIntoContext()` with a usage example.
- [ ] Update `docs/architecture/context-management.md` to describe the `<!-- SPEC_REFRESH_START/END -->` markers and explain how downstream consumers can detect and strip old refresh blocks before prepending a new one.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/memory build` — zero TypeScript errors.
- [ ] Run the integration test in isolation: `pnpm --filter @devs/memory test -- --testNamePattern="SpecRefreshService integration"` — exits 0 with "PASS" output.
- [ ] Grep the compiled output to confirm the literal string `SPEC_REFRESH_START` is present in the build artifact: `grep -r "SPEC_REFRESH_START" packages/memory/dist/ && echo OK`.
