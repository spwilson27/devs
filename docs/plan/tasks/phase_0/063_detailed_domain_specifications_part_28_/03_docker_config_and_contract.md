# Task: Define Docker Executor Configuration and Binary Contract (Part 28) (Sub-Epic: 063_Detailed Domain Specifications (Part 28))

## Covered Requirements
- [2_TAS-REQ-281], [2_TAS-REQ-282]

## Dependencies
- depends_on: [none]
- shared_components: [devs-config, devs-executor]

## 1. Initial Test Written
- [ ] Create a unit test in `crates/devs-config/src/workflow.rs` (or `stage.rs`) to verify that the `execution_env.docker.image` field is correctly parsed.
- [ ] Ensure that an error is returned if a `docker` execution environment is specified without an `image` field.
- [ ] Verify that the test fails (Red) if the field is not present in the `DockerExecutionEnv` struct.
- [ ] Annotate the tests with `// Covers: [2_TAS-REQ-281]`.

## 2. Task Implementation
- [ ] Add the `image` field to the `DockerExecutionEnv` struct in `devs-config`.
- [ ] Ensure the field is a `String` (or `BoundedString`).
- [ ] Add a `StageExecutor` trait method or constant in `devs-executor` that reflects the requirement `[2_TAS-REQ-282]` (e.g. documentation on the trait indicating that agent binaries must be pre-installed).
- [ ] Add doc comments for `2_TAS-REQ-281` and `2_TAS-REQ-282` to the relevant fields and traits.
- [ ] Reference `[2_TAS-REQ-282]` explicitly in the `DockerExecutor` implementation's doc comment as a contract for image preparation.

## 3. Code Review
- [ ] Verify that the Docker configuration matches the schema defined in the technical specification.
- [ ] Check that `BoundedString` is used if appropriate for image names to prevent excessive memory usage.
- [ ] Ensure all public items have proper doc comments.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-config` to verify the config parsing tests pass.
- [ ] Run `./do lint` for documentation and quality checks.

## 5. Update Documentation
- [ ] Update any developer-facing documentation for adding new agent images to reflect the requirement for pre-installed binaries.

## 6. Automated Verification
- [ ] Run `./do test` and verify that `target/traceability.json` correctly maps `2_TAS-REQ-281` and `2_TAS-REQ-282` to the new tests.
- [ ] Ensure 100% traceability for the covered requirements.
