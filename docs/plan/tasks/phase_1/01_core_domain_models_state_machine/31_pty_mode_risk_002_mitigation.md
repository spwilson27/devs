# Task: Implement PTY Mode Risk Mitigation and Acceptance Criteria (Sub-Epic: 01_core_domain_models_state_machine)

## Covered Requirements
- [AC-RISK-002-01], [AC-RISK-002-03], [AC-RISK-002-04], [MIT-002]

## Dependencies
- depends_on: ["14_subprocess_execution_security.md"]
- shared_components: [devs-core (Owner), devs-adapters (Consumer)]

## 1. Initial Test Written
- [ ] Write test `test_pty_probe_windows_git_bash` that runs the PTY availability probe on Windows and asserts `PTY_AVAILABLE` reflects actual platform capability
- [ ] Write test `test_pty_probe_unix_platforms` that runs the PTY probe on Linux/macOS and asserts PTY is available
- [ ] Write test `test_pty_mode_agent_spawn_windows` that attempts to spawn an agent in PTY mode on Windows and verifies graceful degradation (falls back to non-PTY with warning)
- [ ] Write test `test_pty_mode_agent_spawn_unix` that spawns an agent in PTY mode on Linux/macOS and verifies interactive terminal behavior
- [ ] Write test `test_pty_capability_flag_propagation` that verifies the `PTY_AVAILABLE` flag is correctly propagated to adapter configuration
- [ ] Write test `test_mit_002_pty_fallback_documented` that asserts the fallback activation record exists in `docs/adr/` documenting PTY fallback on Windows

## 2. Task Implementation
- [ ] Define `PtyProbe` struct in `crates/devs-core/src/subprocess/pty.rs` with `probe() -> Result<PtyAvailability, PtyProbeError>`
- [ ] Define `PtyAvailability` enum with variants: `Available`, `Unavailable { reason: String }`, `Degraded { reason: String }`
- [ ] Define `PtyProbeError` enum with variants: `PlatformNotSupported`, `LibraryMissing`, `PermissionDenied`
- [ ] Implement platform-specific PTY probe:
  - **Windows**: Check for `conpty` support, verify `portable_pty` backend availability, test Git Bash compatibility
  - **Linux/macOS**: Check for `/dev/ptmx` availability, verify `portable_pty` backend
- [ ] Define `PTY_AVAILABLE: bool` static constant set at runtime via probe result
- [ ] Implement `PtyFallbackActivationRecord` struct documenting:
  - Risk ID: `RISK-002`
  - Fallback trigger condition: PTY unavailable on Windows
  - Fallback behavior: Non-PTY mode with documented limitations
  - ADR file path: `docs/adr/NNNN-fallback-pty-windows.md`
- [ ] Implement `MIT-002` mitigation: PTY mode with graceful degradation
  - On Windows: Log warning, fall back to non-PTY mode
  - On Unix: Use PTY mode for full terminal emulation
- [ ] Add `pub mod pty;` to `crates/devs-core/src/subprocess/mod.rs`

## 3. Code Review
- [ ] Verify PTY probe runs at startup and result is cached
- [ ] Verify fallback behavior is documented and matches the ADR
- [ ] Verify no panic on PTY failure — graceful degradation only
- [ ] Verify `MIT-002` mitigation is correctly implemented per the risk matrix

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core subprocess::pty` and confirm all PTY tests pass
- [ ] Run `cargo test -p devs-core` to confirm no regressions in the crate
- [ ] Run `cargo clippy -p devs-core -- -D warnings` and confirm no warnings
- [ ] Verify `docs/adr/NNNN-fallback-pty-windows.md` exists with correct content

## 5. Update Documentation
- [ ] Add module-level doc comment to `crates/devs-core/src/subprocess/pty.rs` explaining PTY availability detection and fallback semantics
- [ ] Add doc comments to `PtyProbe::probe` describing platform-specific behavior
- [ ] Document the ADR file format for fallback activation records

## 6. Automated Verification
- [ ] Confirm `cargo test -p devs-core` passes with zero failures
- [ ] Confirm `cargo doc -p devs-core --no-deps` generates documentation without errors
- [ ] Verify `PTY_AVAILABLE` constant is accessible from `devs-adapters` crate
- [ ] Run `grep -r "RISK-002" crates/devs-core/src/` and confirm the requirement ID appears in test annotations
