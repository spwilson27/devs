# Task: Implement Sandbox Escape Detection & Zero-Trust Containerization Hardening (Sub-Epic: 11_Sandbox Security Monitoring & Breach Detection)

## Covered Requirements
- [8_RISKS-REQ-109], [9_ROADMAP-REQ-SEC-004]

## 1. Initial Test Written

- [ ] Create `packages/sandbox/src/monitor/__tests__/EscapeDetector.test.ts`.
- [ ] Write a unit test that verifies `FilesystemEscapeDetector.detectBreach(pid)` returns `{ breached: true, reason: 'FILESYSTEM_ESCAPE' }` when `ProcessStatsProvider.getOpenFiles(pid)` contains any path outside the allowed sandbox root (e.g., `/tmp/sandbox-<id>/`).
- [ ] Write a unit test that verifies `FilesystemEscapeDetector.detectBreach(pid)` returns `{ breached: false }` when all open file handles are within the sandbox root.
- [ ] Write a unit test that verifies `NetworkEscapeDetector.detectBreach(pid)` returns `{ breached: true, reason: 'NETWORK_ESCAPE' }` when `ProcessStatsProvider.getNetworkConnections(pid)` contains a connection to a non-whitelisted external IP.
- [ ] Write a unit test that verifies `NetworkEscapeDetector` allows connections to whitelisted domains (npm registry, pypi, github) and returns `{ breached: false }`.
- [ ] Write a unit test for `NamespaceEscapeDetector` that detects when a process's Linux namespace IDs (from `/proc/<pid>/ns/`) differ from the expected sandbox namespace IDs, returning `{ breached: true, reason: 'NAMESPACE_ESCAPE' }`.
- [ ] Write an integration test that runs a Docker sandbox, attempts to read `/etc/passwd` from the host (bind-mount escape simulation), and asserts `EscapeDetector` triggers a breach and `SandboxMonitor` calls `_handleBreach`.

## 2. Task Implementation

- [ ] Create `packages/sandbox/src/monitor/detectors/FilesystemEscapeDetector.ts` implementing `BreachDetector`:
  - Constructor accepts `{ allowedRoot: string }` (e.g., `/tmp/sandbox-<id>`).
  - `detectBreach(pid)`: calls `ProcessStatsProvider.getOpenFiles(pid)` which returns `string[]` of open file paths. Returns breach if any path does not start with `allowedRoot` and is not in an OS-allowed exceptions list (e.g., `/proc/<pid>/`, `/dev/null`).
- [ ] Extend `ProcessStatsProvider` with:
  - `getOpenFiles(pid: number): Promise<string[]>` — reads `/proc/<pid>/fd/` symlink targets on Linux; uses `lsof -p <pid> -F n` on macOS.
  - `getNetworkConnections(pid: number): Promise<NetworkConnection[]>` — reads `/proc/<pid>/net/tcp` on Linux; uses `lsof -p <pid> -i -F n` on macOS. Returns `{ remoteIp: string; remotePort: number; protocol: 'tcp' | 'udp' }[]`.
  - `getNamespaceIds(pid: number): Promise<Record<string, string>>` — reads symlink targets from `/proc/<pid>/ns/` (Linux only); returns `{ mnt, net, pid, user, uts }` namespace inode IDs.
- [ ] Create `packages/sandbox/src/monitor/detectors/NetworkEscapeDetector.ts` implementing `BreachDetector`:
  - Constructor accepts `{ whitelistedCidrs: string[]; whitelistedDomains: string[] }`.
  - On `detectBreach(pid)`: get connections from `ProcessStatsProvider.getNetworkConnections(pid)`, resolve each remote IP against the whitelist using `ip-cidr` or equivalent pure-TS library. Return breach if any connection is outside the whitelist.
- [ ] Create `packages/sandbox/src/monitor/detectors/NamespaceEscapeDetector.ts` implementing `BreachDetector` (Linux only):
  - Constructor accepts `{ expectedNamespaces: Record<string, string> }` captured at sandbox start.
  - On `detectBreach(pid)`: compare current namespace IDs against expected. Return breach if any namespace ID has changed.
- [ ] Register `FilesystemEscapeDetector`, `NetworkEscapeDetector`, and `NamespaceEscapeDetector` (if `process.platform === 'linux'`) in `SandboxMonitor` alongside the resource exhaustion detectors.
- [ ] Implement `DockerDriver` hardening in `packages/sandbox/src/drivers/DockerDriver.ts`:
  - Pass `--cap-drop=ALL --no-new-privileges --security-opt=no-new-privileges --read-only --tmpfs /tmp:rw,size=512m` flags to `docker run`.
  - Capture the container's initial namespace IDs via `docker exec <id> cat /proc/1/ns/*` after start to seed `NamespaceEscapeDetector`.

## 3. Code Review

- [ ] Verify `FilesystemEscapeDetector` uses a strict prefix check (not `includes`) and normalizes paths to avoid traversal tricks (e.g., `/tmp/sandbox-id/../../../etc/passwd`).
- [ ] Verify `NetworkEscapeDetector` resolves DNS to IPs before whitelisting — checking only domain names is insufficient as the egress proxy already handles this; this detector is a second defense layer checking actual TCP connections.
- [ ] Verify `NamespaceEscapeDetector` is no-op on macOS/Windows (platform guard) and does not throw.
- [ ] Verify `getOpenFiles` excludes `/proc/<pid>/` and `/dev/` entries to avoid false positives from procfs access.
- [ ] Verify that all three detectors are registered only once per `SandboxMonitor` instance (no duplicate registration on restart).

## 4. Run Automated Tests to Verify

- [ ] Run `pnpm --filter @devs/sandbox test -- --testPathPattern="EscapeDetector|NamespaceEscape|NetworkEscape|FilesystemEscape"` and confirm all tests pass.
- [ ] Run `pnpm --filter @devs/sandbox test:integration -- --testPathPattern="escape_detection.integration"` and confirm Docker escape simulation triggers breach correctly.
- [ ] Assert test coverage for `detectors/FilesystemEscapeDetector.ts`, `detectors/NetworkEscapeDetector.ts`, and `detectors/NamespaceEscapeDetector.ts` is ≥ 85%.

## 5. Update Documentation

- [ ] Add a `### Escape Detectors` subsection to `packages/sandbox/README.md` documenting the three detectors, their platform availability, and default configuration.
- [ ] Document the Docker `--cap-drop=ALL --no-new-privileges` flags and their purpose in `packages/sandbox/README.md` under `### DockerDriver Hardening`.
- [ ] Append to `.agent/memory/phase_2_decisions.md`: "Three escape detectors are registered: FilesystemEscapeDetector (path prefix check), NetworkEscapeDetector (CIDR whitelist), NamespaceEscapeDetector (Linux-only, inode comparison). Docker runs with --cap-drop=ALL and --no-new-privileges."

## 6. Automated Verification

- [ ] Run `pnpm --filter @devs/sandbox test -- --coverage --coverageReporters=json-summary` and assert all three detector files have `statements.pct >= 85`.
- [ ] Run `docker run --rm --cap-drop=ALL --no-new-privileges --read-only alpine:3.19 sh -c 'id && cat /proc/1/status'` as a smoke test and assert exit code `0` (container launches successfully with hardened flags).
- [ ] Run `pnpm --filter @devs/sandbox lint` and assert zero lint errors.
