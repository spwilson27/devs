# Task: CheckpointStore Trait Definition (Sub-Epic: 056_Detailed Domain Specifications (Part 21))

## Covered Requirements
- [2_TAS-REQ-155], [2_TAS-REQ-152]

## Dependencies
- depends_on: [01_foundational_domain_types.md]
- shared_components: [devs-checkpoint, devs-core]

## 1. Initial Test Written
- [ ] In `devs-checkpoint/src/lib.rs`, write unit tests that define a mock implementation of the `CheckpointStore` trait to verify its usability.
- [ ] Verify that the trait can be used as a trait object (must be object-safe).
- [ ] Write a simple test that "saves" a `WorkflowRun` mock and "loads" it back from the trait's mock implementation.

## 2. Task Implementation
- [ ] Define the `CheckpointStore` trait in `devs-checkpoint/src/lib.rs` (or `trait.rs`) exactly as specified in [2_TAS-REQ-155].
- [ ] Ensure it includes `save_snapshot`, `save_checkpoint`, `load_all_runs`, `save_log_chunk`, and `sweep_retention` methods.
- [ ] Use `WorkflowRun` from `devs-core` and common types like `Uuid`, `Result` (from `devs-core` or `anyhow` for top-level traits if appropriate, but remember Phase 1 owner details).
- [ ] Add doc comments explaining the `Persistence Strategy` (JSON in `.devs/` in git repo) as a guiding principle for future implementations of this trait [2_TAS-REQ-152].
- [ ] Ensure the trait has `Send + Sync` bounds as required by the spec.

## 3. Code Review
- [ ] Verify the trait signature matches [2_TAS-REQ-155] exactly.
- [ ] Check for object safety (no generic parameters in methods that aren't allowed).
- [ ] Ensure all necessary imports are handled correctly.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-checkpoint` to verify the trait definition and its mock usage.

## 5. Update Documentation
- [ ] Add detailed doc comments to each method of the `CheckpointStore` trait.

## 6. Automated Verification
- [ ] Run `./do test` and verify that the requirements coverage script detects the tests.
