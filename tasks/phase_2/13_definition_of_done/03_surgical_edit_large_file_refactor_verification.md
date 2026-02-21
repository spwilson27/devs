# Task: Surgical Edit Large-File Refactor Verification Test (Sub-Epic: 13_Definition of Done)

## Covered Requirements
- [9_ROADMAP-DOD-P2], [9_ROADMAP-REQ-022]

## 1. Initial Test Written
- [ ] In `packages/sandbox/src/__tests__/dod/surgical-edit.dod.test.ts`, write a test suite named `"[DoD-P2] Surgical Edit – Large File Refactor"`.
- [ ] Create a fixture file `packages/sandbox/src/__fixtures__/large-file-refactor/source.ts`: a syntactically valid TypeScript file of at least 1000 lines containing a realistic mix of classes, functions, imports, and comments. The file should be pre-generated and committed to the repository (not generated at test runtime).
- [ ] Create a fixture file `packages/sandbox/src/__fixtures__/large-file-refactor/edits.json`: a JSON array of at minimum 20 edit descriptors, each specifying a `{ "type": "replace" | "insert" | "delete", "anchor": string, "oldContent"?: string, "newContent"?: string }`. The edits must be **non-contiguous** (spread across different, non-adjacent regions of the file) and must include at least: 5 variable renames, 5 function signature modifications, 5 comment changes, and 5 import path rewrites.
- [ ] Write a test `"should apply 20+ non-contiguous edits without breaking TypeScript syntax"`:
  - Load `source.ts` and `edits.json`.
  - Apply all edits via `SurgicalEditTool.applyEdits(filePath, edits)`.
  - Run the TypeScript compiler (`tsc --noEmit`) on the resulting file.
  - Assert compiler exit code is `0` (no syntax or type errors).
  - Assert the output file differs from the source at exactly the locations specified by the edits (no collateral mutations).
- [ ] Write a test `"should apply edits atomically – partial failure rolls back all changes"`:
  - Provide an `edits.json` where edit #15 (of 20) references a non-existent anchor.
  - Assert the source file is returned to its original content exactly (byte-for-byte), and `SurgicalEditTool` throws a `SurgicalEditError` with `{ failedEditIndex: 14 }`.
- [ ] Write a test `"should persist DoD result to state.sqlite"`: assert `criterion: "SURGICAL_PRECISION"` row exists with `result: "PASS"` after a successful 20+ edit run.
- [ ] Confirm all tests start **RED**.

## 2. Task Implementation
- [ ] In `packages/sandbox/src/dod/surgical-edit-verifier.ts`, implement and export `class SurgicalEditVerifier`.
  - Constructor accepts a `SurgicalEditTool` instance, a `TypeScriptCompilerService` (thin wrapper around `tsc`), and a `DatabaseService`.
  - Method `run(): Promise<SurgicalEditResult>` that:
    1. Copies `source.ts` fixture to a temp directory.
    2. Loads `edits.json`.
    3. Calls `SurgicalEditTool.applyEdits(tempFilePath, edits)` — this is the production tool, not a mock.
    4. Invokes `TypeScriptCompilerService.check(tempFilePath)` to obtain compiler diagnostics.
    5. Counts applied edits and validates each edit's target region was mutated and no other region changed.
    6. Persists result to `dod_results` with `criterion: "SURGICAL_PRECISION"` and `detail: { editCount, syntaxErrors, collateralMutations }`.
    7. Cleans up temp directory.
    8. Returns `{ pass: syntaxErrors === 0 && editCount >= 20 && collateralMutations === 0, ... }`.
- [ ] Implement `TypeScriptCompilerService` in `packages/sandbox/src/services/typescript-compiler-service.ts` if it does not exist, wrapping `child_process.exec('tsc --noEmit --strict <file>')` and returning `{ exitCode, diagnostics: string[] }`.
- [ ] Generate and commit the `source.ts` and `edits.json` fixtures. The `source.ts` must be a self-contained file with no imports from outside the fixture directory.

## 3. Code Review
- [ ] Verify `SurgicalEditVerifier` operates on a **copy** of the fixture, never mutating the committed source fixture.
- [ ] Verify the rollback test exercises the production rollback path in `SurgicalEditTool`, not a mocked path.
- [ ] Verify `editCount >= 20` is asserted dynamically from the applied edits, not hardcoded.
- [ ] Verify `TypeScriptCompilerService` captures both syntax errors and type errors (both make `tsc --noEmit` exit non-zero).
- [ ] Verify no `ts-morph` or AST manipulation happens inside the verifier — it must treat `SurgicalEditTool` as a black box.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/sandbox test -- --testPathPattern=dod/surgical-edit` and confirm all tests pass (GREEN).
- [ ] Confirm test output prints `Applied 20+ edits. TSC exit code: 0. Collateral mutations: 0`.
- [ ] Confirm `state.sqlite`: `sqlite3 .devs/state.sqlite "SELECT detail FROM dod_results WHERE phase='P2' AND criterion='SURGICAL_PRECISION';"`.

## 5. Update Documentation
- [ ] In `packages/sandbox/.agent.md` under `## DoD Verification`, document `SurgicalEditVerifier`, the fixture format, edit descriptor schema, and the `SURGICAL_PRECISION` criterion.
- [ ] Update `docs/phase_2_dod.md` with row: `| P2 | SURGICAL_PRECISION | 20+ non-contiguous edits, 0 syntax errors | SurgicalEditVerifier | state.sqlite:dod_results |`.
- [ ] Document the rollback guarantee in `packages/sandbox/.agent.md` so future agents know the tool is atomic.

## 6. Automated Verification
- [ ] The script `scripts/verify-dod.sh P2 SURGICAL_PRECISION` must query `state.sqlite` for `phase='P2' AND criterion='SURGICAL_PRECISION' AND result='PASS'` and exit `0` / `1`.
- [ ] The script must also print the `editCount` and `syntaxErrors` from the `detail` JSON for observability.
- [ ] Confirm CI gate is in place before Phase 3 start.
