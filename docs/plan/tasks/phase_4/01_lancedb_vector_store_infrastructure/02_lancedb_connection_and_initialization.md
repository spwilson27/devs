# Task: LanceDB Database Connection and Initialization at `.devs/memory.lancedb` (Sub-Epic: 01_LanceDB_Vector_Store_Infrastructure)

## Covered Requirements
- [2_TAS-REQ-015], [TAS-011]

## 1. Initial Test Written

- [ ] Create `packages/memory/src/__tests__/db-init.test.ts`.
- [ ] Write a test using `vitest` that calls a `connectToVectorStore(dbPath: string)` function and asserts it returns a non-null LanceDB `Connection` object.
- [ ] Write a test that calls `connectToVectorStore` with a temporary path (e.g., `os.tmpdir() + '/test_memory.lancedb'`) and verifies the directory is created on the filesystem after the call.
- [ ] Write a test that calls `connectToVectorStore` twice with the same path and asserts the second call returns without error (idempotent open).
- [ ] Write a test asserting that if `dbPath` is an empty string, the function throws a descriptive `Error` with message containing `"dbPath"`.
- [ ] Write a test that validates the default LanceDB path resolves to `{projectRoot}/.devs/memory.lancedb` when `getDefaultVectorStorePath(projectRoot: string)` is called.
- [ ] Confirm all tests **fail** (Red Phase) before implementation.

## 2. Task Implementation

- [ ] Create `packages/memory/src/db/connection.ts` with the following:
  ```typescript
  import * as lancedb from '@lancedb/lancedb';
  import { mkdir } from 'node:fs/promises';
  import path from 'node:path';

  /** Returns the canonical `.devs/memory.lancedb` path for a given project root. */
  export function getDefaultVectorStorePath(projectRoot: string): string {
    return path.join(projectRoot, '.devs', 'memory.lancedb');
  }

  /** Opens (or creates) a LanceDB database at the given path. */
  export async function connectToVectorStore(dbPath: string): Promise<lancedb.Connection> {
    if (!dbPath || dbPath.trim() === '') {
      throw new Error('dbPath must be a non-empty string');
    }
    // Ensure the parent directory exists before LanceDB tries to open it
    await mkdir(path.dirname(dbPath), { recursive: true });
    return await lancedb.connect(dbPath);
  }
  ```
- [ ] Update `packages/memory/src/index.ts` to export `connectToVectorStore` and `getDefaultVectorStorePath` from `./db/connection.js`.
- [ ] Ensure the `.devs/` directory is added to the project's root `.gitignore` if not already present (it contains runtime state, not source code).

## 3. Code Review

- [ ] Verify `mkdir` uses `{ recursive: true }` so it succeeds even if the path already exists.
- [ ] Verify no global singleton connection is held; each caller receives its own `Connection` and is responsible for managing its lifecycle (avoid connection leaks).
- [ ] Confirm `getDefaultVectorStorePath` uses `path.join` (not string concatenation) for cross-platform compatibility.
- [ ] Confirm the `.devs/` directory is excluded from version control via `.gitignore`.
- [ ] Confirm the exported function names are stable and match the public API surface defined in `index.ts`.

## 4. Run Automated Tests to Verify

- [ ] Run `pnpm --filter @devs/memory test` — all tests in `db-init.test.ts` must pass.
- [ ] Manually verify: run `node -e "import('@devs/memory').then(m => m.connectToVectorStore('/tmp/test.lancedb')).then(() => console.log('OK'))"` and confirm `OK` is printed.

## 5. Update Documentation

- [ ] Add a `## Database Connection` section to `packages/memory/README.md` documenting `connectToVectorStore(dbPath)` and `getDefaultVectorStorePath(projectRoot)` with usage examples.
- [ ] Document in agent memory: "LanceDB is initialized via `connectToVectorStore`. The canonical path is `.devs/memory.lancedb` relative to the project root. The `.devs/` directory must never be committed to git."

## 6. Automated Verification

- [ ] Run `pnpm --filter @devs/memory test --reporter=json > /tmp/db-init-results.json` and assert exit code `0`.
- [ ] Assert that after running tests, no `.lancedb` directories are left in the project source tree (temp dirs used in tests must be cleaned up in `afterEach`/`afterAll` hooks).
- [ ] Run `grep -r '\.devs' .gitignore` from the project root and assert `.devs/` appears in `.gitignore`.
