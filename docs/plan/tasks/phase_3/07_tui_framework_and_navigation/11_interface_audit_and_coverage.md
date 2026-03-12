# Task: Interface Dependency Audit and Coverage Gates (Sub-Epic: 07_TUI Framework and Navigation)

## Covered Requirements
- [6_UI_UX_ARCHITECTURE-REQ-005]
- [6_UI_UX_ARCHITECTURE-REQ-414]
- [6_UI_UX_ARCHITECTURE-REQ-415]
- [6_UI_UX_ARCHITECTURE-REQ-416]
- [6_UI_UX_ARCHITECTURE-REQ-471]
- [6_UI_UX_ARCHITECTURE-REQ-472]
- [6_UI_UX_ARCHITECTURE-REQ-473]

## Dependencies
- depends_on: [02_tui_terminal_lifecycle.md, 09_cli_architecture.md, 10_mcp_bridge_proxy.md]
- shared_components: [devs-tui, devs-cli, devs-mcp-bridge]

## 1. Initial Test Written
- [ ] Create a python script `.tools/interface_dependency_audit.py` that parses `cargo tree` output and asserts no engine crates are in the `devs-tui`, `devs-cli`, or `devs-mcp-bridge` normal dependency edges.
- [ ] Create a test that verifies `./do coverage` produces separate coverage reports for TUI, CLI, and MCP interfaces.
- [ ] Create a test that verifies the `actual_pct >= 50.0` gate for each interface.

## 2. Task Implementation
- [ ] Implement the `interface_dependency_audit` step in `./do lint`.
- [ ] Update `./do coverage` to compute and report interface-specific coverage using `cargo llvm-cov`.
- [ ] Ensure that E2E tests for TUI use the binary subprocess or a `TestBackend` that is categorized as E2E.
- [ ] Ensure CLI E2E tests use `assert_cmd` and invoke the binary.
- [ ] Ensure MCP E2E tests POST to the running server.

## 3. Code Review
- [ ] Verify that no `devs-scheduler`, `devs-pool`, `devs-executor`, or `devs-adapters` references exist in any interface crate's production dependencies.
- [ ] Ensure all 3 client binaries produce zero bytes on stderr when invoked with `--format json`.

## 4. Run Automated Tests to Verify
- [ ] Run `./do lint` and `./do coverage`.

## 5. Update Documentation
- [ ] Update `docs/plan/tasks/phase_3_grouping.json` if necessary to reflect implementation progress.

## 6. Automated Verification
- [ ] Run `./do lint` and verify it passes the dependency audit.
- [ ] Run `./do coverage` and verify it produces the QG-003, QG-004, and QG-005 gates.
