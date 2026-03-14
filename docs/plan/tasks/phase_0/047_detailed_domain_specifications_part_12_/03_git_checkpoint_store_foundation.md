# Task: Implement Git Checkpoint Store Foundation (Sub-Epic: 047_Detailed Domain Specifications (Part 12))

## Covered Requirements
- [2_TAS-REQ-108]

## Dependencies
- depends_on: []
- shared_components: [devs-checkpoint, devs-core]

## 1. Initial Test Written
- [ ] Create an integration test in `devs-checkpoint/tests/store_init_tests.rs` that:
    - Attempts to initialize a `GitCheckpointStore` for a temporary project ID.
    - Verifies that a bare repository is created at `~/.config/devs/state-repos/<project-id>.git` (using a mock home directory).
    - Verifies that the store uses the identity `devs <devs@localhost>`.
    - Verifies that the store does not shell out to the `git` binary (by ensuring the `git2` crate is used and no `std::process::Command` for git is called).

## 2. Task Implementation
- [ ] Implement the `GitCheckpointStore` struct in `devs-checkpoint/src/store.rs`.
- [ ] Use `git2::Repository::init_bare` to create the repository if it does not exist.
- [ ] Configure `git2::Signature` with name `"devs"` and email `"devs@localhost"`.
- [ ] Implement a `new(project_id: Uuid, base_path: PathBuf)` constructor that ensures the directory structure is created.
- [ ] Ensure that the store operates on this bare repository exclusively.

## 3. Code Review
- [ ] Verify that `git2` is the sole mechanism for git operations.
- [ ] Confirm the path for the bare repository matches `~/.config/devs/state-repos/<project-id>.git`.
- [ ] Ensure identity strings match the requirement exactly.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-checkpoint` and ensure initialization tests pass.

## 5. Update Documentation
- [ ] Add doc comments to `GitCheckpointStore` explaining its bare repository management.
- [ ] Update the crate-level documentation in `devs-checkpoint/src/lib.rs`.

## 6. Automated Verification
- [ ] Verify the traceability tag: `// Covers: 2_TAS-REQ-108` is present in the test file.
- [ ] Run `./do lint` to ensure the `unsafe_code = "deny"` lint is not violated (git2 uses unsafe internally, but our code must remain safe).
