# Task: Shared Client Utilities and Discovery Mechanism (Sub-Epic: 07_TUI Framework and Navigation)

## Covered Requirements
- [6_UI_UX_ARCHITECTURE-REQ-001]
- [6_UI_UX_ARCHITECTURE-REQ-002]
- [6_UI_UX_ARCHITECTURE-REQ-003]
- [6_UI_UX_ARCHITECTURE-REQ-004]
- [6_UI_UX_ARCHITECTURE-REQ-008]
- [6_UI_UX_ARCHITECTURE-REQ-009]
- [6_UI_UX_ARCHITECTURE-REQ-010]
- [6_UI_UX_ARCHITECTURE-REQ-011]
- [6_UI_UX_ARCHITECTURE-REQ-035]
- [4_USER_FEATURES-AC-4-XPLAT-005]
- [4_USER_FEATURES-AC-4-XPLAT-007]
- [9_PROJECT_ROADMAP-REQ-352]
- [9_PROJECT_ROADMAP-REQ-363]
- [9_PROJECT_ROADMAP-REQ-392]

## Dependencies
- depends_on: [none]
- shared_components: [devs-proto, devs-core, devs-grpc]

## 1. Initial Test Written
- [ ] Create a unit test in `crates/devs-client-util/src/discovery.rs` that verifies `discover_grpc_addr()` resolves in order:
    - 1. `--server` flag (passed as argument).
    - 2. `DEVS_DISCOVERY_FILE` environment variable.
    - 3. Default `~/.config/devs/server.addr` with proper home directory expansion on Linux/macOS/Windows.
- [ ] Create a test that mocks `dirs::home_dir()` to verify `~` expansion.
- [ ] Create a test that verifies `connect_lazy()` returns a `tonic::transport::Channel` that doesn't dial until the first request.

## 2. Task Implementation
- [ ] Create `crates/devs-client-util/` crate in the workspace.
- [ ] Implement `discover_grpc_addr(explicit_addr: Option<&str>) -> Result<String, DiscoveryError>`.
- [ ] Implement `connect_lazy(addr: &str) -> Channel`.
- [ ] Export `DiscoveryError` and ensure it maps to the correct status codes/messages defined in the spec.
- [ ] Implement `x-devs-client-version` header injection logic for gRPC interceptors.
- [ ] Ensure `cargo doc -p devs-client-util --no-deps` completes with zero warnings and documented API surface.

## 3. Code Review
- [ ] Verify that `devs-client-util` does not depend on engine crates like `devs-scheduler` or `devs-pool`.
- [ ] Ensure path normalization uses forward slashes on all platforms for discovery file paths if displayed.
- [ ] Verify `Redacted<T>` is used where appropriate if any sensitive info is handled (though discovery info isn't strictly sensitive).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-client-util`.

## 5. Update Documentation
- [ ] Update `docs/plan/tasks/phase_3_grouping.json` if necessary to reflect implementation progress.

## 6. Automated Verification
- [ ] Run `cargo doc -p devs-client-util --no-deps` and verify it produces no warnings.
- [ ] Run `cargo tree -p devs-client-util --edges normal` to ensure no illegal dependencies.
