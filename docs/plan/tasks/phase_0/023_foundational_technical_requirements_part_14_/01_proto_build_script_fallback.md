# Task: Implement Proto Build Script with Fallback (Sub-Epic: 023_Foundational Technical Requirements (Part 14))

## Covered Requirements
- [2_TAS-REQ-008B], [2_TAS-REQ-008D]

## Dependencies
- depends_on: [none]
- shared_components: [devs-proto]

## 1. Initial Test Written
- [ ] Create a unit test in `crates/devs-proto/src/lib.rs` (or a separate test file) that verifies the existence of generated Rust files in `src/gen/`.
- [ ] Create a mock `build.rs` test or a script that simulates the absence of `protoc` (e.g., by masking the `PATH`) and verifies that `cargo build` still succeeds and prints the required warning: `cargo:warning=protoc not found; using committed generated files.`

## 2. Task Implementation
- [ ] Implement `crates/devs-proto/build.rs` using `tonic_build`.
- [ ] Add logic to check for `protoc` by running `protoc --version`.
- [ ] If `protoc` is found:
  - Configure `tonic_build::configure()` to set `out_dir` to `src/gen/`.
  - Compile all `.proto` files found in `../../proto/devs/v1/`.
- [ ] If `protoc` is NOT found:
  - Print `cargo:warning=protoc not found; using committed generated files.` to stdout.
  - Return `Ok(())` without attempting to run the compiler.
- [ ] Ensure `crates/devs-proto/src/gen/` is created if it doesn't exist (when `protoc` is present).
- [ ] Verify that `crates/devs-proto/src/gen/` is NOT in `.gitignore`.

## 3. Code Review
- [ ] Verify that the `build.rs` script follows the exact warning string required by [2_TAS-REQ-008D].
- [ ] Ensure that the `out_dir` is relative and points correctly to `src/gen/`.
- [ ] Confirm that `build.rs` does not panic if `protoc` is missing.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo build -p devs-proto` with `protoc` installed and verify files are generated/updated.
- [ ] Temporarily rename `protoc` or modify `PATH` and run `cargo build -p devs-proto` again to verify the warning and successful build.

## 5. Update Documentation
- [ ] Update `crates/devs-proto/README.md` to document the build-time dependency on `protoc` for schema changes and the fallback behavior for standard builds.

## 6. Automated Verification
- [ ] Run `ls crates/devs-proto/src/gen/` and verify that `.rs` files are present.
- [ ] Run `git status crates/devs-proto/src/gen/` to ensure they are tracked by git.
