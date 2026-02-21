# Task: Docker Network Bridge Integration for Egress Proxy (Sub-Epic: 06_Network Egress Control)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-SEC-SD-048], [9_ROADMAP-TAS-203], [9_ROADMAP-REQ-SEC-002], [TAS-022], [8_RISKS-REQ-007]

## 1. Initial Test Written

- [ ] Create `packages/sandbox/src/network/DockerNetworkManager.test.ts`.
- [ ] Write a unit test (with `Dockerode` mocked via `jest.mock`): call `DockerNetworkManager.createIsolatedNetwork(sandboxId)`; assert `docker.createNetwork` was called with `{ Driver: "bridge", Internal: true, Name: expect.stringContaining(sandboxId) }`.
- [ ] Write a unit test: call `DockerNetworkManager.removeNetwork(networkId)` and assert `network.remove()` was called.
- [ ] Write a unit test: call `DockerNetworkManager.getProxyContainerOptions(proxyIp, sandboxNetworkId)`; assert the returned Docker container options include `--network sandboxNetworkId`, `HTTP_PROXY=http://<proxyIp>:3128`, `HTTPS_PROXY=http://<proxyIp>:3128`, and `DNS=<proxyIp>` (the proxy also acts as DNS forwarder).
- [ ] Write an integration test (skipped unless `DOCKER_INTEGRATION=true` env var is set): call `createIsolatedNetwork`, verify the network exists via `docker network inspect`, then call `removeNetwork` and verify it is gone.
- [ ] Write an integration test (skip condition same): start a real `EgressProxy` on the host; start a sandbox container connected to the isolated network with `HTTP_PROXY` pointed at the proxy; run `curl -x http://proxy:3128 https://registry.npmjs.org` inside the container; assert exit code `0`. Then run `curl -x http://proxy:3128 https://evil.com`; assert exit code `≠ 0` (proxy blocks).

## 2. Task Implementation

- [ ] Create `packages/sandbox/src/network/DockerNetworkManager.ts`.
- [ ] Implement `DockerNetworkManager` class (static methods acceptable):
  ```ts
  export class DockerNetworkManager {
    static async createIsolatedNetwork(sandboxId: string): Promise<string>; // returns networkId
    static async removeNetwork(networkId: string): Promise<void>;
    static getProxyContainerOptions(proxyIp: string, networkId: string): Partial<ContainerCreateOptions>;
  }
  ```
- [ ] `createIsolatedNetwork` creates a Docker `bridge` network with `Internal: true` (no external routing by default) named `devs-sandbox-{sandboxId}`.
- [ ] `getProxyContainerOptions` returns Docker container create options that:
  - Set `NetworkMode` to `networkId`.
  - Set environment variables `HTTP_PROXY`, `HTTPS_PROXY`, `NO_PROXY` (empty), and `DNS` to the orchestrator's proxy IP.
  - Set `dns` field to `[proxyIp]` so the container uses the proxy/resolver for DNS.
- [ ] Update `DockerDriver.start()` (in `packages/sandbox/src/drivers/DockerDriver.ts`) to:
  1. Call `DockerNetworkManager.createIsolatedNetwork(sandboxId)`.
  2. Merge `getProxyContainerOptions(proxyIp, networkId)` into container create options.
  3. Store `networkId` on the sandbox context for cleanup.
- [ ] Update `DockerDriver.stop()` to call `DockerNetworkManager.removeNetwork(context.networkId)` after container removal.
- [ ] Read `proxyIp` from a new required config field `SandboxConfig.egressProxyIp: string`.

## 3. Code Review

- [ ] Confirm `Internal: true` is set on every created Docker network — verify this prevents direct internet access from the container.
- [ ] Confirm `removeNetwork` is called in all `DockerDriver.stop()` code paths, including on error (use `try/finally`).
- [ ] Confirm `SandboxConfig.egressProxyIp` is validated as a valid IP (regex or `net.isIP`) at config load time; throw `ConfigValidationError` if invalid.
- [ ] Confirm no hardcoded IP addresses exist in source (proxy IP always comes from config).
- [ ] Confirm the integration tests are guarded by `DOCKER_INTEGRATION` env var and do not run in standard CI (to avoid requiring Docker in the unit-test pipeline).

## 4. Run Automated Tests to Verify

- [ ] Run `pnpm --filter @devs/sandbox test --testPathPattern="DockerNetworkManager"`.
- [ ] All unit tests (Dockerode mocked) pass with zero failures.
- [ ] Optionally run integration tests: `DOCKER_INTEGRATION=true pnpm --filter @devs/sandbox test --testPathPattern="DockerNetworkManager.integration"` (requires Docker daemon).

## 5. Update Documentation

- [ ] Update `packages/sandbox/README.md` with a section `### Docker Network Isolation` describing the `Internal: true` bridge, how `HTTP_PROXY`/`DNS` env vars are injected, and the lifecycle (create on start, remove on stop).
- [ ] Update `docs/security/network-egress-policy.md` with a section `### Docker Integration` explaining that all sandbox containers are attached to an `Internal` bridge network with the egress proxy as the only gateway.
- [ ] Add entry to `.agent/memory/phase_2_decisions.md`: `"Docker sandbox containers use Internal bridge network; HTTP_PROXY and DNS env vars point to orchestrator-hosted EgressProxy; no direct internet route exists inside container."`.

## 6. Automated Verification

- [ ] Run `pnpm --filter @devs/sandbox test --coverage --ci` and assert exit code `0`.
- [ ] Run `grep -r "Internal: true" packages/sandbox/src/network/DockerNetworkManager.ts` and assert the string is present.
- [ ] Run `grep -r "removeNetwork" packages/sandbox/src/drivers/DockerDriver.ts` and assert it appears inside a `finally` block (manual code audit step).
