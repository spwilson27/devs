# Task: Exit Code 3 for Unreachable Server (Sub-Epic: 069_Detailed Domain Specifications (Part 34))

## Covered Requirements
- [2_TAS-REQ-422]

## Dependencies
- depends_on: ["02_discovery_file_deletion_on_sigterm.md"]
- shared_components: [Server Discovery Protocol, devs-cli]

## 1. Initial Test Written
- [ ] Create an E2E test that covers two scenarios:
  1. **Discovery file absent**: Set `DEVS_DISCOVERY_FILE` to a non-existent temp path. Run `devs list` without `--server`. Assert exit code is 3. Assert stderr contains "not reachable" or "not found".
  2. **Stale discovery file**: Write a discovery file pointing to `127.0.0.1:<unused_port>` (pick a port that nothing listens on). Run `devs list` without `--server`. Assert exit code is 3. Assert stderr contains "not reachable" or "not found".
- [ ] Add `// Covers: 2_TAS-REQ-422` annotation to both test cases.

## 2. Task Implementation
- [ ] In the CLI connection logic, when the discovery file is missing, print an error message containing "not found" to stderr and exit with code 3.
- [ ] When the discovery file exists but the gRPC connection fails (connection refused, timeout), print an error message containing "not reachable" to stderr and exit with code 3.
- [ ] Define exit code 3 as a named constant (e.g., `EXIT_SERVER_UNREACHABLE: i32 = 3`) in the CLI crate.
- [ ] Ensure no panic or stack trace is printed — only the user-friendly error message.

## 3. Code Review
- [ ] Verify exit code 3 is used consistently for all server-unreachable scenarios.
- [ ] Verify the error message wording matches the requirement: must contain "not reachable" or "not found".
- [ ] Verify the CLI does not retry connections silently — it should fail fast.

## 4. Run Automated Tests to Verify
- [ ] Run the specific test and confirm both scenarios pass.
- [ ] Run `./do test` and confirm no regressions.

## 5. Update Documentation
- [ ] Document exit code 3 semantics in the CLI module's doc comments or a constants file.

## 6. Automated Verification
- [ ] Run `./do presubmit` and confirm exit 0.
- [ ] Verify `// Covers: 2_TAS-REQ-422` appears via `grep -r "Covers: 2_TAS-REQ-422" tests/`.
