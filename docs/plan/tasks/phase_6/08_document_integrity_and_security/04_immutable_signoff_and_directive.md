# Task: Enforce Immutable Architectural Sign-off and ARCH_CHANGE_DIRECTIVE flow (Sub-Epic: 08_Document Integrity and Security)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-SEC-SD-023]

## 1. Initial Test Written
- [ ] Create integration tests `tests/integration/test_immutable_signoff.(ts|js|py)` that validate the following scenarios:
  - Test A (blocked modification): simulate a Developer Agent or CLI attempt to modify a core architectural file (`tsconfig.json`, `package.json`, `.env.example`, or files under `docs/tas.md`) without an ARCH_CHANGE_DIRECTIVE. The orchestrator must reject the change, return a non-zero exit code (or throw an error in-program), and persist `.devs/gate_state.json` indicating `blocked_by_immutable_signoff` with the file list.
  - Test B (approved change): simulate the user creating a signed ARCH_CHANGE_DIRECTIVE (see implementation) and storing the approval via the CLI `orchestrator approve-arch-change --token <token> --files <file1,file2>`. The orchestrator should then accept the modification, update `.devs/checksums.json` accordingly, and clear the gate state.
- [ ] Tests should assert that unauthorized modifications are not applied to the workspace and that authorized changes require both a valid token and an explicit user action.

## 2. Task Implementation
- [ ] Implement an ARCH_CHANGE_DIRECTIVE flow with the following pieces:
  - A CLI command `orchestrator generate-arch-directive --files <files>` that produces a user-presentable directive token and a human-readable directive file (e.g., `ARCH_CHANGE_DIRECTIVE.txt`) that must be signed or confirmed by the user (for automated tests, the CLI can output a generated cryptographically-random token).
  - A CLI command `orchestrator approve-arch-change --token <token> --user <username> --expires <ISO8601>` which persists the approval token to `.devs/approvals.json` with fields: { token: <hex256>, issued_by: <username>, expires_at: <ISO8601>, files: [<paths>] } and stores an auditable record in `.devs/approvals.log`.
  - Modify the orchestrator's pre-apply/commit hook to check any attempt to modify core architectural files. If a change is detected, require a matching, unexpired token in `.devs/approvals.json` that covers the target files; otherwise reject the change and set `.devs/gate_state.json` to blocked.
  - Persist approvals encrypted at rest if the host supports a key store; otherwise store them with strict file permissions (0600) and clear instructions for operators to protect the directory.
- [ ] Provide a programmatic API `orchestrator.authz.verifyArchChange(token, files)` returning boolean and a reason object for tests.

## 3. Code Review
- [ ] Ensure tokens are at least 256 bits of entropy and generated from a cryptographically secure RNG.
- [ ] Use constant-time comparison when validating tokens to avoid timing attacks.
- [ ] Ensure approval records are written atomically and that removal or expiry of tokens is handled deterministically.
- [ ] Ensure user-facing messages and logs do not leak internal secrets and that the approval workflow is auditable.

## 4. Run Automated Tests to Verify
- [ ] Run the new integration tests that cover blocked and approved modification flows. Confirm modifications are only applied when a valid approval exists and are blocked otherwise.

## 5. Update Documentation
- [ ] Update `specs/5_security_design.md` with a dedicated "Immutable Architectural Sign-off" section describing the ARCH_CHANGE_DIRECTIVE lifecycle, the schema of `.devs/approvals.json`, and operator remediation steps.
- [ ] Add a short admin HOWTO `docs/ops/arch_signoff.md` describing how to generate directives, approve changes, revoke approvals, and audit approval logs.

## 6. Automated Verification
- [ ] Add `scripts/test_immutable_signoff.(sh|py|js)` that attempts an unauthorized change and asserts the orchestrator rejects it, then performs an authorized flow and asserts success. Integrate into CI as a gating test for any pipeline that can modify architecture files.
