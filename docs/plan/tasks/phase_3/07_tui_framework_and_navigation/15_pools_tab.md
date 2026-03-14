# Task: Pools Tab with Real-Time Pool Utilization (Sub-Epic: 07_TUI Framework and Navigation)

## Covered Requirements
- [6_UI_UX_ARCHITECTURE-REQ-266], [6_UI_UX_ARCHITECTURE-REQ-267], [6_UI_UX_ARCHITECTURE-REQ-268], [6_UI_UX_ARCHITECTURE-REQ-269], [6_UI_UX_ARCHITECTURE-REQ-270], [6_UI_UX_ARCHITECTURE-REQ-271], [6_UI_UX_ARCHITECTURE-REQ-272], [6_UI_UX_ARCHITECTURE-REQ-273], [6_UI_UX_ARCHITECTURE-REQ-274], [6_UI_UX_ARCHITECTURE-REQ-275], [6_UI_UX_ARCHITECTURE-REQ-276], [6_UI_UX_ARCHITECTURE-REQ-277], [6_UI_UX_ARCHITECTURE-REQ-278], [6_UI_UX_ARCHITECTURE-REQ-279], [6_UI_UX_ARCHITECTURE-REQ-280], [6_UI_UX_ARCHITECTURE-REQ-386], [6_UI_UX_ARCHITECTURE-REQ-387], [6_UI_UX_ARCHITECTURE-REQ-388], [6_UI_UX_ARCHITECTURE-REQ-389], [6_UI_UX_ARCHITECTURE-REQ-390]

## Dependencies
- depends_on: [06_layout_system_and_terminal_constraints.md, 02_app_state_and_state_management.md]
- shared_components: [devs-pool (consumer — PoolState types), devs-proto (consumer)]

## 1. Initial Test Written
- [ ] Write snapshot test for PoolsTab showing pool list with utilization: pool name, active/max agents, agent list with capabilities (REQ-266)
- [ ] Write test that pool data updates in real-time from `GrpcPoolEvent` (REQ-267)
- [ ] Write test for pool selection: `j`/`k` navigate pools, `Enter` expands pool detail (REQ-268)
- [ ] Write snapshot test showing agent availability status within a pool: available, busy, rate-limited, cooldown (REQ-269)
- [ ] Write test for fallback event display: show recent fallback events with timestamp (REQ-270)
- [ ] Write snapshot test for pool exhaustion indicator (REQ-271)
- [ ] Write test for single scrollable list layout (REQ-308)
- [ ] Write snapshot test for empty pools state: "No pools configured" message (REQ-272)

## 2. Task Implementation
- [ ] Create `crates/devs-tui/src/tabs/pools.rs` implementing `PoolsTab` as a Widget
- [ ] Implement pool list rendering: each pool as a row with `name | active/max | capabilities` (REQ-266)
- [ ] Implement per-agent status display: available, busy (with stage name), rate-limited (with cooldown time) (REQ-269)
- [ ] Wire `GrpcPoolEvent` to update `AppState.pool_state` in handle_event() (REQ-267)
- [ ] Implement pool selection and detail expansion (REQ-268)
- [ ] Implement fallback event log: recent fallback events with timestamps (REQ-270)
- [ ] Implement pool exhaustion visual indicator (e.g., `[EXHAUSTED]` label) (REQ-271)
- [ ] Implement scrollable single-list layout (REQ-308)
- [ ] Render placeholder for no pools (REQ-272)

## 3. Code Review
- [ ] Verify PoolsTab consumes pool state read-only from AppState
- [ ] Verify real-time updates flow through event system, not polling

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-tui -- pools_tab`

## 5. Update Documentation
- [ ] Add doc comments to PoolsTab

## 6. Automated Verification
- [ ] Run `cargo test -p devs-tui 2>&1 | tail -5` and confirm `test result: ok`
