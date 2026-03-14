# Task: Version Compatibility Enforcement (Sub-Epic: 034_Foundational Technical Requirements (Part 25))

## Covered Requirements
- [2_TAS-REQ-086H], [2_TAS-REQ-086I]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core (owns version module and compatibility logic)]

## 1. Initial Test Written
- [ ] Create `crates/devs-core/src/version.rs` with a test submodule. All tests annotated with `// Covers: 2_TAS-REQ-086H` or `// Covers: 2_TAS-REQ-086I` as appropriate.
- [ ] **Compile-time version constant**: Test that `DEVS_VERSION` is a non-empty string matching the `MAJOR.MINOR.PATCH` regex pattern `^\d+\.\d+\.\d+$`.
- [ ] **Version parsing**: Test that `Version::parse("1.2.3")` returns `Version { major: 1, minor: 2, patch: 3 }`. Test that `Version::parse("invalid")` returns an error.
- [ ] **Same-major compatibility**: Test that `check_compatibility(client: "1.2.3", server: "1.5.0")` returns `Ok(())` (same major = compatible).
- [ ] **Different-major rejection**: Test that `check_compatibility(client: "2.0.0", server: "1.5.0")` returns `Err(VersionMismatch { client: "2.0.0", server: "1.5.0" })`.
- [ ] **Missing version**: Test that `check_version_metadata(None)` returns `Err(MissingVersionMetadata)` with message `"missing required metadata: x-devs-client-version"`.
- [ ] **Mismatch error message format**: Test that the error message for a mismatch is exactly `"client version mismatch: client=2.0.0 server=1.5.0"`.
- [ ] **SemVer change type classification** [2_TAS-REQ-086H]: Write tests that document which changes are MAJOR vs MINOR:
  - Test `ChangeType::NewOptionalField` classifies as `VersionBump::Minor`.
  - Test `ChangeType::RemovedField` classifies as `VersionBump::Major`.
  - (These are documentation-as-tests; the enum exists to codify the versioning policy.)
- [ ] **MCP exemption** [2_TAS-REQ-086I point 4]: Test that a function `is_version_check_required(interface: Interface) -> bool` returns `false` for `Interface::Mcp` and `true` for `Interface::Grpc`.

## 2. Task Implementation
- [ ] Create `crates/devs-core/src/version.rs`.
- [ ] Define compile-time constant: `pub const DEVS_VERSION: &str = env!("CARGO_PKG_VERSION");` — reads from workspace `Cargo.toml` version at compile time.
- [ ] Define `Version` struct with `major: u32, minor: u32, patch: u32` and implement `FromStr` / `Display`.
- [ ] Implement `pub fn check_compatibility(client_version: &str, server_version: &str) -> Result<(), VersionError>`:
  - Parse both versions.
  - Compare major components.
  - Return `VersionError::Mismatch` if different, with formatted message.
- [ ] Define `VersionError` enum:
  - `Mismatch { client: String, server: String }` — `Display` produces `"client version mismatch: client=<c> server=<s>"`.
  - `MissingMetadata` — `Display` produces `"missing required metadata: x-devs-client-version"`.
  - `InvalidFormat(String)` — for unparseable version strings.
- [ ] Define metadata key constant: `pub const VERSION_METADATA_KEY: &str = "x-devs-client-version";`.
- [ ] Implement `pub fn check_version_metadata(metadata_value: Option<&str>) -> Result<(), VersionError>` that returns `MissingMetadata` if `None`, else delegates to `check_compatibility`.
- [ ] Define `Interface` enum (`Grpc`, `Mcp`, `Cli`, `Tui`) and `is_version_check_required` function.
- [ ] Export from `devs-core` public API.

## 3. Code Review
- [ ] Verify `DEVS_VERSION` uses `env!("CARGO_PKG_VERSION")` (compile-time, no build script needed for basic version embedding).
- [ ] Verify error messages match the exact strings from the spec: `"client version mismatch: client=<ver> server=<ver>"` and `"missing required metadata: x-devs-client-version"`.
- [ ] Verify MCP calls are explicitly exempt from version checking per [2_TAS-REQ-086I] point 4.
- [ ] Verify no gRPC or tonic dependency in this module — it's pure logic in `devs-core`; the gRPC interceptor that calls this will be in Phase 3.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core -- version` and verify all tests pass.

## 5. Update Documentation
- [ ] Add doc comments to `DEVS_VERSION`, `Version`, `check_compatibility`, `VersionError`, and `VERSION_METADATA_KEY` referencing [2_TAS-REQ-086H] and [2_TAS-REQ-086I].

## 6. Automated Verification
- [ ] Run `./do lint` to ensure clippy, formatting, and doc comment standards are met.
- [ ] Run `./do test` and verify that `target/traceability.json` correctly maps [2_TAS-REQ-086H] and [2_TAS-REQ-086I] to the new tests.
