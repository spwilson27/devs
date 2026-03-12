# Task: Injection Prevention and Subprocess Safety (Sub-Epic: 01_Core gRPC Server and Infrastructure)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-003], [5_SECURITY_DESIGN-REQ-006], [5_SECURITY_DESIGN-REQ-040], [5_SECURITY_DESIGN-REQ-041], [5_SECURITY_DESIGN-REQ-044], [5_SECURITY_DESIGN-REQ-045], [5_SECURITY_DESIGN-REQ-046], [5_SECURITY_DESIGN-REQ-047], [5_SECURITY_DESIGN-REQ-056]

## Dependencies
- depends_on: [06_logging_and_audit_foundation.md]
- shared_components: [devs-core, devs-adapters]

## 1. Initial Test Written
- [ ] Write unit tests for the template resolution engine in `devs-core` verifying it is single-pass and does not recursively expand variables.
- [ ] Create a test that attempts to use a template variable from an unreachable stage (not in `depends_on`) and verifies it fails with `TemplateError::UnreachableStage`.
- [ ] Write a test for the agent adapter spawn logic verifying it uses `tokio::process::Command` with argument arrays and NOT shell interpolation.
- [ ] Verify that environment variable keys are validated against the regex `[A-Z_][A-Z0-9_]{0,127}`.

## 2. Task Implementation
- [ ] Implement a single-pass template resolver in `devs-core`.
- [ ] Implement the `transitive_depends_on` check for all template references.
- [ ] Update the `AgentAdapter` trait and implementations to use `tokio::process::Command` with separate `arg()` calls for the prompt and flags.
- [ ] Ensure prompt files use generated UUIDs and are written with `0600` permissions.
- [ ] Implement the `EnvKey` type with regex validation to prevent shell character injection in environment variables.
- [ ] Explicitly strip `DEVS_LISTEN`, `DEVS_MCP_PORT`, and `DEVS_DISCOVERY_FILE` from agent environments.

## 3. Code Review
- [ ] Confirm that no shell interpolation (`sh -c`) is used anywhere in the subprocess path.
- [ ] Verify that template resolution is truly single-pass.
- [ ] Ensure that the `depends_on` check is exhaustive.

## 4. Run Automated Tests to Verify
- [ ] `cargo test -p devs-core -p devs-adapters`

## 5. Update Documentation
- [ ] Document the template resolution safety rules in the workflow authoring guide.

## 6. Automated Verification
- [ ] Run a test with a maliciously crafted "recursive" template and verify it is treated as a literal string.
