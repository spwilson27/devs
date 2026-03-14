# Task: Define Phase State Machine and Transition Rules (Sub-Epic: 001_workspace_toolchain_setup)

## Covered Requirements
- [ROAD-STATEM-001], [ROAD-STATEM-002], [ROAD-STATEM-003], [ROAD-STATEM-004], [ROAD-STATEM-005], [ROAD-BR-013], [ROAD-BR-014], [ROAD-BR-015], [ROAD-BR-016], [ROAD-BR-017], [ROAD-BR-018], [ROAD-BR-019], [ROAD-BR-020]

## Dependencies
- depends_on: [07_ptc_json_schema_and_checkpoint_validation.md]
- shared_components: [devs-core, Phase Transition Checkpoint (PTC) Model]

## 1. Initial Test Written
- [ ] Create unit tests in `crates/devs-core/tests/phase_state_machine.rs` that verify:
  1. Phases are not re-entrant — a completed phase cannot transition back to active. Annotate `// Covers: ROAD-STATEM-001`.
  2. Deficiency discovered during gating is fixed in the current phase (state returns to active, not a prior phase). Annotate `// Covers: ROAD-STATEM-002`.
  3. `Phase0Active` transitions to `Phase0Gating` when all Phase 0 deliverables pass presubmit. Annotate `// Covers: ROAD-STATEM-003`.
  4. Gating state transitions to either `Complete` (all gates pass) or back to `Active` (deficiency found). Annotate `// Covers: ROAD-STATEM-004`.
  5. A completed phase triggers the next phase's `Active` state. Annotate `// Covers: ROAD-STATEM-005`.
  6. A PTC must be committed before any Phase N+1 code begins. Annotate `// Covers: ROAD-BR-013`.
  7. PTCs require platform verification on all three CI platforms. Annotate `// Covers: ROAD-BR-014`.
  8. Bootstrap ADR must contain required content fields (COND-001, COND-002, COND-003 results, timing data). Annotate `// Covers: ROAD-BR-015`.
  9. BOOTSTRAP-STUB annotations must be present in stub implementations and removed when real implementations replace them. Annotate `// Covers: ROAD-BR-016`.
  10. All five coverage gates (QG-001 through QG-005) must pass simultaneously in a single `./do presubmit` run for Phase 5 completion. Annotate `// Covers: ROAD-BR-017`.
  11. FB-007 fallback warning must be emitted to stderr when a pool fallback agent is used. Annotate `// Covers: ROAD-BR-018`.
  12. PTC `platforms_verified` entries must reference actual CI pipeline job IDs. Annotate `// Covers: ROAD-BR-019`.
  13. Parallel development across crates must not introduce cross-crate import violations. Annotate `// Covers: ROAD-BR-020`.

## 2. Task Implementation
- [ ] Define `PhaseState` enum in `crates/devs-core/src/phase_state.rs`:
  ```rust
  enum PhaseState {
      Phase0Active, Phase0Gating, Phase0Complete,
      Phase1Active, Phase1Gating, Phase1Complete,
      Phase2Active, Phase2Gating, Phase2Complete,
      Phase3Active, Phase3Gating, Phase3Complete,
      Phase4Active, Phase4Gating, Phase4Complete,
      Phase5Active, Phase5Gating, Phase5Complete,
  }
  ```
- [ ] Implement `PhaseState::transition(&self, event: PhaseEvent) -> Result<PhaseState, PhaseTransitionError>` enforcing:
  - No re-entry to completed phases.
  - Gating → Active only for deficiency fixes in the same phase.
  - Gating → Complete only when all gate conditions verified.
  - Complete → next phase Active.
- [ ] Implement validation functions for transition rules:
  - `validate_ptc_before_next_phase(current: &PhaseState, ptc: &PhaseTransitionCheckpoint) -> Result<()>`
  - `validate_platform_verification(ptc: &PhaseTransitionCheckpoint) -> Result<()>`
  - `validate_bootstrap_stubs(phase: u8, codebase_has_stubs: bool) -> Result<()>`
- [ ] Add `./do lint` check that enforces ROAD-BR-020: `cargo tree` output must not show forbidden cross-crate imports for the current phase.

## 3. Code Review
- [ ] Verify `PhaseState` transitions are exhaustive — every invalid transition returns an error.
- [ ] Verify no runtime dependencies are added to `devs-core`.
- [ ] Verify all 13 requirement IDs have corresponding `// Covers:` annotations in tests.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core -- phase_state_machine` and confirm all tests pass.
- [ ] Verify that attempting an invalid transition (e.g., `Phase0Complete` → `Phase0Active`) returns an error.

## 5. Update Documentation
- [ ] Add doc comments to `PhaseState` enum and transition method explaining the six-phase state machine.

## 6. Automated Verification
- [ ] Run `cargo test -p devs-core` and confirm zero failures.
- [ ] Run `cargo clippy -p devs-core -- -D warnings` and confirm zero warnings.
