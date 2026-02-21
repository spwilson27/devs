# Task: End-to-End Egress Policy Validation & CI Gate (Sub-Epic: 06_Network Egress Control)

## Covered Requirements
- [TAS-022], [1_PRD-REQ-SEC-002], [9_ROADMAP-TAS-203], [5_SECURITY_DESIGN-REQ-SEC-SD-048], [9_ROADMAP-REQ-SEC-002], [8_RISKS-REQ-007]

## 1. Initial Test Written

- [ ] Create `packages/sandbox/src/network/__e2e__/egressPolicy.e2e.test.ts`.
- [ ] Write an E2E test (tagged `@e2e`, guarded by `E2E=true` env var):
  - Start a real `EgressProxy` with `allowList: ["registry.npmjs.org", "pypi.org", "github.com"]` and attach a `ProxyAuditLogger` with `sinkType: "console"`.
  - Attach an `IsolatedDnsResolver` pointing at `8.8.8.8`.
  - Assert: an HTTP `CONNECT` to `registry.npmjs.org:443` returns `200 Connection Established`.
  - Assert: an HTTP `CONNECT` to `files.pythonhosted.org:443` (a pypi CDN — not in explicit list) returns `403 Forbidden`.
  - Assert: an HTTP `CONNECT` to `evil.com:443` returns `403 Forbidden`.
  - Assert: `logger.getMetrics()` shows `allowedCount: 1` and `blockedCount: 2`.
- [ ] Write an E2E test: start a Docker sandbox via `DockerDriver` (requires `DOCKER_INTEGRATION=true`):
  - Run `curl -x http://<proxyIp>:3128 https://registry.npmjs.org` inside the container; assert exit code `0`.
  - Run `curl -x http://<proxyIp>:3128 https://attacker.io` inside the container; assert exit code `≠ 0`.
  - Run `ping -c1 8.8.8.8` directly inside the container (bypassing proxy); assert exit code `≠ 0` (container has no external IP route).
- [ ] Write an E2E test: start a `WebContainerDriver` (requires `WEBCONTAINER_INTEGRATION=true`):
  - Install the network shim.
  - Execute `fetch("https://pypi.org/pypi")` inside the WebContainer; assert status `200`.
  - Execute `fetch("https://malicious.example.com")` inside the WebContainer; assert status `403`.

## 2. Task Implementation

- [ ] Create `packages/sandbox/src/network/__e2e__/helpers.ts` with shared E2E setup/teardown helpers:
  - `startEgressStack(config)`: starts `EgressProxy` + `IsolatedDnsResolver` + `ProxyAuditLogger`; returns handles for all three.
  - `stopEgressStack(handles)`: gracefully stops all three.
- [ ] Add an npm script `"test:e2e:network"` to `packages/sandbox/package.json`:
  ```json
  "test:e2e:network": "E2E=true jest --testPathPattern='__e2e__/egressPolicy' --runInBand"
  ```
- [ ] Add a CI job `.github/workflows/sandbox-e2e.yml` (or update existing) with:
  - Job name: `network-egress-e2e`.
  - Runs on: `ubuntu-latest`.
  - Services: none (proxy runs in-process).
  - Steps: checkout → setup node → `pnpm install` → `pnpm --filter @devs/sandbox test:e2e:network`.
  - The Docker-specific subtests run only when `DOCKER_INTEGRATION=true` is set (not set in standard CI; can be enabled manually or in a dedicated Docker CI job).
- [ ] Ensure the E2E tests clean up all ports and processes in `afterAll` even on failure (use `try/finally` in `afterAll`).

## 3. Code Review

- [ ] Confirm E2E tests are isolated from unit tests (different Jest config or `--testPathPattern`).
- [ ] Confirm the CI workflow does **not** require Docker to pass (Docker sub-tests must be skipped unless `DOCKER_INTEGRATION=true`).
- [ ] Confirm `startEgressStack` and `stopEgressStack` are not exported from the main package barrel — they are test-only helpers.
- [ ] Confirm all three components (`EgressProxy`, `IsolatedDnsResolver`, `ProxyAuditLogger`) are integration-tested together in the same E2E test to verify correct wiring.
- [ ] Confirm the E2E test file has a `@group e2e` JSDoc tag so it can be filtered by test runner.

## 4. Run Automated Tests to Verify

- [ ] Run `E2E=true pnpm --filter @devs/sandbox test:e2e:network`.
- [ ] All three E2E test scenarios (proxy, Docker optional, WebContainer optional) pass.
- [ ] Run standard unit tests: `pnpm --filter @devs/sandbox test` (no `E2E=true`) and confirm E2E tests are **skipped** (not failed).

## 5. Update Documentation

- [ ] Update `packages/sandbox/README.md` with a section `## Running E2E Network Tests` explaining the `E2E=true` and `DOCKER_INTEGRATION=true` flags and what each test validates.
- [ ] Update `docs/security/network-egress-policy.md` with a section `### Verification` listing the E2E test scenarios and asserting they serve as the acceptance criteria for the network egress policy.
- [ ] Update `.agent/memory/phase_2_decisions.md`: `"Network egress E2E tests guard all three components together; Docker sub-tests gated by DOCKER_INTEGRATION flag to avoid CI Docker dependency."`.
- [ ] Confirm that `docs/security/network-egress-policy.md` now covers: policy overview, allowed domains, Docker integration, WebContainer shim, DNS filtering, audit logging, and E2E verification — all sections added across tasks 01–06.

## 6. Automated Verification

- [ ] Run `E2E=true pnpm --filter @devs/sandbox test:e2e:network` and assert exit code `0`.
- [ ] Run `pnpm --filter @devs/sandbox test --ci` (no E2E flag) and assert exit code `0` with E2E tests listed as skipped.
- [ ] Run the following requirement coverage check script and assert exit code `0`:
  ```bash
  REQUIRED_IDS=("TAS-022" "1_PRD-REQ-SEC-002" "9_ROADMAP-TAS-203" "5_SECURITY_DESIGN-REQ-SEC-SD-048" "9_ROADMAP-REQ-SEC-002" "8_RISKS-REQ-007")
  TASK_DIR="tasks/phase_2/06_network_egress_control"
  for ID in "${REQUIRED_IDS[@]}"; do
    if ! grep -rl "$ID" "$TASK_DIR" > /dev/null 2>&1; then
      echo "FAIL: Requirement $ID not covered by any task"
      exit 1
    fi
  done
  echo "All requirement IDs covered. PASSED."
  ```
