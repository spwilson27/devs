# Task: Harden Individual Database File Permissions to 0600 (Sub-Epic: 04_Non-Privileged User Context and Filesystem Hardening)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-SEC-SD-036]

## 1. Initial Test Written
- [ ] Create `src/state/__tests__/dbFilePermissions.test.ts`.
- [ ] Write a unit test: after calling `hardenDbFilePermissions(dbFilePath)`, assert `fs.statSync(dbFilePath).mode & 0o777 === 0o600`.
- [ ] Write a unit test: calling `hardenDbFilePermissions` on a non-existent path throws a descriptive error: `"Fatal: DB file not found: <path>"`.
- [ ] Write a unit test: calling `hardenDbFilePermissions` on a file that already has `0o600` permissions succeeds without error.
- [ ] Write a unit test: verify `verifyDbFilePermissions(dbFilePath)` throws a `PermissionError` when the file has mode `0o644`.
- [ ] Write a unit test: verify `verifyDbFilePermissions(dbFilePath)` returns without error when the file has mode `0o600`.
- [ ] Tests must create real temp files using `fs.writeFileSync` in `os.tmpdir()` and clean up in `afterEach`.

## 2. Task Implementation
- [ ] Create `src/state/dbFilePermissions.ts`.
- [ ] Export `hardenDbFilePermissions(filePath: string): void`:
  - Verify the file exists via `fs.statSync`; throw if not found.
  - Call `fs.chmodSync(filePath, 0o600)`.
  - Add comment: `// [5_SECURITY_DESIGN-REQ-SEC-SD-036]: DB files must have 0600 permissions`.
- [ ] Export `verifyDbFilePermissions(filePath: string): void`:
  - Call `fs.statSync(filePath)` to get the mode.
  - Compute `mode = stat.mode & 0o777`.
  - If `mode !== 0o600`, throw `new PermissionError(...)` imported from `src/security/startupPermissionGuard.ts`.
- [ ] Identify all database files managed by the orchestrator (e.g., `state.db`, `agent_logs.db`, `lancedb/` vector store files) and call `hardenDbFilePermissions` immediately after creating or opening each file.
- [ ] Call `verifyDbFilePermissions` for each known DB file during startup verification (alongside the directory check).
- [ ] Export from `src/state/index.ts`.

## 3. Code Review
- [ ] Verify `fs.chmodSync` is called with `0o600`, not `0o640` or any other mode.
- [ ] Confirm `hardenDbFilePermissions` and `verifyDbFilePermissions` are separate, single-responsibility functions.
- [ ] Verify `PermissionError` is reused from `src/security/startupPermissionGuard.ts`, not redefined.
- [ ] Confirm the requirement comment `// [5_SECURITY_DESIGN-REQ-SEC-SD-036]` is present on the relevant line.
- [ ] Check that the LanceDB directory itself (if a directory) gets `0700` via `initDevsDirectory`, while its constituent files get `0600` via this module.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern="src/state/__tests__/dbFilePermissions"` and confirm all tests pass.
- [ ] Confirm 100% coverage for `src/state/dbFilePermissions.ts`.
- [ ] Run the full test suite `npm test` and confirm no regressions.

## 5. Update Documentation
- [ ] Update `docs/security.md` with a subsection "Database File Permissions" listing which files are hardened to `0600` and when the hardening occurs.
- [ ] Update the ADR `ADR-SEC-001-non-privileged-user.md` to include the `0600` DB file hardening decision.

## 6. Automated Verification
- [ ] Extend `scripts/smoke-test-permissions.sh` to:
  1. Run `devs init` in a temp workspace.
  2. For each expected DB file (e.g., `state.db`, `agent_logs.db`), run `stat -c '%a' <file>` and assert output is `600`.
  3. Exit with code 0 on success.
- [ ] Run `npm run validate-all` and confirm exit code 0.
