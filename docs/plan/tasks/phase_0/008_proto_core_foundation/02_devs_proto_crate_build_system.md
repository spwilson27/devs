# Task: Implement devs-proto Crate Build System and Re-exports (Sub-Epic: 008_Proto & Core Foundation)

## Covered Requirements
- [2_TAS-REQ-008B], [2_TAS-REQ-008C], [2_TAS-REQ-008D], [2_TAS-REQ-022]

## Dependencies
- depends_on: ["01_define_proto_files.md"]
- shared_components: [devs-proto (Owner)]

## 1. Initial Test Written
- [ ] Create `devs-proto/tests/build_system_test.rs` with tests that verify:
  - `test_generated_files_committed()`: Verify `devs-proto/src/gen/` directory exists and contains generated `.rs` files. Check that `mod.rs` exists in the gen directory (REQ-008C)
  - `test_public_api_reexports()`: Verify types are importable as `devs_proto::devs::v1::GetInfoRequest`, `devs_proto::devs::v1::GetInfoResponse`, `devs_proto::devs::v1::server_service_server::ServerService` (REQ-008C)
  - `test_crate_has_no_runtime_logic()`: Verify `devs-proto/src/lib.rs` contains only `mod gen;` and `pub use` re-exports, no function definitions or impl blocks with logic (REQ-022)
  - `test_build_rs_exists()`: Verify `devs-proto/build.rs` exists (REQ-008B)
- [ ] Create `devs-proto/tests/protoc_fallback_test.rs` with:
  - `test_protoc_detection_logic()`: Unit test the protoc detection function in isolation — mock `Command::new("protoc").arg("--version")` failure path and verify it returns early without error (REQ-008D). Note: this may need to be a doc-test or inline test in build.rs logic extracted to a helper.

## 2. Task Implementation
- [ ] Create `devs-proto/Cargo.toml` with:
  - `[package]` name = "devs-proto", version matching workspace
  - `[dependencies]` tonic = { workspace = true }, prost = { workspace = true }, prost-types = { workspace = true }
  - `[build-dependencies]` tonic-build = { workspace = true }, prost-build = { workspace = true }
  - Ensure workspace `Cargo.toml` lists devs-proto as a member and declares these dependency versions
- [ ] Create `devs-proto/build.rs` that:
  1. Attempts to run `protoc --version` via `std::process::Command`
  2. If protoc is not found: prints `cargo:warning=protoc not found; using committed generated files.` and returns `Ok(())` (REQ-008D)
  3. If protoc is found: invokes `tonic_build::configure().out_dir("src/gen/").compile()` on all `.proto` files under `proto/devs/v1/` (REQ-008B)
  4. Emits `cargo:rerun-if-changed=proto/` to trigger rebuild on proto changes
- [ ] Create `devs-proto/src/gen/` directory with generated Rust files from initial `protoc`/`tonic-build` run
- [ ] Create `devs-proto/src/gen/mod.rs` that includes all generated modules (REQ-008C)
- [ ] Create `devs-proto/src/lib.rs` with ONLY:
  - `mod gen;`
  - `pub use gen::*;` or equivalent re-exports so downstream access is `devs_proto::devs::v1::*` (REQ-022)
  - NO runtime logic — this crate's sole job is proto compilation and type re-export (REQ-022)
- [ ] Run `cargo build -p devs-proto` to generate files, then `git add devs-proto/src/gen/` to commit them (REQ-008B)

## 3. Code Review
- [ ] Verify `build.rs` protoc detection matches the exact spec: `protoc --version` attempt, specific warning message on failure (REQ-008D)
- [ ] Verify `src/gen/` is committed and not in `.gitignore` (REQ-008B)
- [ ] Verify `lib.rs` contains zero runtime logic — only module declarations and re-exports (REQ-022)
- [ ] Verify downstream import paths work as `devs_proto::devs::v1::*` not `devs_proto::gen::*` (REQ-008C)
- [ ] Verify `Cargo.toml` uses workspace dependency versions

## 4. Run Automated Tests to Verify
- [ ] Run `cargo build -p devs-proto` and verify it succeeds
- [ ] Run `cargo test -p devs-proto` and verify all tests pass
- [ ] Verify `cargo doc -p devs-proto --no-deps` produces zero warnings

## 5. Update Documentation
- [ ] Add `// Covers: 2_TAS-REQ-008B` annotation to the build.rs existence test
- [ ] Add `// Covers: 2_TAS-REQ-008C` annotation to the public API re-export test
- [ ] Add `// Covers: 2_TAS-REQ-008D` annotation to the protoc fallback test
- [ ] Add `// Covers: 2_TAS-REQ-022` annotation to the no-runtime-logic test
- [ ] Add doc comments to `lib.rs` describing the crate's purpose

## 6. Automated Verification
- [ ] Run `cargo test -p devs-proto 2>&1 | tail -5` and confirm `test result: ok`
- [ ] Run `ls devs-proto/src/gen/mod.rs` and confirm the file exists
- [ ] Run `test -f devs-proto/build.rs && echo "build.rs exists"` and confirm output
- [ ] Run `grep -c 'fn ' devs-proto/src/lib.rs` and confirm the count is 0 (no function definitions)
