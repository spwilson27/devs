# Task: Enforce `--ignore-scripts` and No-Exec `/tmp` in Sandbox to Prevent Privilege Escalation (Sub-Epic: 04_Non-Privileged User Context and Filesystem Hardening)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-SEC-STR-006]

## 1. Initial Test Written
- [ ] Create `src/sandbox/__tests__/sandboxHardening.test.ts`.
- [ ] Write a unit test that calls `buildNpmInstallArgs()` and asserts the returned array contains `'--ignore-scripts'`.
- [ ] Write a unit test that calls `buildNpmInstallArgs()` and asserts the returned array does NOT contain `'--allow-scripts'` or any override.
- [ ] Write a unit test for `buildSandboxEnv()` that asserts the returned environment object contains `NPM_CONFIG_IGNORE_SCRIPTS: 'true'`.
- [ ] Write a unit test for `getSandboxTmpDir()` that asserts the returned path is inside the sandbox workspace (e.g., `<sandboxRoot>/tmp`), NOT the host `/tmp`.
- [ ] Write a unit test for `mountSandboxTmpAsNoexec(sandboxRoot)` that (mocked) calls `mount` with the `noexec` flag; assert the command string includes `noexec`.
- [ ] Write an integration test that spawns a sandboxed `npm install` using `buildNpmInstallArgs()` with a package containing a malicious `postinstall` script and asserts the script is NOT executed.

## 2. Task Implementation
- [ ] Create `src/sandbox/sandboxHardening.ts`.
- [ ] Export `buildNpmInstallArgs(extraArgs: string[] = []): string[]`:
  - Always prepend `'--ignore-scripts'` to the arg list.
  - Add comment: `// [5_SECURITY_DESIGN-REQ-SEC-STR-006]: Prevent post-install script execution`.
- [ ] Export `buildSandboxEnv(baseEnv: NodeJS.ProcessEnv = {}): NodeJS.ProcessEnv`:
  - Return `{ ...baseEnv, NPM_CONFIG_IGNORE_SCRIPTS: 'true', NPM_CONFIG_PREFIX: '<sandboxRoot>/npm-global' }`.
  - Strips any `SUDO_*` and `LD_PRELOAD` keys from the environment.
- [ ] Export `getSandboxTmpDir(sandboxRoot: string): string`:
  - Return `path.join(sandboxRoot, 'tmp')`.
  - Create the directory with `0o700` permissions if it does not exist.
- [ ] Export `mountSandboxTmpAsNoexec(sandboxRoot: string): void` (Linux only):
  - On Linux (`process.platform === 'linux'`), spawn `mount -o bind,noexec,nosuid <sandboxTmpDir> <sandboxTmpDir>` using `child_process.spawnSync`.
  - If the command fails, log a warning (do not abort — the feature is best-effort on non-root).
  - On non-Linux, log a debug message that noexec mount is not supported and skip.
- [ ] Integrate `buildNpmInstallArgs` and `buildSandboxEnv` into the existing sandbox provisioning code (`src/sandbox/provision.ts` or equivalent).
- [ ] Export from `src/sandbox/index.ts`.

## 3. Code Review
- [ ] Verify `--ignore-scripts` is unconditional — it must not be configurable or overridable by user config.
- [ ] Verify `buildSandboxEnv` strips `SUDO_USER`, `SUDO_UID`, `SUDO_GID`, and `LD_PRELOAD` from the inherited environment.
- [ ] Confirm the `noexec` mount is attempted only on Linux and that failure is non-fatal but logged.
- [ ] Verify `getSandboxTmpDir` returns a path inside the sandbox, never the host `/tmp`.
- [ ] Confirm the requirement comment `// [5_SECURITY_DESIGN-REQ-SEC-STR-006]` is present.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern="src/sandbox/__tests__/sandboxHardening"` and confirm all tests pass.
- [ ] Run the integration test and confirm the malicious postinstall script does not execute.
- [ ] Confirm 100% branch coverage for `src/sandbox/sandboxHardening.ts`.

## 5. Update Documentation
- [ ] Update `docs/security.md` with a section "Host-Level Execution Prevention" describing the `--ignore-scripts` enforcement and the sandboxed `/tmp` with `noexec`.
- [ ] Update `docs/sandbox.md` (create if absent) with a note that all npm installs inside sandboxes use `--ignore-scripts` by default.
- [ ] Add an entry in `docs/architecture/adr/ADR-SEC-002-ignore-scripts.md` recording the decision.

## 6. Automated Verification
- [ ] Add `scripts/smoke-test-sandbox-hardening.sh`:
  1. Create a test npm package with a `postinstall` script that writes a sentinel file to `/tmp/pwned`.
  2. Run `devs sandbox npm-install <test-package>` inside a temp workspace.
  3. Assert `/tmp/pwned` does NOT exist.
  4. Assert the sentinel file also does not exist inside the sandbox tmp dir.
- [ ] Run `npm run validate-all` and confirm exit code 0.
