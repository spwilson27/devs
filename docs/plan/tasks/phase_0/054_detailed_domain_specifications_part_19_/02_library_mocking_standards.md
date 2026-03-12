# Task: Library Crate Unit Testing and Mocking Infrastructure (Sub-Epic: 054_Detailed Domain Specifications (Part 19))

## Covered Requirements
- [2_TAS-REQ-143]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core, devs-scheduler, devs-checkpoint]

## 1. Initial Test Written
- [ ] In `devs-core/src/lib.rs`, add a `#[cfg(test)]` module that defines a mock for a simple trait and verifies its use in a unit test.
- [ ] In `devs-scheduler/src/lib.rs`, add a `#[cfg(test)]` module with a mock `DagScheduler` and verify it can be used to test a dependent component without starting a real scheduler.
- [ ] In `devs-checkpoint/src/lib.rs`, add a `#[cfg(test)]` module with a mock `CheckpointStore` (backed by an in-memory `HashMap`) and verify it can be used to test a dependent component without touching the filesystem or git.

## 2. Task Implementation
- [ ] Establish the trait-based mocking pattern for all library crates:
    - Prefer `mockall` or manually implemented trait objects for mocking external dependencies.
    - Every crate that exports a service-like interface (`DagScheduler`, `AgentPoolManager`, `CheckpointStore`, etc.) MUST also export a corresponding trait if not already present.
- [ ] In `devs-checkpoint`, implement `InMemoryCheckpointStore` within a `#[cfg(test)]` block (or as a `pub` struct if needed for other crates' tests). It MUST satisfy **[2_TAS-REQ-143]** by not using real git or filesystem operations.
- [ ] In `devs-scheduler`, implement `MockDagScheduler` within a `#[cfg(test)]` block.
- [ ] Ensure NO unit test starts a real gRPC server, git repository, or Docker daemon.
- [ ] Create a template or guide in `CONTRIBUTING.md` (or similar) on how to add mocks for new crates following this standard.

## 3. Code Review
- [ ] Verify that `#[cfg(test)]` is used correctly to avoid including mock logic in release builds.
- [ ] Verify that trait objects are used where appropriate to decouple components.
- [ ] Ensure that mocks are clean and minimal, only implementing what is necessary for testing.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test --workspace` and confirm that no tests are failing due to missing external dependencies (git, docker, etc.) in an environment where they are absent.
- [ ] Run `./do test` to verify the new unit tests.

## 5. Update Documentation
- [ ] Update the project's testing guidelines to explicitly mandate trait-based mocking as per **[2_TAS-REQ-143]**.

## 6. Automated Verification
- [ ] Run `./do presubmit`.
- [ ] Verify traceability annotations: `// Covers: [2_TAS-REQ-143]` in the mocks and test modules.
