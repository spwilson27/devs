# Task: Sandbox Isolation UI & User Configuration Panel (Sub-Epic: 12_User-Facing Sandbox Features & Verification)

## Covered Requirements
- [4_USER_FEATURES-REQ-020]

## 1. Initial Test Written
- [ ] In `packages/vscode-extension/src/panels/__tests__/SandboxConfigPanel.test.ts`, write unit tests for the `SandboxConfigPanel` React component:
  - Test that the panel renders a sandbox type selector with options: `Docker` and `WebContainer`.
  - Test that selecting `Docker` reveals sub-options: CPU core limit (1–8), memory limit (512MB–16GB), and a network policy toggle (`Default Deny` / `Allowlist`).
  - Test that selecting `WebContainer` hides Docker-specific resource limit inputs.
  - Test that the "Network Allowlist" text area accepts comma-separated domains (e.g., `registry.npmjs.org, pypi.org`) and validates them as valid hostnames; invalid entries must trigger an inline validation error.
  - Test that saving the configuration dispatches the `sandbox.configUpdate` VS Code message with the correct typed payload shape `SandboxConfig`.
  - Test that loading the panel pre-populates fields from the persisted configuration in `.devs/config.json` under the `sandbox` key.
- [ ] In `packages/cli/src/__tests__/sandboxConfig.test.ts`, write unit tests for the CLI config commands:
  - Test `devs sandbox config --driver docker --cpu 2 --memory 4096 --network-policy default-deny` writes the correct JSON to `.devs/config.json`.
  - Test `devs sandbox config --driver webcontainer` omits Docker-only fields.
  - Test that invalid `--memory` values (e.g., negative, non-numeric) return a non-zero exit code and print a descriptive error.
- [ ] In `packages/core/src/sandbox/__tests__/SandboxConfigValidator.test.ts`, write unit tests for `SandboxConfigValidator`:
  - Test that `cpu` values outside `[1, 8]` are rejected.
  - Test that `memory` values outside `[512, 16384]` (MB) are rejected.
  - Test that `networkPolicy: 'allowlist'` requires at least one entry in `allowedDomains`.
  - Test that `networkPolicy: 'default-deny'` ignores any `allowedDomains` entries.

## 2. Task Implementation
- [ ] Define `SandboxConfig` TypeScript interface in `packages/core/src/sandbox/types.ts`:
  ```typescript
  export interface SandboxConfig {
    driver: 'docker' | 'webcontainer';
    docker?: {
      cpuCores: number;       // 1–8
      memoryMb: number;       // 512–16384
      networkPolicy: 'default-deny' | 'allowlist';
      allowedDomains?: string[];
    };
  }
  ```
- [ ] Implement `SandboxConfigValidator` in `packages/core/src/sandbox/SandboxConfigValidator.ts` that validates a `SandboxConfig` object and returns `{ valid: boolean; errors: string[] }`.
- [ ] Implement the `SandboxConfigPanel` React component in `packages/vscode-extension/src/panels/SandboxConfigPanel.tsx`:
  - Render a `<select>` for driver type.
  - Conditionally render Docker resource inputs (`<input type="range">` for CPU, `<select>` for memory presets) and a textarea for allowlist domains.
  - On save, call `SandboxConfigValidator.validate()` and display inline errors; on success, post the `sandbox.configUpdate` message to the VS Code webview host.
- [ ] Implement the VS Code webview message handler in `packages/vscode-extension/src/extension/messageHandlers/sandboxConfigHandler.ts`:
  - Receive `sandbox.configUpdate` message.
  - Persist the new `SandboxConfig` to `.devs/config.json` under the `sandbox` key using the `ConfigStore` service.
- [ ] Add `devs sandbox config` CLI subcommand in `packages/cli/src/commands/sandboxConfig.ts` using `commander`:
  - Options: `--driver`, `--cpu`, `--memory`, `--network-policy`, `--allowed-domains`.
  - Call `SandboxConfigValidator.validate()` and exit with code 1 on validation failure.
  - On success, write to `.devs/config.json` via `ConfigStore`.
- [ ] Update `.devs/config.json` JSON schema (`packages/core/src/config/schema.json`) to include the `sandbox` key with all `SandboxConfig` fields.

## 3. Code Review
- [ ] Verify `SandboxConfig` is the single source of truth for sandbox settings — no hardcoded defaults scattered across modules.
- [ ] Confirm the VS Code panel and CLI both call `SandboxConfigValidator` before persisting — no duplicate validation logic.
- [ ] Confirm `allowedDomains` validation uses a strict hostname regex (`/^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i`) and does not allow IP addresses.
- [ ] Confirm that the `WebContainer` driver path never exposes Docker-specific options through the API surface.
- [ ] Confirm accessibility: all form inputs have associated `<label>` elements with `htmlFor` attributes.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/core test -- --testPathPattern=SandboxConfigValidator` and confirm all tests pass.
- [ ] Run `pnpm --filter @devs/vscode-extension test -- --testPathPattern=SandboxConfigPanel` and confirm all tests pass.
- [ ] Run `pnpm --filter @devs/cli test -- --testPathPattern=sandboxConfig` and confirm all tests pass.
- [ ] Run the full test suite with `pnpm test` and confirm no regressions.

## 5. Update Documentation
- [ ] Update `docs/user-guide/sandbox-configuration.md` with:
  - A table of all configuration options, their valid ranges, and defaults.
  - CLI usage examples for Docker and WebContainer drivers.
  - A screenshot placeholder for the VS Code panel.
- [ ] Update `.agent/memory/phase_2_decisions.md` with the decision to use `.devs/config.json` as the single persistent store for `SandboxConfig`, noting the `SandboxConfigValidator` as the enforcement point.
- [ ] Update the JSON schema documentation in `packages/core/src/config/README.md` to reflect the new `sandbox` key.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/core build` and confirm TypeScript compilation succeeds with zero errors.
- [ ] Run `node -e "const { SandboxConfigValidator } = require('./packages/core/dist/sandbox/SandboxConfigValidator'); const r = SandboxConfigValidator.validate({ driver: 'docker', docker: { cpuCores: 2, memoryMb: 4096, networkPolicy: 'default-deny' } }); process.exit(r.valid ? 0 : 1);"` and confirm exit code 0.
- [ ] Run `node -e "const { SandboxConfigValidator } = require('./packages/core/dist/sandbox/SandboxConfigValidator'); const r = SandboxConfigValidator.validate({ driver: 'docker', docker: { cpuCores: 99, memoryMb: 4096, networkPolicy: 'default-deny' } }); process.exit(r.valid ? 1 : 0);"` and confirm exit code 0 (invalid config correctly rejected).
