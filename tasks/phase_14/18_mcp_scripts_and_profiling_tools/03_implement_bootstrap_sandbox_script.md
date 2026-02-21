# Task: Implement `bootstrap-sandbox` Script for Docker/WebContainer Environment Preparation (Sub-Epic: 18_MCP Scripts and Profiling Tools)

## Covered Requirements
- [2_TAS-REQ-012]

## 1. Initial Test Written

- [ ] Create `scripts/__tests__/bootstrap-sandbox.test.ts` (or `.test.sh` integration tests driven by a Jest shell-exec helper).
- [ ] Write a unit test that mocks `child_process.execSync` (or `execa`) and verifies that when `DEVS_SANDBOX_MODE=docker` env var is set, the script calls `docker build` with the correct `Dockerfile` path (`sandbox/Dockerfile`) and tags the image as `devs-sandbox:latest`.
- [ ] Write a unit test verifying that when `DEVS_SANDBOX_MODE=webcontainer` is set, the script does NOT invoke `docker` and instead calls the WebContainer boot API (mocked) with the project's `package.json` contents.
- [ ] Write a unit test verifying that if Docker is not available on the PATH (mocked `which docker` returns non-zero), the script prints a human-readable error message to stderr and exits with code `1`.
- [ ] Write a unit test verifying that the script creates the `.devs/sandbox/` directory (with `0700` permissions) if it does not already exist, and writes a `sandbox.lock` file with a JSON payload containing `{ startedAt: '<ISO timestamp>', mode: '<docker|webcontainer>' }`.
- [ ] Write an integration test (using a temporary directory as project root) that runs `node scripts/bootstrap-sandbox.js --mode=docker --dry-run` and verifies it exits with code `0` and prints the expected docker commands to stdout without executing them.
- [ ] All tests must fail before implementation (red phase confirmed).

## 2. Task Implementation

- [ ] Create `scripts/bootstrap-sandbox.ts` (compiled to `scripts/bootstrap-sandbox.js` via the build step).
- [ ] Parse CLI arguments using a minimal arg parser (no heavy frameworks; `process.argv` slice is acceptable): support `--mode=<docker|webcontainer>`, `--project-root=<path>` (defaults to `process.cwd()`), and `--dry-run` (boolean flag).
- [ ] Fall back to the `DEVS_SANDBOX_MODE` environment variable if `--mode` is not provided.
- [ ] **Docker path**:
  1. Verify Docker is installed: run `docker info` with `execa` (or `child_process`); on failure, print error and `process.exit(1)`.
  2. Run `docker build -f <projectRoot>/sandbox/Dockerfile -t devs-sandbox:latest <projectRoot>/sandbox/` (skip if `--dry-run`).
  3. Verify image exists post-build: run `docker image inspect devs-sandbox:latest`; on failure, print error and exit `1`.
- [ ] **WebContainer path**:
  1. Read `<projectRoot>/package.json`.
  2. Call the WebContainer boot API (imported from `@webcontainer/api`) with the project files. In dry-run mode, log what would be called without invoking it.
- [ ] After sandbox is prepared, create `.devs/sandbox/` directory (`fs.mkdirSync(..., { recursive: true, mode: 0o700 })`).
- [ ] Write `.devs/sandbox/sandbox.lock` as JSON with `{ startedAt, mode }`.
- [ ] Add `// [2_TAS-REQ-012]` requirement tracing comment at the top of the script.
- [ ] Add `"bootstrap-sandbox": "node scripts/bootstrap-sandbox.js"` to the `scripts` section of `package.json`.

## 3. Code Review

- [ ] Confirm the script handles both `docker` and `webcontainer` modes cleanly with no shared mutable state between paths.
- [ ] Verify `--dry-run` flag prevents all side effects (no actual docker calls, no file writes except logging).
- [ ] Confirm `.devs/sandbox/` is created with `0700` permissions (not `0755`), consistent with `[5_SECURITY_DESIGN-REQ-SEC-SD-011]`.
- [ ] Verify the script imports are compatible with the project's Node.js version target (check `engines` field in `package.json`).
- [ ] Confirm there are no hardcoded absolute paths; all paths are derived from `projectRoot` argument or `process.cwd()`.

## 4. Run Automated Tests to Verify

- [ ] Run `npm test -- --testPathPattern="bootstrap-sandbox"` and confirm all tests pass.
- [ ] Run `npm run build` to ensure the TypeScript compiles without errors.
- [ ] Execute `node scripts/bootstrap-sandbox.js --mode=docker --dry-run` manually (or in CI) and verify output matches expected template.

## 5. Update Documentation

- [ ] Create `scripts/bootstrap-sandbox.agent.md` documenting: purpose, CLI flags, environment variables (`DEVS_SANDBOX_MODE`), exit codes, and the `sandbox.lock` file schema.
- [ ] Update `README.md` (or `docs/scripts.md`) to include a section for `bootstrap-sandbox` with usage examples for both Docker and WebContainer modes.
- [ ] Update `package.json` `devs` section (per `[TAS-006]`) to reference this script under an `scripts.bootstrapSandbox` key.

## 6. Automated Verification

- [ ] Run `npm test -- --testPathPattern="bootstrap-sandbox" --coverage` and verify ≥ 90% line coverage for `scripts/bootstrap-sandbox.ts`.
- [ ] Run `npm run build && node scripts/bootstrap-sandbox.js --mode=docker --dry-run` and verify exit code `0`.
- [ ] Run `npx tsc --noEmit` and verify exit code is `0`.
