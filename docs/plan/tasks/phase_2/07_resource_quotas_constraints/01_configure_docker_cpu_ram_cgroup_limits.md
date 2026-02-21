# Task: Configure Docker CPU & RAM Cgroup Resource Limits (Sub-Epic: 07_Resource Quotas & Constraints)

## Covered Requirements
- [TAS-021], [1_PRD-REQ-SEC-004], [8_RISKS-REQ-009], [9_ROADMAP-TAS-207]

## 1. Initial Test Written
- [ ] In `packages/sandbox/src/__tests__/docker-resource-limits.test.ts`, write unit tests for a `buildDockerRunArgs(config: SandboxConfig): string[]` function that:
  - Asserts `--cpus=2` is present in the returned args when `cpuCores: 2` is set in config.
  - Asserts `--memory=4g` is present when `memoryGb: 4` is set.
  - Asserts `--memory-swap=4g` is present (disabling swap) when `memoryGb: 4` is set.
  - Asserts `--pids-limit=512` is present to cap process count.
  - Asserts `--ulimit nofile=1024:1024` is present to restrict file descriptor usage.
  - Asserts that if `cpuCores` or `memoryGb` are not provided, the function throws a `MissingResourceConfigError`.
- [ ] Write an integration test in `packages/sandbox/src/__tests__/docker-driver-limits.integration.test.ts` that:
  - Spins up a real minimal Alpine container via `DockerDriver` with `cpuCores: 2, memoryGb: 4`.
  - Inspects the running container with `docker inspect <container_id>` and asserts `NanoCpus` equals `2000000000` and `Memory` equals `4294967296` (4 × 1024³).
  - Marks this test with a `@integration` tag so it can be skipped in CI environments without Docker.

## 2. Task Implementation
- [ ] In `packages/sandbox/src/drivers/docker-driver.ts`, implement `buildDockerRunArgs(config: SandboxConfig): string[]`:
  - Accept a `SandboxConfig` interface (defined in `packages/sandbox/src/types.ts`) with fields `cpuCores: number`, `memoryGb: number`, `pidLimit?: number`, `nofileLimit?: number`.
  - Return an array of Docker CLI flags: `['--cpus', String(config.cpuCores), '--memory', `${config.memoryGb}g`, '--memory-swap', `${config.memoryGb}g`, '--pids-limit', String(config.pidLimit ?? 512), '--ulimit', 'nofile=1024:1024']`.
  - Throw `MissingResourceConfigError` if `cpuCores` or `memoryGb` are `undefined` or `<= 0`.
- [ ] Update the `DockerDriver.start(config: SandboxConfig)` method to spread `buildDockerRunArgs(config)` into its `docker run` argument array before the image name.
- [ ] Export a `DEFAULT_SANDBOX_CONFIG: SandboxConfig` constant from `packages/sandbox/src/config.ts` with `{ cpuCores: 2, memoryGb: 4, pidLimit: 512, nofileLimit: 1024 }`.
- [ ] Ensure `DockerDriver` uses `DEFAULT_SANDBOX_CONFIG` as the fallback when no config is explicitly passed.

## 3. Code Review
- [ ] Verify that `buildDockerRunArgs` is a pure function with no side effects, importable independently of `DockerDriver`.
- [ ] Confirm `DEFAULT_SANDBOX_CONFIG` values exactly match the spec: 2 vCPUs, 4 GB RAM (`TAS-021`, `8_RISKS-REQ-009`).
- [ ] Ensure `--memory-swap` equals `--memory` (not higher) to completely disable swap.
- [ ] Check that `MissingResourceConfigError` extends a base `SandboxError` class and includes a human-readable message identifying the missing field.
- [ ] Confirm no magic numbers appear in `DockerDriver`; all limits must reference `SandboxConfig` fields or named constants.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/sandbox test -- --testPathPattern="docker-resource-limits"` and confirm all unit tests pass.
- [ ] Run `pnpm --filter @devs/sandbox test -- --testPathPattern="docker-driver-limits.integration" --runInBand` (requires local Docker daemon) and confirm the integration test passes, including the `docker inspect` assertion.

## 5. Update Documentation
- [ ] Add a "Resource Limits" section to `packages/sandbox/README.md` documenting the default CPU/RAM limits, how to override them via `SandboxConfig`, and the reasoning (Cgroup enforcement per `TAS-021`).
- [ ] Update `specs/2_tas.md` agent memory entry for `TAS-021` to mark it as "Implemented" with a reference to `packages/sandbox/src/drivers/docker-driver.ts`.
- [ ] Add an entry in `.agent/decisions.md`: "Docker sandbox resource limits are enforced via `--cpus` and `--memory` flags (not cgroup v2 directly) to maintain compatibility with Docker Desktop on macOS/Windows."

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/sandbox test --coverage` and assert line coverage for `docker-driver.ts` is ≥ 90% as reported in `coverage/lcov-report/index.html`.
- [ ] Run `docker inspect $(docker ps -lq) | jq '.[0].HostConfig | {NanoCpus, Memory}'` after a sandbox is started in the integration test; assert the JSON output matches `{"NanoCpus": 2000000000, "Memory": 4294967296}`.
