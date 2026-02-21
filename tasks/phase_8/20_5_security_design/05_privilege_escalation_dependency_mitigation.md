# Task: Enforce safe package installation (ignore-scripts + egress restriction) and tests (Sub-Epic: 20_5_SECURITY_DESIGN)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-SEC-RSK-103]

## 1. Initial Test Written
- [ ] Create tests at tests/sandbox/test_safe_installer.py that import SafeInstaller from src/sandbox/safe_installer.py.
- [ ] Write unit tests:
  - test_npm_install_called_with_ignore_scripts: mock subprocess.run and assert SafeInstaller.install('npm', ['package']) invokes `npm install package --ignore-scripts --no-audit --no-fund` (or equivalent safe flags).
  - test_pip_install_uses_isolated_options: for pip, ensure install runs in a sandboxed venv and networkian egress policy is applied (mock sandbox policy enforcement).
  - test_network_egress_blocked_when_policy_denies: mock policy to deny network and assert SafeInstaller aborts installation with a clear exception and logs audit.
- [ ] Tests must not perform real network or install actions; use monkeypatch/patch to intercept subprocess calls.

## 2. Task Implementation
- [ ] Implement src/sandbox/safe_installer.py with API:
  - class SafeInstaller(sandbox_manager: SandboxManager)
    - install(package_manager: str, packages: List[str], options: Dict = None) -> CompletedProcess
- [ ] Behavior:
  - For npm installs, always add flags: --ignore-scripts, --no-audit, --no-fund and run inside the provided sandbox_manager.run(...) which enforces network egress policies.
  - For pip installs, prefer installing into an isolated virtualenv inside the sandbox and enforce outbound network policy via sandbox_manager.
  - If sandbox_manager indicates network egress is denied for installs, raise a SandboxPolicyViolation exception and do not invoke subprocess.
- [ ] Keep SafeInstaller implementation small and delegating sandbox enforcement to the injected SandboxManager interface (do not implement sandbox networking here).

## 3. Code Review
- [ ] Verify SafeInstaller never spawns installers without the safe flags for npm and always delegates network checks to sandbox_manager.
- [ ] Confirm that exceptions are explicit (SandboxPolicyViolation) and audited via logger.
- [ ] Ensure unit tests cover the negative path (policy denial) and positive path (safe flags present).

## 4. Run Automated Tests to Verify
- [ ] Run `pytest tests/sandbox -q` and ensure tests fail before implementation and pass after implementation.

## 5. Update Documentation
- [ ] Add docs/security/safe_installer.md describing SafeInstaller API, recommended flags for npm/pip, recommended sandbox_manager contract, and CI checks to ensure no raw installs are executed in CI.

## 6. Automated Verification
- [ ] Add scripts/verify_safe_installer.sh that runs the sandbox installer tests; it should exit non-zero if SafeInstaller attempts to run installers without the required safe flags or if sandbox policy bypass occurs.
