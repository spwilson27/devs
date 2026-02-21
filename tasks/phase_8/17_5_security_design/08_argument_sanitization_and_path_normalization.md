# Task: Implement Argument Sanitization and Sandbox Path Normalization (Sub-Epic: 17_5_SECURITY_DESIGN)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-SEC-SD-017]

## 1. Initial Test Written
- [ ] Write tests at tests/test_sandbox_sanitization.py before changing code:
  - test_shell_executor_rejects_metacharacters(): call sandbox.run_command(['echo', '; rm -rf /']) and assert the call is rejected with SANITIZATION_ERROR.
  - test_executor_requires_args_array(): ensure API that previously accepted raw shell strings now refuses them and requires args list; test by attempting raw string and expecting TypeError or ACCESS_DENIED.
  - test_path_normalization_restricts_to_workspace(): attempt to run a command accessing '../etc/passwd' and expect ACCESS_DENIED.

## 2. Task Implementation
- [ ] Modify src/sandbox/runner.py and sandbox API surface:
  - Shell API signature must accept args: List[str] only; deprecate any raw shell string surface.
  - Implement argument validation that rejects tokens containing unescaped shell metacharacters (e.g., ; | & > < ` $( )), except when explicitly allowed via a privileged API.
  - Normalize and resolve any path arguments using os.path.realpath and assert the resolved path starts with WORKSPACE_ROOT environment variable; deny otherwise.
  - Add explicit escaping utilities if shell execution is necessary (use subprocess.run with args list and shell=False).
  - Update any code paths that invoked shell via string to use args list and subprocess without shell.

## 3. Code Review
- [ ] Verify:
  - No code calls subprocess with shell=True using interpolated user data.
  - All path usages are normalized and checked against WORKSPACE_ROOT.
  - Ensure unit tests include fuzz inputs with nested metacharacters.

## 4. Run Automated Tests to Verify
- [ ] Run tests/test_sandbox_sanitization.py and integration tests exercising the sandbox runner.

## 5. Update Documentation
- [ ] Update docs/security/shell_and_sandbox.md documenting the new API contract (args list only), examples, and how to safely run privileged commands.

## 6. Automated Verification
- [ ] Add a CI check scripts/fuzz_sandbox_args.sh that runs the sandbox with a list of malicious-looking args and fails the job if any are accepted.
