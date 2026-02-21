# Task: Investigate and Mitigate WebContainers Sandbox Escape Risk for C-Extension Node Modules (Sub-Epic: 08_Network Egress and Sandbox Isolation)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-SEC-RSK-001]

## 1. Initial Test Written
- [ ] Create `src/sandbox/__tests__/sandboxEscapeAudit.test.ts`.
- [ ] Write a unit test for `SandboxCapabilityAuditor.auditModule(moduleName)` that, given a known native-addon module name (e.g., `sharp`, `sqlite3`, `bcrypt`), returns a `ModuleAuditResult { moduleName: string; hasNativeAddon: boolean; riskLevel: 'low' | 'medium' | 'high'; reason: string }`.
- [ ] Write a unit test verifying `auditModule('pure-js-module')` returns `{ hasNativeAddon: false, riskLevel: 'low' }`.
- [ ] Write a unit test verifying `auditModule('sqlite3')` returns `{ hasNativeAddon: true, riskLevel: 'high' }` because it contains a `.node` binary.
- [ ] Write a unit test for `SandboxCapabilityAuditor.auditProject(packageJsonPath)` that reads a `package.json` file, iterates dependencies, and returns an array of `ModuleAuditResult` for every dependency that has `hasNativeAddon: true`.
- [ ] Write a unit test for `SandboxPolicyEnforcer.blockNativeAddons(sandboxEnv)` that verifies it sets `NODE_OPTIONS=--no-addons` in the sandbox environment when `devs` config `sandbox.blockNativeAddons` is `true`.
- [ ] Write a unit test for `SandboxPolicyEnforcer.requireHITLApproval(auditResults)` that asserts it returns `true` (HITL approval required) when any module has `riskLevel: 'high'`, and `false` otherwise.
- [ ] All tests must FAIL before implementation.

## 2. Task Implementation
- [ ] Create `src/sandbox/securityAudit/sandboxCapabilityAuditor.ts` exporting `SandboxCapabilityAuditor`:
  - `auditModule(moduleName: string, nodeModulesPath?: string): ModuleAuditResult`:
    - Uses `glob` to search `<nodeModulesPath>/<moduleName>/**/*.node` for native addon binaries.
    - If `.node` files are found: `hasNativeAddon: true`, `riskLevel: 'high'`.
    - If `binding.gyp` or `CMakeLists.txt` is found (potential native build): `hasNativeAddon: true`, `riskLevel: 'medium'`.
    - Otherwise: `hasNativeAddon: false`, `riskLevel: 'low'`.
  - `auditProject(packageJsonPath: string): Promise<ModuleAuditResult[]>`:
    - Reads `package.json` and iterates `dependencies` + `devDependencies`.
    - Calls `auditModule` for each and returns results with `riskLevel: 'medium' | 'high'` only.
- [ ] Create `src/sandbox/securityAudit/sandboxPolicyEnforcer.ts` exporting `SandboxPolicyEnforcer`:
  - `blockNativeAddons(env: NodeJS.ProcessEnv, config: SandboxSecurityConfig): NodeJS.ProcessEnv`:
    - If `config.blockNativeAddons === true`, appends `--no-addons` to `NODE_OPTIONS`.
    - Returns a new env object (does not mutate input).
  - `requireHITLApproval(auditResults: ModuleAuditResult[]): boolean`:
    - Returns `true` if any result has `riskLevel === 'high'`.
- [ ] Create `src/sandbox/securityAudit/types.ts` with:
  - `ModuleAuditResult { moduleName: string; hasNativeAddon: boolean; riskLevel: 'low' | 'medium' | 'high'; reason: string; nativeFiles?: string[] }`
  - `SandboxSecurityConfig { blockNativeAddons: boolean; requireApprovalForNativeModules: boolean }`
- [ ] Integrate `SandboxCapabilityAuditor.auditProject()` into `SandboxLauncher.spawnWithProxy()`:
  - Run the audit before spawning the child process.
  - If `requireHITLApproval(results)` returns `true`, emit a `HITL_REQUIRED` event and pause sandbox launch until the user approves via the orchestrator's approval junction.
  - If `config.blockNativeAddons` is `true`, apply `blockNativeAddons()` to the child env.
- [ ] Write a risk-mitigation note to the project's `SECURITY.md` (create if absent) documenting WebContainers sandbox escape vectors and the mitigations implemented.
- [ ] Annotate all methods with `// [5_SECURITY_DESIGN-REQ-SEC-RSK-001]`.

## 3. Code Review
- [ ] Verify `auditModule` handles the case where `nodeModulesPath` does not exist (returns `low` risk, no error thrown).
- [ ] Verify `blockNativeAddons` does **not** overwrite an existing `NODE_OPTIONS` value — it must append `--no-addons` with a space separator.
- [ ] Verify the HITL pause in `SandboxLauncher` uses the same approval junction mechanism as the rest of the orchestrator (no ad-hoc `readline` prompts).
- [ ] Verify the audit does not recursively descend into `node_modules` beyond the direct dependency level (to avoid performance issues).
- [ ] Verify all new types are exported from a barrel `src/sandbox/securityAudit/index.ts`.
- [ ] Verify strict TypeScript compliance and requirement ID annotations.

## 4. Run Automated Tests to Verify
- [ ] Run `npx jest src/sandbox/__tests__/sandboxEscapeAudit.test.ts --runInBand` and confirm all tests pass.
- [ ] Run the full sandbox test suite `npx jest src/sandbox/ --runInBand` and confirm no regressions.
- [ ] Run `npx tsc --noEmit` and confirm zero type errors.
- [ ] Confirm `auditProject` completes in < 2 seconds on a project with 50 dependencies (performance guard).

## 5. Update Documentation
- [ ] Create `src/sandbox/securityAudit/SECURITY_AUDIT.agent.md` documenting:
  - WebContainers sandbox escape risk vector (C-extension `.node` binaries bypass the JS sandbox).
  - How `SandboxCapabilityAuditor` detects native addons.
  - Mitigation strategies: `--no-addons` flag, HITL approval gate.
  - Residual risk: non-WebContainers sandboxes (Docker/child_process) may still require OS-level cgroup/seccomp restrictions for full isolation.
  - Requirement traceability: `[5_SECURITY_DESIGN-REQ-SEC-RSK-001]`.
- [ ] Update `SECURITY.md` at project root with a **Sandbox Escape Risk** section covering the above vectors and implemented mitigations.
- [ ] Update `docs/architecture/sandbox.md` with the native-addon audit flow.

## 6. Automated Verification
- [ ] Add `validate:sandbox-escape-audit` script to `package.json`:
  ```
  "validate:sandbox-escape-audit": "jest src/sandbox/__tests__/sandboxEscapeAudit.test.ts --runInBand --passWithNoTests=false && tsc --noEmit"
  ```
- [ ] Run `npm run validate:sandbox-escape-audit` and confirm exit code 0.
- [ ] Confirm `test-results/sandbox-escape-audit.xml` contains zero `<failure>` elements.
- [ ] Run `node -e "require('./dist/sandbox/securityAudit').SandboxCapabilityAuditor.auditModule('sqlite3')" | grep '"riskLevel":"high"'` and confirm the output matches.
