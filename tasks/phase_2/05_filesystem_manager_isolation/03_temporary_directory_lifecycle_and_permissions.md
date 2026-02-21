# Task: Implement Temporary Directory Lifecycle with 0700 Permissions and Purge-on-Completion (Sub-Epic: 05_Filesystem Manager & Isolation)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-SEC-SD-041], [1_PRD-REQ-SEC-003]

## 1. Initial Test Written

- [ ] In `packages/sandbox/src/filesystem/__tests__/TempDirManager.test.ts`, write the following tests using Vitest:
  - **`create returns a path inside the system temp root`**: Call `TempDirManager.create("agent-xyz")`. Assert the returned path starts with `os.tmpdir()`.
  - **`create directory has 0700 permissions`**: After `create`, call `fs.stat(dir)` and assert `(stat.mode & 0o777) === 0o700`.
  - **`create uses the provided prefix in the directory name`**: Assert the basename of the returned path starts with `"devs-agent-xyz-"` (or configured prefix pattern).
  - **`purge removes the directory and all contents`**: Create the dir, write a file inside it, call `TempDirManager.purge(dir)`. Assert `fs.access(dir)` rejects with `ENOENT`.
  - **`purge is idempotent`**: Call `purge(dir)` twice on the same (already-deleted) path. Assert the second call does NOT throw.
  - **`purgeAll purges all directories created in the current session`**: Call `create` three times, then `purgeAll`. Assert all three paths are gone.
  - **`create does not allow path traversal`**: Call `create("../../etc/passwd")`. Assert it throws `Error` with message containing "invalid prefix".
  - Write all tests in **red** first.

## 2. Task Implementation

- [ ] Create `packages/sandbox/src/filesystem/TempDirManager.ts` exporting a class `TempDirManager`:
  - **`static async create(prefix: string): Promise<string>`**:
    - Validate `prefix` with regex `/^[a-zA-Z0-9_-]+$/`; throw `new Error("invalid prefix: ...")` if it fails.
    - Construct `dirPath = path.join(os.tmpdir(), \`devs-\${prefix}-\${crypto.randomUUID()}\`)`.
    - Call `fs.mkdir(dirPath, { recursive: false, mode: 0o700 })`.
    - Register the path in a module-scoped `Set<string>` (`_createdDirs`) for `purgeAll` tracking.
    - Return `dirPath`.
  - **`static async purge(dirPath: string): Promise<void>`**:
    - Call `fs.rm(dirPath, { recursive: true, force: true })` — `force: true` makes it a no-op if already absent.
    - Remove `dirPath` from `_createdDirs`.
  - **`static async purgeAll(): Promise<void>`**:
    - Iterate `_createdDirs` and call `purge(p)` for each, collecting all errors.
    - After all purges, if any errors occurred, throw an `AggregateError`.
  - **`static listActive(): readonly string[]`**: Returns a snapshot of `_createdDirs` for observability.
- [ ] Register a `process.on("exit", () => { TempDirManager.purgeAll() })` handler in the module so temp dirs are cleaned on normal process exit (best-effort; sync purge with `fs.rmSync` in the exit handler).
- [ ] Export `TempDirManager` from `packages/sandbox/src/index.ts`.

## 3. Code Review

- [ ] Confirm created directories use **exactly** `0700` — not `0755`, not `0750`.
- [ ] Confirm prefix validation rejects path-traversal characters (`/`, `..`, `\`).
- [ ] Confirm `purge` uses `force: true` so a double-purge never throws unexpectedly.
- [ ] Confirm the `_createdDirs` set is module-scoped (not exported) to prevent external mutation.
- [ ] Confirm the `process.on("exit")` handler uses a synchronous `fs.rmSync` fallback since async I/O is not reliable in exit handlers.
- [ ] Verify no `shell: true` or `exec`-based deletion — use Node `fs` APIs only.

## 4. Run Automated Tests to Verify

- [ ] Run `pnpm --filter @devs/sandbox test -- --testPathPattern="TempDirManager"`.
- [ ] All 7 tests must **PASS**.
- [ ] Run `pnpm --filter @devs/sandbox typecheck` — zero errors.

## 5. Update Documentation

- [ ] Add JSDoc to `TempDirManager` class and each static method describing: the `0700` permission contract, the prefix validation rules, and the `purgeAll` lifecycle guarantee.
- [ ] Update `packages/sandbox/README.md` with a "TempDirManager" section covering creation, purge semantics, and the automatic exit-handler cleanup.
- [ ] Update `.devs/memory/phase_2.md`: "TempDirManager implemented; temp dirs created with 0700 permissions; purged on completion and on process exit. Path-traversal guard on prefix."

## 6. Automated Verification

- [ ] Run the following shell verification script after tests pass:
  ```bash
  DIR=$(node -e "
    const {TempDirManager} = require('./packages/sandbox/dist');
    TempDirManager.create('ci-verify').then(d => { process.stdout.write(d); });
  ")
  PERMS=$(stat -c "%a" "$DIR" 2>/dev/null || stat -f "%Lp" "$DIR")
  [ "$PERMS" = "700" ] && echo "PERMISSIONS OK" || (echo "FAIL: got $PERMS"; exit 1)
  node -e "const {TempDirManager}=require('./packages/sandbox/dist'); TempDirManager.purge('$DIR').then(()=>console.log('PURGE OK'))"
  [ ! -d "$DIR" ] && echo "PURGE VERIFIED" || (echo "FAIL: dir still exists"; exit 1)
  ```
- [ ] All three echoes (`PERMISSIONS OK`, `PURGE OK`, `PURGE VERIFIED`) must appear in output with exit code `0`.
