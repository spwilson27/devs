# Task: Initialize `.devs/` Directory with 0700 Permissions (Sub-Epic: 04_Non-Privileged User Context and Filesystem Hardening)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-SEC-SD-011], [5_SECURITY_DESIGN-REQ-SEC-SD-036]

## 1. Initial Test Written
- [ ] Create `src/state/__tests__/directoryInit.test.ts`.
- [ ] Write a unit test that calls `initDevsDirectory('/tmp/test-devs-dir')` on a path that does not yet exist and asserts:
  - The directory is created.
  - `fs.statSync('/tmp/test-devs-dir').mode & 0o777` equals `0o700`.
- [ ] Write a unit test where the directory already exists with permissions `0755` and assert that `initDevsDirectory` throws an error: `"Fatal: .devs/ directory has insecure permissions. Expected 0700, found 0755. Aborting."`.
- [ ] Write a unit test where the directory already exists with correct permissions `0700` and assert that `initDevsDirectory` returns without throwing.
- [ ] Write a unit test for Windows (mock `process.platform === 'win32'`) and assert that `initDevsDirectory` skips the permission check without throwing.
- [ ] All tests must use `jest` with `tmp` paths under `/tmp` or `os.tmpdir()` and clean up after themselves using `afterEach`.

## 2. Task Implementation
- [ ] Create `src/state/directoryInit.ts`.
- [ ] Export `initDevsDirectory(devsDir: string): void`.
- [ ] If `process.platform === 'win32'`, call `fs.mkdirSync(devsDir, { recursive: true })` and return early (Windows does not support octal permissions).
- [ ] Otherwise:
  - If the directory does not exist: call `fs.mkdirSync(devsDir, { recursive: true, mode: 0o700 })`.
  - If the directory exists: read its mode with `fs.statSync(devsDir).mode & 0o777`.
    - If mode !== `0o700`: write error to stderr and call `process.exit(1)` with a message identifying the found vs expected mode.
    - If mode === `0o700`: proceed silently.
- [ ] Add requirement comment: `// [5_SECURITY_DESIGN-REQ-SEC-SD-011]: .devs/ directory initialized with 0700 permissions`.
- [ ] Call `initDevsDirectory` during the orchestrator bootstrap sequence, after `assertNonPrivilegedUser()` but before database initialization.
- [ ] Export from `src/state/index.ts`.

## 3. Code Review
- [ ] Verify `mkdirSync` is called with `mode: 0o700` (not `0o755` or any other mode).
- [ ] Verify the permission check uses bitwise AND with `0o777` to isolate permission bits from file type bits.
- [ ] Confirm Windows code path uses `process.platform === 'win32'` check, not an `os` module import (keep it simple).
- [ ] Confirm the function is synchronous.
- [ ] Confirm the requirement comment is present.
- [ ] Verify no `umask` manipulation is done (rely on explicit `mode` argument to `mkdirSync`).

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern="src/state/__tests__/directoryInit"` and confirm all tests pass.
- [ ] Confirm coverage for `src/state/directoryInit.ts` is 100%.
- [ ] Manually verify on Linux/macOS: `stat -c '%a' /path/to/.devs` outputs `700`.

## 5. Update Documentation
- [ ] Update `docs/security.md` with a section "State Directory Permissions" explaining the 0700 requirement, the startup abort behavior on loose permissions, and instructions for users to fix permissions manually if needed (`chmod 700 ~/.devs`).
- [ ] Add a note in `docs/getting-started.md` warning users not to change `.devs/` permissions.

## 6. Automated Verification
- [ ] Run `npm run validate-all` and confirm exit code 0.
- [ ] Add a shell-level smoke test in `scripts/smoke-test-permissions.sh` that:
  1. Runs `devs init` in a temp workspace.
  2. Runs `stat -c '%a' <workspace>/.devs` and asserts the output is `700`.
  3. Exits with code 0 on success, 1 on failure.
- [ ] Run the smoke test as part of `npm run validate-all` via the `scripts` entry in `package.json`.
