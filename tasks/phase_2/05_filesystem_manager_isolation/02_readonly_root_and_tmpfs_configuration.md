# Task: Configure Read-Only Container Root and tmpfs /tmp Mount (Sub-Epic: 05_Filesystem Manager & Isolation)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-SEC-SD-047], [1_PRD-REQ-SEC-003], [8_RISKS-REQ-008]

## 1. Initial Test Written

- [ ] In `packages/sandbox/src/drivers/__tests__/DockerDriver.filesystem.test.ts`, write the following tests:
  - **`buildRunArgs includes --read-only flag`**: Call `DockerDriver.buildRunArgs(config)` with a standard sandbox config. Assert the returned array contains `"--read-only"`.
  - **`buildRunArgs mounts /tmp as tmpfs with noexec,nosuid,nodev`**: Assert the returned args contain `"--tmpfs"` and `"/tmp:rw,noexec,nosuid,nodev,size=256m"` (or equivalent structured form).
  - **`buildRunArgs does NOT mount .git`**: Given `hostProjectPath="/home/user/myproject"`, assert no element in the args array contains `.git`.
  - **`buildRunArgs does NOT mount .devs`**: Assert no element in the args array contains `.devs`.
  - **`buildRunArgs mounts /workspace as the project volume`**: Assert an arg like `"-v"` followed by `"/home/user/myproject:/workspace:ro"` is present (read-only project mount for initial sync; writes happen via FilesystemManager into a writable overlay).
  - **`sandbox does not allow writes to / (integration)`** *(skip in CI if Docker unavailable)*: Spin up the sandbox container and attempt `docker exec <id> touch /exploit`. Assert the command exits with a non-zero code.
  - Write all tests in **red** first.

## 2. Task Implementation

- [ ] In `packages/sandbox/src/drivers/DockerDriver.ts`, implement or update **`buildRunArgs(config: SandboxConfig): string[]`**:
  - Include `"--read-only"` to make the container root filesystem read-only.
  - Include `"--tmpfs", "/tmp:rw,noexec,nosuid,nodev,size=256m"` so agents have a writable but non-executable temp space.
  - Include `"--tmpfs", "/run:rw,noexec,nosuid,nodev,size=64m"` for runtime sockets if needed by the container.
  - Mount the host project directory as **`/workspace`** with the volume flag: `"-v", \`\${config.hostProjectPath}:/workspace\`` — **do NOT** include `.git` or `.devs` sub-paths in any mount.
  - Ensure `.git` and `.devs` are never passed as bind-mount sources: add a guard that throws `Error` if `config.hostProjectPath` ends with `.git` or `.devs`.
- [ ] Define `SandboxConfig` interface (or extend existing) in `packages/sandbox/src/types.ts` to include:
  - `hostProjectPath: string` — absolute path to the host project directory.
  - `workspaceMount: string` — defaults to `"/workspace"`.
  - `tmpfsSize: string` — defaults to `"256m"`.
- [ ] Ensure `DockerDriver` is exported from `packages/sandbox/src/index.ts`.

## 3. Code Review

- [ ] Confirm `--read-only` appears exactly once in `buildRunArgs` output — duplicate flags must not be possible.
- [ ] Confirm `noexec` is set on `/tmp` — agents must not be able to execute binaries from temp space.
- [ ] Confirm no volume mount path contains `.git` or `.devs` — review the mount-building logic for any string interpolation that could inadvertently include them.
- [ ] Verify `SandboxConfig` uses TypeScript strict types — no `any`, no optional `hostProjectPath`.
- [ ] Check that the `buildRunArgs` function is pure (same inputs → same outputs, no side effects).

## 4. Run Automated Tests to Verify

- [ ] Run `pnpm --filter @devs/sandbox test -- --testPathPattern="DockerDriver.filesystem"`.
- [ ] All unit tests must **PASS**. Integration test may be skipped in CI if `DOCKER_AVAILABLE !== "true"`.
- [ ] Run `pnpm --filter @devs/sandbox typecheck` — zero errors.

## 5. Update Documentation

- [ ] Add inline comments to `buildRunArgs` explaining why each security flag is present (e.g., `// --read-only: enforces 5_SECURITY_DESIGN-REQ-SEC-SD-047`).
- [ ] Update `packages/sandbox/README.md` with a "Docker Security Configuration" section listing the flags and their rationale.
- [ ] Update `.devs/memory/phase_2.md`: "DockerDriver: --read-only root + /tmp tmpfs(noexec,nosuid,nodev) enforced. .git/.devs excluded from all volume mounts."

## 6. Automated Verification

- [ ] Run `node -e "const {DockerDriver}=require('./packages/sandbox/dist'); const args=DockerDriver.buildRunArgs({hostProjectPath:'/p'}); console.assert(args.includes('--read-only')); console.assert(args.some(a=>a.includes('noexec'))); console.log('OK')"` — must print `OK`.
- [ ] Run `grep -E "\\.git|\\.devs" packages/sandbox/src/drivers/DockerDriver.ts` — must return **zero matches** (no hardcoded paths to protected dirs in driver source, only the guard check).
- [ ] In CI, set `DOCKER_AVAILABLE=true` and run the integration test to confirm the container rejects writes to `/`.
