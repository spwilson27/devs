# Task: Implement Cross-Platform Risk Acceptance Criteria (Sub-Epic: 01_core_domain_models_state_machine)

## Covered Requirements
- [AC-RISK-012-01], [AC-RISK-012-05], [MIT-012]

## Dependencies
- depends_on: ["12_file_permission_security.md", "24_roadmap_dependency_graph.md"]
- shared_components: [devs-core (Owner), ./do Entrypoint Script & CI Pipeline (Consumer)]

## 1. Initial Test Written
- [ ] Write test `test_do_script_posix_compatible` that runs `./do` commands on Linux/macOS and verifies POSIX sh compatibility (no bash-specific features)
- [ ] Write test `test_file_permission_modes_unix` that verifies config files are created with mode 0o600 on Linux/macOS
- [ ] Write test `test_file_permission_modes_windows` that verifies config files are created with equivalent restricted permissions on Windows
- [ ] Write test `test_path_handling_windows_unix_differences` that verifies path separators and case sensitivity are handled correctly on both platforms
- [ ] Write test `test_mit_012_gitlab_ci_cross_platform` that asserts GitLab CI pipeline runs on all three platforms (Linux, macOS, Windows)

## 2. Task Implementation
- [ ] Define `CrossPlatformSpec` struct in `crates/devs-core/src/platform/cross_platform.rs` with:
  - `SUPPORTED_PLATFORMS: &[&str] = &["linux", "macos", "windows"]` constant
  - `PATH_SEPARATOR: char` — platform-specific (`/` or `\`)
  - `CASE_SENSITIVE: bool` — platform-specific (true for Unix, false for Windows)
- [ ] Define `DoScriptCompatibility` struct documenting POSIX sh requirements:
  - No bash arrays
  - No bash-specific parameter expansion
  - Use `#!/bin/sh` shebang
  - Use portable commands (`sed`, `awk`, `grep` with POSIX flags)
- [ ] Implement `MIT-012` mitigation: Cross-platform CI pipeline
  - Define GitLab CI job matrix with three parallel jobs: Linux, macOS, Windows
  - Each job runs full presubmit suite
  - All jobs must pass for merge
- [ ] Define `FilePermissionEnforcement` with platform-specific implementations:
  - **Unix**: Use `chmod` to set 0o600 on config files
  - **Windows**: Use ACLs to restrict access to owner
- [ ] Define `PathNormalization` with `normalize(path: &Path) -> Result<PathBuf, PathError>` that:
  - Converts Windows paths to UNC format for git compatibility
  - Handles case-insensitive comparisons on Windows
  - Validates paths stay within workspace boundaries
- [ ] Add `pub mod cross_platform;` to `crates/devs-core/src/platform/mod.rs`

## 3. Code Review
- [ ] Verify `./do` script uses only POSIX sh features (no bashisms)
- [ ] Verify file permissions are enforced on all platforms
- [ ] Verify `MIT-012` mitigation is correctly implemented per the risk matrix
- [ ] Verify path handling accounts for Windows vs Unix differences

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core platform::cross_platform` and confirm all cross-platform tests pass
- [ ] Run `cargo test -p devs-core` to confirm no regressions in the crate
- [ ] Run `cargo clippy -p devs-core -- -D warnings` and confirm no warnings
- [ ] Verify GitLab CI configuration includes all three platforms

## 5. Update Documentation
- [ ] Add module-level doc comment to `crates/devs-core/src/platform/cross_platform.rs` explaining platform differences and MIT-012 mitigation
- [ ] Add doc comments to `DoScriptCompatibility` listing prohibited bash features
- [ ] Document the GitLab CI job matrix configuration

## 6. Automated Verification
- [ ] Confirm `cargo test -p devs-core` passes with zero failures
- [ ] Confirm `cargo doc -p devs-core --no-deps` generates documentation without errors
- [ ] Verify `./do` script passes `shellcheck -s sh` (POSIX sh linting)
- [ ] Run `grep -r "RISK-012" crates/devs-core/src/` and confirm the requirement ID appears in test annotations
