# Task: Enforce Writable Volume Disk Quotas on /workspace Mount (Sub-Epic: 07_Resource Quotas & Constraints)

## Covered Requirements
- [TAS-021], [8_RISKS-REQ-034]

## 1. Initial Test Written
- [ ] In `packages/sandbox/src/__tests__/disk-quota.test.ts`, write unit tests for a `buildVolumeArgs(config: SandboxConfig): string[]` function:
  - Assert that `--storage-opt size=2g` is present in the returned args when `storageLimitGb: 2` is set in config.
  - Assert that `['--mount', 'type=tmpfs,destination=/tmp,tmpfs-size=256m']` is present to cap the `/tmp` tmpfs.
  - Assert that if `storageLimitGb` is not set, a `MissingResourceConfigError` is thrown.
  - Assert that `DEFAULT_SANDBOX_CONFIG.storageLimitGb === 2` (2 GB per `TAS-021`).
- [ ] Write an integration test in `packages/sandbox/src/__tests__/disk-quota.integration.test.ts` that:
  - Starts a `DockerDriver` container with `storageLimitGb: 2`.
  - Runs `df -h /workspace` inside the container and asserts the reported size is ≤ 2 GB.
  - Attempts to write more than 2 GB to `/workspace` (using `dd if=/dev/zero of=/workspace/big.bin bs=1M count=2100`) and asserts it fails with a non-zero exit code or a "No space left on device" error.
  - Mark with `@integration` tag.
- [ ] Write a unit test asserting that `buildDockerRunArgs` (from Task 01) merges `buildVolumeArgs` output when constructing the full argument list.

## 2. Task Implementation
- [ ] In `packages/sandbox/src/drivers/docker-driver.ts`, create `buildVolumeArgs(config: SandboxConfig): string[]`:
  - Return `['--storage-opt', `size=${config.storageLimitGb}g`, '--mount', 'type=tmpfs,destination=/tmp,tmpfs-size=256m']`.
  - Throw `MissingResourceConfigError` if `storageLimitGb` is `undefined` or `<= 0`.
- [ ] Update `SandboxConfig` in `packages/sandbox/src/types.ts` to add `storageLimitGb: number`.
- [ ] Update `DEFAULT_SANDBOX_CONFIG` in `packages/sandbox/src/config.ts` to include `storageLimitGb: 2`.
- [ ] Update `DockerDriver.start()` to include `buildVolumeArgs(config)` in the `docker run` argument array, before the image name, alongside the CPU/RAM args from Task 01.
- [ ] Add a note in `DockerDriver` that `--storage-opt size=Xg` requires the Docker daemon to use the `overlay2` storage driver with `xfs` backing or `devicemapper`; log a warning if the driver is detected as incompatible (check `docker info --format '{{.Driver}}'`).
- [ ] For `WebContainerDriver`, enforce the storage limit by tracking bytes written via the `FilesystemManager.write()` method: maintain a running total; throw `DiskQuotaExceededError` if the total would exceed `storageLimitGb * 1024 ** 3`.

## 3. Code Review
- [ ] Confirm `storageLimitGb` defaults to `2` per `TAS-021` (2 GB storage limit).
- [ ] Verify `--storage-opt size=2g` is only set when the Docker daemon's storage driver supports it; confirm the warning log path for incompatible drivers.
- [ ] Confirm `/tmp` is mounted as `tmpfs` with a size cap (256 MB) to prevent tmp-based disk exhaustion attacks.
- [ ] Verify `WebContainerDriver` quota tracking is applied in `FilesystemManager.write()`, not a separate path, so it cannot be bypassed.
- [ ] Confirm `DiskQuotaExceededError` is exported from `packages/sandbox/src/index.ts`.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/sandbox test -- --testPathPattern="disk-quota"` and confirm all unit tests pass.
- [ ] Run `pnpm --filter @devs/sandbox test -- --testPathPattern="disk-quota.integration" --runInBand` (requires Docker with overlay2/xfs) and confirm the integration test passes.

## 5. Update Documentation
- [ ] Add a "Disk Quotas" section to `packages/sandbox/README.md` documenting:
  - Default 2 GB `/workspace` limit (Docker `--storage-opt size=2g`).
  - 256 MB `/tmp` tmpfs limit.
  - WebContainerDriver in-process byte accounting fallback.
  - Docker daemon storage driver prerequisite (overlay2 on xfs).
- [ ] Update `DEFAULT_SANDBOX_CONFIG` in `packages/sandbox/README.md` config table to include the new `storageLimitGb` column.
- [ ] Update `.agent/decisions.md`: "Docker `--storage-opt size=Xg` is used for workspace disk quotas; a compatibility check at startup warns if the daemon storage driver does not support this flag."

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/sandbox test --coverage` and confirm `docker-driver.ts` line coverage remains ≥ 90% after the addition of `buildVolumeArgs`.
- [ ] Confirm `pnpm --filter @devs/sandbox build` exits with code 0 (no TypeScript compilation errors).
