# Task: Verify `.devs/` Directory Permissions on Every Startup (Sub-Epic: 04_Non-Privileged User Context and Filesystem Hardening)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-SEC-SD-011], [5_SECURITY_DESIGN-REQ-SEC-SD-036]

## 1. Initial Test Written
- [ ] Create `src/security/__tests__/startupPermissionGuard.test.ts`.
- [ ] Write a unit test: given a `.devs/` directory with mode `0o755`, `verifyDevsDirectoryPermissions(devsDir)` throws a `PermissionError` with a descriptive message indicating the insecure mode.
- [ ] Write a unit test: given a `.devs/` directory with mode `0o700`, `verifyDevsDirectoryPermissions(devsDir)` returns without throwing.
- [ ] Write a unit test: given a `.devs/` directory that does not exist, `verifyDevsDirectoryPermissions(devsDir)` throws a `PermissionError` indicating the directory is missing.
- [ ] Mock `fs.statSync` using `jest.spyOn` to avoid real filesystem side effects.
- [ ] Write an integration test in `src/security/__tests__/startupPermissionGuard.integration.test.ts`:
  - Create a real temp directory with `0o755`, run `verifyDevsDirectoryPermissions`, assert the process would abort (catch the thrown error and assert it contains the expected message).

## 2. Task Implementation
- [ ] Create `src/security/startupPermissionGuard.ts`.
- [ ] Define and export `class PermissionError extends Error {}`.
- [ ] Export `verifyDevsDirectoryPermissions(devsDir: string): void`.
  - Call `fs.statSync(devsDir)` inside a try/catch; if it throws (ENOENT), throw `new PermissionError(\`Fatal: .devs/ directory not found at ${devsDir}. Run 'devs init' first.\`)`.
  - Compute `const mode = stat.mode & 0o777`.
  - If `mode !== 0o700`, throw `new PermissionError(\`Fatal: .devs/ directory has insecure permissions ${mode.toString(8)}. Expected 0700. Run: chmod 700 ${devsDir}\`)`.
- [ ] Add requirement comment: `// [5_SECURITY_DESIGN-REQ-SEC-SD-011]: Startup permission verification`.
- [ ] In the orchestrator bootstrap, call `verifyDevsDirectoryPermissions` on every startup (not just on init), after `assertNonPrivilegedUser` and after `initDevsDirectory`.
- [ ] Catch `PermissionError` at the top level, write to stderr, and call `process.exit(1)`.

## 3. Code Review
- [ ] Verify the function is synchronous and does not use `async/await`.
- [ ] Confirm `PermissionError` extends `Error` and is exported for use in tests.
- [ ] Verify the error message includes both the found mode (in octal) and the expected mode.
- [ ] Confirm the requirement comment is present.
- [ ] Verify no external dependencies are introduced (use only Node.js `fs` built-in).

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern="src/security/__tests__/startupPermissionGuard"` and confirm all tests pass.
- [ ] Confirm 100% coverage for `src/security/startupPermissionGuard.ts`.

## 5. Update Documentation
- [ ] Update `docs/security.md` to document that permissions are checked on every startup, not just initialization.
- [ ] Add a troubleshooting entry in `docs/troubleshooting.md`: "Error: .devs/ directory has insecure permissions" → instruct users to run `chmod 700 .devs/`.

## 6. Automated Verification
- [ ] Run `npm run validate-all` and confirm exit code 0.
- [ ] Extend the smoke test script `scripts/smoke-test-permissions.sh` to:
  1. Manually change `.devs/` to `0755`.
  2. Re-run `devs` and assert the process exits with a non-zero code and prints the permission error.
