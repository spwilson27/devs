# Task: Proto Artifact Persistence and Regenerative Build (Sub-Epic: 014_Foundational Technical Requirements (Part 5))

## Covered Requirements
- [2_TAS-REQ-001F]

## Dependencies
- depends_on: [none]
- shared_components: [devs-proto]

## 1. Initial Test Written
- [ ] Create an integration test that checks for the existence of `devs-proto/src/gen/*.rs` files.
- [ ] Implement a test that verifies `devs-proto` can be built successfully even when the `PROTOC` environment variable is unset (simulating a system without `protoc`).
- [ ] Add a check to ensure that `build.rs` includes `cargo:rerun-if-changed` for all `.proto` source files.

## 2. Task Implementation
- [ ] Configure `devs-proto/build.rs` to generate Rust types using `tonic-build` into the `src/gen/` directory instead of the standard `OUT_DIR`.
- [ ] Use `include!` or a manual module declaration in `devs-proto/src/lib.rs` to expose the generated code from `src/gen/`.
- [ ] Update `build.rs` logic to skip generation and log a warning if `protoc` is missing but the `src/gen/*.rs` files are already present.
- [ ] Ensure that `src/gen/` is NOT ignored by `.gitignore` so that generated artifacts are committed.
- [ ] Implement a CI check that ensures `src/gen/` artifacts are up-to-date with the `.proto` sources (fail if `git diff` shows changes after a build).

## 3. Code Review
- [ ] Verify that the generated code is correctly formatted and follows workspace standards.
- [ ] Confirm that `devs-proto` can be easily consumed by downstream crates like `devs-grpc` and `devs-tui` without additional configuration.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo build -p devs-proto` and confirm files are generated in `src/gen/`.
- [ ] Unset `PROTOC` and run `cargo build -p devs-proto` to verify the fallback build path.
- [ ] Verify that `src/gen/` files are tracked by git.

## 5. Update Documentation
- [ ] Update `devs-proto/README.md` to document the artifact persistence strategy and instructions for manual regeneration.

## 6. Automated Verification
- [ ] Run `.tools/verify_requirements.py` to ensure [2_TAS-REQ-001F] is mapped to these tests.
