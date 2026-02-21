# Task: DockerDriver Runtime Security Hardening (Sub-Epic: 03_Docker Driver Implementation)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-SEC-SD-046], [8_RISKS-REQ-006]

## 1. Initial Test Written

- [ ] In `packages/sandbox/src/docker/__tests__/DockerDriverSecurity.spec.ts`, create a spy/mock on `docker.createContainer` to capture the `createContainerOptions` argument.
- [ ] Write a test `provision() passes --cap-drop=ALL in HostConfig.CapDrop` — assert `createContainerOptions.HostConfig.CapDrop` equals `["ALL"]`.
- [ ] Write a test `provision() sets SecurityOpt to no-new-privileges:true` — assert `createContainerOptions.HostConfig.SecurityOpt` contains `"no-new-privileges:true"`.
- [ ] Write a test `provision() sets PidsLimit to 128` — assert `createContainerOptions.HostConfig.PidsLimit === 128`.
- [ ] Write a test `provision() sets Memory limit (4GB) in HostConfig.Memory` — assert `createContainerOptions.HostConfig.Memory === 4 * 1024 * 1024 * 1024`.
- [ ] Write a test `provision() sets NanoCPUs for 2 CPU cores` — assert `createContainerOptions.HostConfig.NanoCPUs === 2 * 1e9`.
- [ ] Write a test `provision() sets ReadonlyRootfs to false but mounts workspace as rw` — assert `HostConfig.ReadonlyRootfs` is not set to `true` (the agent needs to write to `/workspace`), AND the workspace bind is `rw`.
- [ ] Write a test `provision() does not pass --privileged` — assert `createContainerOptions.HostConfig.Privileged` is `false` or `undefined`.
- [ ] Write a test `provision() sets NetworkMode to none by default` — assert `createContainerOptions.HostConfig.NetworkMode === "none"` (network is opt-in per the egress proxy task).
- [ ] Write an integration test `running container cannot gain new privileges` (tagged `@integration`) — run `docker run --security-opt no-new-privileges:true devs-sandbox-base:latest sh -c "cat /proc/self/status | grep NoNewPrivs"` and assert output contains `NoNewPrivs:	1`.

## 2. Task Implementation

- [ ] Open `packages/sandbox/src/docker/DockerDriver.ts` (created in task 02).
- [ ] Extend the `createContainer` call options within `provision()` to include the following `HostConfig` fields:
  ```typescript
  HostConfig: {
    CapDrop: ["ALL"],
    SecurityOpt: ["no-new-privileges:true"],
    PidsLimit: config.pidsLimit ?? 128,
    Memory: config.memoryLimitBytes ?? 4 * 1024 * 1024 * 1024,
    NanoCPUs: (config.cpuCores ?? 2) * 1e9,
    NetworkMode: config.networkMode ?? "none",
    Privileged: false,
    Binds: [`${config.hostProjectPath}:/workspace:rw`],
  }
  ```
- [ ] Add `cpuCores: number` and `networkMode: "none" | "bridge" | string` fields to `DockerDriverConfig` with defaults `2` and `"none"` respectively.
- [ ] Ensure `Privileged: false` is always explicitly set (never left as `undefined`) so accidental flag inheritance is impossible.
- [ ] Add a `validateSecurityConfig(hostConfig: Docker.HostConfig): void` private method that throws `SecurityConfigError` if `CapDrop` does not include `"ALL"`, or if `SecurityOpt` does not include `"no-new-privileges:true"`. Call this before container creation.
- [ ] Define and export `SecurityConfigError` in `packages/sandbox/src/errors.ts`.

## 3. Code Review

- [ ] Verify the full `HostConfig` object is constructed once in a dedicated private method `buildHostConfig(config: DockerDriverConfig): Docker.HostConfig` and is not scattered across multiple call sites.
- [ ] Verify `validateSecurityConfig()` is called unconditionally before `docker.createContainer`, ensuring no code path can skip security validation.
- [ ] Verify `NetworkMode: "none"` is the default — the network egress proxy (a separate sub-epic task) will override this only via an explicit opt-in config value.
- [ ] Confirm `PidsLimit`, `Memory`, and `NanoCPUs` are always set — never `undefined` — by checking that defaults are applied in `buildHostConfig` even when caller omits them.
- [ ] Verify `Privileged: false` is explicitly hard-coded and not derived from config (requirement: [5_SECURITY_DESIGN-REQ-SEC-SD-046] is non-negotiable).

## 4. Run Automated Tests to Verify

- [ ] Run `pnpm --filter @devs/sandbox test` — all tests in `DockerDriverSecurity.spec.ts` must pass with zero failures.
- [ ] Run `pnpm --filter @devs/sandbox test:integration` — the `NoNewPrivs` integration test must pass.
- [ ] Run `pnpm --filter @devs/sandbox build` — TypeScript must compile cleanly.

## 5. Update Documentation

- [ ] Update `packages/sandbox/src/docker/DockerDriver.agent.md` (created in task 02) with a **Security Configuration** section that lists every enforced `HostConfig` flag, its value, and the requirement it satisfies.
- [ ] Add a **Security Invariants** subsection to the agent doc: "The following flags MUST NOT be changed without a security review: `CapDrop`, `SecurityOpt`, `Privileged`."
- [ ] Update `packages/sandbox/README.md` security section to reflect the enforced runtime flags.

## 6. Automated Verification

- [ ] Write a script `packages/sandbox/scripts/verify-security-config.ts` that:
  1. Imports `DockerDriver` and `DockerDriverConfig`.
  2. Instantiates a `DockerDriver` with default config.
  3. Calls the exported `buildHostConfig` (make it `@internal` but testable via direct import) with defaults.
  4. Asserts each required field is set to the mandated value and exits with code 1 printing a diff if any assertion fails.
- [ ] Add `"verify:security": "ts-node scripts/verify-security-config.ts"` to `packages/sandbox/package.json`.
- [ ] CI: run `pnpm --filter @devs/sandbox verify:security` as a required gate step; assert exit code 0.
