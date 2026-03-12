# Task: Prohibited Environment Keys Validation (Sub-Epic: 061_Detailed Domain Specifications (Part 26))

## Covered Requirements
- [2_TAS-REQ-269]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core, devs-config]

## 1. Initial Test Written
- [ ] In `devs-core/src/types/env_key.rs` (or equivalent location for `EnvKey`), write a unit test that attempts to create an `EnvKey` with the names `DEVS_LISTEN`, `DEVS_MCP_PORT`, or `DEVS_DISCOVERY_FILE`. Verify that it returns `ValidationError::ProhibitedEnvKey`.
- [ ] In `devs-config/src/workflow/validation.rs`, write a unit test for parsing a stage definition that includes any of the prohibited environment keys. Verify that it returns a validation error.

## 2. Task Implementation
- [ ] In `devs-core`, update the `EnvKey` type's validation logic to explicitly check for `DEVS_LISTEN`, `DEVS_MCP_PORT`, and `DEVS_DISCOVERY_FILE` and return a specific `ValidationError`.
- [ ] In `devs-config`, ensure that the workflow definition parser correctly applies these validation rules during parsing of the `env` block in a stage.
- [ ] In the agent environment setup logic (possibly in `devs-executor` or wherever environment variables are prepared for subprocess spawn), implement a step that strips these keys if they happen to be present (e.g., if they were inherited from the server process).
- [ ] Ensure all public items are documented with doc comments.

## 3. Code Review
- [ ] Verify that the list of prohibited keys matches the requirement exactly.
- [ ] Verify that the stripping logic handles the keys regardless of their presence in the `env` block of the stage (i.e., it must also strip inherited server env vars).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core -p devs-config` and ensure the tests pass.

## 5. Update Documentation
- [ ] Document the prohibited environment keys in `devs-core` and the workflow definition documentation.

## 6. Automated Verification
- [ ] Run `./do test` and verify that the tests are correctly annotated with `// Covers: 2_TAS-REQ-269`.
