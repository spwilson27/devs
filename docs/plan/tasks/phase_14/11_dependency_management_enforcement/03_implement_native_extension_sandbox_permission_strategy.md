# Task: Implement Native Extension Sandbox Permission Strategy (Sub-Epic: 11_Dependency Management Enforcement)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-SEC-QST-902]

## 1. Initial Test Written

- [ ] In `src/sandbox/__tests__/nativeExtensionPolicy.test.ts`, write unit tests for a `NativeExtensionPolicyEngine` class:
  - `requiresNativeCompilation(manifestPath: string): Promise<boolean>` — returns `true` when `package.json` contains packages with a `binding.gyp` or `cmake.js` (detect via a fixtures directory with sample manifests), `false` otherwise.
  - `getSandboxProfile(requiresNative: boolean): SandboxProfile` — returns `SandboxProfile.RESTRICTED` when `false`, `SandboxProfile.NATIVE_COMPILATION` when `true`.
  - `validateProfile(profile: SandboxProfile): ProfileValidationResult` — returns `{ valid: true }` for known profiles, `{ valid: false, reason: string }` for unknown profiles.
  - `buildDockerRunArgs(profile: SandboxProfile): string[]` — for `NATIVE_COMPILATION`, asserts the args include `--cap-add SYS_PTRACE` and the bind mount for the native build cache (`/root/.node-gyp`), and do **not** include `--network none`.
  - For `RESTRICTED`, asserts args include `--network none`, `--cap-drop ALL`, and no `--cap-add` flags.
- [ ] In `src/sandbox/__tests__/nativeExtensionPolicy.integration.test.ts`:
  - Create a temp directory with a fixture `package.json` listing `node-gyp` as a dependency.
  - Call `requiresNativeCompilation()` against it and assert `true`.
  - Spawn the sandbox with `NATIVE_COMPILATION` profile using a Docker mock (via `jest.mock('child_process')`) and assert the correct Docker flags are produced.
- [ ] Write a test asserting that switching a sandbox from `RESTRICTED` to `NATIVE_COMPILATION` emits a structured audit log event `{ event: 'SANDBOX_PROFILE_ESCALATED', from: 'RESTRICTED', to: 'NATIVE_COMPILATION', reason: string, approvedBy: string }`.

## 2. Task Implementation

- [ ] Create `src/sandbox/nativeExtensionPolicy.ts` exporting `NativeExtensionPolicyEngine`:
  - `NATIVE_COMPILATION_INDICATORS: string[]` = `['binding.gyp', 'cmake.js', 'node-gyp', 'node-pre-gyp', 'napi', 'nan']`.
  - `requiresNativeCompilation(manifestPath)`: parse `package.json`, collect all dep names, check each against `NATIVE_COMPILATION_INDICATORS` using npm metadata lookup (mocked in tests, real `npm view <pkg> dist-tags` in prod).
  - `getSandboxProfile(requiresNative)`: return enum `SandboxProfile.NATIVE_COMPILATION` or `SandboxProfile.RESTRICTED`.
- [ ] Create `src/sandbox/sandboxProfile.ts` declaring the `SandboxProfile` enum (`RESTRICTED`, `NATIVE_COMPILATION`) and `SandboxProfileConfig` mapping each profile to Docker run configuration:
  ```typescript
  export const SANDBOX_PROFILE_CONFIGS: Record<SandboxProfile, DockerRunConfig> = {
    [SandboxProfile.RESTRICTED]: {
      capDrop: ['ALL'],
      capAdd: [],
      network: 'none',
      readonlyRootfs: true,
      bindMounts: [],
    },
    [SandboxProfile.NATIVE_COMPILATION]: {
      capDrop: ['ALL'],
      capAdd: ['SYS_PTRACE'],
      network: 'bridge',         // needs npm registry access for node-gyp
      readonlyRootfs: false,
      bindMounts: ['/root/.node-gyp:/root/.node-gyp:rw'],
      resourceLimits: { cpuQuota: 50000, memoryMb: 2048 },
    },
  };
  ```
