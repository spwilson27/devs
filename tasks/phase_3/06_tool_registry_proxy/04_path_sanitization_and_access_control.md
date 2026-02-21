# Task: Path Sanitization & Access Control (Sub-Epic: 06_Tool Registry & Proxy)

## Covered Requirements
- [3_MCP-REQ-SEC-001], [5_SECURITY_DESIGN-REQ-SEC-SD-058]

## 1. Initial Test Written
- [ ] Create `packages/core/src/tool-registry/__tests__/path-sanitizer.test.ts`.
- [ ] Write a unit test that calls `sanitizePath('/project/root', 'src/index.ts')` and asserts it returns the resolved absolute path `/project/root/src/index.ts`.
- [ ] Write a unit test that calls `sanitizePath('/project/root', '../etc/passwd')` and asserts it throws `PathAccessDeniedError` with `code: 'ACCESS_DENIED'`.
- [ ] Write a unit test that calls `sanitizePath('/project/root', '/etc/hosts')` (absolute system path) and asserts it throws `PathAccessDeniedError`.
- [ ] Write a unit test that calls `sanitizePath('/project/root', '../../.ssh/id_rsa')` (multi-level traversal) and asserts `PathAccessDeniedError`.
- [ ] Write a unit test that calls `sanitizePath('/project/root', './src/../src/index.ts')` (normalized safe path) and asserts it succeeds and resolves correctly.
- [ ] Write a unit test that calls `sanitizePath('/project/root', '')` (empty string) and asserts it throws `PathAccessDeniedError`.
- [ ] Write a unit test verifying that every `PathAccessDeniedError` thrown results in an `ACCESS_DENIED` observation being emitted through the audit logger (mock audit logger, assert called).
- [ ] Create `packages/core/src/tool-registry/__tests__/path-middleware.test.ts`.
- [ ] Write an integration test that wraps a `read_file` tool handler with the path sanitization middleware and asserts that a traversal attempt never reaches the handler's file I/O logic (mock the handler and assert it was NOT called).
- [ ] All tests must fail before implementation.

## 2. Task Implementation
- [ ] Create `packages/core/src/tool-registry/PathSanitizer.ts`:
  - `sanitizePath(projectRoot: string, inputPath: string): string`:
    - Reject empty or non-string `inputPath` → throw `PathAccessDeniedError`.
    - Resolve `path.resolve(projectRoot, inputPath)` to an absolute path.
    - Verify the resolved path starts with `projectRoot + path.sep` (or equals `projectRoot`) → if not, throw `PathAccessDeniedError`.
    - Additionally reject paths that equal or start with known system roots (`/etc`, `/proc`, `/sys`, `/dev`, `C:\\Windows`, etc.) even if somehow within a project root edge case.
    - Return the sanitized absolute path.
- [ ] Add `PathAccessDeniedError` to `packages/core/src/tool-registry/errors.ts`:
  - Fields: `attemptedPath: string`, `projectRoot: string`, `code: 'ACCESS_DENIED'`.
  - `message` must include both `attemptedPath` and `projectRoot` for diagnosability.
- [ ] Create `packages/core/src/tool-registry/middleware/pathSanitizationMiddleware.ts`:
  - `withPathSanitization(handler: ToolHandler): ToolHandler` – a higher-order function that:
    1. For each `string` value in `args` that corresponds to a `path`-typed schema field, calls `sanitizePath(context.projectRoot, value)` and replaces the arg with the sanitized path.
    2. On `PathAccessDeniedError`, calls `auditLogger.log({ event: 'ACCESS_DENIED', attemptedPath, projectRoot })` and returns a `ToolResult` with `isError: true, content: [{ type: 'error', text: 'ACCESS_DENIED' }]`.
    3. If sanitization succeeds, calls the original `handler` with the sanitized args.
- [ ] Apply `withPathSanitization` in `createDefaultRegistry()` to wrap the handlers for `read_file`, `write_file`, and `surgical_edit`.
- [ ] Export `PathSanitizer`, `PathAccessDeniedError`, and `withPathSanitization` from `packages/core/src/tool-registry/index.ts`.

## 3. Code Review
- [ ] Verify `sanitizePath` uses `path.resolve` (not string concatenation or `path.join` alone) to handle all traversal variants.
- [ ] Verify the check uses `startsWith(projectRoot + path.sep)` not `startsWith(projectRoot)` to prevent prefix-matching attacks (e.g., `/project/root-evil`).
- [ ] Confirm that a `PathAccessDeniedError` always results in an audit log entry – the middleware must never swallow the error silently.
- [ ] Confirm the middleware returns an `ACCESS_DENIED` `ToolResult` (not throws) so the MCP transport layer can send a structured error response to the agent.
- [ ] Verify system-root rejection list is maintained as a named constant, not inline magic strings.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm test --filter @devs/core -- --testPathPattern "(path-sanitizer|path-middleware)" --ci` – all tests pass.
- [ ] Run `pnpm tsc --noEmit --filter @devs/core` – zero errors.

## 5. Update Documentation
- [ ] Add a "Security: Path Sanitization" section to `docs/architecture/mcp-tool-registry.md` referencing `[3_MCP-REQ-SEC-001]` and describing the `ACCESS_DENIED` observation semantics.
- [ ] Add inline JSDoc to `sanitizePath` explaining the `projectRoot + path.sep` boundary check.
- [ ] Update `memory/phase_3/decisions.md`: "All path-accepting tool handlers are wrapped with withPathSanitization middleware; traversal yields ACCESS_DENIED ToolResult, not an exception."

## 6. Automated Verification
- [ ] CI: `pnpm test --filter @devs/core -- --testPathPattern "(path-sanitizer|path-middleware)" --ci` exits 0.
- [ ] CI: `pnpm tsc --noEmit` exits 0.
- [ ] Run a one-off security scan: `grep -r 'path\.join\|path\.resolve' packages/core/src/tool-registry/PathSanitizer.ts` and confirm only `path.resolve` is used for the boundary check (not raw join).
