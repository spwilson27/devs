# Task: Implement FilesystemManager Core with Exclusion Logic (Sub-Epic: 05_Filesystem Manager & Isolation)

## Covered Requirements
- [TAS-080-1], [REQ-SEC-003], [1_PRD-REQ-SEC-003], [1_PRD-REQ-SEC-009], [8_RISKS-REQ-008]

## 1. Initial Test Written

- [ ] In `packages/sandbox/src/filesystem/__tests__/FilesystemManager.test.ts`, write the following unit tests using Vitest (or Jest):
  - **`sync excludes .git directory`**: Create a mock source tree with a `.git/` subdirectory containing files. Call `FilesystemManager.sync(src, dest)`. Assert that no file under `.git/` is present in `dest`.
  - **`sync excludes .devs directory`**: Same as above but for `.devs/`. Assert that no file under `.devs/` appears in `dest`.
  - **`sync copies all other files`**: Source tree has `src/index.ts`, `package.json`, `.git/HEAD`, `.devs/state.db`. After sync, assert `dest/src/index.ts` and `dest/package.json` exist; assert `dest/.git` and `dest/.devs` do NOT exist.
  - **`sync is idempotent`**: Call `sync` twice on the same src/dest. Assert no error is thrown and file contents are unchanged.
  - **`sync creates destination if absent`**: Supply a non-existent `dest` path. Assert the directory is created and files copied correctly.
  - **`listProtectedPaths returns [".git", ".devs"]`**: Assert the static/constant return value of the exclusion list exactly equals `[".git", ".devs"]`.
  - **`sync throws on non-existent src`**: Assert that calling `sync` with a missing `src` path rejects with a descriptive `Error`.
  - Write all tests in **red** (they must fail before implementation).

## 2. Task Implementation

- [ ] Create `packages/sandbox/src/filesystem/FilesystemManager.ts` exporting a class `FilesystemManager` with:
  - **`static readonly EXCLUDED_PATHS: readonly string[] = [".git", ".devs"]`** — canonical exclusion list.
  - **`async sync(src: string, dest: string): Promise<void>`** — recursively copies `src` into `dest` using Node's `fs/promises` API (or a thin wrapper), skipping any top-level or nested path segment that matches `EXCLUDED_PATHS`. Use `path.basename()` checks at every directory level to guard against deeply nested exclusions (e.g., `workspace/.git`).
  - **`static listProtectedPaths(): readonly string[]`** — returns `EXCLUDED_PATHS`.
  - Implementation must NOT shell out to `cp`, `rsync`, or any external binary; it must use the Node.js `fs` module exclusively to remain portable across Docker and WebContainer environments.
  - Guard: if `src` does not exist, throw `new Error(\`FilesystemManager.sync: source path does not exist: \${src}\`)`.
  - Guard: if `dest` does not exist, create it recursively with `fs.mkdir(dest, { recursive: true })`.
  - Preserve file permissions for each copied file using `fs.copyFile` with `fs.stat`-sourced mode bits.
- [ ] Export `FilesystemManager` from `packages/sandbox/src/index.ts`.
- [ ] Add the module to `packages/sandbox/package.json` exports map if not already present.

## 3. Code Review

- [ ] Verify no `child_process`, `exec`, `spawn`, or shell invocations appear in `FilesystemManager.ts`.
- [ ] Confirm `EXCLUDED_PATHS` is `readonly` and defined as a `const` — it must not be mutable at runtime.
- [ ] Confirm exclusion logic is applied **recursively** (i.e., a directory named `.git` at any depth is skipped, not only at the root).
- [ ] Check that the implementation uses `async/await` throughout and has no unhandled promise rejections.
- [ ] Verify that `FilesystemManager` has no side-effects on import (no global state mutation, no file I/O at module load time).
- [ ] Confirm TypeScript strict mode compatibility: no `any` types, no implicit `any`.

## 4. Run Automated Tests to Verify

- [ ] Run `pnpm --filter @devs/sandbox test` (or equivalent workspace test command).
- [ ] All 7 unit tests defined in Step 1 must report **PASS**.
- [ ] Confirm zero TypeScript compiler errors via `pnpm --filter @devs/sandbox typecheck`.

## 5. Update Documentation

- [ ] Add a JSDoc block to the `FilesystemManager` class describing its purpose, the exclusion contract (`EXCLUDED_PATHS`), and the guarantee that host `.git`/`.devs` directories are never written to or read from within the sandbox.
- [ ] Update `packages/sandbox/README.md` (or create it) with a "FilesystemManager" section documenting the `sync` API and the exclusion list.
- [ ] Update the agent memory file at `.devs/memory/phase_2.md` with a bullet: "FilesystemManager implemented; EXCLUDED_PATHS=['.git','.devs']; sync is Node-fs-only, no shell dependencies."

## 6. Automated Verification

- [ ] Run `pnpm --filter @devs/sandbox test --reporter=json > /tmp/fs_manager_test_results.json` and verify via `jq '.numFailedTests == 0' /tmp/fs_manager_test_results.json` returns `true`.
- [ ] Run `grep -r "\.git\|\.devs" packages/sandbox/src/filesystem/FilesystemManager.ts` to confirm the exclusion strings are present in source (not accidentally deleted).
- [ ] Run a smoke integration: create a temp directory with `.git/HEAD` and `src/main.ts`, invoke `FilesystemManager.sync(tmpSrc, tmpDest)` via a Node script, then assert `tmpDest/.git` does not exist using `fs.access` (expect ENOENT).