- [ ] Create `src/sandbox/sandboxOrchestrator.ts` (or extend existing):
  - Before provisioning a sandbox, call `nativeExtensionPolicyEngine.requiresNativeCompilation(taskManifestPath)`.
  - If `true`, require explicit user approval via `src/ui/approvalGate.ts` (the existing approval mechanism from earlier phases) before escalating to `NATIVE_COMPILATION` profile.
  - Emit the structured audit event `SANDBOX_PROFILE_ESCALATED` to the audit log (via `src/audit/auditLogger.ts`) upon approval.
- [ ] Create `src/sandbox/dockerRunBuilder.ts` exporting `buildDockerRunArgs(config: DockerRunConfig): string[]` that converts a `DockerRunConfig` to a `docker run` CLI argument array, ensuring security-critical flags (`--cap-drop`, `--read-only`, `--security-opt no-new-privileges`) are always prepended and cannot be overridden by profile-level config.
- [ ] Add a config option `sandboxPolicy.allowNativeCompilationEscalation: boolean` (default `false`) in `devs.config.json` schema — if `false`, `NativeExtensionPolicyEngine` throws `NativeCompilationNotAllowedError` before showing the approval gate.

## 3. Code Review

- [ ] Confirm `buildDockerRunArgs` is a pure function (no side effects) so it is independently testable.
- [ ] Verify the `NATIVE_COMPILATION` profile still drops `ALL` capabilities before selectively adding back only `SYS_PTRACE`; it must never use `--privileged`.
- [ ] Confirm the approval gate cannot be bypassed: the orchestrator must check `sandboxPolicy.allowNativeCompilationEscalation` before calling `approvalGate.request()`, and if `false`, must throw rather than silently downgrade to `RESTRICTED`.
- [ ] Ensure the audit event includes a `reason` field populated from the specific package names that triggered native compilation detection (not just `"true"`).
- [ ] Verify that `requiresNativeCompilation` is robust to malformed `package.json` — it should throw a typed `ManifestParseError` rather than crashing the orchestrator.

## 4. Run Automated Tests to Verify

- [ ] Run `npx jest src/sandbox/__tests__/nativeExtensionPolicy.test.ts --coverage` and confirm ≥90% branch coverage on `nativeExtensionPolicy.ts` and `sandboxProfile.ts`.
- [ ] Run `npx jest src/sandbox/__tests__/nativeExtensionPolicy.integration.test.ts` and confirm all pass.
- [ ] Run `npx jest --testPathPattern="sandbox"` and confirm no regressions in existing sandbox tests.
- [ ] Run `npx tsc --noEmit` and confirm no type errors.

## 5. Update Documentation

- [ ] Update `docs/security.md` with a new section **"Native Extension Sandbox Policy"** documenting: what triggers native compilation detection, the `RESTRICTED` vs `NATIVE_COMPILATION` profiles, the required user approval step, and how to configure `sandboxPolicy.allowNativeCompilationEscalation`.
- [ ] Update `docs/configuration.md` documenting the `sandboxPolicy.allowNativeCompilationEscalation` flag.
- [ ] Add a Mermaid diagram to `docs/security.md` showing the decision flow: manifest scan → native detection → approval gate → profile selection → Docker args.
- [ ] Update `docs/agent-memory/phase_14_decisions.md` with: "Sandboxes requiring native extension compilation use the `NATIVE_COMPILATION` profile, which requires explicit user approval and emits an audit event. The `--privileged` flag is never used; only `SYS_PTRACE` capability is added."

## 6. Automated Verification

- [ ] Run `bash scripts/validate-all.sh` and confirm all sandbox policy tests pass with zero failures.
- [ ] Run an automated profile audit: `node -e "const {SANDBOX_PROFILE_CONFIGS, SandboxProfile} = require('./dist/sandbox/sandboxProfile'); const nc = SANDBOX_PROFILE_CONFIGS[SandboxProfile.NATIVE_COMPILATION]; console.assert(!nc.capAdd.includes('ALL'), 'FAIL: ALL cap must not be added'); console.assert(nc.capDrop.includes('ALL'), 'FAIL: ALL cap must be dropped'); console.log('PASS');"` and assert output is `PASS`.
- [ ] Confirm in CI (`ci.yml`) that a step runs `node scripts/audit-sandbox-profiles.js` which programmatically imports `SANDBOX_PROFILE_CONFIGS` and fails the build if any profile grants `--privileged` or omits `--cap-drop ALL`.
